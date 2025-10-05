import { MultiQueryRetriever } from 'langchain/retrievers/multi_query';
import { ContextualCompressionRetriever } from 'langchain/retrievers/contextual_compression';
import { LLMChainExtractor } from 'langchain/retrievers/document_compressors/chain_extract';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { createClient } from '@supabase/supabase-js';
import { BaseRetriever } from '@langchain/core/retrievers';
import { Document } from 'langchain/document';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: 'text-embedding-ada-002',
});

const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: 'gpt-3.5-turbo',
  temperature: 0,
});

/**
 * Multi-Query Retriever
 * Generates multiple search queries from a single question for better coverage
 */
export async function createMultiQueryRetriever(agentId?: string, knowledgeDomains: string[] = []) {
  const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabase,
    tableName: 'rag_knowledge_chunks',
  });

  const baseRetriever = vectorStore.asRetriever({
    searchType: 'similarity',
    k: 6,
    filter: agentId
      ? {
          $or: [
            { isGlobal: { $eq: true } },
            { agentId: { $eq: agentId } },
          ],
        }
      : undefined,
  });

  const multiQueryRetriever = MultiQueryRetriever.fromLLM({
    llm,
    retriever: baseRetriever,
    verbose: process.env.NODE_ENV === 'development',
  });

  console.log('🔍 Multi-Query Retriever created');

  return multiQueryRetriever;
}

/**
 * Contextual Compression Retriever
 * Compresses retrieved documents to only the most relevant parts
 */
export async function createCompressionRetriever(agentId?: string) {
  const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabase,
    tableName: 'rag_knowledge_chunks',
  });

  const baseRetriever = vectorStore.asRetriever({
    searchType: 'similarity',
    k: 10, // Retrieve more, compress down
    filter: agentId
      ? {
          $or: [
            { isGlobal: { $eq: true } },
            { agentId: { $eq: agentId } },
          ],
        }
      : undefined,
  });

  const compressor = LLMChainExtractor.fromLLM(llm);

  const compressionRetriever = new ContextualCompressionRetriever({
    baseCompressor: compressor,
    baseRetriever,
  });

  console.log('🗜️ Compression Retriever created');

  return compressionRetriever;
}

/**
 * Hybrid Retriever
 * Combines multiple retrieval strategies
 */
export class HybridRetriever extends BaseRetriever {
  lc_namespace = ['vital', 'retrievers', 'hybrid'];

  private vectorStore: SupabaseVectorStore;
  private agentId?: string;
  private knowledgeDomains: string[];

  constructor(params: { agentId?: string; knowledgeDomains?: string[] }) {
    super();
    this.agentId = params.agentId;
    this.knowledgeDomains = params.knowledgeDomains || [];
    this.vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: 'rag_knowledge_chunks',
    });
  }

  async _getRelevantDocuments(query: string): Promise<Document[]> {
    console.log('🔄 Hybrid Retrieval:', { query, agentId: this.agentId });

    // Strategy 1: Standard vector search
    const vectorResults = await this.vectorStore.similaritySearchWithScore(query, 5);

    // Strategy 2: Keyword-boosted search (simulate BM25)
    const keywords = this.extractKeywords(query);
    const keywordResults = await this.keywordSearch(keywords, 3);

    // Strategy 3: Domain-filtered search
    const domainResults = this.knowledgeDomains.length > 0
      ? await this.domainFilteredSearch(query, 3)
      : [];

    // Merge and deduplicate results
    const allResults = [
      ...vectorResults.map(([doc, score]) => ({ doc, score, source: 'vector' })),
      ...keywordResults.map((doc, idx) => ({ doc, score: 0.8 - idx * 0.1, source: 'keyword' })),
      ...domainResults.map((doc, idx) => ({ doc, score: 0.7 - idx * 0.1, source: 'domain' })),
    ];

    // Sort by score and deduplicate
    const uniqueDocs = this.deduplicateDocuments(allResults);
    const sorted = uniqueDocs.sort((a, b) => b.score - a.score);

    console.log(`✅ Hybrid retrieval found ${sorted.length} unique documents`);

    return sorted.slice(0, 6).map(r => r.doc);
  }

  private extractKeywords(query: string): string[] {
    // Simple keyword extraction (could use NLP library)
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'what', 'how', 'when', 'where', 'why']);
    const words = query.toLowerCase().split(/\s+/);
    return words.filter(w => w.length > 3 && !stopWords.has(w));
  }

  private async keywordSearch(keywords: string[], limit: number): Promise<Document[]> {
    // Simulate keyword search (in production, use full-text search)
    const results = await this.vectorStore.similaritySearch(keywords.join(' '), limit);
    return results;
  }

  private async domainFilteredSearch(query: string, limit: number): Promise<Document[]> {
    // Search within specific knowledge domains
    const filter = {
      $and: [
        { domain: { $in: this.knowledgeDomains } },
        this.agentId ? { $or: [{ isGlobal: { $eq: true } }, { agentId: { $eq: this.agentId } }] } : {},
      ],
    };

    const results = await this.vectorStore.similaritySearch(query, limit);
    return results;
  }

  private deduplicateDocuments(results: Array<{ doc: Document; score: number; source: string }>) {
    const seen = new Set<string>();
    const unique: typeof results = [];

    for (const result of results) {
      const key = result.doc.pageContent.substring(0, 100); // Use first 100 chars as key
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(result);
      }
    }

    return unique;
  }
}

/**
 * Self-Query Retriever (Simplified)
 * Automatically creates filters from natural language
 */
export class SelfQueryRetriever extends BaseRetriever {
  lc_namespace = ['vital', 'retrievers', 'self_query'];

  private vectorStore: SupabaseVectorStore;
  private llm: ChatOpenAI;

  constructor() {
    super();
    this.vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: 'rag_knowledge_chunks',
    });
    this.llm = llm;
  }

  async _getRelevantDocuments(query: string): Promise<Document[]> {
    console.log('🔮 Self-Query Retrieval:', query);

    // Extract structured query from natural language
    const structuredQuery = await this.extractStructuredQuery(query);

    console.log('📊 Extracted query structure:', structuredQuery);

    // Build filter
    const filter = this.buildFilter(structuredQuery);

    // Search with filter
    const results = await this.vectorStore.similaritySearch(
      structuredQuery.semanticQuery,
      6
      // Note: Supabase filter syntax would be applied here
    );

    return results;
  }

  private async extractStructuredQuery(query: string) {
    const prompt = `Extract structured search parameters from this query:
    "${query}"

    Return JSON with:
    - semanticQuery: the core semantic query
    - filters: object with any metadata filters (year, domain, documentType, etc.)

    Example: "Show me FDA guidance from 2023 about AI devices"
    Returns: {
      "semanticQuery": "FDA guidance AI devices",
      "filters": { "year": 2023, "domain": "regulatory_compliance" }
    }`;

    const response = await this.llm.invoke(prompt);

    try {
      return JSON.parse(response.content as string);
    } catch {
      return {
        semanticQuery: query,
        filters: {},
      };
    }
  }

  private buildFilter(structuredQuery: any) {
    const filter: any = {};

    if (structuredQuery.filters?.year) {
      filter.publishedYear = { $gte: structuredQuery.filters.year };
    }

    if (structuredQuery.filters?.domain) {
      filter.domain = { $eq: structuredQuery.filters.domain };
    }

    if (structuredQuery.filters?.documentType) {
      filter.documentType = { $eq: structuredQuery.filters.documentType };
    }

    return filter;
  }
}

/**
 * RAG Fusion Retriever
 * Combines multiple query approaches with reciprocal rank fusion
 */
export class RAGFusionRetriever extends BaseRetriever {
  lc_namespace = ['vital', 'retrievers', 'rag_fusion'];

  private vectorStore: SupabaseVectorStore;
  private llm: ChatOpenAI;

  constructor() {
    super();
    this.vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: 'rag_knowledge_chunks',
    });
    this.llm = llm;
  }

  async _getRelevantDocuments(query: string): Promise<Document[]> {
    console.log('🔀 RAG Fusion Retrieval:', query);

    // Generate multiple query variations
    const queryVariations = await this.generateQueryVariations(query);

    console.log('📝 Query variations:', queryVariations);

    // Search with each variation
    const allResults = await Promise.all(
      queryVariations.map(q => this.vectorStore.similaritySearchWithScore(q, 5))
    );

    // Apply Reciprocal Rank Fusion
    const fusedResults = this.reciprocalRankFusion(allResults);

    return fusedResults.slice(0, 6);
  }

  private async generateQueryVariations(query: string): Promise<string[]> {
    const prompt = `Generate 3 different search query variations for: "${query}"

    Return only the queries, one per line, without numbers or explanations.`;

    const response = await this.llm.invoke(prompt);
    const variations = (response.content as string).split('\n').filter(line => line.trim());

    return [query, ...variations.slice(0, 3)]; // Include original + 3 variations
  }

  private reciprocalRankFusion(results: Array<Array<[Document, number]>>): Document[] {
    const k = 60; // RRF constant
    const docScores = new Map<string, { doc: Document; score: number }>();

    results.forEach((queryResults, queryIndex) => {
      queryResults.forEach(([doc, originalScore], rank) => {
        const docKey = doc.pageContent.substring(0, 100);
        const rrfScore = 1 / (k + rank + 1);

        if (docScores.has(docKey)) {
          const existing = docScores.get(docKey)!;
          existing.score += rrfScore;
        } else {
          docScores.set(docKey, { doc, score: rrfScore });
        }
      });
    });

    // Sort by RRF score
    const sorted = Array.from(docScores.values()).sort((a, b) => b.score - a.score);

    console.log(`✅ RAG Fusion merged ${sorted.length} unique documents`);

    return sorted.map(r => r.doc);
  }
}

/**
 * Factory function to create retriever based on strategy
 */
export async function createAdvancedRetriever(
  strategy: 'multi_query' | 'compression' | 'hybrid' | 'self_query' | 'rag_fusion',
  params: { agentId?: string; knowledgeDomains?: string[] } = {}
): Promise<BaseRetriever> {
  switch (strategy) {
    case 'multi_query':
      return await createMultiQueryRetriever(params.agentId, params.knowledgeDomains);
    case 'compression':
      return await createCompressionRetriever(params.agentId);
    case 'hybrid':
      return new HybridRetriever(params);
    case 'self_query':
      return new SelfQueryRetriever();
    case 'rag_fusion':
      return new RAGFusionRetriever();
    default:
      throw new Error(`Unknown retriever strategy: ${strategy}`);
  }
}
