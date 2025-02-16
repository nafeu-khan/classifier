# backend_app/models.py

from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError
import os
from datetime import datetime

class Project(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    max_annotations = models.PositiveIntegerField(
        default=1, 
        help_text="Maximum number of annotations allowed per photo under this project.",
        blank=True,null=True
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='projects'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
        
    def __str__(self):
        return self.name

class SubProject(models.Model):
    name = models.CharField(max_length=100)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='subprojects')
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subprojects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Photo(models.Model):
    project = models.ForeignKey(
        Project, 
        on_delete=models.CASCADE, 
        related_name='images',
        null=True,
        blank=True
    )
    subproject = models.ForeignKey(
        SubProject, 
        on_delete=models.CASCADE, 
        related_name='images',
        null=True,
        blank=True
    )
    category= models.CharField(max_length=15, blank=True, null=True)

    title = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    label = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
        
    width = models.PositiveIntegerField(blank=True, null=True)
    height = models.PositiveIntegerField(blank=True, null=True)
    horizontal_resolution = models.FloatField(blank=True, null=True)
    vertical_resolution = models.FloatField(blank=True, null=True)
    bit_depth = models.PositiveIntegerField(blank=True, null=True)
    color_representation = models.CharField(max_length=50, blank=True, null=True)
    def project_upload_path(instance, filename):
        if instance.category=='predict':
            return os.path.join('predict', filename)
        project_name = instance.project.name if instance.project else ''
        subproject_name = instance.subproject.name if instance.subproject else ''
        project_name = "".join(c for c in project_name if c.isalnum() or c in (' ', '_', '-')).rstrip()
        # date_path = datetime.now().strftime("%Y/%m/%d")
        return os.path.join('projects', project_name, subproject_name, filename) #date_path,
    image = models.ImageField(upload_to=project_upload_path, max_length=255)
    annotations = models.ManyToManyField('Annotation', related_name='photo_annotations', blank=True)

    def __str__(self):
        return self.title or f"Photo {self.id}"

    def clean(self):
        if (self.project is None and self.subproject is None) or (self.project and self.subproject):
            raise ValidationError('Photo must be associated with either a Project or a SubProject, but not both.')
        if self.project and self.pk:
                    if self.annotations.count() > self.project.max_annotations:
                        raise ValidationError(
                            f"Number of annotations ({self.annotations.count()}) exceeds the project limit of {self.project.max_annotations}."
                        )
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(project__isnull=False, subproject__isnull=True) | 
                    models.Q(project__isnull=True, subproject__isnull=False) |
                    models.Q(project__isnull=True, subproject__isnull=True) 
                ),
                name='photo_project_or_subproject'
            )
        ]

class Annotation(models.Model):
    fieldname = models.CharField(max_length=100)
    value = models.TextField(blank=True, null=True)
    def __str__(self):
        return self.name
    
class ClassificationResult(models.Model):
    photo = models.ForeignKey(
        Photo, 
        on_delete=models.CASCADE, 
        related_name='classification_results'
    )
    predicted_class = models.CharField(max_length=100)
    confidence_score = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
        
    def __str__(self):
        return f"{self.photo.title}: {self.predicted_class} ({self.confidence_score:.2f})"



class ModelPerformance(models.Model):
    subproject = models.ForeignKey(
        SubProject,
        on_delete=models.CASCADE,
        related_name='model_performances'
    )
    name = models.CharField(max_length=100, help_text="Name of the trained model.")
    model_file = models.FileField(upload_to='models/', help_text="Location of the saved model file.")
    training_accuracy = models.FloatField()
    validation_accuracy = models.FloatField()
    test_accuracy = models.FloatField()
    training_loss = models.FloatField()
    validation_loss = models.FloatField()
    test_loss = models.FloatField()
    epochs_trained = models.PositiveIntegerField()
    def model_upload_path(instance, filename):
        return os.path.join('models', str(instance.subproject.id), filename)
    
    learning_curve = models.ImageField(upload_to=model_upload_path, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.subproject.name} ({self.created_at.strftime('%Y-%m-%d')})"
    
    def delete(self, *args, **kwargs):
        if self.model_file:
            if os.path.isfile(self.model_file.path):
                os.remove(self.model_file.path)
        super().delete(*args, **kwargs)

class Predict(models.Model):
    photo = models.ForeignKey(
        Photo,
        on_delete=models.CASCADE,
        related_name='predictions'
    )
    predicted_label = models.CharField(max_length=100)
    confidence_score = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Prediction for {self.photo.title}: {self.predicted_label} ({self.confidence_score:.2f})"

    class Meta:
        ordering = ['-created_at']

