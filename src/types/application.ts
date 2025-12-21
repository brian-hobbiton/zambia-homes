/**
 * Rental Application Types
 * Based on backend API reference
 */

// Enums
export enum ApplicationStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  UnderReview = 'UnderReview',
  AdditionalInfoRequested = 'AdditionalInfoRequested',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Withdrawn = 'Withdrawn',
  Expired = 'Expired',
}

export enum ApplicationStage {
  InitialSubmission = 'InitialSubmission',
  DocumentVerification = 'DocumentVerification',
  BackgroundCheck = 'BackgroundCheck',
  LandlordReview = 'LandlordReview',
  FinalApproval = 'FinalApproval',
}

export enum EmploymentStatus {
  Employed = 'Employed',
  SelfEmployed = 'SelfEmployed',
  Unemployed = 'Unemployed',
  Retired = 'Retired',
  Student = 'Student',
}

// Request DTOs
export interface ReferenceRequest {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface ApplicationDocumentRequest {
  documentType: string;
  documentUrl: string;
  fileName: string;
}

export interface CreateRentalApplicationRequest {
  propertyId: string;
  desiredMoveInDate: string; // ISO date string
  leaseTermMonths: number;
  numberOfOccupants: number;
  monthlyIncome: number;
  employmentStatus: EmploymentStatus;
  employerName?: string;
  employerPhone?: string;
  currentAddress?: string;
  reasonForMoving?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  hasPets?: boolean;
  petDescription?: string;
  references?: ReferenceRequest[];
  documents?: ApplicationDocumentRequest[];
  additionalNotes?: string;
  submitNow: boolean; // true to submit, false to save as draft
}

export interface UpdateRentalApplicationRequest {
  desiredMoveInDate?: string;
  leaseTermMonths?: number;
  numberOfOccupants?: number;
  monthlyIncome?: number;
  employmentStatus?: EmploymentStatus;
  employerName?: string;
  employerPhone?: string;
  currentAddress?: string;
  reasonForMoving?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  hasPets?: boolean;
  petDescription?: string;
  references?: ReferenceRequest[];
  documents?: ApplicationDocumentRequest[];
  additionalNotes?: string;
  submitNow?: boolean;
}

export interface ReviewApplicationRequest {
  status: ApplicationStatus; // Approved, Rejected, or AdditionalInfoRequested
  stage?: ApplicationStage;
  comments?: string;
}

// Response DTOs
export interface ReferenceResponse {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface ApplicationDocumentResponse {
  documentType: string;
  documentUrl: string;
  fileName: string;
  uploadedAt: string;
}

export interface RentalApplicationResponse {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress?: string;
  tenantId: string;
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  status: ApplicationStatus;
  stage: ApplicationStage;
  desiredMoveInDate: string;
  leaseTermMonths: number;
  numberOfOccupants: number;
  monthlyIncome: number;
  employmentStatus: EmploymentStatus;
  employerName?: string;
  employerPhone?: string;
  currentAddress?: string;
  reasonForMoving?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  hasPets: boolean;
  petDescription?: string;
  references?: ReferenceResponse[];
  documents?: ApplicationDocumentResponse[];
  additionalNotes?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RentalApplicationListItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  tenantId: string;
  tenantName: string;
  status: ApplicationStatus;
  stage: ApplicationStage;
  desiredMoveInDate: string;
  leaseTermMonths: number;
  monthlyIncome: number;
  submittedAt?: string;
  createdAt: string;
}

export interface RentalApplicationListResponse {
  applications: RentalApplicationListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// List Query Parameters
export interface ListApplicationsRequest {
  propertyId?: string;
  tenantId?: string;
  status?: ApplicationStatus;
  stage?: ApplicationStage;
  submittedAfter?: string; // ISO date
  submittedBefore?: string; // ISO date
  sortBy?: 'submitted' | 'created' | 'income';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

