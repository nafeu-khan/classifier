# from celery import shared_task
# import cv2
# import os
# from django.conf import settings
# from .models import Photo

# @shared_task
# def process_images_task(project_id, resize_width=256, resize_height=256, grayscale=False, augment=False):
#     processed_images_dir = os.path.join(settings.MEDIA_ROOT, f'processed_project_{project_id}')
#     os.makedirs(processed_images_dir, exist_ok=True)

#     images = Photo.objects.filter(project_id=project_id)
#     for image in images:
#         img_path = image.image.path
#         img = cv2.imread(img_path)

#         # Resizing
#         img = cv2.resize(img, (resize_width, resize_height))

#         # Grayscale conversion
#         if grayscale:
#             img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

#         # Augmentation
#         if augment:
#             img = cv2.flip(img, 1)  # Horizontal flip

#         # Save processed image
#         processed_img_path = os.path.join(processed_images_dir, os.path.basename(img_path))
#         cv2.imwrite(processed_img_path, img)

#     return {'processed_dir': processed_images_dir}
