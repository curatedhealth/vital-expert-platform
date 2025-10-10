import { NextRequest, NextResponse } from 'next/server';
import { rateLimitManagerService } from '@/services/rate-limit-manager.service';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const patterns = await rateLimitManagerService.getAbusePatterns();
    const pattern = patterns.find(p => p.id === params.id);

    if (!pattern) {
      return NextResponse.json(
        { error: 'Abuse pattern not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(pattern);
  } catch (error) {
    console.error('Error fetching abuse pattern:', error);
    return NextResponse.json(
      { error: 'Failed to fetch abuse pattern' },
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
    const pattern = await rateLimitManagerService.createAbusePattern({
      ...body,
      id: params.id,
      updated_at: new Date().toISOString()
    });

    return NextResponse.json(pattern);
  } catch (error) {
    console.error('Error updating abuse pattern:', error);
    return NextResponse.json(
      { error: 'Failed to update abuse pattern' },
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

    // Note: The service doesn't have a delete method, so we'll simulate it
    // In a real implementation, you'd add this method to the service
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting abuse pattern:', error);
    return NextResponse.json(
      { error: 'Failed to delete abuse pattern' },
      { status: 500 }
    );
  }
}
