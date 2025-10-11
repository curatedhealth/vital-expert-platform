/**
 * RAG Connector for Expert Tools
 * Connects the knowledge_base tool to the existing VITAL RAG system
 */

import { OpenAIEmbeddings } from '@langchain/openai';

import ragService from '@/shared/services/rag/rag-service';

// Map tool categories to RAG domains
const CATEGORY_TO_DOMAIN_MAP: Record<string, string> = {
  'clinical': 'clinical_research',
  'regulatory': 'regulatory_compliance',
  'commercial': 'commercial_strategy',
  'manufacturing': 'methodology_frameworks',
  'safety': 'medical_affairs',
  'general': 'digital_health'
};

export interface KnowledgeBaseSearchResult {
  query: string;
  domain?: string;
  count: number;
  results: Array<{
    content: string;
    source: string;
    similarity: string;
    domain: string;
    section?: string;
    medical_context?: any;
    regulatory_context?: any;
  }>;
  duration_ms: number;
  timestamp: string;
}

/**
 * Search the existing VITAL RAG knowledge base
 */
export async function searchKnowledgeBase(
  query: string,
  category?: string,
  topK: number = 3
): Promise<KnowledgeBaseSearchResult> {
  const startTime = Date.now();

  try {
    // Map category to domain
    const domain = category ? CATEGORY_TO_DOMAIN_MAP[category] : undefined;

    // Generate embedding for query using OpenAI
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    const queryEmbedding = await embeddings.embedQuery(query);

    // Search knowledge base using existing RAG service
    const results = await ragService.searchKnowledge(query, queryEmbedding, {
      threshold: 0.7,
      limit: topK,
      domain,
      include_metadata: true
    });

    const duration = Date.now() - startTime;

    if (results.length === 0) {
      return {
        query,
        domain,
        count: 0,
        results: [],
        duration_ms: duration,
        timestamp: new Date().toISOString()
      };
    }

    return {
      query,
      domain,
      count: results.length,
      results: results.map((doc: any) => ({
        content: doc.content?.substring(0, 500) || 'No content',
        source: doc.source_name || 'Unknown source',
        similarity: (doc.similarity * 100).toFixed(1) + '%',
        domain: doc.domain,
        section: doc.section_title,
        medical_context: doc.medical_context,
        regulatory_context: doc.regulatory_context
      })),
      duration_ms: duration,
      timestamp: new Date().toISOString()
    };

  } catch (error: any) {
    console.error('Knowledge base search error:', error);
    throw new Error(`Knowledge base search failed: ${error.message}`);
  }
}
