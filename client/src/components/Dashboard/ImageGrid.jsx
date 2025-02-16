import { useState, useEffect, useRef } from "react";
import info from "../../../public/images/icon/info.png";
import Image from "next/image";
import EditableImageDataModal from "./EditableImageDataModal";

function ImageGallery({ projectId , subprojectId, images, token, AllSelectValue }) {
    const [selectedImages, setSelectedImages] = useState([]); // Array to track selected images
    const [editImage, setEditImage] = useState(null);
    const [laveling , setLabling] = useState(null);
    const modalRef = useRef(null);

    const handleShowDetails = (image) => {
        setEditImage(image);
    };

    const handleLabelingImage = (image) => {
     setLabling(image);
    }

    const handleCloseDetails = () => {
        setEditImage(null);
        setLabling(null);
    };

    const toggleSelectImage = (imageId) => {
        setSelectedImages((prevSelected) =>
            prevSelected.includes(imageId)
                ? prevSelected.filter((id) => id !== imageId) // Remove if already selected
                : [...prevSelected, imageId] // Add if not selected
        );
    };

    useEffect(() => {
        if (AllSelectValue) {
            setSelectedImages(images.map((image) => image.id));
        } else {
            setSelectedImages([]);
        }
    }, [AllSelectValue, images]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                handleCloseDetails();
            }
        };

        // Add event listener when modal is open
        if (editImage) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        // Cleanup event listener on close
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [editImage]);


    return (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-7 md:grid-cols-5 z-0">
            {images ? (
                images.map((image, index) => (
                    <div key={index} className="relative" onClick={() => handleLabelingImage(image)}>
                        <img
                            className="w-full object-cover h-24 w-auto max-w-full rounded-lg hover:opacity-75 border-green-600 hover:shadow-lg hover:cursor-pointer"
                            src={image.image}
                            alt="gallery-photo"
                        />
                        <p className="line-clamp-1 text-xs px-1">{image.unique_image_name}</p>
                        <button
                            onClick={() => toggleSelectImage(image.id)}
                            className="absolute top-2 right-12 bg-green-300 text-white text-sm py-1 px-2 rounded hover:bg-green-500"
                        >
                            <input
                                type="checkbox"
                                checked={selectedImages.includes(image.id)} // Check if the image is selected
                                readOnly
                            />
                        </button>
                        <button
                            onClick={() => handleShowDetails(image)}
                            className="absolute top-2 right-2 bg-green-300 text-white text-sm py-1 px-2 rounded hover:bg-green-500"
                        >
                            <Image src={info} alt="info" width={20} height={20} />
                        </button>
                    </div>
                ))
            ) : (
                <p>No images</p>
            )}
            

            {editImage && (
                <EditableImageDataModal
                    projectId={projectId}
                    subprojectId={subprojectId}
                    editImage={editImage}
                    onClose={handleCloseDetails}
                    token={token}
                    modalRef={modalRef}
                />
            )}
        </div>
    );
}

export default ImageGallery;
