import React, { useRef, useEffect } from 'react';

export default function ModelMetricsPage({ modelsArray, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose(); // Call the onClose function when clicking outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto z-50">
        <div
          ref={modalRef}
          className="max-w-xl rounded overflow-hidden shadow-lg bg-white border border-gray-200 dark:bg-gray-800"
        >
          <div className="px-6 py-4">
            <div className="font-bold text-xl mb-2">Model Metrics</div>
            <div className="flex flex-col space-y-4">
              {modelsArray.map((model, index) => (
                <div key={index} className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'>
                  <div>
                    <img src={model.learning_curve} alt="" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-400">
                    <span className="font-bold">Model Name:</span> {model.name}
                  </p>
                  <p className="text-gray-700 dark:text-gray-400">
                    <span className="font-bold">Accuracy:</span> {model.test_accuracy}
                  </p>
                  <p className="text-gray-700 dark:text-gray-400">
                    <span className="font-bold">Loss:</span> {model.test_loss}
                  </p>
                  <p className="text-gray-700 dark:text-gray-400">
                    <span className="font-bold">Training Accuracy:</span> {model.training_accuracy}
                  </p>
                  <p className="text-gray-700 dark:text-gray-400">
                    <span className="font-bold">Training Loss:</span> {model.training_loss}
                  </p>
                  <p className="text-gray-700 dark:text-gray-400">
                    <span className="font-bold">Validation Accuracy:</span> {model.validation_accuracy}
                  </p>
                  <p className="text-gray-700 dark:text-gray-400">
                    <span className="font-bold">Validation Loss:</span> {model.validation_loss}
                  </p>
                </div>
              ))}
            </div>
            <button
            className="mt-4 bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={onClose}
            > Close </button>
          </div>
        </div>
      </div>
    </>
  );
}
