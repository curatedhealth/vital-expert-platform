import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyManagementService } from '@/services/api-key-management.service';
import { withAuth } from '@/lib/auth/api-auth-middleware';

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

      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      
      const filters = {
        providerId: searchParams.get('providerId') || undefined,
        isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
        search: searchParams.get('search') || undefined,
      };

      const apiKeyService = new ApiKeyManagementService();
      const response = await apiKeyService.getApiKeys(filters, { page, limit });
      
      return NextResponse.json(response);
    } catch (error) {
      console.error('API keys API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch API keys' },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      // Verify admin role
      if (!['admin', 'super_admin'].includes(user.role)) {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' }, 
          { status: 403 }
        );
      }

      const apiKeyService = new ApiKeyManagementService();

      const body = await req.json();
      const { provider_id, key_name, api_key, expires_at } = body;

      if (!provider_id || !key_name || !api_key) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const result = await apiKeyService.createApiKey({
        provider_id,
        key_name,
        api_key,
        expires_at
      }, user.id);

      return NextResponse.json(result);
    } catch (error) {
      console.error('Create API key error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to create API key' },
        { status: 500 }
      );
    }
  });
}
