/**
 * MissionForm - Form for creating new autonomous missions
 *
 * Supports Mode 3 (manual agent selection) and Mode 4 (automatic).
 */

'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, DollarSign, Rocket, Users, Wand2 } from 'lucide-react'

export interface MissionFormData {
  objective: string
  mode: 3 | 4
  selectedAgents: string[]
  budgetLimit: number
  title?: string
  templateId?: string
}

interface MissionFormProps {
  onSubmit: (data: MissionFormData) => void
  isLoading?: boolean
  disabled?: boolean
  initialObjective?: string
  initialMode?: 3 | 4
  presetAgents?: string[]
  lockAgentSelection?: boolean
  lockMode?: boolean
}

const AGENT_CATEGORIES = [
  {
    category: 'Core Experts',
    agents: [
      { id: 'regulatory', name: 'Regulatory Expert', icon: '📋', description: 'FDA/EMA submissions, compliance' },
      { id: 'clinical', name: 'Clinical Expert', icon: '🏥', description: 'Trial design, endpoints, protocols' },
      { id: 'safety', name: 'Safety Expert', icon: '⚠️', description: 'Pharmacovigilance, risk assessment' },
      { id: 'medical_affairs', name: 'Medical Affairs', icon: '💊', description: 'MSL support, medical strategy' },
    ],
  },
  {
    category: 'Commercial',
    agents: [
      { id: 'market_access', name: 'Market Access', icon: '📊', description: 'Pricing, reimbursement, HTA' },
      { id: 'commercial', name: 'Commercial Strategy', icon: '💼', description: 'Launch planning, positioning' },
      { id: 'competitive_intel', name: 'Competitive Intel', icon: '🔍', description: 'Landscape analysis, benchmarking' },
    ],
  },
  {
    category: 'Scientific',
    agents: [
      { id: 'literature', name: 'Literature Research', icon: '📚', description: 'PubMed, systematic reviews' },
      { id: 'data_analysis', name: 'Data Analysis', icon: '📈', description: 'Statistical analysis, visualization' },
      { id: 'writing', name: 'Medical Writing', icon: '✍️', description: 'Publications, submissions' },
    ],
  },
]

const ALL_AGENTS = AGENT_CATEGORIES.flatMap((c) => c.agents)

const MISSION_TEMPLATES = [
  { id: 'deep_research', name: 'Deep Research', description: 'Comprehensive literature review' },
  { id: 'regulatory_strategy', name: 'Regulatory Strategy', description: 'FDA/EMA pathway analysis' },
  { id: 'competitive_analysis', name: 'Competitive Analysis', description: 'Market landscape assessment' },
  { id: 'launch_readiness', name: 'Launch Readiness', description: 'Pre-launch checklist evaluation' },
]

export function MissionForm({
  onSubmit,
  isLoading = false,
  disabled = false,
  initialObjective,
  initialMode,
  presetAgents,
  lockAgentSelection = false,
  lockMode = false,
}: MissionFormProps) {
  const [objective, setObjective] = useState(initialObjective || '')
  const [mode, setMode] = useState<3 | 4>(initialMode || 3)
  const [selectedAgents, setSelectedAgents] = useState<string[]>(
    presetAgents && presetAgents.length > 0 ? presetAgents : ['regulatory']
  )
  const [budget, setBudget] = useState(10)
  const [title, setTitle] = useState('')
  const [templateId, setTemplateId] = useState<string>('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Core Experts')

  const isValid = useMemo(() => {
    if (!objective.trim() || objective.length < 10) return false
    if (mode === 3 && selectedAgents.length === 0) return false
    return true
  }, [objective, mode, selectedAgents])

  const toggleAgent = (agentId: string) => {
    if (lockAgentSelection) return
    setSelectedAgents((prev) => (prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isLoading || disabled) return

    onSubmit({
      objective: objective.trim(),
      mode,
      selectedAgents: mode === 3 ? selectedAgents : [],
      budgetLimit: budget,
      title: title.trim() || undefined,
      templateId: templateId || undefined,
    })
  }

  const selectedAgentNames = selectedAgents
    .map((id) => ALL_AGENTS.find((a) => a.id === id)?.name)
    .filter(Boolean)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="objective" className="block text-sm font-medium">
          Mission Objective <span className="text-red-500">*</span>
        </label>
        <textarea
          id="objective"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="Describe what you want to accomplish in detail..."
          rows={4}
          className="w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading || disabled}
        />
        <div className="flex justify-between text-xs text-stone-500">
          <span>{objective.length < 10 ? `${10 - objective.length} more characters needed` : 'Good length'}</span>
          <span>{objective.length}/2000</span>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium">Execution Mode</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => !lockMode && setMode(3)}
            disabled={isLoading || disabled || lockMode}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              mode === 3 ? 'border-blue-500 bg-blue-50' : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Mode 3: Manual</span>
            </div>
            <p className="text-sm text-stone-600">You select which experts to involve.</p>
          </button>

          <button
            type="button"
            onClick={() => !lockMode && setMode(4)}
            disabled={isLoading || disabled || lockMode}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              mode === 4 ? 'border-purple-500 bg-purple-50' : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Wand2 className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Mode 4: Automatic</span>
            </div>
            <p className="text-sm text-stone-600">AI selects the optimal expert team.</p>
          </button>
        </div>
      </div>

      {mode === 3 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium">
              Select Experts <span className="text-red-500">*</span>
            </label>
            <span className="text-sm text-stone-500">
              {selectedAgentNames.length > 0 ? selectedAgentNames.join(', ') : 'None selected'}
              {lockAgentSelection && ' (locked)'}
            </span>
          </div>

          {!lockAgentSelection && (
            <div className="space-y-3">
              {AGENT_CATEGORIES.map((group) => (
                <div key={group.category} className="border rounded-lg">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-stone-50"
                    onClick={() => setExpandedCategory(expandedCategory === group.category ? null : group.category)}
                  >
                    <div className="flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-stone-500" />
                      <span className="font-medium">{group.category}</span>
                    </div>
                    {expandedCategory === group.category ? (
                      <ChevronUp className="h-4 w-4 text-stone-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-stone-500" />
                    )}
                  </button>

                  {expandedCategory === group.category && (
                    <div className="divide-y">
                      {group.agents.map((agent) => {
                        const selected = selectedAgents.includes(agent.id)
                        return (
                          <button
                            type="button"
                            key={agent.id}
                            onClick={() => toggleAgent(agent.id)}
                            className={`w-full px-4 py-3 flex items-center justify-between text-left transition-all ${
                              selected ? 'bg-blue-50 border-l-2 border-blue-400' : 'hover:bg-stone-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{agent.icon}</span>
                              <div>
                                <div className="font-medium">{agent.name}</div>
                                <div className="text-sm text-stone-500">{agent.description}</div>
                              </div>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                selected ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {selected ? 'Selected' : 'Select'}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Budget Limit (USD)</label>
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-stone-500" />
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="flex-1"
              disabled={isLoading || disabled}
            />
            <span className="text-sm font-medium">${budget}</span>
          </div>
          <p className="text-xs text-stone-500">Budget is soft-capped; checkpoints will fire above 80% usage.</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Mission Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Belgian reimbursement strategy for TYK2"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading || disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          Advanced options
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-stone-50">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Template</label>
              <div className="space-y-2">
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={isLoading || disabled}
                >
                  <option value="">Select a template</option>
                  {MISSION_TEMPLATES.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
                {templateId && (
                  <p className="text-xs text-stone-500">
                    {MISSION_TEMPLATES.find((t) => t.id === templateId)?.description}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Notes (optional)</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add notes or constraints..."
                disabled={isLoading || disabled}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-stone-500 flex items-center gap-2">
          <Rocket className="h-4 w-4" />
          Mode 3 requires at least one agent; Mode 4 will auto-select.
        </div>
        <button
          type="submit"
          disabled={!isValid || isLoading || disabled}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Starting...' : 'Start Mission'}
        </button>
      </div>
    </form>
  )
}

export default MissionForm
