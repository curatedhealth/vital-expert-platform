import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with service role key (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: NextRequest) {
  try {
    console.log('📚 Knowledge documents API called');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const domain = searchParams.get('domain');
    const agentId = searchParams.get('agent_id');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const organizationId = searchParams.get('organization_id');

    console.log('🔍 Query parameters:', {
      page,
      limit,
      domain,
      agentId,
      status,
      search,
      organizationId
    });

    // Build query
    let query = supabase
      .from('knowledge_sources')
      .select(`
        id,
        name,
        title,
        description,
        source_type,
        source_url,
        file_path,
        file_size,
        mime_type,
        domain,
        category,
        tags,
        processing_status,
        is_public,
        access_level,
        status,
        created_at,
        updated_at,
        processed_at
      `);

    // Apply filters
    if (domain) {
      query = query.eq('domain', domain);
    }

    if (status) {
      query = query.eq('processing_status', status);
    }

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,name.ilike.%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data: documents, error: documentsError, count } = await query;

    if (documentsError) {
      throw new Error(`Failed to fetch documents: ${documentsError.message}`);
    }

    // If agentId is specified, filter documents that are linked to this agent
    let filteredDocuments = documents || [];
    if (agentId) {
      const { data: agentLinks, error: linksError } = await supabase
        .from('agent_knowledge_access')
        .select('knowledge_source_id')
        .eq('agent_id', agentId);

      if (linksError) {
        console.warn('Failed to fetch agent links:', linksError.message);
      } else {
        const linkedDocumentIds = new Set(agentLinks?.map(link => link.knowledge_source_id) || []);
        filteredDocuments = filteredDocuments.filter(doc => 
          linkedDocumentIds.has(doc.id) || doc.is_public === true
        );
      }
    }

    // Get total count for pagination
    let totalCount = count || 0;
    if (agentId) {
      // Recalculate count for agent-specific documents
      totalCount = filteredDocuments.length;
    }

    const totalPages = Math.ceil(totalCount / limit);

    console.log(`📊 Found ${filteredDocuments.length} documents (page ${page}/${totalPages})`);

    return NextResponse.json({
      success: true,
      documents: filteredDocuments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        domain,
        agentId,
        status,
        search,
        organizationId
      }
    });

  } catch (error) {
    console.error('❌ Knowledge documents error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch documents', 
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        documents: [],
        pagination: {
          page: 1,
          limit: 20,
          totalCount: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📚 Knowledge documents search API called');

    const body = await request.json();
    const { 
      query: searchQuery, 
      domain, 
      agentId, 
      limit = 10,
      similarity_threshold = 0.7
    } = body;

    if (!searchQuery) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Vector search:', {
      query: searchQuery.substring(0, 100) + '...',
      domain,
      agentId,
      limit,
      similarity_threshold
    });

    // Generate embedding for search query
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: searchQuery,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Perform vector similarity search using the existing function
    const { data: searchResults, error: searchError } = await supabase.rpc(
      'search_knowledge_by_embedding',
      {
        query_embedding: queryEmbedding,
        domain_filter: domain || null,
        embedding_model: 'openai',
        max_results: limit,
        similarity_threshold: similarity_threshold
      }
    );

    if (searchError) {
      console.warn('Vector search failed, falling back to text search:', searchError.message);
      
      // Fallback to text search
      let query = supabase
        .from('knowledge_sources')
        .select(`
          id,
          name,
          title,
          description,
          source_type,
          domain,
          processing_status,
          created_at
        `)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
        .limit(limit);

      if (domain) {
        query = query.eq('domain', domain);
      }

      const { data: textResults, error: textError } = await query;

      if (textError) {
        throw new Error(`Search failed: ${textError.message}`);
      }

      return NextResponse.json({
        success: true,
        results: textResults || [],
        search_type: 'text',
        query: searchQuery,
        total_results: textResults?.length || 0
      });
    }

    // Filter by agent if specified
    let filteredResults = searchResults || [];
    if (agentId) {
      const { data: agentLinks, error: linksError } = await supabase
        .from('agent_knowledge_access')
        .select('knowledge_source_id')
        .eq('agent_id', agentId);

      if (!linksError && agentLinks) {
        const linkedDocumentIds = new Set(agentLinks.map(link => link.knowledge_source_id));
        filteredResults = filteredResults.filter(result => 
          linkedDocumentIds.has(result.source_id) || result.is_public === true
        );
      }
    }

    console.log(`🔍 Found ${filteredResults.length} relevant documents`);

    return NextResponse.json({
      success: true,
      results: filteredResults,
      search_type: 'vector',
      query: searchQuery,
      total_results: filteredResults.length,
      similarity_threshold
    });

  } catch (error) {
    console.error('❌ Knowledge search error:', error);
    
    return NextResponse.json(
      { 
        error: 'Search failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        results: [],
        total_results: 0
      },
      { status: 500 }
    );
  }
}
