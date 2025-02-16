import React from 'react';

export default function PredictResponseModal({ predictImage, onClose }) {
  return (
    <>
      <div className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-4" id="modal-headline">
                Prediction Results
              </h3>

              {/* Display all predictions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {predictImage.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 shadow">
                    <img 
                      src={item.prediction.photo_image_url} 
                      alt={item.prediction.photo_title} 
                      className="w-full h-40 object-cover rounded mb-3"
                    />
                    <div className="text-sm">
                      <p className="font-bold">Title: <span className="text-gray-700"> {item.prediction.photo_title}</span></p>
                      <p className="font-bold">Predicted Label: <span className="text-gray-700"> {item.prediction.predicted_label}</span></p>
                      <p className="font-bold">Confidence Score: <span className="text-gray-700"> {(item.prediction.confidence_score * 100).toFixed(2)}%</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button onClick={onClose} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
