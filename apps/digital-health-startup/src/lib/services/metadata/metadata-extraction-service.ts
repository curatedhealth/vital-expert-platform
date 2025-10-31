/**
 * Metadata Extraction Service
 * Orchestrates smart metadata extraction and file renaming during upload
 */

import { SmartMetadataExtractor, type ExtractedMetadata } from './smart-metadata-extractor';
import { FileRenamer, defaultFileRenamer } from './file-renamer';

export interface MetadataExtractionResult {
  // Original file info
  originalFileName: string;
  originalFileSize: number;
  originalFileType: string;
  
  // Extracted metadata
  metadata: ExtractedMetadata & {
    // Enhanced with file info
    file_name?: string;
    file_type?: string;
    file_size?: number;
  };
  
  // New filename (based on taxonomy)
  newFileName?: string;
  
  // Confidence score
  confidence: number;
}

export class MetadataExtractionService {
  private extractor: SmartMetadataExtractor;
  private renamer: FileRenamer;

  constructor(config?: {
    useAI?: boolean;
    openaiApiKey?: string;
    renameFiles?: boolean;
  }) {
    this.extractor = new SmartMetadataExtractor({
      useAI: config?.useAI ?? false,
      openaiApiKey: config?.openaiApiKey,
    });
    this.renamer = defaultFileRenamer;
  }

  /**
   * Extract metadata and optionally rename file
   */
  async processFile(
    file: File,
    fileContent?: string,
    options?: {
      extractFromContent?: boolean;
      renameFile?: boolean;
      domain?: string;
    }
  ): Promise<MetadataExtractionResult> {
    // Extract from filename first
    const filenameMetadata = await this.extractor.extractFromFilename(file.name);

    let mergedMetadata: ExtractedMetadata = filenameMetadata;
    let confidence = this.calculateConfidence(filenameMetadata);

    // Extract from content if provided
    if (options?.extractFromContent !== false && fileContent) {
      const contentMetadata = await this.extractor.extractFromContent(fileContent, file.name);
      mergedMetadata = this.extractor.mergeMetadata(filenameMetadata, contentMetadata);
      confidence = this.calculateConfidence(mergedMetadata);
    }

    // Add file info
    mergedMetadata.file_name = file.name;
    mergedMetadata.file_type = file.type;
    mergedMetadata.file_size = file.size;

    // Generate new filename if requested
    let newFileName: string | undefined;
    if (options?.renameFile !== false) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      newFileName = this.renamer.generateFilename({
        source_name: mergedMetadata.source_name,
        document_type: mergedMetadata.document_type,
        year: mergedMetadata.year,
        clean_title: mergedMetadata.clean_title || mergedMetadata.title,
        extension,
      }, file.name);
    }

    return {
      originalFileName: file.name,
      originalFileSize: file.size,
      originalFileType: file.type,
      metadata: mergedMetadata,
      newFileName,
      confidence,
    };
  }

  /**
   * Calculate overall confidence score
   */
  private calculateConfidence(metadata: ExtractedMetadata): number {
    const confidences = Object.values(metadata.confidence || {});
    if (confidences.length === 0) return 0.5;

    const avg = confidences.reduce((sum, val) => sum + val, 0) / confidences.length;
    
    // Bonus if we have key fields
    let bonus = 0;
    if (metadata.source_name) bonus += 0.1;
    if (metadata.year) bonus += 0.1;
    if (metadata.document_type) bonus += 0.1;

    return Math.min(1, avg + bonus);
  }

  /**
   * Extract metadata from multiple files
   */
  async processFiles(
    files: File[],
    fileContents?: Map<string, string>,
    options?: {
      extractFromContent?: boolean;
      renameFiles?: boolean;
      domain?: string;
    }
  ): Promise<Map<string, MetadataExtractionResult>> {
    const results = new Map<string, MetadataExtractionResult>();

    // Process files in parallel (but limit concurrency)
    const batchSize = 5;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (file) => {
          const content = fileContents?.get(file.name);
          const result = await this.processFile(file, content, options);
          return [file.name, result] as [string, MetadataExtractionResult];
        })
      );

      for (const [fileName, result] of batchResults) {
        results.set(fileName, result);
      }
    }

    return results;
  }
}

// Default instance
export const metadataExtractionService = new MetadataExtractionService({
  useAI: process.env.ENABLE_AI_METADATA_EXTRACTION === 'true',
  renameFiles: process.env.ENABLE_AUTO_FILE_RENAMING !== 'false',
});

