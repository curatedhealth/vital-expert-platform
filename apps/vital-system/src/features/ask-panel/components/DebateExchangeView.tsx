'use client';

/**
 * VITAL Platform - Debate Exchange View Component
 *
 * Clean, minimal visualization of adversarial debate between
 * PRO, CON, and MODERATOR positions.
 */

import { useState } from 'react';
import {
  MessageSquare,
  ArrowLeft,
  Scale,
  ChevronDown,
  ChevronUp,
  Swords,
  Shield,
  Gavel,
  Loader2,
} from 'lucide-react';

import { cn } from '@/lib/shared/utils';

import type {
  PanelStreamState,
  ExpertResponse,
  ExpertInfo,
  DebateTurn,
} from '../hooks/panelStreamReducer';

// =============================================================================
// TYPES
// =============================================================================

interface DebateExchangeViewProps {
  state: PanelStreamState;
  className?: string;
}

interface ExpertAvatarProps {
  expert: ExpertInfo;
  position: 'pro' | 'con' | 'moderator';
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface TurnCardProps {
  response: ExpertResponse;
  expert?: ExpertInfo;
  position: 'pro' | 'con' | 'moderator';
  isActive?: boolean;
  respondingTo?: ExpertResponse | null;
}

// Position styling - cleaner color scheme
const POSITION_CONFIG = {
  pro: {
    label: 'PRO',
    icon: Shield,
    bg: 'bg-emerald-50/80',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    iconBg: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
    activeBg: 'bg-emerald-100',
  },
  con: {
    label: 'CON',
    icon: Swords,
    bg: 'bg-rose-50/80',
    border: 'border-rose-200',
    text: 'text-rose-700',
    iconBg: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-700',
    activeBg: 'bg-rose-100',
  },
  moderator: {
    label: 'MOD',
    icon: Gavel,
    bg: 'bg-violet-50/80',
    border: 'border-violet-200',
    text: 'text-violet-700',
    iconBg: 'bg-violet-500',
    badge: 'bg-violet-100 text-violet-700',
    activeBg: 'bg-violet-100',
  },
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function ExpertAvatar({ expert, position, isActive, size = 'md' }: ExpertAvatarProps) {
  const config = POSITION_CONFIG[position];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white transition-all',
        sizeClasses[size],
        config.iconBg,
        isActive && 'ring-2 ring-offset-2 ring-current animate-pulse'
      )}
      title={expert.name}
    >
      <Icon className={iconSizes[size]} />
    </div>
  );
}

function ActiveSpeakerIndicator({ turn }: { turn: DebateTurn }) {
  const config = POSITION_CONFIG[turn.position];
  const Icon = config.icon;

  return (
    <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full', config.badge)}>
      <Icon className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">{config.label} speaking</span>
      <Loader2 className="h-3 w-3 animate-spin" />
    </div>
  );
}

function TurnCard({ response, expert, position, isActive, respondingTo }: TurnCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const config = POSITION_CONFIG[position];

  return (
    <div className={cn('rounded-lg border overflow-hidden transition-all', config.border, config.bg, isActive && config.activeBg)}>
      {/* Header */}
      <button
        className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-black/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <ExpertAvatar
            expert={expert || { id: response.expertId, name: response.expertName }}
            position={position}
            isActive={isActive}
            size="sm"
          />
          <div className="text-left">
            <p className={cn('text-sm font-medium', config.text)}>{response.expertName}</p>
            <p className="text-xs text-muted-foreground">
              Round {response.round}
              {response.isRebuttal && ' • Rebuttal'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{Math.round(response.confidence * 100)}%</span>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-0">
          {respondingTo && (
            <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowLeft className="h-3 w-3" />
              <span>Replying to {respondingTo.expertName}</span>
            </div>
          )}
          <p className="text-sm text-foreground/90 leading-relaxed">{response.content}</p>
        </div>
      )}
    </div>
  );
}

function RoundExchange({
  round,
  proArgument,
  conRebuttal,
  moderatorSynthesis,
  proExperts,
  conExperts,
  moderatorExperts,
  currentTurn,
}: {
  round: number;
  proArgument: ExpertResponse | null;
  conRebuttal: ExpertResponse | null;
  moderatorSynthesis: ExpertResponse | null;
  proExperts: ExpertInfo[];
  conExperts: ExpertInfo[];
  moderatorExperts: ExpertInfo[];
  currentTurn: DebateTurn | null;
}) {
  const isProActive = currentTurn?.position === 'pro' && currentTurn.round === round;
  const isConActive = currentTurn?.position === 'con' && currentTurn.round === round;
  const isModActive = currentTurn?.position === 'moderator' && currentTurn.round === round;

  return (
    <div className="space-y-3">
      {/* Round Header */}
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-medium flex items-center justify-center">
          {round}
        </span>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {round === 1 ? 'Opening' : `Round ${round}`}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* PRO → CON Exchange */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* PRO Side */}
        <div>
          {proArgument ? (
            <TurnCard
              response={proArgument}
              expert={proExperts.find((e) => e.id === proArgument.expertId)}
              position="pro"
              isActive={isProActive}
            />
          ) : isProActive ? (
            <div className="rounded-lg border border-dashed border-emerald-300 bg-emerald-50/50 p-6 flex flex-col items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-500 mb-2" />
              <span className="text-xs text-emerald-600">PRO formulating...</span>
            </div>
          ) : null}
        </div>

        {/* CON Side */}
        <div>
          {conRebuttal ? (
            <TurnCard
              response={conRebuttal}
              expert={conExperts.find((e) => e.id === conRebuttal.expertId)}
              position="con"
              isActive={isConActive}
              respondingTo={proArgument}
            />
          ) : isConActive ? (
            <div className="rounded-lg border border-dashed border-rose-300 bg-rose-50/50 p-6 flex flex-col items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-rose-500 mb-2" />
              <span className="text-xs text-rose-600">CON responding...</span>
            </div>
          ) : proArgument && !conRebuttal ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-muted-foreground">
              <Swords className="h-4 w-4 mb-1" />
              <span className="text-xs">Awaiting CON</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Moderator Synthesis */}
      {(proArgument || conRebuttal || isModActive) && (
        <div>
          {moderatorSynthesis ? (
            <TurnCard
              response={moderatorSynthesis}
              expert={moderatorExperts.find((e) => e.id === moderatorSynthesis.expertId)}
              position="moderator"
              isActive={isModActive}
            />
          ) : isModActive ? (
            <div className="rounded-lg border border-dashed border-violet-300 bg-violet-50/50 p-6 flex flex-col items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-violet-500 mb-2" />
              <span className="text-xs text-violet-600">Moderator synthesizing...</span>
            </div>
          ) : (proArgument && conRebuttal && !moderatorSynthesis) ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-4 flex items-center justify-center gap-2 text-muted-foreground">
              <Scale className="h-4 w-4" />
              <span className="text-xs">Awaiting synthesis</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function DebateExchangeView({ state, className }: DebateExchangeViewProps) {
  // Extract debate-specific state
  const {
    proExperts,
    conExperts,
    moderatorExperts,
    currentTurn,
    roundResponses,
    currentRound,
    maxRounds,
    topology,
    panelType,
  } = state;

  // Determine if this is a debate panel
  const isDebatePanel = topology === 'debate' || panelType === 'adversarial';

  // Don't render if not debate topology
  if (!isDebatePanel) {
    return null;
  }

  // Get all responses flattened
  const allResponses = roundResponses.flat();

  // Build exchanges for each round
  const exchanges: Array<{
    round: number;
    proArgument: ExpertResponse | null;
    conRebuttal: ExpertResponse | null;
    moderatorSynthesis: ExpertResponse | null;
  }> = [];

  for (let round = 1; round <= Math.max(currentRound, 1); round++) {
    const proArg = allResponses.find(
      (r) => r.position === 'pro' && r.round === round
    ) || null;
    const conArg = allResponses.find(
      (r) => r.position === 'con' && r.round === round
    ) || null;
    const modSyn = allResponses.find(
      (r) => r.position === 'moderator' && r.round === round
    ) || null;

    if (proArg || conArg || modSyn || round === currentRound) {
      exchanges.push({
        round,
        proArgument: proArg,
        conRebuttal: conArg,
        moderatorSynthesis: modSyn,
      });
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Debate Header */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Swords className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Adversarial Debate</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Round {currentRound}/{maxRounds}
          </span>
        </div>

        {/* Position badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <Shield className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-medium text-emerald-700">PRO ({proExperts.length})</span>
          </div>
          <span className="text-xs text-muted-foreground">vs</span>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center">
              <Swords className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-medium text-rose-700">CON ({conExperts.length})</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
              <Gavel className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-medium text-violet-700">MOD ({moderatorExperts.length})</span>
          </div>
        </div>

        {/* Active speaker */}
        {currentTurn && (
          <div className="mt-3 pt-3 border-t flex justify-center">
            <ActiveSpeakerIndicator turn={currentTurn} />
          </div>
        )}
      </div>

      {/* Round Exchanges */}
      <div className="space-y-6">
        {exchanges.map((exchange) => (
          <RoundExchange
            key={exchange.round}
            round={exchange.round}
            proArgument={exchange.proArgument}
            conRebuttal={exchange.conRebuttal}
            moderatorSynthesis={exchange.moderatorSynthesis}
            proExperts={proExperts}
            conExperts={conExperts}
            moderatorExperts={moderatorExperts}
            currentTurn={currentTurn}
          />
        ))}
      </div>

      {/* Empty State */}
      {exchanges.length === 0 && !currentTurn && (
        <div className="rounded-lg border border-dashed p-8 flex flex-col items-center justify-center text-muted-foreground">
          <MessageSquare className="h-6 w-6 mb-2" />
          <span className="text-sm">Waiting for debate to begin...</span>
        </div>
      )}
    </div>
  );
}

export default DebateExchangeView;
