import { NextRequest, NextResponse } from 'next/server';
import { costAnalyticsService } from '@/services/cost-analytics.service';

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || undefined;

    const rules = await costAnalyticsService.getCostAllocationRules(tenantId);

    return NextResponse.json({ success: true, data: rules });
  } catch (error) {
    console.error('Error fetching cost allocation rules:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cost allocation rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {

    const body = await request.json();
    const rule = await costAnalyticsService.createCostAllocationRule(body);

    return NextResponse.json({ success: true, data: rule });
  } catch (error) {
    console.error('Error creating cost allocation rule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create cost allocation rule' },
      { status: 500 }
    );
  }
}
