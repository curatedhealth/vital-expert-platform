import { NextRequest, NextResponse } from 'next/server';
import { ComplianceReportingService } from '@/services/compliance-reporting.service';
import { withAuth } from '@/lib/auth/api-auth-middleware';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const complianceService = new ComplianceReportingService();
      const playbooks = await complianceService.getIncidentPlaybooks();
      
      return NextResponse.json(playbooks);
    } catch (error) {
      console.error('Error fetching playbooks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch playbooks' },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const body = await req.json();
      const { playbookId, context } = body;

      if (!playbookId) {
        return NextResponse.json(
          { error: 'Playbook ID is required' },
          { status: 400 }
        );
      }

      const complianceService = new ComplianceReportingService();
      const execution = await complianceService.executePlaybook(
        playbookId,
        user.id, // Use authenticated user ID
        context || {}
      );

      return NextResponse.json(execution);
    } catch (error) {
      console.error('Error executing playbook:', error);
      return NextResponse.json(
        { error: 'Failed to execute playbook' },
        { status: 500 }
      );
    }
  });
}
