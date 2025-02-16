# backend_app/ml_utils.py

import os
import pandas as pd
from sklearn.model_selection import train_test_split
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras import layers, models
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
from django.conf import settings
from .models import Photo, Project
from image_preprocess_app.models import ProcessedImage


class MLUtils:
    @staticmethod
    def get_data_dataframe(project_id=None):
        """
        Extract image paths and labels from ProcessedImage or Photo models.
        If ProcessedImage exists for a Photo, use the processed image.
        Otherwise, use the original Photo image.
        Optionally filter by project_id.
        """
        data = []
        if project_id:
            photos = Photo.objects.filter(project__id=project_id)
        else:
            photos = Photo.objects.all()

        for photo in photos:
            # Check if there are processed images
            processed_images = photo.processed_images.all()
            if processed_images.exists():
                for processed_image in processed_images:
                    image_path = os.path.join(settings.MEDIA_ROOT, processed_image.processed_image.name)
                    label = photo.label
                    data.append({'image_path': image_path, 'label': label})
            else:
                # Use the original photo image
                image_path = os.path.join(settings.MEDIA_ROOT, photo.image.name)
                label = photo.label
                data.append({'image_path': image_path, 'label': label})

        df = pd.DataFrame(data)
        return df

    @staticmethod
    def split_data(df, test_size=0.2, random_state=42):
        """
        Split the dataframe into training and testing sets.
        """
        train_df, test_df = train_test_split(
            df,
            test_size=test_size,
            stratify=df['label'],
            random_state=random_state
        )
        return train_df, test_df

    @staticmethod
    def create_generators(train_df, val_df, img_height=224, img_width=224, batch_size=32):
        """
        Create ImageDataGenerators for training and validation.
        """
        # Data augmentation for training
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=40,
            width_shift_range=0.2,
            height_shift_range=0.2,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True,
            fill_mode='nearest'
        )

        # No augmentation for validation
        val_datagen = ImageDataGenerator(rescale=1./255)

        # Flow from dataframe
        train_generator = train_datagen.flow_from_dataframe(
            dataframe=train_df,
            x_col='image_path',
            y_col='label',
            target_size=(img_height, img_width),
            batch_size=batch_size,
            class_mode='categorical'
        )

        val_generator = val_datagen.flow_from_dataframe(
            dataframe=val_df,
            x_col='image_path',
            y_col='label',
            target_size=(img_height, img_width),
            batch_size=batch_size,
            class_mode='categorical'
        )

        return train_generator, val_generator

    @staticmethod
    def build_cnn_model(input_shape, num_classes):
        """
        Build a simple CNN model.
        """
        model = models.Sequential([
            layers.Conv2D(32, (3, 3), activation='relu', input_shape=input_shape),
            layers.MaxPooling2D((2, 2)),

            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),

            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),

            layers.Flatten(),
            layers.Dense(512, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(num_classes, activation='softmax')
        ])
        return model

    @staticmethod
    def train_model(train_df, val_df, model_save_path, img_height=224, img_width=224, batch_size=32, epochs=50):
        """
        Train the CNN model using the provided training and validation dataframes.
        Save the best model to the specified path.
        """
        # Create generators
        train_generator, val_generator = MLUtils.create_generators(
            train_df=train_df,
            val_df=val_df,
            img_height=img_height,
            img_width=img_width,
            batch_size=batch_size
        )

        # Get number of classes
        num_classes = len(train_generator.class_indices)

        # Build model
        input_shape = (img_height, img_width, 3)
        model = MLUtils.build_cnn_model(input_shape, num_classes)
        model.summary()

        # Compile model
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )

        # Define callbacks
        checkpoint = ModelCheckpoint(
            filepath=model_save_path,
            save_best_only=True,
            monitor='val_accuracy',
            mode='max',
            verbose=1
        )
        early_stop = EarlyStopping(
            monitor='val_accuracy',
            patience=10,
            restore_best_weights=True,
            verbose=1
        )

        # Train model
        history = model.fit(
            train_generator,
            epochs=epochs,
            validation_data=val_generator,
            callbacks=[checkpoint, early_stop]
        )

        return history

    @staticmethod
    def save_class_indices(train_generator, class_indices_path):
        """
        Save the class indices to a CSV file for later use.
        """
        class_indices = train_generator.class_indices
        # Invert the dictionary to get index to class mapping
        index_to_class = {v: k for k, v in class_indices.items()}
        df = pd.DataFrame(list(index_to_class.items()), columns=['class_index', 'class_name'])
        df.to_csv(class_indices_path, index=False)
        return index_to_class
