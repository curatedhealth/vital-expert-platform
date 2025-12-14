import { useCallback, useMemo, useState } from 'react'
import { useSSEStream } from '@/features/ask-expert/hooks/useSSEStream'

export type MissionStatus = 'idle' | 'planning' | 'running' | 'awaiting_checkpoint' | 'completed' | 'failed'
export type AgentLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5'

export interface PlanStep {
  id?: string
  name: string
  description: string
  agent: AgentLevel
  stage?: string
  tools?: string[]
  runner?: string
  status?: 'pending' | 'running' | 'completed' | 'failed'
  startedAt?: string
  completedAt?: string
}

export interface CheckpointOption {
  id: string
  label: string
  action?: string
  description?: string
}

export interface Checkpoint {
  checkpoint_id: string
  type: string
  title: string
  description: string
  options: CheckpointOption[]
  message?: string
  metadata?: Record<string, unknown>
}

export interface Citation {
  id: string
  title?: string
  excerpt?: string
  url?: string
  source?: string
  confidence?: number
}

export interface Artifact {
  id: string
  name: string
  content: string
  step?: string
  citations: Citation[]
  artifactPath?: string
  runner?: any
  cost?: number
}

interface Thinking {
  agent: string
  task: string
  stage?: string
}

interface StartMissionInput {
  objective: string
  mode: 3 | 4
  selectedAgents?: string[]
  budgetLimit?: number
  title?: string
  templateId?: string
}

export function useAutonomousMode() {
  const [missionId, setMissionId] = useState<string | null>(null)
  const [status, setStatus] = useState<MissionStatus>('idle')
  const [plan, setPlan] = useState<PlanStep[]>([])
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [sources, setSources] = useState<Citation[]>([])
  const [checkpoint, setCheckpoint] = useState<Checkpoint | null>(null)
  const [finalContent, setFinalContent] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [objective, setObjective] = useState<string>('')
  const [mode, setMode] = useState<3 | 4>(3)
  const [title, setTitle] = useState<string>('')
  const [budgetLimit, setBudgetLimit] = useState<number>(10)
  const [budgetSpent, setBudgetSpent] = useState<number>(0)
  const [startedAt, setStartedAt] = useState<string | null>(null)
  const [currentStage, setCurrentStage] = useState<string>('planning')
  const [thinking, setThinking] = useState<Thinking | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [selectedTeam, setSelectedTeam] = useState<string[]>([])
  const [toolCalls, setToolCalls] = useState<any[]>([])

  const { connect, isStreaming, disconnect } = useSSEStream({
    // Use unified proxy which routes mode 3/4 to /api/missions/stream on backend
    url: '/api/ask-expert/stream',
    onStatus: (evt: any) => setStatus((evt as any)?.status || 'running'),
    onPlan: (evt: any) => {
      const steps = (evt.plan || []).map((step: any) => ({
        id: step.id,
        name: step.name || step.description || 'Step',
        description: step.description || '',
        agent: (step.delegate || step.worker || 'L2') as AgentLevel,
        stage: step.stage,
        tools: step.tools || [],
        status: (step.status as PlanStep['status']) || 'pending',
      }))
      setPlan(steps)
      setCurrentStage('planning')
      setProgress(0)
    },
    onProgress: (evt: any) => {
      const stage = evt.stage || 'execution'
      setCurrentStage(stage)
      setProgress(evt.progress ?? 0)
      setStatus(evt.stage === 'planning' ? 'planning' : 'running')

      if (evt.step) {
        setPlan((prev) =>
          prev.map((step) => {
            const isMatch = step.id === evt.step || step.name === evt.step
            if (!isMatch) return step
            return {
              ...step,
              status: evt.status === 'complete' || evt.progress === 100 ? 'completed' : 'running',
              completedAt: evt.progress === 100 ? new Date().toISOString() : step.completedAt,
              startedAt: step.startedAt || new Date().toISOString(),
            }
          })
        )
      }
    },
    onReasoning: (evt: any) => {
      setThinking({
        agent: evt.agentName || evt.agent || 'Agent',
        task: evt.content || evt.message || 'Thinking...',
        stage: evt.stage || evt.step,
      })
    },
    onToken: (evt: any) => setFinalContent((prev) => prev + (evt.content || '')),
    onArtifact: (art: any) => {
      const artifactContent = art.summary || art.content || '';
      setArtifacts((prev) => [
        ...prev,
        {
          id: art.id || `artifact-${Date.now()}`,
          name: art.title || art.step || 'Artifact',
          content: artifactContent,
          step: art.step,
          citations: art.citations || [],
          artifactPath: art.artifactPath,
          runner: art.runner,
          cost: art.cost,
        },
      ])
      // Accumulate artifact content for real-time display (missions don't emit tokens)
      if (artifactContent) {
        setFinalContent((prev) => {
          const separator = prev ? '\n\n---\n\n' : '';
          return prev + separator + artifactContent;
        });
      }
      if (art.step) {
        setPlan((prev) =>
          prev.map((step) =>
            step.name === art.step || step.id === art.step ? { ...step, status: 'completed' } : step
          )
        )
      }
    },
    onCitation: (citation: any) => {
      setSources((prev) => [...prev, citation])
    },
    onCheckpoint: (cp: any) => {
      setCheckpoint({
        checkpoint_id: cp.id || cp.checkpoint_id,
        type: cp.type,
        title: cp.title,
        description: cp.description,
        options: (cp.options || []).map((opt: any, idx: number) => ({
          id: opt.id || opt.value || `option-${idx}`,
          label: opt.label || opt.name || String(opt),
          action: opt.action,
          description: opt.description,
        })),
        message: cp.message,
        metadata: cp.metadata,
      })
      setStatus('awaiting_checkpoint')
    },
    onFusion: (evt: any) => {
      if (Array.isArray(evt.selectedExperts)) {
        setSelectedTeam(evt.selectedExperts.map((e: any) => e.name || e.id).filter(Boolean))
      }
    },
    onCost: (evt: any) => {
      if (typeof evt.currentCost === 'number') setBudgetSpent(evt.currentCost)
      if (typeof evt.budgetLimit === 'number') setBudgetLimit(evt.budgetLimit)
    },
    onToolCall: (toolEvt: any) => {
      setToolCalls((prev) => [...prev, toolEvt])
    },
    onDone: (evt: any) => {
      setStatus((evt as any)?.status || 'completed')
      // Extract final content from event if available
      if (evt?.final?.content) {
        setFinalContent(evt.final.content)
      } else if (evt?.artifacts && Array.isArray(evt.artifacts)) {
        // Fallback: combine artifact summaries as final output
        const combined = evt.artifacts
          .map((a: any) => a.summary || a.content || '')
          .filter(Boolean)
          .join('\n\n');
        if (combined) {
          setFinalContent((prev) => prev || combined);
        }
      }
    },
    onError: (evt: any) => {
      setError(evt.message || 'Stream error')
      setStatus('failed')
    },
  })

  const startMission = useCallback(
    async ({ objective, mode, selectedAgents = [], budgetLimit = 10, title, templateId }: StartMissionInput) => {
      const id = crypto.randomUUID ? crypto.randomUUID() : `mission-${Date.now()}`

      // Mode 3 requires an agent; fail fast client-side to avoid 422
      if (mode === 3 && (!selectedAgents || selectedAgents.length === 0 || !selectedAgents[0])) {
        setError('Select an agent before starting a Mode 3 mission.')
        setStatus('failed')
        return
      }

      setMissionId(id)
      setObjective(objective)
      setMode(mode)
      setTitle(title || '')
      setBudgetLimit(budgetLimit)
      setBudgetSpent(0)
      setPlan([])
      setArtifacts([])
      setSources([])
      setCheckpoint(null)
      setFinalContent('')
      setError(null)
      setStatus('planning')
      setStartedAt(new Date().toISOString())
      setCurrentStage('planning')
      setProgress(0)
      setSelectedTeam([])

      connect({
        mission_id: id,
        mode,
        message: objective,
        goal: objective,
        agent_id: mode === 3 ? selectedAgents[0] : undefined,   // Primary field name
        budget_limit: budgetLimit,
        template_id: templateId || 'deep_research',
        user_id: id, // use mission id as a stable UUID for backend expectations
        user_context: {},
      })
    },
    [connect]
  )

  const respondToCheckpoint = useCallback(
    async (checkpointId: string, decision: string, action?: string, data?: Record<string, unknown>) => {
      if (!checkpoint || !missionId) return
      await fetch(`/api/missions/checkpoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission_id: missionId,
          checkpoint_id: checkpointId,
          action: decision,
          option: action,
          modifications: data,
          resume: true,
        }),
      })
      setCheckpoint(null)
      setStatus('running')
    },
    [checkpoint, missionId]
  )

  const abortMission = useCallback(() => {
    disconnect()
    setStatus('idle')
  }, [disconnect])

  const reset = useCallback(() => {
    setMissionId(null)
    setPlan([])
    setArtifacts([])
    setSources([])
    setCheckpoint(null)
    setFinalContent('')
    setError(null)
    setStatus('idle')
    setThinking(null)
    setProgress(0)
    setSelectedTeam([])
  }, [])

  const isIdle = status === 'idle'
  const isPlanning = status === 'planning'
  const isAwaitingCheckpoint = status === 'awaiting_checkpoint'
  const isComplete = status === 'completed'
  const hasFailed = status === 'failed'
  const isRunning = status === 'running'
  const isActive = !isIdle && !isComplete && !hasFailed

  const currentStep = useMemo(() => {
    const runningIdx = plan.findIndex((p) => p.status === 'running')
    if (runningIdx >= 0) return runningIdx + 1
    const completed = plan.filter((p) => p.status === 'completed').length
    return completed + 1
  }, [plan])

  return {
    missionId,
    title,
    objective,
    mode,
    status,
    plan,
    artifacts,
    sources,
    checkpoint,
    finalContent,
    error,
    isStreaming,
    currentStage,
    thinking,
    progress,
    currentStep,
    totalSteps: plan.length,
    selectedTeam,
    budgetSpent,
    budgetLimit,
    startedAt,
    toolCalls,
    // actions
    startMission,
    respondToCheckpoint,
    abortMission,
    reset,
    // computed
    isIdle,
    isPlanning,
    isRunning,
    isAwaitingCheckpoint,
    isComplete,
    hasFailed,
    isActive,
  }
}

export default useAutonomousMode
