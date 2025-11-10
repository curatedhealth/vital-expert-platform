'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Copy, Check, ThumbsUp, ThumbsDown, RefreshCw, Edit,
  ExternalLink, ChevronDown, ChevronUp,
  Sparkles, BookOpen, AlertCircle, Bookmark, Share2, Wrench, GitBranch,
  Loader2, CheckCircle, Circle, Zap
} from 'lucide-react';
import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useId,
} from 'react';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent } from '@vital/ui';
import { AgentAvatar } from '@vital/ui';
import { Avatar, AvatarFallback } from '@vital/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@vital/ui';
import { cn } from '@/lib/utils';
import { Response as AIResponse } from '@/components/ai/response';
import {
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ui/shadcn-io/ai/source';
import {
  Branch,
  BranchMessages,
  BranchSelector,
  BranchPrevious,
  BranchNext,
  BranchPage,
} from '@/components/ui/shadcn-io/ai/branch';
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselControls,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselItem,
  InlineCitationText,
  InlineCitationQuote,
  InlineCitationSource,
} from '@/components/ai/inline-citation';
import { AIReasoning } from '@vital/ai-components';
import type { ReasoningStep as SharedReasoningStep, ModelReasoningPart } from '@vital/ai-components';
import type { Components } from 'react-markdown';
import type { PluggableList } from 'unified';
import { SourceSkeleton, CompactSourceSkeleton } from './SourceSkeleton';

interface Source {
  number?: number;
  id: string;
  title: string;
  description?: string;
  excerpt?: string;
  quote?: string;
  similarity?: number;
  domain?: string;
  url?: string;
  metadata?: Record<string, any>;
  evidenceLevel?: 'A' | 'B' | 'C' | 'D'; // A=high quality, B=good, C=moderate, D=low
  sourceType?: 'fda_guidance' | 'clinical_trial' | 'research_paper' | 'regulatory_filing' | 'company_document' | 'other';
  organization?: string;
  reliabilityScore?: number; // 0-1
  lastUpdated?: Date | string;
  author?: string; // ✅ NEW: For Chicago citations
  publicationDate?: Date | string; // ✅ NEW: For Chicago citations
}

interface Citation {
  number: number | string;
  id?: string;
  title?: string;
  url?: string;
  description?: string;
  quote?: string;
  text?: string;
  sourceId?: string;
  sources?: Source[];
  [key: string]: any;
}

interface MessageBranch {
  id: string;
  content: string;
  confidence: number;
  citations?: Citation[];
  sources?: Source[];
  createdAt: Date;
  reasoning?: string;
}

interface MessageMetadata {
  sources?: Source[];
  citations?: Citation[];
  ragSummary?: {
    totalSources: number;
    strategy?: string;
    domains?: string[];
    cacheHit?: boolean;
    warning?: string;
    retrievalTimeMs?: number;
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
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  confidence?: number;
  reasoning?: string[];
  artifacts?: any[];
  // ✅ NEW: LangGraph streaming data
  workflowSteps?: any[];
  reasoningSteps?: Array<SharedReasoningStep | string | Record<string, any>>;
  streamingMetrics?: any;
  modelReasoningParts?: ModelReasoningPart[];
}

interface EnhancedMessageDisplayProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date | string | number | null;
  metadata?: MessageMetadata;
  agentName?: string;
  agentAvatar?: string;
  userName?: string; // User's actual name
  userEmail?: string; // User's email for fallback
  isStreaming?: boolean;
  branches?: MessageBranch[];
  currentBranch?: number;
  onBranchChange?: (branchIndex: number) => void;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onFeedback?: (type: 'positive' | 'negative') => void;
  onEdit?: () => void;
  className?: string;
  allowRegenerate?: boolean;
}

function createInlineCitationRemarkPlugin(citationMap: Map<number, Source[]>) {
  return function inlineCitations() {
    return function transformer(tree: any) {
      transformNode(tree);
    };
  };

  function transformNode(node: any) {
    if (!node || !Array.isArray(node.children)) {
      return;
    }

    if (['link', 'code', 'inlineCode', 'image'].includes(node.type)) {
      return;
    }

    const transformed: any[] = [];

    node.children.forEach((child: any) => {
      if (child?.type === 'citation') {
        transformed.push(child);
        return;
      }

      if (child?.type === 'text' && typeof child.value === 'string') {
        const value = child.value;
        const regex = /\[(\d+(?:\s*,\s*\d+)*)\]/g;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(value)) !== null) {
          const preceding = value.slice(lastIndex, match.index);
          if (preceding) {
            transformed.push({ type: 'text', value: preceding });
          }

          const numbers = match[1]
            .split(',')
            .map((part) => parseInt(part.trim(), 10))
            .filter((num) => Number.isFinite(num));

          const needsLeadingSpace = (() => {
            if (transformed.length === 0) {
              return true;
            }
            const last = transformed[transformed.length - 1];
            return last.type !== 'text' || !/\s$/.test(last.value as string);
          })();

          if (needsLeadingSpace) {
            if (
              transformed.length > 0 &&
              transformed[transformed.length - 1].type === 'text'
            ) {
              transformed[transformed.length - 1].value += ' ';
            } else {
              transformed.push({ type: 'text', value: ' ' });
            }
          }

          numbers.forEach((number, idx) => {
            const sources = citationMap.get(number) ?? [];

            // ✅ FIX: ALWAYS create citation node, even if sources are empty
            // The citation component will handle fetching sources from metadata
            console.log(`[RemarkPlugin] Creating citation node for [${number}] with ${sources.length} sources`);

            transformed.push({
              type: 'citation',
              data: {
                citationNumber: String(number),
                sources,
                hName: 'citation',
                hProperties: {
                  citationNumber: String(number),
                  sources,
                },
              },
              children: [],
            });

            if (idx < numbers.length - 1) {
              transformed.push({ type: 'text', value: ' ' });
            }
          });

          lastIndex = match.index + match[0].length;
        }

        const trailing = value.slice(lastIndex);
        if (trailing) {
          transformed.push({ type: 'text', value: trailing });
        }
      } else {
        transformNode(child);
        transformed.push(child);
      }
    });

    node.children = transformed;
  }
}

function deriveSourceTag(source: Source | undefined): string | null {
  if (!source) {
    return null;
  }

  const domain = source.domain || source.metadata?.domain;
  const organization = source.organization || source.metadata?.organization;
  const collection = source.metadata?.collection || source.metadata?.dataset;
  const provider = source.metadata?.provider || source.metadata?.sourceName;

  const normalize = (value: string) =>
    value
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();

  if (collection && /digital\s*health/i.test(collection)) {
    return 'Digital Health';
  }

  if (provider) {
    if (/digital\s*health/i.test(provider)) {
      return 'Digital Health';
    }
    return normalize(provider);
  }

  if (domain) {
    if (/digital\s*health/i.test(domain)) {
      return 'Digital Health';
    }
    return normalize(domain);
  }

  if (organization) {
    return normalize(organization);
  }

  if (source.url) {
    try {
      const hostname = new URL(source.url).hostname.replace(/^www\./, '');
      if (hostname) {
        return normalize(hostname.split('.')[0]);
      }
    } catch {
      // ignore
    }
  }

  if (source.sourceType) {
    return normalize(source.sourceType);
  }

  return null;
}

function getSourceTypePresentation(
  sourceType: Source['sourceType']
): { icon: string; label: string } | null {
  if (!sourceType) {
    return null;
  }

  const mapping: Record<NonNullable<Source['sourceType']>, { icon: string; label: string }> = {
    fda_guidance: { icon: '🏛️', label: 'FDA guidance' },
    clinical_trial: { icon: '🔬', label: 'Clinical trial' },
    research_paper: { icon: '📄', label: 'Research paper' },
    regulatory_filing: { icon: '⚖️', label: 'Regulation' },
    company_document: { icon: '📁', label: 'Company document' },
    other: { icon: '📋', label: 'Guideline' },
  };

  const normalized = sourceType in mapping ? mapping[sourceType] : null;
  if (normalized) {
    return normalized;
  }

  const readable = sourceType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return { icon: '📚', label: readable };
}

/**
 * ✅ Clean Chicago-style citation as JSX
 * Format: [Number] Organization. "Title." Domain, Year. URL
 */
function ChicagoCitationJSX({ source, index }: { source: Source; index: number }) {
  return (
    <div className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
      {/* Author/Organization */}
      {(source.organization || source.author) && (
        <span className="font-semibold">
          {source.organization || source.author}
        </span>
      )}
      
      {/* Title (as clickable link if URL available) */}
      {source.title && (
        <>
          {(source.organization || source.author) && '. '}
          {source.url ? (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              &ldquo;{source.title}&rdquo;
            </a>
          ) : (
            <span>&ldquo;{source.title}&rdquo;</span>
          )}
        </>
      )}
      
      {/* Domain */}
      {source.domain && (
        <>
          {'. '}
          <span className="italic text-gray-600 dark:text-gray-400">
            {source.domain}
          </span>
        </>
      )}
      
      {/* Publication Date */}
      {source.publicationDate && (() => {
        const date = new Date(source.publicationDate);
        const year = date.getFullYear();
        if (!isNaN(year)) {
          return (
            <span className="text-gray-600 dark:text-gray-400">
              , {year}
            </span>
          );
        }
        return null;
      })()}
      
      {'.'}
    </div>
  );
}

export function EnhancedMessageDisplay({
  id,
  role,
  content,
  timestamp,
  metadata,
  agentName,
  agentAvatar,
  userName,
  userEmail,
  isStreaming = false,
  branches,
  currentBranch = 0,
  onBranchChange,
  onCopy,
  onRegenerate,
  onFeedback,
  onEdit,
  className,
  allowRegenerate = true,
}: EnhancedMessageDisplayProps) {
  // Debug logging for Mode 3 (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && role === 'assistant') {
      console.log(`[EnhancedMessageDisplay] Rendering ${id}:`, {
        hasMetadata: !!metadata,
        hasSources: metadata?.sources?.length || 0,
        isStreaming,
      });
    }
  }, [id, role, metadata, isStreaming]);
  const [copied, setCopied] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [activeBranch, setActiveBranch] = useState(currentBranch);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const messageRef = useRef<HTMLDivElement>(null);
  const sourceRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isUser = role === 'user';
  const prefersReducedMotion = useReducedMotion();
  const branchDescriptorId = useId();

  // Metadata validation (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !isUser && metadata) {
      // Lightweight metadata check
      const hasData = !!(metadata.reasoning?.length || metadata.workflowSteps?.length);
      if (!hasData && !isStreaming) {
        console.warn('[EnhancedMessageDisplay] No reasoning/workflow data');
      }
    }
  }, [metadata, isUser, isStreaming]);

  const resolvedAgentName = useMemo(() => {
    if (isUser) {
      // Use actual user name if provided, otherwise extract from email or fallback to "You"
      if (userName) {
        return userName;
      }
      if (userEmail) {
        // Extract name from email (e.g., "john.doe@example.com" → "John Doe")
        const emailName = userEmail.split('@')[0];
        return emailName.split('.').map(part => 
          part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        ).join(' ');
      }
      return 'You';
    }
    if (!agentName) {
      return 'AI Assistant';
    }
    if (/\s/.test(agentName)) {
      return agentName.trim();
    }
    const cleaned = agentName.replace(/[_-]+/g, ' ').trim();
    return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
  }, [agentName, isUser, userName, userEmail]);

  // Get active branch content or fallback to main content
  const displayContent = branches && branches[activeBranch] 
    ? branches[activeBranch].content 
    : content;

  useEffect(() => {
    setActiveBranch(currentBranch);
  }, [currentBranch]);

  const handleBranchChange = useCallback((index: number) => {
    setActiveBranch(index);
    onBranchChange?.(index);
  }, [onBranchChange]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(displayContent);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  }, [displayContent, onCopy]);

  const handleFeedback = useCallback((type: 'positive' | 'negative') => {
    setFeedback(type);
    onFeedback?.(type);
  }, [onFeedback]);

  const handleFavoriteToggle = useCallback(() => {
    setIsFavorite((prev) => !prev);
  }, []);

  const handleShare = useCallback(async () => {
    if (!displayContent) {
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: resolvedAgentName || 'VITAL Expert Response',
          text: displayContent,
        });
      } else {
        await navigator.clipboard.writeText(displayContent);
      }
      setShareStatus('success');
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch (error) {
      console.error('[EnhancedMessageDisplay] Share failed:', error);
      setShareStatus('error');
      setTimeout(() => setShareStatus('idle'), 2500);
    }
  }, [displayContent, resolvedAgentName]);

  const normalizedTimestamp = useMemo(() => {
    if (!timestamp) {
      return undefined;
    }

    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }, [timestamp]);

  const formatTimestamp = useCallback((date?: Date) => {
    if (!date) {
      return '--:--';
    }

    try {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  }, []);

  // ✅ TAG: KEY_INSIGHTS_EXTRACTION - Extract actionable insights, not summaries
  const keyInsights = useMemo(() => {
    if (isUser || !displayContent || displayContent.length < 50) {
      return [];
    }
    
    // Remove code blocks, diagrams, and citations for clean text analysis
    let textOnly = displayContent
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/\[\d+(?:,\s*\d+)*\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const insights: string[] = [];
    
    // Look for bullet points with asterisks (insights are often in lists)
    const bulletMatches = textOnly.match(/\*\*[^*]+\*\*[^*.]+[.]/g);
    if (bulletMatches && bulletMatches.length > 0) {
      insights.push(...bulletMatches.slice(0, 3));
    }
    
    // If no bullet insights found, look for sentences with insight markers
    if (insights.length === 0) {
      const insightKeywords = [
        'importantly', 'significantly', 'notably', 'crucially',
        'key finding', 'essential to', 'critical that', 'must consider',
        'should note', 'worth noting', 'remember that', 'keep in mind'
      ];
      
      const sentences = textOnly.split(/(?<=[.!?])\s+/).filter(Boolean);
      const insightSentences = sentences.filter((sentence) => {
        const lower = sentence.toLowerCase();
        return insightKeywords.some((keyword) => lower.includes(keyword)) &&
               sentence.length > 40 && // Avoid too-short sentences
               sentence.length < 200;  // Avoid too-long summaries
      });
      
      insights.push(...insightSentences.slice(0, 3));
    }
    
    return insights;
  }, [displayContent, isUser]);

  const activeBranchMeta = branches?.[activeBranch];
  const rawBranchReasoning = activeBranchMeta?.reasoning;
  const branchReasoningList = useMemo(() => {
    if (!rawBranchReasoning) {
      return [];
    }
    if (Array.isArray(rawBranchReasoning)) {
      return rawBranchReasoning
        .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
        .filter((entry) => entry.length > 0);
    }

    const hasLineBreaks = /\r?\n/.test(rawBranchReasoning);
    const segments = hasLineBreaks
      ? rawBranchReasoning.split(/\r?\n/)
      : rawBranchReasoning.split(/(?<=[.!?])\s+/);

    return segments.map((line) => line.trim()).filter((line) => line.length > 0);
  }, [rawBranchReasoning]);
  const branchDescriptionTargetId = branchReasoningList.length > 0 ? branchDescriptorId : undefined;

  const normalizedReasoningSteps = useMemo<SharedReasoningStep[]>(() => {
    const steps: SharedReasoningStep[] = [];

    if (Array.isArray(metadata?.reasoningSteps)) {
      metadata.reasoningSteps.forEach((step, idx) => {
        if (!step) {
          return;
        }
        if (typeof step === 'string') {
          if (step.trim().length > 0) {
            steps.push({
              id: `reasoning-step-${idx}`,
              type: 'thought',
              content: step,
            });
          }
          return;
        }

        const content = typeof (step as any)?.content === 'string'
          ? (step as any).content
          : typeof (step as any)?.text === 'string'
            ? (step as any).text
            : '';
        if (!content) {
          return;
        }

        steps.push({
          id: (step as any).id || `reasoning-step-${idx}`,
          type: (step as any).type || 'thought',
          content,
          confidence: (step as any).confidence,
          timestamp: (step as any).timestamp,
          metadata: (step as any).metadata,
          node: (step as any).node,
        });
      });
    }

    if (Array.isArray(metadata?.reasoning)) {
      metadata.reasoning.forEach((text, idx) => {
        if (text && text.trim().length > 0) {
          steps.push({
            id: `legacy-reasoning-${idx}`,
            type: 'thought',
            content: text,
          });
        }
      });
    }

    branchReasoningList.forEach((reason, idx) => {
      if (reason && reason.trim().length > 0) {
        steps.push({
          id: `branch-reasoning-${idx}`,
          type: 'observation',
          content: reason,
        });
      }
    });

    return steps;
  }, [metadata?.reasoningSteps, metadata?.reasoning, branchReasoningList]);

  const workflowStepsContent = useMemo(() => {
    if (!metadata?.workflowSteps || metadata.workflowSteps.length === 0) {
      return null;
    }

    const getStepIcon = (status: string) => {
      switch (status) {
        case 'completed':
          return <CheckCircle className="h-3 w-3 text-green-600" />;
        case 'running':
          return <Loader2 className="h-3 w-3 text-blue-600 animate-spin" />;
        case 'error':
          return <AlertCircle className="h-3 w-3 text-red-600" />;
        default:
          return <Circle className="h-3 w-3 text-gray-400" />;
      }
    };

    return (
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Workflow Progress
        </div>
        {metadata.workflowSteps.map((step: any, idx: number) => (
          <div
            key={step.id || idx}
            className="flex items-start gap-2 rounded-lg bg-white/90 p-2 text-xs dark:bg-gray-800/70"
          >
            {getStepIcon(step.status)}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">{step.title || `Step ${idx + 1}`}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {step.durationMs ? `${(step.durationMs / 1000).toFixed(1)}s` : step.status}
                </span>
              </div>
              {step.description && (
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              )}
              {step.metadata?.tool && (
                <p className="text-gray-500 dark:text-gray-400">
                  Tool: {step.metadata.tool} {step.metadata.toolElapsedMs ? `(${(step.metadata.toolElapsedMs / 1000).toFixed(1)}s)` : ''}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }, [metadata?.workflowSteps]);

  const streamingMetricsContent = useMemo(() => {
    if (!metadata?.streamingMetrics) {
      return null;
    }
    return (
      <div className="rounded-lg bg-white/90 p-2 dark:bg-gray-800/70">
        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Performance
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            <span>{metadata.streamingMetrics.tokensPerSecond} tokens/sec</span>
          </div>
          {metadata.streamingMetrics.elapsedTime && (
            <span>
              {(metadata.streamingMetrics.elapsedTime / 1000).toFixed(1)}s elapsed
            </span>
          )}
        </div>
      </div>
    );
  }, [metadata?.streamingMetrics]);

  const supplementalReasoningContent = useMemo(() => {
    if (!workflowStepsContent && !streamingMetricsContent) {
      return null;
    }
    return (
      <div className="space-y-3">
        {workflowStepsContent}
        {streamingMetricsContent}
      </div>
    );
  }, [workflowStepsContent, streamingMetricsContent]);

  const hasReasoningData =
    normalizedReasoningSteps.length > 0 ||
    (metadata?.workflowSteps?.length ?? 0) > 0 ||
    Boolean(metadata?.streamingMetrics) ||
    (metadata?.modelReasoningParts?.length ?? 0) > 0;

  useEffect(() => {
    if (hasReasoningData && !isStreaming) {
      console.log('🔓 [EnhancedMessageDisplay] Auto-expanding AI Reasoning:', {
        normalizedSteps: normalizedReasoningSteps.length,
        workflowStepsCount: metadata?.workflowSteps?.length || 0,
        streamingMetrics: !!metadata?.streamingMetrics,
        modelReasoningParts: metadata?.modelReasoningParts?.length || 0,
      });
      setShowReasoning(true);
    }
  }, [hasReasoningData, isStreaming, metadata?.workflowSteps, metadata?.streamingMetrics, metadata?.modelReasoningParts, normalizedReasoningSteps.length]);
  const showBranchSelector = !isUser && Array.isArray(branches) && branches.length > 1;
  const ragSummary = metadata?.ragSummary;
  const toolSummary = metadata?.toolSummary;
  const toolTotals = toolSummary?.totals ?? { calls: 0, success: 0, failure: 0, totalTimeMs: 0 };
  const toolUsed = toolSummary?.used ?? [];
  const hasToolUsage = !!toolSummary && (toolTotals.calls > 0 || toolUsed.length > 0);

  const scrollToSource = useCallback((sourceId: string) => {
    requestAnimationFrame(() => {
      const element = sourceRefs.current[sourceId];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-blue-400');
        setTimeout(() => element.classList.remove('ring-2', 'ring-blue-400'), 1200);
      }
    });
  }, []);

  // ⚡ OPTIMIZATION: Memoize sources array reference
  const citationSources = useMemo(() => metadata?.sources ?? [], [metadata?.sources]);

  // ⚡ OPTIMIZATION: Early return if no sources - skip expensive mapping
  const hasCitationSources = citationSources.length > 0;

  const citationNumberMap = useMemo(() => {
    // Early return for empty state
    if (!hasCitationSources) {
      return new Map<number, Source[]>();
    }

    const map = new Map<number, Source[]>();

    // Pre-populate with source numbers (1-indexed)
    citationSources.forEach((source, index) => {
      if (source) {
        map.set(index + 1, [source]);
      }
    });

    // Only process citations if they exist
    if (metadata?.citations?.length) {
      metadata.citations.forEach((citation) => {
        const numberValue =
          typeof citation.number === 'string'
            ? parseInt(citation.number, 10)
            : citation.number;
        const number = Number.isFinite(numberValue) ? Number(numberValue) : NaN;
        if (!Number.isFinite(number)) {
          return;
        }

        const bucket = map.get(number) ?? [];
        const addSource = (candidate?: Source) => {
          if (!candidate) {
            return;
          }
          // Quick duplicate check
          if (!bucket.some((existing) => existing?.id === candidate.id && existing?.url === candidate.url)) {
            bucket.push(candidate);
          }
        };

        if (citation.sourceId) {
          const resolvedById = citationSources.find((source) => source?.id === citation.sourceId);
          addSource(resolvedById);
        }

        if (Array.isArray(citation.sources)) {
          citation.sources.forEach(addSource);
        }

        // Fallback to sequential source list if nothing matched
        if (!bucket.length) {
          addSource(citationSources[number - 1]);
        }

        if (bucket.length) {
          map.set(number, bucket);
        }
      });
    }

    return map;
  }, [citationSources, hasCitationSources, metadata?.citations]);

  // ⚡ OPTIMIZATION: Remove useDeferredValue - causes stuttering during streaming
  const normalizedContent = useMemo(() => {
    if (!displayContent) {
      return displayContent;
    }

    let text = displayContent;

    // Normalize citation formats
    text = text.replace(/\[\s*Source\s+([\d,\s]+)\s*\]/gi, '[$1]');
    text = text.replace(/\((?:source|Source)\s+([\d,\s]+)\)/gi, '[$1]');
    text = text.replace(/Source\s+([\d,\s]+)/gi, '[$1]');

    // Clean up whitespace in citations
    text = text.replace(/\[\s+/g, '[').replace(/\s+\]/g, ']');

    // Debug: Log citations found in content
    const citationsFound = text.match(/\[\d+(?:\s*,\s*\d+)*\]/g);
    if (citationsFound && citationsFound.length > 0) {
      console.log('[EnhancedMessageDisplay] Citations found in content:', citationsFound);
    } else {
      console.log('[EnhancedMessageDisplay] No citations found in content');
    }

    return text;
  }, [displayContent]);

  const citationRemarkPlugins = useMemo<PluggableList | undefined>(() => {
    // ✅ FIX: Enable plugin even without sources - citations may arrive after content
    // The plugin will create nodes, and the component will resolve sources from metadata
    console.log('[EnhancedMessageDisplay] Citation remark plugin enabled');
    console.log('[EnhancedMessageDisplay] Sources available:', citationSources.length);
    console.log('[EnhancedMessageDisplay] Citation number map:', Array.from(citationNumberMap.entries()));
    return [createInlineCitationRemarkPlugin(citationNumberMap)];
  }, [citationNumberMap, citationSources]);

  const citationComponents = useMemo<Partial<Components>>(() => ({
    citation({ node }) {
      console.log('[EnhancedMessageDisplay] Citation component called!', node);
      const data = (node as any)?.data ?? {};
      const props = data.hProperties ?? data;
      const number = props.citationNumber as string | undefined;
      const sources: Source[] = Array.isArray(props.sources)
        ? props.sources
        : Array.isArray(data.sources)
          ? data.sources
          : [];
      console.log('[EnhancedMessageDisplay] Citation data:', { number, sourcesCount: sources.length, props });
      const primarySourceId: string | undefined = sources[0]?.id;
      const triggerLabel =
        sources
          .map((src) => deriveSourceTag(src))
          .find((value): value is string => typeof value === 'string' && value.trim().length > 0) ?? undefined;

      // ✅ FIX: If sources not embedded in citation, try to match from metadata sources by number
      let resolvedSources = sources;
      if (!sources.length && number && metadata?.sources) {
        const citationNum = parseInt(number, 10);
        if (!isNaN(citationNum) && citationNum > 0 && citationNum <= metadata.sources.length) {
          resolvedSources = [metadata.sources[citationNum - 1]];
        }
      }

      // ✅ TAG: INLINE_CITATION_PILL_STYLE - Show pill-style button even when source is missing
      if (!resolvedSources.length) {
        return (
          <Badge 
            variant="secondary"
            className="ml-1 rounded-full text-[11px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 cursor-default"
          >
            {number || '?'}
          </Badge>
        );
      }

      return (
        <InlineCitation>
          <InlineCitationText>{props.children}</InlineCitationText>
          <InlineCitationCard>
            <InlineCitationCardTrigger
              sources={resolvedSources.map((source) => source.url || '')}
              label={number || triggerLabel}
              onClick={() => {
                if (primarySourceId) {
                  scrollToSource(primarySourceId);
                }
              }}
            />
            <InlineCitationCardBody>
              <InlineCitationCarousel>
                <InlineCitationCarouselHeader>
                  <InlineCitationCarouselIndex />
                  <InlineCitationCarouselControls />
                </InlineCitationCarouselHeader>
                <InlineCitationCarouselContent>
                  {resolvedSources.map((source, idx) => (
                    <InlineCitationCarouselItem key={source.id || idx}>
                      <InlineCitationSource
                        title={source.title || `Source ${number || idx + 1}`}
                        url={source.url || '#'}
                        description={
                          source.description ||
                          source.excerpt ||
                          source.organization ||
                          source.domain ||
                          undefined
                        }
                        tag={deriveSourceTag(source)}
                      />
                      {(source.quote || source.excerpt) && (
                        <InlineCitationQuote>{source.quote || source.excerpt}</InlineCitationQuote>
                      )}
                    </InlineCitationCarouselItem>
                  ))}
                </InlineCitationCarouselContent>
              </InlineCitationCarousel>
            </InlineCitationCardBody>
          </InlineCitationCard>
        </InlineCitation>
      );
    },
  }), [scrollToSource, citationNumberMap, metadata]);

  useEffect(() => {
    setShareStatus('idle');
    setCopied(false);
  }, [id, activeBranch, displayContent]);

  const canShowRegenerate = !!onRegenerate && allowRegenerate && !isUser;
  const showFeedbackControls = !!onFeedback && !isUser;
  const showShare = !isUser;

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      className={cn(
        "group relative",
        isUser ? "flex justify-end" : "flex justify-start",
        className
      )}
    >
      <div
        className={cn(
          "max-w-5xl rounded-2xl px-5 py-4 transition-colors",
          isUser
            ? "bg-white text-gray-900 shadow-none"
            : "bg-white text-gray-900 shadow-sm"
        )}
      >
        {/* Message Header */}
        <div className="flex items-start gap-3 mb-2">
          <div className="mt-0.5">
            {isUser ? (
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            ) : (
              <AgentAvatar
                avatar={agentAvatar}
                name={resolvedAgentName}
                size="list"
                className="rounded-full"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isUser ? "text-gray-900" : "text-gray-900"
                  )}
                >
                  {resolvedAgentName}
                </span>
                {!isUser && metadata?.confidence && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(metadata.confidence * 100)}% confident
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>AI confidence in this response</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {formatTimestamp(normalizedTimestamp)}
              </span>
            </div>

            {!isUser && hasReasoningData && (
              <AIReasoning
                reasoningSteps={normalizedReasoningSteps}
                modelReasoningParts={metadata?.modelReasoningParts}
                isStreaming={isStreaming}
                defaultOpen
                keepOpen
                open={showReasoning}
                onOpenChange={setShowReasoning}
                className="mt-3"
                supplementalContent={supplementalReasoningContent}
              />
            )}

            {/* Message Content */}
            <div ref={messageRef}>
              {isUser ? (
                <div className="whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">
                  {displayContent}
                </div>
              ) : (
                <>
                  {isStreaming && (
                    <span role="status" aria-live="polite" className="sr-only">
                      Assistant is typing
                    </span>
                  )}
                  <AIResponse
                    className={cn(
                      'prose prose-sm max-w-none dark:prose-invert leading-relaxed text-gray-800'
                    )}
                    remarkPlugins={citationRemarkPlugins}
                    components={citationComponents}
                    isStreaming={isStreaming}
                  >
                    {normalizedContent}
                  </AIResponse>
                </>
              )}

              {isStreaming && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="inline-block w-2 h-4 bg-current ml-1 animate-pulse rounded-sm"
                />
              )}
            </div>

            {/* Inline citations now rendered in-line; no separate block required */}

            {showBranchSelector && branches && (
              <Branch
                className="mt-3"
                currentBranch={activeBranch}
                totalBranches={branches.length}
                onBranchChange={handleBranchChange}
              >
                <BranchMessages className="hidden">
                  {branches.map((branch) => (
                    <span key={branch.id} />
                  ))}
                </BranchMessages>
                <BranchSelector
                  from="assistant"
                  aria-label="Alternate response selector"
                  aria-describedby={branchDescriptionTargetId}
                  className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2 text-xs text-muted-foreground dark:border-gray-700 dark:bg-gray-900/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-3.5 w-3.5 text-blue-500 dark:text-blue-300" />
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        Alternate responses
                      </span>
                      <BranchPage className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800/60 dark:text-gray-200" />
                    </div>
                    <div className="flex items-center gap-1">
                      <BranchPrevious
                        aria-label="View previous alternate response"
                        className="h-7 w-7 rounded-full border border-gray-200 bg-white p-0 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                      />
                      <BranchNext
                        aria-label="View next alternate response"
                        className="h-7 w-7 rounded-full border border-gray-200 bg-white p-0 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                      />
                    </div>
                  </div>
                  {(activeBranchMeta?.confidence !== undefined || activeBranchMeta?.createdAt) && (
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-600 dark:text-gray-300">
                      {activeBranchMeta?.confidence !== undefined && (
                        <span>
                          Confidence {Math.round(activeBranchMeta.confidence * 100)}%
                        </span>
                      )}
                      {activeBranchMeta?.createdAt && (
                        <span>
                          Generated {new Date(activeBranchMeta.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  )}
                  {branchReasoningList.length > 0 && (
                    <div
                      id={branchDescriptorId}
                      className="rounded-lg bg-white px-3 py-2 text-[11px] text-gray-600 dark:bg-gray-800/60 dark:text-gray-200"
                    >
                      <p className="mb-1 font-medium text-gray-700 dark:text-gray-100">
                        How this branch differs
                      </p>
                      <ul className="space-y-1" role="list">
                        {branchReasoningList.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2" role="listitem">
                            <span
                              aria-hidden="true"
                              className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400 dark:bg-blue-300"
                            />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </BranchSelector>
              </Branch>
            )}

            {/* ⚡ KNOWLEDGE VIEW: Sources with skeleton loading */}
            {!isUser && ragSummary && (
              <>
                {/* Show skeleton while streaming and no sources yet */}
                {isStreaming && (!metadata?.sources || metadata.sources.length === 0) && (
                  <SourceSkeleton count={ragSummary.totalSources || 3} />
                )}

                {/* Show sources once available (with progressive rendering during streaming) */}
                {metadata?.sources && metadata.sources.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 space-y-3"
                  >
                    {/* ✅ TAG: CHICAGO_STYLE_REFERENCES - Clean reference list */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <BookOpen className="h-4 w-4" />
                      <span>References ({metadata.sources.length})</span>
                      {isStreaming && (
                        <span className="text-[10px] text-muted-foreground font-normal">
                          Loading...
                        </span>
                      )}
                    </div>

                    {/* Sources list with staggered animation */}
                    <div className="space-y-3">
                      {metadata.sources.map((source, idx) => {
                        const sourceTypePresentation = getSourceTypePresentation(source.sourceType);
                        return (
                          <motion.div
                            key={`ref-${idx}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: idx * 0.05 }}
                            ref={(el) => {
                              if (el) {
                                sourceRefs.current[`ref-${idx}`] = el;
                              } else {
                                delete sourceRefs.current[`ref-${idx}`];
                              }
                            }}
                            className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 dark:border-gray-800"
                          >
                            {/* Number badge - Clean style without brackets */}
                            <Badge
                              variant="outline"
                              className="shrink-0 h-5 min-w-[24px] text-[10px] font-semibold mt-0.5 rounded-full"
                            >
                              {idx + 1}
                            </Badge>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              {/* Chicago Citation as JSX */}
                              <ChicagoCitationJSX source={source} index={idx} />

                              {/* Badges */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                {sourceTypePresentation && (
                                  <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                                    {sourceTypePresentation.label}
                                  </Badge>
                                )}
                                {typeof source.similarity === 'number' && source.similarity > 0 && (
                                  <Badge variant="secondary" className="text-[10px]">
                                    {Math.round(source.similarity * 100)}% match
                                  </Badge>
                                )}
                              </div>

                              {/* Excerpt (optional) */}
                              {source.excerpt && (
                                <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                                  {source.excerpt}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {!isUser && hasToolUsage && toolSummary && (
              <div className="mt-3 space-y-2 rounded-xl border border-purple-200/60 bg-purple-50/40 p-3 text-xs dark:border-purple-900/60 dark:bg-purple-900/20">
                <div className="flex flex-wrap items-center gap-2 text-purple-700 dark:text-purple-200">
                  <Wrench className="h-3 w-3 flex-shrink-0" />
                  <span className="font-medium">Tool usage</span>
                  <span className="text-[11px] text-purple-600/80 dark:text-purple-200/80">
                    {toolTotals.calls} call{toolTotals.calls === 1 ? '' : 's'} • {toolTotals.success} success / {toolTotals.failure} fail
                    {toolTotals.totalTimeMs ? ` • ${Math.round(toolTotals.totalTimeMs)} ms` : ''}
                  </span>
                </div>
                {toolUsed.length > 0 ? (
                  <div className="flex flex-wrap gap-1 text-[11px] text-purple-700/80 dark:text-purple-200/80">
                    {toolUsed.map((toolName) => (
                      <span
                        key={toolName}
                        className="rounded-full border border-purple-200 bg-white px-2 py-0.5 dark:border-purple-800/60 dark:bg-purple-900/50"
                      >
                        {toolName}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-purple-600/80 dark:text-purple-200/80">
                    Tools were invoked but no successful outputs were returned.
                  </div>
                )}
              </div>
            )}

            {/* Key Insights Callout - ✅ TAG: KEY_INSIGHTS_DISPLAY - Show ONLY after completion */}
            {!isUser && !isStreaming && keyInsights.length > 0 && (
              <motion.div
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3 dark:border-blue-900/40 dark:bg-blue-900/20"
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2">
                      Key Insights
                    </h4>
                    <div className="space-y-2">
                      {keyInsights.map((insight, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">•</span>
                          <AIResponse 
                            className="flex-1 text-xs text-blue-800 dark:text-blue-100 [&>p]:my-0 [&>p]:leading-relaxed prose-strong:text-blue-900 dark:prose-strong:text-blue-50"
                          >
                            {insight}
                          </AIResponse>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Token Usage */}
            {!isUser && metadata?.sources && metadata.sources.length > 0 && (
              <div className="mt-3 text-xs text-gray-500 flex gap-2">
                <span>Sources cited: {metadata.sources.length}</span>
                {metadata.citations && metadata.citations.length > 0 && (
                  <span>Inline citations: {metadata.citations.length}</span>
                )}
              </div>
            )}

            {!isUser && metadata?.tokenUsage && (
              <div className="mt-3 text-xs text-gray-500">
                Tokens: {metadata.tokenUsage.total.toLocaleString()}
                {' '}
                ({metadata.tokenUsage.prompt.toLocaleString()} prompt +{' '}
                {metadata.tokenUsage.completion.toLocaleString()} completion)
              </div>
            )}
          </div>
        </div>

        {/* Message Actions */}
        <div className={cn(
          "flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity",
          isUser ? "justify-end" : "justify-start"
        )}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className={cn(
                    "h-7 w-7 p-0",
                    isUser ? "text-blue-100 hover:text-white" : ""
                  )}
                  aria-label={copied ? 'Message copied' : 'Copy message'}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {copied ? (
                      <motion.span
                        key="copied"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                      >
                        <Check className="h-3 w-3 text-green-600" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                      >
                        <Copy className="h-3 w-3" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy message</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavoriteToggle}
                  className={cn(
                    "h-7 w-7 p-0",
                    isFavorite && "text-yellow-500"
                  )}
                  aria-pressed={isFavorite}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                >
                  <Bookmark className={cn(
                    "h-3 w-3",
                    isFavorite && "fill-yellow-500"
                  )} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFavorite ? 'Remove from favorites' : 'Save to favorites'}</TooltipContent>
            </Tooltip>

            {showShare && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="h-7 w-7 p-0"
                    aria-label={
                      shareStatus === 'success'
                        ? 'Response shared'
                        : shareStatus === 'error'
                          ? 'Share response failed'
                          : 'Share response'
                    }
                  >
                    {shareStatus === 'success' ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : shareStatus === 'error' ? (
                      <AlertCircle className="h-3 w-3 text-red-600" />
                    ) : (
                      <Share2 className="h-3 w-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {shareStatus === 'success'
                    ? 'Shared!'
                    : shareStatus === 'error'
                      ? 'Share failed'
                      : 'Share response'}
                </TooltipContent>
              </Tooltip>
            )}

            {canShowRegenerate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRegenerate}
                    className="h-7 w-7 p-0"
                    aria-label="Regenerate response"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Regenerate response</TooltipContent>
              </Tooltip>
            )}

            {showFeedbackControls && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback('positive')}
                      className={cn(
                        "h-7 w-7 p-0",
                        feedback === 'positive' && "text-green-600"
                      )}
                      aria-label="Mark response as helpful"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Helpful response</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback('negative')}
                      className={cn(
                        "h-7 w-7 p-0",
                        feedback === 'negative' && "text-red-600"
                      )}
                      aria-label="Mark response as not helpful"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Not helpful</TooltipContent>
                </Tooltip>
              </>
            )}

            {onEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEdit}
                    className={cn(
                      "h-7 w-7 p-0",
                      isUser ? "text-blue-100 hover:text-white" : ""
                    )}
                    aria-label="Edit message"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit message</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      </div>
    </motion.div>
  );
}

export { EnhancedMessageDisplay };
export default EnhancedMessageDisplay;
