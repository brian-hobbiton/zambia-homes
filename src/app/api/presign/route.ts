/**
 * Presigned URL API Route
 * Generates fresh presigned URLs for stored files
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPresignedUrl, getPresignedUrls } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle single key
    if (body.key && typeof body.key === 'string') {
      const url = await getPresignedUrl(body.key);
      return NextResponse.json({ url }, { status: 200 });
    }

    // Handle multiple keys
    if (body.keys && Array.isArray(body.keys)) {
      const urls = await getPresignedUrls(body.keys);
      return NextResponse.json({ urls }, { status: 200 });
    }

    return NextResponse.json(
      { message: 'Either key (string) or keys (array) is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to generate presigned URL:', error);
    return NextResponse.json(
      { message: 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
}

