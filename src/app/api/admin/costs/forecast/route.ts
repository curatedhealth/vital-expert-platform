import { NextRequest, NextResponse } from 'next/server';
import { costAnalyticsService } from '@/services/cost-analytics.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') as 'hourly' | 'daily' | 'weekly' | 'monthly') || 'daily';

    const forecast = await costAnalyticsService.forecastUsage(period);

    return NextResponse.json({ success: true, data: forecast });
  } catch (error) {
    console.error('Error fetching usage forecast:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch usage forecast' },
      { status: 500 }
    );
  }
}
