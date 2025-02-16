# backend_app/urls.py
from django.contrib import admin
from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from .views import *
from django.urls import path
from .views import ProjectView, ImageView, CreateSubProjectView, SubProjectView

urlpatterns = [
    # Project Endpoints
    path('projects/', ProjectView.as_view(), name='project-list-create'),
    path('projects/<int:project_id>/', ProjectView.as_view(), name='project-detail'),
    
    # Image Endpoints
    path('projects/<int:project_id>/images/', ImageView.as_view(), name='project-images'),
    path('projects/<int:project_id>/images/<int:image_id>/', ImageView.as_view(), name='project-image-detail'),
    path('projects/<int:project_id>/images/<int:image_id>/annotate/', CreateAnnotationView.as_view(), name='project-image-detail'),
    path('projects/<int:project_id>/images/<int:image_id>/annotate/<int:annotate_id>/', CreateAnnotationView.as_view(), name='project-image-detail'),
    
    # SubProject Endpoints
    path('projects/<int:project_id>/create_subproject/', CreateSubProjectView.as_view(), name='create-subproject'),
    path('projects/<int:project_id>/subprojects/', SubProjectView.as_view(), name='subproject-detail'),
    path('projects/<int:project_id>/subprojects/<int:subproject_id>/', SubProjectView.as_view(), name='subproject-detail'),

    # Preprocess Images Endpoint
    path('projects/<int:project_id>/preprocess/', PreprocessProjectView.as_view(), name='preprocess-project'),

    # Preprocess Images Endpoint for SubProjects
    path('projects/<int:project_id>/subprojects/<int:subproject_id>/preprocess/', PreprocessSubProjectView.as_view(), name='preprocess-subproject'),

    # Split Dataset Endpoint
    path('projects/<int:project_id>/subprojects/<int:subproject_id>/split_dataset/', SplitSubProjectDatasetView.as_view(), name='split-subproject-dataset'),
    # New Training Endpoint
    path('projects/<int:project_id>/subprojects/<int:subproject_id>/train_model/', TrainModelView.as_view(), name='train-model'),

  # Prediction Endpoint
    path(
        'projects/<int:project_id>/subprojects/<int:subproject_id>/models/predict/', 
        PredictView.as_view(), 
        name='model-predict'
    ),
    path('projects/<int:project_id>/subprojects/<int:subproject_id>/models/', ModelPerformanceBySubProjectView.as_view(), name='performance-by-subproject'),
    # Upload ZIP Endpoint
    path(
        'projects/<int:project_id>/upload_zip/', 
        UploadZipView.as_view(), 
        name='upload-zip'
    ),
    # Upload ZIP Endpoint for SubProjects
    path(
        'projects/<int:project_id>/subprojects/<int:subproject_id>/annotate_zip/', 
        AnnotationZipView.as_view(), 
        name='upload-zip'
    ),
    path(
        'projects/<int:project_id>/annotate_zip/', 
        AnnotationZipView.as_view(), 
        name='upload-zip'
    ),
    #model performance
    path('projects/<int:project_id>/subprojects/<int:subproject_id>/model_performances/', ModelPerformanceBySubProjectView.as_view(), name='performance-by-subproject'),
    path('projects/<int:project_id>/subprojects/<int:subproject_id>/model_performances/<int:model_id>/', ModelPerformanceBySubProjectView.as_view(), name='performance-by-subproject'),

]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


# urlpatterns = [
#     path('projects/', ProjectView.as_view(), name='project-list'),  
#     path('projects/<int:pk>/', ProjectView.as_view(), name='project-detail'), 

#     path('projects/<int:project_id>/images/', ImageView.as_view(), name='project-images'), 
#     path('projects/<int:project_id>/images/<int:image_id>/', ImageView.as_view(), name='project-image-detail'),


#     path('projects/<int:project_id>/train-model/', TrainModelView.as_view(), name='train-model'),
#     path('projects/<int:project_id>/train-status/<str:task_id>/', TrainingStatusView.as_view(), name='train-status'),
#     path('projects/<int:project_id>/training-results/', FetchTrainingResultsView.as_view(), name='training-results'),
    
#     path('projects/<int:project_id>/images/<int:image_id>/classify/', SingleImageClassificationView.as_view(), name='single-image-classify'),
#     path('projects/<int:project_id>/classify/', BatchImageClassificationView.as_view(), name='batch-classify'),
#     path('projects/<int:project_id>/classifications/', FetchClassificationResultsView.as_view(), name='fetch-classifications'),
# ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
