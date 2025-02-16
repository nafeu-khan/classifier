import { createSlice , createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import apiRequest from "../../utils/api";

export const uploadImage = createAsyncThunk(
  "image/upload",
  async ({ projectId, formData, token }, { rejectWithValue }) => {
    try {
      const response = await apiRequest(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT_CREATE_PROJECT}${projectId}${process.env.NEXT_PUBLIC_API_ENDPOINT_IMAGE}`,
        "POST",
        token,
        formData
      );

      // Ensure the response matches the expected structure
      if (response && response.message && response.photo) {
        return {
          message: response.message,
          photos: response.photo, // Normalize "photo" to "photos" for consistency
        };
      } else {
        throw new Error("Unexpected API response structure");
      }
    } catch (error) {
      console.error("Error in uploadImage thunk:", error);
      return rejectWithValue({ message: error.message || "Failed to upload images" });
    }
  }
);


export const fetchImages = createAsyncThunk("image", async ({id, token , searchQuery}) => {
 await apiRequest(`${process.env.NEXT_PUBLIC_API_ENDPOINT_CREATE_PROJECT}${id}${process.env.NEXT_PUBLIC_API_ENDPOINT_IMAGE}?search=${searchQuery}`, "GET", token).then
  (response => {
    console.log(response , "selected images");
    return response.photo;
  })
});


export const deleteImage = createAsyncThunk("image/delete", async ({ projectId , id, token }) => {
  apiRequest(`${process.env.NEXT_PUBLIC_API_ENDPOINT_CREATE_PROJECT}${projectId}${process.env.NEXT_PUBLIC_API_ENDPOINT_IMAGE}${id}/`, "DELETE", token).then
  (response => {
    return response.photo;
  })
})


export const updateImageData = createAsyncThunk(
  "image/update",
  async ({ projectId, subprojectId, id, data, token }) => {
    try {
      // Construct the base URL
      let url = `${process.env.NEXT_PUBLIC_API_ENDPOINT_CREATE_PROJECT}${projectId}`;

      // Add subprojectId to the URL if it exists
      if (subprojectId) {
        url += `${process.env.NEXT_PUBLIC_API_ENDPOINT_SUB_PROJECT}${subprojectId}/`;
      }

      // Append the image ID endpoint
      url += `${process.env.NEXT_PUBLIC_API_ENDPOINT_IMAGE}${id}/`;

      const response = await apiRequest(url, "PUT", token, data);
      console.log(response, "updated image");
      return response;
    } catch (error) {
      console.error("Error in updateImageData:", error.message);
      throw error; // Propagate the error for error handling
    }
  }
);



export const addZipImage = createAsyncThunk("image/addZip", async ({ id, token, formData }) => {
  try {
    const response = await apiRequest(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT_CREATE_PROJECT}${id}${process.env.NEXT_PUBLIC_API_ENDPOINT_UPLOAD_ZIP}`,
      "POST",
      token,
      formData
    );
    // Ensure the response contains the `photos_created` key
    if (response.photos_created) {
      return response.photos_created; // Return the correct data
    } else {
      throw new Error("Invalid response: photos_created not found.");
    }
  } catch (error) {
    console.error("Error in addZipImage thunk:", error);
    throw error; // Rethrow the error for the rejected case
  }
});


      

const initialState = {
  selectedImage: [],
  loading: false,
  error: null,
  message: null,
};

const imageSlice = createSlice({
  name: "image",
  initialState,
  reducers: {
    addImage: (state, action) => {
      state.selectedImage = action.payload;
    },
    updateImage: (state, action) => {
      const { id, updatedImage } = action.payload;
          if (updatedImage.image && !updatedImage.image.startsWith("http")) {
        updatedImage.image = `${process.env.NEXT_PUBLIC_BASE_URL}${updatedImage.image}`;
      }
      state.selectedImage = state.selectedImage.map((image) =>
        image.id === id ? { ...image, ...updatedImage } : image
      );
    },
    removeImage: (state, action) => {
      state.selectedImage = state.selectedImage.filter(
        (image) => image.id !== action.payload
      );
    },
    addImageAnnotations: (state, action) => {
      const addAnnotation = action.payload;
      state.selectedImage = state.selectedImage.map((image) => {
        if (image.id === addAnnotation.photo && image.project === addAnnotation.project) {
          return {
            ...image,
            annotations: [...image.annotations, addAnnotation], // Add the new annotation
          };
        }
        return image; // Return the image unchanged if it doesn't match
      });
    },
    deleteImageAnnotations: (state, action) => {
      const deleteAnnotation = action.payload;
      console.log(deleteAnnotation, "delete annotation");
      state.selectedImage = state.selectedImage.map((image) => {
        if (image.id === deleteAnnotation.photo && image.project === deleteAnnotation.project) {
          return {
            ...image,
            annotations: image.annotations.filter((annotation) => annotation.id !== deleteAnnotation.id), // Remove the deleted annotation
          };
        }
        return image; // Return the image unchanged if it doesn't match
      });
    }
  },
  updateImageAnnotations: (state, action) => {
    const updateAnnotation = action.payload;
    state.selectedImage = state.selectedImage.map((image) => {
      if (image.id === updateAnnotation.photo && image.project === updateAnnotation.project) {
         return {
          ...image,
          annotations: image.annotations.map((annotation) =>
            annotation.id === updateAnnotation.id ? updateAnnotation : annotation
          ), // Update the annotation with the new data
        };
      }
      return image;
    });
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchImages.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedImage = action.payload;
      })
      .addCase(fetchImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addZipImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addZipImage.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;
        const updatedData = data.map((item) => {
          if (!item.image_url.startsWith("http")) {
            item.image = `${process.env.NEXT_PUBLIC_BASE_URL}${item.image_url}`;
          }
          return item;
        });
        state.selectedImage = [...state.selectedImage, ...updatedData];
      })      
      .addCase(addZipImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      }).addCase(deleteImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedImage = state.selectedImage.filter(
          (image) => image.id !== action.payload
        )
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateImageData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateImageData.fulfilled, (state, action) => {
        state.message = action.payload.message;
        const updatedImage = action.payload.photo;
        if (updatedImage.image && !updatedImage.image.startsWith("http")) {
          updatedImage.image = `${process.env.NEXT_PUBLIC_BASE_URL}${updatedImage.image}`;
        }
       state.selectedImage = state.selectedImage.map((image) =>
          image.id === updatedImage.id ? { ...image, ...updatedImage } : image
        );
      
        state.loading = false;
      })      
      .addCase(updateImageData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(uploadImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {      
        if (!action.payload) {
          console.error("Payload is undefined or malformed.");
          return;
        }
        const { message, photos } = action.payload;
        const updatedPhotos = photos.map((photo) => {
          if (photo.image && !photo.image.startsWith("http")) {
            photo.image = `${process.env.NEXT_PUBLIC_BASE_URL}${photo.image}`;
          }
          return photo;
        });
      
        // Update state
        state.message = message;
        state.selectedImage = [...state.selectedImage, ...updatedPhotos];
        state.loading = false;
      })          
      .addCase(uploadImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
  },
});

export const { addImage, removeImage , updateImage  , deleteImageAnnotations , addImageAnnotations , updateImageAnnotations } = imageSlice.actions;

export default imageSlice.reducer;