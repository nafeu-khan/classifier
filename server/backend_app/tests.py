from unittest.mock import patch
from io import BytesIO
from django.core.files.base import ContentFile
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from backend_app.models import Project, Photo
from auth_app.models import CustomUser
from django.conf import settings
import os

User = CustomUser

class ProjectViewTests(APITestCase):

    def setUp(self):
        print("Setting up test environment...")  # Debug log
        # Create a test user
        self.user = User.objects.create_user(username='testuser', password='password123')

        # Generate JWT token for the user
        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')  # Set authentication token in headers

        # Create a project for the user
        self.project_data = {
            'name': 'Test Project',
            'description': 'Test project description',
        }
        self.project = Project.objects.create(**self.project_data, created_by=self.user)
        print(f"Created project: {self.project}")  # Debug log

        # Create an image file in memory (simulating a real image file)
        image_data = BytesIO(b"test image data")  # Simulating an image file (JPEG, PNG, etc.)
        image_name = "test_image.jpg"
        self.image = ContentFile(image_data.getvalue(), image_name)

        # Save the image to the model instance
        self.photo = Photo.objects.create(
            project=self.project,
            image=self.image,
            title='Test Image',
            description='Test image description'
        )
        print(f"Created photo: {self.photo}")  # Debug log

    def test_get_projects(self):
        print("Testing GET /projects...")  # Debug log
        # Test the GET method for retrieving projects
        url = reverse('project-list')  # URL pattern for listing projects
        response = self.client.get(url)
        print(f"GET /projects response: {response.status_code}, {response.data}")  # Debug log
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['projects']), 1)  # Check that 1 project is returned
        self.assertEqual(response.data['projects'][0]['name'], 'Test Project')

    def test_create_project(self):
        print("Testing POST /projects...")  # Debug log
        # Test the POST method for creating a project
        url = reverse('project-list')  # URL pattern for creating projects
        data = {
            'name': 'New Project',
            'description': 'New project description'
        }
        response = self.client.post(url, data, format='json')
        print(f"POST /projects response: {response.status_code}, {response.data}")  # Debug log
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Project created successfully')
        self.assertTrue(Project.objects.filter(name='New Project').exists())  # Check if the project is created

    def test_update_project(self):
        print("Testing PUT /projects/{id}...")  # Debug log
        # Test the PUT method for updating a project
        url = reverse('project-detail', args=[self.project.id])  # URL pattern for updating a single project
        data = {
            'name': 'Updated Project',
            'description': 'Updated project description'
        }
        response = self.client.put(url, data, format='json')
        print(f"PUT /projects/{self.project.id} response: {response.status_code}, {response.data}")  # Debug log
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.project.refresh_from_db()  # Refresh the project instance
        self.assertEqual(self.project.name, 'Updated Project')  # Check if the project name is updated
        self.assertEqual(self.project.description, 'Updated project description')  # Check if the description is updated

    def test_delete_project(self):
        print("Testing DELETE /projects/{id}...")  # Debug log
        # Test the DELETE method for deleting a project
        url = reverse('project-detail', args=[self.project.id])  # URL pattern for deleting a single project

        # Deleting the project
        response = self.client.delete(url)
        print(f"DELETE /projects/{self.project.id} response: {response.status_code}")  # Debug log
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Check if the project is deleted
        self.assertFalse(Project.objects.filter(id=self.project.id).exists())  # Project should be deleted
        self.assertFalse(Photo.objects.filter(id=self.photo.id).exists())  # Associated images should be deleted
    @patch('os.remove')  # Mock file removal to avoid actual file system interaction
    def test_delete_project_with_images(self, mock_remove):
        print("Testing DELETE /projects/{id} with images...")  # Debug log

        # Create multiple photo instances associated with the project using ContentFile
        photos = []
        expected_paths = []  # To store expected file paths
        for i in range(3):
            image_data = BytesIO(b"test image data")  # Simulating an image file (JPEG, PNG, etc.)
            image_name = f"test_image_{i}.jpg"
            image_file = ContentFile(image_data.getvalue(), image_name)

            # Create the Photo instance
            photo = Photo.objects.create(
                project=self.project,
                image=image_file,  # Using the ContentFile object for the image
                title=f'Test Image {i}',
                description=f'Test image description {i}'
            )
            photos.append(photo)
            expected_paths.append(photo.image.path)  # Store the expected path for verification

        # Test the deletion of the project with image files
        url = reverse('project-detail', args=[self.project.id])  # URL for deleting a project
        response = self.client.delete(url)
        print(f"DELETE /projects/{self.project.id} with images response: {response.status_code}")  # Debug log

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Project.objects.filter(id=self.project.id).exists())  # Ensure the project is deleted
        self.assertFalse(Photo.objects.filter(project=self.project).exists())  # Ensure all images are deleted

        # Verify that the correct number of remove calls were made
        actual_remove_calls = [call[0][0] for call in mock_remove.call_args_list]
        print(f"Expected remove calls: {expected_paths}")
        print(f"Actual remove calls: {actual_remove_calls}")
        print(actual_remove_calls)
        # self.assertEqual(len(actual_remove_calls), len(expected_paths), "Mismatch in the number of os.remove calls.")
        self.assertCountEqual(
            actual_remove_calls, expected_paths,
            "The paths of removed files do not match the expected files."
        )
