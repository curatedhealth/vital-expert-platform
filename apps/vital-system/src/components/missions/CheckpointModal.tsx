/**
 * CheckpointModal - Human-in-the-loop decision dialog
 */

'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, DollarSign, HelpCircle, Shield, X, XCircle } from 'lucide-react'
import type { Checkpoint, CheckpointOption } from '@/hooks/useAutonomousMode'

interface CheckpointModalProps {
  checkpoint: Checkpoint | null
  isOpen: boolean
  onRespond: (checkpointId: string, decision: string, action?: string, additionalData?: Record<string, unknown>) => void
  onDismiss?: () => void
}

const CHECKPOINT_CONFIG: Record<
  string,
  {
    icon: React.ReactNode
    color: string
    bgColor: string
    title: string
  }
> = {
  budget: {
    icon: <DollarSign className="h-6 w-6" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    title: 'Budget Checkpoint',
  },
  quality: {
    icon: <Shield className="h-6 w-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    title: 'Quality Review',
  },
  approval: {
    icon: <CheckCircle className="h-6 w-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    title: 'Approval Required',
  },
  error: {
    icon: <XCircle className="h-6 w-6" />,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    title: 'Error Occurred',
  },
  final_review: {
    icon: <CheckCircle className="h-6 w-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    title: 'Final Review',
  },
  default: {
    icon: <HelpCircle className="h-6 w-6" />,
    color: 'text-stone-600',
    bgColor: 'bg-stone-100',
    title: 'Decision Required',
  },
}

export function CheckpointModal({ checkpoint, isOpen, onRespond, onDismiss }: CheckpointModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [budgetIncrease, setBudgetIncrease] = useState(20)

  useEffect(() => {
    setSelectedOption(null)
    setIsSubmitting(false)
  }, [checkpoint?.checkpoint_id])

  if (!checkpoint || !isOpen) return null

  const config = CHECKPOINT_CONFIG[checkpoint.type] || CHECKPOINT_CONFIG.default

  const handleSubmit = async () => {
    if (!selectedOption) return
    setIsSubmitting(true)
    const option = checkpoint.options.find((o) => o.id === selectedOption)
    const additionalData: Record<string, unknown> = {}
    if (option?.action === 'increase_budget') {
      additionalData.new_limit = budgetIncrease
    }
    try {
      await onRespond(checkpoint.checkpoint_id, selectedOption, option?.action, additionalData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onDismiss} />

      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className={`${config.bgColor} px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={config.color}>{config.icon}</div>
              <h2 className="text-lg font-semibold text-stone-900">{config.title}</h2>
            </div>
            {onDismiss && (
              <button onClick={onDismiss} className="text-stone-500 hover:text-stone-700 transition-colors">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-4">
          <p className="text-stone-700 mb-6">{checkpoint.message || checkpoint.description}</p>

          <div className="space-y-3">
            {checkpoint.options.map((option) => (
              <OptionButton
                key={option.id}
                option={option}
                isSelected={selectedOption === option.id}
                onSelect={() => setSelectedOption(option.id)}
                disabled={isSubmitting}
              />
            ))}
          </div>

          {selectedOption && checkpoint.options.find((o) => o.id === selectedOption)?.action === 'increase_budget' && (
            <div className="mt-4 p-4 bg-stone-50 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-stone-600">New Budget Limit</span>
                <span className="font-medium">${budgetIncrease}</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={budgetIncrease}
                onChange={(e) => setBudgetIncrease(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {checkpoint.metadata && Object.keys(checkpoint.metadata).length > 0 && (
            <details className="mt-4 text-sm">
              <summary className="text-stone-500 cursor-pointer hover:text-stone-700">View details</summary>
              <pre className="mt-2 p-3 bg-stone-50 rounded text-xs overflow-auto">
                {JSON.stringify(checkpoint.metadata, null, 2)}
              </pre>
            </details>
          )}
        </div>

        <div className="px-6 py-4 bg-stone-50 border-t flex justify-end gap-3">
          <button
            onClick={onDismiss}
            className="px-4 py-2 text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedOption || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Decision'}
          </button>
        </div>
      </div>
    </div>
  )
}

function OptionButton({
  option,
  isSelected,
  onSelect,
  disabled,
}: {
  option: CheckpointOption
  isSelected: boolean
  onSelect: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`w-full p-4 border rounded-lg text-left transition-all ${
        isSelected ? 'border-blue-400 bg-blue-50 shadow-sm' : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-stone-900">{option.label}</div>
          {option.description && <div className="text-sm text-stone-600 mt-1">{option.description}</div>}
        </div>
        <div
          className={`w-5 h-5 rounded-full border ${
            isSelected ? 'border-blue-500 bg-blue-500' : 'border-stone-300'
          }`}
        />
      </div>
    </button>
  )
}

export default CheckpointModal
