# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import *
from .serializers import *    
from PIL import Image
from PIL.ExifTags import TAGS
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated
import os
from django.conf import settings
from django.db import transaction
from image_preprocess_app.models import ProcessedImage
from rest_framework.views import APIView
from rest_framework import status, permissions
import tensorflow as tf
import numpy as np
import json
from .tasks import train_model_task
from celery.result import AsyncResult
import uuid
from django.utils import timezone
from backend_app.ml_utils import MLUtils
import cv2
from django.core.files.base import ContentFile
import random
import zipfile
import tempfile
from django.core.files import File
import shutil
import logging
import matplotlib
import matplotlib.pyplot as plt
from django.db.models import Q
matplotlib.use("Agg")


class ProjectView(APIView):
    # permission_classes = [IsAuthenticated]
    
    def get(self, request, project_id=None):
        if project_id:
            project = get_object_or_404(Project, pk=project_id, created_by=request.user)
            search_query = request.query_params.get('search', None)
            print(search_query)
            if search_query:
                photos = Photo.objects.filter(
                    Q(project=project)
                ).filter(
                    Q(title__icontains=search_query) |
                    Q(label__icontains=search_query) |
                    Q(annotations__fieldname__icontains=search_query)
                ).distinct()
                
                project_serializer = ProjectSerializer(project, context={'request': request}).data
                project_serializer["images"] = PhotoSerializer(photos, many=True, context={'request': request}).data
                return Response({
                    'project': project_serializer,
                }, status=status.HTTP_200_OK)
            else:
                serializer = ProjectSerializer(project, context={'request': request})
                return Response({'project': serializer.data}, status=status.HTTP_200_OK)
        else:
            projects = Project.objects.filter(created_by=request.user)
            serializer = ProjectSerializer(projects, many=True, context={'request': request})
            return Response({'projects': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ProjectSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response({'message': 'Project created successfully', 'project': serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, project_id):
        project = get_object_or_404(Project, pk=project_id, created_by=request.user)
        serializer = ProjectSerializer(project, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Project updated successfully', 'project': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, project_id):
        project = get_object_or_404(Project, pk=project_id, created_by=request.user)
        try:
            with transaction.atomic():
                subprojects = SubProject.objects.filter(project=project, created_by=request.user)
                for subproject in subprojects:
                    subproject_photos = Photo.objects.filter(subproject=subproject)
                    subproject_image_files = [photo.image.path for photo in subproject_photos if os.path.isfile(photo.image.path)]
                    for file_path in subproject_image_files:
                        os.remove(file_path)
                    subproject_photos.delete()
                    subproject.delete()
                    subproject_folder = os.path.dirname(subproject_image_files[0]) if subproject_image_files else None
                    if subproject_folder and os.path.isdir(subproject_folder):
                        shutil.rmtree(subproject_folder)
                    print("Subproject deleted")
                photos = Photo.objects.filter(project=project)
                image_files = [photo.image.path for photo in photos if os.path.isfile(photo.image.path)]
                for file_path in image_files:
                    os.remove(file_path)
                project_folder = os.path.dirname(image_files[0]) if image_files else None
                if project_folder and os.path.isdir(project_folder):
                    shutil.rmtree(project_folder)
                photos.delete()
                project.delete()
            return Response({'message': 'Project and associated images deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': f'Error deleting project: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ImageView(APIView):
    # permission_classes=[IsAuthenticated]
    
    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id, created_by=request.user)
        search_query = request.query_params.get('search', '')
        sort_by = request.query_params.get('sort_by', '-created_at')
        images = Photo.objects.filter(project=project, title__icontains=search_query).order_by(sort_by)
        serializer = PhotoSerializer(images, many=True, context={'request': request})
        return Response({'images': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id, created_by=request.user)
        images = request.FILES.getlist('files')
        description = request.data.get('description', '')
        label = request.data.get('label', '')


        try:
            created_photos = []  
            for image in images:
                pil_image = Image.open(image)
                title = pil_image.info.get('title', image.name)
                width, height = pil_image.size
                dpi = pil_image.info.get('dpi', (72, 72))
                horizontal_resolution = dpi[0]
                vertical_resolution = dpi[1]
                bit_depth = pil_image.mode
                color_representation = pil_image.info.get('color_space', 'sRGB')
                annotate_name = request.data.get('annotate_name', '')
                annotate_value = request.data.get('annotate_value', '')
                photo = Photo.objects.create(
                    project=project,
                    image=image,
                    title=title,
                    description=description,
                    label=label,
                    width=width,
                    height=height,
                    horizontal_resolution=horizontal_resolution,
                    vertical_resolution=vertical_resolution,
                    bit_depth=24 if bit_depth == 'RGB' else 8,
                    color_representation=color_representation,
                )
                new_annotation = Annotation.objects.create(
                    fieldname=annotate_name,      
                    value=annotate_value     
                )
                photo.annotations.add(new_annotation)
                
                created_photos.append(photo)

            serializer = PhotoSerializer(created_photos, many=True)

            return Response(
                {'message': 'Images uploaded successfully', 'photo': serializer.data},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {'error': f'Error uploading images: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, project_id, image_id):
        photo = get_object_or_404(Photo, pk=image_id, project_id=project_id, project__created_by=request.user)
        serializer = PhotoSerializer(photo, data=request.data, partial=True)
        # new_title = request.data.get('title', photo.title)
        # new_label = request.data.get('label', photo.label)
        # new_annotate= request.data.get('annotate',photo.annotate)
        # photo.title = new_title
        # photo.label = new_label
        # photo.annotate=new_annotate
        # photo.save()
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Image updated successfully', 'photo': serializer.data}, status=status.HTTP_200_OK)

    def delete(self, request, project_id, image_id):
        photo = get_object_or_404(Photo, pk=image_id, project_id=project_id, project__created_by=request.user)
        try:
            if os.path.isfile(photo.image.path):
                os.remove(photo.image.path)
            photo.delete()
            return Response({'message': 'Image deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': f'Error deleting image: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CreateSubProjectView(APIView):
    # permission_classes = [IsAuthenticated]
    
    def post(self, request, project_id):
        original_project = get_object_or_404(Project, pk=project_id, created_by=request.user)
        
        name = request.data.get('name', '')
        description = request.data.get('description', '')
        
        if not name:
            return Response({'error': 'SubProject name is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                subproject = SubProject.objects.create(
                    name=name,
                    description=description,
                    project=original_project,
                    created_by=request.user
                )
                
                original_photos = original_project.images.all()
                copied_photos = []
                
                for photo in original_photos:
                    original_image_path = photo.image.path
                    if not os.path.exists(original_image_path):
                        continue
                    
                    base, ext = os.path.splitext(os.path.basename(original_image_path))
                    new_filename = f"{base}_copy_{uuid.uuid4().hex}{ext}"
                    new_image_relative_path = os.path.join(
                        'projects',
                        timezone.now().strftime('%Y/%m/%d'),
                        new_filename
                    )
                    new_image_full_path = os.path.join(settings.MEDIA_ROOT, new_image_relative_path)
                    
                    os.makedirs(os.path.dirname(new_image_full_path), exist_ok=True)
                    
                    shutil.copy2(original_image_path, new_image_full_path)
                    
                    new_photo = Photo.objects.create(
                        subproject=subproject,
                        image=new_image_relative_path,
                        title=photo.title,
                        description=photo.description,
                        label=photo.label,
                        width=photo.width,
                        height=photo.height,
                        horizontal_resolution=photo.horizontal_resolution,
                        vertical_resolution=photo.vertical_resolution,
                        bit_depth=photo.bit_depth,
                        color_representation=photo.color_representation,
                    )
                    for annotation in photo.annotations.all():
                        new_annotation = Annotation.objects.create(
                            fieldname=annotation.fieldname,  
                            value=annotation.value            
                        )
                        new_photo.annotations.add(new_annotation)
                    
                    copied_photos.append(new_photo)
                
                serializer = SubProjectSerializer(subproject, context={'request': request})
                
                return Response({
                    'message': 'SubProject created successfully',
                    'subproject': serializer.data,
                    'copied_photos_count': len(copied_photos)
                }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Error creating SubProject: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SubProjectView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, project_id=None, subproject_id=None):
        project = get_object_or_404(Project, pk=project_id, created_by=request.user)
        if subproject_id:
            filter_category = request.query_params.get('filter', None)
            subproject = get_object_or_404(
                SubProject, 
                pk=subproject_id, 
                project_id=project_id, 
                created_by=request.user
            )
            search_query = request.query_params.get('search', None)
            print(search_query)
            if search_query:
                photos = Photo.objects.filter(
                    Q(subproject=subproject) 
                ).filter(
                    Q(title__icontains=search_query) |
                    Q(label__icontains=search_query) |
                    Q(annotations__fieldname__icontains=search_query)
                ).distinct()

                subproject_serializer = SubProjectSerializer(subproject,  context={'request': request}).data
                
                subproject_serializer["images"] = PhotoSerializer(photos, many=True, context={'request': request}).data
                return Response({
                    'subproject': subproject_serializer,
                }, status=status.HTTP_200_OK)
            
            if filter_category:
                filtered_images = subproject.images.filter(category=filter_category)
                subproject_data = SubProjectSerializer(subproject, context={'request': request}).data
                subproject_data['images'] = PhotoSerializer(filtered_images, many=True, context={'request': request}).data
                return Response({'subproject': subproject_data}, status=status.HTTP_200_OK)
            
            serializer = SubProjectSerializer(subproject, context={'request': request})
            return Response({'subproject': serializer.data}, status=status.HTTP_200_OK)
        else:
            subprojects = SubProject.objects.filter(project_id=project_id, created_by=request.user)
            serializer = SubProjectSerializer(subprojects, many=True, context={'request': request})
            return Response({'subprojects': serializer.data}, status=status.HTTP_200_OK)
    def put(self, request, project_id=None, subproject_id=None):
        subproject = get_object_or_404(SubProject, id=subproject_id, project_id=project_id, created_by=request.user)
        serializer = SubProjectSerializer(subproject, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'SubProject updated successfully', 'subproject': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, project_id, subproject_id):
        subproject = get_object_or_404(SubProject, id=subproject_id, project_id=project_id, created_by=request.user)
        try:
            with transaction.atomic():
                serialized_subproject = SubProjectSerializer(subproject, context={'request': request}).data

                photos = Photo.objects.filter(subproject=subproject)
                for photo in photos:
                    print(f"Deleting photo: {photo.image.path}")
                image_files = [photo.image.path for photo in photos if os.path.isfile(photo.image.path)]

                print(f"Files to delete of {project_id}/{subproject_id}: {image_files}")

                for file_path in image_files:
                    print(f"Deleting file: {file_path}")
                    os.remove(file_path)

                photos.delete()
                
                subproject.delete()

            return Response({
                'message': 'SubProject and associated images deleted successfully',
                'subproject': serialized_subproject  
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': f'Error deleting SubProject: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PreprocessProjectView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        try:
            project = get_object_or_404(Project, pk=project_id, created_by=request.user)
            subproject_name = request.data.get('name',f'Preprocessed_{project.name}_{uuid.uuid4().hex[:3]}')
            subproject_description = request.data.get('description', '')
            operations = request.data.get('operations', None)

            if not subproject_name:
                return Response({'error': 'SubProject name is required'}, status=status.HTTP_400_BAD_REQUEST)
            with transaction.atomic(savepoint=False):
                try:
                    subproject = SubProject.objects.create(
                        name=subproject_name,
                        description=subproject_description,
                        project=project,
                        created_by=request.user
                    )
                    processed_images = []
                    for photo in project.images.all():
                        image_path = photo.image.path
                        temp_photo = photo
                        if not os.path.exists(image_path): 
                            print(f"imagepath not exist {image_path}")
                            continue
                        image = cv2.imread(image_path)
                        if image is None: 
                            print(f"image not found in {image_path}") 
                            continue

                        processed_images_for_photo = []

                        if operations is not None:
                            if 'resize' in operations:
                                resize_params = operations['resize']
                                width = resize_params.get('width')
                                height = resize_params.get('height')
                                if width and height:
                                    resized = cv2.resize(image, (int(width), int(height)))
                                    processed_images_for_photo.append(('resize', resized))

                            if 'grayscale' in operations:
                                grayscaled = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                                processed_images_for_photo.append(('grayscale', grayscaled))

                            if  operations.get('augment',0):
                                print(operations)
                                augment_params = operations['augment']
                                copies = int(augment_params.get('copies', 1))
                                for _ in range(copies):
                                    print(f"copies: {copies} {_} {augment_params}")
                                    if  _<1 and augment_params.get('flip') :
                                        flipped = cv2.flip(image, 1)
                                        processed_images_for_photo.append(('flip_horizontal', flipped))
                                        flipped = cv2.flip(image, 0)
                                        processed_images_for_photo.append(('flip_vertical', flipped))
                                        flipped = cv2.flip(image, -1)
                                        processed_images_for_photo.append(('flip_both', flipped))
                                    else:break
                                if augment_params.get('rotation',0):
                                    for _ in range(copies):
                                        angle = random.uniform(-180, 180) 
                                        center = (image.shape[1] // 2, image.shape[0] // 2)
                                        matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
                                        rotated = cv2.warpAffine(image, matrix, (image.shape[1], image.shape[0]))
                                        processed_images_for_photo.append(('rotation', rotated))
                                    
                            if 'normalize' in operations:
                                normalize_params = operations['normalize']
                                mean = normalize_params.get('mean', [0, 0, 0])
                                std = normalize_params.get('std', [1, 1, 1])
                                normalized = cv2.normalize(image, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)
                                processed_images_for_photo.append(('normalize', normalized))

                        if not processed_images_for_photo:
                            processed_images_for_photo.append(('original', image))
                        # print(processed_images_for_photo)

                        for operation, processed_image in processed_images_for_photo:
                            # print(operation)
                            is_success, buffer = cv2.imencode('.jpg', processed_image)
                            if not is_success: 
                                print("encode image to byte not success") 
                                continue
                            img_bytes = buffer.tobytes()
                            if processed_image is None:
                                print(f"Processed image for operation {operation} is None, skipping.")
                                continue
                                    
                            img_content = ContentFile(img_bytes, name=f"{operation}_{temp_photo.id}_{uuid.uuid4().hex}.jpg")
                    
                            new_photo = Photo.objects.create(
                                subproject=subproject,
                                image=img_content,
                                title=f"{temp_photo.title}_{operation}" if temp_photo.title else f"Photo_{temp_photo.id}_{operation}",
                                description=f"Processed by {operation}",
                                label=temp_photo.label,  
                                width=processed_image.shape[1],
                                height=processed_image.shape[0],
                                horizontal_resolution=temp_photo.horizontal_resolution,
                                vertical_resolution=temp_photo.vertical_resolution,
                                bit_depth=temp_photo.bit_depth,
                                color_representation=temp_photo.color_representation,
                            )
                
                            processed_images.append({
                                "id": new_photo.id,
                                "operation": operation,
                                "url": new_photo.image.url,
                            })

                    serialized_project = ProjectSerializer(project, context={'request': request}).data
                    return Response({
                        "message": "All images processed and saved under the new SubProject.",
                        "project": serialized_project
                    }, status=status.HTTP_201_CREATED)
                except Exception as e:
                    # transaction.set_rollback(True)
                    print("Transaction rolled back due to an error.",e)
                    return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Project.DoesNotExist:
            return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(str(e))
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PreprocessSubProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request,project_id, subproject_id):
        try:
            subproject = get_object_or_404(SubProject,project_id=project_id, pk=subproject_id, created_by=request.user)

            operations = request.data.get('operations', None)

            if not operations:
                return Response({'error': 'No preprocessing operations provided'}, status=status.HTTP_400_BAD_REQUEST)

            processed_images = []
            project = get_object_or_404(Project, pk=project_id, created_by=request.user)
            subproject_name = request.data.get('name',f'Preprocessed_{project.name}_{uuid.uuid4().hex[:5]}')
            subproject_description = request.data.get('description', '')
            try:
                with transaction.atomic(savepoint=False):
                    new_subproject = SubProject.objects.create(
                        name=subproject_name,
                        description=subproject_description,
                        project=project,
                        created_by=request.user
                    )
                    for photo in subproject.images.all():
                        image_path = photo.image.path
                        if not os.path.exists(image_path): continue

                        image = cv2.imread(image_path)

                        if image is None: continue

                        processed_images_for_photo = []

                        if 'resize' in operations:
                            resize_params = operations['resize']
                            width = resize_params.get('width')
                            height = resize_params.get('height')
                            if width and height:
                                resized = cv2.resize(image, (int(width), int(height)))
                                processed_images_for_photo.append(('resize', resized))

                        if 'grayscale' in operations:
                            grayscale = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                            processed_images_for_photo.append(('grayscale', grayscale))

                        if  operations.get('augment',0):
                            augment_params = operations['augment']
                            copies = augment_params.get('copies', 1)
                            for _ in range(copies):
                                print(f"copies: {copies} {_} {augment_params}")
                                if  _<1 and augment_params.get('flip') :
                                    flipped = cv2.flip(image, 1)
                                    processed_images_for_photo.append(('flip_horizontal', flipped))
                                    flipped = cv2.flip(image, 0)
                                    processed_images_for_photo.append(('flip_vertical', flipped))
                                    flipped = cv2.flip(image, -1)
                                    processed_images_for_photo.append(('flip_both', flipped))
                                else:break
                            if augment_params.get('rotation',0):
                                for _ in range(copies):
                                    angle = random.uniform(-180, 180) 
                                    center = (image.shape[1] // 2, image.shape[0] // 2)
                                    matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
                                    rotated = cv2.warpAffine(image, matrix, (image.shape[1], image.shape[0]))
                                    processed_images_for_photo.append(('rotation', rotated))
                                    
                        if 'normalize' in operations:
                            normalize_params = operations['normalize']
                            mean = normalize_params.get('mean', [0, 0, 0])
                            std = normalize_params.get('std', [1, 1, 1])
                            normalized = image.astype('float32')
                            for i in range(3):  # Assuming BGR
                                normalized[:, :, i] = (normalized[:, :, i] - mean[i]) / std[i]
                            normalized = cv2.normalize(normalized, None, 0, 255, cv2.NORM_MINMAX).astype('uint8')
                            processed_images_for_photo.append(('normalize', normalized))

                        for operation, processed_image in processed_images_for_photo:
                            is_success, buffer = cv2.imencode('.jpg', processed_image)
                            if not is_success:
                                continue
                            img_bytes = buffer.tobytes()
                            if processed_image is None:
                                print(f"Processed image for operation {operation} is None, skipping.")
                                continue
                            img_content = ContentFile(img_bytes, name=f"{operation}_{photo.id}_{uuid.uuid4().hex}.jpg")

                            new_photo = Photo.objects.create(
                                subproject=new_subproject,
                                image=img_content,
                                title=f"{photo.title}_{operation}" if photo.title else f"Photo_{photo.id}_{operation}",
                                description=f"Processed by {operation}",
                                label=photo.label,  
                                width=processed_image.shape[1],
                                height=processed_image.shape[0],
                                horizontal_resolution=photo.horizontal_resolution,
                                vertical_resolution=photo.vertical_resolution,
                                bit_depth=photo.bit_depth,
                                color_representation=photo.color_representation,
                            )
            
                            processed_images.append({
                                "id": new_photo.id,
                                "operation": operation,
                                "url": new_photo.image.url,
                            })
            except Exception as e:
                transaction.set_rollback(True)
                print("Transaction rolled back due to an error.",e)
            return Response({
                "message": "All images in the SubProject have been processed in-place.",
                "processed_images": processed_images,
                "project": ProjectSerializer(project, context={'request': request}).data
            }, status=status.HTTP_200_OK)

        except SubProject.DoesNotExist:
            return Response({"error": "SubProject not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class SplitSubProjectDatasetView(APIView):
    # permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request,project_id, subproject_id):
        serializer = SplitDatasetSerializer(data=request.data)
        if serializer.is_valid():
            train_ratio = serializer.validated_data['train_ratio']
            validation_ratio = serializer.validated_data['validation_ratio']
            test_ratio = serializer.validated_data['test_ratio']
            
            subproject = get_object_or_404(SubProject, pk=subproject_id, project_id=project_id,created_by=request.user)
            photos = list(subproject.images.all())
            total_photos = len(photos)
            
            if total_photos == 0:
                return Response({"error": "No images found in the SubProject."}, status=status.HTTP_400_BAD_REQUEST)
            
            random.shuffle(photos)
            
            train_end = int(train_ratio * total_photos)
            validation_end = train_end + int(validation_ratio * total_photos)
            
            for idx, photo in enumerate(photos):
                if idx < train_end:
                    category = 'train'
                elif idx < validation_end:
                    category = 'validation'
                else:
                    category = 'test'
                photo.category = category
                photo.save()
            
            return Response({
                "message": "Dataset split successfully.",
                "train_set_size": train_end,
                "validation_set_size": validation_end - train_end,
                "test_set_size": total_photos - validation_end
            }, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        


class TrainModelView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, project_id, subproject_id):
        serializer = TrainModelSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        model_name = serializer.validated_data.get('model_name', 'testmodel') + ".keras"
        print("Model Name:", model_name)
        epochs = serializer.validated_data.get('epochs', 15)

        # Get the subproject that belongs to the current user.
        subproject = get_object_or_404(
            SubProject, 
            pk=subproject_id, 
            project_id=project_id, 
            created_by=request.user
        )
        photos = list(subproject.images.filter(category__in=['train', 'validation', 'test']))
        total_photos = len(photos)
        if total_photos == 0:
            return Response({"error": "No images found in the SubProject."}, status=status.HTTP_400_BAD_REQUEST)

        base_dir = os.path.join(settings.MEDIA_ROOT, 'subprojectsSplitted', f"{str(subproject_id)}")
        train_dir = os.path.join(base_dir, 'train')
        validation_dir = os.path.join(base_dir, 'validation')
        test_dir = os.path.join(base_dir, 'test')
        os.makedirs(train_dir, exist_ok=True)
        os.makedirs(validation_dir, exist_ok=True)
        os.makedirs(test_dir, exist_ok=True)

        for directory in [train_dir, validation_dir, test_dir]:
            for filename in os.listdir(directory):
                file_path = os.path.join(directory, filename)
                if os.path.isfile(file_path):
                    os.unlink(file_path)

        for photo in photos:
            label = photo.label.strip().lower() if photo.label else 'unknown'
            if photo.category == 'train':
                target_dir = os.path.join(train_dir, label)
            elif photo.category == 'validation':
                target_dir = os.path.join(validation_dir, label)
            elif photo.category == 'test':
                target_dir = os.path.join(test_dir, label)
            else:
                continue  
            os.makedirs(target_dir, exist_ok=True)
            source_path = photo.image.path
            dest_path = os.path.join(target_dir, os.path.basename(source_path))
            if not os.path.exists(dest_path):
                try:
                    shutil.copy(source_path, dest_path)
                except Exception as e:
                    print(f"Failed to copy {source_path} to {dest_path}: {e}")

        def load_images_from_directory(directory, target_size=(100, 100)):
            x = []
            y = []
            classes = sorted([d for d in os.listdir(directory) if os.path.isdir(os.path.join(directory, d))])
            class_to_index = {cls: idx for idx, cls in enumerate(classes)}
            for cls in classes:
                cls_dir = os.path.join(directory, cls)
                for file in os.listdir(cls_dir):
                    file_path = os.path.join(cls_dir, file)
                    img = cv2.imread(file_path)
                    if img is not None:
                        img = cv2.resize(img, target_size)
                        x.append(img)
                        y.append(class_to_index[cls])
            return np.array(x), np.array(y), class_to_index

        X_train, y_train, class_to_index = load_images_from_directory(train_dir)
        X_val, y_val, _ = load_images_from_directory(validation_dir)
        X_test, y_test, _ = load_images_from_directory(test_dir)

        X_train = X_train / 255.0
        X_val = X_val / 255.0
        X_test = X_test / 255.0

        model = tf.keras.models.Sequential([
            tf.keras.layers.Conv2D(64, (3, 3), activation='relu', input_shape=(100, 100, 3)),
            tf.keras.layers.MaxPooling2D(pool_size=(2, 2)),
            tf.keras.layers.Conv2D(32, (3, 3), activation='relu'),
            tf.keras.layers.MaxPooling2D(pool_size=(2, 2)),
            tf.keras.layers.Conv2D(32, (3, 3), activation='relu'),
            tf.keras.layers.MaxPooling2D(pool_size=(2, 2)),
            tf.keras.layers.Flatten(),
            tf.keras.layers.Dense(2, activation='softmax')  
        ])

        model.compile(
            loss='sparse_categorical_crossentropy', #for multiclass : categoricalcrossentropy  , binay: binary/spare crossentroyp
            optimizer='adam',
            metrics=['accuracy']
        )

        history = model.fit(
            X_train, y_train,
            epochs=epochs,
            validation_data=(X_val, y_val)
        )

        test_loss, test_acc = model.evaluate(X_test, y_test)

        model_dir = os.path.join(settings.MEDIA_ROOT, 'models', f"{str(subproject_id)}")
        os.makedirs(model_dir, exist_ok=True)
        model_path = os.path.join(model_dir, model_name)
        model.save(model_path)

        class_indices_path = os.path.join(model_dir, f'{model_name.split(".")[0]}_class_indices.json')
        with open(class_indices_path, 'w') as f:
            json.dump(class_to_index, f)


        plt.figure(figsize=(10, 5))
        plt.subplot(1, 2, 1)
        plt.plot(history.history['accuracy'], label='Train')
        plt.plot(history.history['val_accuracy'], label='Validation')
        plt.title('Model Accuracy')
        plt.xlabel('Epoch')
        plt.ylabel('Accuracy')
        plt.legend(loc='upper left')

        plt.subplot(1, 2, 2)
        plt.plot(history.history['loss'], label='Train')
        plt.plot(history.history['val_loss'], label='Validation')
        plt.title('Model Loss')
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.legend(loc='upper left')
        learning_curve_path = os.path.join(model_dir, f'{model_name.split(".")[0]}_learning_curve.png')
        plt.savefig(learning_curve_path)
        plt.close()

        with open(learning_curve_path, 'rb') as f:
            learning_curve_file = ContentFile(f.read(), name=os.path.basename(learning_curve_path))

        model_performance = ModelPerformance.objects.create(
            subproject=subproject,
            name=model_name,
            model_file=os.path.join('models', str(subproject_id), model_name),
            training_accuracy=history.history['accuracy'][-1],
            validation_accuracy=history.history['val_accuracy'][-1],
            test_accuracy=test_acc,
            training_loss=history.history['loss'][-1],
            validation_loss=history.history['val_loss'][-1],
            test_loss=test_loss,
            epochs_trained=epochs,
            learning_curve=learning_curve_file
        )
        modelSerializedData = ModelPerformanceSerializer(model_performance).data
        response_data = {
            "model_name": model_name,
            "model_path": os.path.join(settings.MEDIA_URL, 'models', str(subproject_id), model_name),
            "epochs_trained": epochs,
            "training_accuracy": history.history['accuracy'][-1],
            "validation_accuracy": history.history['val_accuracy'][-1],
            "test_accuracy": test_acc,
            "training_loss": history.history['loss'][-1],
            "validation_loss": history.history['val_loss'][-1],
            "test_loss": test_loss,
            "class_indices": class_to_index,
            "learning_curve": modelSerializedData["learning_curve"],
            "model_performance_id": model_performance.id,
            "model_performance_url": request.build_absolute_uri(
                f"/api/projects/{project_id}/subprojects/{subproject_id}/model_performances/{model_performance.id}/"
            )
        }

        return Response({"message": "Model trained successfully", "model_performance": response_data}, status=status.HTTP_200_OK)
    
class PredictView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_id, subproject_id):
        model_name = request.data.get("model_name", "model")
        images_topredict = request.FILES.getlist('images')

        if not images_topredict:
            return Response({"error": "No image uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        subproject = get_object_or_404(
            SubProject, 
            pk=subproject_id, 
            project_id=project_id, 
            created_by=request.user
        )

        model_dir = os.path.join(settings.MEDIA_ROOT, 'models', str(subproject_id))
        model_path = os.path.join(model_dir, model_name)
        class_indices_path = os.path.join(model_dir, f'{model_name.split(".")[0]}_class_indices.json')
        print(model_path)
        if not os.path.exists(model_path):
            return Response({"error": f"{model_name} Model not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if not os.path.exists(class_indices_path):
            return Response({"error": "Class indices mapping not found."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        with open(class_indices_path, 'r') as f:
            class_indices = json.load(f)
        
        index_to_label = {v: k for k, v in class_indices.items()}
        print(index_to_label)
        try:
            model = tf.keras.models.load_model(model_path)
        except Exception as e:
            return Response({"error": f"Failed to load model: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        predictions = []
        for image_file in images_topredict:
            try:
                p_height= request.data.get('height', 100)
                p_width= request.data.get('width', 100)
                image = Image.open(image_file).convert('RGB').resize((p_height, p_width))
                image_array = np.array(image) / 255.0
                image_array = np.expand_dims(image_array, axis=0)  
            except Exception as e:
                print(str(e))
                return Response({"error": f"Failed to process image: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                prediction = model.predict(image_array)
                print(prediction)
                if prediction.shape[-1] == 1:
                    # This block is for sigmoid-based binary classification (output shape: [batch, 1])
                    probability = prediction[0][0]
                    positive_class = None
                    negative_class = None
                    for cls, idx in class_indices.items():
                        if idx == 1:
                            positive_class = cls
                        elif idx == 0:
                            negative_class = cls
                    if positive_class is None or negative_class is None:
                        return Response({"error": "Invalid class indices mapping."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    
                    label = positive_class if probability > 0.5 else negative_class
                    confidence = float(probability) if label == positive_class else float(1 - probability)
                    
                elif prediction.shape[-1] == 2:
                    # This block handles the two-class softmax output (output shape: [batch, 2])
                    # We assume that the model returns [prob_negative, prob_positive]
                    probability = prediction[0][1]  # probability for the positive class
                    positive_class = index_to_label.get(1)
                    negative_class = index_to_label.get(0)
                    if positive_class is None or negative_class is None:
                        return Response({"error": "Invalid class indices mapping."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    
                    label = positive_class if probability > 0.5 else negative_class
                    confidence = probability if label == positive_class else 1 - probability
                    
                else:
                    # Multi-Class Classification for more than 2 classes
                    predicted_index = np.argmax(prediction, axis=1)[0]
                    confidence = float(np.max(prediction, axis=1)[0])
                    label = index_to_label.get(predicted_index, 'unknown')
                    print(label)
               
            except Exception as e:
                print(str(e))
                return Response({"error": f"Failed to make prediction: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            try:
                width, height = image.size
                dpi = image.info.get('dpi', (72, 72))
                horizontal_resolution = dpi[0]
                vertical_resolution = dpi[1]
                bit_depth = image.mode
                color_representation = image.info.get('color_space', 'sRGB')

                if bit_depth == 'RGB':
                    bit_depth_value = 24
                elif bit_depth == 'L':
                    bit_depth_value = 8
                else:
                    bit_depth_value = 8  

                title = image_file.name

                photo = Photo.objects.create(
                    project= None,
                    subproject=None,
                    category='predict',
                    image=image_file,
                    title=title,
                    description='',
                    label='',
                    width=width,
                    height=height,
                    horizontal_resolution=horizontal_resolution,
                    vertical_resolution=vertical_resolution,
                    bit_depth=bit_depth_value,
                    color_representation=color_representation,
                )
            except Exception as e:
                print(str(e))
                return Response({"error": f"Failed to save uploaded image: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            prediction_result = Predict.objects.create(
                photo=photo,
                predicted_label=label,
                confidence_score=confidence
            )
            serializer = PredictSerializer(prediction_result, context={'request': request})
            print(serializer.data,prediction_result)
            predictions.append({
                "image": photo.image.url,
                "prediction": serializer.data
            })
        print(predictions)
        return Response({
            "message": "Prediction successful.",
            "prediction":  predictions
        }, status=status.HTTP_200_OK)
    
logger = logging.getLogger(__name__)

class UploadZipView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_id):
        serializer = UploadZipSerializer(data=request.data)
        if serializer.is_valid():
            zip_file = serializer.validated_data['zip_file']

            project = get_object_or_404(Project, pk=project_id, created_by=request.user)

            # Create a temporary directory to extract the ZIP
            with tempfile.TemporaryDirectory() as temp_dir:
                zip_path = os.path.join(temp_dir, 'uploaded.zip')
                with open(zip_path, 'wb+') as destination:
                    for chunk in zip_file.chunks():
                        destination.write(chunk)

                try:
                    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                        zip_ref.extractall(temp_dir)
                except zipfile.BadZipFile:
                    logger.error(f"Invalid ZIP file uploaded by user {request.user.id}")
                    return Response({"error": "Invalid ZIP file."}, status=status.HTTP_400_BAD_REQUEST)

                extracted_items = os.listdir(temp_dir)
                try:
                    extracted_items.remove('uploaded.zip')
                except ValueError:
                    pass

                if not extracted_items:
                    logger.warning(f"Empty ZIP file uploaded by user {request.user.id}")
                    return Response({"error": "ZIP file is empty."}, status=status.HTTP_400_BAD_REQUEST)

                photos_created = []
                errors = []

                for folder_name in extracted_items:
                    folder_path = os.path.join(temp_dir, folder_name)
                    if not os.path.isdir(folder_path):
                        errors.append(f"Expected a folder named '{folder_name}' but found a file.")
                        logger.warning(f"Non-folder item '{folder_name}' found in ZIP uploaded by user {request.user.id}")
                        continue

                    for file_name in os.listdir(folder_path):
                        file_path = os.path.join(folder_path, file_name)

                        if not file_name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                            errors.append(f"File '{file_name}' in folder '{folder_name}' is not a supported image format.")
                            logger.warning(f"Unsupported file format '{file_name}' in folder '{folder_name}' uploaded by user {request.user.id}")
                            continue

                        try:
                            with Image.open(file_path) as img:
                                img.verify() 

                            with Image.open(file_path) as img:
                                img = img.convert('RGB') 
                                width, height = img.size
                                dpi = img.info.get('dpi', (72, 72))
                                horizontal_resolution = dpi[0]
                                vertical_resolution = dpi[1]
                                bit_depth = img.mode
                                color_representation = img.info.get('color_space', 'sRGB')

                                if bit_depth == 'RGB':
                                    bit_depth_value = 24
                                elif bit_depth == 'L':
                                    bit_depth_value = 8
                                else:
                                    bit_depth_value = 8  

                                title = file_name

                                img_io = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
                                img.save(img_io, format='JPEG')
                                img_io.seek(0)

                                photo = Photo.objects.create(
                                    project=project,
                                    label=folder_name.lower(),
                                    image=File(open(img_io.name, 'rb'), name=file_name),
                                    title=title,
                                    description='', 
                                    width=width,
                                    height=height,
                                    horizontal_resolution=horizontal_resolution,
                                    vertical_resolution=vertical_resolution,
                                    bit_depth=bit_depth_value,
                                    color_representation=color_representation,
                                )
                                photos_created.append({
                                    "id": photo.id,
                                    "title": photo.title,
                                    "label": photo.label,
                                    "image_url": photo.image.url
                                })
                                logger.info(f"Photo '{file_name}' with label '{folder_name.lower()}' uploaded by user {request.user.id}")
                               
                                os.unlink(img_io.name)
                        except (IOError, zipfile.BadZipFile) as e:
                            errors.append(f"File '{file_name}' in folder '{folder_name}' is not a valid image. Error: {str(e)}")
                            logger.error(f"Invalid image '{file_name}' in folder '{folder_name}' uploaded by user {request.user.id}: {str(e)}")
                        except Exception as e:
                            errors.append(f"An error occurred while processing '{file_name}' in folder '{folder_name}': {str(e)}")
                            logger.error(f"Error processing '{file_name}' in folder '{folder_name}' uploaded by user {request.user.id}: {str(e)}")

                response_data = {
                    "photos_created": photos_created,
                    "errors": errors
                }

                if photos_created:
                    return Response(response_data, status=status.HTTP_201_CREATED)
                else:
                    return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
        else:
            logger.warning(f"Invalid serializer data for ZIP upload by user {request.user.id}: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from io import TextIOWrapper
from .utils import validate_csv_file, parse_csv_file, get_photo_by_name

class AnnotationZipView(APIView):
    def post(self, request, project_id=None, subproject_id=None):
        try:
            csv_file = request.FILES['file']
            if not validate_csv_file(csv_file):
                return Response({'error': 'File must be a CSV file.'}, status=400)

            project, subproject = None, None

            if subproject_id:
                subproject = get_object_or_404(SubProject, id=subproject_id)
            elif project_id:
                project = get_object_or_404(Project, id=project_id)

            if project and subproject:
                return Response({'error': 'project_id or subproject_id not found.'}, status=400)

            csv_data = TextIOWrapper(csv_file.file, encoding='utf-8')
            reader = parse_csv_file(csv_data)

            required_fields = {'photo_name', 'fieldname', 'value'}
            if not required_fields.issubset(reader.fieldnames):
                return Response({'error': f'Missing required fields in CSV: {required_fields}'}, status=400)

            annotations_created = []
            missing_file=[]
            with transaction.atomic():
                for row in reader:
                    photo_name = row.get('photo_name')
                    annotation_name = row.get('fieldname')
                    details = row.get('value', '')
                    photo = get_photo_by_name(photo_name, project, subproject)
                    if not photo:
                        missing_file.append(f'Photo with name "{photo_name}" not found.')
                        continue
                    if photo.project and photo.annotations.count() >= photo.project.max_annotations:
                        missing_file.append(f"Photo '{photo.title}' already has the maximum number of annotations ({photo.project.max_annotations}).")
                        raise ValidationError(f"Photo '{photo.title}' already has the maximum number of annotations ({photo.project.max_annotations}).")

                    annotation = Annotation.objects.create(
                        fieldname=annotation_name,
                        value=details
                    )
                    photo.annotations.add(annotation)
                    annotations_created.append(f"{annotation.id}_{photo.title}")

            return Response({
                'message': 'Annotations added successfully.',
                'annotations_created': annotations_created,
                "missing_file":missing_file
            })

        except KeyError:
            return Response({'error': 'Missing file or required parameters.'}, status=400)
        except ValidationError as e:
            return Response({'error': str(e)}, status=400)
        except Exception as e:
            return Response({'error': f'An unexpected error occurred: {str(e)}'}, status=500)

class CreateAnnotationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self,request,project_id, image_id):
        try:
            name = request.data.get('fieldname')
            details = request.data.get('value')
            print(name,details)
            if not name:   return Response({'error': 'Name is required.'}, status=400)

            photo = get_object_or_404(Photo, pk=image_id)
            if photo.project and photo.annotations.count() >= photo.project.max_annotations:
                raise ValidationError(f"Photo '{photo.title}' already has the maximum number of annotations ({photo.project.max_annotations}).")

            annotation = Annotation.objects.create(
                fieldname=name,
                value=details
            )
            photo.annotations.add(annotation)
            return Response({
                'message': 'Annotation created successfully.',
                "anotation_data": {
                'id': annotation.id,
                'fieldname': annotation.fieldname,
                'value': annotation.value,
                'photo': photo.id,
                'project': photo.project.id if photo.project else photo.subproject.project.id
            }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error":str(e)})    
    def put(self, request, project_id, image_id, annotate_id):
        annotation = get_object_or_404(Annotation, pk=annotate_id)
        serializer = AnnotationSerializer(annotation, data=request.data)
        if serializer.is_valid():
            updated_annotation = serializer.save()
            updated_serializer = AnnotationSerializer(updated_annotation)
            updated_data = updated_serializer.data
            updated_data['project'] = project_id
            return Response({
                'message': 'Annotation updated successfully.',
                'updated_annotation': updated_data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, project_id, image_id, annotate_id):
            annotation = get_object_or_404(Annotation, pk=annotate_id)            
            annotation_data = AnnotationSerializer(annotation).data  
            annotation_data['project'] = project_id        
            annotation.delete()
            return Response({
                'message': 'Annotation deleted successfully.',
                'deleted_annotation': annotation_data
            }, status=status.HTTP_200_OK)
class ModelPerformanceBySubProjectView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, project_id, subproject_id,model_id=None):
        if model_id:
            performances = ModelPerformance.objects.get(pk=model_id,subproject_id=subproject_id, subproject__created_by=request.user)
            serializer = ModelPerformanceSerializer(performances.first(), context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        performances = ModelPerformance.objects.filter(subproject_id=subproject_id, subproject__created_by=request.user)
        serializer = ModelPerformanceSerializer(performances, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


 



















