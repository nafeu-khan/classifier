# backend_app/serializers.py

from rest_framework import serializers
from .models import *

class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        fields = '__all__'
class PhotoSerializer(serializers.ModelSerializer):
    # image = serializers.SerializerMethodField()
    annotations= AnnotationSerializer(many=True, read_only=True,required=False)
    class Meta:
        model = Photo
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at','annotations']
    # def get_image(self, obj):
    #     request = self.context.get('request')
    #     if obj.image and request:
    #         return request.build_absolute_uri(obj.image.url)
    #     return None

class ClassificationResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassificationResult
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class SubProjectSerializer(serializers.ModelSerializer):
    images = PhotoSerializer(many=True, read_only=True)
    
    class Meta:
        model = SubProject
        fields = "__all__"
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

class ProjectSerializer(serializers.ModelSerializer):
    images = PhotoSerializer(many=True, read_only=True)
    subprojects = SubProjectSerializer(many=True, read_only=True)
    
    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class SplitDatasetSerializer(serializers.Serializer):
    train_ratio = serializers.FloatField(min_value=0.0, max_value=1.0, default=0.7)
    validation_ratio = serializers.FloatField(min_value=0.0, max_value=1.0, default=0.15)
    test_ratio = serializers.FloatField(min_value=0.0, max_value=1.0, default=0.15)
    
    def validate(self, data):
        total = data.get('train_ratio', 0.7) + data.get('validation_ratio', 0.15) + data.get('test_ratio', 0.15)
        if not (0.99 <= total <= 1.01):
            raise serializers.ValidationError("Train, validation, and test ratios must sum up to 1.")
        return data


class TrainModelSerializer(serializers.Serializer):
    model_name = serializers.CharField(max_length=100, default='model.keras')
    epochs = serializers.IntegerField(min_value=1, max_value=100, default=30)


class UploadZipSerializer(serializers.Serializer):
    zip_file = serializers.FileField()

    def validate_zip_file(self, value):
        """
        Validate that the uploaded file is a ZIP archive.
        """
        if not value.name.endswith('.zip'):
            raise serializers.ValidationError("Uploaded file must be a ZIP archive.")
        
        if value.size > 100 * 1024 * 1024:  # 100MB limit
            raise serializers.ValidationError("Uploaded ZIP file is too large (max 100MB).")
        
        return value



class ModelPerformanceSerializer(serializers.ModelSerializer):
    model_file_url = serializers.SerializerMethodField()

    class Meta:
        model = ModelPerformance
        fields = [
            'id','name','model_file_url',
            'training_accuracy','validation_accuracy','test_accuracy',
            'training_loss','validation_loss',
            'test_loss',
            'epochs_trained',
            'created_at',
        ]

    def get_model_file_url(self, obj):
        request = self.context.get('request')
        if obj.model_file and hasattr(obj.model_file, 'url'):
            return request.build_absolute_uri(obj.model_file.url)
        return None
    
class PredictSerializer(serializers.ModelSerializer):
    photo = serializers.PrimaryKeyRelatedField(queryset=Photo.objects.all())
    photo_title = serializers.CharField(source='photo.title', read_only=True)
    photo_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Predict
        fields = [
            'id',
            'photo',
            'photo_title',
            'photo_image_url',
            'predicted_label',
            'confidence_score',
            'created_at',
        ]
    
    def get_photo_image_url(self, obj):
        request = self.context.get('request')
        if obj.photo.image and hasattr(obj.photo.image, 'url'):
            return request.build_absolute_uri(obj.photo.image.url)
        return None

class ModelPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelPerformance
        fields = '__all__'