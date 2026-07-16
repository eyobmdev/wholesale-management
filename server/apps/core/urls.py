from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppSettingViewSet, PaymentMethodOptionViewSet
from .public_views import PublicDocumentView

router = DefaultRouter()
router.register(r'settings', AppSettingViewSet, basename='app-setting')
router.register(r'payment-method-options', PaymentMethodOptionViewSet, basename='payment-method-options')

urlpatterns = [
    path('', include(router.urls)),
    path('public/documents/<str:token>/', PublicDocumentView.as_view(), name='public-document'),
]