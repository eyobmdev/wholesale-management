import django_filters
from .models import Sale, SaleItem


class SaleFilter(django_filters.FilterSet):
    """
    Example queries:
        /sales/?customer=5                        → sales to specific customer
        /sales/?customer_name=kebede              → customer name partial match
        /sales/?date_from=2024-01-01              → on or after date
        /sales/?date_to=2024-06-30                → on or before date
        /sales/?payment_type=cash                 → cash sales only
        /sales/?currency=ETB                      → specific currency
        /sales/?invoice_number=INV-2024           → invoice number partial match
        /sales/?has_credit=true                   → sales with unpaid balance
    """
    customer = django_filters.NumberFilter(
        help_text="Customer ID"
    )
    customer_name = django_filters.CharFilter(
        field_name='customer__name',
        lookup_expr='icontains',
        help_text="Customer name (partial match)"
    )
    customer_location = django_filters.CharFilter(
        field_name='customer__location',
        lookup_expr='icontains',
        help_text="Customer location (partial match)"
    )
    date_from = django_filters.DateFilter(
        field_name='date',
        lookup_expr='gte',
        help_text="Sale date from"
    )
    date_to = django_filters.DateFilter(
        field_name='date',
        lookup_expr='lte',
        help_text="Sale date to"
    )
    payment_type = django_filters.CharFilter(
        help_text="cash, credit, or partial"
    )
    currency = django_filters.CharFilter(
        lookup_expr='iexact',
        help_text="Currency code"
    )
    invoice_number = django_filters.CharFilter(
        lookup_expr='icontains',
        help_text="Invoice number (partial match)"
    )
    min_total = django_filters.NumberFilter(
        field_name='total_sale_amount',
        lookup_expr='gte',
        help_text="Minimum total sale amount"
    )
    max_total = django_filters.NumberFilter(
        field_name='total_sale_amount',
        lookup_expr='lte',
        help_text="Maximum total sale amount"
    )
    has_credit = django_filters.BooleanFilter(
        method='filter_has_credit',
        help_text="True = sale has unpaid credit balance"
    )

    class Meta:
        model = Sale
        fields = []

    def filter_has_credit(self, queryset, name, value):
        """Filter sales that have outstanding credit (unpaid balance)."""
        if value is True:
            return queryset.filter(credit_amount__gt=0)
        elif value is False:
            return queryset.filter(credit_amount=0)
        return queryset


class SaleItemFilter(django_filters.FilterSet):
    """
    Filter sale items by various fields.

    Example queries:
        /sale-items/?sale=5                  → items from specific sale
        /sale-items/?item_code=SOCK          → items with code containing SOCK
        /sale-items/?customer=3              → items sold to specific customer
        /sale-items/?stock_batch=10          → items from specific batch
    """
    sale = django_filters.NumberFilter(
        help_text="Sale ID"
    )
    sale_invoice = django_filters.CharFilter(
        field_name='sale__invoice_number',
        lookup_expr='icontains',
        help_text="Sale invoice number (partial match)"
    )
    stock_batch = django_filters.NumberFilter(
        help_text="Stock batch ID"
    )
    item_code = django_filters.CharFilter(
        field_name='stock_batch__item_code',
        lookup_expr='icontains',
        help_text="Item code (partial match)"
    )
    product_name = django_filters.CharFilter(
        field_name='stock_batch__product_name',
        lookup_expr='icontains',
        help_text="Product name (partial match)"
    )
    customer = django_filters.NumberFilter(
        field_name='sale__customer',
        help_text="Customer ID"
    )
    customer_name = django_filters.CharFilter(
        field_name='sale__customer__name',
        lookup_expr='icontains',
        help_text="Customer name (partial match)"
    )
    factory = django_filters.NumberFilter(
        field_name='stock_batch__factory',
        help_text="Factory ID"
    )
    sell_price_type = django_filters.CharFilter(
        help_text="per_piece or per_bag"
    )
    date_from = django_filters.DateFilter(
        field_name='sale__date',
        lookup_expr='gte',
        help_text="Sale date from"
    )
    date_to = django_filters.DateFilter(
        field_name='sale__date',
        lookup_expr='lte',
        help_text="Sale date to"
    )
    min_selling_price = django_filters.NumberFilter(
        field_name='selling_price',
        lookup_expr='gte',
        help_text="Minimum selling price"
    )
    max_selling_price = django_filters.NumberFilter(
        field_name='selling_price',
        lookup_expr='lte',
        help_text="Maximum selling price"
    )

    class Meta:
        model = SaleItem
        fields = []
