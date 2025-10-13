import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

// Initialize Supabase with service role key (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize text splitter
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ['\n\n', '\n', ' ', ''],
});

interface UploadFile {
  file: File;
  domain: string;
  isGlobal: boolean;
  embeddingModel: string;
  chatModel: string;
  selectedAgents: string[];
}

export async function POST(request: NextRequest) {
  try {
    console.log('📚 Knowledge upload API called');
    console.log('📚 Request headers:', Object.fromEntries(request.headers.entries()));

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const domain = formData.get('domain') as string;
    const isGlobal = formData.get('isGlobal') === 'true';
    const embeddingModel = formData.get('embeddingModel') as string || 'text-embedding-3-large';
    const chatModel = formData.get('chatModel') as string || 'gpt-4-turbo-preview';
    const selectedAgentsStr = formData.get('selectedAgents') as string;
    const selectedAgents = selectedAgentsStr ? JSON.parse(selectedAgentsStr) : [];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    console.log('📤 Processing files:', {
      count: files.length,
      domain,
      isGlobal,
      embeddingModel,
      chatModel,
      selectedAgents
    });

    const results = [];
    let totalProcessed = 0;
    let totalFailed = 0;

    // Process each file
    for (const file of files) {
      try {
        console.log(`📄 Processing file: ${file.name} (${file.size} bytes)`);

        // Validate file type and size
        const allowedTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'text/plain',
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (!allowedTypes.includes(file.type)) {
          throw new Error(`Unsupported file type: ${file.type}`);
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB limit
          throw new Error('File size exceeds 50MB limit');
        }

        // Extract text content based on file type
        let textContent = '';
        const buffer = Buffer.from(await file.arrayBuffer());

        if (file.type === 'application/pdf') {
          const pdfData = await pdf(buffer);
          textContent = pdfData.text;
        } else if (file.type.includes('wordprocessingml') || file.type === 'application/msword') {
          const result = await mammoth.extractRawText({ buffer });
          textContent = result.value;
        } else if (file.type === 'text/plain' || file.type === 'text/csv') {
          textContent = buffer.toString('utf-8');
        } else {
          // For Excel files, we'll extract as text for now
          textContent = buffer.toString('utf-8');
        }

        if (!textContent.trim()) {
          throw new Error('No text content extracted from file');
        }

        console.log(`📝 Extracted text: ${textContent.length} characters`);

        // Generate document embedding
        const embeddingResponse = await openai.embeddings.create({
          model: embeddingModel,
          input: textContent.substring(0, 8000), // Limit input size
        });

        const documentEmbedding = embeddingResponse.data[0].embedding;

        // Store document in database using knowledge_sources table
        const { data: documentData, error: docError } = await supabase
          .from('knowledge_sources')
          .insert({
            name: file.name,
            title: file.name,
            source_type: 'uploaded_file',
            file_path: file.name,
            file_size: file.size,
            mime_type: file.type,
            description: `Uploaded file: ${file.name}`,
            domain: domain,
            category: 'document',
            tags: [],
            content_hash: Buffer.from(textContent).toString('base64').substring(0, 64),
            processing_status: 'processing',
            is_public: isGlobal,
            access_level: isGlobal ? 'public' : 'organization',
            restricted_to_agents: selectedAgents,
            status: 'active'
          })
          .select()
          .single();

        if (docError) {
          throw new Error(`Failed to store document: ${docError.message}`);
        }

        console.log(`✅ Document stored with ID: ${documentData.id}`);

        // Split text into chunks
        const chunks = await textSplitter.splitText(textContent);
        console.log(`📦 Created ${chunks.length} chunks`);

        // Generate embeddings for chunks and store them
        const chunkData = [];
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          
          // Generate embedding for chunk
          const chunkEmbeddingResponse = await openai.embeddings.create({
            model: embeddingModel,
            input: chunk.substring(0, 8000),
          });

          chunkData.push({
            document_id: documentData.id,
            chunk_index: i,
            chunk_text: chunk,
            embedding: chunkEmbeddingResponse.data[0].embedding,
            metadata: {
              chunk_length: chunk.length,
              embedding_model: embeddingModel
            }
          });
        }

        // Store chunks in database using document_chunks table
        if (chunkData.length > 0) {
        const chunkDataForDB = chunkData.map(chunk => ({
          knowledge_source_id: documentData.id,
          chunk_index: chunk.chunk_index,
          content: chunk.chunk_text,
          embedding: chunk.embedding, // Use 'embedding' instead of 'embedding_openai'
          section_title: `Chunk ${chunk.chunk_index + 1}`,
          page_number: 1,
          keywords: [],
          metadata: chunk.metadata
        }));

          const { error: chunksError } = await supabase
            .from('document_chunks')
            .insert(chunkDataForDB);

          if (chunksError) {
            console.warn(`⚠️ Failed to store some chunks: ${chunksError.message}`);
          } else {
            console.log(`✅ Stored ${chunkData.length} chunks`);
          }
        }

        // Update document status to completed
        await supabase
          .from('knowledge_sources')
          .update({ 
            processing_status: 'completed',
            processed_at: new Date().toISOString()
          })
          .eq('id', documentData.id);

        // Link to agents if specified
        if (selectedAgents.length > 0) {
          const agentLinks = selectedAgents.map(agentId => ({
            knowledge_source_id: documentData.id,
            agent_id: agentId
          }));

          await supabase
            .from('agent_knowledge_access')
            .insert(agentLinks);
        }

        results.push({
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'completed',
          document_id: documentData.id,
          chunks_created: chunks.length
        });

        totalProcessed++;
        console.log(`✅ Successfully processed: ${file.name}`);

      } catch (fileError) {
        console.error(`❌ Failed to process ${file.name}:`, fileError);
        
        results.push({
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'failed',
          error: fileError instanceof Error ? fileError.message : 'Unknown error'
        });

        totalFailed++;
      }
    }

    console.log(`📊 Upload complete: ${totalProcessed} processed, ${totalFailed} failed`);

    return NextResponse.json({
      success: true,
      totalProcessed,
      totalFailed,
      results,
      message: `Successfully processed ${totalProcessed} files${totalFailed > 0 ? `, ${totalFailed} failed` : ''}`
    });

  } catch (error) {
    console.error('❌ Knowledge upload error:', error);
    
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        totalProcessed: 0,
        totalFailed: 0,
        results: []
      },
      { status: 500 }
    );
  }
}
