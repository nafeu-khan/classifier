from django.db import models

# Create your models here.

class ProcessedImage(models.Model):
    photo = models.ForeignKey('backend_app.Photo', on_delete=models.CASCADE, related_name='processed_images')
    processed_image = models.ImageField(upload_to='processed_images/%Y/%m/%d/')
    processing_type = models.CharField(max_length=50)  # e.g., resize, grayscale
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.processing_type} - {self.photo.title}"
