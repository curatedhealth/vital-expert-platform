import { NextRequest, NextResponse } from 'next/server';
import { alertManagerService } from '@/services/alert-manager.service';

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url);
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
}
