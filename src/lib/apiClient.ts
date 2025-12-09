/**
 * API Client for backend communication
 * Handles JWT token management and typed errors
 * Uses localStorage for token storage
 */

import { AuthError, FastEndpointsErrorResponse } from '@/types/auth';

const API_BASE_URL = 'http://localhost:5191';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Get token from localStorage
 */
function getTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

/**
 * Get refresh token from localStorage
 */
function getRefreshTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

/**
 * Save tokens to localStorage
 */
export function setAuthTokens(token: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
  localStorage.setItem('refreshToken', refreshToken);
}

/**
 * Clear all auth tokens from localStorage
 */
export function clearAuthTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiry');
}

/**
 * Main API fetch wrapper with authentication handling
 * - Automatically attaches JWT token from localStorage
 * - Handles 401 responses by redirecting to login
 * - Provides typed error responses
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    skipAuth = false,
    ...fetchOptions
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  // Attach JWT token if not skipping auth
  if (!skipAuth) {
    const token = getTokenFromStorage();
    if (!token) {
      // No token, redirect to home
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      throw new AuthError(401, undefined, 'Not authenticated');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle 401: Unauthorized - Token expired or invalid
    if (response.status === 401) {
      console.warn('Received 401 from backend, clearing tokens and redirecting to login', {
        url,
      });
      clearAuthTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      throw new AuthError(401, undefined, 'Session expired. Please log in again.');
    }

    // Handle other non-2xx responses
    if (!response.ok) {
      return handleErrorResponse(response);
    }

    // Parse and return successful response
    const data = await response.json() as T;
    return data;
  } catch (error) {
    // If it's already an AuthError, re-throw it
    if (error instanceof AuthError) {
      throw error;
    }
    // Otherwise, throw a generic error
    throw error;
  }
}

/**
 * Handles error responses from the backend
 * Throws typed AuthError with FastEndpoints error format
 */
async function handleErrorResponse(response: Response): Promise<never> {
  try {
    const errorData = await response.json() as FastEndpointsErrorResponse;
    throw new AuthError(
      errorData.statusCode || response.status,
      errorData.errors,
      errorData.message || `HTTP ${response.status}`
    );
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    // Fallback if response is not JSON
    throw new AuthError(
      response.status,
      undefined,
      `HTTP ${response.status}: ${response.statusText}`
    );
  }
}


export default apiFetch;

