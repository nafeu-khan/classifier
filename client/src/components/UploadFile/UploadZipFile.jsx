"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import apiRequest from "../../../utils/api";
import { useDispatch } from "react-redux";
import { addZipImage } from "@/redux/imageSlice";

const UploadZipFile = ({ token , id , isUploadZip ,  setIsUploadZip }) => {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile && selectedFile.type !== "application/zip" && !selectedFile.name.endsWith(".zip")) {
      toast.error("Please upload a valid ZIP file.");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("No file selected. Please choose a ZIP file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("zip_file", file); // Append the file correctly
  
    try {
      console.log("Uploading file:", file.name);
      console.log("FormData contents:", [...formData.entries()]); // Log FormData contents for debugging
  
      // Dispatch the action
      dispatch(addZipImage({ id, token, formData }));
    } catch (error) {
      toast.error("An error occurred during the upload.");
      console.error(error);
    }
  };
  

  return (
    <>
    {
      isUploadZip &&
    <div className="p-2 border rounded-md shadow-md bg-white max-w-sm mx-auto ">
      <div className="flex items-center gap-2">
      <input
        type="file"
        accept=".zip"
        onChange={handleFileChange}
        className="w-full p-2 border rounded-md"
      />
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Upload
      </button>
      </div>
      {file && (
        <div className="mb-2 text-gray-700">
          <strong>Selected File:</strong> {file.name}
        </div>
      )}
    </div>
    }
    </>
  );
};

export default UploadZipFile;
