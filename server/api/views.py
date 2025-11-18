from django.shortcuts import render
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin, DestroyModelMixin, UpdateModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .models import Profile
from .serializers import ProfileSerializer

@api_view(['GET'])
def hello(request):
    return Response({"message": "Hello from Django API 🚀 YOYO"})

class ProfileViewSet(CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, GenericViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    
    def me(self, request):
        pass