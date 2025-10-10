import { NextRequest, NextResponse } from 'next/server';
import { rateLimitManagerService } from '@/services/rate-limit-manager.service';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const rules = await rateLimitManagerService.getIPAccessRules();

    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching IP access rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch IP access rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const rule = await rateLimitManagerService.createIPAccessRule(body);

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error('Error creating IP access rule:', error);
    return NextResponse.json(
      { error: 'Failed to create IP access rule' },
      { status: 500 }
    );
  }
}
