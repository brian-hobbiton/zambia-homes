/**
 * Property Management API Client
 * Handles all property-related API calls to backend
 */

import apiFetch from '@/lib/apiClient';
import {
    CreatePropertyRequest,
    UpdatePropertyRequest,
    PropertyResponse,
    PropertyListResponse,
    ListPropertiesRequest,
    PropertyStatsResponse,
} from '@/types/property';

const API_BASE = '/properties';

/**
 * Create a new property listing
 */
export async function createProperty(
    data: CreatePropertyRequest
): Promise<PropertyResponse> {
    return apiFetch<PropertyResponse>(API_BASE, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Get all properties with filters and pagination (public endpoint)
 */
export async function listProperties(
    request: ListPropertiesRequest
): Promise<PropertyListResponse> {
    // Build query parameters from request object
    const params = new URLSearchParams();

    if (request.search) params.append('search', request.search);
    if (request.city) params.append('city', request.city);
    if (request.province) params.append('province', request.province);
    if (request.propertyType) params.append('propertyType', request.propertyType);
    if (request.minPrice !== undefined) params.append('minPrice', request.minPrice.toString());
    if (request.maxPrice !== undefined) params.append('maxPrice', request.maxPrice.toString());
    if (request.minBedrooms !== undefined) params.append('minBedrooms', request.minBedrooms.toString());
    if (request.maxBedrooms !== undefined) params.append('maxBedrooms', request.maxBedrooms.toString());
    if (request.furnishingStatus) params.append('furnishingStatus', request.furnishingStatus);
    if (request.hasSecurity !== undefined) params.append('hasSecurity', request.hasSecurity.toString());
    if (request.boreholeWater !== undefined) params.append('boreholeWater', request.boreholeWater.toString());
    if (request.solarPower !== undefined) params.append('solarPower', request.solarPower.toString());
    if (request.availableNow !== undefined) params.append('availableNow', request.availableNow.toString());
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);

    params.append('page', request.page.toString());
    params.append('pageSize', request.pageSize.toString());

    const queryString = params.toString();
    const endpoint = `${API_BASE}${queryString ? '?' + queryString : ''}`;

    return apiFetch<PropertyListResponse>(endpoint, {
        method: 'GET',
        optionalAuth: true,
    });
}

/**
 * Get landlord's own properties with filters and pagination
 */
export async function listLandlordProperties(
    request: ListPropertiesRequest
): Promise<PropertyListResponse> {
    // Build query parameters from request object
    const params = new URLSearchParams();

    if (request.search) params.append('search', request.search);
    if (request.city) params.append('city', request.city);
    if (request.province) params.append('province', request.province);
    if (request.propertyType) params.append('propertyType', request.propertyType);
    if (request.minPrice !== undefined) params.append('minPrice', request.minPrice.toString());
    if (request.maxPrice !== undefined) params.append('maxPrice', request.maxPrice.toString());
    if (request.minBedrooms !== undefined) params.append('minBedrooms', request.minBedrooms.toString());
    if (request.maxBedrooms !== undefined) params.append('maxBedrooms', request.maxBedrooms.toString());
    if (request.furnishingStatus) params.append('furnishingStatus', request.furnishingStatus);
    if (request.hasSecurity !== undefined) params.append('hasSecurity', request.hasSecurity.toString());
    if (request.boreholeWater !== undefined) params.append('boreholeWater', request.boreholeWater.toString());
    if (request.solarPower !== undefined) params.append('solarPower', request.solarPower.toString());
    if (request.availableNow !== undefined) params.append('availableNow', request.availableNow.toString());
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);

    params.append('page', request.page.toString());
    params.append('pageSize', request.pageSize.toString());

    const queryString = params.toString();
    const endpoint = `${API_BASE}/landlord${queryString ? '?' + queryString : ''}`;

    return apiFetch<PropertyListResponse>(endpoint, {
        method: 'GET',
    });
}

/**
 * Get all properties for admin with filters and pagination (Admin only)
 */
export async function listAdminProperties(
    request: ListPropertiesRequest
): Promise<PropertyListResponse> {
    // Build query parameters from request object
    const params = new URLSearchParams();

    if (request.search) params.append('search', request.search);
    if (request.city) params.append('city', request.city);
    if (request.province) params.append('province', request.province);
    if (request.propertyType) params.append('propertyType', request.propertyType);
    if (request.minPrice !== undefined) params.append('minPrice', request.minPrice.toString());
    if (request.maxPrice !== undefined) params.append('maxPrice', request.maxPrice.toString());
    if (request.minBedrooms !== undefined) params.append('minBedrooms', request.minBedrooms.toString());
    if (request.maxBedrooms !== undefined) params.append('maxBedrooms', request.maxBedrooms.toString());
    if (request.furnishingStatus) params.append('furnishingStatus', request.furnishingStatus);
    if (request.hasSecurity !== undefined) params.append('hasSecurity', request.hasSecurity.toString());
    if (request.boreholeWater !== undefined) params.append('boreholeWater', request.boreholeWater.toString());
    if (request.solarPower !== undefined) params.append('solarPower', request.solarPower.toString());
    if (request.availableNow !== undefined) params.append('availableNow', request.availableNow.toString());
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortOrder) params.append('sortOrder', request.sortOrder);

    params.append('page', request.page.toString());
    params.append('pageSize', request.pageSize.toString());

    const queryString = params.toString();
    const endpoint = `${API_BASE}/admin${queryString ? '?' + queryString : ''}`;

    return apiFetch<PropertyListResponse>(endpoint, {
        method: 'GET',
    });
}

/**
 * Get a specific property by ID
 */
export async function getPropertyById(propertyId: string): Promise<PropertyResponse> {
    return apiFetch<PropertyResponse>(`${API_BASE}/${propertyId}`, {
        method: 'GET',
        optionalAuth: true,
    });
}

/**
 * Update an existing property
 */
export async function updateProperty(
    propertyId: string,
    data: UpdatePropertyRequest
): Promise<PropertyResponse> {
    return apiFetch<PropertyResponse>(`${API_BASE}/${propertyId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a property
 */
export async function deleteProperty(propertyId: string): Promise<void> {
    return apiFetch<void>(`${API_BASE}/${propertyId}`, {
        method: 'DELETE',
    });
}

/**
 * Get property statistics for landlord
 */
export async function getPropertyStats(): Promise<PropertyStatsResponse> {
    return apiFetch<PropertyStatsResponse>(`${API_BASE}/stats`, {
        method: 'GET',
    });
}

/**
 * Get landlord's property statistics
 */
export async function getLandlordPropertyStats(): Promise<PropertyStatsResponse> {
    return apiFetch<PropertyStatsResponse>(`${API_BASE}/landlord/stats`, {
        method: 'GET',
    });
}

/**
 * Update property status (Admin only)
 * Use this to approve, activate, suspend, or change any property status
 */
export async function updatePropertyStatus(
    propertyId: string,
    status: string
): Promise<PropertyResponse> {
    return apiFetch<PropertyResponse>(`${API_BASE}/${propertyId}`, {
        method: 'PUT',
        body: JSON.stringify({status}),
    });
}

/**
 * Approve a property - sets status to Active (Admin only)
 */
export async function approveProperty(propertyId: string): Promise<PropertyResponse> {
    return updatePropertyStatus(propertyId, 'active');
}

/**
 * Reject a property - sets status to Draft (Admin only)
 */
export async function rejectProperty(propertyId: string): Promise<PropertyResponse> {
    return updatePropertyStatus(propertyId, 'draft');
}

/**
 * Suspend a property - sets status to Suspended (Admin only)
 */
export async function suspendProperty(propertyId: string): Promise<PropertyResponse> {
    return updatePropertyStatus(propertyId, 'suspended');
}

/**
 * Activate a property - sets status to Active (Admin only)
 */
export async function activateProperty(propertyId: string): Promise<PropertyResponse> {
    return updatePropertyStatus(propertyId, 'active');
}

/**
 * Mark property as under maintenance (Admin only)
 */
export async function markPropertyUnderMaintenance(propertyId: string): Promise<PropertyResponse> {
    return updatePropertyStatus(propertyId, 'underMaintenance');
}
