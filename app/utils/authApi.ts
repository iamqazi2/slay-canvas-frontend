import {
  ApiResponse,
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "../types/auth";
import { BASE_URL } from "./constants";

const url = BASE_URL + "/api/auth";

class AuthApi {
  private async makeRequest<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "POST",
    body?: unknown
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${url}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return {
        success: true,
        message: data.message || "Success",
        data: data,
      };
    } catch (error) {
      console.error("API Error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "An error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest<AuthResponse>("/register", "POST", data);
  }

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest<AuthResponse>("/login", "POST", data);
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
    return this.makeRequest("/forgot-password", "POST", data);
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
    return this.makeRequest("/reset-password", "POST", data);
  }
}

export const authApi = new AuthApi();
