// Utility functions to convert between backend assets and frontend component instances

import { Asset } from "@/app/types/workspace";
import { AssetCreate } from "./assetApi";

export interface ComponentInstance {
  id: string;
  type: string;
  data?: {
    file?: File;
    files?: File[];
    text?: string;
    url?: string;
    content?: string;
    title?: string;
  };
}

/**
 * Convert backend Asset to frontend ComponentInstance
 */
export function assetToComponentInstance(asset: Asset): ComponentInstance {
  // Map asset types to component types
  const typeMapping: Record<string, string> = {
    video: "videoSocial", // Changed: video assets should use videoSocial to render like social links
    audio: "audioPlayer",
    image: "imageCollection",
    pdf: "pdfDocument",
    link: "wikipediaLink",
    wiki: "wikipediaLink", // Map wiki assets to wikipediaLink component
    social: "videoSocial", // Map social assets to videoSocial component
    text: "text",
    document: "pdfDocument",
    url: "wikipediaLink",
  };

  const componentType = typeMapping[asset.type.toLowerCase()] || "text";

  // Create data based on asset type
  let data: ComponentInstance["data"] = {};

  switch (componentType) {
    case "wikipediaLink":
      data = {
        text: asset.url || asset.file_path || asset.content || asset.title,
        url: asset.url || asset.file_path,
        title: asset.title,
      };
      break;
    case "text":
      data = {
        text: asset.content || asset.title,
        title: asset.title,
      };
      break;
    case "pdfDocument":
      data = {
        url: asset.file_path || asset.url, // Use file_path for PDF URL
        title: asset.title,
        content: asset.content,
      };
      break;
    case "imageCollection":
      data = {
        url: asset.file_path || asset.url, // Use file_path for image URL
        title: asset.title,
      };
      break;
    case "audioPlayer":
      data = {
        url: asset.file_path || asset.url, // Use file_path for audio URL
        title: asset.title,
      };
      break;
    case "videoCollection":
      data = {
        url: asset.file_path || asset.url, // Use file_path for video URL
        title: asset.title,
      };
      break;
    case "videoSocial":
      data = {
        text: asset.url || asset.file_path || asset.content,
        url: asset.url || asset.file_path,
        title: asset.title,
      };
      break;
    default:
      data = {
        text: asset.content || asset.title,
        url: asset.file_path || asset.url,
        title: asset.title,
      };
  }

  return {
    id: `asset-${asset.id}`,
    type: componentType,
    data,
  };
}

/**
 * Convert multiple assets to component instances
 */
export function assetsToComponentInstances(
  assets: Asset[]
): ComponentInstance[] {
  return assets
    .filter((asset) => asset.is_active) // Only include active assets
    .map(assetToComponentInstance);
}

/**
 * Get asset type from component type (reverse mapping)
 */
export function componentTypeToAssetType(componentType: string): string {
  const reverseMapping: Record<string, string> = {
    videoCollection: "video",
    videoSocial: "social",
    socialVideo: "video", // New mapping for social video file uploads
    audioPlayer: "audio",
    imageCollection: "image",
    pdfDocument: "pdf",
    wikipediaLink: "link",
    text: "text",
  };

  return reverseMapping[componentType] || "text";
}

/**
 * Determine which API endpoint and method to use based on sidebar option
 */
export function getAssetCreationStrategy(componentType: string): {
  endpoint: "link" | "text" | "file";
  assetType: string;
  isFile: boolean;
} {
  // Map sidebar options to API strategies
  switch (componentType) {
    case "social":
      return { endpoint: "link", assetType: "social", isFile: false };
    case "socialVideo": // New type for social video file uploads
      return { endpoint: "file", assetType: "video", isFile: true }; // Use video type instead of document
    case "wiki":
    case "wikipediaLink":
      return { endpoint: "link", assetType: "wiki", isFile: false };
    case "internet":
      return { endpoint: "link", assetType: "internet", isFile: false };
    case "text":
      return { endpoint: "text", assetType: "text", isFile: false };
    case "image":
    case "imageCollection":
      return { endpoint: "file", assetType: "image", isFile: true };
    case "audio":
    case "audioPlayer":
      return { endpoint: "file", assetType: "audio", isFile: true };
    case "video":
    case "videoCollection":
      return { endpoint: "file", assetType: "video", isFile: true }; // Changed from document to video
    case "videoSocial": // New type for social media videos
      return { endpoint: "link", assetType: "social", isFile: false };
    case "document":
    case "pdfDocument":
      return { endpoint: "file", assetType: "document", isFile: true };
    default:
      // Default to text for unknown types
      return { endpoint: "text", assetType: "text", isFile: false };
  }
}

/**
 * Convert ComponentInstance to AssetCreate for API calls
 */
export function componentInstanceToAssetCreate(
  instance: ComponentInstance
): AssetCreate {
  const strategy = getAssetCreationStrategy(instance.type);
  const { data } = instance;

  const asset: AssetCreate = {
    type: strategy.assetType,
    is_active: true,
  };

  // Set appropriate fields based on endpoint type
  if (strategy.endpoint === "link") {
    asset.url = data?.url || data?.text;
    asset.title = data?.title || data?.text || "Untitled Link";
  } else if (strategy.endpoint === "text") {
    asset.content = data?.text || data?.content;
    asset.title = data?.title || "Text Content";
  } else {
    // File endpoint - title will be handled separately
    asset.title = data?.title || `${strategy.assetType} Asset`;
  }

  return asset;
}

/**
 * Extract backend asset ID from component instance ID
 */
export function getAssetIdFromComponentId(componentId: string): number | null {
  if (componentId.startsWith("asset-")) {
    const id = parseInt(componentId.replace("asset-", ""), 10);
    return isNaN(id) ? null : id;
  }
  return null;
}

/**
 * Check if component instance represents a backend asset
 */
export function isBackendAsset(instance: ComponentInstance): boolean {
  return instance.id.startsWith("asset-");
}
