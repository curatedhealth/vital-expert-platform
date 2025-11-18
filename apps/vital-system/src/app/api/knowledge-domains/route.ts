import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/knowledge-domains
 * Fetches all available RAG knowledge domains from the database
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get tenant_id from headers or cookies
    const tenantId = request.headers.get('x-tenant-id') || request.cookies.get('tenant_id')?.value;

    // Build query
    let query = supabase
      .from('knowledge_domains')
      .select('id, name, tier')
      .order('name', { ascending: true });

    // Apply tenant filtering if tenant_id exists
    if (tenantId) {
      query = query.contains('allowed_tenants', [tenantId]);
    }

    // Fetch knowledge domains from database
    const { data: domains, error } = await query;

    if (error) {
      console.error('Error fetching knowledge domains:', error);
      return NextResponse.json(
        { error: 'Failed to fetch knowledge domains', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      domains: domains || [],
      count: domains?.length || 0,
    });
  } catch (error) {
    console.error('Unexpected error in knowledge-domains API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
