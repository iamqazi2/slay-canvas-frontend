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
    video: "videoCollection",
    audio: "audioPlayer",
    image: "imageCollection",
    pdf: "pdfDocument",
    link: "wikipediaLink",
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
        text: asset.url || asset.content || asset.title,
        url: asset.url,
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
        url: asset.url,
        title: asset.title,
        content: asset.content,
      };
      break;
    case "imageCollection":
      // For images, we might need to handle URLs differently
      data = {
        url: asset.url,
        title: asset.title,
      };
      break;
    case "audioPlayer":
      data = {
        url: asset.url,
        title: asset.title,
      };
      break;
    case "videoCollection":
      data = {
        url: asset.url,
        title: asset.title,
      };
      break;
    default:
      data = {
        text: asset.content || asset.title,
        url: asset.url,
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
