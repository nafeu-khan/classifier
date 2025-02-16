import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { fetchImages , uploadImage } from "@/redux/imageSlice";


export default function FileUpload({id , token}) {
  const dispatch = useDispatch();
  const [files, setFiles] = useState({});
  const [dragCounter, setDragCounter] = useState(0);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const handleFileUpload = (newFiles) => {
    const updatedFiles = { ...files };
    Array.from(newFiles).forEach((file) => {
      const objectURL = URL.createObjectURL(file);
      updatedFiles[objectURL] = file;
    });
    setFiles(updatedFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
    setOverlayVisible(false);
    setDragCounter(0);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("Files")) {
      setDragCounter((prevCount) => prevCount + 1);
      setOverlayVisible(true);
    }
  };

  const handleDragLeave = (e) => {
    setDragCounter((prevCount) => prevCount - 1);
    if (dragCounter <= 1) setOverlayVisible(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemoveFile = (objectURL) => {
    const updatedFiles = { ...files };
    delete updatedFiles[objectURL];
    setFiles(updatedFiles);
  };
  const handleSubmit = () => {
    const formData = new FormData();
    Object.keys(files).forEach((key) => {
      formData.append("files", files[key]);
    });
    dispatch(uploadImage({projectId: id, formData, token}));
    setFiles({});
  };

  const handleCancel = () => {
    setFiles({});
  };

  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`h-auto ${darkMode ? 'dark' : ''} sm:px-8 md:px-1 `}>
      <main className="mx-auto max-w-screen-lg h-full">
        <article
          aria-label="File Upload Modal"
          className={`relative h-full flex flex-col bg-white dark:bg-gray-800 dark:border-white border shadow-xl rounded-md`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDragEnter={handleDragEnter}
        >
          {overlayVisible && (
            <div
              id="overlay"
              className="w-full h-full absolute top-0 left-0 pointer-events-none z-50 flex flex-col items-center justify-center rounded-md"
            >
              <i>
                <svg
                  className="fill-current w-12 h-12 mb-3 text-blue-700"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.479 10.092c-.212-3.951-3.473-7.092-7.479-7.092-4.005 0-7.267 3.141-7.479 7.092-2.57.463-4.521 2.706-4.521 5.408 0 3.037 2.463 5.5 5.5 5.5h13c3.037 0 5.5-2.463 5.5-5.5 0-2.702-1.951-4.945-4.521-5.408zm-7.479-1.092l4 4h-3v4h-2v-4h-3l4-4z" />
                </svg>
              </i>
              <p className="text-sm text-blue-700">Drop files to upload</p>
            </div>
          )}
          <section className="h-full overflow-auto p-2 w-full flex flex-col">
            <header className="border-dashed border-2 border-gray-400 py-1 flex flex-col justify-center items-center dark:border-gray-600">
              <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200 flex flex-wrap justify-center">
                <span>Drag and drop OR</span>
              </p>
              <input
                id="hidden-input"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <button
                id="button"
                className="my-2 rounded-lg px-3 py-1 bg-gray-200 dark:bg-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 focus:shadow-outline focus:outline-none"
                onClick={() => document.getElementById("hidden-input").click()}
              >
                Upload a file
              </button>
            </header>

            {
              Object.keys(files).length > 0 && (
                <>
                <h1 className="pt-3 pb-3 font-semibold sm:text-lg text-gray-900 dark:text-gray-200">
              To Upload
            </h1>
  
            <ul id="gallery" className="flex flex-1 flex-wrap -m-1">
              {Object.keys(files).length === 0 ? (
                <li
                  id="empty"
                  className="h-full w-full text-center flex flex-col items-center justify-center"
                >
                  <img
                    className="mx-auto w-auto h-20"
                    src="https://user-images.githubusercontent.com/507615/54591670-ac0a0180-4a65-11e9-846c-e55ffce0fe7b.png"
                    alt="no data"
                  />
                  <span className="text-small text-gray-500 dark:text-gray-400">
                    No files selected
                  </span>
                </li>
              ) : (
                Object.keys(files).map((key) => (
                  <li key={key} className="block p-1 w-1/2 h-20">
                    <article className="group w-full h-full rounded-md focus:outline-none focus:shadow-outline relative bg-gray-100 dark:bg-gray-700 shadow-sm">
                      <img
                        src={key}
                        alt={files[key].name}
                        className="img-preview w-full h-full sticky object-cover rounded-md"
                      />
                      <section className="flex flex-col text-xs break-words w-full h-full z-20 absolute top-0 py-2 px-3">
                        {/* <h1 className="flex-1 text-gray-900 dark:text-gray-200 text-xs">
                          {files[key].name}
                        </h1> */}
                        <div className="flex">
                          <button
                            className="delete bg-danger ml-auto absolute bottom-1 right-1 focus:outline-none hover:bg-danger dark:hover:bg-gray-600 p-1 rounded-md"
                            onClick={() => handleRemoveFile(key)}
                          >
                            <svg
                              className="pointer-events-none fill-current w-4 h-4 dark:text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                            >
                              <path d="M3 6l3 18h12l3-18h-18zm19-4v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.316c0 .901.73 2 1.631 2h5.711z" />
                            </svg>
                          </button>
                        </div>
                      </section>
                    </article>
                  </li>
                ))
              )}
            </ul>
            <footer className="flex justify-end pb-8 pt-4">
              <button
                id="submit"
                className="rounded-sm px-3 py-1 bg-blue-700 hover:bg-blue-500 text-white focus:shadow-outline focus:outline-none"
                onClick={handleSubmit}
              >
                Upload now
              </button>
              <button
                id="cancel"
                className="ml-3 rounded-sm px-3 py-1 hover:bg-gray-300 dark:hover:bg-gray-600 focus:shadow-outline focus:outline-none"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </footer>
                </>
              )
            }
          </section>
  
        </article>
      </main>
    </div>
  );
  
}
