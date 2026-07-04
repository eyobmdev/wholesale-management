import django_filters
from .models import CustomerIncome, FactoryPayment, GeneralExpense


class CustomerIncomeFilter(django_filters.FilterSet):
    """
    Example queries:
        /income/?customer=5                    → payments from specific customer
        /income/?customer_name=kebede          → customer name partial match
        /income/?date_from=2024-01-01          → on or after date
        /income/?date_to=2024-06-30            → on or before date
        /income/?payment_method=cash           → cash payments only
        /income/?is_auto=false                 → manual payments only
        /income/?currency=ETB                  → specific currency
        /income/?min_amount=500                → minimum payment amount
    """
    customer = django_filters.NumberFilter(
        help_text="Customer ID"
    )
    customer_name = django_filters.CharFilter(
        field_name='customer__name',
        lookup_expr='icontains',
        help_text="Customer name (partial match)"
    )
    date_from = django_filters.DateFilter(
        field_name='date',
        lookup_expr='gte',
        help_text="Payment date from"
    )
    date_to = django_filters.DateFilter(
        field_name='date',
        lookup_expr='lte',
        help_text="Payment date to"
    )
    payment_method = django_filters.CharFilter(
        help_text="cash, telebirr, cbe, boa, awash, other"
    )
    is_auto = django_filters.BooleanFilter(
        help_text="True = auto from sale, False = manual payment"
    )
    currency = django_filters.CharFilter(
        lookup_expr='iexact',
        help_text="Currency code"
    )
    min_amount = django_filters.NumberFilter(
        field_name='paid_amount',
        lookup_expr='gte',
        help_text="Minimum paid amount"
    )
    max_amount = django_filters.NumberFilter(
        field_name='paid_amount',
        lookup_expr='lte',
        help_text="Maximum paid amount"
    )
    receipt_number = django_filters.CharFilter(
        lookup_expr='icontains',
        help_text="Receipt number (partial match)"
    )
    has_sale = django_filters.BooleanFilter(
        method='filter_has_sale',
        help_text="True = linked to a sale (auto), False = standalone (manual)"
    )

    class Meta:
        model = CustomerIncome
        fields = []

    def filter_has_sale(self, queryset, name, value):
        """Filter by whether the income is linked to a sale."""
        if value is True:
            return queryset.filter(sale__isnull=False)
        elif value is False:
            return queryset.filter(sale__isnull=True)
        return queryset


class FactoryPaymentFilter(django_filters.FilterSet):
    """
    Example queries:
        /factory-payments/?factory=2               → payments to specific factory
        /factory-payments/?factory_name=addis      → factory name partial match
        /factory-payments/?date_from=2024-01-01    → on or after date
        /factory-payments/?payment_method=cbe      → CBE transfers only
        /factory-payments/?is_auto=false            → manual payments only
        /factory-payments/?min_amount=1000          → minimum payment amount
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
        help_text="Payment date from"
    )
    date_to = django_filters.DateFilter(
        field_name='date',
        lookup_expr='lte',
        help_text="Payment date to"
    )
    payment_method = django_filters.CharFilter(
        help_text="cash, telebirr, cbe, boa, awash, other"
    )
    is_auto = django_filters.BooleanFilter(
        help_text="True = auto from purchase, False = manual payment"
    )
    currency = django_filters.CharFilter(
        lookup_expr='iexact',
        help_text="Currency code"
    )
    min_amount = django_filters.NumberFilter(
        field_name='paid_amount',
        lookup_expr='gte',
        help_text="Minimum paid amount"
    )
    max_amount = django_filters.NumberFilter(
        field_name='paid_amount',
        lookup_expr='lte',
        help_text="Maximum paid amount"
    )
    payment_number = django_filters.CharFilter(
        lookup_expr='icontains',
        help_text="Payment number (partial match)"
    )
    has_purchase = django_filters.BooleanFilter(
        method='filter_has_purchase',
        help_text="True = linked to a purchase (auto), False = standalone"
    )

    class Meta:
        model = FactoryPayment
        fields = []

    def filter_has_purchase(self, queryset, name, value):
        """Filter by whether the payment is linked to a purchase."""
        if value is True:
            return queryset.filter(purchase__isnull=False)
        elif value is False:
            return queryset.filter(purchase__isnull=True)
        return queryset


class GeneralExpenseFilter(django_filters.FilterSet):
    """
    Example queries:
        /expenses/?date_from=2024-01-01         → on or after date
        /expenses/?date_to=2024-06-30            → on or before date
        /expenses/?payment_method=cash           → cash expenses only
        /expenses/?currency=ETB                  → specific currency
        /expenses/?description=rent              → description contains 'rent'
        /expenses/?min_amount=500                → minimum amount
    """
    date_from = django_filters.DateFilter(
        field_name='date',
        lookup_expr='gte',
        help_text="Expense date from"
    )
    date_to = django_filters.DateFilter(
        field_name='date',
        lookup_expr='lte',
        help_text="Expense date to"
    )
    payment_method = django_filters.CharFilter(
        help_text="cash, telebirr, cbe, boa, awash, other"
    )
    currency = django_filters.CharFilter(
        lookup_expr='iexact',
        help_text="Currency code"
    )
    description = django_filters.CharFilter(
        lookup_expr='icontains',
        help_text="Description contains (partial match)"
    )
    min_amount = django_filters.NumberFilter(
        field_name='amount',
        lookup_expr='gte',
        help_text="Minimum amount"
    )
    max_amount = django_filters.NumberFilter(
        field_name='amount',
        lookup_expr='lte',
        help_text="Maximum amount"
    )
    expense_number = django_filters.CharFilter(
        lookup_expr='icontains',
        help_text="Expense number (partial match)"
    )

    class Meta:
        model = GeneralExpense
        fields = []
