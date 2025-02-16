# backend_app/tasks.py

from celery import shared_task
from .ml_utils import MLUtils
from django.conf import settings
import os
import pandas as pd
import logging
@shared_task(bind=True)
def train_model_task(self, project_id=None):
    """
    Celery task to train the CNN model.
    Args:
        project_id (int, optional): ID of the project to train on. If None, trains on all projects.
    Returns:
        dict: Status of the training process.
    """
    logger = logging.getLogger(__name__)
    try:
        # Step 1: Extract Data
        logger.info(f"Task received. Project ID: {project_id}")
        df = MLUtils.get_data_dataframe(project_id=project_id)
        logger.info(f"Task processing for project {project_id} in progress...")
        if df.empty:
            return {'status': 'failed', 'message': 'No data available for training.'}

        # Step 2: Split Data
        train_df, test_df = MLUtils.split_data(df, test_size=0.2)
        logger.info(f"Data split into training: {len(train_df)} and testing: {len(test_df)}")
        # Step 3: Define Paths
        model_save_path = os.path.join(settings.BASE_DIR, 'models', 'best_model.h5')
        class_indices_path = os.path.join(settings.BASE_DIR, 'models', 'class_indices.csv')
        logger.info(f"Model will be saved to: {model_save_path}")
        # Step 4: Train Model
        MLUtils.train_model(
            train_df=train_df,
            val_df=test_df,  # Using test_df as validation for simplicity
            model_save_path=model_save_path,
            img_height=224,
            img_width=224,
            batch_size=32,
            epochs=50
        )
        logger
        # Step 5: Save Class Indices
        # Recreate generators for class indices
        train_generator, _ = MLUtils.create_generators(
            train_df=train_df,
            val_df=test_df,
            img_height=224,
            img_width=224,
            batch_size=32
        )
        logger.info(f"Saving class indices to: {class_indices_path}")
        MLUtils.save_class_indices(train_generator, class_indices_path)

        return {'status': 'completed', 'message': 'Model trained successfully.'}

    except Exception as e:
        logger.error(f"Task failed for project {project_id}: {e}")
        return {'status': 'failed', 'message': str(e)}
