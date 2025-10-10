import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { costAnalyticsService } from '@/services/cost-analytics.service';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || undefined;
    const userId = searchParams.get('userId') || undefined;

    const budget = await costAnalyticsService.getBudgetConfiguration(tenantId, userId);

    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    console.error('Error fetching budget configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch budget configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const budget = await costAnalyticsService.createBudgetConfiguration(body);

    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    console.error('Error creating budget configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create budget configuration' },
      { status: 500 }
    );
  }
}
