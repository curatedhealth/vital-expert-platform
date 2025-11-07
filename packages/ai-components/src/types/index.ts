/**
 * @vital/ai-components
 * 
 * TAG: SHARED_AI_TYPES
 * 
 * Shared TypeScript types for VITAL AI components
 * Used across all modes and services
 */

/**
 * Source citation with full metadata
 */
export interface Source {
  id: string;
  title: string;
  url?: string;
  domain?: string;
  organization?: string;
  author?: string;
  publicationDate?: Date | string;
  excerpt?: string;
  quote?: string;
  sourceType?: 'fda_guidance' | 'clinical_trial' | 'research_paper' | 'regulatory_filing' | 'company_document' | 'other';
  similarity?: number;
  metadata?: Record<string, any>;
  evidenceLevel?: 'A' | 'B' | 'C' | 'D';
  reliabilityScore?: number;
  lastUpdated?: Date | string;
}

/**
 * Reasoning step from AI
 */
export interface ReasoningStep {
  id?: string;
  type?: 'thought' | 'observation' | 'action' | 'conclusion';
  content: string;
  confidence?: number;
  timestamp?: Date | string;
}

/**
 * Message metadata
 */
export interface MessageMetadata {
  sources?: Source[];
  citations?: any[];
  reasoning?: string[];
  reasoningSteps?: ReasoningStep[];
  confidence?: number;
  toolsUsed?: string[];
  ragSummary?: {
    totalSources: number;
    domains: string[];
    cacheHit: boolean;
  };
  toolSummary?: {
    allowed: string[];
    used: string[];
    totals: {
      calls: number;
      success: number;
      failure: number;
      totalTimeMs: number;
    };
  };
}

/**
 * Component base props
 */
export interface ComponentBaseProps {
  className?: string;
}

/**
 * Key Insights props
 */
export interface KeyInsightsProps extends ComponentBaseProps {
  content: string;
  isStreaming?: boolean;
}

/**
 * References props
 */
export interface ReferencesProps extends ComponentBaseProps {
  sources: Source[];
  onSourceClick?: (sourceId: string) => void;
}

/**
 * Citation components props
 */
export interface InlineCitationProps extends ComponentBaseProps {
  number?: string | number;
  sources?: Source[];
  onClick?: () => void;
}

