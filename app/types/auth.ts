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

export interface AuthResponse {
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}