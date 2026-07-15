from django_filters.rest_framework.backends import DjangoFilterBackend
from rest_framework import viewsets, status,filters
from rest_framework.response import Response

from .models import Sale, SaleItem
from .serializers import (
    SaleReadSerializer,
    SaleCreateSerializer,
    SaleUpdateSerializer,
    SaleItemReadSerializer,
    SaleItemWriteSerializer,
)
from .filters import SaleFilter, SaleItemFilter
from ..core.pagination import StandardPagination


class SaleViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for sales.

    LIST   /sales/          → SaleReadSerializer (header + nested items + profit)
    GET    /sales/{id}/     → SaleReadSerializer (full detail)
    POST   /sales/          → SaleCreateSerializer (with nested items)
    PUT    /sales/{id}/     → SaleUpdateSerializer
    PATCH  /sales/{id}/     → SaleUpdateSerializer
    DELETE /sales/{id}/     → Always allowed (stock is returned to batches)

    FILTERING:
        ?customer=5
        ?customer_name=kebede
        ?date_from=2024-01-01&date_to=2024-06-30
        ?payment_type=cash
        ?currency=ETB
        ?invoice_number=INV-2024
        ?has_credit=true

    SEARCHING:
        ?search=INV-2024  (searches invoice_number, notes, customer name)

    ORDERING:
        ?ordering=-date           → newest first (default)
        ?ordering=-total_sale_amount
        ?ordering=-credit_amount
    """
    queryset = Sale.objects.all()
    pagination_class = StandardPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    filterset_class = SaleFilter
    search_fields = ['invoice_number', 'notes', 'customer__name']
    ordering_fields = [
        'date', 'total_sale_amount', 'amount_paid_now',
        'credit_amount', 'created_at',
        'stock_batch__item_code',
        'stock_batch__product_name',
        'sale__invoice_number',
        'sale__date',
        'sale__customer__name',
        'total_line_amount',
        'selling_price',
    ]
    ordering = ['-date', '-created_at']

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return SaleCreateSerializer
        if self.action in ('update', 'partial_update'):
            return SaleUpdateSerializer
        # list and retrieve
        return SaleReadSerializer

    def get_queryset(self):
        """Optimize queries with select_related and prefetch_related."""
        qs = super().get_queryset()
        qs = qs.select_related('customer')
        if self.action in ('list', 'retrieve'):
            qs = qs.prefetch_related(
                'items',
                'items__stock_batch',
                'items__stock_batch__factory',
            )
        return qs

    def destroy(self, request, *args, **kwargs):
        """
        Delete a sale and return all stock to the batches.
        When a sale is deleted:
            1. Return sold bags/pieces back to each stock batch
            2. Delete the sale (CASCADE deletes items + auto income record)
            3. Customer balance decreases (credit_amount is removed)

        We MUST return stock BEFORE deleting the sale because
        Django's CASCADE doesn't call SaleItem.delete() methods.
        """
        from django.db.models import F

        instance = self.get_object()

        # Step 1: Return stock to each batch
        for item in instance.items.select_related('stock_batch').all():
            StockBatch = item.stock_batch.__class__
            StockBatch.objects.filter(pk=item.stock_batch.pk).update(
                sold_bags=F('sold_bags') - item.bags_sold,
                sold_pieces=F('sold_pieces') - item.pieces_sold,
            )

        # Step 2: Delete the sale
        # CASCADE will delete SaleItems and auto CustomerIncome record
        instance.delete()

        return Response(
            {"detail": "Sale deleted and stock returned to inventory."},
            status=status.HTTP_204_NO_CONTENT
        )


class SaleItemViewSet(viewsets.ModelViewSet):
    """
    Standalone CRUD for individual sale items.

    Useful for:
        → Adding a new item to an existing sale
        → Editing quantity or price on a single line
        → Removing one item from a sale (stock is returned)
        → Viewing items across all sales

    LIST   /sale-items/          → SaleItemReadSerializer
    GET    /sale-items/{id}/     → SaleItemReadSerializer
    POST   /sale-items/          → SaleItemWriteSerializer
    PUT    /sale-items/{id}/     → SaleItemWriteSerializer
    PATCH  /sale-items/{id}/     → SaleItemWriteSerializer
    DELETE /sale-items/{id}/     → Always allowed (stock is returned)

    FILTERING:
        ?sale=5
        ?item_code=SOCK
        ?customer=3
        ?stock_batch=10
        ?date_from=2024-01-01

    SEARCHING:
        ?search=SOCK  (searches item_code and product_name)

    ORDERING:
        ?ordering=item_code
        ?ordering=-total_line_amount
        ?ordering=-created_at
    """
    queryset = SaleItem.objects.all()
    pagination_class = StandardPagination
    filterset_class = SaleItemFilter
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    search_fields = [
        'stock_batch__item_code',
        'stock_batch__product_name',
    ]
    ordering_fields = [
        'total_line_amount', 'selling_price',
        'bags_sold', 'created_at','stock_batch__item_code',
        'stock_batch__product_name',
    ]
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action in ('list', 'retrieve'):
            return SaleItemReadSerializer
        # create, update, partial_update
        return SaleItemWriteSerializer

    def get_queryset(self):
        """Optimize queries."""
        qs = super().get_queryset()
        qs = qs.select_related(
            'sale', 'sale__customer',
            'stock_batch', 'stock_batch__factory',
        )
        return qs
