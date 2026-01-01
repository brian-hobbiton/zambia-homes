/**
 * API Client for backend communication
 * Handles JWT token management and typed errors
 * Uses localStorage for token storage
 */

import { AuthError, FastEndpointsErrorResponse } from '@/types/auth';

// const API_BASE_URL = 'http://localhost:5191';

//Production
const API_BASE_URL = 'https://zambiahomesapi-production.up.railway.app/api';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  optionalAuth?: boolean;
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
    optionalAuth = false,
    ...fetchOptions
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  // Only set Content-Type for requests with a body (POST, PUT, PATCH)
  const method = (fetchOptions.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'DELETE' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  console.log(`API Fetch: ${fetchOptions.method || 'GET'} ${url}`);
  console.log('Options:', fetchOptions);

  // Attach JWT token if not skipping auth
  const token = getTokenFromStorage();
  if (!skipAuth && !token) {
    if (!optionalAuth) {
      // No token, redirect to home
      if (typeof window !== 'undefined') {
        // Prevent infinite loop if already on home page
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
      throw new AuthError(401, undefined, 'Not authenticated');
    }
  } else if (token) {
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
        // Prevent infinite loop if already on home page
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
      throw new AuthError(401, undefined, 'Session expired. Please log in again.');
    }

    console.log(`API Response: ${response.status} ${response.statusText} for ${url}`);
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
    console.log('API Error Response Data:', errorData);

    // Extract error message: use generalErrors if available, otherwise use main message
    let errorMessage = errorData.message || `HTTP ${response.status}`;
    if (errorData.errors?.generalErrors && Array.isArray(errorData.errors.generalErrors)) {
      // Join all general errors into a single string
      errorMessage = errorData.errors.generalErrors.join('; ');
    }

    throw new AuthError(
      errorData.statusCode || response.status,
      errorData.errors,
      errorMessage
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
