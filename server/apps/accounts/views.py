from django.contrib.auth import authenticate,get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.exceptions import NotAuthenticated, AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken,TokenError
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .utils import set_auth_cookies


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

