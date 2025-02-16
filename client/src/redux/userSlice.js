import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiRequest from "../../utils/api";

export const fetchUserData = createAsyncThunk("user", async ({ token }) => {
  const response = await apiRequest(`${process.env.NEXT_PUBLIC_API_ENDPOINT_USER}`, "GET", token, null);
  return response;
});

const initialState = {
  userInfo: null, 
  loading: false,
  error: null,
};  

const userSlice = createSlice({ 
  name: "user",
  initialState, 
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null; // Reset error on new request
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload; // Update correct state property
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong."; // Better error handling
      });
  },
});

export default userSlice.reducer;
