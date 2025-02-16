"use client"
import React, { useState } from 'react'
import apiRequest from '../../../../utils/api';
import toast from 'react-hot-toast';
import { getToken } from '../../../../utils/auth';
import { useDispatch } from 'react-redux';
import { fetchAllMenu } from '@/redux/allMenuSlice';

const CommonModel = ({ isModalOpen, setIsModalOpen }) => {
    const token = getToken();
    const dispatch = useDispatch();
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const [formData, setFormData] = useState({ projectname: "", description: "" , max_annotations: "" });
    const [errors, setErrors] = useState({
        projectname: "",
        description: "",
    });
    
    const hendleleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setErrors({
            ...errors,
            [name]: "",
        })
    };  

    const handleSubmit = (e) => {
        e.preventDefault();
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
        }
        apiRequest(process.env.NEXT_PUBLIC_API_ENDPOINT_CREATE_PROJECT, "POST", token, data).then((res) => {
            if (res) {
                dispatch(fetchAllMenu({token}));
                toast.success(res.message);
                setIsModalOpen(false);
                setFormData({ projectname: "", description: "" });
            }
        }).catch((err) => {
            if (err.response) {
                toast.error(err.response.data.error);
            }
        })
        
    };

    return (
        <>
            {
                isModalOpen && (
                    <div className="fixed z-50 inset-0 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity">
                                <div className="absolute inset-0 dark:bg-gray-800 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
                            <div
                                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                                <div className="">
                                    <button onClick={handleCloseModal} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 p-2 border border-gray-300 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                    <form action="" onSubmit={handleSubmit}>
                                        <div className="mb-4">
                                            <label for="projectname" className="block text-gray-700 font-bold mb-2">Project Name:</label>
                                            <input type="text" id="projectname" name="projectname" onChange={hendleleChange} value={formData.name} className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring focus:border-blue-500 border border-gray-500" />
                                            <p className="text-red-500 text-xs italic">{errors.projectname}</p>
                                        </div>
                                        <div className="mb-4">
                                            <label for="description" className="block text-gray-700 font-bold mb-2">Project Description:</label>
                                            <textarea name="description"  onChange={hendleleChange} value={formData.description} className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring focus:border-blue-500 border border-gray-700" rows="4"></textarea>
                                            <p className="text-red-500 text-xs italic">{errors.description}</p>
                                        </div>
                                    </form>
                                </div>
                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                    <span className="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
                                        <button type="button" onClick={handleSubmit}
                                            className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-green-600 text-base leading-6 font-medium text-white shadow-sm hover:bg-green-500 focus:outline-none focus:shadow-outline-green transition ease-in-out duration-150 sm:text-sm sm:leading-5">
                                            Submit
                                        </button>
                                    </span>
                                    <span className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto">
                                        <button type="button" onClick={handleCloseModal}
                                            className="inline-flex justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-base leading-6 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition ease-in-out duration-150 sm:text-sm sm:leading-5">
                                            Cancel
                                        </button>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>



                    //     <div  className="max-w-full relative bg-white rounded-lg shadow-md overflow-hidden ">
                    //     <button onClick={handleCloseModal} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 p-2 border border-gray-300 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                    //         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    //             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    //         </svg>
                    //     </button>
                    //     <div className="p-4 sm:p-6 mt-4">
                    //         <form action="">
                    //             <div className="mb-4">
                    //                 <label for="name" className="block text-gray-700 font-bold mb-2">Project Name:</label>
                    //                 <input type="text" id="name" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500" />
                    //             </div>
                    //             <div className="mb-4">
                    //                 <label for="message" className="block text-gray-700 font-bold mb-2">Project Description:</label>
                    //                 <textarea id="message" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500" rows="4"></textarea>
                    //             </div>

                    //         </form>
                    //     </div>
                    // </div>
                )
            }
        </>
    )
}

export default CommonModel