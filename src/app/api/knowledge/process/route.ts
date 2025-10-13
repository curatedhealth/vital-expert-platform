import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

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

interface ProcessRequest {
  knowledgeUrls: string[];
  domain: string;
  agentId?: string;
  isGlobal: boolean;
  embeddingModel?: string;
  chatModel?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🌐 Knowledge process API called');

    const body: ProcessRequest = await request.json();
    const { 
      knowledgeUrls, 
      domain, 
      agentId, 
      isGlobal = false,
      embeddingModel = 'text-embedding-3-large',
      chatModel = 'gpt-4-turbo-preview'
    } = body;

    if (!knowledgeUrls || knowledgeUrls.length === 0) {
      return NextResponse.json(
        { error: 'No URLs provided' },
        { status: 400 }
      );
    }

    console.log('📤 Processing URLs:', {
      count: knowledgeUrls.length,
      domain,
      agentId,
      isGlobal,
      embeddingModel,
      chatModel
    });

    const results = [];
    let totalProcessed = 0;
    let totalFailed = 0;

    // Process each URL
    for (const url of knowledgeUrls) {
      try {
        console.log(`🌐 Processing URL: ${url}`);

        // Fetch content from URL
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; VITAL-Path-Bot/1.0)',
          },
          timeout: 30000, // 30 second timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        
        // Simple HTML text extraction (remove tags, decode entities)
        let textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
          .replace(/<[^>]+>/g, ' ') // Remove HTML tags
          .replace(/&nbsp;/g, ' ') // Replace &nbsp;
          .replace(/&amp;/g, '&') // Replace &amp;
          .replace(/&lt;/g, '<') // Replace &lt;
          .replace(/&gt;/g, '>') // Replace &gt;
          .replace(/&quot;/g, '"') // Replace &quot;
          .replace(/&#39;/g, "'") // Replace &#39;
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .trim();

        if (!textContent || textContent.length < 100) {
          throw new Error('Insufficient text content extracted from URL');
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
            name: new URL(url).hostname + ' - ' + new URL(url).pathname,
            title: new URL(url).hostname + ' - ' + new URL(url).pathname,
            source_type: 'web_url',
            source_url: url,
            file_size: textContent.length,
            mime_type: 'text/html',
            description: `Web content from: ${url}`,
            domain: domain,
            category: 'web_content',
            tags: [],
            content_hash: Buffer.from(textContent).toString('base64').substring(0, 64),
            processing_status: 'processing',
            is_public: isGlobal,
            access_level: isGlobal ? 'public' : 'organization',
            restricted_to_agents: agentId ? [agentId] : [],
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
              embedding_model: embeddingModel,
              source_url: url
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

        // Link to agent if specified
        if (agentId) {
          await supabase
            .from('agent_knowledge_access')
            .insert({
              knowledge_source_id: documentData.id,
              agent_id: agentId
            });
        }

        results.push({
          url: url,
          title: documentData.title,
          status: 'completed',
          document_id: documentData.id,
          chunks_created: chunks.length,
          content_length: textContent.length
        });

        totalProcessed++;
        console.log(`✅ Successfully processed: ${url}`);

      } catch (urlError) {
        console.error(`❌ Failed to process ${url}:`, urlError);
        
        results.push({
          url: url,
          status: 'failed',
          error: urlError instanceof Error ? urlError.message : 'Unknown error'
        });

        totalFailed++;
      }
    }

    console.log(`📊 Process complete: ${totalProcessed} processed, ${totalFailed} failed`);

    return NextResponse.json({
      success: true,
      totalProcessed,
      totalFailed,
      results,
      message: `Successfully processed ${totalProcessed} URLs${totalFailed > 0 ? `, ${totalFailed} failed` : ''}`
    });

  } catch (error) {
    console.error('❌ Knowledge process error:', error);
    
    return NextResponse.json(
      { 
        error: 'Process failed', 
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
