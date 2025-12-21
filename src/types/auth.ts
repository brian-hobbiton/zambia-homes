/**
 * Authentication Types
 * Based on FastEndpoints backend OpenAPI schema
 */

// Enums - matching backend lowercase values
export type UserRole = 'admin' | 'tenant' | 'landlord' | 'user';

export type GenderType = 'male' | 'female' | 'other' | 'preferNotToSay';

export type AccountStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'suspended'
  | 'deleted'
  | 'kyC_Verification_Required'
  | 'kyC_Verification_Pending'
  | 'kyC_Verified';

// Request DTOs
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UserCreateDto {
  email?: string;
  username?: string;
  password: string; // Required
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  middleName?: string | null;
  dateOfBirth?: string | null; // ISO 8601 datetime
  gender?: GenderType;
  role?: UserRole;
}

// Response DTOs
export interface LoginResponse {
  token: string;
  refreshToken: string;
  tokenExpiry: string; // ISO 8601 datetime
  user: UserResponse;
}

export interface UserResponse {
  id: string; // GUID
  email?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  avatarUrl?: string | null;
  gender?: GenderType;
  role?: UserRole;
  status?: AccountStatus;
  fullName?: string | null;
  age?: number | null;
  lastLoginAt?: string | null;
  emailVerifiedAt?: string | null;
  bio?: string | null;
  isKYCVerified?: boolean;
  kycVerifiedAt?: string | null;
  properties?: unknown[] | null;
  rentedProperty?: unknown | null;
  kycDocuments?: unknown[] | null;
}

export interface UserResponseDto {
  id: string; // GUID
  email?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  avatarUrl?: string | null;
  gender: GenderType;
  role: UserRole;
  status: AccountStatus;
  fullName?: string | null;
  age?: number | null;
  lastLoginAt?: string | null;
  emailVerifiedAt?: string | null;
  bio?: string | null;
  isKYCVerified: boolean;
  kycVerifiedAt?: string | null;
  properties?: unknown[] | null;
  rentedProperty?: unknown | null;
  kycDocuments?: unknown[] | null;
}

// Error Response
export interface FastEndpointsErrorResponse {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}

// Local auth state
export interface AuthState {
  isAuthenticated: boolean;
  user: UserResponse | null;
  token: string | null;
  refreshToken: string | null;
  tokenExpiry: string | null;
  isLoading: boolean;
  error: string | null;
}

// Custom error class
export class AuthError extends Error {
  constructor(
    public statusCode: number,
    public errors?: Record<string, string[]>,
    message: string = 'Authentication failed'
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

