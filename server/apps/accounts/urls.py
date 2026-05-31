from django.urls import path
from .views import RegisterView, LoginView,ForgotPasswordView,ResetPasswordView,ChangePasswordView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/',LoginView.as_view(),name='auth_login'),
    path('forgot-password/', ForgotPasswordView.as_view()),
    path('reset-password/',  ResetPasswordView.as_view()),
    path('change-password/', ChangePasswordView.as_view())
]