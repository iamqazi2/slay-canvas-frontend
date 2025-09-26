import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { StoreTypes } from "../models/interfaces";
import videoCollectionReducer from "./slices/videoSlice";
import loadingReducer from "./slices/loadingSlice";

export const store: EnhancedStore<StoreTypes> = configureStore({
  reducer: {
    videCollectionSlice: videoCollectionReducer,
    loadingSlice: loadingReducer,
  },
});
