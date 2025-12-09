/**
 * Example: Using apiFetch with Other Backend Endpoints
 *
 * This file demonstrates how to build type-safe API clients
 * for other endpoints beyond authentication
 */

import apiFetch from '@/lib/apiClient';

// ============================================
// Properties API Examples
// ============================================

export interface PropertyResponse {
  id: string;
  title: string;
  propertyType: string;
  location: string;
  price: number;
  currency: string;
  description: string;
  images: string[];
  landlordId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyRequest {
  title: string;
  propertyType: string;
  location: string;
  price: number;
  currency: string;
  description: string;
  images: string[];
}

/**
 * Get all properties with pagination
 */
export async function getProperties(page: number = 1, pageSize: number = 10) {
  return apiFetch<{
    properties: PropertyResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>('/properties/properties', {
    method: 'GET',
  });
}

/**
 * Get property by ID
 */
export async function getProperty(id: string) {
  return apiFetch<PropertyResponse>(`/properties/properties/${id}`, {
    method: 'GET',
  });
}

/**
 * Create a new property (Landlord only)
 */
export async function createProperty(data: CreatePropertyRequest) {
  return apiFetch<PropertyResponse>('/properties/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update property (Landlord only)
 */
export async function updateProperty(id: string, data: Partial<CreatePropertyRequest>) {
  return apiFetch<PropertyResponse>(`/properties/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete property (Landlord or Admin only)
 */
export async function deleteProperty(id: string) {
  return apiFetch<void>(`/properties/properties/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// Messaging API Examples
// ============================================

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface CreateMessageRequest {
  recipientId: string;
  content: string;
}

/**
 * Get messages with a specific user
 */
export async function getMessages(userId: string) {
  return apiFetch<Message[]>(`/messaging/messages/${userId}`, {
    method: 'GET',
  });
}

/**
 * Send a message
 */
export async function sendMessage(data: CreateMessageRequest) {
  return apiFetch<Message>('/messaging/messages', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string) {
  return apiFetch<Message>(`/messaging/messages/${messageId}/read`, {
    method: 'PUT',
  });
}

// ============================================
// Listings API Examples (Admin only)
// ============================================

export interface Listing {
  id: string;
  propertyId: string;
  tenantId: string | null;
  status: 'active' | 'inactive' | 'rented' | 'archived';
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all listings (Admin only)
 */
export async function getListings(status?: string) {
  const params = status ? `?status=${status}` : '';
  return apiFetch<Listing[]>(`/admin/listings${params}`, {
    method: 'GET',
  });
}

/**
 * Approve a listing (Admin only)
 */
export async function approveListing(listingId: string) {
  return apiFetch<Listing>(`/admin/listings/${listingId}/approve`, {
    method: 'POST',
  });
}

/**
 * Reject a listing (Admin only)
 */
export async function rejectListing(listingId: string, reason: string) {
  return apiFetch<Listing>(`/admin/listings/${listingId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

// ============================================
// User/Profile API Examples
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  phoneNumber: string;
  bio: string;
  gender: 'male' | 'female' | 'other' | 'preferNotToSay';
  role: 'admin' | 'tenant' | 'landlord' | 'user';
  status: string;
  isKYCVerified: boolean;
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile() {
  return apiFetch<UserProfile>('/auth/me', {
    method: 'GET',
  });
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: Partial<UserProfile>) {
  return apiFetch<UserProfile>('/auth/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Upload avatar
 */
export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  // Note: apiFetch is configured for JSON, so you may need a separate
  // fetch call for multipart/form-data
  const response = await fetch('http://localhost:5191/auth/avatar', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${getCookie('authToken')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return response.json();
}

// ============================================
// KYC Verification API Examples
// ============================================

export interface KYCDocument {
  id: string;
  userId: string;
  documentType: 'passport' | 'nationalId' | 'driverLicense';
  documentUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt: string | null;
  rejectionReason: string | null;
}

/**
 * Submit KYC document
 */
export async function submitKYCDocument(
  documentType: string,
  documentUrl: string
) {
  return apiFetch<KYCDocument>('/auth/kyc/documents', {
    method: 'POST',
    body: JSON.stringify({ documentType, documentUrl }),
  });
}

/**
 * Get user's KYC documents
 */
export async function getKYCDocuments() {
  return apiFetch<KYCDocument[]>('/auth/kyc/documents', {
    method: 'GET',
  });
}

/**
 * Get all KYC documents for verification (Admin only)
 */
export async function getPendingKYCDocuments() {
  return apiFetch<KYCDocument[]>('/admin/kyc/pending', {
    method: 'GET',
  });
}

/**
 * Verify KYC document (Admin only)
 */
export async function verifyKYCDocument(documentId: string) {
  return apiFetch<KYCDocument>(`/admin/kyc/${documentId}/verify`, {
    method: 'POST',
  });
}

/**
 * Reject KYC document (Admin only)
 */
export async function rejectKYCDocument(documentId: string, reason: string) {
  return apiFetch<KYCDocument>(`/admin/kyc/${documentId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

// ============================================
// Lease/Contract API Examples
// ============================================

export interface LeaseContract {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  currency: string;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  createdAt: string;
}

/**
 * Create lease contract
 */
export async function createLeaseContract(data: {
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  currency: string;
}) {
  return apiFetch<LeaseContract>('/lease/contracts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get lease contracts
 */
export async function getLeaseContracts(
  filter?: 'active' | 'expired' | 'terminated'
) {
  const params = filter ? `?status=${filter}` : '';
  return apiFetch<LeaseContract[]>(`/lease/contracts${params}`, {
    method: 'GET',
  });
}

/**
 * Sign lease contract
 */
export async function signLeaseContract(contractId: string) {
  return apiFetch<LeaseContract>(`/lease/contracts/${contractId}/sign`, {
    method: 'POST',
  });
}

// ============================================
// Helper Functions
// ============================================

function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  }
  return null;
}

// ============================================
// Usage Examples
// ============================================

/**
 * Example: Get properties in a React component
 *
 * export default function PropertiesPage() {
 *   const [properties, setProperties] = useState<PropertyResponse[]>([]);
 *   const [isLoading, setIsLoading] = useState(true);
 *
 *   useEffect(() => {
 *     async function fetchProperties() {
 *       try {
 *         const data = await getProperties(1, 20);
 *         setProperties(data.properties);
 *       } catch (error) {
 *         console.error('Failed to fetch properties:', error);
 *       } finally {
 *         setIsLoading(false);
 *       }
 *     }
 *
 *     fetchProperties();
 *   }, []);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       {properties.map(property => (
 *         <div key={property.id}>
 *           <h3>{property.title}</h3>
 *           <p>${property.price}</p>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 */

