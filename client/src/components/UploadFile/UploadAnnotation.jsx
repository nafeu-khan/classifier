"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import apiRequest from "../../../utils/api"; // Ensure this utility works correctly with your backend

export default function UploadAnnotation({ token, id, isUploadAnnotation, setIsUploadAnnotation }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile && selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
      toast.error("Please upload a valid CSV file.");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("No file selected. Please choose a CSV file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiRequest(`${process.env.NEXT_PUBLIC_API_ENDPOINT_CREATE_PROJECT}${id}${process.env.NEXT_PUBLIC_API_ENDPOINT_ANNOTATE_ZIP}`, "POST", token, formData);
      toast.success(response.message)
      setIsUploadAnnotation(false);
      setFile(null);
      console.log(response , "response");
    } catch (error) {
      toast.error("An error occurred during the upload.");
      console.error(error);
    }
  };

  return (
    <>
      {isUploadAnnotation && (
        <div className="p-2 border rounded-md shadow-md bg-white max-w-sm mx-auto">
          <div className="flex flex-col gap-1">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full p-1 border rounded-md"
            />

            {file && (
              <div className="text-gray-700">
                <strong>Selected File:</strong> {file.name}
              </div>
            )}

            <div className="flex justify-end w-full">
              <button
                onClick={handleUpload}
                className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Upload CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
