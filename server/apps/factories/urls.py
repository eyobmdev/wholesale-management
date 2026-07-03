from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FactoryViewSet

router = DefaultRouter()
router.register(r'factories', FactoryViewSet, basename='factory')

urlpatterns = [
    path('', include(router.urls)),
]
