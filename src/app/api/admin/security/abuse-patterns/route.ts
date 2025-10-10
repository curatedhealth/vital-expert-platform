import { NextRequest, NextResponse } from 'next/server';
import { rateLimitManagerService } from '@/services/rate-limit-manager.service';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const patterns = await rateLimitManagerService.getAbusePatterns();

    return NextResponse.json(patterns);
  } catch (error) {
    console.error('Error fetching abuse patterns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch abuse patterns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const pattern = await rateLimitManagerService.createAbusePattern(body);

    return NextResponse.json(pattern, { status: 201 });
  } catch (error) {
    console.error('Error creating abuse pattern:', error);
    return NextResponse.json(
      { error: 'Failed to create abuse pattern' },
      { status: 500 }
    );
  }
}
