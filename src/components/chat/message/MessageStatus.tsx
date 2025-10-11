/**
 * Message Status Component
 * Shows loading states, thinking indicators, and progress
 */

import { motion } from 'framer-motion';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap,
  Brain,
  Search,
  BookOpen,
  Shield
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { cn } from '@/shared/services/utils';
import type { MessageStatus as Status, LoadingStage } from '@/types/chat.types';

interface MessageStatusProps {
  status: Status;
  loadingStage?: LoadingStage;
  isStreaming?: boolean;
  progress?: number;
  className?: string;
}

const stageConfig: Record<LoadingStage, { icon: React.ComponentType<unknown>; label: string; color: string }> = {
  routing: {
    icon: Search,
    label: 'Finding the right expert...',
    color: 'text-blue-500'
  },
  analyzing: {
    icon: Brain,
    label: 'Analyzing your query...',
    color: 'text-purple-500'
  },
  researching: {
    icon: BookOpen,
    label: 'Researching regulations...',
    color: 'text-green-500'
  },
  synthesizing: {
    icon: Zap,
    label: 'Building comprehensive response...',
    color: 'text-yellow-500'
  },
  validating: {
    icon: Shield,
    label: 'Validating medical accuracy...',
    color: 'text-red-500'
  },
  consensus: {
    icon: CheckCircle,
    label: 'Building consensus...',
    color: 'text-indigo-500'
  }
};

  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7]
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

  animate: {
    y: [0, -10, 0]
  },
  transition: {
    duration: 0.6,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

export const MessageStatus: React.FC<MessageStatusProps> = ({
  status,
  loadingStage,
  isStreaming,
  progress = 0,
  className
}) => {
  // Don't show status for completed messages
  if (status === 'completed' || status === 'sent') {
    return null;
  }

  // Error status
  if (status === 'error') {
    return (
      <div className={cn('flex items-center gap-2 p-2 bg-destructive/10 rounded-md border border-destructive/20', className)}>
        <AlertCircle className="h-4 w-4 text-destructive" />
        <span className="text-sm text-destructive">
          Something went wrong. Please try again.
        </span>
      </div>
    );
  }

  // Sending status
  if (status === 'sending') {
    return (
      <div className={cn('flex items-center gap-2 p-2 bg-muted/30 rounded-md', className)}>
        <motion.div {...pulseAnimation}>
          <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
        </motion.div>
        <span className="text-sm text-muted-foreground">Sending...</span>
      </div>
    );
  }

  // Thinking status with loading stages
  if (status === 'thinking' && loadingStage) {
    // Validate loadingStage to prevent object injection
    const validStages = ['analyzing', 'processing', 'generating', 'finalizing'] as const;
    if (!validStages.includes(loadingStage as unknown)) {
      return null;
    }
    const stage = stageConfig[loadingStage as keyof typeof stageConfig];
    const StageIcon = stage.icon;

    return (
      <div className={cn('flex flex-col gap-3 p-3 bg-muted/20 rounded-md border border-muted/30', className)}>
        <div className="flex items-center gap-2">
          <motion.div {...pulseAnimation}>
            <StageIcon className={cn('h-4 w-4', stage.color)} />
          </motion.div>
          <span className="text-sm font-medium">{stage.label}</span>
          <Badge variant="outline" className="text-xs">
            {loadingStage}
          </Badge>
        </div>

        {progress > 0 && (
          <div className="space-y-1">
            <Progress value={progress} className="h-1" />
            <div className="text-xs text-muted-foreground text-right">
              {progress.toFixed(0)}%
            </div>
          </div>
        )}

        {/* Animated thinking dots */}
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full"
              {...dotAnimation}
              style={{
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Basic thinking status
  if (status === 'thinking') {
    return (
      <div className={cn('flex items-center gap-2 p-2 bg-muted/20 rounded-md', className)}>
        <motion.div {...pulseAnimation}>
          <Brain className="h-4 w-4 text-blue-500" />
        </motion.div>
        <span className="text-sm text-muted-foreground">Thinking...</span>

        {/* Animated dots */}
        <div className="flex items-center gap-1 ml-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5 bg-blue-500/60 rounded-full"
              {...dotAnimation}
              style={{
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Streaming status
  if (status === 'streaming' || isStreaming) {
    return (
      <div className={cn('flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/10 rounded-md border border-green-200 dark:border-green-800', className)}>
        <motion.div
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          <Zap className="h-4 w-4 text-green-600" />
        </motion.div>
        <span className="text-sm text-green-700 dark:text-green-300 font-medium">
          Generating response...
        </span>

        {/* Typing indicator */}
        <div className="flex items-center gap-1 ml-2">
          <motion.div
            className="h-2 w-2 bg-green-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0
            }}
          />
          <motion.div
            className="h-2 w-2 bg-green-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.2
            }}
          />
          <motion.div
            className="h-2 w-2 bg-green-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.4
            }}
          />
        </div>
      </div>
    );
  }

  return null;
};