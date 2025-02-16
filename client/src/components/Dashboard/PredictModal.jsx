import React, { useRef, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { predictImage } from '@/redux/predictImageSlice';

export default function PredictModal({ projectId, subprojectId, token, onClose }) {
  const dispatch = useDispatch();
  const modalRef = useRef(); // Reference for the modal
  const [modelName, setModelName] = useState(''); // State for the model name
  const [uploadedImages, setUploadedImages] = useState([]); // State for uploaded images
  const model_list = useSelector((state) => state.allModel.allModel);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose(); // Close the modal
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleImageUpload = (files) => {
    const fileArray = Array.from(files);
    setUploadedImages((prev) => [...prev, ...fileArray]);
  };

  const handleSubmit = async () => {
    if (!modelName.trim()) {
      toast.error('Model name cannot be empty!');
      return;
    }
    if (uploadedImages.length === 0) {
      toast.error('Please upload at least one image!');
      return;
    }

    const formData = new FormData();
    formData.append('model_name', modelName);

    // Append each image
    uploadedImages.forEach((image, index) => {
      formData.append(`images`, image);  // Append all images under the key "images"
    });

    try {
      onClose(); // Close the modal
      await dispatch(predictImage({ projectId, subprojectId, token, formData }));
    } catch (error) {
      console.error('Error during submission:', error);
      toast.error(error.response?.data?.error || 'Failed to create model.');
    }
  };


  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto z-50">
        <div
          ref={modalRef}
          className="md:w-1/2 bg-gray-900 rounded overflow-hidden shadow-lg border border-gray-200 dark:bg-gray-800"
        >
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-primary">Predict Image</h2>

            {/* Input for Model Name */}
            <div className="mb-6">
              <label htmlFor="model-name" className="block text-gray-700 font-bold mb-3">
                Model Name
              </label>
              <select
                id="model-name"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              >
                <option value="">Select a model</option>
                {model_list && model_list.map((model) => (
                  <option key={model.id} value={model.name}>
                    {model.name} - Training Acc: {model.training_accuracy.toFixed(2)} | Validation Acc: {model.validation_accuracy.toFixed(2)}
                  </option>
                ))}
              </select>

            </div>

            {/* Upload Images Field */}
            <div className="mb-6">
              <label htmlFor="upload-images" className="block text-gray-700 font-bold mb-3">
                Upload Images
              </label>
              <input
                type="file"
                id="upload-images"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
              />
              <p className="text-gray-600 text-sm mt-2">
                You can upload multiple images (JPG, PNG, etc.).
              </p>
            </div>

            {/* Uploaded Images Preview */}
            <div className="mb-6">
              <h3 className="text-gray-700 font-bold mb-3">Uploaded Images:</h3>
              <div className="grid md:grid-cols-6 gap-2">
                {uploadedImages.map((image, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(image)}
                    alt={`Uploaded ${index + 1}`}
                    className="h-20 w-20 object-cover rounded border border-gray-300"
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end gap-4">
              <button
                className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                onClick={handleSubmit}
              >
                Create Model & Predict
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-6 py-3 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
