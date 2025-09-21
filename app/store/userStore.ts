// User store using Zustand for global state management

import { UserPublic } from "@/app/types/auth";
import { apiClient } from "@/app/utils/apiClient";
import { removeAccessToken, setAccessToken } from "@/app/utils/cookies";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  user: UserPublic | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: UserPublic) => void;
  setLoading: (loading: boolean) => void;
  login: (user: UserPublic, accessToken: string) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user: UserPublic) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      login: (user: UserPublic, accessToken: string) => {
        // Save token to cookies
        setAccessToken(accessToken);

        // Update store
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        // Remove token from cookies
        removeAccessToken();

        // Clear localStorage
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userOtp");

        // Clear store
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      fetchUser: async () => {
        try {
          set({ isLoading: true });

          const userData = await apiClient.get<UserPublic>("/auth/me");

          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error("Failed to fetch user:", error);

          // Clear auth state on error
          get().logout();
        }
      },

      clearUser: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
