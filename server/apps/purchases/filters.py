import django_filters
from .models import Purchase, PurchaseItem


class PurchaseFilter(django_filters.FilterSet):
    """
    Example queries:
        /purchases/?factory=2                    → from specific factory
        /purchases/?date_from=2024-01-01         → on or after date
        /purchases/?date_to=2024-06-30           → on or before date
        /purchases/?shipping_code=SHP-A3F2       → by shipping code
        /purchases/?currency=USD                 → by currency
        /purchases/?is_fully_editable=true       → purchases not yet sold from
        /purchases/?min_total=5000               → minimum total amount
    """
    factory = django_filters.NumberFilter(
        help_text="Factory ID"
    )
    factory_name = django_filters.CharFilter(
        field_name='factory__name',
        lookup_expr='icontains',
        help_text="Factory name (partial match)"
    )
    date_from = django_filters.DateFilter(
        field_name='date',
        lookup_expr='gte',
        help_text="Purchase date from"
    )
    date_to = django_filters.DateFilter(
        field_name='date',
        lookup_expr='lte',
        help_text="Purchase date to"
    )
    shipping_code = django_filters.CharFilter(
        lookup_expr='icontains',
        help_text="Shipping code (partial match)"
    )
    currency = django_filters.CharFilter(
        lookup_expr='iexact',
        help_text="Currency code"
    )
    is_fully_editable = django_filters.BooleanFilter(
        method='filter_is_fully_editable',
        help_text="True = no items sold yet, can edit/delete"
    )
    min_total = django_filters.NumberFilter(
        field_name='total_purchase_amount',
        lookup_expr='gte',
        help_text="Minimum total purchase amount"
    )
    max_total = django_filters.NumberFilter(
        field_name='total_purchase_amount',
        lookup_expr='lte',
        help_text="Maximum total purchase amount"
    )
    min_unpaid = django_filters.NumberFilter(
        field_name='unpaid_amount',
        lookup_expr='gte',
        help_text="Minimum unpaid amount"
    )
    has_unpaid = django_filters.BooleanFilter(
        method='filter_has_unpaid',
        help_text="True = has unpaid balance"
    )

    class Meta:
        model = Purchase
        fields = []

    def filter_is_fully_editable(self, queryset, name, value):
        """
        Filter purchases by whether they can be fully edited.
        is_fully_editable=True means no stock from this purchase
        has been sold yet.
        """
        if value is True:
            # Purchases where NO stock batch has sold_bags > 0
            return queryset.filter(
                stock_batches__sold_bags=0
            ).distinct()
        elif value is False:
            # Purchases where at least one stock batch has sold_bags > 0
            return queryset.filter(
                stock_batches__sold_bags__gt=0
            ).distinct()
        return queryset

    def filter_has_unpaid(self, queryset, name, value):
        """Filter purchases that have remaining unpaid balance."""
        if value is True:
            return queryset.filter(unpaid_amount__gt=0)
        elif value is False:
            return queryset.filter(unpaid_amount=0)
        return queryset


class PurchaseItemFilter(django_filters.FilterSet):
    """
    Example queries:
        /purchase-items/?purchase=5              → items from specific purchase
        /purchase-items/?item_code=SOCK          → items with code containing SOCK
        /purchase-items/?factory=2               → items from specific factory
        /purchase-items/?shipping_code=SHP-A3    → items from specific shipment
    """
    purchase = django_filters.NumberFilter(help_text="Purchase ID"    )
    item_code = django_filters.CharFilter(
        lookup_expr='icontains',
        help_text="Item code (partial match)"
    )
    product_name = django_filters.CharFilter(
        lookup_expr='icontains',
        help_text="Product name (partial match)"
    )
    factory = django_filters.NumberFilter(
        field_name='purchase__factory',
        help_text="Factory ID"
    )
    factory_name = django_filters.CharFilter(
        field_name='purchase__factory__name',
        lookup_expr='icontains',
        help_text="Factory name (partial match)"
    )
    shipping_code = django_filters.CharFilter(
        field_name='purchase__shipping_code',
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
    min_price = django_filters.NumberFilter(
        field_name='purchase_price',
        lookup_expr='gte',
        help_text="Minimum purchase price"
    )
    max_price = django_filters.NumberFilter(
        field_name='purchase_price',
        lookup_expr='lte',
        help_text="Maximum purchase price"
    )
    date_from = django_filters.DateFilter(
        field_name='purchase__date',
        lookup_expr='gte',
        help_text="Purchase date from"
    )
    date_to = django_filters.DateFilter(
        field_name='purchase__date',
        lookup_expr='lte',
        help_text="Purchase date to"
    )

    class Meta:
        model = PurchaseItem
        fields = []
