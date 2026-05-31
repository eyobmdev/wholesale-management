from django.contrib.auth import authenticate,get_user_model
from rest_framework.views import APIView
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
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from .serializers import ForgotPasswordSerializer, ResetPasswordSerializer



User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        response = Response({
            'success': True,
            'message': 'Account created successfully.',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)

        set_auth_cookies(response, refresh)

        return response


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            request,
            email=serializer.validated_data.get("email"),
            password=serializer.validated_data.get("password")
        )

        if not user:
            raise AuthenticationFailed("Invalid email or password.")

        refresh = RefreshToken.for_user(user)

        response = Response({
            'success': True,
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })

        set_auth_cookies(response, refresh)

        return response


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = (
            request.COOKIES.get('refresh_token') or
            request.data.get('refresh')
        )

        if not refresh_token:
            raise NotAuthenticated("No refresh token provided.")

        try:
            old_refresh = RefreshToken(refresh_token)
            old_refresh.blacklist()

            user = User.objects.get(id=old_refresh['user_id'])
            new_refresh = RefreshToken.for_user(user)

            response = Response({
                'success': True,
                'access':  str(new_refresh.access_token),
            })

            set_auth_cookies(response, new_refresh)

            return response

        except (TokenError, User.DoesNotExist):
            raise AuthenticationFailed("Session expired, please login again.")


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
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

        response.delete_cookie('refresh_token')
        response.delete_cookie('access_token')

        return response


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.get_user()

        # always return success even if email doesn't exist
        # prevents email enumeration attacks
        if user:
            token_generator = PasswordResetTokenGenerator()
            uid   = urlsafe_base64_encode(force_bytes(user.pk))
            token = token_generator.make_token(user)

            reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

            html_message = render_to_string('accounts/reset_password_email.html', {
                'first_name': user.first_name,
                'reset_url':  reset_url,
            })

            send_mail(
                subject='Reset your password',
                message=f'Reset your password: {reset_url}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
            )

        return Response({
            'success': True,
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