import { NextRequest, NextResponse } from 'next/server';
import { alertManagerService } from '@/services/alert-manager.service';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const rules = await alertManagerService.getAlertRules();
    const rule = rules.find(r => r.id === params.id);

    if (!rule) {
      return NextResponse.json(
        { error: 'Alert rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(rule);
  } catch (error) {
    console.error('Error fetching alert rule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alert rule' },
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
    const rule = await alertManagerService.updateAlertRule(params.id, body);

    return NextResponse.json(rule);
  } catch (error) {
    console.error('Error updating alert rule:', error);
    return NextResponse.json(
      { error: 'Failed to update alert rule' },
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

    await alertManagerService.deleteAlertRule(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting alert rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete alert rule' },
      { status: 500 }
    );
  }
}
