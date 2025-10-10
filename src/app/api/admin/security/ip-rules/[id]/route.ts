import { NextRequest, NextResponse } from 'next/server';
import { rateLimitManagerService } from '@/services/rate-limit-manager.service';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const rules = await rateLimitManagerService.getIPAccessRules();
    const rule = rules.find(r => r.id === params.id);

    if (!rule) {
      return NextResponse.json(
        { error: 'IP access rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(rule);
  } catch (error) {
    console.error('Error fetching IP access rule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch IP access rule' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const rule = await rateLimitManagerService.updateIPAccessRule(params.id, body);

    return NextResponse.json(rule);
  } catch (error) {
    console.error('Error updating IP access rule:', error);
    return NextResponse.json(
      { error: 'Failed to update IP access rule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    await rateLimitManagerService.deleteIPAccessRule(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting IP access rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete IP access rule' },
      { status: 500 }
    );
  }
}
