/**
 * StreamingProgress Component
 * 
 * Visual progress indicator during AI streaming with stage information.
 * Shows current stage, progress bar, time estimates, and token metrics.
 * 
 * @example
 * <StreamingProgress 
 *   stage="streaming"
 *   progress={45}
 *   estimatedTimeRemaining={30000}
 *   tokensPerSecond={42}
 *   showDetails={true}
 * />
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  Zap, 
  Brain, 
  Wrench, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import type { StreamingStage } from '../hooks/useStreamingProgress';

// ============================================================================
// TYPES
// ============================================================================

export interface StreamingProgressProps {
  /** Current streaming stage */
  stage: StreamingStage;
  
  /** Progress percentage (0-100) */
  progress?: number;
  
  /** Estimated time remaining in ms */
  estimatedTimeRemaining?: number | null;
  
  /** Current tokens per second */
  tokensPerSecond?: number;
  
  /** Total tokens received */
  totalTokens?: number;
  
  /** Show detailed metrics */
  showDetails?: boolean;
  
  /** Custom message override */
  message?: string;
  
  /** Custom className */
  className?: string;
}

// ============================================================================
// STAGE ICONS
// ============================================================================

const STAGE_ICONS: Record<StreamingStage, React.ReactNode> = {
  idle: <Zap className="h-4 w-4" />,
  thinking: <Brain className="h-4 w-4 animate-pulse" />,
  streaming: <Zap className="h-4 w-4" />,
  tools: <Wrench className="h-4 w-4 animate-spin" />,
  rag: <BookOpen className="h-4 w-4 animate-pulse" />,
  complete: <CheckCircle2 className="h-4 w-4" />,
  error: <AlertCircle className="h-4 w-4" />,
};

// ============================================================================
// STAGE COLORS
// ============================================================================

const STAGE_COLORS: Record<StreamingStage, string> = {
  idle: 'text-muted-foreground',
  thinking: 'text-blue-500',
  streaming: 'text-green-500',
  tools: 'text-purple-500',
  rag: 'text-orange-500',
  complete: 'text-green-600',
  error: 'text-red-500',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatTimeRemaining(ms: number | null | undefined): string {
  if (!ms || ms <= 0) return '';
  
  const seconds = Math.ceil(ms / 1000);
  
  if (seconds < 60) {
    return `~${seconds}s remaining`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `~${minutes}m remaining`;
  }
  
  return `~${minutes}m ${remainingSeconds}s remaining`;
}

function formatTokensPerSecond(tps: number | undefined): string {
  if (!tps || tps <= 0) return '';
  return `${Math.round(tps)} tokens/sec`;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const StreamingProgress: React.FC<StreamingProgressProps> = ({
  stage,
  progress = 0,
  estimatedTimeRemaining,
  tokensPerSecond,
  totalTokens,
  showDetails = false,
  message,
  className = '',
}) => {
  const stageColor = STAGE_COLORS[stage];
  const stageIcon = STAGE_ICONS[stage];
  
  // Don't show for idle or complete
  if (stage === 'idle' || stage === 'complete') {
    return null;
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`streaming-progress ${className}`}
      >
        <div className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
          {/* Stage Icon */}
          <div className={`flex-shrink-0 ${stageColor}`}>
            {stageIcon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Stage Message */}
            <div className="flex items-center justify-between gap-2">
              <span className={`text-sm font-medium ${stageColor}`}>
                {message || getStageMessage(stage)}
              </span>
              
              {/* Time Estimate */}
              {estimatedTimeRemaining && (
                <span className="text-xs text-muted-foreground">
                  {formatTimeRemaining(estimatedTimeRemaining)}
                </span>
              )}
            </div>
            
            {/* Progress Bar */}
            {progress > 0 && (
              <div className="mt-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
            
            {/* Details */}
            {showDetails && (
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                {totalTokens !== undefined && totalTokens > 0 && (
                  <span>{totalTokens} tokens</span>
                )}
                
                {tokensPerSecond !== undefined && tokensPerSecond > 0 && (
                  <span>{formatTokensPerSecond(tokensPerSecond)}</span>
                )}
                
                {progress > 0 && progress < 100 && (
                  <span>{Math.round(progress)}%</span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// THINKING INDICATOR
// ============================================================================

export interface ThinkingIndicatorProps {
  /** Custom message */
  message?: string;
  
  /** Animation style */
  animation?: 'pulse' | 'dots' | 'wave' | 'spinner';
  
  /** Show icon */
  showIcon?: boolean;
  
  /** Custom className */
  className?: string;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  message = 'AI is thinking...',
  animation = 'dots',
  showIcon = true,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`thinking-indicator ${className}`}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {showIcon && (
          <Brain className="h-4 w-4 text-blue-500 animate-pulse" />
        )}
        
        <span>{message}</span>
        
        {/* Animation */}
        {animation === 'dots' && <DotsAnimation />}
        {animation === 'pulse' && <PulseAnimation />}
        {animation === 'wave' && <WaveAnimation />}
        {animation === 'spinner' && <Loader2 className="h-3 w-3 animate-spin" />}
      </div>
    </motion.div>
  );
};

// ============================================================================
// ANIMATIONS
// ============================================================================

const DotsAnimation: React.FC = () => {
  return (
    <span className="dots-animation">
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
      >
        .
      </motion.span>
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
      >
        .
      </motion.span>
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
      >
        .
      </motion.span>
    </span>
  );
};

const PulseAnimation: React.FC = () => {
  return (
    <motion.span
      className="inline-block h-2 w-2 rounded-full bg-blue-500"
      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
};

const WaveAnimation: React.FC = () => {
  return (
    <span className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-1 w-1 rounded-full bg-blue-500"
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </span>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStageMessage(stage: StreamingStage): string {
  const messages: Record<StreamingStage, string> = {
    idle: 'Ready',
    thinking: 'AI is thinking...',
    streaming: 'Streaming response...',
    tools: 'Executing tools...',
    rag: 'Retrieving sources...',
    complete: 'Complete',
    error: 'Error occurred',
  };
  
  return messages[stage];
}

// ============================================================================
// COMPACT VERSION
// ============================================================================

export interface CompactProgressProps {
  stage: StreamingStage;
  tokensPerSecond?: number;
  className?: string;
}

/**
 * Compact progress indicator (single line)
 */
export const CompactProgress: React.FC<CompactProgressProps> = ({
  stage,
  tokensPerSecond,
  className = '',
}) => {
  if (stage === 'idle' || stage === 'complete') {
    return null;
  }
  
  return (
    <div className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}>
      <span className={STAGE_COLORS[stage]}>{STAGE_ICONS[stage]}</span>
      <span>{getStageMessage(stage)}</span>
      {tokensPerSecond && tokensPerSecond > 0 && (
        <span className="text-muted-foreground/60">
          ({Math.round(tokensPerSecond)} tokens/s)
        </span>
      )}
    </div>
  );
};

