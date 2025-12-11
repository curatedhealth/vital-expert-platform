/**
 * Missions (Modes 3/4) - New autonomous mission experience.
 * Additive route; does not replace existing ask-expert missions.
 */

'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react'
import { MissionForm } from '@/components/missions/MissionForm'
import { MissionPlan } from '@/components/missions/MissionPlan'
import { MissionProgress, StatusBadge } from '@/components/missions/MissionProgress'
import { ArtifactViewer, FinalReport } from '@/components/missions/ArtifactViewer'
import { CheckpointModal } from '@/components/missions/CheckpointModal'
import { ToolCallList } from '@/components/missions/ToolCallList'
import { useAutonomousMode } from '@/hooks/useAutonomousMode'

export default function NewMissionPage() {
  const {
    missionId,
    title,
    objective,
    mode,
    status,
    plan,
    currentStep,
    totalSteps,
    currentStage,
    thinking,
    artifacts,
    sources,
    checkpoint,
    finalContent,
    error,
    selectedTeam,
    budgetSpent,
    budgetLimit,
    startedAt,
    toolCalls,
    startMission,
    respondToCheckpoint,
    abortMission,
    reset,
    isIdle,
    isPlanning,
    isRunning,
    isAwaitingCheckpoint,
    isComplete,
    hasFailed,
    isActive,
    progress,
  } = useAutonomousMode()

  const handleStartMission = (data: {
    objective: string
    mode: 3 | 4
    selectedAgents: string[]
    budgetLimit: number
    title?: string
    templateId?: string
  }) => {
    startMission({
      objective: data.objective,
      mode: data.mode,
      selectedAgents: data.selectedAgents,
      budgetLimit: data.budgetLimit,
      title: data.title,
      templateId: data.templateId,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/ask-expert/missions" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold">
                  {isIdle ? 'New Mission' : isComplete ? 'Mission Complete' : hasFailed ? 'Mission Failed' : title || 'Mission'}
                </h1>
                {missionId && <p className="text-sm text-gray-500">ID: {missionId}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isActive && <span className="text-sm text-gray-500">{Math.round(progress)}%</span>}
              {!isIdle && <StatusBadge status={status} />}
              {(isComplete || hasFailed) && (
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  New Mission
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {isIdle && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-6">Define Your Mission</h2>
              <MissionForm onSubmit={handleStartMission} isLoading={isPlanning} />
            </div>
          )}

          {isActive && (
            <>
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <MissionProgress
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  stage={currentStage}
                  thinking={thinking}
                  status={status}
                  budgetSpent={budgetSpent}
                  budgetLimit={budgetLimit}
                  startedAt={startedAt}
                />
              </div>

              {objective && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Objective</h3>
                  <p className="text-gray-900">{objective}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${mode === 4 ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      Mode {mode === 4 ? '4 (Automatic)' : '3 (Manual)'}
                    </span>
                    {selectedTeam.length > 0 && <span className="text-xs text-gray-500">Team: {selectedTeam.join(', ')}</span>}
                  </div>
                </div>
              )}

              {plan.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <MissionPlan steps={plan} currentStep={currentStep} />
                </div>
              )}

              {artifacts.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <ArtifactViewer artifacts={artifacts} />
                </div>
              )}

              {toolCalls.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <ToolCallList toolCalls={toolCalls} />
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={abortMission}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Abort Mission
                </button>
              </div>
            </>
          )}

          {isComplete && (
            <>
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-4">Final Report</h2>
                <FinalReport content={finalContent} artifacts={artifacts} sources={sources} />
              </div>
            </>
          )}

          {hasFailed && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                <div>
                  <h2 className="text-lg font-semibold text-red-800">Mission Failed</h2>
                  <p className="text-sm text-red-600 mt-1">{error || 'An unexpected error occurred'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <CheckpointModal checkpoint={checkpoint} isOpen={isAwaitingCheckpoint} onRespond={respondToCheckpoint} onDismiss={() => abortMission()} />
    </div>
  )
}
