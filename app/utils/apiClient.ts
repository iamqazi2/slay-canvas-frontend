// Authenticated fetch client that automatically attaches access token

import { getAccessToken, removeAccessToken } from "./cookies";
import { store } from "@/app/redux/store";
import {
  incrementLoading,
  decrementLoading,
} from "@/app/redux/slices/loadingSlice";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000/api";

export interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

class AuthenticatedFetch {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { skipAuth = false, headers = {}, ...restOptions } = options;

    const url = `${this.baseURL}${endpoint}`;

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      ...(headers as Record<string, string>),
    };

    // Only set Content-Type if body is not FormData
    if (!(restOptions.body instanceof FormData)) {
      requestHeaders["Content-Type"] = "application/json";
    }

    // Add authorization header if not skipped and token exists
    if (!skipAuth) {
      const token = getAccessToken();

      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }
    }

    store.dispatch(incrementLoading());

    try {
      const response = await fetch(url, {
        ...restOptions,
        headers: requestHeaders,
        credentials: "include",
      });

      // Handle unauthorized responses
      if (response.status === 401) {
        removeAccessToken();
        window.location.href = "/form";
        throw new Error("Unauthorized - redirecting to login");
      }

      // Handle other error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      // Handle empty responses
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return response.text() as unknown as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    } finally {
      store.dispatch(decrementLoading());
    }
  }

  // GET request
  async get<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  // POST request
  async post<T>(
    endpoint: string,
    data?: unknown,
    options: FetchOptions = {}
  ): Promise<T> {
    let body: string | FormData | undefined;

    if (data instanceof FormData) {
      // Pass FormData directly
      body = data;
    } else if (data) {
      // JSON stringify for other data types
      body = JSON.stringify(data);
    }

    return this.makeRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: body,
    });
  }

  // PUT request
  async put<T>(
    endpoint: string,
    data?: unknown,
    options: FetchOptions = {}
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(
    endpoint: string,
    data?: unknown,
    options: FetchOptions = {}
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }

  // STREAMING request - for Server-Sent Events / streaming responses
  async stream(
    endpoint: string,
    data?: unknown,
    options: FetchOptions = {}
  ): Promise<ReadableStream<Uint8Array>> {
    const { skipAuth = false, headers = {}, ...restOptions } = options;

    const url = `${this.baseURL}${endpoint}`;

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      ...(headers as Record<string, string>),
    };

    // Only set Content-Type if body is not FormData
    if (!(restOptions.body instanceof FormData) && data) {
      requestHeaders["Content-Type"] = "application/json";
    }

    // Add authorization header if not skipped and token exists
    if (!skipAuth) {
      const token = getAccessToken();

      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }
    }

    let body: string | FormData | undefined;

    if (data instanceof FormData) {
      body = data;
    } else if (data) {
      body = JSON.stringify(data);
    }

    store.dispatch(incrementLoading());

    try {
      const response = await fetch(url, {
        ...restOptions,
        method: "POST",
        headers: requestHeaders,
        body: body,
      });

      // Handle unauthorized responses
      if (response.status === 401) {
        removeAccessToken();
        window.location.href = "/form";
        throw new Error("Unauthorized - redirecting to login");
      }

      // Handle other error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      return response.body;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    } finally {
      store.dispatch(decrementLoading());
    }
  }
}

// Export singleton instance
export const apiClient = new AuthenticatedFetch();

// Export class for custom instances if needed
export default AuthenticatedFetch;
