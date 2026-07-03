import django_filters
from .models import StockBatch


class StockBatchFilter(django_filters.FilterSet):
    """
    Example queries:
        /stock/?item_code=SOCK           → batches for item code containing SOCK
        /stock/?factory=2                → batches from specific factory
        /stock/?shipping_code=SHP-A3     → batches from specific shipment
        /stock/?is_sold_out=true         → sold out batches
        /stock/?is_low_stock=true        → low stock batches (below threshold)
        /stock/?has_stock=true           → batches with remaining stock
        /stock/?currency=USD             → batches in specific currency
    """
    item_code = django_filters.CharFilter(
        lookup_expr='icontains',
        help_text="Item code (partial match)"
    )
    product_name = django_filters.CharFilter(
        lookup_expr='icontains',
        help_text="Product name (partial match)"
    )
    factory = django_filters.NumberFilter(
        help_text="Factory ID"
    )
    factory_name = django_filters.CharFilter(
        field_name='factory__name',
        lookup_expr='icontains',
        help_text="Factory name (partial match)"
    )
    shipping_code = django_filters.CharFilter(
        lookup_expr='icontains',
        help_text="Shipping code (partial match)"
    )
    currency = django_filters.CharFilter(
        lookup_expr='iexact',
        help_text="Currency code"
    )
    price_type = django_filters.CharFilter(
        help_text="per_piece or per_bag"
    )
    is_sold_out = django_filters.BooleanFilter(
        method='filter_is_sold_out',
        help_text="True = completely sold out, False = still has stock"
    )
    is_low_stock = django_filters.BooleanFilter(
        method='filter_is_low_stock',
        help_text="True = below low stock threshold"
    )
    has_stock = django_filters.BooleanFilter(
        method='filter_has_stock',
        help_text="True = has remaining bags > 0"
    )
    min_purchase_price = django_filters.NumberFilter(
        field_name='purchase_price',
        lookup_expr='gte',
        help_text="Minimum purchase price"
    )
    max_purchase_price = django_filters.NumberFilter(
        field_name='purchase_price',
        lookup_expr='lte',
        help_text="Maximum purchase price"
    )
    purchase_date_from = django_filters.DateFilter(
        field_name='purchase__date',
        lookup_expr='gte',
        help_text="Purchase date from"
    )
    purchase_date_to = django_filters.DateFilter(
        field_name='purchase__date',
        lookup_expr='lte',
        help_text="Purchase date to"
    )
    min_remaining_bags = django_filters.NumberFilter(
        method='filter_min_remaining_bags',
        help_text="Minimum remaining bags"
    )

    class Meta:
        model = StockBatch
        fields = []

    def filter_is_sold_out(self, queryset, name, value):
        """
        Filter by sold out status.
        sold_out = remaining_bags <= 0
        remaining_bags = total_bags_purchased - sold_bags
        """
        from django.db.models import F

        if value is True:
            return queryset.filter(
                total_bags_purchased__lte=F('sold_bags')
            )
        elif value is False:
            return queryset.filter(
                total_bags_purchased__gt=F('sold_bags')
            )
        return queryset

    def filter_is_low_stock(self, queryset, name, value):
        """
        Filter by low stock status.

        A batch is low stock if:
            remaining_bags / total_bags_purchased < threshold_percentage / 100
        AND it is not sold out.

        We fetch the threshold from AppSetting and annotate the queryset.
        """
        from django.db.models import F
        from ..core.models import AppSetting

        if value is not True:
            return queryset

        settings = AppSetting.get_settings()
        threshold = settings.low_stock_alert_percentage / 100

        # remaining / total < threshold AND remaining > 0
        # total - sold < total * threshold AND total - sold > 0
        return queryset.filter(
            total_bags_purchased__gt=0
        ).annotate(
            remaining=F('total_bags_purchased') - F('sold_bags')
        ).filter(
            remaining__gt=0,
            remaining__lt=F('total_bags_purchased') * threshold
        )

    def filter_has_stock(self, queryset, name, value):
        """Filter batches that have remaining stock (not sold out)."""
        from django.db.models import F

        if value is True:
            return queryset.filter(
                total_bags_purchased__gt=F('sold_bags')
            )
        elif value is False:
            return queryset.filter(
                total_bags_purchased__lte=F('sold_bags')
            )
        return queryset

    def filter_min_remaining_bags(self, queryset, name, value):
        """Filter batches with at least N remaining bags."""
        from django.db.models import F

        return queryset.annotate(
            remaining=F('total_bags_purchased') - F('sold_bags')
        ).filter(remaining__gte=value)
