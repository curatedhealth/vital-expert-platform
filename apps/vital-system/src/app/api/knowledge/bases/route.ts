import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/knowledge/bases
 * Returns a simple list of knowledge bases (one per knowledge_source row)
 * mapped into the marketplace shape. Gracefully falls back to empty on errors.
 */
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: sources, error } = await supabase
      .from('knowledge_sources')
      .select(
        `
          id,
          title,
          file_name,
          domain,
          status,
          access_level,
          is_active,
          chunk_count,
          created_at,
          updated_at,
          metadata
        `,
      )
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
          access_level: src.access_level || 'organization',
          status: src.status || 'active',
          knowledge_domains: [domainSlug],
          therapeutic_areas: src.metadata?.therapeutic_areas || [],
          document_count: 1,
          total_chunks: src.chunk_count ?? 0,
          quality_score: src.metadata?.quality_score ?? null,
          is_active: src.is_active ?? true,
          created_at: src.created_at,
          updated_at: src.updated_at,
        };
      }) ?? [];

    return NextResponse.json({
      bases,
      count: bases.length,
    });
  } catch (err) {
    console.error('[knowledge/bases] unexpected error', err);
    return NextResponse.json({ bases: [], count: 0 });
  }
}
