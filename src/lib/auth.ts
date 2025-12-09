'use server';

/**
 * Authentication Service
 * Server actions for secure auth operations
 * Tokens stored in localStorage on client side
 */

import {
    AuthError,
    LoginRequest,
    LoginResponse,
    UserCreateDto,
    UserResponseDto,
} from '@/types/auth';

const API_BASE_URL = 'http://localhost:5191';

/**
 * Server-side API fetch (has access to environment variables)
 */
async function serverApiFetch<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });

    if (!response.ok) {
        try {
            const errorData = await response.json() as Record<string, unknown>;

            // Extract the actual error message
            let errorMessage = (errorData.message as string) || `HTTP ${response.status}`;
            const errors = (errorData.errors as Record<string, string[]>) || {};

            // Check for generalErrors array first
            if (errors.generalErrors && Array.isArray(errors.generalErrors) && errors.generalErrors.length > 0) {
                errorMessage = errors.generalErrors[0];
            }

            throw new AuthError(
                response.status,
                errors,
                errorMessage
            );
        } catch (error) {
            if (error instanceof AuthError) throw error;
            throw new AuthError(
                response.status,
                undefined,
                `HTTP ${response.status}: ${response.statusText}`
            );
        }
    }

    const data = await response.json() as T;
    return data;
}

/**
 * Login server action
 * POST /auth/login
 * Returns tokens to client to store in localStorage
 */
export async function loginAction(
    email: string,
    password: string,
    rememberMe: boolean = false
): Promise<LoginResponse> {
    try {
        const payload: LoginRequest = {
            email,
            password,
            rememberMe,
        };

        const response = await serverApiFetch<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        // Return tokens - client will store in localStorage
        return response;
    } catch (error) {
        if (error instanceof AuthError) {
            throw error;
        }
        throw new AuthError(500, undefined, 'Login failed');
    }
}

/**
 * Register server action
 * POST /auth/register
 */
export async function registerAction(
    data: UserCreateDto
): Promise<UserResponseDto> {
    try {
        // Validate required fields
        if (!data.password) {
            throw new AuthError(
                400,
                {password: ['Password is required']},
                'Password is required'
            );
        }

        const response = await serverApiFetch<UserResponseDto>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        return response;
    } catch (error) {
        if (error instanceof AuthError) {
            throw error;
        }
        throw new AuthError(500, undefined, 'Registration failed');
    }
}

/**
 * Clear all auth tokens (client-side)
 */
export async function clearAuthTokens(): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
}

/**
 * Logout server action
 * Note: Tokens are cleared on client side via localStorage
 */
export async function logoutAction(): Promise<void> {
    try {
        // Server-side logout - add any cleanup needed here
        // Client will clear localStorage tokens separately
    } catch (error) {
        console.error('Logout error:', error);
        throw new AuthError(500, undefined, 'Logout failed');
    }
}

/**
 * Get current user endpoint (client should handle this)
 * Uses the token from localStorage to call backend
 */
export async function getCurrentUserAction(): Promise<UserResponseDto | null> {
    // This should be called from client-side using the token from localStorage
    // Or you can implement server-side by reading from a request header
    return null;
}

