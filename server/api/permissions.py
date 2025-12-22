from rest_framework import permissions

class IsEmployer(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return request.user.is_authenticated and request.user.role == "employer"


class IsEmployee(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "employee"


class IsOwnerOrReadOnly(permissions.BasePermission):
    message = "You can only modify jobs you created."

    def has_object_permission(self, request, view, obj):
        # Safe methods (GET) are always allowed
        if request.method in permissions.SAFE_METHODS:
            return True

        # For PUT/PATCH/DELETE: user must own the job
        return obj.posted_by == request.user