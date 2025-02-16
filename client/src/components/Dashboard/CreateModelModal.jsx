import React, { useRef, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import {createModel} from "@/redux/createModelSlice"

export default function CreateModelModal({ splitDataset , projectId , subprojectId , onClose , token }) {
  const dispatch = useDispatch()
  const modalRef = useRef(); // Reference for the modal
  const [modelName, setModelName] = useState(''); // State for the model name
  const [modelNameError, setModelNameError] = useState(false); // State for model name error  
  const [epochs, setEpochs] = useState(1); // State for model name error
  const [epochError, setEpochError] = useState(false); // State for model name error

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

  const handleSubmit = () => {
    if (!modelName.trim()) {
      setModelNameError("Model name is required.");
      return;
    }
    const data = { model_name: modelName , epochs: epochs};
    try {
      onClose(); 
      dispatch(createModel({projectId, subprojectId, data, token }))
    } catch (error) {
      toast.error(error.message || 'An error occurred while creating the model.');
      console.error(error);
    }
  };

  // const modeldata = useSelector((state)=>state.modelData.modeldata)
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto z-50">
      <div
        ref={modalRef}
        className="md:w-96 bg-gray-900 rounded overflow-hidden shadow-lg border border-gray-200 dark:bg-gray-800"
      >
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-primary">Create New Model</h2>

          {/* Input for Model Name */}
          <div className="mb-6">
            <label htmlFor="model-name" className="block text-gray-700 font-bold mb-3">
              Model Name
            </label>
            <input
              type="text"
              id="model-name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter model name"
              value={modelName}
              onChange={(e) => setModelName(e.target.value) || setModelNameError("")}
            />
            < p className="text-red-500 text-sm mt-1">{modelNameError}</p>
          </div>
          <div className="mb-6">
            <label htmlFor="model-name" className="block text-gray-700 font-bold mb-3">
              Epochs Number
            </label>
            <input
              type="number"
              min={1}
              id="epochs"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter epochs number"
              value={epochs}
              onChange={(e) => setEpochs(e.target.value) || setEpochError("")}
            />
            {
              epochError &&
              < p className="text-red-500 text-sm mt-1">{epochError}</p>
            }
          </div>

          <div>
            <p className="text-gray-600 text-sm mb-4"> Train Size : {splitDataset.train_set_size}</p>   
            <p className="text-gray-600 text-sm mb-4"> Validation Size : {splitDataset.validation_set_size}</p>   
            <p className="text-gray-600 text-sm mb-4"> Test Size : {splitDataset.test_set_size}</p>   
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onClick={() => handleSubmit()}
            >
              Create Model
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
  );
}
