/**
 * Python Services Client
 * 
 * Client for calling Python AI services via API Gateway
 */

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || process.env.API_GATEWAY_URL || 'http://localhost:3001';

export interface MetadataProcessingOptions {
  extract_from_content?: boolean;
  sanitize?: boolean;
  check_copyright?: boolean;
  rename_file?: boolean;
  remove_pii?: boolean;
  remove_phi?: boolean;
  remove_credit_cards?: boolean;
  remove_ssn?: boolean;
  remove_email?: boolean;
  remove_phone?: boolean;
  remove_address?: boolean;
  remove_names?: boolean;
  redaction_mode?: 'mask' | 'remove' | 'hash';
  strict_mode?: boolean;
  require_attribution?: boolean;
  check_watermarks?: boolean;
  log_removals?: boolean;
}

export interface MetadataProcessingResult {
  metadata: {
    source_name?: string;
    document_type?: string;
    year?: number;
    author?: string;
    organization?: string;
    clean_title?: string;
    title?: string;
    [key: string]: any;
  };
  new_filename?: string;
  original_filename: string;
  sanitization?: {
    sanitized: boolean;
    sanitized_content: string;
    pii_detected: any[];
    risk_level: string;
    needs_review: boolean;
  };
  copyright_check?: {
    has_copyright_risk: boolean;
    risk_level: string;
    requires_approval: boolean;
    detected_issues: any[];
    recommendations: string[];
  };
  processing_summary: {
    extraction_confidence: number;
    sanitized: boolean;
    copyright_risk: boolean;
    requires_review: boolean;
  };
}

export class PythonServicesClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_GATEWAY_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Process file with all metadata services (extraction, sanitization, copyright, renaming)
   */
  async processFileMetadata(
    filename: string,
    content: string,
    options?: MetadataProcessingOptions
  ): Promise<MetadataProcessingResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/metadata/process`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify({
          filename,
          content,
          options: options || {},
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Metadata processing failed: ${error.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Python metadata processing failed:', error);
      throw error;
    }
  }

  /**
   * Extract metadata from filename and/or content
   */
  async extractMetadata(
    filename: string,
    content?: string
  ): Promise<{ metadata: any; extraction_confidence: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/metadata/extract`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify({
          filename,
          content,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Metadata extraction failed: ${error.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Python metadata extraction failed:', error);
      throw error;
    }
  }

  /**
   * Sanitize content to remove PII/PHI
   */
  async sanitizeContent(
    content: string,
    options?: {
      remove_pii?: boolean;
      remove_phi?: boolean;
      remove_credit_cards?: boolean;
      remove_ssn?: boolean;
      remove_email?: boolean;
      remove_phone?: boolean;
      remove_address?: boolean;
      remove_names?: boolean;
      redaction_mode?: 'mask' | 'remove' | 'hash';
      log_removals?: boolean;
    }
  ): Promise<{
    sanitized: boolean;
    sanitized_content: string;
    pii_detected: any[];
    risk_level: string;
    needs_review: boolean;
    removed_content: any[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/metadata/sanitize`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify({
          content,
          options: options || {},
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Content sanitization failed: ${error.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Python content sanitization failed:', error);
      throw error;
    }
  }

  /**
   * Check document for copyright compliance
   */
  async checkCopyright(
    content: string,
    filename: string,
    metadata?: {
      source_name?: string;
      source_url?: string;
      author?: string;
      publication_date?: string;
      license?: string;
    },
    options?: {
      strict_mode?: boolean;
      require_attribution?: boolean;
      check_watermarks?: boolean;
      exclude_known_sources?: string[];
    }
  ): Promise<{
    has_copyright_risk: boolean;
    risk_level: string;
    requires_approval: boolean;
    detected_issues: any[];
    recommendations: string[];
    copyright_notice?: string;
    attribution_required: boolean;
    confidence: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/metadata/copyright-check`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify({
          content,
          filename,
          metadata: metadata || {},
          options: options || {},
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Copyright check failed: ${error.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Python copyright check failed:', error);
      throw error;
    }
  }

  /**
   * Generate new filename based on metadata and taxonomy
   */
  async generateFilename(
    metadata: {
      source_name?: string;
      document_type?: string;
      year?: number;
      clean_title?: string;
      title?: string;
      extension?: string;
    },
    originalFilename?: string
  ): Promise<{ original_filename?: string; new_filename: string; metadata: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/metadata/generate-filename`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify({
          metadata,
          original_filename: originalFilename,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Filename generation failed: ${error.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Python filename generation failed:', error);
      throw error;
    }
  }

  /**
   * RAG Query
   */
  async queryRAG(
    query: string,
    options?: {
      strategy?: string;
      domain_ids?: string[];
      filters?: Record<string, any>;
      max_results?: number;
      similarity_threshold?: number;
      agent_id?: string;
      user_id?: string;
      session_id?: string;
    }
  ): Promise<{
    sources: any[];
    context: string;
    metadata: any;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/rag/query`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify({
          query,
          strategy: options?.strategy || 'hybrid',
          domain_ids: options?.domain_ids,
          filters: options?.filters || {},
          max_results: options?.max_results || 10,
          similarity_threshold: options?.similarity_threshold || 0.7,
          agent_id: options?.agent_id,
          user_id: options?.user_id,
          session_id: options?.session_id,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`RAG query failed: ${error.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Python RAG query failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const pythonServicesClient = new PythonServicesClient();

