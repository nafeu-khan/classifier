import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  splitImageCategory: "all",
};

const splitImageCategorySlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setSplitImageCategory: (state, action) => {
      state.splitImageCategory = action.payload;
    },
  },
});

export const { setSplitImageCategory } = splitImageCategorySlice.actions;

export default splitImageCategorySlice.reducer;
