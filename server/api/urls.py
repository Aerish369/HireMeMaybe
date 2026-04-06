from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register(r'profile', views.ProfileViewSet, basename='profile') #http://127.0.0.1:8000/api/profile/me/\
router.register('jobs', views.JobViewSet, basename='job')
router.register(r'skills', views.SkillViewSet, basename='skills')
router.register(r'categories', views.CategoryViewSet, basename='categories')  

urlpatterns = [
    path('hello/', views.hello),
    # /api/jobs/
    # api/jobs/pk
    # POST /jobs/create/
    # DELETE /api/jobs/12/delete/
    path('jobs/recommended/', views.RecommendedJobsAPIView.as_view(), name='recommended-jobs'),
    path('jobs/<int:job_id>/apply/', views.ApplyJobAPIView.as_view(), name='apply-job'), #POST /jobs/<job_id>/apply/
    
    path('my-applications/', views.MyApplicationsAPIView.as_view(), name='my-applications'),
] + router.urls



