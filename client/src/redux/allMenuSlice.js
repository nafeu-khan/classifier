import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiRequest from "../../utils/api";
import {  deleteImageAnnotations , addImageAnnotations, updateImageAnnotations } from "./imageSlice";

// Async Thunks
export const fetchAllMenu = createAsyncThunk("allMenu", async ({ token }) => {
  const response = await apiRequest(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT_CREATE_PROJECT}`,
    "GET",
    token,
    null
  );
  return response;
});


export const PreProcessData = createAsyncThunk(
  "PreProcessData",
  async ({ projectId, subprojectId, data, token }) => {
    try {
      // Construct the base URL
      let url = `${process.env.NEXT_PUBLIC_API_ENDPOINT_CREATE_PROJECT}${projectId}`;

      // Add subprojectId to the URL if it exists
      if (subprojectId) {
        url += `${process.env.NEXT_PUBLIC_API_ENDPOINT_SUB_PROJECT}${subprojectId}`;
      } 
      url += `${process.env.NEXT_PUBLIC_API_ENDPOINT_PROCESS_IMAGE}`;
      console.log(url);

      const response = await apiRequest(url, "POST", token, data);
      console.log(response, "response in editable modal");

      // Validate the response structure
      if (response && response.message && response.project) {
        return {
          message: response.message,
          project: response.project,
        };
      }
    } catch (error) {
      console.error("Error in PreProcessData:", error.message);
      throw error; // Propagate the error to be handled by `rejected` case
    }
  }
);



export const UpdateSubProject = createAsyncThunk(
  "UpdateSubProject",
  async ({ projectId, subProjectId, token, data }) => {
    try {
      const response = await apiRequest(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT_CREATE_PROJECT}${projectId}${process.env.NEXT_PUBLIC_API_ENDPOINT_SUB_PROJECT}${subProjectId}/`,
        "PUT",
        token,
        data
      );

      if (response && response.message && response.subproject) {
        console.log(response, "response in editable modal");
        return {
          message: response.message,
          projectId: projectId,
          subproject: response.subproject,
        };
      } else {
        throw new Error("Unexpected response structure");
      }
    } catch (error) {
      console.error("Error in UpdateSubProject:", error.message);
      throw error;
    }
  }
);

export const DeleteSubProject = createAsyncThunk(
  "DeleteSubProject",
  async ({ projectId, subProjectId, token }) => {
    const response = await apiRequest(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT_CREATE_PROJECT}${projectId}${process.env.NEXT_PUBLIC_API_ENDPOINT_SUB_PROJECT}${subProjectId}/`,
      "DELETE",
      token,
      null
    ).then
    (response => {
      console.log(response, "response in editable modal");
      if (response && response.message && response.project) {
        return {
          message: response.message,
          projectId: projectId,
          subproject: response.subproject,
        };
      } else {
        throw new Error("Unexpected response structure");
      }
    })
  }
  );



export const UpdateProject = createAsyncThunk(
  "UpdateProject",
  async ({ token, data, id }) => {
    const response = await apiRequest(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT_CREATE_PROJECT}${id}/`,
      "PUT",
      token,
      data
    );
    return response;
  }
);


export const deleteProject = createAsyncThunk(
  "deleteProject",
  async ({ token, id }) => {
    const response = await apiRequest(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT_CREATE_PROJECT}${id}/`,
      "DELETE",
      token,
      null
    );
    return {
      message: response.message,
      project: { id: id }, // Returning the project ID for deletion
    };
  }
);



export const addAnnotation = createAsyncThunk(
  "image/addAnnotation",
  async ({ projectId, imageId, data, token }, { dispatch }) => { // Destructure dispatch here
    try {
      const response = await apiRequest(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT_CREATE_PROJECT}${projectId}${process.env.NEXT_PUBLIC_API_ENDPOINT_IMAGE}${imageId}${process.env.NEXT_PUBLIC_API_ENDPOINT_ANOTATE}`,
        "POST",
        token,
        data
      );
      dispatch(addImageAnnotations(response.anotation_data)); // dispatch is now available
      return response; // Returning response to fulfill the thunk
    } catch (error) {
      console.error("Error in addAnnotation thunk:", error);
      throw error; // Propagate error for further handling
    }
  }
);

export const updateAnnotation = createAsyncThunk(
  "image/updateAnnotation",
  async ({ projectId, imageId, annotationId, data, token }, { dispatch }) => { // Destructure dispatch here
    try {
      const response = await apiRequest(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT_CREATE_PROJECT}${projectId}${process.env.NEXT_PUBLIC_API_ENDPOINT_IMAGE}${imageId}${process.env.NEXT_PUBLIC_API_ENDPOINT_ANOTATE}${annotationId}/`,
        "PUT",
        token,
        data
      );
      console.log(response.updated_annotation, "response in Update modal");
      // dispatch(updateImageAnnotations(response.updated_annotation)); // dispatch is now available
      return response; 
    } catch (error) {
      console.error("Error in updateAnnotation thunk:", error);
      throw error; // Propagate error for further handling
    }
  }
);

export const deleteAnnotation = createAsyncThunk(
  "image/deleteAnnotation",
  async ({ projectId, imageId, annotationId, token }, { dispatch }) => { // Destructure dispatch here
    try {
      const response = await apiRequest(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT_CREATE_PROJECT}${projectId}${process.env.NEXT_PUBLIC_API_ENDPOINT_IMAGE}${imageId}${process.env.NEXT_PUBLIC_API_ENDPOINT_ANOTATE}${annotationId}/`,
        "DELETE",
        token,
        null
      );
      console.log(response, "response in editable modal");
      dispatch(deleteImageAnnotations(response.deleted_annotation)); // dispatch is now available
      return response; // Returning response to fulfill the thunk
    } catch (error) {
      console.error("Error in deleteAnnotation thunk:", error);
      throw error; // Propagate error for further handling
    }
  }
  );


// Initial State
const initialState = {
  menuGroups: [],
  loading: false,
  error: null,
  message: null,
};

// Slice Definition
const allMenuSlice = createSlice({
  name: "allMenu",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(fetchAllMenu.fulfilled, (state, action) => {
        state.menuGroups = action.payload.projects || [];
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAllMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(UpdateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(UpdateProject.fulfilled, (state, action) => {
        state.loading = false;
        state.menuGroups = state.menuGroups.map((menuGroup) => {
          if (menuGroup.id === action.payload.project.id) {
            return {
              ...menuGroup,
              ...action.payload.project, // Dynamically spread updated fields
            };
          }
          return menuGroup;
        });
        state.message = action.payload.message ;
      })
      .addCase(UpdateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.menuGroups = state.menuGroups.filter(
          (menuGroup) => menuGroup.id !== action.payload.project.id
        );
        state.message = action.payload.message;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(PreProcessData.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(PreProcessData.fulfilled, (state, action) => {
        state.loading = false;
      
        // Update the relevant menuGroup based on project ID
        state.menuGroups = state.menuGroups.map((menuGroup) => {
          if (menuGroup.id === action.payload.project.id) {
            return {
              ...menuGroup,
              ...action.payload.project, // Dynamically spread updated fields
            };
          }
          return menuGroup;
        });
      
        // Set the success message
        state.message = action.payload.message;
      })
      .addCase(PreProcessData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(UpdateSubProject.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(UpdateSubProject.fulfilled, (state, action) => {
        console.log(action.payload, "action.payload");
        const { projectId, subproject, message } = action.payload;
      
        // Find the project by its ID
        const projectIndex = state.menuGroups.findIndex((project) => project.id === parseInt(projectId));
        console.log(projectIndex, "projectIndex");
        if (projectIndex !== -1) {
          // Find the subproject in the selected project
          const subprojectIndex = state.menuGroups[projectIndex].subprojects.findIndex(
            (sp) => sp.id === subproject.id
          );
          console.log(subprojectIndex, "subprojectIndex");
          if (subprojectIndex !== -1) {
            // Update the subproject details
            state.menuGroups[projectIndex].subprojects[subprojectIndex] = {
              ...state.menuGroups[projectIndex].subprojects[subprojectIndex],
              ...subproject,
            };
          }
        }
      
        state.message = message;
        state.loading = false;
      })
      .addCase(UpdateSubProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(DeleteSubProject.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(DeleteSubProject.fulfilled, (state, action) => {
        console.log(action.payload, "action.payload");
        const { projectId, subproject, message } = action.payload;
      
        // Find the project by its ID
        const projectIndex = state.menuGroups.findIndex((project) => project.id === parseInt(projectId));
        console.log(projectIndex, "projectIndex");
        if (projectIndex !== -1) {
          // Find the subproject in the selected project
          const subprojectIndex = state.menuGroups[projectIndex].subprojects.findIndex(
            (sp) => sp.id === subproject.id
          );
          console.log(subprojectIndex, "subprojectIndex");
          if (subprojectIndex !== -1) {
            // Remove the subproject from the project
            state.menuGroups[projectIndex].subprojects.splice(subprojectIndex, 1);
            }
          }
        state.message = message;
        state.loading = false;
      })
      .addCase(DeleteSubProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addAnnotation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(addAnnotation.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        const annotation = action.payload.anotation_data;  
        const projectId = annotation.project_id; 
        const project = state.menuGroups.find(group => group.id === projectId);
        if (project) {
          const imageId = annotation.image_id;
          const image = project.images.find(img => img.id === imageId);
          if (image) {
            image.annotations.push(annotation);
          }
        }

      })
      .addCase(addAnnotation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteAnnotation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null; 
      })
      .addCase(deleteAnnotation.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        const annotation = action.payload.deleted_annotation;
      })
      .addCase(deleteAnnotation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateAnnotation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateAnnotation.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        const annotation = action.payload.updated_annotation;
        console.log(annotation, "annotation");
        const projectId = annotation.project;
        const project = state.menuGroups.find(group => group.id === projectId);
        if (project) {
          const imageId = annotation.photo;
          const image = project.images.find(img => img.id === imageId);
          if (image) {
            const annotationIndex = image.annotations.findIndex(a => a.id === annotation.id);
            if (annotationIndex !== -1) {
              image.annotations[annotationIndex] = annotation;
            }
          }
        }
      })
      .addCase(updateAnnotation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default allMenuSlice.reducer;
