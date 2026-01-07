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
    pass

@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    pass


