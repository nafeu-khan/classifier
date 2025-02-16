import React, { useEffect, useRef, useState } from 'react';
import apiRequest from '../../../utils/api';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { createSplitDataset } from '../../redux/SplitDataSetSlice';

export default function SplitDataSetModal({projectId, subprojectId, onClose , token }) {
  console.log(projectId, subprojectId)
  const modalRef = useRef(); // Reference for the modal
  const [testRatio, setTestRatio] = useState(30); // Default Test ratio
  const [trainRatio, setTrainRatio] = useState(100 - testRatio); // Default Train ratio
  const [validationRatio, setValidationRatio] = useState(100 - testRatio - trainRatio); // Default Validation ratio
  const dispatch = useDispatch()
  useEffect(() => {
    // Handle clicks outside the modal
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose(); // Close the modal if clicked outside
      }
    };

    // Add event listener for clicks
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Clean up the event listener
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose ]);

  const handleTrainChange = (trainValue) => {
    const train = Number(trainValue);
    setTrainRatio(train);
    setValidationRatio(100 - testRatio - train);
  };

  const handleSubmit = () => {
    if (projectId && subprojectId) {
      const data = {
        test_ratio: testRatio / 100,
        train_ratio: trainRatio / 100,
        validation_ratio: validationRatio / 100,
      };
      console.log(projectId, subprojectId)

     dispatch(createSplitDataset({projectId, subprojectId, data, token}));
     onClose();
    }
  };
  

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto z-50">
        <div
          ref={modalRef}
          className="md:w-96 bg-gray-900 rounded overflow-hidden shadow-lg border border-gray-200 dark:bg-gray-800"
        >
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-primary">Split Dataset</h2>

            {/* Test Ratio Slider */}
            <div className="mb-6">
              <label htmlFor="test-range" className="block text-gray-700 font-bold mb-3">
                Test Ratio
              </label>
              <input
                type="range"
                id="test-range"
                className="w-full accent-primary"
                min="0"
                max="100"
                value={testRatio}
                onChange={(e) => setTestRatio(Number(e.target.value))}
              />
              <div className="text-gray-700 mt-2">
                <span className="font-bold">Test:</span> {testRatio}%
              </div>
            </div>

            {/* Train Ratio Slider */}
            <div className="mb-6">
              <label htmlFor="train-range" className="block text-gray-700 font-bold mb-3">
                Train Ratio (Max: {100 - testRatio}%)
              </label>
              <input
                type="range"
                id="train-range"
                className="w-full accent-primary"
                min="0"
                max={100 - testRatio}
                value={trainRatio}
                onChange={(e) => handleTrainChange(e.target.value)}
              />
              <div className="text-gray-700 mt-2">
                <span className="font-bold">Train:</span> {trainRatio}%
              </div>
            </div>

            {/* Validation Ratio (Auto Calculated) */}
            <div className="mb-6">
              <div className="text-gray-700 mt-2">
                <span className="font-bold">Validation Ratio:</span> {validationRatio}%
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button
                className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                onClick={handleSubmit}
              >
                Apply
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-6 py-3 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                onClick={() => {
                  setTestRatio(30);
                  setTrainRatio(100 - testRatio);
                  setValidationRatio(100 - testRatio - trainRatio);
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>      
    </>
  );
}
