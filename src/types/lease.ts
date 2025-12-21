/**
 * Lease Agreement Types
 * Based on backend API reference
 */

// Enums
export enum LeaseStatus {
  Draft = 'Draft',
  PendingTenantSignature = 'PendingTenantSignature',
  PendingLandlordSignature = 'PendingLandlordSignature',
  Active = 'Active',
  Expired = 'Expired',
  Terminated = 'Terminated',
  Renewed = 'Renewed',
}

export enum LeaseType {
  Fixed = 'Fixed',
  MonthToMonth = 'MonthToMonth',
  RentToOwn = 'RentToOwn',
}

export enum TerminationReason {
  EndOfTerm = 'EndOfTerm',
  EarlyTerminationByTenant = 'EarlyTerminationByTenant',
  EarlyTerminationByLandlord = 'EarlyTerminationByLandlord',
  Eviction = 'Eviction',
  MutualAgreement = 'MutualAgreement',
  Breach = 'Breach',
  Other = 'Other',
}

// Request DTOs
export interface CreateLeaseRequest {
  // Option 1: From approved application
  applicationId?: string;

  // Option 2: Manual creation
  propertyId?: string;
  tenantId?: string;

  // Required lease terms
  startDate: string; // ISO date
  endDate: string; // ISO date
  monthlyRent: number;
  securityDeposit: number;
  leaseType: LeaseType;

  // Optional terms
  currency?: string;
  paymentDueDay?: number; // 1-31
  lateFeeAmount?: number;
  lateFeeGraceDays?: number;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  sublettingAllowed?: boolean;
  maintenanceResponsibilities?: string;
  utilitiesIncluded?: string[];
  specialTerms?: string;
  landlordSignatureRequired?: boolean;
}

export interface UpdateLeaseRequest {
  startDate?: string;
  endDate?: string;
  monthlyRent?: number;
  securityDeposit?: number;
  leaseType?: LeaseType;
  paymentDueDay?: number;
  lateFeeAmount?: number;
  lateFeeGraceDays?: number;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  sublettingAllowed?: boolean;
  maintenanceResponsibilities?: string;
  utilitiesIncluded?: string[];
  specialTerms?: string;
  tenantSignatureUrl?: string;
  tenantSignedAt?: string;
  landlordSignatureUrl?: string;
  landlordSignedAt?: string;
}

export interface TerminateLeaseRequest {
  terminationDate: string; // ISO date
  reason: TerminationReason;
  notes?: string;
}

export interface RenewLeaseRequest {
  newStartDate: string; // ISO date
  newEndDate: string; // ISO date
  newMonthlyRent?: number;
  newSecurityDeposit?: number;
  newLeaseType?: LeaseType;
  changes?: string; // Description of any changes from previous lease
}

// Response DTOs
export interface LeaseAgreementResponse {
  id: string;
  applicationId?: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress?: string;
  tenantId: string;
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  landlordId: string;
  landlordName: string;
  landlordEmail?: string;
  landlordPhone?: string;
  status: LeaseStatus;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  leaseType: LeaseType;
  currency: string;
  paymentDueDay: number;
  lateFeeAmount?: number;
  lateFeeGraceDays?: number;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  sublettingAllowed: boolean;
  maintenanceResponsibilities?: string;
  utilitiesIncluded?: string[];
  specialTerms?: string;
  tenantSignatureUrl?: string;
  tenantSignedAt?: string;
  landlordSignatureUrl?: string;
  landlordSignedAt?: string;
  terminationDate?: string;
  terminationReason?: TerminationReason;
  terminationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaseAgreementListItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  tenantId: string;
  tenantName: string;
  landlordId: string;
  landlordName: string;
  status: LeaseStatus;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  leaseType: LeaseType;
  createdAt: string;
}

export interface LeaseAgreementListResponse {
  leases: LeaseAgreementListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// List Query Parameters
export interface ListLeasesRequest {
  propertyId?: string;
  tenantId?: string;
  landlordId?: string;
  status?: LeaseStatus;
  startAfter?: string; // ISO date
  endBefore?: string; // ISO date
  sortBy?: 'startdate' | 'enddate' | 'rent';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

