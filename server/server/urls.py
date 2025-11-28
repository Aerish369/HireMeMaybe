from django.contrib import admin
<<<<<<< HEAD
from django.urls import path
from api.views import hello

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/hello/', hello),
]
=======
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
>>>>>>> origin/main
