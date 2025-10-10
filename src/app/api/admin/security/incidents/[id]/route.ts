import { NextRequest, NextResponse } from 'next/server';
import { rateLimitManagerService } from '@/services/rate-limit-manager.service';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const incidents = await rateLimitManagerService.getSecurityIncidents();
    const incident = incidents.find(i => i.id === params.id);

    if (!incident) {
      return NextResponse.json(
        { error: 'Security incident not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Error fetching security incident:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security incident' },
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
    const incident = await rateLimitManagerService.updateSecurityIncident(params.id, body);

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Error updating security incident:', error);
    return NextResponse.json(
      { error: 'Failed to update security incident' },
      { status: 500 }
    );
  }
}
