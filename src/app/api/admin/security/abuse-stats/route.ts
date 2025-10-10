import { NextRequest, NextResponse } from 'next/server';
import { rateLimitManagerService } from '@/services/rate-limit-manager.service';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const stats = await rateLimitManagerService.getSecurityStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching abuse detection stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch abuse detection stats' },
      { status: 500 }
    );
  }
}
