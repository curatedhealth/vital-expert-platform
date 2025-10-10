import { NextRequest, NextResponse } from 'next/server';
import { ComplianceReportingService } from '@/services/compliance-reporting.service';

export async function GET(request: NextRequest) {
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
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
      'admin-dashboard', // In real implementation, get actual user ID
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
}
