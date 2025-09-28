import { apiClient } from "./apiClient";

export interface PositionUpdate {
  id: number;
  type: "asset" | "collection" | "kb";
  x: number;
  y: number;
}

export interface PositionResponse {
  message: string;
  id: number;
  type: string;
  position: {
    x: number;
    y: number;
  };
}

/**
 * Update position for any item (asset, collection, or knowledge base)
 */
export const updatePosition = async (
  workspaceId: number,
  positionData: PositionUpdate
): Promise<PositionResponse> => {
  try {
    const result = await apiClient.patch<PositionResponse>(
      `/workspaces/${workspaceId}/positions`,
      positionData
    );
    return result;
  } catch (error) {
    console.error("Failed to update position:", error);
    throw error;
  }
};

/**
 * Helper function to create position update object
 */
export const createPositionUpdate = (
  id: number,
  type: "asset" | "collection" | "kb",
  x: number,
  y: number
): PositionUpdate => ({
  id,
  type,
  x: Math.round(x), // Ensure integer positions
  y: Math.round(y),
});
