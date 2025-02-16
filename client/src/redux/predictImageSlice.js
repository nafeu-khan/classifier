import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiRequest from '../../utils/api';

export const predictImage = createAsyncThunk(
  'predict/predict',
  async ({ projectId, subprojectId, token, formData }, { rejectWithValue }) => {
    try {
      const response = await apiRequest(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT_CREATE_PROJECT}${projectId}${process.env.NEXT_PUBLIC_API_ENDPOINT_SUB_PROJECT}${subprojectId}${process.env.NEXT_PUBLIC_API_ENDPOINT_MODEL_PREDICT}`,
        'POST',
        token,
        formData
      );
      console.log(response);
      return response; // Return only the data
    } catch (error) {
      console.error('Error response:', error);
      return rejectWithValue(
        error?.response?.data?.error
      );
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  predictImage: null,
  message: null,
};

const predictImageSlice = createSlice({
  name: 'predict',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(predictImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(predictImage.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.predictImage = action.payload.prediction; // Store the prediction data
      })
      .addCase(predictImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default predictImageSlice.reducer;
