/**
 * LangChain RAG Service
 * Handles document processing and knowledge base integration
 * Connects to Unified RAG Service for document ingestion
 */

import pdf from 'pdf-parse';
import { unifiedRAGService } from '@/lib/services/rag/unified-rag-service';

export interface LangChainConfig {
  model: string;
  temperature: number;
}

export interface ProcessDocumentsOptions {
  agentId?: string;
  isGlobal: boolean;
  domain: string;
  embeddingModel: string;
  // chatModel: string; // Not needed - selected per query/conversation
}

export interface ProcessResult {
  filename: string;
  status: 'success' | 'error';
  documentId?: string;
  chunks?: number;
  error?: string;
}

export class LangChainRAGService {
  private config: LangChainConfig;

  constructor(config: LangChainConfig) {
    this.config = config;
  }

  /**
   * Process multiple document files for RAG ingestion
   */
  async processDocuments(
    files: File[],
    options: ProcessDocumentsOptions
  ): Promise<{ success: boolean; results: ProcessResult[] }> {
    console.log(`📄 Processing ${files.length} documents for RAG ingestion`);
    console.log('Options:', {
      domain: options.domain,
      isGlobal: options.isGlobal,
      agentId: options.agentId,
      embeddingModel: options.embeddingModel
    });

    const results: ProcessResult[] = [];

    for (const file of files) {
      try {
        console.log(`  📝 Processing file: ${file.name} (${file.size} bytes)`);

        // Validate file
        if (!file || file.size === 0) {
          results.push({
            filename: file.name,
            status: 'error',
            error: 'File is empty'
          });
          continue;
        }

        // Validate file type
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
          results.push({
            filename: file.name,
            status: 'error',
            error: `Unsupported file type: ${file.type}`
          });
          continue;
        }

        // Extract text content based on file type
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let content: string;

        if (file.type === 'application/pdf') {
          // Parse PDF files using pdf-parse
          try {
            const pdfData = await pdf(buffer);
            content = pdfData.text;
          } catch (pdfError) {
            throw new Error(`Failed to parse PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown PDF error'}`);
          }
        } else if (
          file.type === 'text/plain' ||
          file.type === 'text/csv' ||
          file.name.endsWith('.txt') ||
          file.name.endsWith('.csv')
        ) {
          // Text files can be safely converted to UTF-8
          content = buffer.toString('utf-8');
        } else if (
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.type === 'application/msword' ||
          file.type === 'application/vnd.ms-excel' ||
          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
          // Word and Excel files need proper parsing (not yet implemented)
          // For now, return an informative error
          throw new Error(
            `Word and Excel file parsing is not yet fully implemented. ` +
            `Please convert the file to PDF or text format for now.`
          );
        } else {
          // Fallback: try UTF-8 but catch errors
          try {
            content = buffer.toString('utf-8');
            // If the content looks like binary data (many null bytes or control chars), reject it
            if (content.match(/[\x00-\x08\x0E-\x1F]/g)?.length && content.match(/[\x00-\x08\x0E-\x1F]/g)!.length > content.length * 0.1) {
              throw new Error('File appears to contain binary data and cannot be parsed as text');
            }
          } catch (utfError) {
            throw new Error(
              `Unsupported file format: ${file.type}. ` +
              `The file contains binary data that cannot be converted to text. ` +
              `Please convert to PDF or text format.`
            );
          }
        }

        // Use Python services for metadata extraction, copyright checking, and sanitization
        const { pythonServicesClient } = await import('@/lib/services/python-services/python-services-client');
        
        let processedContent = content;
        let extractedMetadata: any = {};
        let copyrightCheck: any = {};
        let sanitizationResult: any = {};
        let title = file.name;
        let sourceName: string | undefined;
        let documentType: string | undefined;
        let year: number | undefined;
        let author: string | undefined;
        let organization: string | undefined;
        let extractionResult: { newFileName?: string; confidence?: number; metadata?: any } | undefined;
        let processingResult: any;

        try {
          // Process file with all Python services (metadata, sanitization, copyright)
          processingResult = await pythonServicesClient.processFileMetadata(
            file.name,
            content,
            {
              extract_from_content: true,
              sanitize: true,
              check_copyright: true,
              rename_file: true, // Enable file renaming using unified VITAL taxonomy
              remove_pii: true,
              remove_phi: true,
              remove_credit_cards: true,
              remove_ssn: true,
              remove_email: true,
              remove_phone: true,
              remove_address: true,
              remove_names: false, // Keep names for citations
              redaction_mode: 'mask',
              strict_mode: true,
              require_attribution: true,
              check_watermarks: true,
              log_removals: true,
            }
          );

          // Extract results
          extractedMetadata = processingResult.metadata || {};
          copyrightCheck = processingResult.copyright_check || {};
          sanitizationResult = processingResult.sanitization || {};
          processedContent = sanitizationResult.sanitized_content || content;

          // Use extracted metadata or fallback to defaults
          title = extractedMetadata.title || extractedMetadata.clean_title || file.name;
          sourceName = extractedMetadata.source_name;
          documentType = extractedMetadata.document_type;
          year = extractedMetadata.year;
          author = extractedMetadata.author;
          organization = extractedMetadata.organization;

          // Create extractionResult-like object from processingResult for consistency
          extractionResult = {
            newFileName: processingResult.metadata?.new_filename || processingResult.new_filename,
            confidence: processingResult.processing_summary?.extraction_confidence || processingResult.metadata?.confidence,
          };

        } catch (error) {
          // Fallback to TypeScript services if Python services are unavailable
          console.warn('⚠️ Python services unavailable, falling back to TypeScript services:', error);
          
          const { metadataExtractionService } = await import('@/lib/services/metadata/metadata-extraction-service');
          extractionResult = await metadataExtractionService.processFile(
            file,
            content,
            {
              extractFromContent: true,
              renameFile: true, // Enable file renaming using unified VITAL taxonomy
              domain: options.domain,
            }
          );

          extractedMetadata = extractionResult.metadata;
          title = extractedMetadata.title || extractedMetadata.clean_title || file.name;
          sourceName = extractedMetadata.source_name;
          documentType = extractedMetadata.document_type;
          year = extractedMetadata.year;
          author = extractedMetadata.author;
          organization = extractedMetadata.organization;

          // Fallback copyright check
          const { copyrightChecker } = await import('@/lib/services/compliance/copyright-checker');
          copyrightCheck = await copyrightChecker.checkCopyright(
            content,
            file.name,
            {
              source_name: sourceName,
              source_url: extractedMetadata.source_url,
              author: author,
              publication_date: extractedMetadata.publication_date || (year ? `${year}-01-01` : undefined),
            },
            {
              strictMode: true,
              requireAttribution: true,
              checkDuplicates: false,
              checkWatermarks: true,
            }
          );

          // Fallback sanitization
          const { dataSanitizer } = await import('@/lib/services/compliance/data-sanitizer');
          sanitizationResult = await dataSanitizer.sanitizeContent(content, {
            removePII: true,
            removePHI: true,
            removeCreditCards: true,
            removeSSN: true,
            removeEmail: true,
            removePhone: true,
            removeAddress: true,
            removeNames: false,
            redactionMode: 'mask',
            logRemovals: true,
          });

          processedContent = sanitizationResult.sanitized ? sanitizationResult.sanitizedContent : content;
        }

          // Prepare document for RAG service with extracted metadata
          const document = {
            title: title,
            content: processedContent, // Use sanitized content
            domain: options.domain, // Legacy field
            domain_id: (options as any).domain_id || options.domain, // New field
            tags: options.isGlobal ? ['global'] : [`agent:${options.agentId}`],
            metadata: {
              source: 'upload',
              filename: file.name,
              original_filename: file.name, // Keep original filename
              new_filename: extractionResult?.newFileName || file.name, // New taxonomy-based filename
              filesize: file.size,
              filetype: file.type,
              uploadedAt: new Date().toISOString(),
              isGlobal: options.isGlobal,
              agentId: options.agentId,
              embeddingModel: options.embeddingModel,
              // chatModel is not needed during document processing - it's selected per query/conversation
              // chatModel: options.chatModel,
              // Extracted metadata
              source_name: sourceName,
              document_type: documentType,
              year: year,
              author: author,
              organization: organization,
              regulatory_body: extractedMetadata.regulatory_body,
              therapeutic_area: extractedMetadata.therapeutic_area,
              geographic_scope: extractedMetadata.geographic_scope,
              keywords: extractedMetadata.keywords,
              summary: extractedMetadata.summary || extractedMetadata.abstract,
              language: extractedMetadata.language,
              word_count: extractedMetadata.word_count,
              page_count: extractedMetadata.page_count,
              extraction_confidence: processingResult?.processing_summary?.extraction_confidence || extractionResult?.confidence || 0.5,
              // Copyright check results
              copyright_status: copyrightCheck.has_copyright_risk ? 'risk' : 'cleared',
              copyright_risk_level: copyrightCheck.risk_level,
              copyright_notice: copyrightCheck.copyright_notice,
              copyright_requires_approval: copyrightCheck.requires_approval,
              copyright_issues: copyrightCheck.detected_issues || copyrightCheck.detectedIssues,
              attribution_required: copyrightCheck.attribution_required || copyrightCheck.attributionRequired,
              copyright_checked_at: new Date().toISOString(),
              // Sanitization results
              sanitization_status: sanitizationResult.sanitized ? 'sanitized' : 'none',
              sanitization_risk_level: sanitizationResult.risk_level || sanitizationResult.riskLevel,
              sanitization_needs_review: sanitizationResult.needs_review || sanitizationResult.needsReview,
              pii_detected: sanitizationResult.pii_detected || sanitizationResult.piiDetected,
              removed_content_summary: sanitizationResult.removed_content || sanitizationResult.removedContent,
              sanitization_checked_at: new Date().toISOString(),
            },
            // New architecture fields (use extracted if not provided)
            access_policy: (options as any).access_policy,
            rag_priority_weight: (options as any).rag_priority_weight,
            domain_scope: (options as any).domain_scope,
          };

        // Add document to unified RAG service
        const documentId = await unifiedRAGService.addDocument(document);

        console.log(`  ✅ Document processed successfully: ${documentId}`);

        results.push({
          filename: file.name,
          status: 'success',
          documentId: documentId,
          chunks: 0 // Will be updated after processing
        });

      } catch (error) {
        console.error(`  ❌ Failed to process ${file.name}:`, error);
        results.push({
          filename: file.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    console.log(`✅ Document processing complete: ${successCount}/${files.length} successful`);

    return {
      success: successCount > 0,
      results
    };
  }

  /**
   * Search knowledge base
   */
  async searchKnowledge(
    query: string,
    options?: {
      limit?: number;
      domain?: string;
      agentId?: string;
    }
  ): Promise<{ chunks: any[] }> {
    try {
      const result = await unifiedRAGService.query({
        text: query,
        agentId: options?.agentId,
        domain: options?.domain,
        maxResults: options?.limit || 10,
        similarityThreshold: 0.7,
        strategy: 'hybrid',
        includeMetadata: true
      });

      return {
        chunks: result.sources.map(source => ({
          content: source.pageContent,
          score: source.metadata?.similarity || 0,
          metadata: source.metadata
        }))
      };
    } catch (error) {
      console.error('Knowledge search failed:', error);
      return { chunks: [] };
    }
  }

  /**
   * Process query with RAG context
   */
  async processQuery(
    query: string,
    options?: {
      domain?: string;
      agentId?: string;
    }
  ): Promise<{ answer: string; sources: string[] }> {
    try {
      const result = await unifiedRAGService.query({
        text: query,
        agentId: options?.agentId,
        domain: options?.domain,
        maxResults: 5,
        similarityThreshold: 0.7,
        strategy: 'hybrid',
        includeMetadata: true
      });

      // Generate answer using context (simplified - in production, use LLM)
      const answer = `Based on ${result.sources.length} relevant sources: ${result.context.substring(0, 200)}...`;

      const sources = result.sources.map(
        source => source.metadata?.title || source.metadata?.source || 'Unknown'
      );

      return {
        answer,
        sources
      };
    } catch (error) {
      console.error('Query processing failed:', error);
      return {
        answer: 'Failed to process query',
        sources: []
      };
    }
  }

  /**
   * Get health status
   */
  async getHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }> {
    try {
      const health = await unifiedRAGService.getHealthMetrics();
      return {
        status: health.status,
        details: {
          totalDocuments: health.totalDocuments,
          totalChunks: health.totalChunks,
          cacheSize: health.cacheSize,
          vectorStore: health.vectorStoreStatus
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

export const langchainRAGService = new LangChainRAGService({
  model: 'gpt-4-turbo-preview',
  temperature: 0.1
});
