from datetime import timedelta

from django.contrib.auth import authenticate,get_user_model, update_session_auth_hash
from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.exceptions import NotAuthenticated, AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken,TokenError
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .utils import set_auth_cookies
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.conf import settings
from .serializers import ForgotPasswordSerializer, ResetPasswordSerializer, ChangePasswordSerializer
from .utils import send_password_reset_email
import logging


logger = logging.getLogger(__name__)
User = get_user_model()



class RegisterViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    authentication_classes = []

    def create(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        remember_me = serializer.validated_data.get("remember_me", False)

        refresh = RefreshToken.for_user(user)

        # Extend only if remember_me=True
        cookie_age = timedelta(days=30) if remember_me else None

        response = Response({
            "success": True,
            "message": "Account created successfully.",
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

        set_auth_cookies(response, refresh, max_age=cookie_age)
        return response


class LoginViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    authentication_classes = []

    def create(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            request,
            email=serializer.validated_data.get("email"),
            password=serializer.validated_data.get("password")
        )

        if not user:
            raise AuthenticationFailed("Invalid email or password.")

        remember_me = serializer.validated_data.get("remember_me", False)

        refresh = RefreshToken.for_user(user)

        cookie_age = timedelta(days=30) if remember_me else None

        response = Response({
            "success": True,
            "message": "Login successful",
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
        })

        set_auth_cookies(response, refresh, max_age=cookie_age)
        return response


class RefreshTokenViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def create(self, request):
        refresh_token = (
            request.COOKIES.get('refresh_token') or
            request.data.get('refresh')
        )

        if not refresh_token:
            raise NotAuthenticated("No refresh token provided.")

        try:
            # Blacklist old token
            old_refresh = RefreshToken(refresh_token)
            old_refresh.blacklist()

            # Create new refresh token for the user
            user = User.objects.get(id=old_refresh['user_id'])
            new_refresh = RefreshToken.for_user(user)

            response = Response({
                'success': True,
                'access': str(new_refresh.access_token),
            })

            set_auth_cookies(response, new_refresh)
            return response

        except (TokenError, User.DoesNotExist, KeyError):
            raise AuthenticationFailed("Session expired, please login again.")


class LogoutViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request):
        refresh_token = (
            request.COOKIES.get('refresh_token') or
            request.data.get('refresh')
        )

        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except TokenError:
                pass

        response = Response({
            'success': True,
            'message': 'Logged out successfully'
        })

        # Clear cookies
        response.delete_cookie('refresh_token', path='/')
        response.delete_cookie('access_token', path='/')

        return response


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.get_user()

        if user:
            try:
                token_generator = PasswordResetTokenGenerator()
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = token_generator.make_token(user)

                reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

                send_password_reset_email(user, reset_url)

            except Exception as e:
                logger.error("Email failed", exc_info=True)


        return Response({
            'success': True,
            'status_code': 200,
            'message': 'If this email is registered you will receive a reset link shortly.'
        })


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        user.set_password(serializer.validated_data['password'])
        user.save()

        return Response({
            'success': True,
            'message': 'Password reset successfully. Please login.'
        })


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )

        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        # Keep user logged in after password change
        update_session_auth_hash(request, user)

        return Response({
            "success": True,
            "message": "Password successfully changed.",
            "status_code": status.HTTP_200_OK
        }, status=status.HTTP_200_OK)

