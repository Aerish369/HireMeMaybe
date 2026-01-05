from django.contrib import admin
from unfold.admin import ModelAdmin
from . import models


def reset_phone_numbers(modeladmin, request, queryset):
    queryset.update(phone='')
reset_phone_numbers.short_description = "Reset phone numbers of selected profiles"

class ProfileAdmin(ModelAdmin):
    list_display = ('user', 'phone', 'location')
    search_fields = ('user__first_name', 'user__last_name', 'user__email', 'location')
    list_filter = ('skills', 'location')
    ordering = ('user__first_name',)
    actions = [reset_phone_numbers]

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user').prefetch_related('skills')

admin.site.register(models.Profile, ProfileAdmin)


class SkillAdmin(ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    list_filter = ('name',)

admin.site.register(models.Skill, SkillAdmin)


class ApplicationInline(admin.TabularInline):
    model = models.Application
    extra = 1


def mark_jobs_closed(modeladmin, request, queryset):
    queryset.update(status='closed')  # assuming Job model has status field
mark_jobs_closed.short_description = "Mark selected jobs as closed"

class JobAdmin(ModelAdmin):
    list_display = ('title', 'company_name', 'location', 'posted_by', 'created_at')
    search_fields = ('title', 'company_name', 'location', 'required_skills__name')
    list_filter = ('location', 'required_skills__name')
    ordering = ('-created_at',)
    inlines = [ApplicationInline]
    actions = [mark_jobs_closed]

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('posted_by').prefetch_related('required_skills', 'applications')

admin.site.register(models.Job, JobAdmin)


def mark_applications_reviewed(modeladmin, request, queryset):
    queryset.update(status='reviewed')  # assuming Application model has status field
mark_applications_reviewed.short_description = "Mark selected applications as reviewed"

class ApplicationAdmin(ModelAdmin):
    list_display = ('job', 'applicant', 'applied_at')
    search_fields = ('job__title', 'job__company_name', 'applicant__email', 'applicant__first_name', 'applicant__last_name')
    list_filter = ('job__title', 'applicant')
    actions = [mark_applications_reviewed]

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('job', 'applicant')

admin.site.register(models.Application, ApplicationAdmin)
