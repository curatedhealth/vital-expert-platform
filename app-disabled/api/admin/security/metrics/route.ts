import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/api-auth-middleware';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    if (!['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Get active threats count
      const { count: activeThreats } = await supabase
        .from('threat_events')
        .select('*', { count: 'exact', head: true })
        .eq('resolved', false)
        .eq('false_positive', false);

      // Get failed auth attempts in last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: failedAuthAttempts } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'login_failed')
        .gte('timestamp', twentyFourHoursAgo);

      // Get rate limit violations in last 24 hours
      const { count: rateLimitViolations } = await supabase
        .from('rate_limit_violations')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', twentyFourHoursAgo);

      // Get total users count
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Get total organizations count
      const { count: totalOrganizations } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });

      // Get last threat time
      const { data: lastThreat } = await supabase
        .from('threat_events')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      // Get threats resolved in last 24 hours
      const { count: threatsResolved } = await supabase
        .from('threat_events')
        .select('*', { count: 'exact', head: true })
        .eq('resolved', true)
        .gte('resolved_at', twentyFourHoursAgo);

      // Calculate security score (simplified)
      const securityScore = Math.max(0, Math.min(100, 
        100 - (activeThreats || 0) * 5 - (failedAuthAttempts || 0) * 0.1
      ));

      const metrics = {
        activeThreats: activeThreats || 0,
        failedAuthAttempts: failedAuthAttempts || 0,
        rateLimitViolations: rateLimitViolations || 0,
        securityScore: Math.round(securityScore),
        totalUsers: totalUsers || 0,
        totalOrganizations: totalOrganizations || 0,
        lastThreatTime: lastThreat?.timestamp || null,
        threatsResolved: threatsResolved || 0
      };

      return NextResponse.json(metrics);

    } catch (error) {
      console.error('Error fetching security metrics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch security metrics' },
        { status: 500 }
      );
    }
  });
}
