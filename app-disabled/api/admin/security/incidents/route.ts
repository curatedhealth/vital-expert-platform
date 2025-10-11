import { NextRequest, NextResponse } from 'next/server';
import { rateLimitManagerService } from '@/services/rate-limit-manager.service';
import { withAuth } from '@/lib/auth/api-auth-middleware';

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
      const type = searchParams.get('type') || undefined;
      const severity = searchParams.get('severity') || undefined;
      const status = searchParams.get('status') || undefined;
      const assignedTo = searchParams.get('assignedTo') || undefined;
      const startDate = searchParams.get('startDate') || undefined;
      const endDate = searchParams.get('endDate') || undefined;

      const incidents = await rateLimitManagerService.getSecurityIncidents({
        type,
        severity,
        status,
        assignedTo,
        startDate,
        endDate
      });

      return NextResponse.json(incidents);
    } catch (error) {
      console.error('Error fetching security incidents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch security incidents' },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      // Verify admin role
      if (!['admin', 'super_admin'].includes(user.role)) {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' }, 
          { status: 403 }
        );
      }

      const body = await req.json();
      const incident = await rateLimitManagerService.createSecurityIncident(body);

      return NextResponse.json(incident, { status: 201 });
    } catch (error) {
      console.error('Error creating security incident:', error);
      return NextResponse.json(
        { error: 'Failed to create security incident' },
        { status: 500 }
      );
    }
  });
}
