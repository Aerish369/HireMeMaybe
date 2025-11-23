from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register(r'profile', views.ProfileViewSet, basename='profile') #http://127.0.0.1:8000/api/profile/me/

urlpatterns = [
    path('hello/', views.hello),
    path('jobs/', views.JobListAPIView.as_view(), name='job-list'), # /api/jobs/
    path('jobs/<int:pk>/', views.JobDetailAPIView.as_view(), name='job-detail'), # api/jobs/pk
    path('jobs/create/', views.JobCreateAPIView.as_view(), name='job-create'), # POST /jobs/create/
    path('jobs/<int:job_id>/apply/', views.ApplyJobAPIView.as_view(), name='apply-job'), #POST /jobs/<job_id>/apply/
] + router.urls
