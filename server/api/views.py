from django.shortcuts import render, get_object_or_404
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin, DestroyModelMixin, UpdateModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework import status, permissions, generics
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.viewsets import ModelViewSet

from .models import Profile, Application, Job
from .serializers import ProfileSerializer, ApplicationCreateSerializer, ApplicationSerializer, JobSerializer, JobCreateSerializer

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



class JobViewSet(ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    search_fields = ['title', 'company_name', 'location']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Returns JobCreateSerializer for POST/create, and JobSerializer for all other actions."""
        if self.action == 'create':
            return JobCreateSerializer
        return JobSerializer

    def perform_create(self, serializer):
        """Saves the job listing and sets the posted_by field to the current user."""
        # This will use JobCreateSerializer based on get_serializer_class()
        # The save() method calls create() on the serializer
        serializer.save(posted_by=self.request.user)
    
    def get_queryset(self):
        """
        Restricts the queryset only for the 'destroy' action 
        to ensure users can only delete their own job listings.
        """
        if self.action == 'destroy':
            # Only allow deletion if the job was posted by the requesting user
            return Job.objects.filter(posted_by=self.request.user)
        
        # For all other actions (list, retrieve, update), use the base queryset
        return super().get_queryset()
    
    def get_serializer_context(self):
        return {'request': self.request}



class ApplyJobAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser] 
    serializer_class = ApplicationCreateSerializer

    def get(self, request, job_id):
        """Enables the HTML form for the POST method."""
        # Return an empty response. The BrowsableAPIRenderer uses 
        # `serializer_class` to generate the form fields.
        return Response(status=status.HTTP_200_OK)

    def post(self, request, job_id):
        job = get_object_or_404(Job, id=job_id)

        # prevent duplicate applications
        if Application.objects.filter(job=job, applicant=request.user).exists():
            return Response(
                {"detail": "You already applied to this job."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ApplicationCreateSerializer(
            data=request.data,
            context={"request": request, "job": job}
        )

        if serializer.is_valid():
            application = serializer.save()
            return Response(
                ApplicationSerializer(application).data,
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)