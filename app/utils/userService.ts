// User service for fetching current user profile

import { UserPublic } from "../types/auth";
import { apiClient } from "./apiClient";

export const userService = {
  async getCurrentUser(): Promise<UserPublic> {
    return await apiClient.get<UserPublic>("/auth/me");
  },
};

export default userService;
