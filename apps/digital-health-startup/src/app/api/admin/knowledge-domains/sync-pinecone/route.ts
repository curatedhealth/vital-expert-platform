/**
 * API Endpoint: Sync Domain to Pinecone
 * 
 * Creates/verifies namespace in Pinecone for a knowledge domain.
 * This endpoint is called automatically when a domain is created,
 * but can also be called manually to sync existing domains.
 * 
 * Security: Super admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/middleware/auth';

export const POST = requireSuperAdmin(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { domain_id, domain_name, slug } = body;

    if (!domain_id || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: domain_id, slug' },
        { status: 400 }
      );
    }

    // Get namespace from slug
    const namespace = (slug || domain_name || '').toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/_/g, '-')
      .replace(/\//g, '-')
      .substring(0, 64);

    // Call Python AI Engine to create namespace
    const pythonEngineUrl = process.env.PYTHON_AI_ENGINE_URL || 
                          process.env.NEXT_PUBLIC_PYTHON_AI_ENGINE_URL || 
                          'http://localhost:8080';

    try {
      const response = await fetch(`${pythonEngineUrl}/api/admin/create-namespace`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain_id,
          domain_name: domain_name || slug,
          namespace,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to create namespace in Pinecone');
      }

      const result = await response.json();

      return NextResponse.json({
        success: true,
        namespace,
        message: `Namespace '${namespace}' created/verified in Pinecone`,
        ...result,
      });
    } catch (error) {
      console.error('Error calling Python AI Engine:', error);
      return NextResponse.json(
        { 
          error: 'Failed to sync to Pinecone', 
          details: error instanceof Error ? error.message : 'Unknown error',
          // Continue anyway - domain is created in Supabase
          warning: 'Domain created in Supabase, but Pinecone sync failed. You can retry later.'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});

