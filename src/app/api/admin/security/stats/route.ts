import { NextRequest, NextResponse } from 'next/server';
import { rateLimitManagerService } from '@/services/rate-limit-manager.service';

export async function GET(request: NextRequest) {
  try {

    const stats = await rateLimitManagerService.getSecurityStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching security stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security stats' },
      { status: 500 }
    );
  }
}
