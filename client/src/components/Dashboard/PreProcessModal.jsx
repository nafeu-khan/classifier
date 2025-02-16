import React, { useEffect, useRef, useState } from 'react';
import apiRequest from '../../../utils/api';
import { useDispatch } from 'react-redux';
import { fetchAllMenu , PreProcessData } from '@/redux/allMenuSlice';

export default function PreProcessModal({projectId , subprojectId , onClose, token }) {
    const dispatch = useDispatch();
    const [formdata, setformdata] = useState({
        resize: {
            height: "",
            width: "",
        },
        grayscale: false,
        flip: false,
        rotate: false,
        copies: "",
        standardization: false,
    });
    const [resize, setResize] = useState(false);
    const [augmentation, setAugmentation] = useState(false);
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleSubmit = async () => {
        const requestData = {
            operations: {},
        };

        if (resize) {
            requestData.operations.resize = {
                width: parseInt(formdata.resize.width, 10),
                height: parseInt(formdata.resize.height, 10),
            };
        }

        if (formdata.grayscale) {
            requestData.operations.grayscale = true;
        }

        if (augmentation) {
            requestData.operations.augment = {};
            if (formdata.flip) {
                requestData.operations.augment.flip = true;
            }
            if (formdata.rotate) {
                requestData.operations.augment.rotation = true;
            }
            if (formdata.copies) {
                requestData.operations.augment.copies = parseInt(formdata.copies, 10);
            }
        }

        if (formdata.standardization) {
            requestData.operations.standardization = true;
        }

        console.log(requestData);

        try {
            console.log(requestData);
            dispatch(PreProcessData({projectId , subprojectId , data: requestData , token}));
            onClose();

        } catch (error) {
            console.error("Error submitting form data:", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto z-50">
            <div
                ref={modalRef}
                className="max-w-xl  rounded overflow-hidden shadow-lg bg-white border border-gray-200 dark:bg-gray-800"
            >

                <div className='px-6 py-4'>
                    <h1 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                        Edit Label
                    </h1>
                    <div className='flex items-center px-4 py-1'>
                        <input type="checkbox" value={resize} onChange={() => setResize(!resize)} />
                        <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Resize
                        </label>
                        {resize && (
                            <div className='flex items-center px-4 py-1'>
                                <div className='flex items-center px-4 py-1'>
                                    <label className="mx-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                        Width:
                                    </label>
                                    <input
                                        type="number"
                                        className='w-24 rounded px-2 py-1'
                                        value={formdata.resize.width}
                                        onChange={(e) => setformdata({ ...formdata, resize: { ...formdata.resize, width: e.target.value } })}
                                    />
                                </div>
                                <div>
                                    <label className="mx-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                        Height:
                                    </label>
                                    <input
                                        type="number"
                                        className='w-24 rounded px-2 py-1'
                                        value={formdata.resize.height}
                                        onChange={(e) => setformdata({ ...formdata, resize: { ...formdata.resize, height: e.target.value } })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className='flex items-center px-4 py-1'>
                        <input
                            type="checkbox"
                            value={formdata.grayscale}
                            onChange={() => setformdata({ ...formdata, grayscale: !formdata.grayscale })}
                        />
                        <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Convert to Grayscale
                        </label>
                    </div>
                    <div className=' items-center px-4 py-1'>
                        <input type="checkbox" value={augmentation} onChange={() => setAugmentation(!augmentation)} />
                        <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Augmentation
                        </label>
                        {augmentation && (
                            <div className='flex items-center px-4 py-1'>
                                <div className='flex items-center px-4 py-1'>
                                    <label className="text-sm font-medium text-gray-900 dark:text-gray-300">
                                        Flip:
                                    </label>
                                    <input
                                        type="checkbox"
                                        className='w-10 rounded px-2 py-1'
                                        value={formdata.flip}
                                        onChange={(e) => setformdata({ ...formdata, flip: e.target.value })}
                                    />
                                </div>
                                <div className='flex items-center'>
                                    <label className="mx-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                        Rotate:
                                    </label>
                                    <input
                                        type="checkbox"
                                        className='w-10 rounded '
                                        value={formdata.rotate}
                                        onChange={(e) => setformdata({ ...formdata, rotate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="mx-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                        Number of Copies:
                                    </label>
                                    <input
                                        type="number"
                                        className='w-24 rounded px-2 py-1'
                                        value={formdata.copies}
                                        onChange={(e) => setformdata({ ...formdata, copies: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className='flex items-center px-4 py-1'>
                        <input
                            type="checkbox"
                            checked={formdata.standardization}
                            onChange={(e) =>
                                setformdata({ ...formdata, standardization: e.target.checked })
                            }
                        />
                        <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Standardization
                        </label>
                    </div>
                </div>

                

                <div className='px-6 py-4 flex gap-2'>
                    <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={onClose}>
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}
