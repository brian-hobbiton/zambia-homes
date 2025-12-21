/**
 * Payment Schedules API Client
 */
import apiFetch from '@/lib/apiClient';
import {
  CreatePaymentScheduleRequest,
  UpdatePaymentRequest,
  RecordPaymentRequest,
  WaivePaymentRequest,
  RefundPaymentRequest,
  PaymentScheduleResponse,
  PaymentScheduleListResponse,
  ListPaymentsRequest,
} from '@/types/payment';

const API_BASE = '/leases/payments';

/**
 * Create a new payment schedule entry
 * Landlord or Admin only
 */
export async function createPaymentSchedule(
  data: CreatePaymentScheduleRequest
): Promise<PaymentScheduleResponse> {
  return apiFetch<PaymentScheduleResponse>(API_BASE, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * List payment schedules with filtering and pagination
 * Backend automatically filters by role:
 * - Tenant: sees only their lease payments
 * - Landlord: sees payments for their leases
 * - Admin: sees all payments
 */
export async function listPayments(
  request: ListPaymentsRequest
): Promise<PaymentScheduleListResponse> {
  const params = new URLSearchParams();

  if (request.leaseId) params.append('leaseId', request.leaseId);
  if (request.status) params.append('status', request.status);
  if (request.paymentType) params.append('paymentType', request.paymentType);
  if (request.dueAfter) params.append('dueAfter', request.dueAfter);
  if (request.dueBefore) params.append('dueBefore', request.dueBefore);
  if (request.paidAfter) params.append('paidAfter', request.paidAfter);
  if (request.paidBefore) params.append('paidBefore', request.paidBefore);
  if (request.sortBy) params.append('sortBy', request.sortBy);
  if (request.sortOrder) params.append('sortOrder', request.sortOrder);

  params.append('page', String(request.page || 1));
  params.append('pageSize', String(request.pageSize || 20));

  const endpoint = `${API_BASE}?${params.toString()}`;

  return apiFetch<PaymentScheduleListResponse>(endpoint, {
    method: 'GET',
  });
}

/**
 * Get a single payment schedule by ID
 * Access: Tenant (own lease), Landlord (own lease), Admin
 */
export async function getPayment(id: string): Promise<PaymentScheduleResponse> {
  return apiFetch<PaymentScheduleResponse>(`${API_BASE}/${id}`, {
    method: 'GET',
  });
}

/**
 * Update a payment schedule entry
 * Landlord or Admin only
 * Can only update unpaid or partially paid payments
 */
export async function updatePayment(
  id: string,
  data: UpdatePaymentRequest
): Promise<PaymentScheduleResponse> {
  return apiFetch<PaymentScheduleResponse>(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Record a payment received
 * Landlord or Admin only
 */
export async function recordPayment(
  id: string,
  data: RecordPaymentRequest
): Promise<PaymentScheduleResponse> {
  return apiFetch<PaymentScheduleResponse>(`${API_BASE}/${id}/record`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Waive a payment (mark as not required)
 * Landlord or Admin only
 * Can only waive unpaid or partially paid payments
 */
export async function waivePayment(
  id: string,
  data: WaivePaymentRequest
): Promise<PaymentScheduleResponse> {
  return apiFetch<PaymentScheduleResponse>(`${API_BASE}/${id}/waive`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Refund a payment
 * Landlord or Admin only
 * Can only refund paid payments
 */
export async function refundPayment(
  id: string,
  data: RefundPaymentRequest
): Promise<PaymentScheduleResponse> {
  return apiFetch<PaymentScheduleResponse>(`${API_BASE}/${id}/refund`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

