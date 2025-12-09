/**
 * User Management Types
 * Based on .NET FastEndpoints backend DTOs
 */

import { AccountStatus, GenderType, UserRole } from '@/types/auth';

// Request DTOs
export interface UserListRequest {
  search?: string;
  role?: UserRole;
  status?: AccountStatus;
  city?: string;
  isKYCVerified?: boolean;
  createdAfter?: string; // ISO 8601
  createdBefore?: string; // ISO 8601
  sortBy?: 'created' | 'name' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phoneNumber?: string;
  dateOfBirth?: string; // ISO 8601
  gender?: GenderType;
  bio?: string;
  avatarUrl?: string;
}

export interface UpdateUserStatusRequest {
  status: AccountStatus;
  reason?: string;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
  reason?: string;
}

export interface UploadKYCDocumentRequest {
  documentType: KYCDocumentType;
  documentNumber: string;
  documentUrl: string; // Base64 or URL
  thumbnailUrl?: string;
  issueDate: string; // ISO 8601
  expiryDate: string; // ISO 8601
  notes?: string;
}

// Response DTOs
export interface UserListResponse {
  users: UserResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserResponse {
  id: string; // GUID
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  gender: GenderType;
  role: UserRole;
  status: AccountStatus;
  fullName?: string;
  age?: number;
  isKYCVerified: boolean;
  kycVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  emailVerifiedAt?: string;
  bio?: string;

  // For landlords
  propertyCount: number;
  activePropertyCount: number;

  // For tenants
  currentRental?: PropertyResponse;

  // KYC Documents
  kycDocuments?: KYCDocumentResponse[];
}

export interface UserStatsResponse {
  totalUsers: number;
  totalLandlords: number;
  totalTenants: number;
  totalAdmins: number;
  activeUsers: number;
  pendingUsers: number;
  kycVerifiedLandlords: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export interface KYCDocumentResponse {
  id: string; // GUID
  documentType: KYCDocumentType;
  documentNumber: string;
  documentUrl: string;
  status: KYCDocumentStatus;
  issueDate: string;
  expiryDate: string;
  createdAt: string;
  isValid: boolean;
  isExpired: boolean;
}

// Enums
export type KYCDocumentType = 'passport' | 'nationalId' | 'driverLicense';

export type KYCDocumentStatus = 'pending' | 'verified' | 'rejected';

// Property reference (minimal, for currentRental)
export interface PropertyResponse {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: string;
  [key: string]: any;
}

