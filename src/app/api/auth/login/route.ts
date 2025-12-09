/**
 * API Routes Examples
 * These are optional - you can use server actions directly instead
 * Provided for reference if you prefer API routes over server actions
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { LoginRequest, LoginResponse, AuthError } from '@/types/auth';

const API_BASE_URL = 'http://localhost:5191';

/**
 * POST /api/auth/login
 * Wrapper around loginAction for direct API access
 */
export async function POST(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/auth/login') {
    try {
      const body = await request.json() as LoginRequest;

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        return NextResponse.json(error, { status: response.status });
      }

      const data = await response.json() as LoginResponse;

      // Set secure httpOnly cookies
      const cookieStore = await cookies();
      const maxAge = body.rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;

      cookieStore.set('authToken', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge,
        path: '/',
      });

      cookieStore.set('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge,
        path: '/',
      });

      cookieStore.set('tokenExpiry', data.tokenExpiry, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge,
        path: '/',
      });

      return NextResponse.json(data);
    } catch (error) {
      console.error('Login error:', error);
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: 'Not found' }, { status: 404 });
}

