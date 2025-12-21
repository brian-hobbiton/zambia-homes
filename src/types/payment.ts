/**
 * Payment Schedule Types
 * Based on backend API reference
 */

// Enums
export enum PaymentStatus {
  Pending = 'Pending',
  PartiallyPaid = 'PartiallyPaid',
  Paid = 'Paid',
  Overdue = 'Overdue',
  Waived = 'Waived',
  Refunded = 'Refunded',
  Cancelled = 'Cancelled',
}

export enum PaymentType {
  Rent = 'Rent',
  SecurityDeposit = 'SecurityDeposit',
  AgencyFee = 'AgencyFee',
  LateFee = 'LateFee',
  Utilities = 'Utilities',
  MaintenanceCharge = 'MaintenanceCharge',
  Repairs = 'Repairs',
  PetDeposit = 'PetDeposit',
  KeyDeposit = 'KeyDeposit',
  CleaningFee = 'CleaningFee',
  Other = 'Other',
}

// Request DTOs
export interface CreatePaymentScheduleRequest {
  leaseId: string;
  paymentType: PaymentType;
  amount: number;
  dueDate: string; // ISO date
  description?: string;
  notes?: string;
}

export interface UpdatePaymentRequest {
  dueDate?: string; // ISO date
  amount?: number;
  description?: string;
  notes?: string;
}

export interface RecordPaymentRequest {
  amount: number; // Must be > 0
  paymentMethod: string; // e.g., "Bank Transfer", "Mobile Money", "Cash"
  transactionReference?: string;
  paymentProofUrl?: string; // URL to uploaded receipt/proof
  notes?: string;
}

export interface WaivePaymentRequest {
  reason: string; // Required explanation
}

export interface RefundPaymentRequest {
  amount: number; // Must be > 0 and <= paid amount
  transactionReference?: string;
  reason?: string;
}

// Response DTOs
export interface PaymentScheduleResponse {
  id: string;
  leaseId: string;
  leasePropertyTitle?: string;
  leaseTenantName?: string;
  paymentType: PaymentType;
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: PaymentStatus;
  description?: string;
  notes?: string;
  paidAt?: string;
  paymentMethod?: string;
  transactionReference?: string;
  paymentProofUrl?: string;
  waivedAt?: string;
  waivedBy?: string;
  waivedReason?: string;
  refundedAt?: string;
  refundedAmount?: number;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentScheduleListItem {
  id: string;
  leaseId: string;
  leasePropertyTitle?: string;
  leaseTenantName?: string;
  paymentType: PaymentType;
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: PaymentStatus;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentScheduleListResponse {
  payments: PaymentScheduleListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// List Query Parameters
export interface ListPaymentsRequest {
  leaseId?: string;
  status?: PaymentStatus;
  paymentType?: PaymentType;
  dueAfter?: string; // ISO date
  dueBefore?: string; // ISO date
  paidAfter?: string; // ISO date
  paidBefore?: string; // ISO date
  sortBy?: 'duedate' | 'amount' | 'status' | 'paidat';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

