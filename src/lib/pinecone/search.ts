import { vitalIndex, getNamespace, SYSTEM_NAMESPACE, VectorMetadata, SearchFilters } from './client';
import { generateEmbedding } from './embeddings';
import { extractRelevantSnippet } from './text-splitter';
import { Citation } from '@/types';

interface SearchResult {
  text: string;
  score: number;
  metadata: VectorMetadata;
  citation: Citation;
}

interface SearchOptions {
  topK?: number;
  includeSystemDocs?: boolean;
  minScore?: number;
  filters?: SearchFilters;
  includeMetadata?: boolean;
}

interface SemanticSearchResult {
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
  query: string;
}

/**
 * Perform semantic search across organization and system documents
 */
export async function semanticSearch(
  query: string,
  organizationId: string,
  options: SearchOptions = {}
): Promise<SemanticSearchResult> {
  const startTime = Date.now();

  const {
    topK = 10,
    includeSystemDocs = true,
    minScore = 0.7,
    filters = {},
    includeMetadata = true,
  } = options;

  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    const searchPromises: Promise<any>[] = [];

    // Search in organization namespace
    const orgNamespace = getNamespace(organizationId);
    const orgSearchPromise = vitalIndex.namespace(orgNamespace).query({
      vector: queryEmbedding,
      topK: Math.ceil(topK * 0.7), // 70% from organization docs
      includeMetadata: includeMetadata,
      filter: buildPineconeFilter(filters),
    });
    searchPromises.push(orgSearchPromise);

    // Search in system namespace if requested
    if (includeSystemDocs) {
      const systemSearchPromise = vitalIndex.namespace(SYSTEM_NAMESPACE).query({
        vector: queryEmbedding,
        topK: Math.floor(topK * 0.3), // 30% from system docs
        includeMetadata: includeMetadata,
        filter: buildPineconeFilter(filters),
      });
      searchPromises.push(systemSearchPromise);
    }

    // Execute searches in parallel
    const searchResults = await Promise.all(searchPromises);
    const [orgResults, systemResults] = searchResults;

    // Combine and sort results
    const allMatches = [
      ...(orgResults.matches || []),
      ...(systemResults?.matches || []),
    ];

    // Filter by minimum score and sort by relevance
    const filteredMatches = allMatches
      .filter(match => match.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    // Format results with citations
    const results: SearchResult[] = filteredMatches.map(match => {
      const metadata = match.metadata as VectorMetadata;

      const citation: Citation = {
        id: match.id,
        source: metadata.source,
        title: metadata.title,
        url: metadata.url,
        pageNumber: metadata.pageNumber,
        section: metadata.section,
        quote: extractRelevantSnippet(metadata.text, query, 200),
        confidenceScore: match.score,
      };

      return {
        text: metadata.text,
        score: match.score,
        metadata,
        citation,
      };
    });

    const searchTime = Date.now() - startTime;

    return {
      results,
      totalResults: results.length,
      searchTime,
      query,
    };

  } catch (error) {
    console.error('Semantic search error:', error);
    throw new Error('Failed to perform semantic search');
  }
}

/**
 * Search for similar documents based on document content
 */
export async function findSimilarDocuments(
  documentId: string,
  organizationId: string,
  topK: number = 5
): Promise<SearchResult[]> {
  try {
    // Get the document content from Supabase to create a query
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();
    const { data: document } = await supabase
      .from('documents')
      .select('content, name')
      .eq('id', documentId)
      .eq('organization_id', organizationId)
      .single();

    if (!document) {
      throw new Error('Document not found');
    }

    // Use a portion of the document content as the search query
    const searchQuery = document.content.substring(0, 500);

    const searchResult = await semanticSearch(searchQuery, organizationId, {
      topK: topK + 1, // +1 to account for the document itself
      includeSystemDocs: true,
      minScore: 0.6,
    });

    // Filter out the original document
    return searchResult.results.filter(result =>
      result.metadata.title !== document.name
    ).slice(0, topK);

  } catch (error) {
    console.error('Error finding similar documents:', error);
    throw error;
  }
}

/**
 * Search within a specific project's documents
 */
export async function searchProjectDocuments(
  query: string,
  projectId: string,
  organizationId: string,
  topK: number = 10
): Promise<SearchResult[]> {
  const searchResult = await semanticSearch(query, organizationId, {
    topK,
    includeSystemDocs: false,
    filters: {
      projectId,
    },
  });

  return searchResult.results;
}

/**
 * Search by document type (regulatory, clinical, market, internal)
 */
export async function searchByDocumentType(
  query: string,
  documentTypes: string[],
  organizationId: string,
  topK: number = 10
): Promise<SearchResult[]> {
  const searchResult = await semanticSearch(query, organizationId, {
    topK,
    includeSystemDocs: true,
    filters: {
      documentType: documentTypes,
    },
  });

  return searchResult.results;
}

/**
 * Search regulatory documents only
 */
export async function searchRegulatoryDocuments(
  query: string,
  organizationId: string,
  regulatoryBodies?: string[],
  topK: number = 10
): Promise<SearchResult[]> {
  const searchResult = await semanticSearch(query, organizationId, {
    topK,
    includeSystemDocs: true,
    filters: {
      documentType: ['regulatory'],
      regulatoryBody: regulatoryBodies,
    },
  });

  return searchResult.results;
}

/**
 * Hybrid search combining semantic and keyword search
 */
export async function hybridSearch(
  query: string,
  keywords: string[],
  organizationId: string,
  topK: number = 10
): Promise<SearchResult[]> {
  // Perform semantic search
  const semanticResults = await semanticSearch(query, organizationId, {
    topK: Math.ceil(topK * 0.7),
  });

  // Boost results that contain keywords
  const boostedResults = semanticResults.results.map(result => {
    let boost = 1.0;
    const textLower = result.text.toLowerCase();

    for (const keyword of keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        boost += 0.1; // 10% boost per keyword match
      }
    }

    return {
      ...result,
      score: result.score * boost,
    };
  });

  // Re-sort by boosted scores
  boostedResults.sort((a, b) => b.score - a.score);

  return boostedResults.slice(0, topK);
}

/**
 * Get document statistics for an organization
 */
export async function getDocumentStats(organizationId: string): Promise<{
  totalDocuments: number;
  documentsByType: Record<string, number>;
  totalVectors: number;
}> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();
    const { data: documents } = await supabase
      .from('documents')
      .select('type, vector_ids')
      .eq('organization_id', organizationId);

    if (!documents) {
      return { totalDocuments: 0, documentsByType: {}, totalVectors: 0 };
    }

    const documentsByType: Record<string, number> = {};
    let totalVectors = 0;

    for (const doc of documents) {
      documentsByType[doc.type] = (documentsByType[doc.type] || 0) + 1;
      totalVectors += doc.vector_ids?.length || 0;
    }

    return {
      totalDocuments: documents.length,
      documentsByType,
      totalVectors,
    };

  } catch (error) {
    console.error('Error getting document stats:', error);
    return { totalDocuments: 0, documentsByType: {}, totalVectors: 0 };
  }
}

/**
 * Build Pinecone filter from search filters
 */
function buildPineconeFilter(filters: SearchFilters): Record<string, any> {
  const pineconeFilter: Record<string, any> = {};

  if (filters.organizationId) {
    pineconeFilter.organizationId = filters.organizationId;
  }

  if (filters.projectId) {
    pineconeFilter.projectId = filters.projectId;
  }

  if (filters.documentType && filters.documentType.length > 0) {
    pineconeFilter.documentType = { $in: filters.documentType };
  }

  if (filters.regulatoryBody && filters.regulatoryBody.length > 0) {
    pineconeFilter.regulatoryBody = { $in: filters.regulatoryBody };
  }

  if (filters.publicationDate) {
    const dateFilter: Record<string, any> = {};

    if (filters.publicationDate.start) {
      dateFilter.$gte = filters.publicationDate.start;
    }

    if (filters.publicationDate.end) {
      dateFilter.$lte = filters.publicationDate.end;
    }

    if (Object.keys(dateFilter).length > 0) {
      pineconeFilter.publicationDate = dateFilter;
    }
  }

  return pineconeFilter;
}