from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.files.base import ContentFile
import cv2
import numpy as np
from zipfile import ZipFile
import os
from io import BytesIO
from .models import ProcessedImage
from backend_app.models import Photo

class ImageProcessingView(APIView):
    def post(self, request, photo_id):
        try:
            photo = Photo.objects.get(id=photo_id)
            image_path = photo.image.path
            image = cv2.imread(image_path)
            import json
            print(request.data)
            operations = request.data.get("operations", "{}")
            if not isinstance(operations, dict):
                operations = json.loads(request.data.get("operations", "{}"))
            print(operations)
            print(operations.get("resize"))

            processed_images = []

            # Resize
            if operations.get("resize"):
                width, height = int(operations["resize"]['width']), int(operations["resize"]["height"])
                print(width, height)
                resized = cv2.resize(image, (width, height))
                processed_images.append((resized, "resize"))

            # Grayscale
            if operations.get("grayscale"):
                grayscale = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                processed_images.append((grayscale, "grayscale"))

            # Augmentation
            if operations.get("augment"):
                if operations["augment"].get("flip_horizontal"):
                    flipped = cv2.flip(image, 1)
                    processed_images.append((flipped, "flip_horizontal"))
                if operations["augment"].get("rotation"):
                    angle = operations["augment"]["rotation"]
                    center = (image.shape[1] // 2, image.shape[0] // 2)
                    matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
                    rotated = cv2.warpAffine(image, matrix, (image.shape[1], image.shape[0]))
                    processed_images.append((rotated, "rotation"))

            # Save processed images
            processed_results = []
            for img, operation in processed_images:
                processed_image = cv2.imencode('.jpg', img)[1].tobytes()
                processed = ProcessedImage.objects.create(
                    photo=photo,
                    processed_image=ContentFile(processed_image, name=f"{operation}_{photo.id}.jpg"),
                    processing_type=operation,
                )
                processed_results.append({
                    "id": processed.id,
                    "operation": operation,
                    "url": processed.processed_image.url,
                })

            return Response({"processed_images": processed_results}, status=status.HTTP_201_CREATED)
        except Photo.DoesNotExist:
            return Response({"error": "Photo not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DownloadProcessedImagesView(APIView):
    def get(self, request, photo_id):
        try:
            photo = Photo.objects.get(id=photo_id)
            processed_images = ProcessedImage.objects.filter(photo=photo)

            if not processed_images.exists():
                return Response({"error": "No processed images found"}, status=status.HTTP_404_NOT_FOUND)

            zip_buffer = BytesIO()
            with ZipFile(zip_buffer, "w") as zip_file:
                for processed in processed_images:
                    file_path = processed.processed_image.path
                    zip_file.write(file_path, os.path.basename(file_path))

            zip_buffer.seek(0)
            response = Response(zip_buffer.read(), content_type="application/zip")
            response["Content-Disposition"] = f"attachment; filename=processed_images_{photo.id}.zip"
            return response
        except Photo.DoesNotExist:
            return Response({"error": "Photo not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
