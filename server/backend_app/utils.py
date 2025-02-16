import csv
from django.core.exceptions import ValidationError
from .models import Photo

def validate_csv_file(file):
    return file.name.endswith('.csv')

def parse_csv_file(csv_data):
    return csv.DictReader(csv_data)

def get_photo_by_name(photo_name, project=None, subproject=None):
    if project:
        photo_query = Photo.objects.filter(project=project,image__icontains=photo_name)
    elif subproject:
        photo_query = Photo.objects.filter(subproject=subproject ,image__icontains=photo_name)
    return photo_query.first()
