import { VideoCollectTypes } from "@/app/models/interfaces";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: VideoCollectTypes = {
  videos: [],
  videoUrl: "",
  hasContent: false,
};
const videoCollectionSlice = createSlice({
  name: "videoCollectionSlice",
  initialState,
  reducers: {
    setVideoCollection: (state, action: PayloadAction<VideoCollectTypes["videos"]>) => {
      state.videos = action.payload;
    },
    setVideoUrl: (state, action: PayloadAction<VideoCollectTypes["videoUrl"]>) => {
      state.videoUrl = action.payload;
    },
    setHasContent: (state, action: PayloadAction<VideoCollectTypes["hasContent"]>) => {
      state.hasContent = action.payload;
    },
  },
});

export const { setVideoCollection, setVideoUrl, setHasContent } = videoCollectionSlice.actions;
export default videoCollectionSlice.reducer;
