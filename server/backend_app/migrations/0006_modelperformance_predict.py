# Generated by Django 5.1.4 on 2025-01-06 16:59

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend_app', '0005_photo_category'),
    ]

    operations = [
        migrations.CreateModel(
            name='ModelPerformance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Name of the trained model.', max_length=100)),
                ('model_file', models.FileField(help_text='Location of the saved model file.', upload_to='models/%Y/%m/%d/')),
                ('training_accuracy', models.FloatField()),
                ('validation_accuracy', models.FloatField()),
                ('test_accuracy', models.FloatField()),
                ('training_loss', models.FloatField()),
                ('validation_loss', models.FloatField()),
                ('test_loss', models.FloatField()),
                ('epochs_trained', models.PositiveIntegerField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('subproject', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='model_performances', to='backend_app.subproject')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Predict',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('predicted_label', models.CharField(max_length=100)),
                ('confidence_score', models.FloatField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('photo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='predictions', to='backend_app.photo')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
