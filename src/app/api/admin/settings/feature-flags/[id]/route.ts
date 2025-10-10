import { NextRequest, NextResponse } from 'next/server';
import { SystemSettingsService } from '@/services/system-settings.service';

export const dynamic = 'force-dynamic';

const systemSettingsService = new SystemSettingsService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const featureFlag = await systemSettingsService.getFeatureFlag(params.id);
    return NextResponse.json(featureFlag);
  } catch (error) {
    console.error('Error fetching feature flag:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature flag' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const featureFlag = await systemSettingsService.updateFeatureFlag(params.id, body);
    return NextResponse.json(featureFlag);
  } catch (error) {
    console.error('Error updating feature flag:', error);
    return NextResponse.json(
      { error: 'Failed to update feature flag' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await systemSettingsService.deleteFeatureFlag(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feature flag:', error);
    return NextResponse.json(
      { error: 'Failed to delete feature flag' },
      { status: 500 }
    );
  }
}
