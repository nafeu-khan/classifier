import {React, useState} from 'react';
import info from "../../../public/images/icon/info.png";
import Image from 'next/image';
import EditableModal from "./EditableImageDataModal";


export default function ImageList({ images }) {
  const [selectedImage, setSelectedImage] = useState(null);
  return (
    <>
      {images && images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-wrap">
          {images.map((image, index) => (
            <div
              key={index}
              className="flex items-center bg-gray-800 rounded-lg p-2 hover:bg-gray-700 text-white shadow-md relative group"
            >
              <img
                src={image.image}
                alt={image.filename}
                className="h-16 w-16 object-cover rounded mr-4"
              />
              <div className="flex-grow me-4 max-w-full overflow-hidden">
                <div className="text-xs font-semibold truncate overflow-hidden text-ellipsis whitespace-nowrap">
                  FILENAME: {image.unique_image_name}
                </div>
                <div className="text-xs truncate overflow-hidden text-ellipsis whitespace-nowrap">
                  ANNOTATIONS: {image.label} {image.classes}
                </div>
              </div>

              <div className="absolute top-2 right-2 flex space-x-2">
                <button onClick={() => setSelectedImage(image)} className="bg-teal-600 p-1 rounded">
                  <Image 
                    src={info}
                    alt="info"
                    width={20}
                    height={20}
                    className="hidden group-hover:block transition-opacity duration-300"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No images</p>
      )}
      {
        selectedImage && (
          <EditableModal
            selectedImage={selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        )
      }
    </>
  );
}
