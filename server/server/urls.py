from django.contrib import admin
from django.conf.urls.static import static
from django.conf import settings
from django.urls import path, include, re_path
from api import urls

urlpatterns = [
    path('admin/', admin.site.urls),
    re_path(r'^auth/', include('djoser.urls')),
    re_path(r'^auth/', include('djoser.urls.jwt')),
    path('api/', include('api.urls'))
] 

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


#! Auth URLS. 
# Registering Users: http://127.0.0.1:8000/auth/users/
# Logging in user: http://127.0.0.1:8000/auth/jwt/create

# Profile of the logged in user: http://127.0.0.1:8000/api/profile/me/