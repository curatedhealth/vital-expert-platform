import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const agentId = searchParams.get('agentId');
    const isGlobal = searchParams.get('isGlobal');
    // Build query for rag_knowledge_sources table
    let query = supabase
      .from('rag_knowledge_sources')
      .select(`
        id,
        name,
        title,
        file_path,
        file_size,
        mime_type,
        domain,
        processing_status,
        processed_at,
        created_at,
        updated_at,
        description
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (domain && domain !== 'all') {
      query = query.eq('domain', domain);
    }

    // Note: rag_knowledge_sources doesn't have is_public field
    // All documents are tied to tenant_id for access control

    const { data: documents, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents', details: error.message },
        { status: 500 }
      );
    }
    // Transform the data to match the frontend Document interface
    const transformedDocuments = (documents || []).map(doc => {

      return {
        id: doc.id,
        name: doc.name || doc.file_path,
        type: doc.mime_type,
        size: doc.file_size,
        uploadedAt: doc.created_at || doc.processed_at,
        status: doc.processing_status === 'completed' ? 'completed' :
               doc.processing_status === 'processing' ? 'processing' : 'failed',
        domain: doc.domain,
        isGlobal: false, // All documents are tenant-scoped in RAG system
        chunks: 0, // We'll populate this below

        // Basic metadata
        title: doc.title,
        description: doc.description,

        // Legacy summary field for backward compatibility
        summary: doc.description || doc.title || doc.name
      };
    });

    // Get chunks count for each document
    if (transformedDocuments.length > 0) {
      try {

        // Count chunks manually for each document - use rag_knowledge_chunks table
        for (const doc of transformedDocuments) {
          const { count, error } = await supabase
            .from('rag_knowledge_chunks')
            .select('*', { count: 'exact', head: true })
            .eq('source_id', doc.id);

          if (!error && count !== null) {
            doc.chunks = count;
          } else if (error) {
            console.warn(`Failed to get chunk count for ${doc.name}:`, error);
          }
        }
      } catch (error) {
        console.warn('Error getting chunk counts:', error);
      }
    }

    return NextResponse.json({
      success: true,
      documents: transformedDocuments,
      total: transformedDocuments.length
    });

  } catch (error) {
    console.error('Knowledge documents API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch knowledge documents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}