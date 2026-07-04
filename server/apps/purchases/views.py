from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import Purchase, PurchaseItem
from .serializers import (
    PurchaseSerializer,
    PurchaseCreateSerializer,
    PurchaseUpdateSerializer,
    PurchaseItemSerializer,
    PurchaseItemReadSerializer,
)
from .filters import PurchaseFilter, PurchaseItemFilter
from ..core.pagination import StandardPagination


class PurchaseViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for purchases.

    LIST   /purchases/          → PurchaseSerializer (header + nested items)
    GET    /purchases/{id}/     → PurchaseSerializer (full detail)
    POST   /purchases/          → PurchaseCreateSerializer (with nested items)
    PUT    /purchases/{id}/     → PurchaseUpdateSerializer
    PATCH  /purchases/{id}/     → PurchaseUpdateSerializer
    DELETE /purchases/{id}/     → Only if no items sold (is_deletable=True)

    FILTERING:
        ?factory=2
        ?factory_name=addis
        ?date_from=2024-01-01&date_to=2024-06-30
        ?shipping_code=SHP-A3F2
        ?currency=USD
        ?is_fully_editable=true
        ?has_unpaid=true
        ?min_total=5000

    SEARCHING:
        ?search=SHP-A3F2  (searches shipping_code and notes)

    ORDERING:
        ?ordering=-date           → newest first (default)
        ?ordering=date            → oldest first
        ?ordering=-total_purchase_amount
        ?ordering=-unpaid_amount
    """
    queryset = Purchase.objects.all()
    pagination_class = StandardPagination
    filterset_class = PurchaseFilter
    search_fields = ['shipping_code', 'notes']
    ordering_fields = [
        'date', 'total_purchase_amount', 'amount_paid_now',
        'unpaid_amount', 'created_at',
    ]
    ordering = ['-date', '-created_at']

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return PurchaseCreateSerializer
        if self.action in ('update', 'partial_update'):
            return PurchaseUpdateSerializer
        # list and retrieve
        return PurchaseSerializer

    def get_queryset(self):
        """Optimize queries with select_related and prefetch_related."""
        qs = super().get_queryset()
        qs = qs.select_related('factory')
        if self.action in ('list', 'retrieve'):
            qs = qs.prefetch_related('items', 'items__stock_batch')
        return qs

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if not instance.is_deletable:
            raise ValidationError(
                "Cannot delete this purchase. Some items have already been sold. "
                "Delete the sales first, then you can delete this purchase."
            )

        instance.delete()
        return Response(
            {"detail": f"Purchase {instance.shipping_code} deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )


class PurchaseItemViewSet(viewsets.ModelViewSet):
    """
    Standalone CRUD for individual purchase items.

    Useful for:
        → Editing a single item line without resubmitting the whole purchase
        → Adding new items to an existing purchase
        → Viewing items across all purchases

    LIST   /purchase-items/          → PurchaseItemReadSerializer
    GET    /purchase-items/{id}/     → PurchaseItemReadSerializer
    POST   /purchase-items/          → PurchaseItemSerializer (add item to purchase)
    PUT    /purchase-items/{id}/     → PurchaseItemSerializer
    PATCH  /purchase-items/{id}/     → PurchaseItemSerializer
    DELETE /purchase-items/{id}/     → Only if no stock sold from this item

    FILTERING:
        ?purchase=5
        ?item_code=SOCK
        ?factory=2
        ?shipping_code=SHP-A3
        ?price_type=per_piece
        ?date_from=2024-01-01

    SEARCHING:
        ?search=SOCK  (searches item_code and product_name)

    ORDERING:
        ?ordering=item_code
        ?ordering=-total_item_amount
        ?ordering=-created_at
    """
    queryset = PurchaseItem.objects.all()
    pagination_class = StandardPagination
    filterset_class = PurchaseItemFilter
    search_fields = ['item_code', 'product_name']
    ordering_fields = ['item_code', 'total_item_amount', 'purchase_price', 'created_at']
    ordering = ['item_code']

    def get_serializer_class(self):
        if self.action in ('list', 'retrieve'):
            return PurchaseItemReadSerializer
        # create, update, partial_update
        return PurchaseItemSerializer

    def get_queryset(self):
        """Optimize queries."""
        qs = super().get_queryset()
        qs = qs.select_related('purchase', 'purchase__factory')
        if self.action in ('list', 'retrieve'):
            qs = qs.select_related('stock_batch')
        return qs

    def destroy(self, request, *args, **kwargs):
        """
        Delete a purchase item only if no stock from it has been sold.

        The database PROTECT constraint on StockBatch→SaleItem
        would also block this, but we give a nicer error message.
        """
        instance = self.get_object()

        # Check if any stock from this item has been sold
        if hasattr(instance, 'stock_batch') and instance.stock_batch.sold_bags > 0:
            raise ValidationError(
                f"Cannot delete this item. {instance.stock_batch.sold_bags} bags "
                f"have already been sold from this batch. "
                f"Delete the sales first."
            )

        # Deleting the item will CASCADE delete the StockBatch
        # and recalculate parent purchase totals via the model's save
        purchase = instance.purchase
        instance.delete()
        purchase.recalculate_totals()

        return Response(
            {"detail": "Purchase item deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )
