/**
 * VITAL Platform - Server-Side Auth Module
 *
 * Provides authentication utilities for API routes.
 * For development/testing, returns mock session data.
 * In production, integrate with Supabase Auth or NextAuth.
 */

import { cookies } from 'next/headers';

// Canonical tenant UUID for development/testing
// This MUST be a valid UUID format for PostgreSQL compatibility
const DEV_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const DEV_USER_ID = '00000000-0000-0000-0000-000000000002';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  tenantId?: string;
}

export interface Session {
  user: User;
  accessToken?: string;
  expiresAt?: Date;
}

/**
 * Get the current auth session.
 *
 * In development mode, returns a mock session for testing.
 * In production, this should integrate with your auth provider.
 */
export async function auth(): Promise<Session | null> {
  // For development/testing - return mock session
  if (process.env.NODE_ENV === 'development' || process.env.MOCK_AUTH === 'true') {
    return {
      user: {
        id: DEV_USER_ID,
        email: 'dev@vital-platform.com',
        name: 'Development User',
        role: 'admin',
        tenantId: DEV_TENANT_ID,
      },
      accessToken: 'dev-access-token',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  // Production: Check for session cookie
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie?.value) {
      return null;
    }

    // Decode and validate session
    const sessionData = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    );

    // Check expiration
    if (sessionData.expiresAt && new Date(sessionData.expiresAt) < new Date()) {
      return null;
    }

    return sessionData as Session;
  } catch (error) {
    console.error('[Auth] Error parsing session:', error);
    return null;
  }
}

/**
 * Require authentication - throws if not authenticated.
 */
export async function requireAuth(): Promise<Session> {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

/**
 * Get the current user's tenant ID.
 */
export async function getTenantId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.tenantId || null;
}

export default auth;
