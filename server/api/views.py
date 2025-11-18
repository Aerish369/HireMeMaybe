from django.shortcuts import render
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin, DestroyModelMixin, UpdateModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.decorators import action

from .models import Profile
from .serializers import ProfileSerializer

@api_view(['GET'])
def hello(request):
    return Response({"message": "Hello from Django API 🚀 YOYO"})

class ProfileViewSet(CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, GenericViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    
    @action(detail=False, methods=['GET', 'PUT'])
    def me(self, request): #api/profile/me
        (profile, created) = Profile.objects.get_or_create(user_id=request.user.id)
        if request.method == 'GET':
            serializer = ProfileSerializer(profile)
            return Response(serializer.data)
        elif request.method == 'PUT':
            serializer = ProfileSerializer(profile, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)