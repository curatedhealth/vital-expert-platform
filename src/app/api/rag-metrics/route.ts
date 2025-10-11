import { NextRequest, NextResponse } from 'next/server';
import { register, Gauge, Counter, Histogram } from 'prom-client';

// RAG-specific metrics
const ragRegister = new register();

// RAG Query Performance Metrics
export const ragQueryDuration = new Histogram({
  name: 'rag_query_duration_seconds',
  help: 'Duration of RAG queries in seconds',
  labelNames: ['query_type', 'strategy', 'success'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [ragRegister]
});

export const ragQueryThroughput = new Gauge({
  name: 'rag_query_throughput_queries_per_second',
  help: 'RAG query throughput in queries per second',
  labelNames: ['query_type', 'strategy'],
  registers: [ragRegister]
});

export const ragQueryLatency = new Histogram({
  name: 'rag_query_latency_seconds',
  help: 'RAG query latency in seconds',
  labelNames: ['query_type', 'strategy', 'success'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
  registers: [ragRegister]
});

// RAG Retrieval Metrics
export const ragRetrievalAccuracy = new Gauge({
  name: 'rag_retrieval_accuracy',
  help: 'RAG retrieval accuracy (0-1)',
  labelNames: ['retrieval_strategy', 'document_type'],
  registers: [ragRegister]
});

export const ragRetrievalPrecision = new Gauge({
  name: 'rag_retrieval_precision',
  help: 'RAG retrieval precision (0-1)',
  labelNames: ['retrieval_strategy', 'document_type'],
  registers: [ragRegister]
});

export const ragRetrievalRecall = new Gauge({
  name: 'rag_retrieval_recall',
  help: 'RAG retrieval recall (0-1)',
  labelNames: ['retrieval_strategy', 'document_type'],
  registers: [ragRegister]
});

export const ragRetrievalF1Score = new Gauge({
  name: 'rag_retrieval_f1_score',
  help: 'RAG retrieval F1 score (0-1)',
  labelNames: ['retrieval_strategy', 'document_type'],
  registers: [ragRegister]
});

// RAG Vector Search Metrics
export const ragVectorSearchTime = new Histogram({
  name: 'rag_vector_search_duration_seconds',
  help: 'Duration of vector search in seconds',
  labelNames: ['search_type', 'index_type', 'success'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
  registers: [ragRegister]
});

export const ragVectorSearchResults = new Counter({
  name: 'rag_vector_search_results_total',
  help: 'Total number of vector search results',
  labelNames: ['search_type', 'index_type', 'result_count_range'],
  registers: [ragRegister]
});

export const ragVectorSimilarityScore = new Gauge({
  name: 'rag_vector_similarity_score',
  help: 'RAG vector similarity score (0-1)',
  labelNames: ['search_type', 'document_type'],
  registers: [ragRegister]
});

// RAG Cache Metrics
export const ragCacheHitRate = new Gauge({
  name: 'rag_cache_hit_rate',
  help: 'RAG cache hit rate (0-1)',
  labelNames: ['cache_type', 'query_type'],
  registers: [ragRegister]
});

export const ragCacheSize = new Gauge({
  name: 'rag_cache_size_bytes',
  help: 'RAG cache size in bytes',
  labelNames: ['cache_type'],
  registers: [ragRegister]
});

export const ragCacheEvictions = new Counter({
  name: 'rag_cache_evictions_total',
  help: 'Total number of RAG cache evictions',
  labelNames: ['cache_type', 'eviction_reason'],
  registers: [ragRegister]
});

// RAG Document Processing Metrics
export const ragDocumentProcessingTime = new Histogram({
  name: 'rag_document_processing_duration_seconds',
  help: 'Duration of document processing in seconds',
  labelNames: ['document_type', 'processing_stage', 'success'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [ragRegister]
});

export const ragDocumentChunkingTime = new Histogram({
  name: 'rag_document_chunking_duration_seconds',
  help: 'Duration of document chunking in seconds',
  labelNames: ['document_type', 'chunking_strategy', 'success'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
  registers: [ragRegister]
});

export const ragDocumentEmbeddingTime = new Histogram({
  name: 'rag_document_embedding_duration_seconds',
  help: 'Duration of document embedding in seconds',
  labelNames: ['document_type', 'embedding_model', 'success'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [ragRegister]
});

// RAG Knowledge Base Metrics
export const ragKnowledgeBaseSize = new Gauge({
  name: 'rag_knowledge_base_size_documents',
  help: 'RAG knowledge base size in documents',
  labelNames: ['knowledge_base_type', 'document_type'],
  registers: [ragRegister]
});

export const ragKnowledgeBaseCoverage = new Gauge({
  name: 'rag_knowledge_base_coverage',
  help: 'RAG knowledge base coverage (0-1)',
  labelNames: ['knowledge_base_type', 'domain'],
  registers: [ragRegister]
});

export const ragKnowledgeBaseFreshness = new Gauge({
  name: 'rag_knowledge_base_freshness_days',
  help: 'RAG knowledge base freshness in days',
  labelNames: ['knowledge_base_type', 'document_type'],
  registers: [ragRegister]
});

// RAG Quality Metrics
export const ragResponseQuality = new Gauge({
  name: 'rag_response_quality_score',
  help: 'RAG response quality score (0-1)',
  labelNames: ['quality_dimension', 'query_type'],
  registers: [ragRegister]
});

export const ragRelevanceScore = new Gauge({
  name: 'rag_relevance_score',
  help: 'RAG relevance score (0-1)',
  labelNames: ['query_type', 'document_type'],
  registers: [ragRegister]
});

export const ragCoherenceScore = new Gauge({
  name: 'rag_coherence_score',
  help: 'RAG coherence score (0-1)',
  labelNames: ['query_type', 'response_length'],
  registers: [ragRegister]
});

// RAG A/B Testing Metrics
export const ragABTestResults = new Counter({
  name: 'rag_ab_test_results_total',
  help: 'Total number of RAG A/B test results',
  labelNames: ['test_name', 'variant', 'metric_type', 'outcome'],
  registers: [ragRegister]
});

export const ragABTestConversionRate = new Gauge({
  name: 'rag_ab_test_conversion_rate',
  help: 'RAG A/B test conversion rate (0-1)',
  labelNames: ['test_name', 'variant'],
  registers: [ragRegister]
});

export const ragABTestStatisticalSignificance = new Gauge({
  name: 'rag_ab_test_statistical_significance',
  help: 'RAG A/B test statistical significance (0-1)',
  labelNames: ['test_name', 'metric_type'],
  registers: [ragRegister]
});

// RAG Cost Metrics
export const ragCostPerQuery = new Gauge({
  name: 'rag_cost_per_query_usd',
  help: 'RAG cost per query in USD',
  labelNames: ['query_type', 'strategy', 'model'],
  registers: [ragRegister]
});

export const ragTokenUsage = new Counter({
  name: 'rag_token_usage_total',
  help: 'Total RAG token usage',
  labelNames: ['token_type', 'model', 'operation'],
  registers: [ragRegister]
});

export const ragEmbeddingCost = new Counter({
  name: 'rag_embedding_cost_total_usd',
  help: 'Total RAG embedding cost in USD',
  labelNames: ['embedding_model', 'document_type'],
  registers: [ragRegister]
});

// RAG Error Metrics
export const ragErrorRate = new Gauge({
  name: 'rag_error_rate',
  help: 'RAG error rate (0-1)',
  labelNames: ['error_type', 'query_type'],
  registers: [ragRegister]
});

export const ragTimeoutRate = new Gauge({
  name: 'rag_timeout_rate',
  help: 'RAG timeout rate (0-1)',
  labelNames: ['query_type', 'strategy'],
  registers: [ragRegister]
});

export const ragFailureRate = new Gauge({
  name: 'rag_failure_rate',
  help: 'RAG failure rate (0-1)',
  labelNames: ['failure_type', 'component'],
  registers: [ragRegister]
});

// RAG Security Metrics
export const ragSecurityViolations = new Counter({
  name: 'rag_security_violations_total',
  help: 'Total number of RAG security violations',
  labelNames: ['violation_type', 'severity', 'query_type'],
  registers: [ragRegister]
});

export const ragDataLeakageEvents = new Counter({
  name: 'rag_data_leakage_events_total',
  help: 'Total number of RAG data leakage events',
  labelNames: ['leakage_type', 'severity', 'data_classification'],
  registers: [ragRegister]
});

export const ragAccessControlViolations = new Counter({
  name: 'rag_access_control_violations_total',
  help: 'Total number of RAG access control violations',
  labelNames: ['violation_type', 'user_role', 'resource_type'],
  registers: [ragRegister]
});

// RAG Compliance Metrics
export const ragComplianceScore = new Gauge({
  name: 'rag_compliance_score',
  help: 'RAG compliance score (0-1)',
  labelNames: ['compliance_standard', 'domain'],
  registers: [ragRegister]
});

export const ragAuditEvents = new Counter({
  name: 'rag_audit_events_total',
  help: 'Total number of RAG audit events',
  labelNames: ['audit_type', 'compliance_status', 'domain'],
  registers: [ragRegister]
});

export const ragDataRetentionCompliance = new Gauge({
  name: 'rag_data_retention_compliance_rate',
  help: 'RAG data retention compliance rate (0-1)',
  labelNames: ['data_type', 'retention_policy'],
  registers: [ragRegister]
});

export async function GET(request: NextRequest) {
  try {
    const metrics = await ragRegister.metrics();
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': ragRegister.contentType,
      },
    });
  } catch (error) {
    console.error('Error generating RAG metrics:', error);
    return new NextResponse('Error generating RAG metrics', { status: 500 });
  }
}
