import { NextRequest, NextResponse } from 'next/server';
import { SystemSettingsService } from '@/services/system-settings.service';

export const dynamic = 'force-dynamic';

const systemSettingsService = new SystemSettingsService();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      enabled: searchParams.get('enabled') ? searchParams.get('enabled') === 'true' : undefined,
      environment: searchParams.get('environment') || undefined,
      search: searchParams.get('search') || undefined
    };

    const featureFlags = await systemSettingsService.getFeatureFlags(filters);
    return NextResponse.json(featureFlags);
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature flags' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Feature flag name is required' },
        { status: 400 }
      );
    }

    const featureFlag = await systemSettingsService.createFeatureFlag(body);
    return NextResponse.json(featureFlag, { status: 201 });
  } catch (error) {
    console.error('Error creating feature flag:', error);
    return NextResponse.json(
      { error: 'Failed to create feature flag' },
      { status: 500 }
    );
  }
}
