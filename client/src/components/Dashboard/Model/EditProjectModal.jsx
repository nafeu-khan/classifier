"use client";
import React, { useEffect, useState } from "react";
import apiRequest from "../../../../utils/api";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { fetchAllMenu, UpdateProject } from "@/redux/allMenuSlice";

const EditProjectModal = ({ editProjectData, token, isEditProject, setIsEditProject }) => {
  const dispatch = useDispatch();
  
  // State for form data
  const [formData, setFormData] = useState({
    projectname: editProjectData?.name || "",
    description: editProjectData?.description || "",
  });

  // State for errors
  const [errors, setErrors] = useState({
    projectname: "",
    description: "",
  });

  // Sync form data with editProjectData when it changes
  useEffect(() => {
    if (editProjectData) {
      setFormData({
        projectname: editProjectData.name || "",
        description: editProjectData.description || "",
      });
    }
  }, [editProjectData]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.projectname || !formData.description) {
      setErrors({
        projectname: !formData.projectname ? "Project Name is required" : "",
        description: !formData.description ? "Description is required" : "",
      });
      return;
    }

    const data = {
      name: formData.projectname,
      description: formData.description,
    };

    try {
        dispatch(UpdateProject({ token , data , id: editProjectData.id }));
        setIsEditProject(false);
        setFormData({ projectname: "", description: "" });
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.error || "Something went wrong.");
      }
    }
  };

  return (
    isEditProject && (
      <div className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity">
            <div className="absolute inset-0 dark:bg-gray-800 opacity-75"></div>
          </div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div>
              <button
                onClick={() => setIsEditProject(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 p-2 border border-gray-300 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="projectname"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Project Name:
                  </label>
                  <input
                    type="text"
                    id="projectname"
                    name="projectname"
                    onChange={handleInputChange}
                    value={formData.projectname}
                    className="w-full text-gray-700 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring focus:border-blue-500"
                  />
                  {errors.projectname && (
                    <p className="text-red-500 text-xs italic">{errors.projectname}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Project Description:
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    onChange={handleInputChange}
                    value={formData.description}
                    className="w-full text-gray-700 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring focus:border-blue-500"
                    rows="4"
                  ></textarea>
                  {errors.description && (
                    <p className="text-red-500 text-xs italic">{errors.description}</p>
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
                      onClick={() => setIsEditProject(false)}
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
      </div>
    )
  );
};

export default EditProjectModal;
