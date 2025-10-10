import { NextRequest, NextResponse } from 'next/server';
import { rateLimitManagerService } from '@/services/rate-limit-manager.service';

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || undefined;
    const scopeId = searchParams.get('scopeId') || undefined;

    const configs = await rateLimitManagerService.getRateLimitConfigs(scope, scopeId);

    return NextResponse.json(configs);
  } catch (error) {
    console.error('Error fetching rate limit configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rate limit configurations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {

    const body = await request.json();
    const config = await rateLimitManagerService.createRateLimitConfig(body);

    return NextResponse.json(config, { status: 201 });
  } catch (error) {
    console.error('Error creating rate limit config:', error);
    return NextResponse.json(
      { error: 'Failed to create rate limit configuration' },
      { status: 500 }
    );
  }
}
