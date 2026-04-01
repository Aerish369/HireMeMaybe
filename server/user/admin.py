from django.contrib import admin

from django.contrib.auth.models import User, Group
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from unfold.admin import ModelAdmin

from . import models


try:
    admin.site.unregister(models.User)
except admin.sites.NotRegistered:
    pass

try:
    admin.site.unregister(Group)
except admin.sites.NotRegistered:
    pass

@admin.register(models.User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    # Adds the sidebar filter panel with role options
    list_filter = BaseUserAdmin.list_filter + ('role',)

    # Show role in the list view (optional but recommended)
    list_display = BaseUserAdmin.list_display + ('role', 'email')

    # Make role editable in the user detail form
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role & Permissions', {'fields': ('role',)}),
    )

    # Also show role when creating a user from admin
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Role', {'fields': ('role',)}),
    )


@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    pass


