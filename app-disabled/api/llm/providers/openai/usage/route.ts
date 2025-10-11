import { NextRequest, NextResponse } from 'next/server';

import { openAIUsageService } from '@/lib/services/openai-usage.service';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'current';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    switch (action) {
      case 'current':
        // Get current month usage
        const currentUsage = await openAIUsageService.getCurrentMonthUsage();
        return NextResponse.json(currentUsage);

      case 'range':
        // Get usage for specific date range
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'startDate and endDate are required for range query' },
            { status: 400 }
          );
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const rangeUsage = await openAIUsageService.fetchUsageData(start, end);
        return NextResponse.json(rangeUsage);

      case 'billing':
        // Get billing information
        const billingData = await openAIUsageService.fetchBillingData();
        return NextResponse.json(billingData);

      case 'test':
        // Test connectivity
        const testResult = await openAIUsageService.testConnectivity();
        return NextResponse.json(testResult);

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: current, range, billing, or test' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in OpenAI usage API:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        error: 'Failed to fetch OpenAI usage data',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}