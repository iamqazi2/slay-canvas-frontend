import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { StoreTypes } from "../models/interfaces";
import videoCollectionReducer from "./slices/videoSlice";

export const store: EnhancedStore<StoreTypes> = configureStore({
  reducer: {
    videCollectionSlice: videoCollectionReducer,
  },
});
