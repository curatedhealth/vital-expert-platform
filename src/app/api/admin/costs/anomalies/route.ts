import { NextRequest, NextResponse } from 'next/server';
import { costAnalyticsService } from '@/services/cost-analytics.service';

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || undefined;
    const userId = searchParams.get('userId') || undefined;

    const anomalies = await costAnalyticsService.detectAnomalies(tenantId, userId);

    return NextResponse.json({ success: true, data: anomalies });
  } catch (error) {
    console.error('Error fetching cost anomalies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cost anomalies' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {

    const body = await request.json();
    const { anomalyId, resolved } = body;

    // Update anomaly resolution status
    // This would typically update the database
    // For now, we'll just return success

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating anomaly:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update anomaly' },
      { status: 500 }
    );
  }
}
