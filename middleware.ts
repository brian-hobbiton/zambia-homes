/**
 * Next.js Middleware for authentication and role-based access control
 * Place this file at: /middleware.ts (root of your project)
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Type for decoded JWT
interface DecodedToken {
  sub: string; // User ID
  email: string;
  role: string;
  exp: number; // Expiration timestamp
  iat: number; // Issued at timestamp
}

// Route access configuration
const PROTECTED_ROUTES: Record<string, string[]> = {
  '/dashboard': ['admin', 'tenant', 'landlord', 'user'],
  '/landlord': ['admin', 'landlord'],
  '/landlord/properties': ['admin', 'landlord'],
  '/admin': ['admin'],
  '/admin/listings': ['admin'],
  '/admin/verifications': ['admin'],
  '/lease': ['admin', 'tenant', 'landlord'],
  '/messaging': ['admin', 'tenant', 'landlord', 'user'],
  '/properties': ['admin', 'tenant', 'landlord', 'user'],
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/'];

// Routes that should redirect authenticated users away (like login page)
const AUTH_ROUTES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies
  const token = request.cookies.get('authToken')?.value;

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPublicRoute) {
    // Redirect authenticated users away from auth pages
    if (
      AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`)) &&
      token
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    // Redirect to login if accessing protected route
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token and check role-based access
  try {
    const decoded = jwtDecode<DecodedToken>(token);

    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      // Token expired, clear cookies and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('authToken');
      response.cookies.delete('refreshToken');
      response.cookies.delete('tokenExpiry');
      return response;
    }

    // Check role-based access
    const userRole = decoded.role?.toLowerCase();
    const matchedRoute = Object.entries(PROTECTED_ROUTES).find(([route]) =>
      pathname === route || pathname.startsWith(`${route}/`)
    );

    if (matchedRoute) {
      const [, allowedRoles] = matchedRoute;
      if (userRole && !allowedRoles.includes(userRole)) {
        // User doesn't have permission
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware token verification error:', error);
    // Invalid token, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('authToken');
    response.cookies.delete('refreshToken');
    response.cookies.delete('tokenExpiry');
    return response;
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

