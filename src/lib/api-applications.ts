/**
 * Rental Applications API Client
 */
import apiFetch from '@/lib/apiClient';
import {
  CreateRentalApplicationRequest,
  UpdateRentalApplicationRequest,
  ReviewApplicationRequest,
  RentalApplicationResponse,
  RentalApplicationListResponse,
  ListApplicationsRequest,
} from '@/types/application';

const API_BASE = '/leases/applications';

/**
 * Create a new rental application
 * Tenant role required
 */
export async function createApplication(
  data: CreateRentalApplicationRequest
): Promise<RentalApplicationResponse> {
  return apiFetch<RentalApplicationResponse>(API_BASE, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * List rental applications with filtering and pagination
 * Backend automatically filters by role:
 * - Tenant: sees only their applications
 * - Landlord: sees applications for their properties
 * - Admin: sees all applications
 */
export async function listApplications(
  request: ListApplicationsRequest
): Promise<RentalApplicationListResponse> {
  const params = new URLSearchParams();

  if (request.propertyId) params.append('propertyId', request.propertyId);
  if (request.tenantId) params.append('tenantId', request.tenantId);
  if (request.status) params.append('status', request.status);
  if (request.stage) params.append('stage', request.stage);
  if (request.submittedAfter) params.append('submittedAfter', request.submittedAfter);
  if (request.submittedBefore) params.append('submittedBefore', request.submittedBefore);
  if (request.sortBy) params.append('sortBy', request.sortBy);
  if (request.sortOrder) params.append('sortOrder', request.sortOrder);

  params.append('page', String(request.page || 1));
  params.append('pageSize', String(request.pageSize || 20));

  const endpoint = `${API_BASE}?${params.toString()}`;

  return apiFetch<RentalApplicationListResponse>(endpoint, {
    method: 'GET',
  });
}

/**
 * Get a single rental application by ID
 * Access: Tenant (own), Landlord (property), Admin
 */
export async function getApplication(id: string): Promise<RentalApplicationResponse> {
  return apiFetch<RentalApplicationResponse>(`${API_BASE}/${id}`, {
    method: 'GET',
  });
}

/**
 * Update a rental application
 * Tenant can update draft applications only
 * Admin can update any
 */
export async function updateApplication(
  id: string,
  data: UpdateRentalApplicationRequest
): Promise<RentalApplicationResponse> {
  return apiFetch<RentalApplicationResponse>(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Review an application (approve, reject, request info)
 * Landlord (property owner) or Admin only
 */
export async function reviewApplication(
  id: string,
  data: ReviewApplicationRequest
): Promise<RentalApplicationResponse> {
  return apiFetch<RentalApplicationResponse>(`${API_BASE}/${id}/review`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Withdraw an application
 * Tenant (own application) only
 */
export async function withdrawApplication(id: string): Promise<RentalApplicationResponse> {
  return apiFetch<RentalApplicationResponse>(`${API_BASE}/${id}/withdraw`, {
    method: 'POST',
  });
}

/**
 * Delete a rental application
 * Tenant can delete own draft applications
 * Admin can delete any
 */
export async function deleteApplication(id: string): Promise<void> {
  return apiFetch<void>(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
}

