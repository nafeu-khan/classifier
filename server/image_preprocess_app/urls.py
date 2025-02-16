
from django.urls import path
from .views import ImageProcessingView, DownloadProcessedImagesView

urlpatterns = [
    path('<int:photo_id>/', ImageProcessingView.as_view(), name='process-images'),
    path('', ImageProcessingView.as_view(), name='process-images'),
    path('download-processed/<int:photo_id>/', DownloadProcessedImagesView.as_view(), name='download-processed'),
]
