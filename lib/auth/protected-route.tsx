'use client';

/**
 * Protected Route Components
 *
 * HOCs and components for protecting routes based on authentication and permissions
 */

import React, { ComponentType, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { UserRole, Permission } from './rbac';

// ============================================================================
// LOADING COMPONENT
// ============================================================================

function AuthLoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    </div>
  );
}

// ============================================================================
// UNAUTHORIZED COMPONENT
// ============================================================================

interface UnauthorizedProps {
  message?: string;
  redirectUrl?: string;
}

function UnauthorizedPage({ message, redirectUrl }: UnauthorizedProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-md p-8 bg-card rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Unauthorized</h1>
        <p className="text-muted-foreground mb-6">
          {message || 'You do not have permission to access this page.'}
        </p>
        <button
          onClick={() => router.push(redirectUrl || '/')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// REQUIRE AUTH COMPONENT
// ============================================================================

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Component that requires user to be authenticated
 * Redirects to login if not authenticated
 */
export function RequireAuth({
  children,
  fallback,
  redirectTo = '/auth/login',
}: RequireAuthProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return fallback || <AuthLoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

// ============================================================================
// REQUIRE PERMISSION COMPONENT
// ============================================================================

interface RequirePermissionProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  unauthorizedMessage?: string;
}

/**
 * Component that requires specific permission
 * Shows unauthorized message if permission not granted
 */
export function RequirePermission({
  permission,
  children,
  fallback,
  unauthorizedMessage,
}: RequirePermissionProps) {
  const { hasPermission, loading } = useAuth();

  if (loading) {
    return fallback || <AuthLoadingSpinner />;
  }

  if (!hasPermission(permission)) {
    return (
      <UnauthorizedPage
        message={
          unauthorizedMessage ||
          `You need the "${permission}" permission to access this page.`
        }
      />
    );
  }

  return <>{children}</>;
}

// ============================================================================
// REQUIRE ANY PERMISSION COMPONENT
// ============================================================================

interface RequireAnyPermissionProps {
  permissions: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  unauthorizedMessage?: string;
}

/**
 * Component that requires any of the specified permissions
 */
export function RequireAnyPermission({
  permissions,
  children,
  fallback,
  unauthorizedMessage,
}: RequireAnyPermissionProps) {
  const { hasAnyPermission, loading } = useAuth();

  if (loading) {
    return fallback || <AuthLoadingSpinner />;
  }

  if (!hasAnyPermission(permissions)) {
    return (
      <UnauthorizedPage
        message={
          unauthorizedMessage ||
          'You need at least one of the required permissions to access this page.'
        }
      />
    );
  }

  return <>{children}</>;
}

// ============================================================================
// REQUIRE ROLE COMPONENT
// ============================================================================

interface RequireRoleProps {
  role: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  unauthorizedMessage?: string;
}

/**
 * Component that requires specific role or higher
 */
export function RequireRole({
  role,
  children,
  fallback,
  unauthorizedMessage,
}: RequireRoleProps) {
  const { isRoleOrHigher, loading } = useAuth();

  if (loading) {
    return fallback || <AuthLoadingSpinner />;
  }

  if (!isRoleOrHigher(role)) {
    return (
      <UnauthorizedPage
        message={
          unauthorizedMessage ||
          `You need ${role} role or higher to access this page.`
        }
      />
    );
  }

  return <>{children}</>;
}

// ============================================================================
// HIGHER ORDER COMPONENTS (HOCs)
// ============================================================================

/**
 * HOC that requires authentication
 */
export function withAuth<P extends object>(
  Component: ComponentType<P>,
  redirectTo: string = '/auth/login'
) {
  return function WithAuthComponent(props: P) {
    return (
      <RequireAuth redirectTo={redirectTo}>
        <Component {...props} />
      </RequireAuth>
    );
  };
}

/**
 * HOC that requires specific permission
 */
export function withPermission<P extends object>(
  Component: ComponentType<P>,
  permission: Permission,
  unauthorizedMessage?: string
) {
  return function WithPermissionComponent(props: P) {
    return (
      <RequirePermission
        permission={permission}
        unauthorizedMessage={unauthorizedMessage}
      >
        <Component {...props} />
      </RequirePermission>
    );
  };
}

/**
 * HOC that requires specific role
 */
export function withRole<P extends object>(
  Component: ComponentType<P>,
  role: UserRole,
  unauthorizedMessage?: string
) {
  return function WithRoleComponent(props: P) {
    return (
      <RequireRole role={role} unauthorizedMessage={unauthorizedMessage}>
        <Component {...props} />
      </RequireRole>
    );
  };
}

// ============================================================================
// CONDITIONAL RENDER COMPONENT
// ============================================================================

interface ShowIfAuthenticatedProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Shows children only if user is authenticated
 */
export function ShowIfAuthenticated({
  children,
  fallback,
}: ShowIfAuthenticatedProps) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <>{fallback}</>;

  return <>{children}</>;
}

interface ShowIfPermissionProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Shows children only if user has permission
 */
export function ShowIfPermission({
  permission,
  children,
  fallback,
}: ShowIfPermissionProps) {
  const { hasPermission, loading } = useAuth();

  if (loading) return null;
  if (!hasPermission(permission)) return <>{fallback}</>;

  return <>{children}</>;
}

interface ShowIfRoleProps {
  role: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Shows children only if user has role or higher
 */
export function ShowIfRole({ role, children, fallback }: ShowIfRoleProps) {
  const { isRoleOrHigher, loading } = useAuth();

  if (loading) return null;
  if (!isRoleOrHigher(role)) return <>{fallback}</>;

  return <>{children}</>;
}
