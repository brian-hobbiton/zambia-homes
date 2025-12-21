/**
 * Lease Agreements API Client
 */
import apiFetch from '@/lib/apiClient';
import {
  CreateLeaseRequest,
  UpdateLeaseRequest,
  TerminateLeaseRequest,
  RenewLeaseRequest,
  LeaseAgreementResponse,
  LeaseAgreementListResponse,
  ListLeasesRequest,
} from '@/types/lease';

const API_BASE = '/leases';

/**
 * Create a new lease agreement
 * Landlord or Admin only
 *
 * Can be created from:
 * - Approved application (provide applicationId)
 * - Manual creation (provide propertyId + tenantId)
 */
export async function createLease(
  data: CreateLeaseRequest
): Promise<LeaseAgreementResponse> {
  return apiFetch<LeaseAgreementResponse>(API_BASE, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * List lease agreements with filtering and pagination
 * Backend automatically filters by role:
 * - Tenant: sees only their leases
 * - Landlord: sees leases for their properties
 * - Admin: sees all leases
 */
export async function listLeases(
  request: ListLeasesRequest
): Promise<LeaseAgreementListResponse> {
  const params = new URLSearchParams();

  if (request.propertyId) params.append('propertyId', request.propertyId);
  if (request.tenantId) params.append('tenantId', request.tenantId);
  if (request.landlordId) params.append('landlordId', request.landlordId);
  if (request.status) params.append('status', request.status);
  if (request.startAfter) params.append('startAfter', request.startAfter);
  if (request.endBefore) params.append('endBefore', request.endBefore);
  if (request.sortBy) params.append('sortBy', request.sortBy);
  if (request.sortOrder) params.append('sortOrder', request.sortOrder);

  params.append('page', String(request.page || 1));
  params.append('pageSize', String(request.pageSize || 20));

  const endpoint = `${API_BASE}?${params.toString()}`;

  return apiFetch<LeaseAgreementListResponse>(endpoint, {
    method: 'GET',
  });
}

/**
 * Get a single lease agreement by ID
 * Access: Tenant (own), Landlord (property), Admin
 */
export async function getLease(id: string): Promise<LeaseAgreementResponse> {
  return apiFetch<LeaseAgreementResponse>(`${API_BASE}/${id}`, {
    method: 'GET',
  });
}

/**
 * Update a lease agreement
 * Landlord (property owner) or Admin only
 * Can only update Draft leases
 */
export async function updateLease(
  id: string,
  data: UpdateLeaseRequest
): Promise<LeaseAgreementResponse> {
  return apiFetch<LeaseAgreementResponse>(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Terminate an active lease agreement
 * Landlord (property owner) or Admin only
 * Can only terminate Active leases
 */
export async function terminateLease(
  id: string,
  data: TerminateLeaseRequest
): Promise<LeaseAgreementResponse> {
  return apiFetch<LeaseAgreementResponse>(`${API_BASE}/${id}/terminate`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Renew an active lease agreement
 * Landlord (property owner) or Admin only
 * Can only renew Active leases
 * Creates a new lease agreement
 */
export async function renewLease(
  id: string,
  data: RenewLeaseRequest
): Promise<LeaseAgreementResponse> {
  return apiFetch<LeaseAgreementResponse>(`${API_BASE}/${id}/renew`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

