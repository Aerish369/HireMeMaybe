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
from django.db.models import Q

from .models import Profile, Application, Job, Skill, Category
from .permissions import IsEmployer, IsEmployee, IsOwnerOrReadOnly, IsJobOwner
from .serializers import ProfileSerializer, ApplicationCreateSerializer, ApplicationSerializer, JobSerializer, JobCreateSerializer,MyApplicationSerializer, SkillSerializer, CategorySerializer
from .pagination import JobPagination


@api_view(['GET'])
def hello(request):
    return Response({"message": "Hello from Django API 🚀"})


class SkillViewSet(ReadOnlyModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None 


class CategoryViewSet(ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None


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
    # queryset = Job.objects.all()
    search_fields = ['title', 'company_name', 'location']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    pagination_class = JobPagination

    def get_queryset(self):
        # Guard: request may not exist during schema generation or admin introspection
        if not self.request:
            return Job.objects.none()

        user = self.request.user

        # Home page (list) — active jobs only for EVERYONE including employers
        if self.action == 'list':
            if self.action == 'list':
                queryset = Job.objects.filter(is_active=True)

                category_param = self.request.query_params.get('category')
                if category_param == 'none':          # "Not Specified" category
                    queryset = queryset.filter(category__isnull=True)
                elif category_param:                  # specific category id
                    queryset = queryset.filter(category__id=category_param)

                return queryset

        # Write actions + applications — unrestricted (permissions handle access control)
        if self.action in ['update', 'partial_update', 'destroy', 'applications']:
            return Job.objects.all()

        # retrieve — employers can see active jobs + their own inactive jobs
        if (
            self.action == 'retrieve'
            and user.is_authenticated
            and hasattr(user, 'role')        # guard against user not having role attr
            and user.role == 'employer'
        ):
            return Job.objects.filter(
                Q(is_active=True) | Q(posted_by=user)
            )

        # retrieve — everyone else only sees active jobs
        return Job.objects.filter(is_active=True)

    def get_permissions(self):
        """Different permissions for different actions."""
        if self.action == 'applications':
            return [IsEmployer(), IsJobOwner()]
    
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'my_jobs']:
            return [IsEmployer(), IsOwnerOrReadOnly()]  # ONLY Employer

        # list + retrieve → open
        return [permissions.IsAuthenticatedOrReadOnly()]

    def get_serializer_class(self):
        """Returns JobCreateSerializer for POST/create, and JobSerializer for all other actions."""
        if self.action in ['create', 'update', 'partial_update']:
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
    
    @action(detail=False, methods=['get'], url_path='my-jobs')
    def my_jobs(self, request):
        """Returns all jobs posted by the logged-in employer — active and inactive."""
        jobs = Job.objects.filter(posted_by=request.user).order_by('-created_at')
        serializer = JobSerializer(jobs, many=True, context={'request': request})
        return Response(serializer.data)



class RecommendedJobsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsEmployee]

    def get(self, request):
        user = request.user

        # Guard: employee must have a profile
        try:
            profile = user.profile
        except Profile.DoesNotExist:
            return Response(
                {"detail": "Complete your profile to get recommendations."},
                status=status.HTTP_400_BAD_REQUEST
            )

        employee_skills = set(profile.skills.values_list('id', flat=True))
        employee_location = profile.location.strip().lower()

        active_jobs = Job.objects.filter(is_active=True).prefetch_related('required_skills')

        scored_jobs = []

        for job in active_jobs:
            score = 0

            # --- Skills Score (60 points) ---
            job_skills = set(job.required_skills.values_list('id', flat=True))

            if job_skills:
                matched_skills = employee_skills & job_skills
                # proportion of job's required skills the employee covers
                skill_score = (len(matched_skills) / len(job_skills)) * 60
            else:
                skill_score = 0

            score += skill_score

            # --- Location Score (40 points) ---
            job_location = job.location.strip().lower()

            if employee_location and job_location and employee_location == job_location:
                score += 40

            # Only include jobs with at least some match
            if score > 0:
                scored_jobs.append((job, round(score, 2)))

        # Sort by score descending
        scored_jobs.sort(key=lambda x: x[1], reverse=True)

        # Serialize — reuse JobSerializer, inject score into response
        result = []
        for job, score in scored_jobs:
            serialized = JobSerializer(job, context={'request': request}).data
            serialized['match_score'] = score
            result.append(serialized)

        return Response(result)


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