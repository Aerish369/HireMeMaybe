from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register(r'profile', views.ProfileViewSet, basename='profile') #http://127.0.0.1:8000/api/profile/me/

urlpatterns = [
    path('hello/', views.hello),
    path('job/create/', views.JobCreateAPIView.as_view(), name='job-create'), # POST /jobs/create/
    path('job/<int:job_id>/apply/', views.ApplyJobAPIView.as_view(), name='apply-job'), #POST /jobs/<job_id>/apply/
] + router.urls
