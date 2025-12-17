'use client';

/**
 * VITAL Platform - Debate Network View
 *
 * Clean, minimal visualization of adversarial debates
 * with full text and proper formatting.
 */

import React, { useState } from 'react';
import { Button } from '@/lib/shared/components/ui/button';
import { cn } from '@/lib/shared/utils';
import {
  ThumbsUp,
  ThumbsDown,
  Scale,
  Users,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Target,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';

import type { ExpertInfo, ExpertResponse, ConsensusState } from '../hooks/panelStreamReducer';

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Clean markdown formatting from text for plain display
 */
function cleanMarkdown(text: string): string {
  if (!text) return '';

  return text
    // Remove bold markers (**text** or __text__)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    // Remove italic markers (*text* or _text_)
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Remove heading markers (# ## ### etc.)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove inline code (`code`)
    .replace(/`([^`]+)`/g, '$1')
    // Remove code blocks (```code```)
    .replace(/```[\s\S]*?```/g, '')
    // Remove bullet points at start of lines (- or *)
    .replace(/^[\s]*[-*]\s+/gm, '')
    // Remove numbered lists (1. 2. etc.)
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Remove blockquotes (>)
    .replace(/^>\s*/gm, '')
    // Remove horizontal rules (--- or ***)
    .replace(/^[-*]{3,}$/gm, '')
    // Remove links but keep text [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// =============================================================================
// TYPES
// =============================================================================

interface DebateNetworkViewProps {
  experts: ExpertInfo[];
  roundResponses: ExpertResponse[][];
  consensus: ConsensusState | null;
  currentRound: number;
  maxRounds: number;
  panelType: string;
  goal: string;
  className?: string;
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function QuestionHeader({ goal }: { goal: string }) {
  const cleanedGoal = cleanMarkdown(goal);

  return (
    <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-indigo-200 bg-indigo-100/50 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center">
          <Target className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="font-medium text-sm text-indigo-900">Discussion Topic</span>
      </div>
      <div className="p-4">
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{cleanedGoal}</p>
      </div>
    </div>
  );
}

function ExpertResponseCard({
  response,
  isExpanded,
  onToggle,
}: {
  response: ExpertResponse;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const isPro = response.position === 'pro';
  const isCon = response.position === 'con';

  const config = isPro
    ? {
        bg: 'bg-emerald-50/80',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        iconBg: 'bg-emerald-500',
        icon: ThumbsUp,
        label: 'PRO',
      }
    : isCon
    ? {
        bg: 'bg-rose-50/80',
        border: 'border-rose-200',
        text: 'text-rose-700',
        iconBg: 'bg-rose-500',
        icon: ThumbsDown,
        label: 'CON',
      }
    : {
        bg: 'bg-violet-50/80',
        border: 'border-violet-200',
        text: 'text-violet-700',
        iconBg: 'bg-violet-500',
        icon: Scale,
        label: 'MOD',
      };

  const Icon = config.icon;
  const cleanContent = cleanMarkdown(response.content);

  return (
    <div className={cn('rounded-lg border overflow-hidden', config.border, config.bg)}>
      {/* Header */}
      <button
        className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-black/5 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2.5">
          <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-white', config.iconBg)}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className={cn('text-sm font-medium', config.text)}>{response.expertName}</span>
              <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', config.iconBg, 'text-white')}>
                {config.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Round {response.round} • {Math.round(response.confidence * 100)}%
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      <div className="px-3 pb-3">
        {isExpanded ? (
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{cleanContent}</p>
        ) : (
          <p className="text-sm text-muted-foreground line-clamp-2">{cleanContent}</p>
        )}
      </div>
    </div>
  );
}

function RoundSection({
  roundNumber,
  proResponses,
  conResponses,
  moderatorResponses,
  expandedCards,
  onToggleCard,
}: {
  roundNumber: number;
  proResponses: ExpertResponse[];
  conResponses: ExpertResponse[];
  moderatorResponses: ExpertResponse[];
  expandedCards: Set<string>;
  onToggleCard: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      {/* Round Header */}
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-medium flex items-center justify-center">
          {roundNumber}
        </span>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {roundNumber === 1 ? 'Opening' : `Round ${roundNumber}`}
        </span>
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">
          {proResponses.length + conResponses.length + moderatorResponses.length} responses
        </span>
      </div>

      {/* Debate Grid - PRO vs CON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* PRO Side */}
        <div className="space-y-2">
          {proResponses.length > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">PRO</span>
              <div className="flex-1 h-px bg-emerald-200" />
            </div>
          )}
          {proResponses.map((response) => {
            const cardId = `${response.expertId}-${response.round}`;
            return (
              <ExpertResponseCard
                key={cardId}
                response={response}
                isExpanded={expandedCards.has(cardId)}
                onToggle={() => onToggleCard(cardId)}
              />
            );
          })}
        </div>

        {/* CON Side */}
        <div className="space-y-2">
          {conResponses.length > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <ThumbsDown className="h-3.5 w-3.5 text-rose-600" />
              <span className="text-xs font-medium text-rose-700">CON</span>
              <div className="flex-1 h-px bg-rose-200" />
            </div>
          )}
          {conResponses.map((response) => {
            const cardId = `${response.expertId}-${response.round}`;
            return (
              <ExpertResponseCard
                key={cardId}
                response={response}
                isExpanded={expandedCards.has(cardId)}
                onToggle={() => onToggleCard(cardId)}
              />
            );
          })}
        </div>
      </div>

      {/* Moderator Responses */}
      {moderatorResponses.length > 0 && (
        <div className="space-y-2 mt-2">
          <div className="flex items-center gap-2 mb-1">
            <Scale className="h-3.5 w-3.5 text-violet-600" />
            <span className="text-xs font-medium text-violet-700">Moderator</span>
            <div className="flex-1 h-px bg-violet-200" />
          </div>
          {moderatorResponses.map((response) => {
            const cardId = `${response.expertId}-${response.round}`;
            return (
              <ExpertResponseCard
                key={cardId}
                response={response}
                isExpanded={expandedCards.has(cardId)}
                onToggle={() => onToggleCard(cardId)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ConsensusSection({ consensus }: { consensus: ConsensusState }) {
  const levelConfig = {
    high: { color: 'bg-emerald-500', label: 'Strong' },
    medium: { color: 'bg-amber-500', label: 'Moderate' },
    low: { color: 'bg-rose-500', label: 'Weak' },
  };
  const config = levelConfig[consensus.consensusLevel];
  const scorePercent = Math.round(consensus.consensusScore * 100);

  const cleanedAgreementPoints = consensus.agreementPoints.map(cleanMarkdown).filter(p => p);
  const cleanedDivergentPoints = consensus.divergentPoints.map(cleanMarkdown).filter(p => p);
  const cleanedKeyThemes = consensus.keyThemes.map(cleanMarkdown).filter(t => t);
  const cleanedRecommendation = cleanMarkdown(consensus.recommendation || '');

  return (
    <div className="rounded-lg border bg-card">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Consensus</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full transition-all', config.color)} style={{ width: `${scorePercent}%` }} />
          </div>
          <span className="text-sm font-medium">{scorePercent}%</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Agreement Points */}
        {cleanedAgreementPoints.length > 0 && (
          <div>
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-2">Agreed</p>
            <ul className="space-y-1.5">
              {cleanedAgreementPoints.map((point, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2 text-foreground/80">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Divergent Points */}
        {cleanedDivergentPoints.length > 0 && (
          <div>
            <p className="text-xs font-medium text-rose-600 uppercase tracking-wide mb-2">Divergent</p>
            <ul className="space-y-1.5">
              {cleanedDivergentPoints.map((point, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2 text-foreground/80">
                  <XCircle className="h-3.5 w-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Key Themes */}
        {cleanedKeyThemes.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Themes</p>
            <div className="flex flex-wrap gap-1.5">
              {cleanedKeyThemes.map((theme, idx) => (
                <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation */}
        {cleanedRecommendation && (
          <div className="pt-3 border-t">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
              <ArrowRight className="h-3 w-3" />
              Recommendation
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed">{cleanedRecommendation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function DebateNetworkView({
  experts,
  roundResponses,
  consensus,
  currentRound,
  maxRounds,
  panelType,
  goal,
  className,
}: DebateNetworkViewProps) {
  // Track which cards are expanded
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (cardId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    roundResponses.forEach((round, roundIdx) => {
      round.forEach((response) => {
        allIds.add(`${response.expertId}-${response.round}`);
      });
    });
    setExpandedCards(allIds);
  };

  const collapseAll = () => {
    setExpandedCards(new Set());
  };

  // Empty state
  if (roundResponses.length === 0 || roundResponses.flat().length === 0) {
    return (
      <div className={cn('rounded-lg border border-dashed p-8 flex flex-col items-center justify-center text-muted-foreground', className)}>
        <Users className="h-8 w-8 mb-3" />
        <p className="font-medium text-sm mb-1">Waiting for Responses</p>
        <p className="text-xs">The debate will appear once experts begin responding.</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageCircle className="h-4 w-4" />
          <span>{roundResponses.flat().length} responses • {currentRound} round{currentRound !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={expandAll} className="h-7 text-xs">
            Expand All
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll} className="h-7 text-xs">
            Collapse All
          </Button>
        </div>
      </div>

      {/* Question */}
      <QuestionHeader goal={goal} />

      {/* Rounds */}
      <div className="space-y-6">
        {roundResponses.map((responses, roundIdx) => {
          if (responses.length === 0) return null;

          const roundNumber = roundIdx + 1;
          const proResponses = responses.filter((r) => r.position === 'pro');
          const conResponses = responses.filter((r) => r.position === 'con');
          const moderatorResponses = responses.filter(
            (r) => r.position === 'moderator' || !r.position
          );

          return (
            <RoundSection
              key={roundNumber}
              roundNumber={roundNumber}
              proResponses={proResponses}
              conResponses={conResponses}
              moderatorResponses={moderatorResponses}
              expandedCards={expandedCards}
              onToggleCard={toggleCard}
            />
          );
        })}
      </div>

      {/* Consensus */}
      {consensus && <ConsensusSection consensus={consensus} />}
    </div>
  );
}

export default DebateNetworkView;
