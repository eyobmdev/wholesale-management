import django_filters
from .models import Customer


class CustomerFilter(django_filters.FilterSet):
    """
    Filter customers by various fields.
    Example queries:
        /customers/?name=kebede           → name contains 'kebede'
        /customers/?location=merkato      → location contains 'merkato'
        /customers/?is_active=true        → active customers only
        /customers/?opening_date_from=2024-01-01&opening_date_to=2024-06-30
        /customers/?has_debt=true         → customers who owe you money
        /customers/?has_debt=false        → settled or overpaid customers
    """
    name = django_filters.CharFilter(
        lookup_expr='icontains',
        help_text="Search by name (partial match)"
    )
    phone = django_filters.CharFilter(
        lookup_expr='icontains',
        help_text="Search by phone number (partial match)"
    )
    location = django_filters.CharFilter(
        lookup_expr='icontains',
        help_text="Search by location (partial match)"
    )
    is_active = django_filters.BooleanFilter(
        help_text="True = active, False = archived"
    )
    initial_credit_currency = django_filters.CharFilter(
        lookup_expr='iexact',
        help_text="Filter by currency code, e.g. ETB, USD"
    )
    opening_date_from = django_filters.DateFilter(
        field_name='opening_date',
        lookup_expr='gte',
        help_text="Customers registered on or after this date"
    )
    opening_date_to = django_filters.DateFilter(
        field_name='opening_date',
        lookup_expr='lte',
        help_text="Customers registered on or before this date"
    )
    min_initial_credit = django_filters.NumberFilter(
        field_name='initial_credit',
        lookup_expr='gte',
        help_text="Minimum initial credit amount"
    )
    max_initial_credit = django_filters.NumberFilter(
        field_name='initial_credit',
        lookup_expr='lte',
        help_text="Maximum initial credit amount"
    )
    has_debt = django_filters.BooleanFilter(
        method='filter_has_debt',
        help_text="True = owes you money, False = settled or overpaid"
    )

    class Meta:
        model = Customer
        fields = []

    def filter_has_debt(self, queryset, name, value):
        """
        Positive balance = customer owes me money.
        Zero or negative = settled or overpaid.
        """
        from django.db.models import Sum, F, DecimalField
        from django.db.models.functions import Coalesce

        queryset = queryset.annotate(
            calc_balance=(
                F('initial_credit')
                + Coalesce(Sum('sales__credit_amount', output_field=DecimalField()), 0, output_field=DecimalField())
                - Coalesce(Sum('income_records__paid_amount', output_field=DecimalField()), 0, output_field=DecimalField())
            )
        )

        if value is True:
            return queryset.filter(calc_balance__gt=0)
        elif value is False:
            return queryset.filter(calc_balance__lte=0)

        return queryset
