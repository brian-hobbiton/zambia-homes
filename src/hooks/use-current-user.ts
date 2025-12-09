'use client';

import { useEffect, useState } from 'react';
import { UserResponse, AuthError } from '@/types/auth';

/**
 * Hook to get current user from the backend
 * This is a client-side hook that calls the server action
 */
export function useCurrentUser() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        // Extract user from JWT token (if available)
        // For a more robust solution, call a /auth/me endpoint
        const token = getCookieValue('authToken');

        if (!token) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Decode the token to extract user info
        const decoded = decodeToken(token);
        if (decoded) {
          setUser({
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role as any,
            fullName: decoded.fullName,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to get user'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, isLoading, error };
}

/**
 * Helper function to get cookie value by name
 */
function getCookieValue(name: string): string | null {
  if (typeof window === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  }
  return null;
}

/**
 * Helper function to decode JWT token
 * Note: This is a basic implementation. For production, use jwt-decode
 */
function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

