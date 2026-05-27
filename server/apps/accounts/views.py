from rest_framework.decorators import action
from rest_framework import viewsets,status
from rest_framework.response import Response
from .serializers import RegisterSerializer,LoginSerializer,UserSerializer



class AuthViewSet(viewsets.ViewSet):

    @action(detail=False,methods=["post"])
    def register(self,request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user_data = UserSerializer(user).data

            return Response({
                "message":"Account successfully created.",
                "user":user_data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            tokens = serializer.validated_data
            refresh_token = tokens['refresh']
            access_token = tokens['access']

            response = Response({
                "message": "Login successful",
                "access": access_token,
            })


            response['X-Refresh-Token'] = refresh_token

            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='Lax',
                max_age=60 * 60 * 24 * 7,
            )

            return response

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
