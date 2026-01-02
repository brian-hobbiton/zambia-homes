/**
 * User Management API Client
 * Handles all user-related API calls to backend
 */

import apiFetch from '@/lib/apiClient';
import {
    UserListRequest,
    UserListResponse,
    UserResponse,
    UpdateUserRequest,
    UpdateUserStatusRequest,
    UpdateUserRoleRequest,
    UserStatsResponse,
    KYCDocumentResponse,
    UploadKYCDocumentRequest,
} from '@/types/user';

const API_BASE = '/users';

/**
 * Get all users with filters and pagination (Admin only)
 */
export async function getUsers(request: UserListRequest): Promise<UserListResponse> {
    return apiFetch<UserListResponse>(API_BASE, {
        method: 'POST',
        body: JSON.stringify(request),
    });
}

/**
 * Get user by ID (User or Admin)
 */
export async function getUserById(userId: string): Promise<UserResponse> {
    return apiFetch<UserResponse>(`${API_BASE}/${userId}`, {
        method: 'GET',
    });
}

/**
 * Get current logged-in user profile
 */
export async function getCurrentUser(): Promise<UserResponse> {
    return apiFetch<UserResponse>(`${API_BASE}/me`, {
        method: 'GET',
    });
}

/**
 * Update user profile (User or Admin)
 */
export async function updateUserProfile(
    userId: string,
    data: UpdateUserRequest
): Promise<UserResponse> {
    return apiFetch<UserResponse>(`${API_BASE}/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

/**
 * Update current user profile
 */
export async function updateMyProfile(data: UpdateUserRequest): Promise<UserResponse> {
    return apiFetch<UserResponse>(`${API_BASE}/me`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

/**
 * Update user account status (Admin only)
 */
export async function updateUserStatus(
    userId: string,
    data: UpdateUserStatusRequest
): Promise<UserResponse> {
    return apiFetch<UserResponse>(`${API_BASE}/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

/**
 * Update user role (Admin only)
 */
export async function updateUserRole(
    userId: string,
    data: UpdateUserRoleRequest
): Promise<UserResponse> {
    return apiFetch<UserResponse>(`${API_BASE}/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

/**
 * Delete user (Admin only)
 */
export async function deleteUser(userId: string): Promise<void> {
    return apiFetch<void>(`${API_BASE}/${userId}`, {
        method: 'DELETE',
    });
}

/**
 * Get user statistics (Admin only)
 */
export async function getUserStats(): Promise<UserStatsResponse> {
    return apiFetch<UserStatsResponse>(`${API_BASE}/stats`, {
        method: 'GET',
    });
}

/**
 * Upload KYC document (Landlord only)
 */
export async function uploadKYCDocument(
    data: UploadKYCDocumentRequest
): Promise<KYCDocumentResponse> {
    return apiFetch<KYCDocumentResponse>(`${API_BASE}/me/kyc`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Get current user's KYC documents
 */
export async function getMyKYCDocuments(): Promise<KYCDocumentResponse[]> {
    const response = await apiFetch<any>(`${API_BASE}/me/kyc`, {
        method: 'GET',
    });

    // Handle both array response and object with documents property
    if (Array.isArray(response)) {
        return response;
    }

    // If response is an object with documents property, return the documents array
    if (response && Array.isArray(response.documents)) {
        return response.documents;
    }

    // Fallback to empty array if neither format
    return [];
}

/**
 * Get specific KYC document
 */
export async function getKYCDocument(documentId: string): Promise<KYCDocumentResponse> {
    return apiFetch<KYCDocumentResponse>(`${API_BASE}/me/kyc/${documentId}`, {
        method: 'GET',
    });
}

/**
 * Delete KYC document
 */
export async function deleteKYCDocument(documentId: string): Promise<void> {
    return apiFetch<void>(`${API_BASE}/me/kyc/${documentId}`, {
        method: 'DELETE',
    });
}

/**
 * Get all KYC documents (Admin only)
 */
export async function getAllKYCDocuments(status?: string): Promise<KYCDocumentResponse[]> {
    const query = status ? `?status=${status}` : '';
    const response = await apiFetch<any>(`${API_BASE}/kyc${query}`, {
        method: 'GET',
    });

    // Handle both array response and object with documents property
    if (Array.isArray(response)) {
        return response;
    }

    // If response is an object with documents property, return the documents array
    if (response && Array.isArray(response.documents)) {
        return response.documents;
    }

    // Fallback to empty array if neither format
    return [];
}

/**
 * Verify KYC document (Admin only)
 */
export async function verifyKYCDocument(
    documentId: string,
    status: string,
    reason?: string
): Promise<KYCDocumentResponse> {
    return apiFetch<KYCDocumentResponse>(`${API_BASE}/kyc/${documentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason }),
    });
}
