from django_filters.rest_framework.backends import DjangoFilterBackend
from rest_framework import viewsets

from .models import Factory
from .serializers import (
    FactoryListSerializer,
    FactoryDetailSerializer,
    FactoryCreateUpdateSerializer,
)
from .filters import FactoryFilter
from ..core.pagination import StandardPagination


class FactoryViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for factories/suppliers.

    LIST   /factories/          → FactoryListSerializer (summary + balance)
    GET    /factories/{id}/     → FactoryDetailSerializer (full detail)
    POST   /factories/          → FactoryCreateUpdateSerializer
    PUT    /factories/{id}/     → FactoryCreateUpdateSerializer
    PATCH  /factories/{id}/     → FactoryCreateUpdateSerializer
    DELETE /factories/{id}/     → Soft delete (sets is_active=False)

    FILTERING:
        ?name=addis
        ?phone=0911
        ?location=bole
        ?is_active=true
        ?initial_balance_currency=ETB
        ?has_balance=true

    SEARCHING:
        ?search=addis  (searches name, phone, location)

    ORDERING:
        ?ordering=name
        ?ordering=-initial_balance
        ?ordering=-created_at
    """
    queryset = Factory.objects.all()
    pagination_class = StandardPagination
    filterset_class = FactoryFilter
    filter_backends = [DjangoFilterBackend]
    search_fields = ['name', 'phone', 'location']
    ordering_fields = ['name', 'initial_balance', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return FactoryListSerializer
        if self.action == 'retrieve':
            return FactoryDetailSerializer
        return FactoryCreateUpdateSerializer

    def get_queryset(self):
        """Optimize queries with prefetch_related for balance calculations."""
        qs = super().get_queryset()

        if self.action in ('list', 'retrieve'):
            qs = qs.prefetch_related('purchases', 'payment_records')

        return qs

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=['is_active', 'updated_at'])
