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
            # user = UserSerializer(serializer.user).data

            return Response({
                "message": "Login successful",
                # "user": user,
                "access": tokens['access'],
                "refresh": tokens['refresh']
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
