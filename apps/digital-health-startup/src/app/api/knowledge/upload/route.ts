import { NextRequest, NextResponse } from 'next/server';

import { langchainRAGService } from '@/features/chat/services/langchain-service';

// Configure route for large file uploads
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const agentId = formData.get('agentId') as string;
    const isGlobal = formData.get('isGlobal') === 'true';
    // Support both new (domain_id) and legacy (domain) fields
    const domain_id = formData.get('domain_id') as string;
    const domain = (domain_id || formData.get('domain') as string) || 'digital-health';
    const embeddingModel = formData.get('embeddingModel') as string || 'text-embedding-3-large';
    const chatModel = formData.get('chatModel') as string || 'gpt-4-turbo-preview';
    
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

    // Use LangChain service to process all documents
    const result = await langchainRAGService.processDocuments(files, {
      agentId,
      isGlobal,
      domain: domain_id || domain, // Use domain_id if available, fallback to domain
      domain_id: domain_id || domain, // Explicitly pass domain_id
      embeddingModel,
      chatModel,
      access_policy,
      rag_priority_weight,
      domain_scope,
    });

    return NextResponse.json({
      success: result.success,
      results: result.results,
      totalProcessed: result.results.filter((r: any) => r.status === 'success').length,
      totalFailed: result.results.filter((r: any) => r.status === 'error').length,
      message: `Processed ${result.results.filter((r: any) => r.status === 'success').length} files successfully using LangChain`
    });

  } catch (error) {
    console.error('=== LANGCHAIN UPLOAD ERROR ===');
    console.error('File upload processing error:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      {
        error: 'Failed to process uploaded files with LangChain',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}