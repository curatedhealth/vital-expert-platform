import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/knowledge/bases
 * Returns a simple list of knowledge bases (one per knowledge_source row)
 * mapped into the marketplace shape. Gracefully falls back to empty on errors.
 */
export async function GET(_req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.warn('[knowledge/bases] missing Supabase config');
      return NextResponse.json({ bases: [], count: 0 });
    }

    // Use service-role to bypass RLS for catalog reads (safe for read-only catalog)
    const supabase = createSupabaseClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: sources, error } = await supabase
      .from('knowledge_sources')
      .select(`
        id,
        title,
        file_name,
        domain,
        chunk_count,
        created_at,
        updated_at,
        metadata
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[knowledge/bases] error', error);
      return NextResponse.json({ bases: [], count: 0 });
    }

    const bases =
      (sources || []).map((src: any) => {
        const name = src.title || src.file_name || 'Untitled';
        const domainSlug = src.domain || 'unassigned';
        return {
          id: src.id,
          name: name,
          display_name: name,
          description: src.metadata?.description || src.metadata?.summary || '',
          purpose_description: src.metadata?.purpose || '',
          rag_type: 'global',
          access_level: src.metadata?.access_level || 'organization',
          status: src.metadata?.status || 'active',
          knowledge_domains: [domainSlug],
          therapeutic_areas: src.metadata?.therapeutic_areas || [],
          document_count: 1,
          total_chunks: src.chunk_count ?? 0,
          quality_score: src.metadata?.quality_score ?? null,
          is_active: src.metadata?.is_active ?? true,
          created_at: src.created_at,
          updated_at: src.updated_at,
        };
      }) ?? [];

    // Fallback: if no knowledge_sources, build from knowledge_documents + document_domains
    if (bases.length === 0) {
      const { data: docs, error: docError } = await supabase
        .from('knowledge_documents')
        .select('id, title, file_name, status, created_at, updated_at, metadata, domain, domain_id')
        .limit(500);

      if (docError) {
        console.error('[knowledge/bases] fallback docs error', docError);
        return NextResponse.json({ bases: [], count: 0 });
      }

      // Fetch domain mappings for these docs
      const docIds = (docs || []).map((d: any) => d.id);
      let domainsByDoc = new Map<string, string[]>();
      if (docIds.length > 0) {
        const { data: docDomains, error: domError } = await supabase
          .from('document_domains')
          .select('document_id, knowledge_domains(slug)')
          .in('document_id', docIds);

        if (domError) {
          console.error('[knowledge/bases] fallback docDomains error', domError);
        } else if (docDomains) {
          for (const row of docDomains as any[]) {
            const slug = row.knowledge_domains?.slug;
            if (!slug) continue;
            const arr = domainsByDoc.get(row.document_id) || [];
            arr.push(slug);
            domainsByDoc.set(row.document_id, arr);
          }
        }
      }

      const docBases =
        (docs || []).map((doc: any) => {
          const name = doc.title || doc.file_name || 'Untitled';
          const fallbackSlug = doc.domain || doc.domain_id || 'unassigned';
          const domainList = domainsByDoc.get(doc.id) || [fallbackSlug];
          return {
            id: doc.id,
            name,
            display_name: name,
            description: doc.metadata?.description || '',
            purpose_description: doc.metadata?.purpose || '',
            rag_type: 'global',
            access_level: 'organization',
            status: doc.status || 'active',
            knowledge_domains: domainList,
            therapeutic_areas: doc.metadata?.therapeutic_areas || [],
            document_count: 1,
            total_chunks: doc.metadata?.chunk_count ?? 0,
            quality_score: doc.metadata?.quality_score ?? null,
            is_active: true,
            created_at: doc.created_at,
            updated_at: doc.updated_at,
          };
        }) ?? [];

      return NextResponse.json({
        bases: docBases,
        count: docBases.length,
      });
    }

    return NextResponse.json({
      bases,
      count: bases.length,
    });
  } catch (err) {
    console.error('[knowledge/bases] unexpected error', err);
    return NextResponse.json({ bases: [], count: 0 });
  }
}
