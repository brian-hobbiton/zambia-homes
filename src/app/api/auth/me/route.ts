import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import { NextRequest, NextResponse } from 'next/server';

interface DecodedToken {
  sub?: string;
  id?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role?: string;
  avatarUrl?: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Decode the token to get user info
    const decoded = jwtDecode<DecodedToken>(token);

    const user = {
      id: decoded.sub || decoded.id,
      email: decoded.email,
      username: decoded.username,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      fullName: decoded.fullName,
      role: decoded.role,
      avatarUrl: decoded.avatarUrl,
    };

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Failed to get current user:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

