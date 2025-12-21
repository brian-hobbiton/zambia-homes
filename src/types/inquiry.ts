/**
 * Property Inquiries Types
 * Matches backend OpenAPI schemas for property inquiries
 */

export interface CreatePropertyInquiryRequest {
  propertyId: string; // GUID
  message: string;    // 10-2000 chars
}

export interface PropertyInquiryResponse {
  id: string; // GUID
  propertyId: string; // GUID
  propertyTitle: string;
  userId: string; // GUID
  userName: string;
  userEmail?: string | null;
  userPhone?: string | null;
  message: string;
  inquiryDate: string; // ISO 8601
  isRead: boolean;
  readAt?: string | null; // ISO 8601
}

export interface PropertyInquiryListItem {
  id: string; // GUID
  propertyId: string; // GUID
  propertyTitle: string;
  userId: string; // GUID
  userName: string;
  message: string;
  inquiryDate: string; // ISO 8601
  isRead: boolean;
}

export interface PropertyInquiryListResponse {
  inquiries: PropertyInquiryListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListPropertyInquiriesRequest {
  propertyId?: string; // GUID
  isRead?: boolean;
  sortBy?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

export interface UpdatePropertyInquiryRequest {
  isRead?: boolean;
}

