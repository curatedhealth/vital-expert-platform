import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf';
import { Document } from 'langchain/document';
import { createClient } from '@supabase/supabase-js';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';
import { PromptTemplate } from '@langchain/core/prompts';
import {
  calculateFileHash,
  extractMetadataFromContent,
  areDocumentsDuplicate,
  type DocumentMetadata
} from '@/lib/document-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: 'text-embedding-ada-002',
});

export class LangChainRAGService {
  private vectorStore: SupabaseVectorStore;
  private textSplitter: RecursiveCharacterTextSplitter;
  private llm: ChatOpenAI;

  constructor() {
    this.vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: 'document_chunks',
      queryName: 'match_documents',
    });

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000, // Increased chunk size to reduce total chunks
      chunkOverlap: 300, // Reasonable overlap to maintain context
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });

    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY!,
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
    });
  }

  async processDocuments(files: File[], metadata: {
    agentId?: string;
    isGlobal: boolean;
    domain: string;
  }): Promise<{
    success: boolean;
    results: Array<{
      fileName: string;
      chunksProcessed: number;
      status: 'success' | 'error' | 'duplicate' | 'skipped';
      error?: string;
      estimatedTime?: string;
      duplicateReason?: string;
      extractedMetadata?: Partial<DocumentMetadata>;
    }>;
  }> {
    const results = [];

    // First pass: Check for duplicates by calculating hashes
    console.log('🔍 Checking for duplicate documents...');
    const fileHashes = new Map<string, string>();
    const duplicateChecks = [];

    for (const file of files) {
      try {
        const hash = await calculateFileHash(file);
        fileHashes.set(file.name, hash);

        // Check against existing documents in database
        const { data: existingDocs, error } = await supabase
          .from('knowledge_sources')
          .select('name, file_size, content_hash, title')
          .or(`content_hash.eq.${hash},name.eq.${file.name}`);

        if (!error && existingDocs && existingDocs.length > 0) {
          for (const existingDoc of existingDocs) {
            const duplicateCheck = areDocumentsDuplicate(
              { hash, name: file.name, size: file.size },
              {
                hash: existingDoc.content_hash || '',
                name: existingDoc.name,
                size: existingDoc.file_size,
                title: existingDoc.title
              }
            );

            if (duplicateCheck.isDuplicate) {
              duplicateChecks.push({ file, reason: duplicateCheck.reason });
              break;
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to check duplicates for ${file.name}:`, error);
      }
    }

    // Process each file
    for (const file of files) {
      const startTime = Date.now();
      const hash = fileHashes.get(file.name) || '';

      // Check if this file was marked as duplicate
      const duplicateCheck = duplicateChecks.find(check => check.file.name === file.name);
      if (duplicateCheck) {
        console.log(`⚠️ Skipping duplicate: ${file.name} (${duplicateCheck.reason})`);
        results.push({
          fileName: file.name,
          chunksProcessed: 0,
          status: 'duplicate' as const,
          duplicateReason: duplicateCheck.reason,
          estimatedTime: '0ms',
        });
        continue;
      }

      try {
        console.log(`🔄 Processing ${file.name} with enhanced metadata extraction...`);

        // Estimate processing time based on file size
        const estimatedChunks = Math.ceil(file.size / 2000);
        const estimatedTimeMs = estimatedChunks * 300;
        const estimatedTimeStr = estimatedTimeMs > 10000
          ? `${Math.round(estimatedTimeMs / 1000)}s`
          : `${estimatedTimeMs}ms`;

        console.log(`📊 Estimated processing time: ${estimatedTimeStr} (${estimatedChunks} chunks)`);

        // Load document content
        const documents = await this.loadDocument(file);

        // Extract comprehensive metadata from content
        const fullContent = documents.map(doc => doc.pageContent).join('\n\n');
        const extractedMetadata = extractMetadataFromContent(fullContent, file.name);

        console.log(`📋 Extracted metadata for ${file.name}:`, {
          title: extractedMetadata.title,
          documentType: extractedMetadata.documentType,
          researchType: extractedMetadata.researchType,
          topics: extractedMetadata.topics?.slice(0, 3),
          author: extractedMetadata.author,
          publishedDate: extractedMetadata.publishedDate,
          doi: extractedMetadata.doi,
        });

        // Enhanced document metadata
        const enhancedMetadata = {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          fileHash: hash,
          domain: metadata.domain,
          agentId: metadata.agentId,
          isGlobal: metadata.isGlobal,
          uploadedAt: new Date().toISOString(),
          ...extractedMetadata,
        };

        // Add metadata to each document
        const documentsWithMetadata = documents.map(doc => {
          return new Document({
            pageContent: doc.pageContent,
            metadata: {
              ...doc.metadata,
              ...enhancedMetadata,
            },
          });
        });

        // Split documents into chunks
        const chunks = await this.textSplitter.splitDocuments(documentsWithMetadata);

        console.log(`✂️ Split ${file.name} into ${chunks.length} chunks`);

        // Store metadata in knowledge_sources table first
        const knowledgeSource = await this.createKnowledgeSourceWithMetadata({
          ...enhancedMetadata,
          chunksProcessed: chunks.length,
        });

        // Store in vector database manually
        await this.storeChunksManually(chunks, metadata, knowledgeSource.id);

        const processingTime = Date.now() - startTime;
        const processingTimeStr = processingTime > 1000
          ? `${(processingTime / 1000).toFixed(1)}s`
          : `${processingTime}ms`;

        console.log(`✅ Completed ${file.name} in ${processingTimeStr}`);

        results.push({
          fileName: file.name,
          chunksProcessed: chunks.length,
          status: 'success' as const,
          estimatedTime: processingTimeStr,
          extractedMetadata,
        });

      } catch (error) {
        console.error(`❌ Error processing ${file.name}:`, error);
        const processingTime = Date.now() - startTime;
        const processingTimeStr = processingTime > 1000
          ? `${(processingTime / 1000).toFixed(1)}s`
          : `${processingTime}ms`;

        results.push({
          fileName: file.name,
          chunksProcessed: 0,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Unknown error',
          estimatedTime: processingTimeStr,
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const duplicateCount = results.filter(r => r.status === 'duplicate').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`📊 Processing summary: ${successCount} processed, ${duplicateCount} duplicates skipped, ${errorCount} errors`);

    return {
      success: results.some(r => r.status === 'success'),
      results,
    };
  }

  private async loadDocument(file: File): Promise<Document[]> {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      try {
        // Create a Blob from the file for WebPDFLoader
        const blob = new Blob([file], { type: 'application/pdf' });
        const loader = new WebPDFLoader(blob);
        const documents = await loader.load();

        console.log(`LangChain PDF loaded: ${documents.length} pages`);
        return documents;
      } catch (error) {
        console.error('LangChain PDF loading failed:', error);
        // Fallback: create a document with metadata
        return [
          new Document({
            pageContent: `PDF Document: ${file.name}\nSize: ${file.size} bytes\nUploaded: ${new Date().toISOString()}\n\n[PDF content could not be extracted with LangChain - file processed as metadata only]`,
            metadata: {
              source: file.name,
              type: 'pdf',
              size: file.size,
            },
          }),
        ];
      }
    } else if (
      file.type.startsWith('text/') ||
      file.type === 'application/json' ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.txt')
    ) {
      // Handle text files
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      return [
        new Document({
          pageContent: text,
          metadata: {
            source: file.name,
            type: 'text',
          },
        }),
      ];
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
  }

  private async storeChunksManually(chunks: Document[], metadata: {
    agentId?: string;
    isGlobal: boolean;
    domain: string;
  }, knowledgeSourceId: string) {
    console.log(`Storing ${chunks.length} chunks manually with batch processing...`);

    const BATCH_SIZE = 10; // Process 10 chunks at a time for optimal performance
    const batches = [];

    // Split chunks into batches
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      batches.push(chunks.slice(i, i + BATCH_SIZE));
    }

    console.log(`Processing ${batches.length} batches of up to ${BATCH_SIZE} chunks each...`);

    let totalProcessed = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`🔄 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} chunks)`);

      try {
        // Generate embeddings for all chunks in the batch concurrently
        const embeddingPromises = batch.map(chunk =>
          embeddings.embedQuery(chunk.pageContent)
        );

        const batchEmbeddings = await Promise.all(embeddingPromises);

        // Prepare all chunk data for the batch
        const batchData = batch.map((chunk, index) => ({
          knowledge_source_id: knowledgeSourceId,
          content: chunk.pageContent,
          content_length: chunk.pageContent.length,
          chunk_index: totalProcessed + index,
          embedding_openai: batchEmbeddings[index],
          keywords: this.extractKeywords(chunk.pageContent),
          chunk_quality_score: this.calculateChunkQuality(chunk.pageContent),
        }));

        // Insert the entire batch at once
        const { error } = await supabase
          .from('document_chunks')
          .insert(batchData);

        if (error) {
          console.error(`Error inserting batch ${batchIndex + 1}:`, error);
          throw error;
        }

        totalProcessed += batch.length;
        console.log(`✅ Batch ${batchIndex + 1} complete: ${totalProcessed}/${chunks.length} chunks processed`);

      } catch (error) {
        console.error(`Failed to process batch ${batchIndex + 1}:`, error);
        throw error;
      }
    }

    console.log(`✅ Successfully stored all ${chunks.length} chunks using batch processing`);
  }

  private extractKeywords(content: string): string[] {
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const frequency: Record<string, number> = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private calculateChunkQuality(content: string): number {
    let score = 1.0;

    if (content.length < 100) score -= 0.3;

    const specialCharRatio = (content.match(/[^\w\s]/g) || []).length / content.length;
    if (specialCharRatio > 0.3) score -= 0.2;

    const sentenceCount = (content.match(/[.!?]+/g) || []).length;
    if (sentenceCount > 2) score += 0.1;

    return Math.max(0.1, Math.min(1.0, score));
  }

  private async createKnowledgeSource(fileInfo: {
    title: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    domain: string;
    agentId?: string;
    isGlobal: boolean;
    chunksProcessed: number;
  }) {
    const insertData = {
      name: fileInfo.title,
      source_type: 'uploaded_file',
      file_path: fileInfo.fileName,
      file_size: fileInfo.fileSize,
      mime_type: fileInfo.mimeType,
      title: fileInfo.title,
      description: `LangChain processed file: ${fileInfo.fileName}${fileInfo.agentId ? ` for agent: ${fileInfo.agentId}` : ''}`,
      domain: fileInfo.domain,
      category: 'uploaded_document',
      processing_status: 'completed',
      processed_at: new Date().toISOString(),
      is_public: fileInfo.isGlobal,
      access_level: fileInfo.isGlobal ? 'public' : 'agent-specific',
    };

    const { data, error } = await supabase
      .from('knowledge_sources')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create knowledge source: ${error.message}`);
    }

    return data;
  }

  private async createKnowledgeSourceWithMetadata(metadata: any) {
    const insertData = {
      name: metadata.title || metadata.fileName,
      source_type: 'uploaded_file',
      file_path: metadata.fileName,
      file_size: metadata.fileSize,
      content_hash: metadata.fileHash,
      mime_type: metadata.mimeType,
      title: metadata.title || metadata.fileName.replace(/\.[^/.]+$/, ""),
      description: this.generateDescription(metadata),
      domain: metadata.domain,
      category: 'uploaded_document',
      processing_status: 'completed',
      processed_at: new Date().toISOString(),
      is_public: metadata.isGlobal,
      access_level: metadata.isGlobal ? 'public' : 'agent-specific',

      // Map enhanced metadata to existing columns
      authors: metadata.author ? [metadata.author] : null,
      publication_date: this.parseValidDate(metadata.publishedDate),
      tags: metadata.topics || [],
    };

    const { data, error } = await supabase
      .from('knowledge_sources')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create enhanced knowledge source: ${error.message}`);
    }

    return data;
  }

  private generateDescription(metadata: any): string {
    const parts = [];

    if (metadata.documentType) {
      parts.push(metadata.documentType.replace('-', ' '));
    }

    if (metadata.researchType) {
      parts.push(`(${metadata.researchType.replace('-', ' ')})`);
    }

    if (metadata.author) {
      parts.push(`by ${metadata.author}`);
    }

    if (metadata.publishedDate) {
      parts.push(`published ${metadata.publishedDate}`);
    }

    if (metadata.journal) {
      parts.push(`in ${metadata.journal}`);
    }

    if (metadata.topics && metadata.topics.length > 0) {
      parts.push(`covering ${metadata.topics.slice(0, 3).join(', ')}`);
    }

    const description = parts.join(' ');
    return description || `Document: ${metadata.fileName}`;
  }

  private parseValidDate(dateString: string): string | null {
    if (!dateString || typeof dateString !== 'string') {
      return null;
    }

    // Remove common non-date text that might be extracted incorrectly
    const cleanedDate = dateString.trim();

    // Skip obvious non-dates
    if (cleanedDate.toLowerCase().includes('room') ||
        cleanedDate.length < 4 ||
        cleanedDate.length > 50 ||
        /^[A-Za-z\s]+$/.test(cleanedDate)) {
      return null;
    }

    try {
      // Try to parse as various date formats
      const date = new Date(cleanedDate);

      // Check if it's a valid date and not too far in the future or past
      if (isNaN(date.getTime())) {
        return null;
      }

      const currentYear = new Date().getFullYear();
      const year = date.getFullYear();

      // Reasonable date range for documents (1900 to current year + 5)
      if (year < 1900 || year > currentYear + 5) {
        return null;
      }

      return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    } catch (error) {
      return null;
    }
  }

  async createConversationalChain(agentId: string, systemPrompt: string) {
    // Create a retriever that searches both global and agent-specific documents
    const retriever = this.vectorStore.asRetriever({
      searchType: 'similarity',
      k: 6,
      filter: {
        $or: [
          { isGlobal: { $eq: true } },
          { agentId: { $eq: agentId } },
        ],
      },
    });

    // Create custom prompt template string
    const qaPromptString = `
${systemPrompt}

Context from knowledge base:
{context}

Chat History:
{chat_history}
Human Question: {question}

Based on the context and chat history above, provide a comprehensive and accurate response. If you reference information from the context, please cite it appropriately.`;

    // Create memory for conversation history
    const memory = new BufferMemory({
      memoryKey: 'chat_history',
      returnMessages: true,
    });

    // Create the conversational chain
    const chain = ConversationalRetrievalQAChain.fromLLM(
      this.llm,
      retriever,
      {
        memory,
        qaTemplate: qaPromptString,
        returnSourceDocuments: true,
      }
    );

    return chain;
  }

  async queryKnowledge(
    query: string,
    agentId: string,
    chatHistory: any[] = [],
    agent?: any
  ): Promise<{
    answer: string;
    sources: any[];
    citations: string[];
  }> {
    try {
      console.log(`🔍 Searching for knowledge with embedding for agent: ${agentId}`);

      // Generate embedding for the query
      const queryEmbedding = await embeddings.embedQuery(query);

      // Search for relevant chunks using direct SQL with current schema
      // Note: The match_document_chunks function should be updated to filter by agent's knowledge domains
      // For now, it filters by agent_id which includes agent-specific and global knowledge
      const { data: chunks, error } = await supabase.rpc('match_document_chunks', {
        agent_id: agentId,
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 5,
        // TODO: Add knowledge_domains parameter when database function is updated
        // knowledge_domains: agent?.knowledgeDomains || []
      });

      let ragContext = '';
      let sources: any[] = [];

      if (chunks && chunks.length > 0) {
        console.log(`Found ${chunks.length} relevant chunks`);
        ragContext = chunks.map((chunk: any) => chunk.content).join('\n\n');
        sources = chunks.map((chunk: any, index: number) => ({
          id: chunk.id,
          content: chunk.content,
          title: chunk.title || 'Document Chunk',
          excerpt: chunk.content.substring(0, 200) + '...',
          similarity: chunk.similarity,
          citation: `[${index + 1}]`,
          access_level: chunk.is_public ? 'public' : 'agent-specific'
        }));
      } else {
        console.log('No relevant chunks found, using basic LLM response');
      }

      // Prepare enhanced prompt with RAG context
      const chatHistoryStr = chatHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      // Build system prompt with agent context
      let systemPrompt = '';
      if (agent?.systemPrompt) {
        systemPrompt = agent.systemPrompt + '\n\n';
      }

      let prompt = `${systemPrompt}Chat History:
${chatHistoryStr}

Human Question: ${query}`;

      if (ragContext) {
        prompt += `

Relevant Knowledge Base Context:
${ragContext}

Please provide a comprehensive response based on the context above and your knowledge. When referencing information from the knowledge base, use citations like [1], [2], etc.`;
      } else {
        prompt += `

Please provide a comprehensive and accurate response based on your knowledge as a ${agent?.name || 'specialist'}.`;
      }

      console.log('Invoking LangChain LLM with prompt length:', prompt.length);

      // Invoke LangChain LLM
      const result = await this.llm.invoke(prompt);
      const answer = result.content as string;

      console.log('LangChain LLM returned response, length:', answer.length);
      // const response = await this.llm.invoke(prompt);
      // console.log('LangChain LLM response received:', response?.content ? 'Success' : 'Empty');
      // const answer = response.content as string;

      return {
        answer,
        sources,
        citations: this.extractCitations(answer, sources),
      };

    } catch (error) {
      console.error('Database query error:', error);
      // Fallback to basic LLM response if RAG fails
      try {
        const chatHistoryStr = chatHistory
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n');

        let fallbackSystemPrompt = '';
        if (agent?.systemPrompt) {
          fallbackSystemPrompt = agent.systemPrompt + '\n\n';
        }

        const fallbackPrompt = `${fallbackSystemPrompt}Chat History:
${chatHistoryStr}

Human Question: ${query}

Please provide a comprehensive and accurate response based on your knowledge as a ${agent?.name || 'specialist'}.`;

          console.log('Invoking LangChain LLM fallback with prompt length:', fallbackPrompt.length);

        // Invoke LangChain LLM for fallback
        const fallbackResult = await this.llm.invoke(fallbackPrompt);
        const answer = fallbackResult.content as string;

        console.log('LangChain LLM fallback returned response, length:', answer.length);
        // const response = await this.llm.invoke(fallbackPrompt);
        // console.log('LangChain LLM fallback response received:', response?.content ? 'Success' : 'Empty');
        // const answer = response.content as string;

        return {
          answer,
          sources: [],
          citations: [],
        };
      } catch (fallbackError) {
        console.error('LangChain knowledge query error:', fallbackError);
        throw fallbackError;
      }
    }
  }

  private extractCitations(response: string, sources: any[]): string[] {
    const citations: string[] = [];
    const citationRegex = /\[(\d+)\]/g;
    let match;

    while ((match = citationRegex.exec(response)) !== null) {
      const citationNum = parseInt(match[1]);
      if (citationNum <= sources.length && !citations.includes(match[0])) {
        citations.push(match[0]);
      }
    }

    return citations;
  }

  // Method to test LangChain setup
  async testSetup(): Promise<boolean> {
    try {
      // Test embedding generation
      const testEmbedding = await embeddings.embedQuery('test query');
      console.log('✅ Embeddings working, dimension:', testEmbedding.length);

      // Test LLM
      const testResponse = await this.llm.invoke('Say "LangChain setup successful"');
      console.log('✅ LLM working:', testResponse.content);

      return true;
    } catch (error) {
      console.error('❌ LangChain setup test failed:', error);
      return false;
    }
  }

  async searchKnowledge(query: string, options: {
    domain?: string;
    isGlobal?: boolean;
    limit?: number;
    agentId?: string;
  } = {}): Promise<{ chunks: any[] }> {
    console.log('🔍 Searching knowledge base:', { query, options });

    try {
      // If database is available, try to use vector search
      if (supabase) {
        console.log('Attempting vector search with Supabase...');
        try {
          const { data, error } = await supabase.rpc('match_documents', {
            query_embedding: [],
            match_threshold: 0.7,
            match_count: options.limit || 10
          });

          if (error) {
            console.warn('Vector search failed:', error);
          } else if (data && data.length > 0) {
            console.log(`Found ${data.length} results from vector search`);
            return {
              chunks: data.map((item: any, index: number) => ({
                id: `chunk_${index}`,
                content: item.content || '',
                title: item.metadata?.title || `Document ${index + 1}`,
                source: item.metadata?.source || 'Unknown',
                sourceType: item.metadata?.type || 'Unknown',
                domain: item.metadata?.domain || options.domain || 'digital-health',
                similarity: item.similarity || 0.8,
                isGlobal: item.metadata?.isGlobal !== false,
                metadata: {
                  page: item.metadata?.page,
                  section: item.metadata?.section,
                  uploadedAt: item.metadata?.uploadedAt || new Date().toISOString(),
                  chunkIndex: index,
                },
              }))
            };
          }
        } catch (vectorError) {
          console.warn('Vector search error:', vectorError);
        }
      }

      // Fallback to mock data for development/demo
      console.log('Using mock search results');
      const mockResults = [
        {
          id: 'mock_1',
          content: `Digital health technologies must undergo rigorous validation processes to ensure safety and efficacy. The FDA has established specific guidelines for software as medical devices (SaMD) that outline the requirements for clinical evidence, risk management, and post-market surveillance. These guidelines emphasize the importance of real-world evidence and continuous monitoring of device performance. Query context: "${query}"`,
          title: 'FDA Digital Health Guidelines - Software as Medical Device',
          source: 'FDA Digital Health Guidelines.pdf',
          sourceType: 'PDF',
          domain: 'digital-health',
          similarity: 0.95,
          isGlobal: true,
          metadata: {
            page: 23,
            section: 'Software as Medical Device (SaMD)',
            uploadedAt: '2024-01-15T10:30:00Z',
            chunkIndex: 1,
          },
        },
        {
          id: 'mock_2',
          content: `Clinical trial design for digital therapeutics requires special consideration of digital endpoints and remote monitoring capabilities. Traditional endpoint measurement may not capture the full therapeutic benefit of digital interventions. Researchers should consider incorporating patient-reported outcomes, behavioral analytics, and real-time physiological data to create a comprehensive efficacy profile. Query context: "${query}"`,
          title: 'Clinical Trial Design Best Practices - Digital Endpoints',
          source: 'Clinical Trial Design Best Practices.docx',
          sourceType: 'Word Document',
          domain: 'clinical-research',
          similarity: 0.88,
          isGlobal: true,
          metadata: {
            section: 'Digital Endpoints and Remote Monitoring',
            uploadedAt: '2024-01-14T14:20:00Z',
            chunkIndex: 2,
          },
        },
        {
          id: 'mock_3',
          content: `Market access strategies for digital health solutions must address unique value propositions that traditional pharmaceuticals do not offer. Payers are increasingly interested in real-world outcomes, cost-effectiveness data, and the ability to demonstrate population health improvements. Digital solutions should emphasize their ability to provide continuous care, reduce healthcare utilization, and improve patient engagement. Query context: "${query}"`,
          title: 'Market Access Strategies - Digital Health Value Proposition',
          source: 'Market Access Strategies.pdf',
          sourceType: 'PDF',
          domain: 'market-access',
          similarity: 0.82,
          isGlobal: false,
          agentId: 'market-access',
          metadata: {
            page: 45,
            section: 'Digital Health Value Proposition',
            uploadedAt: '2024-01-13T09:15:00Z',
            chunkIndex: 3,
          },
        },
      ];

      // Filter mock results based on options and agent knowledge domains
      const filteredResults = mockResults.filter(result => {
        const domainMatch = !options.domain || result.domain === options.domain;
        const scopeMatch = options.isGlobal === undefined || result.isGlobal === options.isGlobal;

        // Filter by agent's knowledge domains if agentId is provided
        if (options.agentId) {
          // For now, we'll use the domain filtering since we can't import client-side stores in server-side code
          // The actual filtering by agent domains would be implemented in the database query
          // This is a simplified version that filters based on the domain parameter
          return domainMatch && scopeMatch;
        }

        return domainMatch && scopeMatch;
      });

      const limitedResults = filteredResults.slice(0, options.limit || 10);

      return { chunks: limitedResults };

    } catch (error) {
      console.error('Knowledge search error:', error);
      return { chunks: [] };
    }
  }
}

// Export singleton instance
export const langchainRAGService = new LangChainRAGService();
