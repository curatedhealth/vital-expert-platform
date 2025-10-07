import crypto from 'crypto';

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import pdf from 'pdf-parse';



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface KnowledgeSource {
  url: string;
  title?: string;
  domain: string;
  agentId?: string;
  isGlobal?: boolean;
  accessLevel?: 'public' | 'agent-specific' | 'organization';
}

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);


    const { knowledgeUrls, agentId, domain = 'digital-health', isGlobal = false }: {
      knowledgeUrls: string[];
      agentId?: string;
      domain?: string;
      isGlobal?: boolean;
    } = await request.json();

    if (!knowledgeUrls || knowledgeUrls.length === 0) {
      return NextResponse.json(
        { error: 'Knowledge URLs are required' },
        { status: 400 }
      );
    }

    const results = [];

    for (const url of knowledgeUrls) {
      try {
        // Step 1: Fetch content from URL
        const content = await fetchContentFromUrl(url);

        // Step 2: Create knowledge source record
        const knowledgeSource = await createKnowledgeSource({
          url,
          title: extractTitleFromContent(content) || `Document from ${new URL(url).hostname}`,
          domain,
          agentId,
          isGlobal,
          accessLevel: isGlobal ? 'public' : agentId ? 'agent-specific' : 'public'
        }, content);

        // Step 3: Process and chunk the content
        const chunks = await processAndChunkContent(content, knowledgeSource.id);

        // Step 4: Generate embeddings for each chunk
        await generateEmbeddings(chunks, knowledgeSource.id);

        results.push({
          url,
          sourceId: knowledgeSource.id,
          chunksProcessed: chunks.length,
          status: 'success'
        });

      } catch (error) {
        console.error(`Error processing ${url}:`, error);
        results.push({
          url,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      totalProcessed: results.filter(r => r.status === 'success').length,
      totalFailed: results.filter(r => r.status === 'error').length
    });

  } catch (error) {
    console.error('Knowledge processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process knowledge sources' },
      { status: 500 }
    );
  }
}

async function fetchContentFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VITALpath Knowledge Crawler/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('text/html')) {
      const html = await response.text();
      // Basic HTML text extraction (in production, use a proper HTML parser)
      return html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    } else if (contentType.includes('text/plain')) {
      return await response.text();
    } else if (contentType.includes('application/pdf')) {
      // Process PDF files
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      try {
        const pdfData = await pdf(buffer);
        return pdfData.text;
      } catch (pdfError) {
        throw new Error(`Failed to parse PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown PDF error'}`);
      }
    } else {
      throw new Error(`Unsupported content type: ${contentType}`);
    }
  } catch (error) {
    throw new Error(`Failed to fetch content from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractTitleFromContent(content: string): string | null {
  // Try to extract title from HTML content
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  // Fallback: use first line or first sentence
  const firstLine = content.split('\n')[0]?.trim();
  if (firstLine && firstLine.length > 0 && firstLine.length < 200) {
    return firstLine;
  }

  return null;
}

async function createKnowledgeSource(source: KnowledgeSource, content: string) {
  const contentHash = crypto.createHash('sha256').update(content).digest('hex');

  // Determine access level and restrictions based on isGlobal and agentId
  let accessLevel = 'public';
  let isPublic = true;
  let restrictedToAgents: string[] = [];

  if (source.isGlobal) {
    accessLevel = 'public';
    isPublic = true;
    restrictedToAgents = [];
  } else if (source.agentId) {
    accessLevel = 'agent-specific';
    isPublic = false;
    restrictedToAgents = [source.agentId];
  }

  const { data, error } = await supabase
    .from('knowledge_sources')
    .insert({
      name: source.title || `Document from ${new URL(source.url).hostname}`,
      source_type: 'web_document',
      source_url: source.url,
      title: source.title || 'Untitled Document',
      description: `Knowledge source from ${source.url}`,
      domain: source.domain,
      category: 'guidance',
      content_hash: contentHash,
      processing_status: 'processing',
      is_public: isPublic,
      access_level: accessLevel,
      restricted_to_agents: restrictedToAgents
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create knowledge source: ${error.message}`);
  }

  return data;
}

async function processAndChunkContent(content: string, sourceId: string): Promise<Array<{
  content: string;
  index: number;
  length: number;
}>> {
  // Simple chunking strategy - split by paragraphs and combine to ~500 tokens
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const chunks = [];
  let currentChunk = '';
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const testChunk = currentChunk + (currentChunk ? '\n\n' : '') + paragraph;

    // Rough token estimation (1 token ≈ 4 characters)
    if (testChunk.length > 2000 && currentChunk.length > 0) {
      // Save current chunk and start new one
      chunks.push({
        content: currentChunk.trim(),
        index: chunkIndex++,
        length: currentChunk.length
      });
      currentChunk = paragraph;
    } else {
      currentChunk = testChunk;
    }
  }

  // Add the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      index: chunkIndex,
      length: currentChunk.length
    });
  }

  return chunks;
}

async function generateEmbeddings(chunks: Array<{
  content: string;
  index: number;
  length: number;
}>, sourceId: string) {
  const chunkInserts = [];

  for (const chunk of chunks) {
    try {
      // Generate OpenAI embedding
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: chunk.content,
      });

      const embedding = embeddingResponse.data[0].embedding;

      // Extract keywords (simple approach - in production use NLP libraries)
      const keywords = extractKeywords(chunk.content);

      chunkInserts.push({
        knowledge_source_id: sourceId,
        content: chunk.content,
        content_length: chunk.length,
        chunk_index: chunk.index,
        embedding_openai: embedding,
        keywords,
        chunk_quality_score: calculateChunkQuality(chunk.content)
      });

    } catch (error) {
      console.error(`Failed to generate embedding for chunk ${chunk.index}:`, error);
      // Continue with other chunks even if one fails
    }
  }

  if (chunkInserts.length > 0) {
    const { error } = await supabase
      .from('document_chunks')
      .insert(chunkInserts);

    if (error) {
      throw new Error(`Failed to insert document chunks: ${error.message}`);
    }

    // Update knowledge source status to completed
    await supabase
      .from('knowledge_sources')
      .update({
        processing_status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', sourceId);
  }
}

function extractKeywords(content: string): string[] {
  // Simple keyword extraction - in production use proper NLP
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);

  // Get word frequency
  const frequency: Record<string, number> = { /* TODO: implement */ };
  words.forEach(word => {
    // eslint-disable-next-line security/detect-object-injection
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Return top 10 most frequent words
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

function calculateChunkQuality(content: string): number {
  // Simple quality scoring based on content characteristics
  let score = 1.0;

  // Penalize very short chunks
  if (content.length < 100) score -= 0.3;

  // Penalize chunks with too many special characters
  const specialCharRatio = (content.match(/[^\w\s]/g) || []).length / content.length;
  if (specialCharRatio > 0.3) score -= 0.2;

  // Boost chunks with good structure (sentences, etc.)
  const sentenceCount = (content.match(/[.!?]+/g) || []).length;
  if (sentenceCount > 2) score += 0.1;

  return Math.max(0.1, Math.min(1.0, score));
}