from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FactoryViewSet, FactoryOptionViewSet

router = DefaultRouter()
router.register(r'factories', FactoryViewSet, basename='factory')
router.register(r'factory-options', FactoryOptionViewSet, basename='factory-options')

urlpatterns = [
    path('', include(router.urls)),
]
