"""
URL patterns for inventory app.
StockBatch is read-only. Custom actions: summary, available, low-stock.

URLs:
    GET  /stock/              → list all stock batches
    GET  /stock/{id}/         → single batch detail
    GET  /stock/summary/      → aggregated stock by item_code
    GET  /stock/available/    → batches with remaining stock (for sales form)
    GET  /stock/low-stock/    → batches that are low stock or sold out (dashboard)
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StockBatchViewSet, StockBatchOptionViewSet

router = DefaultRouter()
router.register(r'stock', StockBatchViewSet, basename='stock')
router.register(r'stock-options', StockBatchOptionViewSet, basename='stock-option')

urlpatterns = [
    path('', include(router.urls)),
]
