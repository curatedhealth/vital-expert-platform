import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';



export async function GET(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);


    // Get URL parameters for filtering
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get('category');
    const agentFilter = searchParams.get('agent');
    // Get all documents with metadata from RAG tables
    const { data: documents, error: docsError } = await supabase
      .from('rag_knowledge_sources')
      .select('*')
      .order('created_at', { ascending: false });

    if (docsError) {
      console.error('Error fetching documents:', docsError);
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }

    // Get all chunks with metadata from RAG tables
    const { data: chunks, error: chunksError } = await supabase
      .from('rag_knowledge_chunks')
      .select('source_id, word_count, quality_score, created_at');

    if (chunksError) {
      console.error('Error fetching chunks:', chunksError);
      return NextResponse.json({ error: 'Failed to fetch chunks' }, { status: 500 });
    }

    // Calculate time periods
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // RAG Categories (based on document content and tags)
    const ragCategories = {
      clinical: { documents: 0, chunks: 0, size: 0 },
      regulatory: { documents: 0, chunks: 0, size: 0 },
      research: { documents: 0, chunks: 0, size: 0 },
      reimbursement: { documents: 0, chunks: 0, size: 0 },
      technology: { documents: 0, chunks: 0, size: 0 },
      other: { documents: 0, chunks: 0, size: 0 }
    };

    // Agent knowledge statistics
    const agentStats = {
      'FDA Regulatory Navigator': { documents: 0, chunks: 0, domains: new Set() },
      'Clinical Trial Architect': { documents: 0, chunks: 0, domains: new Set() },
      'Medical Writer Pro': { documents: 0, chunks: 0, domains: new Set() },
      'Reimbursement Strategist': { documents: 0, chunks: 0, domains: new Set() },
      'EMA/EU Regulatory Specialist': { documents: 0, chunks: 0, domains: new Set() }
    };

    // Time-based statistics
    let todayUploads = 0;
    let last24hUploads = 0;
    let last7dUploads = 0;
    let totalSize = 0;
    let avgChunkQuality = 0;

    // Helper function to determine document category
    const getDocumentCategory = (doc: unknown): string => {
      let category = 'other';
      const tags = doc.tags || [];
      const title = (doc.title || '').toLowerCase();
      const description = (doc.description || '').toLowerCase();

      if (tags.includes('regulatory') || title.includes('regulation') || title.includes('fda') || title.includes('directive')) {
        category = 'regulatory';
      } else if (tags.includes('clinical') || title.includes('clinical') || title.includes('trial')) {
        category = 'clinical';
      } else if (tags.includes('research') || title.includes('research') || title.includes('study')) {
        category = 'research';
      } else if (tags.includes('reimbursement') || title.includes('reimbursement') || title.includes('payment')) {
        category = 'reimbursement';
      } else if (tags.includes('technology') || tags.includes('digital') || title.includes('technology') || title.includes('digital') || title.includes('software')) {
        category = 'technology';
      }
      return category;
    };

    // Helper function to check if document matches agent
    const matchesAgent = (doc: unknown, agentName: string): boolean => {
      const category = getDocumentCategory(doc);
      const agentMapping: Record<string, string[]> = {
        'fda-regulatory': ['regulatory'],
        'clinical-trial': ['clinical', 'research'],
        'medical-writer': ['clinical', 'research', 'regulatory'],
        'reimbursement': ['reimbursement'],
        'ema-regulatory': ['regulatory']
      };

      // eslint-disable-next-line security/detect-object-injection
      const agentCategories = agentMapping[agentName] || [];
      return agentCategories.includes(category) || doc.is_public;
    };

    // Filter documents based on parameters
    let filteredDocuments = documents;

    if (categoryFilter) {
      filteredDocuments = documents.filter(doc => getDocumentCategory(doc) === categoryFilter);
    }

    if (agentFilter) {
      filteredDocuments = documents.filter(doc => matchesAgent(doc, agentFilter));
    }

    // Process all documents for global stats (when no filters applied)
    if (!categoryFilter && !agentFilter) {
      documents.forEach(doc => {
        const docDate = new Date(doc.created_at);
        const docChunks = chunks.filter(chunk => chunk.source_id === doc.id);

        // Time-based counting
        if (docDate >= today) todayUploads++;
        if (docDate >= last24h) last24hUploads++;
        if (docDate >= last7d) last7dUploads++;

        totalSize += doc.file_size;

        const category = getDocumentCategory(doc);

        if (category in ragCategories) {
          ragCategories[category as keyof typeof ragCategories].documents++;
          ragCategories[category as keyof typeof ragCategories].chunks += docChunks.length;
          ragCategories[category as keyof typeof ragCategories].size += doc.file_size;
        }

        // Agent statistics (in RAG system, all documents are tenant-scoped)
        // Count documents for all agents
        Object.keys(agentStats).forEach(agent => {
          if (agent in agentStats) {
            agentStats[agent as keyof typeof agentStats].documents++;
            agentStats[agent as keyof typeof agentStats].chunks += docChunks.length;
            agentStats[agent as keyof typeof agentStats].domains.add(doc.domain);
          }
        });
      });
    } else {
      // Process filtered documents
      filteredDocuments.forEach(doc => {
        const docDate = new Date(doc.created_at);
        const docChunks = chunks.filter(chunk => chunk.source_id === doc.id);

        // Time-based counting
        if (docDate >= today) todayUploads++;
        if (docDate >= last24h) last24hUploads++;
        if (docDate >= last7d) last7dUploads++;

        totalSize += doc.file_size;

        const category = getDocumentCategory(doc);

        if (categoryFilter) {
          // Only show stats for the filtered category
          if (category === categoryFilter && category in ragCategories) {
            ragCategories[category as keyof typeof ragCategories].documents++;
            ragCategories[category as keyof typeof ragCategories].chunks += docChunks.length;
            ragCategories[category as keyof typeof ragCategories].size += doc.file_size;
          }
        } else {
          // Show all categories for agent filter
          if (category in ragCategories) {
            ragCategories[category as keyof typeof ragCategories].documents++;
            ragCategories[category as keyof typeof ragCategories].chunks += docChunks.length;
            ragCategories[category as keyof typeof ragCategories].size += doc.file_size;
          }
        }

        if (agentFilter) {
          // Only show stats for the filtered agent
          const agentNameMap: Record<string, string> = {
            'fda-regulatory': 'FDA Regulatory Navigator',
            'clinical-trial': 'Clinical Trial Architect',
            'medical-writer': 'Medical Writer Pro',
            'reimbursement': 'Reimbursement Strategist',
            'ema-regulatory': 'EMA/EU Regulatory Specialist'
          };
          // eslint-disable-next-line security/detect-object-injection
          const agentName = agentNameMap[agentFilter];
          if (agentName && matchesAgent(doc, agentFilter) && agentName in agentStats) {
            agentStats[agentName as keyof typeof agentStats].documents++;
            agentStats[agentName as keyof typeof agentStats].chunks += docChunks.length;
            agentStats[agentName as keyof typeof agentStats].domains.add(doc.domain);
          }
        } else {
          // Show all agents (RAG system: all documents available to all agents within tenant)
          Object.keys(agentStats).forEach(agent => {
            if (agent in agentStats) {
              agentStats[agent as keyof typeof agentStats].documents++;
              agentStats[agent as keyof typeof agentStats].chunks += docChunks.length;
              agentStats[agent as keyof typeof agentStats].domains.add(doc.domain);
            }
          });
        }
      });
    }

    // Calculate average chunk quality
    if (chunks.length > 0) {
      avgChunkQuality = chunks.reduce((sum, chunk) => sum + (chunk.quality_score || 0), 0) / chunks.length;
    }

    // Convert Sets to arrays for agent domains
    Object.keys(agentStats).forEach(agent => {
      // eslint-disable-next-line security/detect-object-injection
      (agentStats as unknown)[agent].domains = Array.from((agentStats as unknown)[agent].domains);
    });

    // Content statistics (use filtered documents when applicable)
    const statsDocuments = (categoryFilter || agentFilter) ? filteredDocuments : documents;
    const statsChunks = (categoryFilter || agentFilter) ?
      chunks.filter(chunk => statsDocuments.some(doc => doc.id === chunk.source_id)) :
      chunks;

    const contentStats = {
      totalDocuments: statsDocuments.length,
      totalChunks: statsChunks.length,
      totalSize: totalSize,
      avgDocumentSize: statsDocuments.length > 0 ? totalSize / statsDocuments.length : 0,
      avgChunksPerDocument: statsDocuments.length > 0 ? statsChunks.length / statsDocuments.length : 0,
      avgChunkQuality: avgChunkQuality,
      domains: [...new Set(statsDocuments.map(doc => doc.domain))],
      categories: [...new Set(statsDocuments.map(doc => getDocumentCategory(doc)))],
      filteredBy: {
        category: categoryFilter,
        agent: agentFilter
      }
    };

    // Time series data for the last 30 days
    const timeSeriesData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const uploadsOnDate = documents.filter(doc => {
        const docDate = new Date(doc.created_at).toISOString().split('T')[0];
        return docDate === dateStr;
      }).length;

      const chunksOnDate = documents
        .filter(doc => {
          const docDate = new Date(doc.created_at).toISOString().split('T')[0];
          return docDate === dateStr;
        })
        .reduce((sum, doc) => {
          return sum + chunks.filter(chunk => chunk.source_id === doc.id).length;
        }, 0);

      timeSeriesData.push({
        date: dateStr,
        uploads: uploadsOnDate,
        chunks: chunksOnDate,
        day: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' })
      });
    }

    // Recent activity
    const recentActivity = {
      todayUploads,
      last24hUploads,
      last7dUploads,
      timeSeriesData,
      recentDocuments: statsDocuments.slice(0, 5).map(doc => ({
        id: doc.id,
        name: doc.name,
        title: doc.title || doc.name,
        size: doc.file_size,
        chunks: chunks.filter(chunk => chunk.source_id === doc.id).length,
        uploadedAt: doc.created_at,
        category: getDocumentCategory(doc),
        domain: doc.domain,
        status: doc.processing_status || 'processed'
      }))
    };

    // Add filtered documents for table view
    const filteredDocumentsList = statsDocuments.map(doc => ({
      id: doc.id,
      name: doc.name,
      title: doc.title || doc.name,
      description: doc.description,
      size: doc.file_size,
      chunks: chunks.filter(chunk => chunk.source_id === doc.id).length,
      uploadedAt: doc.created_at,
      category: getDocumentCategory(doc),
      domain: doc.domain,
      status: doc.processing_status || 'processed',
      tags: doc.tags || [],
      file_type: doc.mime_type,
      url: doc.file_path,
      is_public: false // RAG system uses tenant-based access, not is_public
    }));

    const analytics = {
      success: true,
      ragCategories,
      agentStats,
      contentStats,
      recentActivity,
      documents: filteredDocumentsList,
      generatedAt: new Date().toISOString()
    };
    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Knowledge analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to generate knowledge analytics' },
      { status: 500 }
    );
  }
}