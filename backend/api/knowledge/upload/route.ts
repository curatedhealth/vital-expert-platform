import { NextRequest, NextResponse } from 'next/server';
import { langchainRAGService } from '@/lib/chat/langchain-service';

export async function POST(request: NextRequest) {
  console.log('=== LangChain Upload API called ===');
  try {
    console.log('Step 1: Parsing form data...');
    const formData = await request.formData();

    console.log('Step 2: Extracting files and parameters...');
    const files = formData.getAll('files') as File[];
    const agentId = formData.get('agentId') as string;
    const isGlobal = formData.get('isGlobal') === 'true';
    const domain = formData.get('domain') as string || 'digital-health';

    console.log('Parameters received:', {
      filesCount: files.length,
      agentId,
      isGlobal,
      domain,
      fileNames: files.map(f => f.name)
    });

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    console.log('Step 3: Processing documents with LangChain...');

    // Use LangChain service to process all documents
    const result = await langchainRAGService.processDocuments(files, {
      agentId,
      isGlobal,
      domain,
    });

    console.log('LangChain processing complete:', {
      success: result.success,
      totalProcessed: result.results.filter(r => r.status === 'success').length,
      totalFailed: result.results.filter(r => r.status === 'error').length
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