"""
ViewSets for StockBatch model.
Stock is read-only — it is auto-created from PurchaseItem and
auto-updated by SaleItem. No manual create/update/delete allowed.

Includes a custom action for stock summary aggregated by item_code.
"""
from django_filters.rest_framework.backends import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, F, Q, DecimalField

from .models import StockBatch
from .serializers import StockBatchSerializer, StockSummaryByItemSerializer
from .filters import StockBatchFilter
from ..core.pagination import StandardPagination


class StockBatchViewSet(viewsets.ModelViewSet):
    """
    READ-ONLY ViewSet for stock batches.

    LIST   /stock/              → StockBatchSerializer (all batches)
    GET    /stock/{id}/         → StockBatchSerializer (single batch)
    POST   /stock/              → NOT ALLOWED (stock is auto-created from purchases)
    PUT    /stock/{id}/         → NOT ALLOWED
    DELETE /stock/{id}/         → NOT ALLOWED

    CUSTOM ACTIONS:
        GET /stock/summary/     → Aggregated stock summary by item_code

    FILTERING:
        ?item_code=SOCK
        ?factory=2
        ?factory_name=addis
        ?shipping_code=SHP-A3
        ?is_sold_out=true
        ?is_low_stock=true
        ?has_stock=true
        ?currency=USD
        ?min_remaining_bags=5

    SEARCHING:
        ?search=SOCK  (searches item_code, product_name, shipping_code)

    ORDERING:
        ?ordering=item_code
        ?ordering=-remaining_bags (computed, may be slow)
        ?ordering=-purchase__date (default)
        ?ordering=stock_value
    """
    queryset = StockBatch.objects.all()
    pagination_class = StandardPagination
    filterset_class = StockBatchFilter
    filter_backends = [DjangoFilterBackend]
    search_fields = ['item_code', 'product_name', 'shipping_code']
    ordering_fields = [
        'item_code', 'product_name', 'shipping_code',
        'purchase_price', 'total_bags_purchased', 'sold_bags',
        'created_at',
    ]
    ordering = ['-purchase__date', 'item_code']

    def get_serializer_class(self):
        return StockBatchSerializer

    def get_queryset(self):
        """Optimize queries with select_related."""
        qs = super().get_queryset()
        qs = qs.select_related('purchase_item', 'purchase', 'factory')

        # Annotate remaining_bags and remaining_pieces for ordering
        if self.action == 'list':
            qs = qs.annotate(
                _remaining_bags=F('total_bags_purchased') - F('sold_bags'),
                _remaining_pieces=F('total_pieces_purchased') - F('sold_pieces'),
            )
        return qs

    # ── Disable all write methods ──────────────────────────────────

    def create(self, request, *args, **kwargs):
        raise MethodNotAllowed(
            'POST',
            detail='Stock is automatically created when you add purchase items. '
                   'POST to /purchases/ instead.'
        )

    def update(self, request, *args, **kwargs):
        raise MethodNotAllowed(
            'PUT',
            detail='Stock is automatically updated by sales and purchases. '
                   'Edit the related sale or purchase instead.'
        )

    def partial_update(self, request, *args, **kwargs):
        raise MethodNotAllowed(
            'PATCH',
            detail='Stock is automatically updated by sales and purchases. '
                   'Edit the related sale or purchase instead.'
        )

    def destroy(self, request, *args, **kwargs):
        raise MethodNotAllowed(
            'DELETE',
            detail='Stock batches cannot be deleted manually. '
                   'Delete the related purchase instead.'
        )

    # ── Custom Actions ─────────────────────────────────────────────

    @action(detail=False, methods=['get'], url_path='summary')
    def stock_summary(self, request):
        """
        GET /stock/summary/

        Aggregated stock view grouped by item_code.
        Shows combined totals across ALL batches for each product.

        Response example:
        [
            {
                "item_code": "SOCK-ANKLE-01",
                "product_name": "Ankle Socks White",
                "batch_count": 3,
                "total_bags_purchased": 15,
                "total_pieces_purchased": 300,
                "total_sold_bags": 7,
                "total_sold_pieces": 140,
                "total_remaining_bags": 8,
                "total_remaining_pieces": 160,
                "total_stock_value": 1920.00,
                "has_low_stock_batch": true,
                "has_sold_out_batch": false,
                "batches": [...]
            }
        ]

        Supports same filters as the main stock endpoint:
            ?item_code=SOCK
            ?factory=2
            ?is_low_stock=true
        """
        # Start with the filtered queryset (filters still apply)
        queryset = self.filter_queryset(self.get_queryset())

        # Group by item_code
        item_codes = queryset.values_list('item_code', flat=True).distinct().order_by('item_code')

        summary_data = []
        for item_code in item_codes:
            batches = queryset.filter(item_code=item_code)
            batch_list = list(batches)

            if not batch_list:
                continue

            # Aggregate values across all batches for this item_code
            aggregates = batches.aggregate(
                total_bags=Sum('total_bags_purchased'),
                total_pieces=Sum('total_pieces_purchased'),
                total_sold_bags=Sum('sold_bags'),
                total_sold_pieces=Sum('sold_pieces'),
                total_stock_value=Sum(
                    (F('total_pieces_purchased') - F('sold_pieces')) * F('purchase_price'),
                    output_field=DecimalField(),
                ),
            )

            # Check if any batch is low stock or sold out
            has_low_stock = any(b.is_low_stock for b in batch_list)
            has_sold_out = any(b.is_sold_out for b in batch_list)

            # Get product name from first batch
            product_name = batch_list[0].product_name

            # Serialize individual batches
            batches_serializer = StockBatchSerializer(batch_list, many=True)

            summary_data.append({
                'item_code': item_code,
                'product_name': product_name,
                'batch_count': len(batch_list),
                'total_bags_purchased': aggregates['total_bags'] or 0,
                'total_pieces_purchased': aggregates['total_pieces'] or 0,
                'total_sold_bags': aggregates['total_sold_bags'] or 0,
                'total_sold_pieces': aggregates['total_sold_pieces'] or 0,
                'total_remaining_bags': (
                    (aggregates['total_bags'] or 0) - (aggregates['total_sold_bags'] or 0)
                ),
                'total_remaining_pieces': (
                    (aggregates['total_pieces'] or 0) - (aggregates['total_sold_pieces'] or 0)
                ),
                'total_stock_value': aggregates['total_stock_value'] or 0,
                'has_low_stock_batch': has_low_stock,
                'has_sold_out_batch': has_sold_out,
                'batches': batches_serializer.data,
            })

        # Paginate the summary data
        page = self.paginate_queryset(summary_data)
        if page is not None:
            serializer = StockSummaryByItemSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = StockSummaryByItemSerializer(summary_data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='available')
    def available_stock(self, request):
        """
        GET /stock/available/

        Returns only batches that have remaining stock.
        Useful for the sales form — shows which batches
        can be selected for selling.

        Same as /stock/?has_stock=true but returns a
        simplified response focused on what matters for sales.
        """
        queryset = self.filter_queryset(self.get_queryset())
        # Only batches with remaining stock
        queryset = queryset.filter(
            total_bags_purchased__gt=F('sold_bags')
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='low-stock')
    def low_stock_alerts(self, request):
        """
        GET /stock/low-stock/

        Returns only batches that are low stock or sold out.
        Used by the dashboard to show alerts.
        """
        from ..core.models import AppSetting

        queryset = self.filter_queryset(self.get_queryset())
        settings = AppSetting.get_settings()
        threshold = settings.low_stock_alert_percentage / 100

        # Annotate with remaining
        queryset = queryset.annotate(
            _remaining=F('total_bags_purchased') - F('sold_bags')
        ).filter(
            total_bags_purchased__gt=0
        ).filter(
            _remaining__lt=F('total_bags_purchased') * threshold
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class StockBatchOptionViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        queryset = (
            StockBatch.objects
            .select_related("factory", "purchase")
            .filter(sold_bags__lt=F("total_bags_purchased"))
            .order_by("item_code", "-purchase__date")
        )

        search = request.query_params.get("search")

        if search:
            queryset = queryset.filter(
                Q(item_code__icontains=search) |
                Q(product_name__icontains=search) |
                Q(shipping_code__icontains=search) |
                Q(factory__name__icontains=search)
            )

        options = []

        for stock in queryset:
            options.append({
                "value": stock.id,
                "label": (
                    f"{stock.item_code} • "
                    f"{stock.product_name} • "
                    f"{stock.shipping_code} • "
                    f"{stock.remaining_bags:g} Bag"
                    f"{'' if stock.remaining_bags == 1 else 's'} "
                    f"({stock.remaining_pieces} pcs)"
                )
            })

        return Response(options)



