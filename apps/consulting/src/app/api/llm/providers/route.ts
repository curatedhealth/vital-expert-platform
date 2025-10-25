import { NextRequest, NextResponse } from 'next/server';

import { requirePermission, rateLimit } from '@/middleware/auth';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { llmProviderService } from '@/shared/services/llm/llm-provider.service';
import { PermissionScope, PermissionAction } from '@vital/sdk/types/auth.types';
import { LLMProviderConfig, ProviderFilters, ProviderSort } from '@/types/llm-provider.types';

// GET /api/llm/providers - List providers with pagination and filtering
export const _GET = rateLimit(50)(requirePermission({
  scope: PermissionScope.LLM_PROVIDERS,
  action: PermissionAction.READ
})(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search') || undefined;
    const providerType = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const isActive = searchParams.get('isActive') === 'true' ? true :
                    searchParams.get('isActive') === 'false' ? false : undefined;

    // Build filters
    const filters: ProviderFilters = {
      provider_type: providerType as unknown,
      status: status as unknown,
      is_active: isActive
    } as unknown;

    // Build sort
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    const sort: ProviderSort = {
      field: sortBy as unknown,
      direction: sortOrder
    };

    // Remove undefined values from filters
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof ProviderFilters] === undefined) {
        delete filters[key as keyof ProviderFilters];
      }
    });

    const response = await llmProviderService.listProviders(
      Object.keys(filters).length > 0 ? filters : undefined,
      sort,
      page,
      pageSize
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error listing LLM providers:', error);
    return NextResponse.json(
      { error: 'Failed to list LLM providers' },
      { status: 500 }
    );
  }
}));

// POST /api/llm/providers - Create new provider
export const _POST = rateLimit(10)(requirePermission({
  scope: PermissionScope.LLM_PROVIDERS,
  action: PermissionAction.CREATE
})(async (request: NextRequest, user) => {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.provider_name || !body.provider_type) {
      return NextResponse.json(
        { error: 'Missing required fields: provider_name, provider_type' },
        { status: 400 }
      );
    }

    // Create provider config with user context
    const config: LLMProviderConfig = {
      ...body,
      created_by: user.id,
      updated_by: user.id
    };

    const providerId = await llmProviderService.createProvider(config);

    return NextResponse.json(
      {
        id: providerId,
        message: 'LLM provider created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating LLM provider:', error);

    if (error instanceof Error) {
      if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'Provider with this name already exists' },
          { status: 409 }
        );
      }
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create LLM provider' },
      { status: 500 }
    );
  }
}));