import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/knowledge-domains
 * Returns the live knowledge domains catalog (normalized: id/slug/domain_type/name/is_active).
 * Falls back gracefully to an empty array if the table is missing.
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('[Knowledge Domains API] Supabase configuration missing, returning empty array');
      return NextResponse.json({ domains: [], count: 0 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Tenant scoping (optional)
    const tenantId = request.headers.get('x-tenant-id') || request.cookies.get('tenant_id')?.value;

    let query = supabase
      .from('knowledge_domains')
      .select('id, name, slug, domain_type, is_active')
      .order('name', { ascending: true });

    if (tenantId) {
      // If allowed_tenants exists, filter; otherwise ignore
      query = query.or('allowed_tenants.is.null,allowed_tenants.cs.' + JSON.stringify([tenantId]));
    }

    const { data: domains, error } = await query;

    if (error) {
      console.error('[Knowledge Domains API] Error fetching knowledge domains:', error);
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('[Knowledge Domains API] Table missing, returning empty array');
        return NextResponse.json({ domains: [], count: 0 });
      }
      return NextResponse.json({ domains: [], count: 0 });
    }

    return NextResponse.json({
      domains: domains || [],
      count: domains?.length ?? 0,
    });
  } catch (error) {
    console.error('Unexpected error in knowledge-domains API:', error);
    return NextResponse.json({
      domains: [],
      count: 0,
    });
  }
}
