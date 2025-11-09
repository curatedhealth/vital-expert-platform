import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch from both dh_rag_source and rag_knowledge_sources
    const [dhRagResult, ragKnowledgeResult] = await Promise.all([
      supabase
        .from('dh_rag_source')
        .select('id, code, name, source_type, description')
        .order('name'),
      
      supabase
        .from('rag_knowledge_sources')
        .select('id, name as code, title as name, source_type, description, domain')
        .order('name')
    ]);

    if (dhRagResult.error) {
      console.error('Error fetching dh_rag_source:', dhRagResult.error);
    }
    
    if (ragKnowledgeResult.error) {
      console.error('Error fetching rag_knowledge_sources:', ragKnowledgeResult.error);
    }

    // Combine both sources
    const dhRags = (dhRagResult.data || []).map(rag => ({
      ...rag,
      domain: null, // dh_rag_source doesn't have domain field
      source: 'dh_rag_source'
    }));

    const knowledgeRags = (ragKnowledgeResult.data || []).map(rag => ({
      ...rag,
      code: rag.code || rag.name, // Ensure code exists
      source: 'rag_knowledge_sources'
    }));

    // Combine and deduplicate by name
    const allRags = [...dhRags, ...knowledgeRags];
    const uniqueRags = allRags.reduce((acc, rag) => {
      const existing = acc.find(r => r.name === rag.name || r.code === rag.code);
      if (!existing) {
        acc.push(rag);
      }
      return acc;
    }, [] as any[]);

    return NextResponse.json({
      success: true,
      rags: uniqueRags.sort((a, b) => a.name.localeCompare(b.name)),
    });
  } catch (error) {
    console.error('Error in RAG sources API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

