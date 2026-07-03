import django_filters
from .models import Factory


class FactoryFilter(django_filters.FilterSet):
    """
    Example queries:
        /factories/?name=addis          → name contains 'addis'
        /factories/?location=bole       → location contains 'bole'
        /factories/?is_active=true      → active factories only
        /factories/?has_balance=true    → factories you owe money to
        /factories/?has_balance=false   → settled or overpaid factories
    """
    name = django_filters.CharFilter(
        lookup_expr='icontains',
        help_text="Search by factory name (partial match)"
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
    initial_balance_currency = django_filters.CharFilter(
        lookup_expr='iexact',
        help_text="Filter by currency code, e.g. ETB, USD"
    )
    min_initial_balance = django_filters.NumberFilter(
        field_name='initial_balance',
        lookup_expr='gte',
        help_text="Minimum initial balance amount"
    )
    max_initial_balance = django_filters.NumberFilter(
        field_name='initial_balance',
        lookup_expr='lte',
        help_text="Maximum initial balance amount"
    )
    has_balance = django_filters.BooleanFilter(
        method='filter_has_balance',
        help_text="True = you owe them, False = settled or they owe you"
    )

    class Meta:
        model = Factory
        fields = []

    def filter_has_balance(self, queryset, name, value):
        from django.db.models import Sum, F, DecimalField
        from django.db.models.functions import Coalesce

        queryset = queryset.annotate(
            calc_balance=(
                F('initial_balance')
                + Coalesce(Sum('purchases__unpaid_amount', output_field=DecimalField()), 0, output_field=DecimalField())
                - Coalesce(Sum('payment_records__paid_amount', output_field=DecimalField()), 0, output_field=DecimalField())
            )
        )

        if value is True:
            return queryset.filter(calc_balance__gt=0)
        elif value is False:
            return queryset.filter(calc_balance__lte=0)

        return queryset
