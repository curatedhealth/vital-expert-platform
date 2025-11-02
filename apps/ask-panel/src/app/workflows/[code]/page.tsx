/**
 * Use Case Detail Page
 * View workflows and tasks for a specific use case
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  ArrowLeft,
  Play,
  FileText,
  Clock,
  CheckCircle2,
  GitBranch,
  Users,
  Bot,
  ChevronRight,
} from 'lucide-react';
import { useRequireAuth } from '@/hooks/use-auth';
import { useUseCaseWithWorkflows, useWorkflowWithTasks } from '@/hooks/use-workflows';
import type { Workflow } from '@/types/workflow.types';
import { useState } from 'react';

export default function UseCaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

  // Fetch use case with workflows
  const { data: useCaseData, isLoading: ucLoading } = useUseCaseWithWorkflows(code);

  // Fetch selected workflow details
  const { data: workflowData } = useWorkflowWithTasks(selectedWorkflowId || '');

  if (authLoading || ucLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !useCaseData) {
    return null;
  }

  const { workflows, total_tasks, total_duration_minutes, ...useCase } = useCaseData;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => router.push('/workflows')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Workflows
              </Button>
              <Button onClick={() => router.push(`/workflows/${code}/execute`)}>
                <Play className="w-4 h-4 mr-2" />
                Execute Workflow
              </Button>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{useCase.code}</Badge>
                <Badge>{useCase.complexity}</Badge>
                <Badge variant="secondary">{useCase.domain}</Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{useCase.title}</h1>
              <p className="text-muted-foreground mt-2">{useCase.description}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <GitBranch className="w-4 h-4 text-blue-600" />
                <span className="text-muted-foreground">Workflows:</span>
                <span className="font-semibold">{workflows.length}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-muted-foreground">Tasks:</span>
                <span className="font-semibold">{total_tasks}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-semibold">{total_duration_minutes} min</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-purple-600" />
                <span className="text-muted-foreground">Deliverables:</span>
                <span className="font-semibold">{useCase.deliverables?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Workflows List */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workflows</CardTitle>
                <CardDescription>Select a workflow to view details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {workflows.map((workflow) => (
                  <WorkflowListItem
                    key={workflow.id}
                    workflow={workflow}
                    isSelected={selectedWorkflowId === workflow.id}
                    onClick={() => setSelectedWorkflowId(workflow.id)}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Prerequisites */}
            {useCase.prerequisites && useCase.prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Prerequisites</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {useCase.prerequisites.map((prereq, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" />
                        <span>{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Deliverables */}
            {useCase.deliverables && useCase.deliverables.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Deliverables</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {useCase.deliverables.map((deliverable, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <FileText className="w-4 h-4 mt-0.5 text-blue-600" />
                        <span>{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Workflow Details */}
          <div className="lg:col-span-2">
            {selectedWorkflowId && workflowData ? (
              <WorkflowDetails workflow={workflowData} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <GitBranch className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Select a workflow to view tasks and details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// WORKFLOW LIST ITEM
// ============================================================================

interface WorkflowListItemProps {
  workflow: Workflow;
  isSelected: boolean;
  onClick: () => void;
}

function WorkflowListItem({ workflow, isSelected, onClick }: WorkflowListItemProps) {
  const metadata = workflow.metadata as any;

  return (
    <button
      onClick={onClick}
      className={`
        w-full p-3 rounded-lg border text-left transition-all
        ${isSelected 
          ? 'border-primary bg-primary/5 shadow-sm' 
          : 'border-border hover:border-primary/50'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{workflow.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {workflow.description}
          </p>
          {metadata?.duration_minutes && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{metadata.duration_minutes} min</span>
            </div>
          )}
        </div>
        <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
    </button>
  );
}

// ============================================================================
// WORKFLOW DETAILS
// ============================================================================

interface WorkflowDetailsProps {
  workflow: import('@/types/workflow.types').WorkflowWithTasks;
}

function WorkflowDetails({ workflow }: WorkflowDetailsProps) {
  const { tasks } = workflow;
  const metadata = workflow.metadata as any;

  return (
    <div className="space-y-4">
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{workflow.name}</CardTitle>
              <CardDescription className="mt-2">{workflow.description}</CardDescription>
            </div>
            <Badge variant="outline">
              {tasks.length} Tasks
            </Badge>
          </div>
        </CardHeader>
        {metadata && (
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {metadata.duration_minutes && (
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-semibold">{metadata.duration_minutes} min</p>
                </div>
              )}
              {metadata.complexity && (
                <div>
                  <p className="text-muted-foreground">Complexity</p>
                  <p className="font-semibold">{metadata.complexity}</p>
                </div>
              )}
              {metadata.deliverables && (
                <div>
                  <p className="text-muted-foreground">Deliverables</p>
                  <p className="font-semibold">{metadata.deliverables.length}</p>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tasks</CardTitle>
          <CardDescription>Execution sequence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.map((task, idx) => {
              const extra = task.extra as any;
              return (
                <div key={task.id} className="flex gap-3">
                  {/* Position Indicator */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {task.position}
                    </div>
                    {idx < tasks.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>

                  {/* Task Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.objective}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {extra?.duration_minutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{extra.duration_minutes} min</span>
                            </div>
                          )}
                          {extra?.complexity && (
                            <Badge variant="outline" className="text-xs">
                              {extra.complexity}
                            </Badge>
                          )}
                          {extra?.deliverable && (
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              <span>{extra.deliverable}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Icons for AI/Human involvement */}
                      <div className="flex items-center gap-1">
                        <Bot className="w-4 h-4 text-blue-600" title="AI Agent" />
                        <Users className="w-4 h-4 text-green-600" title="Human Review" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

