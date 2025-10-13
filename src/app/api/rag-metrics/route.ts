import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get current timestamp
    const now = new Date();
    
    // Mock RAG metrics data
    const metrics = {
      timestamp: now.toISOString(),
      rag_performance: {
        total_queries: 8750,
        successful_queries: 8620,
        failed_queries: 130,
        success_rate_percentage: 98.5,
        average_query_duration_ms: 450,
        p95_query_duration_ms: 1200,
        p99_query_duration_ms: 2500
      },
      retrieval_metrics: {
        total_retrievals: 8620,
        average_retrieval_time_ms: 180,
        cache_hit_rate_percentage: 78.5,
        vector_search_duration_ms: 120,
        document_ranking_time_ms: 60,
        retrieval_accuracy_score: 0.92,
        relevance_score: 0.89
      },
      embedding_metrics: {
        total_embeddings_generated: 15420,
        embedding_generation_time_ms: 85,
        embedding_model: 'text-embedding-3-large',
        embedding_dimensions: 3072,
        embedding_quality_score: 0.94,
        embedding_cache_hit_rate: 82.3
      },
      knowledge_base: {
        total_documents: 1250,
        total_chunks: 45680,
        average_chunks_per_document: 36.5,
        knowledge_base_size_mb: 245.8,
        last_updated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        indexing_status: 'completed',
        indexing_progress_percentage: 100
      },
      document_processing: {
        documents_processed_today: 25,
        documents_processed_this_week: 180,
        documents_processed_this_month: 750,
        average_processing_time_seconds: 12.5,
        processing_success_rate: 97.8,
        chunking_efficiency: 0.91,
        text_extraction_success_rate: 98.2
      },
      search_quality: {
        query_success_rate: 98.5,
        result_relevance_score: 0.89,
        user_satisfaction_with_results: 4.3,
        click_through_rate: 0.67,
        query_refinement_rate: 0.23,
        no_results_queries: 45,
        low_confidence_results: 120
      },
      domain_breakdown: {
        'clinical_research': {
          queries: 3200,
          success_rate: 99.1,
          avg_response_time: 420,
          documents: 450,
          chunks: 16200
        },
        'regulatory_affairs': {
          queries: 2800,
          success_rate: 98.8,
          avg_response_time: 480,
          documents: 380,
          chunks: 13680
        },
        'medical_writing': {
          queries: 1800,
          success_rate: 98.2,
          avg_response_time: 520,
          documents: 220,
          chunks: 7920
        },
        'pharmacovigilance': {
          queries: 950,
          success_rate: 97.9,
          avg_response_time: 460,
          documents: 200,
          chunks: 7880
        }
      },
      performance_trends: {
        daily_queries: {
          last_7_days: [1200, 1350, 1100, 1450, 1300, 1400, 1250],
          trend: '+4.2%'
        },
        response_time_trend: '-8.5%',
        accuracy_trend: '+2.1%',
        user_satisfaction_trend: '+0.3'
      },
      error_analysis: {
        common_error_types: {
          'timeout': 45,
          'no_results_found': 35,
          'embedding_generation_failed': 25,
          'vector_search_failed': 15,
          'document_processing_failed': 10
        },
        error_rate_by_domain: {
          'clinical_research': 0.9,
          'regulatory_affairs': 1.2,
          'medical_writing': 1.8,
          'pharmacovigilance': 2.1
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: metrics,
      message: 'RAG metrics retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching RAG metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch RAG metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
