import { NextRequest, NextResponse } from 'next/server';

import { usageTracker } from '@/lib/services/usage-tracker.service';

export async function GET(request: NextRequest) {
  try {
    const metrics = await usageTracker.getRealTimeMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching real-time metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch real-time metrics' },
      { status: 500 }
    );
  }
}