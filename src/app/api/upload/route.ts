/**
 * File Upload API Route
 * Handles file uploads to Railway storage bucket
 * Keeps storage credentials server-side only
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, FileCategory } from '@/lib/storage';

// Disable body parser to handle FormData
export const runtime = 'nodejs';

const VALID_CATEGORIES: FileCategory[] = ['properties', 'documents', 'avatars', 'kyc'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = formData.get('category') as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    if (!category || !VALID_CATEGORIES.includes(category as FileCategory)) {
      return NextResponse.json(
        { message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }

    // Get user ID from auth header if available (optional)
    const authHeader = request.headers.get('authorization');
    let userId: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        // Decode JWT to get user ID (without verification - that's handled by backend)
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.sub || payload.id;
      } catch {
        // Ignore token decode errors - upload will proceed without user prefix
      }
    }

    // Upload file
    const result = await uploadFile(file, category as FileCategory, userId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

