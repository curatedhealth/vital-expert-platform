import { NextRequest, NextResponse } from 'next/server';
import { alertManagerService } from '@/services/alert-manager.service';
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
      const ruleId = searchParams.get('ruleId') || undefined;
      const status = searchParams.get('status') || undefined;
      const severity = searchParams.get('severity') || undefined;
      const startDate = searchParams.get('startDate') || undefined;
      const endDate = searchParams.get('endDate') || undefined;

      const instances = await alertManagerService.getAlertInstances({
        ruleId,
        status,
        severity,
        startDate,
        endDate
      });

      return NextResponse.json(instances);
    } catch (error) {
      console.error('Error fetching alert instances:', error);
      return NextResponse.json(
        { error: 'Failed to fetch alert instances' },
        { status: 500 }
      );
    }
  });
}
