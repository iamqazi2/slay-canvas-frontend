// Utility functions to convert between backend assets and frontend component instances

import { Asset } from "@/app/types/workspace";

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
