/**
 * Property Inquiries API Client
 */
import apiFetch from '@/lib/apiClient';
import {
  CreatePropertyInquiryRequest,
  PropertyInquiryResponse,
  PropertyInquiryListResponse,
  ListPropertyInquiriesRequest,
  UpdatePropertyInquiryRequest,
} from '@/types/inquiry';

const API_BASE = '/properties/inquiries';

/**
 * Create a new property inquiry (Tenant/User/Landlord)
 */
export async function createPropertyInquiry(
  data: CreatePropertyInquiryRequest
): Promise<PropertyInquiryResponse> {
  return apiFetch<PropertyInquiryResponse>(API_BASE, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * List property inquiries (filter by propertyId, isRead, pagination)
 */
export async function listPropertyInquiries(
  request: ListPropertyInquiriesRequest
): Promise<PropertyInquiryListResponse> {
  const params = new URLSearchParams();
  if (request.propertyId) params.append('propertyId', request.propertyId);
  if (request.isRead !== undefined) params.append('isRead', String(request.isRead));
  if (request.sortBy) params.append('sortBy', request.sortBy);
  if (request.sortOrder) params.append('sortOrder', request.sortOrder);
  params.append('page', String(request.page));
  params.append('pageSize', String(request.pageSize));

  const endpoint = `${API_BASE}?${params.toString()}`;
  return apiFetch<PropertyInquiryListResponse>(endpoint, {
    method: 'GET',
  });
}

/**
 * Get a single inquiry by ID
 */
export async function getPropertyInquiry(id: string): Promise<PropertyInquiryResponse> {
  return apiFetch<PropertyInquiryResponse>(`${API_BASE}/${id}`, {
    method: 'GET',
  });
}

/**
 * Update an inquiry (e.g., mark as read)
 */
export async function updatePropertyInquiry(
  id: string,
  data: UpdatePropertyInquiryRequest
): Promise<PropertyInquiryResponse> {
  return apiFetch<PropertyInquiryResponse>(`${API_BASE}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete an inquiry
 */
export async function deletePropertyInquiry(id: string): Promise<void> {
  return apiFetch<void>(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
}

