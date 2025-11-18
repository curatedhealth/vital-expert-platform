import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * GET /api/knowledge/documents
 * Fetch knowledge documents (authenticated users only)
 * 
 * Security: Uses user session-based client (RLS enforced)
 */
export async function GET(request: NextRequest) {
  try {
    // Use user session-based client (respects RLS)
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[Documents API] Authentication failed:', authError?.message);
      return NextResponse.json(
        { 
          error: 'Authentication required',
          details: 'Please log in to access documents',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    console.log('[Documents API] Authenticated user:', user.id);


    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const agentId = searchParams.get('agentId');
    const isGlobal = searchParams.get('isGlobal');
    
    console.log('[Documents API] Query params:', { domain, agentId, isGlobal });
    
    // Build query for knowledge_sources table
    // Note: Excluding 'content' field as it can be very large and cause performance issues
    // Content is only needed when viewing individual documents, not in list view
    console.log('[Documents API] Building query...');
    // Query columns from knowledge_sources table
    let query = supabase
      .from('knowledge_sources')
      .select(`
        id,
        title,
        file_name,
        file_size,
        file_type,
        domain,
        status,
        created_at,
        updated_at,
        tags,
        metadata,
        tenant_id,
        user_id
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (domain && domain !== 'all') {
      console.log('[Documents API] Filtering by domain:', domain);
      query = query.eq('domain', domain);
    }

    // Note: rag_knowledge_sources doesn't have is_public field
    // All documents are tied to tenant_id for access control

    console.log('[Documents API] Executing query...');
    const { data: documents, error } = await query;

    if (error) {
      console.error('[Documents API] Database error:', error);
      console.error('[Documents API] Error code:', error.code);
      console.error('[Documents API] Error details:', error.details);
      console.error('[Documents API] Error hint:', error.hint);
      console.error('[Documents API] Error message:', error.message);
      
      const errorResponse = { 
        error: 'Failed to fetch documents', 
        details: error.message || 'Database query failed',
        code: error.code || 'UNKNOWN',
        hint: error.hint || 'Check server logs for details',
        timestamp: new Date().toISOString(),
      };
      
      console.error('[Documents API] Returning database error response:', errorResponse);
      
      return NextResponse.json(errorResponse, { status: 500 });
    }
    
    console.log(`[Documents API] Query successful, found ${documents?.length || 0} documents`);
    
    // Transform the data to match the frontend Document interface
    console.log('[Documents API] Transforming documents...');
    const transformedDocuments = (documents || []).map((doc, index) => {
      try {
        // Use chunk_count from table if available, otherwise default to 0
        const chunks = doc.chunk_count != null ? doc.chunk_count : 0;
        
        // Safely extract metadata
        const metadata = doc.metadata || {};
        
        return {
          id: doc.id,
          name: doc.title || doc.file_name || 'Untitled',
          type: doc.file_type || 'unknown',
          size: doc.file_size || 0,
          uploadedAt: doc.created_at || doc.processed_at || new Date().toISOString(),
          status: doc.status || 'pending', // Use status directly (completed, processing, failed, pending)
          domain: doc.domain || null,
          isGlobal: false, // All documents are tenant-scoped in RAG system
          chunks: chunks, // Use chunk_count from table

          // Basic metadata
          title: doc.title || doc.file_name || 'Untitled',
          description: metadata.description || null,

          // Legacy summary field for backward compatibility
          summary: metadata.description || doc.title || doc.file_name || 'Untitled'
        };
      } catch (transformError) {
        console.error(`[Documents API] Error transforming document ${index}:`, transformError);
        // Return minimal valid document structure
        return {
          id: doc?.id || `error-${index}`,
          name: 'Error loading document',
          type: 'unknown',
          size: 0,
          uploadedAt: new Date().toISOString(),
          status: 'error',
          domain: null,
          isGlobal: false,
          chunks: 0,
          title: 'Error loading document',
          description: null,
          summary: 'Error loading document'
        };
      }
    });
    
    console.log(`[Documents API] Transformed ${transformedDocuments.length} documents`);

    // Chunk counts are already populated from chunk_count column in the table
    // Only fetch from document_chunks table if chunk_count is null/0 and we have a small result set
    const docsNeedingChunkCount = transformedDocuments.filter(doc => !doc.chunks || doc.chunks === 0);
    
    if (docsNeedingChunkCount.length > 0 && docsNeedingChunkCount.length < 100) {
      try {
        // For documents without chunk_count, query document_chunks table
        const chunkCountPromises = docsNeedingChunkCount.map(async (doc) => {
          try {
            const { count, error } = await supabase
              .from('document_chunks')
              .select('*', { count: 'exact', head: true })
              .eq('document_id', doc.id);

            if (!error && count !== null) {
              doc.chunks = count;
            } else if (error) {
              console.warn(`Failed to get chunk count for ${doc.id}:`, error.message);
            }
          } catch (err) {
            console.warn(`Error getting chunk count for ${doc.id}:`, err);
          }
        });

        // Wait for all chunk counts (with timeout to prevent hanging)
        await Promise.race([
          Promise.all(chunkCountPromises),
          new Promise((resolve) => setTimeout(resolve, 3000)), // 3s timeout
        ]);
      } catch (error) {
        console.warn('Error getting chunk counts:', error);
        // Continue without chunk counts - documents will show 0 chunks
      }
    }

    console.log('[Documents API] Preparing response...');
    try {
      const response = {
        success: true,
        documents: transformedDocuments,
        total: transformedDocuments.length
      };
      
      console.log(`[Documents API] Returning response with ${response.total} documents`);
      return NextResponse.json(response);
    } catch (responseError) {
      console.error('[Documents API] Error creating response:', responseError);
      throw responseError;
    }

  } catch (error) {
    console.error('[Documents API] Unexpected error:', error);
    console.error('[Documents API] Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    // Ensure we always return a proper error response
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = {
      error: 'Failed to fetch knowledge documents',
      details: errorMessage || 'Unknown error occurred',
      type: error instanceof Error ? error.constructor.name : typeof error,
      timestamp: new Date().toISOString(),
    };
    
    console.error('[Documents API] Returning error response:', errorDetails);
    
    return NextResponse.json(errorDetails, { status: 500 });
  }
}