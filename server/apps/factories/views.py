from django_filters.rest_framework.backends import DjangoFilterBackend
from django.db.models import Q
from rest_framework import viewsets,filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


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
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
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


class FactoryOptionViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        queryset = Factory.objects.all().order_by('name')

        # Search support 
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)

        options = [
            {
                "value": factory.id,
                "label": factory.name
            }
            for factory in queryset
        ]

        return Response(options)
