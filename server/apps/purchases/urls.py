from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PurchaseViewSet, PurchaseItemViewSet

router = DefaultRouter()
router.register(r'purchases', PurchaseViewSet, basename='purchase')
router.register(r'purchase-items', PurchaseItemViewSet, basename='purchase-item')

urlpatterns = [
    path('', include(router.urls)),
]
