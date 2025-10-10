import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { costAnalyticsService } from '@/services/cost-analytics.service';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
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
}
