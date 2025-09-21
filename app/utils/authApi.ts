import {
  ApiResponse,
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "../types/auth";
import { apiClient } from "./apiClient";

class AuthApi {
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/auth/register",
        data,
        { skipAuth: true }
      );

      return {
        success: true,
        message: response.message,
        data: response,
      };
    } catch (error) {
      console.error("Register Error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Registration failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", data, {
        skipAuth: true,
      });

      return {
        success: true,
        message: response.message,
        data: response,
      };
    } catch (error) {
      console.error("Login Error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Login failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<{ message: string }>(
        "/auth/forgot-password",
        data,
        { skipAuth: true }
      );

      return {
        success: true,
        message: response.message || "Password reset email sent",
      };
    } catch (error) {
      console.error("Forgot Password Error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to send reset email",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<{ message: string }>(
        "/auth/reset-password",
        data,
        { skipAuth: true }
      );

      return {
        success: true,
        message: response.message || "Password reset successfully",
      };
    } catch (error) {
      console.error("Reset Password Error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to reset password",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export const authApi = new AuthApi();
