import { NextRequest, NextResponse } from 'next/server';

import { requirePermission, rateLimit } from '@/middleware/auth';
import { llmProviderService } from '@/shared/services/llm/llm-provider.service';
import { PermissionScope, PermissionAction } from '@vital/sdk/types/auth.types';
import { LLMProviderConfig } from '@/types/llm-provider.types';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/llm/providers/[id] - Get specific provider
export const _GET = rateLimit(100)(requirePermission({
  scope: PermissionScope.LLM_PROVIDERS,
  action: PermissionAction.READ
})(async (request: NextRequest, user: unknown) => {
  const params = { id: request.url.split('/').pop()! };
  try {
    const provider = await llmProviderService.getProvider(params.id);

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(provider);
  } catch (error) {
    console.error('Error fetching LLM provider:', error);
    return NextResponse.json(
      { error: 'Failed to fetch LLM provider' },
      { status: 500 }
    );
  }
}));

// PUT /api/llm/providers/[id] - Update provider
export const _PUT = rateLimit(20)(requirePermission({
  scope: PermissionScope.LLM_PROVIDERS,
  action: PermissionAction.UPDATE
})(async (request: NextRequest, user: unknown) => {
  const params = { id: request.url.split('/').pop()! };
  try {
    const body = await request.json();

    // Add user context to updates
    const updates: Partial<LLMProviderConfig> = {
      ...body,
      updated_by: user.id
    };

    await llmProviderService.updateProvider(params.id, updates);

    return NextResponse.json({
      message: 'Provider updated successfully'
    });
  } catch (error) {
    console.error('Error updating LLM provider:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Provider not found' },
          { status: 404 }
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
      { error: 'Failed to update LLM provider' },
      { status: 500 }
    );
  }
}));

// DELETE /api/llm/providers/[id] - Delete provider
export const DELETE = rateLimit(10)(requirePermission({
  scope: PermissionScope.LLM_PROVIDERS,
  action: PermissionAction.DELETE
})(async (request: NextRequest, user: unknown) => {
  const params = { id: request.url.split('/').pop()! };
  try {
    await llmProviderService.deleteProvider(params.id);

    return NextResponse.json({
      message: 'Provider deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting LLM provider:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete LLM provider' },
      { status: 500 }
    );
  }
}));