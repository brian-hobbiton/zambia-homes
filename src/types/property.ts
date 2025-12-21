/**
 * Property Module Types
 * Defines all request/response DTOs for property-related API calls
 */

export enum PropertyType {
    Apartment = 'apartment',
    House = 'house',
    Townhouse = 'townhouse',
    Condo = 'condo',
    Studio = 'studio',
    Villa = 'villa',
    Commercial = 'commercial',
    Industrial = 'industrial',
    Land = 'land',
    Room = 'room',
    Bedsitter = 'bedsitter',
    Duplex = 'duplex',
    Mansion = 'mansion',
}

export enum PropertyStatus {
    Draft = 'draft',
    PendingApproval = 'pendingApproval',
    Active = 'active',
    Rented = 'rented',
    UnderMaintenance = 'underMaintenance',
    Suspended = 'suspended',
    Deleted = 'deleted',
}

export enum FurnishingStatus {
    Unfurnished = 'unfurnished',
    SemiFurnished = 'semiFurnished',
    FullyFurnished = 'fullyFurnished',
}

/**
 * Address Request/Response DTOs
 */
export interface AddressRequest {
    street: string;
    city: string;
    province: string; // Required by backend
    postalCode?: string;
    country?: string;
}

export interface AddressResponse extends AddressRequest {
    unitNumber?: string;
}

/**
 * Geo Coordinate Request/Response DTOs
 */
export interface GeoCoordinateRequest {
    latitude: number;
    longitude: number;
}

export interface GeoCoordinateResponse extends GeoCoordinateRequest {
    accuracy?: number;
}

/**
 * Create Property Request DTO
 * Used when landlord submits a new property listing
 */
export interface CreatePropertyRequest {
    title: string;
    propertyType: PropertyType;
    description: string;
    price: number; // rent in local currency
    address: AddressRequest;
    geoCoordinates?: GeoCoordinateRequest;
    bedrooms: number;
    bathrooms: number;
    parkingSpaces?: number;
    squareMeters?: number;
    furnishingStatus?: FurnishingStatus;
    amenities?: string[];
    hasSecurity?: boolean;
    boreholeWater?: boolean;
    solarPower?: boolean;
    backupGenerator?: boolean;
    imageUrls?: string[];
    virtualTourUrl?: string;
    availableFrom?: string; // ISO 8601 date-time
    minimumLeaseMonths?: number;
    contactPhone?: string;
    contactEmail?: string;
}

/**
 * Update Property Request DTO
 */
export interface UpdatePropertyRequest extends Partial<CreatePropertyRequest> {
}

/**
 * Property Response DTO
 * Full property object returned from backend
 */
export interface PropertyResponse {
    id: string;
    title: string;
    propertyType: PropertyType;
    description: string;
    price: number;
    city: string;
    province?: string;
    currency: string;
    securityDeposit?: number;
    address: AddressResponse;
    geoCoordinates?: GeoCoordinateResponse;
    bedrooms: number;
    bathrooms: number;
    parkingSpaces?: number;
    squareMeters?: number;
    furnishingStatus: FurnishingStatus;
    amenities: string[];
    hasSecurity?: boolean;
    boreholeWater?: boolean;
    solarPower?: boolean;
    backupGenerator?: boolean;
    images: string[];
    virtualTourUrl?: string;
    floorPlanUrl?: string;
    status: PropertyStatus;
    availableFrom?: string;
    minimumLeaseMonths: number;
    contactPhone?: string;
    contactEmail?: string;
    viewCount: number;
    saveCount: number;
    inquiryCount: number;
    landLordId: string;
    landlordName?: string;
    landlordAvatar?: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
}

/**
 * Property List Item (simplified version for list display)
 */
export interface PropertyListItem extends PropertyResponse {
}

/**
 * Property List Response DTO
 */
export interface PropertyListResponse {
    properties: PropertyListItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

/**
 * List Properties Query Parameters
 */
export interface ListPropertiesRequest {
    search?: string;
    city?: string;
    province?: string;
    propertyType?: PropertyType;
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    maxBedrooms?: number;
    furnishingStatus?: FurnishingStatus;
    hasSecurity?: boolean;
    boreholeWater?: boolean;
    solarPower?: boolean;
    availableNow?: boolean;
    sortBy?: string;
    sortOrder?: string;
    page: number;
    pageSize: number;
}

/**
 * Property Statistics Response
 */
export interface PropertyStatsResponse {
    totalProperties: number;
    activeListings: number;
    pendingApproval: number;
    totalViews: number;
    totalInquiries: number;
}

