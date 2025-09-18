'use client';

import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Phase, Milestone } from '@/types';

interface JourneyProgressProps {
  currentPhase: Phase;
  phaseProgress: Record<Phase, number>;
  milestones?: Milestone[];
  className?: string;
}

const PHASES = [
  { id: 'vision', label: 'Vision', letter: 'V', opacity: 0.35 },
  { id: 'integrate', label: 'Integrate', letter: 'I', opacity: 0.5 },
  { id: 'test', label: 'Test', letter: 'T', opacity: 0.65 },
  { id: 'activate', label: 'Activate', letter: 'A', opacity: 0.8 },
  { id: 'learn', label: 'Learn', letter: 'L', opacity: 1 },
] as const;

export function JourneyProgress({
  currentPhase,
  phaseProgress,
  milestones = [],
  className
}: JourneyProgressProps) {
  const currentPhaseIndex = PHASES.findIndex(p => p.id === currentPhase);

  return (
    <div className={cn("relative", className)}>
      {/* Connection line */}
      <div className="absolute top-8 left-8 right-8 h-0.5 bg-light-gray" />

      {/* Progress line */}
      <motion.div
        className="absolute top-8 left-8 h-0.5 bg-progress-teal"
        initial={{ width: 0 }}
        animate={{ width: `${(currentPhaseIndex / (PHASES.length - 1)) * 100}%` }}
        transition={{ duration: 0.5 }}
      />

      {/* Phase dots */}
      <div className="relative flex justify-between">
        {PHASES.map((phase, index) => {
          const isCompleted = index < currentPhaseIndex;
          const isCurrent = phase.id === currentPhase;
          const progress = phaseProgress[phase.id as Phase];

          return (
            <motion.div
              key={phase.id}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Phase dot */}
              <div className="relative">
                <motion.div
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center text-white font-bold",
                    isCompleted && "bg-clinical-green",
                    isCurrent && "bg-progress-teal ring-4 ring-progress-teal/20",
                    !isCompleted && !isCurrent && "bg-trust-blue"
                  )}
                  style={{
                    opacity: isCompleted || isCurrent ? 1 : phase.opacity
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span className="text-lg">{phase.letter}</span>
                  )}
                </motion.div>

                {/* Progress ring for current phase */}
                {isCurrent && progress > 0 && (
                  <svg className="absolute inset-0 w-16 h-16 -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="30"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-progress-teal"
                      strokeDasharray={`${progress * 1.88} 188`}
                    />
                  </svg>
                )}
              </div>

              {/* Phase label */}
              <span className={cn(
                "mt-2 text-sm font-medium",
                isCurrent ? "text-progress-teal" : "text-medical-gray"
              )}>
                {phase.label}
              </span>

              {/* Phase progress percentage */}
              {isCurrent && (
                <span className="text-xs text-medical-gray mt-1">
                  {Math.round(progress)}% Complete
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="mt-8 space-y-2">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              className="flex items-center space-x-2 text-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Circle className={cn(
                "w-4 h-4",
                milestone.completed ? "fill-clinical-green text-clinical-green" : "text-medical-gray"
              )} />
              <span className={milestone.completed ? "line-through text-medical-gray" : ""}>
                {milestone.title}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}