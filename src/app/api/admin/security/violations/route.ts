import { NextRequest, NextResponse } from 'next/server';
import { rateLimitManagerService } from '@/services/rate-limit-manager.service';
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
      const scope = searchParams.get('scope') || undefined;
      const scopeId = searchParams.get('scopeId') || undefined;
      const ipAddress = searchParams.get('ipAddress') || undefined;
      const isBlocked = searchParams.get('isBlocked') ? searchParams.get('isBlocked') === 'true' : undefined;
      const startDate = searchParams.get('startDate') || undefined;
      const endDate = searchParams.get('endDate') || undefined;

      const violations = await rateLimitManagerService.getViolations({
        scope,
        scopeId,
        ipAddress,
        isBlocked,
        startDate,
        endDate
      });

      return NextResponse.json(violations);
    } catch (error) {
      console.error('Error fetching rate limit violations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch rate limit violations' },
        { status: 500 }
      );
    }
  });
}
