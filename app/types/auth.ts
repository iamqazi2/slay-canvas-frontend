// Authentication API Types

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  confirm_password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  new_password: string;
  confirm_password: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface UserPublic {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
  is_active: boolean;
  subscription_plan: string;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  user: UserPublic;
  access_token: string;
  token_type: string;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}
