import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiRequest from "../../utils/api";

export const createSplitDataset = createAsyncThunk(
  "splitDataset/Splitdata",
  async ({projectId, subprojectId , data, token }, { rejectWithValue }) => {
    try {
      const response = await apiRequest(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT_CREATE_PROJECT}${projectId}${process.env.NEXT_PUBLIC_API_ENDPOINT_SUB_PROJECT}${subprojectId}${process.env.NEXT_PUBLIC_API_ENDPOINT_SPLIT_DATASET}`,
        "POST",
        token,
        data
      );
      return response;
    } catch (error) {
      console.error("Error splitting dataset:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  splitData: null,
};

const splitDatasetSlice = createSlice({
  name: "splitDataset",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createSplitDataset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSplitDataset.fulfilled, (state, action) => {
        state.loading = false;
        state.splitData = action.payload;
      })
      .addCase(createSplitDataset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default splitDatasetSlice.reducer;
