/**
 * useDocumentGeneration Hook
 *
 * React hook for generating documents from conversations
 */

import { useState, useCallback } from 'react';
import { logger } from '@vital/utils';

export interface GeneratedDocument {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  metadata: {
    title: string;
    wordCount: number;
    pages: number;
    format: string;
    generatedAt: string;
  };
  content?: string;
}

export interface DocumentGenerationState {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
  error: string | null;
  document: GeneratedDocument | null;
}

export function useDocumentGeneration() {
  const [state, setState] = useState<DocumentGenerationState>({
    isGenerating: false,
    progress: 0,
    currentStep: '',
    error: null,
    document: null,
  });

  /**
   * Generate document
   */
  const generateDocument = useCallback(async (
    conversationId: string,
    templateId: string,
    format: 'pdf' | 'docx' | 'xlsx' | 'md',
    userId: string,
    customPrompt?: string
  ) => {
    setState({
      isGenerating: true,
      progress: 0,
      currentStep: 'Analyzing conversation...',
      error: null,
      document: null,
    });

    try {
      // Simulate progress steps
      const steps = [
        { progress: 25, step: 'Analyzing conversation context...' },
        { progress: 50, step: 'Extracting key points...' },
        { progress: 75, step: 'Formatting document...' },
        { progress: 95, step: 'Finalizing...' },
      ];

      for (const { progress, step } of steps) {
        setState(prev => ({ ...prev, progress, currentStep: step }));
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Call API
      const response = await fetch('/api/ask-expert/generate-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          templateId,
          format,
          userId,
          customPrompt,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate document');
      }

      const document: GeneratedDocument = await response.json();

      setState({
        isGenerating: false,
        progress: 100,
        currentStep: 'Complete!',
        error: null,
        document,
      });

      return document;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        isGenerating: false,
        progress: 0,
        currentStep: '',
        error: errorMessage,
        document: null,
      });
      throw error;
    }
  }, []);

  /**
   * Download document
   */
  const downloadDocument = useCallback((document: GeneratedDocument) => {
    if (!document.content) {
      logger.error('Document generation: no content available');
      return;
    }

    // Create blob and download
    const blob = new Blob([document.content], { type: document.mimeType });
    const url = URL.createObjectURL(blob);
    if (typeof window === 'undefined' || typeof window.document === 'undefined') {
      logger.warn('Document download only available in browser environment');
      return;
    }
    const a = window.document.createElement('a');
    a.href = url;
    a.download = document.filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      progress: 0,
      currentStep: '',
      error: null,
      document: null,
    });
  }, []);

  return {
    state,
    generateDocument,
    downloadDocument,
    reset,
  };
}
