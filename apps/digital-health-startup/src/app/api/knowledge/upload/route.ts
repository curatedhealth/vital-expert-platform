import { NextRequest, NextResponse } from 'next/server';

import { langchainRAGService } from '@/features/chat/services/langchain-service';
import { getAnalyticsService } from '@/lib/analytics/UnifiedAnalyticsService';
import { STARTUP_TENANT_ID } from '@/lib/constants/tenant';

// Configure route for large file uploads
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const analytics = getAnalyticsService();
  const startTime = Date.now();
  
  //  Get user info from headers or body
  const userId = request.headers.get('x-user-id') || 'anonymous';
  
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const agentId = formData.get('agentId') as string;
    const isGlobal = formData.get('isGlobal') === 'true';
    // Support both new (domain_id) and legacy (domain) fields
    const domain_id = formData.get('domain_id') as string;
    const domain = (domain_id || formData.get('domain') as string) || 'digital-health';
    const embeddingModel = formData.get('embeddingModel') as string || 'text-embedding-3-large';
    // Chat model is selected per query/conversation, not per document
    // const chatModel = formData.get('chatModel') as string || 'gpt-4-turbo-preview';
    
    // New architecture fields
    const access_policy = formData.get('access_policy') as string;
    const rag_priority_weight = formData.get('rag_priority_weight') ? parseFloat(formData.get('rag_priority_weight') as string) : undefined;
    const domain_scope = formData.get('domain_scope') as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Track document upload event
    await analytics.trackEvent({
      tenant_id: STARTUP_TENANT_ID,
      user_id: userId,
      event_type: 'documents_uploaded',
      event_category: 'user_behavior',
      event_data: {
        file_count: files.length,
        file_sizes: files.map(f => f.size),
        total_size: files.reduce((sum, f) => sum + f.size, 0),
        file_names: files.map(f => f.name),
        file_types: files.map(f => f.type),
        domain,
        embedding_model: embeddingModel,
        is_global: isGlobal,
        agent_id: agentId,
      },
      source: 'knowledge_upload',
    });

    // Use LangChain service to process all documents
    const result = await langchainRAGService.processDocuments(files, {
      agentId,
      isGlobal,
      domain: domain_id || domain, // Use domain_id if available, fallback to domain
      domain_id: domain_id || domain, // Explicitly pass domain_id
      embeddingModel,
      // chatModel, // Not needed - selected per query/conversation
      access_policy,
      rag_priority_weight,
      domain_scope,
    });

    const processingTime = Date.now() - startTime;
    const successCount = result.results.filter((r: any) => r.status === 'success').length;
    const failureCount = result.results.filter((r: any) => r.status === 'error').length;

    // Track embedding costs (estimate based on text length)
    // text-embedding-3-large: $0.00013 per 1K tokens
    // Rough estimate: 1 page ≈ 500 tokens
    for (const fileResult of result.results) {
      if (fileResult.status === 'success' && fileResult.chunks) {
        const estimatedTokens = fileResult.chunks * 500; // chunks * avg tokens per chunk
        const embeddingCost = (estimatedTokens / 1000) * 0.00013;
        
        await analytics.trackCost({
          tenant_id: STARTUP_TENANT_ID,
          user_id: userId,
          cost_type: 'embedding',
          cost_usd: embeddingCost,
          quantity: estimatedTokens,
          unit_price: 0.00013 / 1000,
          service: 'openai',
          service_tier: embeddingModel,
          metadata: {
            file_name: fileResult.name,
            chunks: fileResult.chunks,
          },
        });
      }
    }

    // Track storage costs (estimate: $0.02 per GB)
    const totalSizeGB = files.reduce((sum, f) => sum + f.size, 0) / 1_000_000_000;
    if (totalSizeGB > 0) {
      await analytics.trackCost({
        tenant_id: STARTUP_TENANT_ID,
        user_id: userId,
        cost_type: 'storage',
        cost_usd: totalSizeGB * 0.02,
        quantity: files.reduce((sum, f) => sum + f.size, 0),
        service: 'supabase',
        service_tier: 'storage',
        metadata: {
          file_count: files.length,
        },
      });
    }

    // Track document processing completion
    await analytics.trackEvent({
      tenant_id: STARTUP_TENANT_ID,
      user_id: userId,
      event_type: 'documents_processed',
      event_category: 'system_health',
      event_data: {
        success_count: successCount,
        failure_count: failureCount,
        processing_time_ms: processingTime,
        total_files: files.length,
        domain,
        embedding_model: embeddingModel,
      },
      source: 'knowledge_upload',
    });

    return NextResponse.json({
      success: result.success,
      results: result.results,
      totalProcessed: successCount,
      totalFailed: failureCount,
      message: `Processed ${successCount} files successfully using LangChain`
    });

  } catch (error) {
    console.error('=== LANGCHAIN UPLOAD ERROR ===');
    console.error('File upload processing error:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    const processingTime = Date.now() - startTime;
    
    // Track upload failure
    await analytics.trackEvent({
      tenant_id: STARTUP_TENANT_ID,
      user_id: userId,
      event_type: 'document_upload_failed',
      event_category: 'system_health',
      event_data: {
        error: error instanceof Error ? error.message : 'Unknown error',
        processing_time_ms: processingTime,
      },
      source: 'knowledge_upload',
    });
    
    return NextResponse.json(
      {
        error: 'Failed to process uploaded files with LangChain',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}