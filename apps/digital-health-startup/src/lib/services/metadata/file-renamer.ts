/**
 * File Renaming Service
 * Renames files based on consistent taxonomy and extracted metadata
 */

interface RenameConfig {
  // Template format: {Source}_{Type}_{Year}_{CleanTitle}.{ext}
  template?: string;
  
  // Separator between parts
  separator?: string;
  
  // Max length for each component
  maxLength?: {
    source?: number;
    type?: number;
    title?: number;
  };
  
  // Whether to include missing parts
  includeMissing?: boolean;
  
  // Custom formatters
  formatters?: {
    source?: (value: string) => string;
    type?: (value: string) => string;
    title?: (value: string) => string;
    year?: (value: number) => string;
  };
}

interface FileMetadata {
  source_name?: string;
  document_type?: string;
  year?: number;
  clean_title?: string;
  title?: string;
  extension?: string;
}

export class FileRenamer {
  private config: Required<RenameConfig>;

  constructor(config?: RenameConfig) {
    this.config = {
      template: config?.template || '{Source}_{Type}_{Year}_{Title}',
      separator: config?.separator || '_',
      maxLength: {
        source: config?.maxLength?.source || 50,
        type: config?.maxLength?.type || 50,
        title: config?.maxLength?.title || 100,
      },
      includeMissing: config?.includeMissing ?? false,
      formatters: {
        source: config?.formatters?.source || ((value: string) => this.sanitize(value)),
        type: config?.formatters?.type || ((value: string) => this.sanitize(value)),
        title: config?.formatters?.title || ((value: string) => this.sanitize(value)),
        year: config?.formatters?.year || ((value: number) => value.toString()),
      },
    };
  }

  /**
   * Generate new filename based on taxonomy and metadata
   */
  generateFilename(metadata: FileMetadata, originalFileName?: string): string {
    const parts: string[] = [];

    // Extract components
    const source = metadata.source_name ? this.formatSource(metadata.source_name) : null;
    const type = metadata.document_type ? this.formatType(metadata.document_type) : null;
    const year = metadata.year ? this.formatYear(metadata.year) : null;
    const title = (metadata.clean_title || metadata.title || originalFileName?.replace(/\.[^/.]+$/, '') || 'Document')
      .replace(/\.[^/.]+$/, ''); // Remove extension if present

    // Build filename according to template
    // Default: Source_Type_Year_Title
    if (source || this.config.includeMissing) {
      parts.push(source || 'UnknownSource');
    }
    
    if (type || this.config.includeMissing) {
      parts.push(type || 'Document');
    }
    
    if (year || this.config.includeMissing) {
      parts.push(year || new Date().getFullYear().toString());
    }
    
    if (title) {
      parts.push(this.formatTitle(title));
    }

    // Join with separator
    let filename = parts.join(this.config.separator);

    // Add extension
    const extension = metadata.extension || originalFileName?.split('.').pop()?.toLowerCase() || '';
    if (extension) {
      filename += `.${extension}`;
    }

    // Ensure it's not too long (Windows has 255 char limit)
    const maxLength = 200; // Leave room for path
    if (filename.length > maxLength) {
      const titleLength = maxLength - (filename.length - title.length);
      const truncatedTitle = title.substring(0, Math.max(0, titleLength - 3)) + '...';
      const partsWithoutTitle = parts.slice(0, -1);
      filename = [...partsWithoutTitle, truncatedTitle].join(this.config.separator) + (extension ? `.${extension}` : '');
    }

    return filename;
  }

  /**
   * Format source name
   */
  private formatSource(source: string): string {
    // Remove spaces, keep acronyms uppercase
    const formatted = this.config.formatters.source(source);
    
    // If it's already an acronym (all caps, short), keep it
    if (source === source.toUpperCase() && source.length <= 10) {
      return source;
    }
    
    // Otherwise, format as TitleCase
    return formatted
      .split(/[\s-_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Format document type
   */
  private formatType(type: string): string {
    const formatted = this.config.formatters.type(type);
    
    // Remove common words and format
    return formatted
      .replace(/\b(guide|guidance|document|report|paper)\b/gi, '')
      .trim()
      .split(/[\s-_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
      .substring(0, this.config.maxLength.type);
  }

  /**
   * Format year
   */
  private formatYear(year: number): string {
    return this.config.formatters.year(year);
  }

  /**
   * Format title
   */
  private formatTitle(title: string): string {
    const formatted = this.config.formatters.title(title);
    
    // Clean up: remove special chars, normalize spaces
    let clean = formatted
      .replace(/[^\w\s-]/g, ' ') // Remove special chars
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
    
    // Truncate if too long
    if (clean.length > this.config.maxLength.title) {
      clean = clean.substring(0, this.config.maxLength.title - 3) + '...';
    }
    
    return clean;
  }

  /**
   * Sanitize string for filename
   */
  private sanitize(value: string): string {
    return value
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename chars
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  /**
   * Generate filename with custom template
   */
  generateWithTemplate(template: string, metadata: FileMetadata, originalFileName?: string): string {
    let filename = template;

    // Replace placeholders
    filename = filename.replace(/{Source}/g, metadata.source_name ? this.formatSource(metadata.source_name) : 'UnknownSource');
    filename = filename.replace(/{Type}/g, metadata.document_type ? this.formatType(metadata.document_type) : 'Document');
    filename = filename.replace(/{Year}/g, metadata.year ? this.formatYear(metadata.year) : new Date().getFullYear().toString());
    filename = filename.replace(/{Title}/g, (metadata.clean_title || metadata.title || originalFileName?.replace(/\.[^/.]+$/, '') || 'Document'));
    filename = filename.replace(/{Ext}/g, metadata.extension || originalFileName?.split('.').pop()?.toLowerCase() || '');

    // Clean up extra separators
    filename = filename.replace(/[_-]{2,}/g, this.config.separator);
    filename = filename.replace(/^[_-]+|[_-]+$/g, '');

    // Add extension if not in template
    if (!filename.includes('.') && metadata.extension) {
      filename += `.${metadata.extension}`;
    }

    return filename;
  }
}

// Default instance with standard healthcare/pharma taxonomy
export const defaultFileRenamer = new FileRenamer({
  template: '{Source}_{Type}_{Year}_{Title}',
  separator: '_',
  maxLength: {
    source: 30,
    type: 40,
    title: 80,
  },
  formatters: {
    source: (value: string) => {
      // Keep acronyms, format others as TitleCase
      if (value === value.toUpperCase() && value.length <= 10) {
        return value;
      }
      return value
        .split(/[\s-_]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
    },
    type: (value: string) => {
      // Format as CamelCase
      return value
        .replace(/\b(guide|guidance|document|report|paper)\b/gi, '')
        .trim()
        .split(/[\s-_]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
    },
    title: (value: string) => {
      // Keep title clean, remove special chars
      return value
        .replace(/[^\w\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    },
  },
});

