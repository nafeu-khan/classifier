# backend_app/classification_service.py

import os
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
from django.conf import settings
import pandas as pd

class ClassificationService:
    """
    Service class to handle loading the classification model and performing predictions.
    """
    _model = None
    _model_path = os.path.join(settings.BASE_DIR, 'models', 'best_model.keras')
    _class_indices_path = os.path.join(settings.BASE_DIR, 'models', 'class_indices.csv')
    _class_names = None

    @classmethod
    def load_model(cls):
        """
        Loads the trained model from the specified path if not already loaded.
        """
        if cls._model is None:
            if not os.path.exists(cls._model_path):
                raise FileNotFoundError(f"Model file not found at {cls._model_path}")
            cls._model = load_model(cls._model_path)
            cls.load_class_names()
        return cls._model

    @classmethod
    def load_class_names(cls):
        """
        Loads the class indices mapping from the CSV file.
        """
        if cls._class_names is None:
            if not os.path.exists(cls._class_indices_path):
                raise FileNotFoundError(f"Class indices file not found at {cls._class_indices_path}")
            df = pd.read_csv(cls._class_indices_path)
            # Sort by class_index to maintain order
            df_sorted = df.sort_values('class_index')
            cls._class_names = df_sorted['class_name'].tolist()

    @classmethod
    def preprocess_image(cls, image_path, target_size=(224, 224)):
        """
        Preprocesses the image for model prediction.
        Steps:
            - Open and convert to RGB.
            - Resize to target dimensions.
            - Normalize pixel values.
            - Expand dimensions to match model input.
        """
        try:
            img = Image.open(image_path).convert('RGB')
            img = img.resize(target_size)
            img_array = np.array(img) / 255.0  # Normalize to [0,1]
            img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
            return img_array
        except Exception as e:
            raise ValueError(f"Error processing image {image_path}: {str(e)}")

    @classmethod
    def classify_image(cls, image_path):
        """
        Classifies a single image and returns the predicted class and confidence score.
        Args:
            image_path (str): Path to the image file.
        Returns:
            tuple: (predicted_class (str), confidence_score (float))
        """
        model = cls.load_model()
        processed_image = cls.preprocess_image(image_path)
        predictions = model.predict(processed_image)
        predicted_class_index = np.argmax(predictions, axis=1)[0]
        confidence_score = float(np.max(predictions, axis=1)[0])
        predicted_class = cls._class_names[predicted_class_index]
        return predicted_class, confidence_score
