/**
 * Rich Media Service - Q1 2025 Enhancement
 *
 * Handles image upload, PDF parsing, chart generation, and file attachments
 * for enhanced Ask Expert conversations.
 *
 * Features:
 * - Image upload and analysis (via GPT-4 Vision)
 * - PDF document parsing and extraction
 * - Chart/graph generation from data
 * - File attachment management
 * - Image optimization and compression
 * - Secure file storage (Supabase Storage)
 */

import { createClient } from '@supabase/supabase-js';

export interface MediaFile {
  id: string;
  type: 'image' | 'pdf' | 'document' | 'chart';
  name: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
  uploadedAt: Date;
}

export interface ImageAnalysisResult {
  description: string;
  labels: string[];
  text?: string;
  confidence: number;
}

export interface PDFParseResult {
  text: string;
  pages: number;
  metadata?: {
    title?: string;
    author?: string;
    creationDate?: string;
  };
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area';
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
    }>;
  };
  options?: Record<string, any>;
}

class RichMediaService {
  private supabase: ReturnType<typeof createClient> | null = null;
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private readonly ALLOWED_PDF_TYPES = ['application/pdf'];
  private readonly BUCKET_NAME = 'ask-expert-media';

  constructor() {
    this.initializeSupabase();
  }

  /**
   * Initialize Supabase client
   */
  private initializeSupabase(): void {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Upload image file
   */
  async uploadImage(file: File, userId: string): Promise<MediaFile> {
    // Validate file
    this.validateFile(file, this.ALLOWED_IMAGE_TYPES);

    // Compress image if needed
    const optimizedFile = await this.optimizeImage(file);

    // Upload to Supabase Storage
    const fileId = `${userId}/${Date.now()}-${file.name}`;
    const { data, error } = await this.supabase!
      .storage
      .from(this.BUCKET_NAME)
      .upload(fileId, optimizedFile);

    if (error) throw new Error(`Upload failed: ${error.message}`);

    // Get public URL
    const { data: urlData } = this.supabase!
      .storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(fileId);

    // Generate thumbnail
    const thumbnailUrl = await this.generateThumbnail(urlData.publicUrl);

    return {
      id: fileId,
      type: 'image',
      name: file.name,
      size: optimizedFile.size,
      url: urlData.publicUrl,
      thumbnailUrl,
      uploadedAt: new Date(),
    };
  }

  /**
   * Upload PDF document
   */
  async uploadPDF(file: File, userId: string): Promise<MediaFile> {
    // Validate file
    this.validateFile(file, this.ALLOWED_PDF_TYPES);

    // Upload to Supabase Storage
    const fileId = `${userId}/${Date.now()}-${file.name}`;
    const { data, error } = await this.supabase!
      .storage
      .from(this.BUCKET_NAME)
      .upload(fileId, file);

    if (error) throw new Error(`Upload failed: ${error.message}`);

    // Get public URL
    const { data: urlData } = this.supabase!
      .storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(fileId);

    // Parse PDF metadata
    const metadata = await this.parsePDFMetadata(file);

    return {
      id: fileId,
      type: 'pdf',
      name: file.name,
      size: file.size,
      url: urlData.publicUrl,
      metadata,
      uploadedAt: new Date(),
    };
  }

  /**
   * Analyze image using GPT-4 Vision
   */
  async analyzeImage(imageUrl: string): Promise<ImageAnalysisResult> {
    try {
      const response = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Image analysis failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Image analysis error:', error);
      throw error;
    }
  }

  /**
   * Parse PDF document
   */
  async parsePDF(pdfUrl: string): Promise<PDFParseResult> {
    try {
      const response = await fetch('/api/pdf/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfUrl }),
      });

      if (!response.ok) {
        throw new Error('PDF parsing failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw error;
    }
  }

  /**
   * Generate chart from data
   */
  async generateChart(config: ChartConfig): Promise<MediaFile> {
    try {
      const response = await fetch('/api/charts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Chart generation failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      return {
        id: `chart-${Date.now()}`,
        type: 'chart',
        name: `${config.type}-chart.png`,
        size: blob.size,
        url,
        metadata: { chartConfig: config },
        uploadedAt: new Date(),
      };
    } catch (error) {
      console.error('Chart generation error:', error);
      throw error;
    }
  }

  /**
   * Delete media file
   */
  async deleteFile(fileId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase not initialized');

    const { error } = await this.supabase
      .storage
      .from(this.BUCKET_NAME)
      .remove([fileId]);

    if (error) throw new Error(`Delete failed: ${error.message}`);
  }

  /**
   * Get file URL
   */
  getFileUrl(fileId: string): string {
    if (!this.supabase) throw new Error('Supabase not initialized');

    const { data } = this.supabase
      .storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(fileId);

    return data.publicUrl;
  }

  /**
   * Validate file
   */
  private validateFile(file: File, allowedTypes: string[]): void {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
  }

  /**
   * Optimize image for web
   */
  private async optimizeImage(file: File): Promise<File> {
    if (typeof document === 'undefined') {
      // Skip optimization when DOM APIs are not available (e.g., during SSR)
      return file;
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate new dimensions (max 1920x1920)
          const maxSize = 1920;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const optimizedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(optimizedFile);
              } else {
                reject(new Error('Image optimization failed'));
              }
            },
            'image/jpeg',
            0.85 // 85% quality
          );
        };

        img.onerror = () => reject(new Error('Image loading failed'));
      };

      reader.onerror = () => reject(new Error('File reading failed'));
    });
  }

  /**
   * Generate thumbnail for image
   */
  private async generateThumbnail(imageUrl: string): Promise<string> {
    if (typeof document === 'undefined') {
      // Thumbnails rely on DOM APIs; skip in non-browser environments
      return imageUrl;
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 200x200 thumbnail
        const size = 200;
        canvas.width = size;
        canvas.height = size;

        // Draw scaled image
        const scale = Math.max(size / img.width, size / img.height);
        const x = (size - img.width * scale) / 2;
        const y = (size - img.height * scale) / 2;

        ctx?.drawImage(img, x, y, img.width * scale, img.height * scale);

        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      img.onerror = () => reject(new Error('Thumbnail generation failed'));
    });
  }

  /**
   * Parse PDF metadata
   */
  private async parsePDFMetadata(file: File): Promise<Record<string, any>> {
    // This is a placeholder - actual implementation would use pdf.js
    return {
      title: file.name.replace('.pdf', ''),
      size: file.size,
      type: file.type,
    };
  }

  /**
   * Get supported file types
   */
  getSupportedTypes(): { images: string[]; documents: string[] } {
    return {
      images: this.ALLOWED_IMAGE_TYPES,
      documents: this.ALLOWED_PDF_TYPES,
    };
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

// Singleton instance
export const richMediaService = new RichMediaService();

// Hook for React components
export function useRichMediaService() {
  return richMediaService;
}

// Media file type icons
export const MEDIA_TYPE_ICONS = {
  image: '🖼️',
  pdf: '📄',
  document: '📝',
  chart: '📊',
} as const;

// Media file type colors
export const MEDIA_TYPE_COLORS = {
  image: 'bg-violet-100 text-violet-700',
  pdf: 'bg-red-100 text-red-700',
  document: 'bg-green-100 text-green-700',
  chart: 'bg-purple-100 text-purple-700',
} as const;
