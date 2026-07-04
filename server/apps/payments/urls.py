from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomerIncomeViewSet,
    FactoryPaymentViewSet,
    GeneralExpenseViewSet,
)

router = DefaultRouter()
router.register(r'income', CustomerIncomeViewSet, basename='customer-income')
router.register(r'factory-payments', FactoryPaymentViewSet, basename='factory-payment')
router.register(r'expenses', GeneralExpenseViewSet, basename='general-expense')

urlpatterns = [
    path('', include(router.urls)),
]
