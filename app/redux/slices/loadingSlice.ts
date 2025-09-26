import { LoadingTypes } from "@/app/models/interfaces";
import { createSlice } from "@reduxjs/toolkit";

const initialState: LoadingTypes = {
  isLoading: false,
  count: 0,
};

const loadingSlice = createSlice({
  name: "loadingSlice",
  initialState,
  reducers: {
    incrementLoading: (state) => {
      state.count += 1;
      state.isLoading = state.count > 0;
    },
    decrementLoading: (state) => {
      state.count = Math.max(0, state.count - 1);
      state.isLoading = state.count > 0;
    },
  },
});

export const { incrementLoading, decrementLoading } = loadingSlice.actions;
export default loadingSlice.reducer;