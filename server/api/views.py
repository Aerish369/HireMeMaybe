from django.shortcuts import render, get_object_or_404
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin, DestroyModelMixin, UpdateModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework import status, permissions, generics
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from .models import Profile, Application, Job, Skill
from .permissions import IsEmployer, IsEmployee, IsOwnerOrReadOnly, IsJobOwner
from .serializers import ProfileSerializer, ApplicationCreateSerializer, ApplicationSerializer, JobSerializer, JobCreateSerializer,MyApplicationSerializer, SkillSerializer

@api_view(['GET'])
def hello(request):
    return Response({"message": "Hello from Django API 🚀 YOYO"})


class SkillViewSet(ReadOnlyModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Disable pagination for skills

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
    search_fields = ['title', 'company_name', 'location']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """Different permissions for different actions."""
        if self.action == 'applications':
            return [IsEmployer(), IsJobOwner()]
    
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsEmployer(), IsOwnerOrReadOnly()]  # ONLY Employer

        # list + retrieve → open
        return [permissions.IsAuthenticatedOrReadOnly()]

    def get_serializer_class(self):
        """Returns JobCreateSerializer for POST/create, and JobSerializer for all other actions."""
        if self.action == 'create' or 'update' or 'partial_update':
            return JobCreateSerializer
        return JobSerializer

    def perform_create(self, serializer):
        """Saves the job listing and sets the posted_by field to the current user."""
        # This will use JobCreateSerializer based on get_serializer_class()
        # The save() method calls create() on the serializer
        serializer.save(posted_by=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}
    
    @action(
        detail=True,
        methods=['get'],
        url_path='applications',
    )
    def applications(self, request, pk=None):
        """
        View all applications for a specific job.
        Only the employer who posted the job can access this.
        """
        job = self.get_object()  # triggers object-level permission check

        applications = Application.objects.filter(job=job).order_by('-applied_at')
        serializer = ApplicationSerializer(applications, many=True)

        return Response(serializer.data)



class ApplyJobAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsEmployee]
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
    
#! New View for "My Applications"
class MyApplicationsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsEmployee]

    def get(self, request):
        user = request.user
        applications = Application.objects.filter(applicant=user).order_by('-applied_at')
        serializer = MyApplicationSerializer(applications, many=True)
        return Response(serializer.data)