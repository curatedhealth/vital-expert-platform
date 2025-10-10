import { NextRequest, NextResponse } from 'next/server';
import { rateLimitManagerService } from '@/services/rate-limit-manager.service';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const configs = await rateLimitManagerService.getRateLimitConfigs();
    const config = configs.find(c => c.id === params.id);

    if (!config) {
      return NextResponse.json(
        { error: 'Rate limit configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching rate limit config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rate limit configuration' },
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
    const config = await rateLimitManagerService.updateRateLimitConfig(params.id, body);

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error updating rate limit config:', error);
    return NextResponse.json(
      { error: 'Failed to update rate limit configuration' },
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

    await rateLimitManagerService.deleteRateLimitConfig(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rate limit config:', error);
    return NextResponse.json(
      { error: 'Failed to delete rate limit configuration' },
      { status: 500 }
    );
  }
}
