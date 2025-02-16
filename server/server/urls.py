
from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('auth_app.urls')),
    path('api/process-images/',include('image_preprocess_app.urls')),
    path('api/', include('backend_app.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)