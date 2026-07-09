from django_filters.rest_framework.backends import DjangoFilterBackend
from rest_framework import viewsets,filters

from .models import Customer
from .serializers import (
    CustomerListSerializer,
    CustomerDetailSerializer,
    CustomerCreateUpdateSerializer,
)
from .filters import CustomerFilter
from ..core.pagination import StandardPagination


class CustomerViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for customers.

    LIST   /customers/          → CustomerListSerializer (summary + balance fields)
    GET    /customers/{id}/     → CustomerDetailSerializer (full detail)
    POST   /customers/          → CustomerCreateUpdateSerializer
    PUT    /customers/{id}/     → CustomerCreateUpdateSerializer
    PATCH  /customers/{id}/     → CustomerCreateUpdateSerializer
    DELETE /customers/{id}/     → Soft delete (sets is_active=False)

    FILTERING:
        ?name=kebede
        ?phone=0911
        ?location=merkato
        ?is_active=true
        ?initial_credit_currency=ETB
        ?opening_date_from=2024-01-01
        ?opening_date_to=2024-06-30
        ?has_debt=true

    SEARCHING:
        ?search=kebede  (searches name, phone, location)

    ORDERING:
        ?ordering=name          → A-Z by name
        ?ordering=-name         → Z-A by name
        ?ordering=opening_date  → oldest first
        ?ordering=-opening_date → newest first
        ?ordering=initial_credit
    """
    queryset = Customer.objects.all()
    pagination_class = StandardPagination
    filterset_class = CustomerFilter
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    search_fields = ['name', 'phone', 'location']
    ordering_fields = ['name', 'opening_date', 'initial_credit', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        if self.action == 'list':
            return CustomerListSerializer
        if self.action == 'retrieve':
            return CustomerDetailSerializer
        # create, update, partial_update
        return CustomerCreateUpdateSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        if self.action == 'list':
            qs = qs.prefetch_related('sales', 'income_records')
        elif self.action == 'retrieve':
            qs = qs.prefetch_related('sales', 'income_records')

        return qs

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=['is_active', 'updated_at'])
