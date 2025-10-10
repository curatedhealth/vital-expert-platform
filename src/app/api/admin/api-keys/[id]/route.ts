import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyManagementService } from '@/services/api-key-management.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const apiKeyService = new ApiKeyManagementService();

    const { id } = params;
    const body = await request.json();
    const { action, data } = body;

    if (action === 'rotate') {
      const { api_key } = data;
      if (!api_key) {
        return NextResponse.json(
          { error: 'API key is required for rotation' },
          { status: 400 }
        );
      }
      const result = await apiKeyService.rotateApiKey(id, api_key, user.id);
      return NextResponse.json(result);
    } else if (action === 'revoke') {
      await apiKeyService.revokeApiKey(id, user.id);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('API key update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update API key' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

      const { id } = params;
      const response = await apiKeyService.getApiKeys({}, { page: 1, limit: 1 });
      const apiKey = response.data.find(key => key.id === id);

      if (!apiKey) {
        return NextResponse.json(
          { error: 'API key not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(apiKey);
    } catch (error) {
      console.error('API key get error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch API key' },
        { status: 500 }
      );
    }
  });
}
