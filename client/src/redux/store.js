import { configureStore  } from '@reduxjs/toolkit'
import imageSlice from './imageSlice'
import searchSlice from './searchSlice'
import allMenuSlice from './allMenuSlice'
import userSlice from './userSlice'
import  splitDatasetSlice from './SplitDataSetSlice'
import createModelSlice from "./createModelSlice"
import predictImageSlice from './predictImageSlice'
import allModelSlice from './allModelSlice'
import splitImageCategorySlice  from './splitImageCategorySlice'

export const store = configureStore({
  reducer: {
    user: userSlice,
    allMenu: allMenuSlice,
    search: searchSlice,
    imageCategory : splitImageCategorySlice,
    image: imageSlice,
    splitDataset: splitDatasetSlice,
    modelData : createModelSlice,
    predictImage : predictImageSlice,
    allModel : allModelSlice
  },
})

export default store