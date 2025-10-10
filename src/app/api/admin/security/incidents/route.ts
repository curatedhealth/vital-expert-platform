import { NextRequest, NextResponse } from 'next/server';
import { rateLimitManagerService } from '@/services/rate-limit-manager.service';

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const status = searchParams.get('status') || undefined;
    const assignedTo = searchParams.get('assignedTo') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const incidents = await rateLimitManagerService.getSecurityIncidents({
      type,
      severity,
      status,
      assignedTo,
      startDate,
      endDate
    });

    return NextResponse.json(incidents);
  } catch (error) {
    console.error('Error fetching security incidents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security incidents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {

    const body = await request.json();
    const incident = await rateLimitManagerService.createSecurityIncident(body);

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error('Error creating security incident:', error);
    return NextResponse.json(
      { error: 'Failed to create security incident' },
      { status: 500 }
    );
  }
}
