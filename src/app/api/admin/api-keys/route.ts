import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyManagementService } from '@/services/api-key-management.service';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access

    const { searchParams } = new URL(request.url);
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
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const apiKeyService = new ApiKeyManagementService();

    const body = await request.json();
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
}
