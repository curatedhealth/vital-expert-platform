/**
 * MissionProgress - Real-time progress display with thinking indicator
 */

'use client'

import { Brain, Clock, DollarSign, Sparkles, TrendingUp } from 'lucide-react'
import type { MissionStatus } from '@/hooks/useAutonomousMode'

interface MissionProgressProps {
  currentStep: number
  totalSteps: number
  stage: string
  thinking: { agent: string; task: string; stage?: string } | null
  status: MissionStatus
  budgetSpent?: number
  budgetLimit?: number
  startedAt?: string | null
  className?: string
}

export function MissionProgress({
  currentStep,
  totalSteps,
  stage,
  thinking,
  status,
  budgetSpent = 0,
  budgetLimit = 10,
  startedAt,
  className = '',
}: MissionProgressProps) {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0
  const budgetProgress = budgetLimit > 0 ? (budgetSpent / budgetLimit) * 100 : 0
  const elapsed = startedAt ? getElapsed(startedAt) : null

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Progress
          </span>
          <span className="font-medium">
            {currentStep}/{totalSteps || '?'} steps ({Math.round(progress)}%)
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            Budget
          </span>
          <span className={`font-medium ${budgetProgress > 80 ? 'text-amber-600' : ''}`}>
            ${budgetSpent.toFixed(2)} / ${budgetLimit.toFixed(2)}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${budgetProgress > 80 ? 'bg-amber-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(budgetProgress, 100)}%` }}
          />
        </div>
        {budgetProgress > 60 && budgetProgress < 80 && <p className="text-xs text-amber-600">Approaching budget checkpoint at 80%</p>}
      </div>

      {stage && (
        <div className="flex items-center gap-2 text-sm p-3 bg-gray-50 rounded-lg">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span className="font-medium">Stage:</span>
          <span className="text-gray-600">{stage}</span>
        </div>
      )}

      {thinking && <ThinkingIndicator agent={thinking.agent} task={thinking.task} stage={thinking.stage} />}

      <div className="flex items-center justify-between">
        <StatusBadge status={status} />
        {elapsed && (
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {elapsed}
          </span>
        )}
      </div>
    </div>
  )
}

export function ThinkingIndicator({ agent, task, stage }: { agent: string; task: string; stage?: string }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 via-purple-100/50 to-blue-100/50 animate-shimmer" />

      <div className="relative p-4 flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Brain className="h-5 w-5 text-white animate-pulse" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{agent}</span>
            <span className="text-blue-600 text-sm">is thinking...</span>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task}</p>
          {stage && (
            <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              {stage}
            </span>
          )}
        </div>

        <div className="flex gap-1 items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

export function StatusBadge({ status, size = 'md' }: { status: MissionStatus; size?: 'sm' | 'md' }) {
  const styles: Record<MissionStatus, { bg: string; text: string; icon: string }> = {
    idle: { bg: 'bg-gray-100', text: 'text-gray-600', icon: '○' },
    planning: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '📋' },
    running: { bg: 'bg-green-100', text: 'text-green-700', icon: '▶️' },
    awaiting_checkpoint: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '⏸️' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', icon: '✅' },
    failed: { bg: 'bg-red-100', text: 'text-red-700', icon: '❌' },
  }

  const style = styles[status]
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${style.bg} ${style.text} ${sizeClass}`}>
      <span>{style.icon}</span>
      <span className="capitalize">{status.replace('_', ' ')}</span>
    </span>
  )
}

function getElapsed(start: string): string | null {
  const startDate = new Date(start)
  if (Number.isNaN(startDate.getTime())) return null
  const diffMs = Date.now() - startDate.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m elapsed`
  const hrs = Math.floor(mins / 60)
  const remMins = mins % 60
  return `${hrs}h ${remMins}m elapsed`
}

export default MissionProgress
