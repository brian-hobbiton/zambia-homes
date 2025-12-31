'use client';

import {useCallback, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {UserResponse} from '@/types/auth';
import {logoutAction} from '@/lib/auth';
import {clearAuthTokens} from '@/lib/apiClient';

/**
 * Decode JWT token to extract user info
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

/**
 * Client-side auth hook
 * Reads token from localStorage and decodes user info
 * Listens to storage events to sync auth state across tabs
 */
export function useAuth() {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const loadUser = useCallback(() => {
        try {
            if (typeof window === 'undefined') {
                setIsLoading(false);
                return;
            }

            const token = localStorage.getItem('authToken');

            if (!token) {
                setUser(null);
                setIsLoading(false);
                return;
            }

            // Check if token is expired
            const decoded = decodeToken(token);
            if (decoded) {
                // Check expiration
                if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                    // Token expired, clear it
                    clearAuthTokens();
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                setUser({
                    id: decoded.sub || decoded.id,
                    email: decoded.email,
                    username: decoded.username,
                    firstName: decoded.firstName,
                    lastName: decoded.lastName,
                    fullName: decoded.fullName || `${decoded.firstName || ''} ${decoded.lastName || ''}`.trim(),
                    role: decoded.role as any,
                    avatarUrl: decoded.avatarUrl,
                });
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to load user:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();

        // Listen for storage changes (logout in other tabs)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'authToken') {
                loadUser();
            }
        };

        // Listen for custom auth events (logout in same tab)
        const handleAuthChange = () => {
            loadUser();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('auth-change', handleAuthChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('auth-change', handleAuthChange);
        };
    }, [loadUser]);

    const logout = useCallback(async () => {
        try {
            await logoutAction();
        } catch (error) {
            console.error('Logout server action failed:', error);
        } finally {
            // Always clear tokens and state, even if server action fails
            clearAuthTokens();
            setUser(null);

            // Dispatch custom event for same-tab listeners
            window.dispatchEvent(new Event('auth-change'));

            router.push('/');
            router.refresh();
        }
    }, [router]);

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        role: user?.role?.toLowerCase() || null,
        logout,
        refreshAuth: loadUser,
    };
}

