export interface StoreTypes {
  videCollectionSlice: VideoCollectTypes;
}

export interface VideoCollectTypes {
  videos: VideoItem[];
  videoUrl: string;
  hasContent: boolean;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  type: "youtube" | "vimeo" | "instagram" | "facebook" | "tiktok" | "twitter" | "direct" | "other";
  duration?: string;
  author?: string;
  platform?: string;
}
