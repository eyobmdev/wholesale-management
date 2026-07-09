from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    RegisterViewSet,
    LoginViewSet,
    LogoutViewSet,
    ForgotPasswordView,
    ResetPasswordView,
    ChangePasswordView,
)

router = DefaultRouter()
router.register(r'register', RegisterViewSet, basename='register')
router.register(r'login', LoginViewSet, basename='login')
router.register(r'logout', LogoutViewSet, basename='logout')

urlpatterns = [
    *router.urls,

    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
]