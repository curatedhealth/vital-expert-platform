import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/knowledge-domains
 * Fetches all available RAG knowledge domains from the database
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('[Knowledge Domains API] Supabase configuration missing, returning empty array');
      return NextResponse.json({ domains: [] });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get tenant_id from headers or cookies
    const tenantId = request.headers.get('x-tenant-id') || request.cookies.get('tenant_id')?.value;

    // Build query - select only columns that exist
    // Only return domains that have associated knowledge sources with content
    let query = supabase
      .from('knowledge_domains')
      .select('id, name')
      .order('name', { ascending: true });

    // Apply tenant filtering if tenant_id exists
    if (tenantId) {
      query = query.contains('allowed_tenants', [tenantId]);
    }

    // Fetch knowledge domains from database
    const { data: domains, error } = await query;

    if (error) {
      console.error('Error fetching knowledge domains:', error);
      // If table doesn't exist, return empty array instead of error
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('[Knowledge Domains API] Knowledge domains table does not exist yet, returning empty array');
        return NextResponse.json({ domains: [] });
      }
      // For other errors, return empty array gracefully
      console.warn('[Knowledge Domains API] Database error, returning empty array:', error.message);
      return NextResponse.json({ domains: [] });
    }

    // Filter domains to only include those with content (knowledge sources)
    if (domains && domains.length > 0) {
      const domainNames = domains.map((d: any) => d.name);
      
      // Check which domains have knowledge sources with content
      const { data: sources, error: sourcesError } = await supabase
        .from('knowledge_sources')
        .select('domain')
        .in('domain', domainNames)
        .eq('is_active', true)
        .not('processing_status', 'eq', 'failed');

      if (sourcesError) {
        console.error('Error checking knowledge sources:', sourcesError);
        // If check fails, return empty array to be safe
        return NextResponse.json({
          domains: [],
          count: 0,
        });
      } else if (sources && sources.length > 0) {
        // Get unique domains that have sources
        const domainsWithContent = new Set(sources.map((s: any) => s.domain));
        // Filter domains to only those with content
        const filteredDomains = domains.filter((d: any) => domainsWithContent.has(d.name));
        return NextResponse.json({
          domains: filteredDomains,
          count: filteredDomains.length,
        });
      } else {
        // No sources found, return empty array
        return NextResponse.json({
          domains: [],
          count: 0,
        });
      }
    }

    // No domains found
    return NextResponse.json({
      domains: [],
      count: 0,
    });
  } catch (error) {
    console.error('Unexpected error in knowledge-domains API:', error);
    // Return empty array instead of error to prevent UI breakage
    return NextResponse.json({
      domains: [],
      count: 0,
    });
  }
}
