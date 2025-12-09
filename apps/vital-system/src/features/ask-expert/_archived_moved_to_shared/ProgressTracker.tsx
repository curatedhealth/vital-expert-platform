/**
 * Progress Tracker Component
 *
 * Real-time execution status display for autonomous modes.
 * Shows:
 * - Current step with animation
 * - Completed steps history
 * - Spawned sub-agents
 * - Pause/resume controls
 * - Time elapsed
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  StopCircle,
  CheckCircle2,
  Circle,
  Clock,
  Bot,
  Users,
  Loader2,
  AlertTriangle,
  GitBranch,
  Target,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ExecutionStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  details?: string;
}

interface SpawnedAgent {
  id: string;
  name: string;
  role: string;
  status: 'spawning' | 'running' | 'completed' | 'failed';
  progress?: number;
}

interface ProgressTrackerProps {
  steps: ExecutionStep[];
  spawnedAgents?: SpawnedAgent[];
  isRunning: boolean;
  isPaused?: boolean;
  startTime?: Date;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  className?: string;
}

export function ProgressTracker({
  steps,
  spawnedAgents = [],
  isRunning,
  isPaused = false,
  startTime,
  onPause,
  onResume,
  onStop,
  className = '',
}: ProgressTrackerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  // Update elapsed time
  useEffect(() => {
    if (!startTime || !isRunning || isPaused) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isRunning, isPaused]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current step
  const currentStep = steps.find((s) => s.status === 'running');
  const completedSteps = steps.filter((s) => s.status === 'completed');
  const progress = steps.length > 0 ? (completedSteps.length / steps.length) * 100 : 0;

  const getStepIcon = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'skipped':
        return <Circle className="w-4 h-4 text-zinc-500" />;
      default:
        return <Circle className="w-4 h-4 text-zinc-600" />;
    }
  };

  const getAgentStatusColor = (status: SpawnedAgent['status']) => {
    switch (status) {
      case 'running':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-emerald-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-zinc-500';
    }
  };

  return (
    <div className={`rounded-xl border border-zinc-700/50 bg-zinc-900/50 overflow-hidden ${className}`}>
      {/* Header with Progress Bar */}
      <div className="p-4 border-b border-zinc-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isRunning ? 'bg-primary/20' : 'bg-zinc-700/50'}`}>
              {isRunning ? (
                isPaused ? (
                  <Pause className="w-4 h-4 text-amber-400" />
                ) : (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                )
              ) : (
                <Target className="w-4 h-4 text-zinc-400" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-white">
                {isRunning
                  ? isPaused
                    ? 'Execution Paused'
                    : 'Executing Mission'
                  : 'Mission Complete'}
              </h3>
              <p className="text-xs text-zinc-500">
                {completedSteps.length} of {steps.length} steps completed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Time Elapsed */}
            {startTime && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800 rounded-md">
                <Clock className="w-3 h-3 text-zinc-400" />
                <span className="text-xs font-mono text-zinc-300">{formatTime(elapsedTime)}</span>
              </div>
            )}

            {/* Controls */}
            {isRunning && (
              <div className="flex items-center gap-1">
                {isPaused ? (
                  <button
                    onClick={onResume}
                    className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                    title="Resume"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onPause}
                    className="p-1.5 rounded-md bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                    title="Pause"
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onStop}
                  className="p-1.5 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  title="Stop"
                >
                  <StopCircle className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Expand/Collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
          />
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Spawned Agents */}
            {spawnedAgents.length > 0 && (
              <div className="p-4 border-b border-zinc-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-300">Active Agents</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {spawnedAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-full"
                    >
                      <Bot className="w-3 h-3 text-zinc-400" />
                      <span className="text-xs font-medium text-zinc-300">{agent.name}</span>
                      <span className="text-xs text-zinc-500">({agent.role})</span>
                      <span className={`w-2 h-2 rounded-full ${getAgentStatusColor(agent.status)}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Steps Timeline */}
            <div className="p-4 max-h-64 overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <GitBranch className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-300">Execution Steps</span>
              </div>
              <div className="space-y-1">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      step.status === 'running' ? 'bg-primary/10' : 'hover:bg-zinc-800/50'
                    }`}
                  >
                    {/* Connector Line */}
                    <div className="relative flex items-center justify-center w-4">
                      {getStepIcon(step.status)}
                      {index < steps.length - 1 && (
                        <div
                          className={`absolute top-5 left-1/2 -translate-x-1/2 w-px h-4 ${
                            step.status === 'completed' ? 'bg-emerald-500/50' : 'bg-zinc-700'
                          }`}
                        />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          step.status === 'running'
                            ? 'text-primary font-medium'
                            : step.status === 'completed'
                            ? 'text-zinc-300'
                            : 'text-zinc-500'
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.details && (
                        <p className="text-xs text-zinc-500 truncate">{step.details}</p>
                      )}
                    </div>

                    {/* Duration */}
                    {step.completedAt && step.startedAt && (
                      <span className="text-xs text-zinc-500">
                        {Math.round((step.completedAt.getTime() - step.startedAt.getTime()) / 1000)}s
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProgressTracker;
