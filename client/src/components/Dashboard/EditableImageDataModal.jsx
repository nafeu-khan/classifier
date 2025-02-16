import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faClose } from "@fortawesome/free-solid-svg-icons";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Swal from "sweetalert2";
import apiRequest from "../../../utils/api";
import { useDispatch, useSelector } from "react-redux";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { deleteImage, fetchImages, updateImage, updateImageData  } from "@/redux/imageSlice";
import { addAnnotation , deleteAnnotation , updateAnnotation } from "@/redux/allMenuSlice";

function EditableImageDataModal({ projectId, subprojectId, editImage, onClose, token }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [isEditingAnnotate, setIsEditingAnnotate] = useState(false);
    const [editAnnotate, setEditAnnotate] = useState(editImage.annotate);
    const [editLabel, setEditLabel] = useState(editImage.label);
    const [editTitle, setEditTitle] = useState(editImage.title);
    const [anotationForm, setAnotationForm] = useState({name: "", details: "" , annotation_id: "" , photo_id : editImage.id});
    const [addNewAnotation, setAddNewAnotation] = useState(false);
    const modalRef = useRef(null);
    const textareaRef = useRef(null); // Create a ref for the textarea
    const labelref = useRef(null);
    const annotateref = useRef(null);
    const dispatch = useDispatch();
    const searchQuery = useSelector((state) => state.search.searchQuery);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Delete!',
            text: 'Do you want to continue?',
            icon: 'error',
            showCancelButton: true, // Show the cancel button
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true // Optional: Makes the Cancel button appear first
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(deleteImage({ projectId, id, token }));
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your image has been deleted.',
                    icon: 'success',
                    confirmButtonText: 'Okay'
                });
                onClose(); // Close the modal or perform any other action


            } else if (result.isDismissed) {
                Swal.fire({
                    title: 'Cancelled',
                    text: 'Your image is safe!',
                    icon: 'info',
                    confirmButtonText: 'Okay'
                });
            }
        });
    };


    const toggleEdit = () => setIsEditing(!isEditing);
    const toggleEditLabel = () => setIsEditingLabel(!isEditingLabel);
    const toggleEditAnnotate = () => setIsEditingAnnotate(!isEditingAnnotate);

    const handleTitleChange = (e) => {
        setEditTitle(e.target.value);
        e.target.style.height = "auto"; // Reset the height
        e.target.style.height = `${e.target.scrollHeight}px`; // Set the height to the scroll height
    };

    const handleLabelChange = (e) => {
        setEditLabel(e.target.value);
        e.target.style.height = "auto"; // Reset the height
        e.target.style.height = `${e.target.scrollHeight}px`; // Set the height to the scroll height
    };

    const handleAnnotateChange = (e) => {
        setEditAnnotate(e.target.value);
        e.target.style.height = "auto"; // Reset the height
        e.target.style.height = `${e.target.scrollHeight}px`; // Set the height to the scroll height
    };

    const handleSave = async (id) => {
        const data = {
            title: editTitle,
            label: editLabel,
            annotate: editAnnotate,
        };

        try {
            dispatch(updateImageData({ projectId, subprojectId, id, data, token }));
            onClose();
        } catch (error) {
            console.error("Error saving data:", error.response?.data || error.message); // Logs errors if any
        }
    };


    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
        if (isEditingLabel && labelref.current) {
            labelref.current.style.height = "auto";
            labelref.current.style.height = `${labelref.current.scrollHeight}px`;
        }
        if (isEditingAnnotate && annotateref.current) {
            annotateref.current.style.height = "auto";
            annotateref.current.style.height = `${annotateref.current.scrollHeight}px`;
        }
    }, [isEditing, editTitle, isEditingLabel, editLabel, isEditingAnnotate, editAnnotate]);

    const handleAddNewAnotation = async (id) => {
        const data = {
            fieldname: anotationForm.name,
            value: anotationForm.details
        };
        try {
            if (!anotationForm.id){
                dispatch(addAnnotation({ projectId, imageId: editImage.id, data, token }));
            } else {
                const data  = {
                    fieldname: anotationForm.name,
                    value: anotationForm.details,
                    photo : editImage.id

                };
                dispatch(updateAnnotation({ projectId, imageId: anotationForm.photo_id, annotationId: anotationForm.id, data, token }));
            }
            setAddNewAnotation(false);
            onClose();
            setAnotationForm({
                name: "",
                details: ""
            });
        } catch (error) {
            console.error("Error saving data:", error.response?.data || error.message); // Logs errors if any
        }

    };



    const handleDeleteAnnotation = async (item) => {
        console.log(item);
        Swal.fire({
            title: 'Delete!',
            text: 'Do you want to continue?',
            icon: 'error',
            showCancelButton: true, // Show the cancel button
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true // Optional: Makes the Cancel button appear first
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(deleteAnnotation({ projectId, imageId: item.photo, annotationId : item.id, token }));
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your image has been deleted.',
                    icon: 'success',
                    confirmButtonText: 'Okay'
                });
                onClose(); // Close the modal or perform any other action
            } else if (result.isDismissed) {
                Swal.fire({
                    title: 'Cancelled',
                    text: 'Your image is safe!',
                    icon: 'info',
                    confirmButtonText: 'Okay'
                });
                onClose();
            }
        })
    };

    const handleEditAnnotation = async (id) => {
        console.log(id);
        setAddNewAnotation(true);
        anotationForm.name = id.fieldname;
        anotationForm.details = id.value;
        anotationForm.id = id.id;
    };
    

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70  flex items-center justify-center overflow-auto z-50">
            <div
                ref={modalRef}
                className="w-[500px] bg-gray-900 rounded overflow-hidden shadow-lg bg-white border border-gray-200 dark:bg-gray-800 "
            >
                <div className="relative w-full h-[300px]"> {/* Adjust height as needed */}
                    <img
                        className="w-full h-full object-fill " // Ensures the image covers both width and height
                        src={editImage.image}
                        alt="Sunset in the mountains"
                    />
                    <p className="absolute bottom-2 right-2 text-sm text-gray-600 flex items-center">
                        <span>{editImage.horizontal_resolution}</span>
                        <span> X </span>
                        <span>{editImage.vertical_resolution}</span>
                    </p>
                </div>


                <div className="px-6 py-4">
                    <div className="flex items-center">
                        {isEditing ? (
                            <textarea
                                ref={textareaRef} // Attach the ref here
                                value={editTitle}
                                onChange={handleTitleChange}
                                className="block w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer resize-none overflow-hidden"
                                rows={1} // Initial row count to 1
                            />
                        ) : (
                            <div className="w-full"> {/* or another width class */}
                                <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white break-words whitespace-normal">
                                    {editTitle}
                                    <button
                                        onClick={toggleEdit}
                                        className="px-2 py-1 ml-4 text-sm text-green-500 rounded-full border border-green-500"
                                    >
                                        {isEditing ? <FontAwesomeIcon icon={faFloppyDisk} /> : <FontAwesomeIcon icon={faEdit} />}
                                    </button>
                                </h5>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center mb-1 text-gray-700 text-base">
                        {isEditingLabel ? (
                            <textarea
                                ref={labelref} // Attach the ref here
                                value={editLabel}
                                onChange={handleLabelChange}
                                placeholder="please add annotation"
                                className="block w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300  appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer resize-none overflow-hidden"
                                rows={1} // Initial row count to 1
                            />
                        ) : (
                            <h5 className="mb-2 text-sm  text-black dark:text-white">
                                {
                                    editLabel ? (
                                        <span className="font-bold">Label : </span>
                                    ) : null
                                }
                                {editLabel}
                                {
                                    editLabel && (
                                        <button
                                            onClick={toggleEditLabel}
                                            className="px-2 py-1 ml-4 text-sm text-green-500 rounded-full border border-green-500"
                                        >
                                            {isEditingLabel ? <FontAwesomeIcon icon={faFloppyDisk} /> : <FontAwesomeIcon icon={faEdit} />}
                                        </button>
                                    )
                                }
                            </h5>
                        )}
                    </div>
                    {
                      !addNewAnotation &&  editImage?.annotations.length > 0 && (
                    <div className=" mb-4 text-gray-700 text-base w-full">
                        <h1 className="mb-2 text-sm font-bold text-black dark:text-white">Annotation </h1>
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 border">
                            {/* Table Header */}
                            <thead className="bg-gray-200 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-black dark:text-white">Name</th>
                                    <th className="px-4 py-2 text-black dark:text-white">Details</th>
                                    <th className="px-4 py-2 text-black dark:text-white flex items-center justify-center">Action</th>
                                </tr>
                            </thead>
                            {/* Table Body */}
                            <tbody>
                                {editImage.annotations.map((item, index) => (
                                    <tr
                                        key={index}
                                        className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"
                                            } dark:bg-gray-800 border-b `}
                                    >
                                        <td className="px-4 py-2 text-black dark:text-white">
                                            {item.fieldname}
                                        </td>
                                        <td className="px-4 py-2 text-black dark:text-white">
                                            {item.value}
                                        </td>
                                        <td className="px-4 py-2 text-black dark:text-white flex items-center justify-center gap-2">
                                            <MdDeleteForever onClick={() => handleDeleteAnnotation(item)} className="hover:cursor-pointer hover:text-red-500" />
                                            <FaEdit onClick={() => handleEditAnnotation(item)} className="hover:cursor-pointer hover:text-blue-900" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                        )
                    }

                    {
                        addNewAnotation && <div className="border p-2 items-center text-gray-700 text-base">
                            <div className="mb-1">
                                <label className="block text-gray-700 text-sm font-bold mb-1 ms-1 text-white">
                                    Annotation Name:
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    type="text"
                                    placeholder="Enter annotation name"
                                    value={anotationForm.name}
                                    onChange={(e) => setAnotationForm({ ...anotationForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block ms-1 text-gray-700 text-sm font-bold mb-2 text-white">
                                    Annotation Value:
                                </label>
                                <textarea
                                    className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    placeholder="******************"
                                    value={anotationForm.details}
                                    onChange={(e) => setAnotationForm({ ...anotationForm, details: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    onClick={() => setAddNewAnotation(false)}
                                    className="bg-red-500 hover:opacity-100 opacity-75 text-white font-bold py-1 px-4 rounded focus:outline-none focus:shadow-outline"
                                    type="button"
                                >
                                    Cancel
                                </button>
                                
                                <button onClick={() => handleAddNewAnotation()}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded focus:outline-none focus:shadow-outline"
                                    type="submit"
                                >
                                    {
                                        addNewAnotation.id ? "Add" : "Update"
                                    }
                                </button>
                            </div>
                       </div>
                    }


                </div>
                <div className="px-6 py-4 flex justify-end">
                    <button onClick={onClose} className="px-2 py-1 ml-4 text-sm text-red-500 rounded border border-red-500">Close</button>
                    <button onClick={() => handleDelete(editImage.id)} className="px-2 py-1 ml-4 text-sm bg-red-500 text-white rounded">Delete</button>
                    <button onClick={() => handleSave(editImage.id)} className="px-2 py-1 ml-4 text-sm bg-green-500 text-white rounded">Save</button>
                    {!editLabel && (
                        <button
                            onClick={() => setIsEditingLabel(true)}
                            className="px-2 py-1 ml-4 text-sm bg-green-500 text-white rounded border border-green-500"
                        >
                            Add Label
                        </button>
                    )
                    }
                    <button
                        onClick={() => setAddNewAnotation(true)}
                        className="px-2 py-1 ml-4 text-sm bg-green-500 text-white rounded border border-green-500"
                    >
                        Add Annotate
                    </button>


                </div>
            </div>
        </div>
    );
}

export default EditableImageDataModal;
