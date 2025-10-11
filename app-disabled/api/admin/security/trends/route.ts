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

      const { searchParams } = new URL(request.url);
      const hours = parseInt(searchParams.get('hours') || '24');
      const organizationId = searchParams.get('organizationId');

      // Calculate time range
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

      // Build query
      let query = supabase
        .from('threat_events')
        .select('timestamp, severity, type')
        .gte('timestamp', startTime.toISOString())
        .lte('timestamp', endTime.toISOString())
        .order('timestamp', { ascending: true });

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data: threats, error } = await query;

      if (error) {
        console.error('Error fetching threat trends:', error);
        return NextResponse.json(
          { error: 'Failed to fetch threat trends' },
          { status: 500 }
        );
      }

      // Group threats by hour
      const trendsMap = new Map<string, {
        hour: string;
        threatCount: number;
        criticalCount: number;
        highCount: number;
        mediumCount: number;
        lowCount: number;
      }>();

      // Initialize all hours in the range
      for (let i = 0; i < hours; i++) {
        const hour = new Date(endTime.getTime() - i * 60 * 60 * 1000);
        const hourKey = hour.toISOString().slice(0, 13) + ':00:00.000Z';
        trendsMap.set(hourKey, {
          hour: hourKey,
          threatCount: 0,
          criticalCount: 0,
          highCount: 0,
          mediumCount: 0,
          lowCount: 0
        });
      }

      // Process threats
      (threats || []).forEach(threat => {
        const threatTime = new Date(threat.timestamp);
        const hourKey = threatTime.toISOString().slice(0, 13) + ':00:00.000Z';
        
        const trend = trendsMap.get(hourKey);
        if (trend) {
          trend.threatCount++;
          switch (threat.severity) {
            case 'critical':
              trend.criticalCount++;
              break;
            case 'high':
              trend.highCount++;
              break;
            case 'medium':
              trend.mediumCount++;
              break;
            case 'low':
              trend.lowCount++;
              break;
          }
        }
      });

      // Convert to array and sort by hour
      const trends = Array.from(trendsMap.values())
        .sort((a, b) => new Date(a.hour).getTime() - new Date(b.hour).getTime());

      return NextResponse.json({ trends });

    } catch (error) {
      console.error('Error fetching threat trends:', error);
      return NextResponse.json(
        { error: 'Failed to fetch threat trends' },
        { status: 500 }
      );
    }
  });
}
