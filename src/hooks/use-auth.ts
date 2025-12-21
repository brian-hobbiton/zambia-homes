'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {UserResponse} from '@/types/auth';
import {logoutAction, clearAuthTokens} from '@/lib/auth';

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
 */
export function useAuth() {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        function loadUser() {
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

                // Decode JWT token
                const decoded = decodeToken(token);
                if (decoded) {
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
        }

        loadUser();
    }, []);

    const logout = async () => {
        try {
            await logoutAction();
            clearAuthTokens();
            setUser(null);
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        role: user?.role?.toLowerCase() || null,
        logout,
    };
}

