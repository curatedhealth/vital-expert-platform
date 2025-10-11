import { NextRequest, NextResponse } from 'next/server';

import { usageTracker } from '@/lib/services/usage-tracker.service';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const providerId = searchParams.get('providerId');
    const userId = searchParams.get('userId');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (providerId) {
      // Get usage for specific provider
      const usage = await usageTracker.getProviderUsage(providerId, start, end);
      return NextResponse.json(usage);
    } else {
      // Get comprehensive cost breakdown
      const costBreakdown = await usageTracker.getCostBreakdown(start, end, userId || undefined);
      return NextResponse.json(costBreakdown);
    }
  } catch (error) {
    console.error('Error fetching usage data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const usage = await request.json();

    // Validate required fields
    const requiredFields = [
      'provider_id', 'model_used', 'input_tokens', 'output_tokens',
      'total_tokens', 'input_cost', 'output_cost', 'total_cost',
      'latency_ms', 'success', 'request_type', 'started_at', 'completed_at'
    ];

    for (const field of requiredFields) {
      // Validate field name to prevent object injection
      if (!requiredFields.includes(field)) {
        return NextResponse.json(
          { error: `Invalid field name: ${field}` },
          { status: 400 }
        );
      }
      
      // Use safe property access with explicit type checking
      let fieldValue: unknown;
      if (Object.prototype.hasOwnProperty.call(usage, field)) {
        // Use Object.getOwnPropertyDescriptor for safe property access
        const descriptor = Object.getOwnPropertyDescriptor(usage, field);
        fieldValue = descriptor ? descriptor.value : undefined;
      } else {
        fieldValue = undefined;
      }
      if (fieldValue === undefined || fieldValue === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Convert date strings to Date objects
    usage.started_at = new Date(usage.started_at);
    usage.completed_at = new Date(usage.completed_at);

    const usageId = await usageTracker.recordUsage(usage);

    return NextResponse.json(
      { success: true, usageId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording usage:', error);
    return NextResponse.json(
      { error: 'Failed to record usage' },
      { status: 500 }
    );
  }
}