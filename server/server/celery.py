# server/celery.py

import os
from celery import Celery

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

app = Celery('server')

# Load Celery configuration from Django settings, using a 'CELERY' namespace
app.config_from_object('django.conf:settings', namespace='CELERY')

# Automatically discover tasks from installed apps
app.autodiscover_tasks()
