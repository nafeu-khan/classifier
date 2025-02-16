from django.contrib import admin
from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from .views import *


urlpatterns=[
    path('faq/', FaqView.as_view(), name='faq-list'),
    path('faq/<int:pk>/', FaqView.as_view(), name='faq-detail'),
]