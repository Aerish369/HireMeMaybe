from django.db import models
from django.conf import settings


class Skill(models.Model):
    name = models.CharField(max_length=60, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    phone = models.CharField(max_length=255)
    birth_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=150, blank=True)
    skills = models.ManyToManyField(Skill, related_name='profiles', blank=True)
    experience = models.TextField(blank=True)
    education = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.email

    class Meta:
        ordering = ['user__first_name', 'user__last_name']


class Job(models.Model):
    ACTIVE_STATUS = (
        ("active", "Active"),
        ("inactive", "Inactive"),
    )

    title = models.CharField(max_length=150)
    description = models.TextField()
    company_name = models.CharField(max_length=150)
    location = models.CharField(max_length=150, blank=True)
    required_skills = models.ManyToManyField(Skill, related_name='jobs')
    posted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='posted_jobs'
    )
    is_active = models.CharField(max_length=20, choices=ACTIVE_STATUS, default="active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.title} @ {self.company_name}'

    class Meta:
        ordering = ['-created_at']


class Application(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    cover_letter = models.TextField(blank=True)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('job', 'applicant')

    def __str__(self):
        return f"{self.applicant.email} applied to {self.job.title}"
