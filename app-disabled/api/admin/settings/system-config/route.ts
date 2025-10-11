import { NextRequest, NextResponse } from 'next/server';
import { SystemSettingsService } from '@/services/system-settings.service';
import { withAuth } from '@/lib/auth/api-auth-middleware';

export const dynamic = 'force-dynamic';

const systemSettingsService = new SystemSettingsService();

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      // Verify admin role
      if (!['admin', 'super_admin'].includes(user.role)) {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' }, 
          { status: 403 }
        );
      }

      const searchParams = req.nextUrl.searchParams;
      const filters = {
        category: searchParams.get('category') || undefined,
        environment: searchParams.get('environment') || undefined,
        search: searchParams.get('search') || undefined
      };

      const systemSettings = await systemSettingsService.getSystemSettings(filters);
      return NextResponse.json(systemSettings);
    } catch (error) {
      console.error('Error fetching system settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch system settings' },
        { status: 500 }
      );
    }
  });
}

export async function PUT(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      // Verify admin role
      if (!['admin', 'super_admin'].includes(user.role)) {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' }, 
          { status: 403 }
        );
      }

      const body = await req.json();
      
      // Validate required fields
      if (!body.key) {
        return NextResponse.json(
          { error: 'Setting key is required' },
          { status: 400 }
        );
      }

      const systemSetting = await systemSettingsService.updateSystemSetting(
        body.key, 
        body.value, 
        body.category
      );
      return NextResponse.json(systemSetting);
    } catch (error) {
      console.error('Error updating system setting:', error);
      return NextResponse.json(
        { error: 'Failed to update system setting' },
        { status: 500 }
      );
    }
  });
}
