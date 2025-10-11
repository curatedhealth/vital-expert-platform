import { NextRequest, NextResponse } from 'next/server';
import { costAnalyticsService } from '@/services/cost-analytics.service';
import { withAuth } from '@/lib/auth/api-auth-middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      // Verify admin role
      if (!['admin', 'super_admin'].includes(user.role)) {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' }, 
          { status: 403 }
        );
      }

      const { searchParams } = new URL(req.url);
      const tenantId = searchParams.get('tenantId') || undefined;
      const userId = searchParams.get('userId') || undefined;

      const overview = await costAnalyticsService.getCostOverview(tenantId, userId);

      return NextResponse.json({ success: true, data: overview });
    } catch (error) {
      console.error('Error fetching cost overview:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch cost overview' },
        { status: 500 }
      );
    }
  });
}
