import { createSlice , createAsyncThunk  } from "@reduxjs/toolkit";
import apiRequest from '../../utils/api';


export const fetchAllModel = createAsyncThunk("allModel", async ({ projectId, subprojectId, token }) => {
    console.log(projectId, subprojectId, token)
    const response = await apiRequest(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT_CREATE_PROJECT}${projectId}${process.env.NEXT_PUBLIC_API_ENDPOINT_SUB_PROJECT}${subprojectId}${process.env.NEXT_PUBLIC_API_ENDPOINT_MODEL}`,
        "GET",
        token,
        null
    );
    console.log(response)
    return response;
});

const initialState = {
    loading: false,
    error: null,
    allModel: null,
};


const allModelSlice = createSlice({
    name: "allModel",
    initialState,
    reducers: {
        AddModel: (state, action) => {
            state.allModel.push(action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllModel.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllModel.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.allModel = action.payload;
            })
            .addCase(fetchAllModel.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { AddModel } = allModelSlice.actions;

export default allModelSlice.reducer;