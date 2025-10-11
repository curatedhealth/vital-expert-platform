import { NextRequest, NextResponse } from 'next/server';
import { alertManagerService } from '@/services/alert-manager.service';

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const createdBy = searchParams.get('createdBy') || undefined;

    const rules = await alertManagerService.getAlertRules({
      isActive: isActive ? isActive === 'true' : undefined,
      createdBy
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching alert rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alert rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {

    const body = await request.json();
    const rule = await alertManagerService.createAlertRule(body);

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error('Error creating alert rule:', error);
    return NextResponse.json(
      { error: 'Failed to create alert rule' },
      { status: 500 }
    );
  }
}
