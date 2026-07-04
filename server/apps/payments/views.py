"""
ViewSets for CustomerIncome, FactoryPayment, and GeneralExpense models.

CustomerIncome and FactoryPayment have auto records (from sales/purchases)
and manual records (created by owner). Auto records cannot be edited
or deleted through these endpoints — they are managed by their parent
sale/purchase. Manual records can be freely edited and deleted.

GeneralExpense records are always manually created and can be fully managed.
"""
from django_filters.rest_framework.backends import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError

from .models import CustomerIncome, FactoryPayment, GeneralExpense
from .serializers import (
    CustomerIncomeSerializer,
    CustomerIncomeListSerializer,
    FactoryPaymentSerializer,
    FactoryPaymentListSerializer,
    GeneralExpenseSerializer,
    GeneralExpenseListSerializer,
)
from .filters import (
    CustomerIncomeFilter,
    FactoryPaymentFilter,
    GeneralExpenseFilter,
)
from ..core.pagination import StandardPagination


class CustomerIncomeViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for customer income (money received FROM customers).

    LIST   /income/          → CustomerIncomeListSerializer (lighter)
    GET    /income/{id}/     → CustomerIncomeSerializer (full detail)
    POST   /income/          → CustomerIncomeSerializer (manual payment)
    PUT    /income/{id}/     → CustomerIncomeSerializer (manual only)
    PATCH  /income/{id}/     → CustomerIncomeSerializer (manual only)
    DELETE /income/{id}/     → Manual payments only (auto managed by sale)

    IMPORTANT:
        Auto income records (is_auto=True) are created when a sale
        has amount_paid_now > 0. They CANNOT be edited or deleted
        through this endpoint. Edit the sale instead.

        Manual income records (is_auto=False) can be freely edited
        and deleted. They are standalone payments for old credit.

    FILTERING:
        ?customer=5
        ?customer_name=kebede
        ?date_from=2024-01-01&date_to=2024-06-30
        ?payment_method=cash
        ?is_auto=false
        ?min_amount=500
        ?receipt_number=RCP-2024

    SEARCHING:
        ?search=kebede  (searches customer name, receipt number, notes)

    ORDERING:
        ?ordering=-date           → newest first (default)
        ?ordering=-paid_amount    → largest payment first
        ?ordering=receipt_number
    """
    queryset = CustomerIncome.objects.all()
    pagination_class = StandardPagination
    filterset_class = CustomerIncomeFilter
    filter_backends = [DjangoFilterBackend]
    search_fields = ['customer__name', 'receipt_number', 'notes', 'reference']
    ordering_fields = ['date', 'paid_amount', 'created_at']
    ordering = ['-date', '-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return CustomerIncomeListSerializer
        return CustomerIncomeSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.select_related('customer', 'sale')

    def perform_update(self, serializer):
        if serializer.instance.is_auto:
            raise ValidationError(
                "Cannot edit auto income record. "
                "This payment was created from a sale. "
                "Edit the sale instead."
            )
        super().perform_update(serializer)

    def perform_destroy(self, instance):
        if instance.is_auto:
            raise ValidationError(
                "Cannot delete auto income record. "
                "This payment was created from a sale. "
                "Delete the sale instead, or edit the sale's amount paid."
            )
        instance.delete()


class FactoryPaymentViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for factory payments (money paid TO factories).

    LIST   /factory-payments/          → FactoryPaymentListSerializer
    GET    /factory-payments/{id}/     → FactoryPaymentSerializer
    POST   /factory-payments/          → FactoryPaymentSerializer (manual)
    PUT    /factory-payments/{id}/     → FactoryPaymentSerializer (manual only)
    PATCH  /factory-payments/{id}/     → FactoryPaymentSerializer (manual only)
    DELETE /factory-payments/{id}/     → Manual payments only

    IMPORTANT:
        Auto payment records (is_auto=True) are created when a purchase
        has amount_paid_now > 0. They CANNOT be edited or deleted
        through this endpoint. Edit the purchase instead.

        Manual payment records (is_auto=False) can be freely edited
        and deleted. They are standalone payments for factory debt.

    FILTERING:
        ?factory=2
        ?factory_name=addis
        ?date_from=2024-01-01
        ?payment_method=cbe
        ?is_auto=false
        ?min_amount=1000
        ?payment_number=PAY-2024

    SEARCHING:
        ?search=addis  (searches factory name, payment number, notes)

    ORDERING:
        ?ordering=-date           → newest first (default)
        ?ordering=-paid_amount    → largest payment first
    """
    queryset = FactoryPayment.objects.all()
    pagination_class = StandardPagination
    filterset_class = FactoryPaymentFilter
    filter_backends = [DjangoFilterBackend]
    search_fields = ['factory__name', 'payment_number', 'notes', 'reference']
    ordering_fields = ['date', 'paid_amount', 'created_at']
    ordering = ['-date', '-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return FactoryPaymentListSerializer
        return FactoryPaymentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.select_related('factory', 'purchase')

    def perform_update(self, serializer):
        if serializer.instance.is_auto:
            raise ValidationError(
                "Cannot edit auto factory payment. "
                "This payment was created from a purchase. "
                "Edit the purchase instead."
            )
        super().perform_update(serializer)

    def perform_destroy(self, instance):
        if instance.is_auto:
            raise ValidationError(
                "Cannot delete auto factory payment. "
                "This payment was created from a purchase. "
                "Delete the purchase instead, or edit the purchase's amount paid."
            )
        instance.delete()


class GeneralExpenseViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for general expenses (rent, transport, salary, etc.).

    LIST   /expenses/          → GeneralExpenseListSerializer
    GET    /expenses/{id}/     → GeneralExpenseSerializer
    POST   /expenses/          → GeneralExpenseSerializer
    PUT    /expenses/{id}/     → GeneralExpenseSerializer
    PATCH  /expenses/{id}/     → GeneralExpenseSerializer
    DELETE /expenses/{id}/     → Always allowed

    All expense records are manually created. No auto records here.

    FILTERING:
        ?date_from=2024-01-01&date_to=2024-06-30
        ?payment_method=cash
        ?currency=ETB
        ?description=rent
        ?min_amount=500
        ?expense_number=EXP-2024

    SEARCHING:
        ?search=rent  (searches description, notes, expense number)

    ORDERING:
        ?ordering=-date           → newest first (default)
        ?ordering=-amount         → largest expense first
        ?ordering=description
    """
    queryset = GeneralExpense.objects.all()
    pagination_class = StandardPagination
    filterset_class = GeneralExpenseFilter
    filter_backends = [DjangoFilterBackend]
    search_fields = ['description', 'notes', 'expense_number', 'reference']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date', '-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return GeneralExpenseListSerializer
        return GeneralExpenseSerializer
