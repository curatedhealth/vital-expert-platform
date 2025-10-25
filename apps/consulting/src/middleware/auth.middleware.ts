/**
 * VITAL Path Authentication & Authorization Middleware
 * Handles user authentication and role-based access control for healthcare APIs
 */

import { createServerClient } from '@supabase/ssr';
import { jwtVerify, SignJWT } from 'jose';
import { NextRequest } from 'next/server';

// Healthcare user roles with increasing privileges
export enum HealthcareRole {
  PATIENT = 'patient',
  HEALTHCARE_PROVIDER = 'healthcare_provider',
  SPECIALIST = 'specialist',
  RESEARCHER = 'researcher',
  ADMINISTRATOR = 'administrator',
  SYSTEM_ADMIN = 'system_admin'
}

// Healthcare permissions for different actions
export enum HealthcarePermission {
  READ_BASIC_INFO = 'read_basic_info',
  READ_MEDICAL_DATA = 'read_medical_data',
  WRITE_MEDICAL_DATA = 'write_medical_data',
  ACCESS_PHI = 'access_phi',
  CLINICAL_DECISION_SUPPORT = 'clinical_decision_support',
  PRESCRIBE_MEDICATION = 'prescribe_medication',
  CONDUCT_RESEARCH = 'conduct_research',
  SYSTEM_ADMINISTRATION = 'system_administration',
  AUDIT_ACCESS = 'audit_access'
}

// Role-based permissions matrix
const ROLE_PERMISSIONS: Record<HealthcareRole, HealthcarePermission[]> = {
  [HealthcareRole.PATIENT]: [
    HealthcarePermission.READ_BASIC_INFO
  ],
  [HealthcareRole.HEALTHCARE_PROVIDER]: [
    HealthcarePermission.READ_BASIC_INFO,
    HealthcarePermission.READ_MEDICAL_DATA,
    HealthcarePermission.WRITE_MEDICAL_DATA,
    HealthcarePermission.CLINICAL_DECISION_SUPPORT
  ],
  [HealthcareRole.SPECIALIST]: [
    HealthcarePermission.READ_BASIC_INFO,
    HealthcarePermission.READ_MEDICAL_DATA,
    HealthcarePermission.WRITE_MEDICAL_DATA,
    HealthcarePermission.ACCESS_PHI,
    HealthcarePermission.CLINICAL_DECISION_SUPPORT,
    HealthcarePermission.PRESCRIBE_MEDICATION
  ],
  [HealthcareRole.RESEARCHER]: [
    HealthcarePermission.READ_BASIC_INFO,
    HealthcarePermission.READ_MEDICAL_DATA,
    HealthcarePermission.CONDUCT_RESEARCH
  ],
  [HealthcareRole.ADMINISTRATOR]: [
    HealthcarePermission.READ_BASIC_INFO,
    HealthcarePermission.READ_MEDICAL_DATA,
    HealthcarePermission.WRITE_MEDICAL_DATA,
    HealthcarePermission.ACCESS_PHI,
    HealthcarePermission.CLINICAL_DECISION_SUPPORT,
    HealthcarePermission.AUDIT_ACCESS
  ],
  [HealthcareRole.SYSTEM_ADMIN]: Object.values(HealthcarePermission)
};

// API endpoint permissions requirements
const ENDPOINT_PERMISSIONS: Record<string, HealthcarePermission[]> = {
  '/api/agents/clinical-*': [HealthcarePermission.CLINICAL_DECISION_SUPPORT],
  '/api/agents/safety-*': [HealthcarePermission.ACCESS_PHI],
  '/api/agents/regulatory-*': [HealthcarePermission.CONDUCT_RESEARCH],
  '/api/knowledge/upload': [HealthcarePermission.WRITE_MEDICAL_DATA],
  '/api/knowledge/search': [HealthcarePermission.READ_MEDICAL_DATA],
  '/api/llm/query': [HealthcarePermission.CLINICAL_DECISION_SUPPORT],
  '/api/llm/usage': [HealthcarePermission.AUDIT_ACCESS],
  '/api/events/websocket': [HealthcarePermission.READ_BASIC_INFO]
};

interface AuthenticatedUser {
  id: string;
  email: string;
  role: HealthcareRole;
  permissions: HealthcarePermission[];
  licenseNumber?: string;
  specialty?: string;
  institution?: string;
  lastAccess: Date;
  sessionId: string;
}

interface AuthenticationResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
  requiresMFA?: boolean;
  sessionExpired?: boolean;
}

export async function authenticateRequest(request: NextRequest): Promise<AuthenticationResult> {
  try {
    // Check for authentication token

    if (!authHeader && !sessionCookie) {
      return {
        success: false,
        error: 'No authentication provided'
      };
    }

    // Extract token from Authorization header or session cookie
    let token: string;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (sessionCookie) {
      token = sessionCookie;
    } else {
      return {
        success: false,
        error: 'Invalid authentication format'
      };
    }

    // Verify JWT token

      process.env.JWT_SECRET || 'healthcare-secret-key'
    );

    let payload: unknown;
    try {
      const { payload: jwtPayload } = await jwtVerify(token, jwtSecret);
      payload = jwtPayload;
    } catch (error) {
      return {
        success: false,
        error: 'Invalid or expired token',
        sessionExpired: true
      };
    }

    // Validate token structure
    if (!payload.sub || !payload.role || !payload.sessionId) {
      return {
        success: false,
        error: 'Invalid token structure'
      };
    }

    // Check if session is still valid in database

    if (!sessionValid) {
      return {
        success: false,
        error: 'Session expired or invalid',
        sessionExpired: true
      };
    }

    // Create authenticated user object
    const user: AuthenticatedUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role as HealthcareRole,
      permissions: ROLE_PERMISSIONS[payload.role as HealthcareRole] || [],
      licenseNumber: payload.licenseNumber,
      specialty: payload.specialty,
      institution: payload.institution,
      lastAccess: new Date(),
      sessionId: payload.sessionId
    };

    // Check if MFA is required for this user/endpoint

    if (requiresMFA && !payload.mfaVerified) {
      return {
        success: false,
        requiresMFA: true,
        error: 'Multi-factor authentication required'
      };
    }

    // Update last access time
    await updateLastAccess(user.id, user.sessionId);

    return {
      success: true,
      user
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication error'
    };
  }
}

export async function checkPermissions(
  user: AuthenticatedUser,
  endpoint: string,
  action?: string
): Promise<{ authorized: boolean; missingPermissions?: HealthcarePermission[] }> {

  // Find required permissions for endpoint
  let requiredPermissions: HealthcarePermission[] = [];

  for (const [pattern, permissions] of Object.entries(ENDPOINT_PERMISSIONS)) {
    if (matchesEndpointPattern(endpoint, pattern)) {
      requiredPermissions = permissions;
      break;
    }
  }

  // If no specific permissions required, allow basic access
  if (requiredPermissions.length === 0) {
    requiredPermissions = [HealthcarePermission.READ_BASIC_INFO];
  }

  // Check if user has required permissions

    permission => !user.permissions.includes(permission)
  );

  if (missingPermissions.length > 0) {
    return {
      authorized: false,
      missingPermissions
    };
  }

  return { authorized: true };
}

export async function createHealthcareSession(
  userId: string,
  email: string,
  role: HealthcareRole,
  additionalClaims?: {
    licenseNumber?: string;
    specialty?: string;
    institution?: string;
    mfaVerified?: boolean;
  }
): Promise<string> {

  // Store session in database
  await storeSession(sessionId, userId, expiresAt);

  // Create JWT token

    process.env.JWT_SECRET || 'healthcare-secret-key'
  );

    sub: userId,
    email,
    role,
    sessionId,
    // eslint-disable-next-line security/detect-object-injection
    permissions: ROLE_PERMISSIONS[role],
    ...additionalClaims
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(jwtSecret);

  return token;
}

export async function revokeSession(sessionId: string): Promise<void> {
  await invalidateSession(sessionId);
}

export async function requireHealthcareRole(
  user: AuthenticatedUser,
  requiredRole: HealthcareRole
): Promise<boolean> {

    [HealthcareRole.PATIENT]: 1,
    [HealthcareRole.HEALTHCARE_PROVIDER]: 2,
    [HealthcareRole.SPECIALIST]: 3,
    [HealthcareRole.RESEARCHER]: 3,
    [HealthcareRole.ADMINISTRATOR]: 4,
    [HealthcareRole.SYSTEM_ADMIN]: 5
  };

  // eslint-disable-next-line security/detect-object-injection

  // eslint-disable-next-line security/detect-object-injection

  return userLevel >= requiredLevel;
}

// Helper functions

async function validateSession(sessionId: string, userId: string): Promise<boolean> {
  // In production, this would query the database
  // For now, implement basic session validation
  return true; // Placeholder
}

async function checkMFARequirement(user: AuthenticatedUser, endpoint: string): Promise<boolean> {
  // MFA required for high-risk endpoints and certain roles

    '/api/agents/safety-',
    '/api/knowledge/upload',
    '/api/llm/usage'
  ];

    HealthcareRole.SPECIALIST,
    HealthcareRole.ADMINISTRATOR,
    HealthcareRole.SYSTEM_ADMIN
  ];

    endpoint.includes(pattern)
  );

  return endpointRequiresMFA || roleRequiresMFA;
}

async function updateLastAccess(userId: string, sessionId: string): Promise<void> {
  // Update last access timestamp in database
  // Placeholder for database operation
}

async function storeSession(sessionId: string, userId: string, expiresAt: Date): Promise<void> {
  // Store session in database with expiration
  // Placeholder for database operation
}

async function invalidateSession(sessionId: string): Promise<void> {
  // Remove session from database
  // Placeholder for database operation
}

function matchesEndpointPattern(endpoint: string, pattern: string): boolean {
  // Convert pattern to regex

    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');

  return regex.test(endpoint);
}

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

// Supabase integration for production authentication
export async function authenticateWithSupabase(request: NextRequest): Promise<AuthenticationResult> {
  try {

      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set() {
            // Not implemented for middleware
          },
          remove() {
            // Not implemented for middleware
          }
        }
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        success: false,
        error: 'Invalid Supabase session'
      };
    }

    // Get user role from user metadata or database

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email!,
      role,
      // eslint-disable-next-line security/detect-object-injection
    permissions: ROLE_PERMISSIONS[role],
      licenseNumber: user.user_metadata?.licenseNumber,
      specialty: user.user_metadata?.specialty,
      institution: user.user_metadata?.institution,
      lastAccess: new Date(),
      sessionId: generateSessionId()
    };

    return {
      success: true,
      user: authenticatedUser
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Supabase authentication error'
    };
  }
}

export type {
  AuthenticatedUser,
  AuthenticationResult
};
export {
  ROLE_PERMISSIONS,
  ENDPOINT_PERMISSIONS
};