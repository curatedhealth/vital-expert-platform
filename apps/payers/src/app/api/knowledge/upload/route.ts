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
    const domain = formData.get('domain') as string || 'digital-health';
    const embeddingModel = formData.get('embeddingModel') as string || 'text-embedding-3-large';
    const chatModel = formData.get('chatModel') as string || 'gpt-4-turbo-preview';

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
      domain,
      embeddingModel,
      chatModel,
    });

    return NextResponse.json({
      success: result.success,
      results: result.results,
      totalProcessed: result.results.filter(r => r.status === 'success').length,
      totalFailed: result.results.filter(r => r.status === 'error').length,
      message: `Processed ${result.results.filter(r => r.status === 'success').length} files successfully using LangChain`
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