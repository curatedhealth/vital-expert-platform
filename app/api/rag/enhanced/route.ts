/**
 * Enhanced RAG API Endpoint
 * Integrates RAGAs evaluation, Redis caching, semantic chunking, and A/B testing
 */

import { NextRequest, NextResponse } from 'next/server';

import { enhancedRAGService } from '@/features/rag/services/enhanced-rag-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      action,
      question,
      strategy = 'hybrid_rerank',
      userId,
      sessionId,
      queries,
      testConfig,
      testId,
      documents,
      chunkingStrategy,
      ...options
    } = body;

    switch (action) {
      case 'query':
        return await handleQuery(question, strategy, userId, sessionId, options);
      case 'batch_query':
        return await handleBatchQuery(queries);
      case 'evaluate':
        return await handleEvaluation(question, body.answer, body.sources, strategy, sessionId, userId);
      case 'chunk_documents':
        return await handleChunkDocuments(documents, chunkingStrategy);
      case 'create_ab_test':
        return await handleCreateABTest(testConfig);
      case 'get_ab_test_results':
        return await handleGetABTestResults(testId);
      case 'list_ab_tests':
        return await handleListABTests();
      case 'warm_up_cache':
        return await handleWarmUpCache(body.commonQueries);
      case 'clear_cache':
        return await handleClearCache(body.pattern);
      case 'get_metrics':
        return await handleGetMetrics();
      case 'get_status':
        return await handleGetStatus();
      case 'update_config':
        return await handleUpdateConfig(body.config);
      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: query, batch_query, evaluate, chunk_documents, create_ab_test, get_ab_test_results, list_ab_tests, warm_up_cache, clear_cache, get_metrics, get_status, update_config' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Enhanced RAG API error:', error);
    return NextResponse.json(
      { 
        error: 'Enhanced RAG operation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

async function handleQuery(
  question: string,
  strategy: string,
  userId?: string,
  sessionId?: string,
  options?: any
) {
  try {
    if (!question) {
      return NextResponse.json(
        { error: 'Missing required field: question' },
        { status: 400 }
      );
    }

    const result = await enhancedRAGService.queryEnhanced(
      question,
      strategy,
      userId,
      sessionId,
      options
    );

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Query failed:', error);
    return NextResponse.json(
      { error: 'Query failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleBatchQuery(queries: any[]) {
  try {
    if (!queries || !Array.isArray(queries)) {
      return NextResponse.json(
        { error: 'Missing or invalid queries array' },
        { status: 400 }
      );
    }

    const results = await enhancedRAGService.batchQueryEnhanced(queries);

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Batch query failed:', error);
    return NextResponse.json(
      { error: 'Batch query failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleEvaluation(
  question: string,
  answer: string,
  sources: any[],
  strategy: string,
  sessionId?: string,
  userId?: string
) {
  try {
    if (!question || !answer || !sources) {
      return NextResponse.json(
        { error: 'Missing required fields: question, answer, sources' },
        { status: 400 }
      );
    }

    const evaluation = await enhancedRAGService.evaluateQuery(
      question,
      answer,
      sources,
      strategy,
      sessionId,
      userId
    );

    return NextResponse.json({
      success: true,
      evaluation
    });
  } catch (error) {
    console.error('Evaluation failed:', error);
    return NextResponse.json(
      { error: 'Evaluation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleChunkDocuments(documents: any[], chunkingStrategy?: string) {
  try {
    if (!documents || !Array.isArray(documents)) {
      return NextResponse.json(
        { error: 'Missing or invalid documents array' },
        { status: 400 }
      );
    }

    const result = await enhancedRAGService.chunkDocuments(documents, chunkingStrategy);

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Document chunking failed:', error);
    return NextResponse.json(
      { error: 'Document chunking failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleCreateABTest(testConfig: any) {
  try {
    if (!testConfig) {
      return NextResponse.json(
        { error: 'Missing testConfig' },
        { status: 400 }
      );
    }

    const testId = await enhancedRAGService.createABTest(testConfig);

    return NextResponse.json({
      success: true,
      testId,
      message: 'A/B test created successfully'
    });
  } catch (error) {
    console.error('A/B test creation failed:', error);
    return NextResponse.json(
      { error: 'A/B test creation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleGetABTestResults(testId: string) {
  try {
    if (!testId) {
      return NextResponse.json(
        { error: 'Missing testId' },
        { status: 400 }
      );
    }

    const results = await enhancedRAGService.getABTestResults(testId);

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Failed to get A/B test results:', error);
    return NextResponse.json(
      { error: 'Failed to get A/B test results', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleListABTests() {
  try {
    const tests = await enhancedRAGService.listABTests();

    return NextResponse.json({
      success: true,
      tests
    });
  } catch (error) {
    console.error('Failed to list A/B tests:', error);
    return NextResponse.json(
      { error: 'Failed to list A/B tests', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleWarmUpCache(commonQueries: any[]) {
  try {
    if (!commonQueries || !Array.isArray(commonQueries)) {
      return NextResponse.json(
        { error: 'Missing or invalid commonQueries array' },
        { status: 400 }
      );
    }

    await enhancedRAGService.warmUpCache(commonQueries);

    return NextResponse.json({
      success: true,
      message: 'Cache warm-up completed'
    });
  } catch (error) {
    console.error('Cache warm-up failed:', error);
    return NextResponse.json(
      { error: 'Cache warm-up failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleClearCache(pattern?: string) {
  try {
    await enhancedRAGService.clearCache(pattern);

    return NextResponse.json({
      success: true,
      message: `Cache cleared${pattern ? ` (pattern: ${pattern})` : ''}`
    });
  } catch (error) {
    console.error('Cache clear failed:', error);
    return NextResponse.json(
      { error: 'Cache clear failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleGetMetrics() {
  try {
    const metrics = await enhancedRAGService.getPerformanceMetrics();

    return NextResponse.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Failed to get metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get metrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleGetStatus() {
  try {
    const status = await enhancedRAGService.getSystemStatus();

    return NextResponse.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Failed to get status:', error);
    return NextResponse.json(
      { error: 'Failed to get status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleUpdateConfig(config: any) {
  try {
    if (!config) {
      return NextResponse.json(
        { error: 'Missing config' },
        { status: 400 }
      );
    }

    enhancedRAGService.updateConfig(config);

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully'
    });
  } catch (error) {
    console.error('Config update failed:', error);
    return NextResponse.json(
      { error: 'Config update failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'get_status';

    switch (action) {
      case 'get_metrics':
        return await handleGetMetrics();
      case 'get_status':
        return await handleGetStatus();
      case 'list_ab_tests':
        return await handleListABTests();
      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: get_metrics, get_status, list_ab_tests' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Enhanced RAG GET error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch enhanced RAG data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}