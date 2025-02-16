from django.contrib import admin
from .models import Faq
# Register your models here.
@admin.register(Faq)
class FaqAdmin(admin.ModelAdmin):
    list_display = ('question', 'answer', 'created_at', 'updated_at')
    search_fields = ('question', 'answer')
    list_filter = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)