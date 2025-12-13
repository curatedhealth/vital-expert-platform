/**
 * MissionPlan - Visual step-by-step plan display
 */

'use client'

import { CheckCircle, Circle, Clock, Loader2, XCircle } from 'lucide-react'
import type { AgentLevel, PlanStep } from '@/hooks/useAutonomousMode'

interface MissionPlanProps {
  steps: PlanStep[]
  currentStep: number
  className?: string
}

const AGENT_STYLES: Record<AgentLevel, { bg: string; text: string; border: string }> = {
  L1: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  L2: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  L3: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  L4: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  L5: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
}

const AGENT_DESCRIPTIONS: Record<AgentLevel, string> = {
  L1: 'Master Orchestrator',
  L2: 'Domain Expert',
  L3: 'Context Specialist',
  L4: 'Evidence Worker',
  L5: 'Tool Executor',
}

export function MissionPlan({ steps, currentStep, className = '' }: MissionPlanProps) {
  if (steps.length === 0) {
    return (
      <div className={`text-center py-8 text-stone-500 ${className}`}>
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Planning in progress...</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Execution Plan</h3>
        <span className="text-sm text-stone-500">
          {steps.filter((s) => s.status === 'completed').length}/{steps.length} complete
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-stone-200" />

        <div className="space-y-4">
          {steps.map((step, index) => {
            const isComplete = step.status === 'completed'
            const isRunning = step.status === 'running' || currentStep === index + 1
            const isFailed = step.status === 'failed'
            const agentStyle = AGENT_STYLES[step.agent] || AGENT_STYLES.L2

            return (
              <div
                key={step.id || index}
                className={`relative flex gap-4 p-4 rounded-lg border transition-all ${
                  isRunning
                    ? 'border-blue-300 bg-blue-50 shadow-sm'
                    : isComplete
                      ? 'border-green-200 bg-green-50/50'
                      : isFailed
                        ? 'border-red-200 bg-red-50/50'
                        : 'border-stone-200 bg-white'
                }`}
              >
                <div className="relative z-10 flex-shrink-0">
                  {isComplete ? (
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  ) : isRunning ? (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                  ) : isFailed ? (
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                      <XCircle className="h-5 w-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
                      <Circle className="h-5 w-5 text-stone-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{step.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${agentStyle.bg} ${agentStyle.text}`}>
                      {step.agent}
                    </span>
                    {step.stage && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                        {step.stage}
                      </span>
                    )}
                    {step.runner && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">🏃 {step.runner}</span>
                    )}
                  </div>

                  <p className="text-sm text-stone-600 mt-1">{step.description}</p>

                  {step.tools && step.tools.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {step.tools.map((tool, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-stone-100 text-stone-600 rounded">
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}

                  {(step.startedAt || step.completedAt) && (
                    <div className="text-xs text-stone-400 mt-2">
                      {step.startedAt && !step.completedAt && <span>Started {formatTime(step.startedAt)}</span>}
                      {step.completedAt && <span>Completed {formatTime(step.completedAt)}</span>}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 text-sm text-stone-400">
                  {index + 1}/{steps.length}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-stone-500 pt-4 border-t">
        {Object.entries(AGENT_STYLES).map(([level, style]) => (
          <div key={level} className="flex items-center gap-1">
            <span className={`w-3 h-3 rounded-full ${style.bg} ${style.border} border`} />
            <span>
              {level}: {AGENT_DESCRIPTIONS[level as AgentLevel]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return isoString
  }
}

export default MissionPlan
