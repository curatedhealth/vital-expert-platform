import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuditLogger, AuditAction, AuditSeverity } from '@/lib/security/audit-logger';

/**
 * Server-side admin authorization utility
 * Checks if user has admin or super_admin role
 */

export async function requireAdmin(): Promise<{ user: any; isSuperAdmin: boolean }> {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    // Log unauthorized access attempt
    await logUnauthorizedAccess('No authenticated user');
    redirect('/login');
  }

  // Get user profile with role
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role, is_active, email')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    await logUnauthorizedAccess(`User profile not found: ${user.email}`);
    redirect('/login');
  }

  if (!profile.is_active) {
    await logUnauthorizedAccess(`Inactive user attempted admin access: ${user.email}`);
    redirect('/login');
  }

  // Check if user has admin role
  const isAdmin = profile.role === 'admin' || profile.role === 'super_admin';
  const isSuperAdmin = profile.role === 'super_admin';

  if (!isAdmin) {
    await logUnauthorizedAccess(`Non-admin user attempted admin access: ${user.email} (role: ${profile.role})`);
    redirect('/admin/forbidden');
  }

  return { user, isSuperAdmin };
}

/**
 * Check if user can modify super admin roles
 */
export function canModifySuperAdmin(isSuperAdmin: boolean): boolean {
  return isSuperAdmin;
}

/**
 * Log unauthorized access attempts
 */
async function logUnauthorizedAccess(reason: string): Promise<void> {
  try {
    const auditLogger = AuditLogger.getInstance();
    await auditLogger.log({
      action: AuditAction.FORBIDDEN_ACCESS,
      resourceType: 'admin_dashboard',
      success: false,
      severity: AuditSeverity.HIGH,
      errorMessage: reason,
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: 'Server-side check'
      }
    });
  } catch (error) {
    console.error('Failed to log unauthorized access:', error);
  }
}
