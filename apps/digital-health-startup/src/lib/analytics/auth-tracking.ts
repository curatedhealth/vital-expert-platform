/**
 * Authentication Analytics Integration
 * 
 * This module provides analytics tracking for authentication events.
 * Integrate these tracking calls into your auth service.
 */

import { getAnalyticsService } from '@/lib/analytics/UnifiedAnalyticsService';
import { STARTUP_TENANT_ID } from '@/lib/constants/tenant';

/**
 * Track user login
 */
export async function trackUserLogin(params: {
  userId: string;
  sessionId?: string;
  method: 'email' | 'google' | 'github' | 'oauth';
  ipAddress?: string;
  userAgent?: string;
}) {
  const analytics = getAnalyticsService();
  
  await analytics.trackEvent({
    tenant_id: STARTUP_TENANT_ID,
    user_id: params.userId,
    session_id: params.sessionId,
    event_type: 'user_login',
    event_category: 'user_behavior',
    event_data: {
      login_method: params.method,
      timestamp: new Date().toISOString(),
    },
    ip_address: params.ipAddress,
    user_agent: params.userAgent,
  });
}

/**
 * Track user logout
 */
export async function trackUserLogout(params: {
  userId: string;
  sessionId: string;
  sessionDurationMs: number;
}) {
  const analytics = getAnalyticsService();
  
  await analytics.trackEvent({
    tenant_id: STARTUP_TENANT_ID,
    user_id: params.userId,
    session_id: params.sessionId,
    event_type: 'user_logout',
    event_category: 'user_behavior',
    event_data: {
      session_duration_ms: params.sessionDurationMs,
      session_duration_minutes: Math.round(params.sessionDurationMs / 60000),
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Track user signup
 */
export async function trackUserSignup(params: {
  userId: string;
  method: 'email' | 'google' | 'github' | 'oauth';
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}) {
  const analytics = getAnalyticsService();
  
  await analytics.trackEvent({
    tenant_id: STARTUP_TENANT_ID,
    user_id: params.userId,
    event_type: 'user_signup',
    event_category: 'business_metric',
    event_data: {
      signup_method: params.method,
      timestamp: new Date().toISOString(),
      ...params.metadata,
    },
    ip_address: params.ipAddress,
    user_agent: params.userAgent,
  });
}

/**
 * Track authentication failure
 */
export async function trackAuthFailure(params: {
  method: 'email' | 'google' | 'github' | 'oauth';
  reason: string;
  ipAddress?: string;
  userAgent?: string;
  attemptedEmail?: string;
}) {
  const analytics = getAnalyticsService();
  
  await analytics.trackEvent({
    tenant_id: STARTUP_TENANT_ID,
    event_type: 'auth_failure',
    event_category: 'system_health',
    event_data: {
      method: params.method,
      reason: params.reason,
      attempted_email: params.attemptedEmail,
      timestamp: new Date().toISOString(),
    },
    ip_address: params.ipAddress,
    user_agent: params.userAgent,
  });
}

/**
 * Track password reset request
 */
export async function trackPasswordReset(params: {
  userId?: string;
  email: string;
  success: boolean;
  ipAddress?: string;
}) {
  const analytics = getAnalyticsService();
  
  await analytics.trackEvent({
    tenant_id: STARTUP_TENANT_ID,
    user_id: params.userId || 'anonymous',
    event_type: 'password_reset_requested',
    event_category: 'user_behavior',
    event_data: {
      email: params.email,
      success: params.success,
      timestamp: new Date().toISOString(),
    },
    ip_address: params.ipAddress,
  });
}

/**
 * Track session activity (for session duration tracking)
 */
export async function trackSessionActivity(params: {
  userId: string;
  sessionId: string;
  activityType: string;
  metadata?: Record<string, any>;
}) {
  const analytics = getAnalyticsService();
  
  await analytics.trackEvent({
    tenant_id: STARTUP_TENANT_ID,
    user_id: params.userId,
    session_id: params.sessionId,
    event_type: 'session_activity',
    event_category: 'user_behavior',
    event_data: {
      activity_type: params.activityType,
      timestamp: new Date().toISOString(),
      ...params.metadata,
    },
  });
}

/**
 * Example Integration with Supabase Auth
 * 
 * Add these calls to your auth event handlers:
 */

/*
// In your auth setup file (e.g., lib/auth.ts)

import { createClient } from '@supabase/supabase-js';
import { trackUserLogin, trackUserLogout, trackAuthFailure } from './analytics/auth-tracking';

const supabase = createClient(url, key);

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    trackUserLogin({
      userId: session.user.id,
      sessionId: session.access_token,
      method: 'email', // or determine from session
      ipAddress: request?.headers?.get('x-forwarded-for'),
      userAgent: request?.headers?.get('user-agent'),
    });
  }
  
  if (event === 'SIGNED_OUT') {
    // Calculate session duration
    const sessionStart = sessionStorage.getItem('sessionStart');
    const duration = sessionStart ? Date.now() - parseInt(sessionStart) : 0;
    
    trackUserLogout({
      userId: session?.user?.id || 'unknown',
      sessionId: session?.access_token || 'unknown',
      sessionDurationMs: duration,
    });
  }
  
  if (event === 'USER_UPDATED') {
    // Track profile updates, etc.
  }
});

// In your login API route
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      await trackAuthFailure({
        method: 'email',
        reason: error.message,
        attemptedEmail: email,
        ipAddress: request.headers.get('x-forwarded-for'),
      });
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    await trackUserLogin({
      userId: data.user.id,
      method: 'email',
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });
    
    return NextResponse.json({ success: true, user: data.user });
  } catch (error) {
    // Handle error
  }
}
*/

