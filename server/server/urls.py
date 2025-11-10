from django.contrib import admin
from django.conf.urls.static import static
from django.conf import settings
from django.urls import path
from api.views import hello

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/hello/', hello),
] 

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
