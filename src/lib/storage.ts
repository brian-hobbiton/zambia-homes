/**
 * Storage Service for Railway S3-compatible bucket
 * Handles file uploads for property images and application documents
 */

import {S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';

// Railway storage configuration
const STORAGE_CONFIG = {
    endpoint: 'https://storage.railway.app',
    region: 'auto',
    bucketName: 'structured-drum-nmhs-bwkv',
    credentials: {
        accessKeyId: 'tid_lWGPedKhzJObdiSVkRVlFBqcZUwvEmoKPeeAUVEWAhQeKOwjuS',
        secretAccessKey: 'tsec_zmrgs3Z0pvWS2JJbhKnyBsjxmnbGY9WwC6oV0Vxh9+b8HHxfM6vHl7QmtguVljH3MpxolV',
    },
};

// Initialize S3 client
const s3Client = new S3Client({
    endpoint: STORAGE_CONFIG.endpoint,
    region: STORAGE_CONFIG.region,
    credentials: STORAGE_CONFIG.credentials,
    forcePathStyle: true, // Required for S3-compatible storage
});

// File type categories
export type FileCategory = 'properties' | 'documents' | 'avatars' | 'kyc';

// Allowed MIME types per category
const ALLOWED_MIME_TYPES: Record<FileCategory, string[]> = {
    properties: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    documents: ['application/pdf', 'image/jpeg', 'image/png'],
    avatars: ['image/jpeg', 'image/png', 'image/webp'],
    kyc: ['application/pdf', 'image/jpeg', 'image/png'],
};

// Max file sizes per category (in bytes)
const MAX_FILE_SIZES: Record<FileCategory, number> = {
    properties: 10 * 1024 * 1024, // 10MB
    documents: 5 * 1024 * 1024,  // 5MB
    avatars: 2 * 1024 * 1024,    // 2MB
    kyc: 5 * 1024 * 1024,        // 5MB
};

export interface UploadResult {
    url: string;
    key: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
}

export interface UploadError {
    message: string;
    code: 'INVALID_FILE_TYPE' | 'FILE_TOO_LARGE' | 'UPLOAD_FAILED' | 'UNKNOWN';
}

/**
 * Generate a unique file key for storage
 */
function generateFileKey(category: FileCategory, fileName: string, userId?: string): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const userPrefix = userId ? `${userId}/` : '';

    return `${category}/${userPrefix}${timestamp}-${randomStr}-${sanitizedFileName}`;
}

/**
 * Get the public URL for an uploaded file
 */
function getPublicUrl(key: string): string {
    return `${STORAGE_CONFIG.endpoint}/${STORAGE_CONFIG.bucketName}/${key}`;
}

/**
 * Generate a presigned URL for reading a file
 * @param key - The storage key of the file
 * @param expiresIn - Expiration time in seconds (default: 7 days)
 */
export async function getPresignedUrl(key: string, expiresIn: number = 604800): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: STORAGE_CONFIG.bucketName,
        Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate presigned URLs for multiple keys
 */
export async function getPresignedUrls(keys: string[], expiresIn: number = 604800): Promise<Record<string, string>> {
    const urls: Record<string, string> = {};

    await Promise.all(
        keys.map(async (key) => {
            urls[key] = await getPresignedUrl(key, expiresIn);
        })
    );

    return urls;
}

/**
 * Validate file before upload
 */
function validateFile(
    file: File,
    category: FileCategory
): { valid: true } | { valid: false; error: UploadError } {
    // Check MIME type
    const allowedTypes = ALLOWED_MIME_TYPES[category];
    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: {
                message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
                code: 'INVALID_FILE_TYPE',
            },
        };
    }

    // Check file size
    const maxSize = MAX_FILE_SIZES[category];
    if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        return {
            valid: false,
            error: {
                message: `File too large. Maximum size: ${maxSizeMB}MB`,
                code: 'FILE_TOO_LARGE',
            },
        };
    }

    return {valid: true};
}

/**
 * Upload a single file to storage
 */
export async function uploadFile(
    file: File,
    category: FileCategory,
    userId?: string
): Promise<UploadResult> {
    // Validate file
    const validation = validateFile(file, category);
    if (!validation.valid) {
        throw new Error(validation.error.message);
    }

    // Generate unique key
    const key = generateFileKey(category, file.name, userId);

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const putCommand = new PutObjectCommand({
        Bucket: STORAGE_CONFIG.bucketName,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        CacheControl: 'public, max-age=31536000', // Cache for 1 year
    });

    try {
        await s3Client.send(putCommand);

        // Generate a presigned URL for reading the file (valid for 7 days)
        const getCommand = new GetObjectCommand({
            Bucket: STORAGE_CONFIG.bucketName,
            Key: key,
        });

        // Generate presigned URL valid for 7 days (604800 seconds)
        const presignedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 604800 });

        return {
            url: presignedUrl,
            key,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
        };
    } catch (error) {
        console.error('Failed to upload file:', error);
        throw new Error('Failed to upload file. Please try again.');
    }
}

/**
 * Upload multiple files to storage
 */
export async function uploadFiles(
    files: File[],
    category: FileCategory,
    userId?: string
): Promise<UploadResult[]> {
    const results = await Promise.all(
        files.map((file) => uploadFile(file, category, userId))
    );
    return results;
}

/**
 * Delete a file from storage
 */
export async function deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: STORAGE_CONFIG.bucketName,
        Key: key,
    });

    try {
        await s3Client.send(command);
    } catch (error) {
        console.error('Failed to delete file:', error);
        throw new Error('Failed to delete file.');
    }
}

/**
 * Delete multiple files from storage
 */
export async function deleteFiles(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => deleteFile(key)));
}

/**
 * Extract storage key from a URL (handles both public and presigned URLs)
 */
export function extractKeyFromUrl(url: string): string | null {
    const baseUrl = `${STORAGE_CONFIG.endpoint}/${STORAGE_CONFIG.bucketName}/`;

    // Handle presigned URLs (remove query string first)
    const urlWithoutQuery = url.split('?')[0];

    if (urlWithoutQuery.startsWith(baseUrl)) {
        return urlWithoutQuery.substring(baseUrl.length);
    }
    return null;
}

/**
 * Check if a URL is from Railway storage
 */
export function isStorageUrl(url: string): boolean {
    return url.includes('storage.railway.app') && url.includes(STORAGE_CONFIG.bucketName);
}

/**
 * Refresh a presigned URL (client-side helper)
 * Call this when an image fails to load with 403
 */
export async function refreshPresignedUrl(url: string): Promise<string> {
    const key = extractKeyFromUrl(url);
    if (!key) {
        throw new Error('Invalid storage URL');
    }

    const response = await fetch('/api/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
    });

    if (!response.ok) {
        throw new Error('Failed to refresh URL');
    }

    const data = await response.json();
    return data.url;
}

/**
 * Client-side upload helper - uploads via API route to avoid exposing credentials
 * Use this in client components
 */
export async function uploadFileClient(
    file: File,
    category: FileCategory
): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
    }

    return response.json();
}

/**
 * Client-side upload helper for multiple files
 */
export async function uploadFilesClient(
    files: File[],
    category: FileCategory
): Promise<UploadResult[]> {
    const results = await Promise.all(
        files.map((file) => uploadFileClient(file, category))
    );
    return results;
}

