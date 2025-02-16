import { UpdateProject } from '@/redux/allMenuSlice';
import React, { useState } from 'react'
import { useDispatch } from 'react-redux';

export default function MaxAnnotation({projectId , subprojectId , onClose , token}) {

    const [maxAnnotation, setMaxAnnotation] = useState(0);
    const [error, setError] = useState(false);
    const dispatch = useDispatch();


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!maxAnnotation) {
          setError('Max Annotation is required.');
          return;
        } else if (maxAnnotation < 0) {
          setError('Max Annotation must be greater than 0.');
          return;
        }
        try{
            dispatch(UpdateProject({ token , data : { max_annotations : maxAnnotation } , id: projectId }))
            onClose();
        } catch(error){
            console.log(error);
        }
    };

    

  return (
    <>
    <div className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity">
            <div className="absolute inset-0 dark:bg-gray-800 opacity-75"></div>
          </div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="projectname"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Max Annotation:
                  </label>
                  <input
                    type="number"
                    id="max_annotation"
                    name="max_annotation"
                    min={0}
                    onChange={(e) => setMaxAnnotation(e.target.value)}
                    value={maxAnnotation}
                    className="w-full text-gray-700 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring focus:border-blue-500"
                  />
                  {error && (
                    <p className="text-red-500 text-xs italic">{error}</p>
                  )}
                </div>
               
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <span className="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
                    <button
                      type="submit"
                      className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-green-600 text-base leading-6 font-medium text-white shadow-sm hover:bg-green-500 focus:outline-none focus:shadow-outline-green transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                    >
                      Submit
                    </button>
                  </span>
                  <span className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto">
                    <button
                      type="button"
                      onClick={()=>onClose()}
                      className="inline-flex justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-base leading-6 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                    >
                      Cancel
                    </button>
                  </span>
                </div>
              </form>
          </div>
        </div>
      </div>
    </>
  )
}
