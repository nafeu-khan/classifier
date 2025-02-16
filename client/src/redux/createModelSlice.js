import { createSlice , createAsyncThunk } from "@reduxjs/toolkit";
import apiRequest from "../../utils/api";
import { AddModel } from "./allModelSlice";

export const createModel = createAsyncThunk(
  "CreateModel/createModel",
  async ({ projectId, subprojectId, data, token }, { dispatch, rejectWithValue }) => {
    console.log(projectId, subprojectId, data, token);
    try {
      const response = await apiRequest(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT_CREATE_PROJECT}${projectId}${process.env.NEXT_PUBLIC_API_ENDPOINT_SUB_PROJECT}${subprojectId}${process.env.NEXT_PUBLIC_API_ENDPOINT_TRAIN_MODEL}`,
        "POST",
        token,
        data
      );

      console.log("Model creation response:", response);

      // Dispatch another action with response payload
      dispatch(AddModel(response.model_performance));

      return response;
    } catch (error) {
      console.error("Error creating model:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
    loading: false,
    error: null,
    modeldata: null,
    message: null,
};

export const createModelSlice = createSlice({
    name: "createModel",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createModel.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createModel.fulfilled, (state, action) => {
                state.message = action.payload.message;
                state.loading = false;
                state.modeldata = action.payload.model_performance;
            })
            .addCase(createModel.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default createModelSlice.reducer;
