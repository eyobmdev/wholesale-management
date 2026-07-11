from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, CustomerOptionViewSet

router = DefaultRouter()
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'customer-options', CustomerOptionViewSet,basename='customer-option')

urlpatterns = [
    path('', include(router.urls)),
]
