from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .utils import set_auth_cookies


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
            'accessToken': str(refresh.access_token),
            'refreshToken': str(refresh)
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
            'user':    UserSerializer(user).data,
            'access':  str(refresh.access_token),
        })

        set_auth_cookies(response, refresh)

        return response

