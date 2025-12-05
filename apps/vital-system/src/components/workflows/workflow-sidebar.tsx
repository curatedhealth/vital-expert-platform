'use client';

import { useState } from 'react';
import { ChevronRight, Play, Pause, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  code: string;
  title: string;
  position: number;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
}

interface Workflow {
  id: string;
  name: string;
  unique_id: string;
  description: string;
  position: number;
  status?: 'idle' | 'running' | 'completed' | 'failed';
  metadata?: {
    duration_minutes?: number;
    complexity?: string;
  };
}

interface WorkflowSidebarProps {
  workflows: Workflow[];
  tasks: Record<string, Task[]>;
  selectedWorkflowId?: string;
  selectedTaskId?: string;
  onWorkflowSelect?: (workflowId: string) => void;
  onTaskSelect?: (taskId: string) => void;
  onWorkflowRun?: (workflowId: string) => void;
}

const STATUS_CONFIG = {
  idle: {
    icon: Clock,
    color: 'text-neutral-500',
    bg: 'bg-neutral-100',
    label: 'Ready'
  },
  pending: {
    icon: Clock,
    color: 'text-neutral-500',
    bg: 'bg-neutral-100',
    label: 'Pending'
  },
  running: {
    icon: Loader2,
    color: 'text-blue-500',
    bg: 'bg-blue-100',
    label: 'Running',
    animate: true
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bg: 'bg-green-100',
    label: 'Completed'
  },
  failed: {
    icon: AlertCircle,
    color: 'text-red-500',
    bg: 'bg-red-100',
    label: 'Failed'
  }
};

export function WorkflowSidebar({
  workflows,
  tasks,
  selectedWorkflowId,
  selectedTaskId,
  onWorkflowSelect,
  onTaskSelect,
  onWorkflowRun
}: WorkflowSidebarProps) {
  const [expandedWorkflows, setExpandedWorkflows] = useState<Set<string>>(new Set([workflows[0]?.id]));

  const toggleWorkflow = (workflowId: string) => {
    const newExpanded = new Set(expandedWorkflows);
    if (newExpanded.has(workflowId)) {
      newExpanded.delete(workflowId);
    } else {
      newExpanded.add(workflowId);
    }
    setExpandedWorkflows(newExpanded);
  };

  const getWorkflowProgress = (workflowId: string) => {
    const workflowTasks = tasks[workflowId] || [];
    if (workflowTasks.length === 0) return 0;
    const completed = workflowTasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / workflowTasks.length) * 100);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold text-deep-charcoal">Workflows</h2>
        <p className="text-xs text-medical-gray mt-1">
          {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Workflows List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {workflows.map((workflow, idx) => {
          const isExpanded = expandedWorkflows.has(workflow.id);
          const isSelected = selectedWorkflowId === workflow.id;
          const workflowTasks = tasks[workflow.id] || [];
          const progress = getWorkflowProgress(workflow.id);
          const status = workflow.status || 'idle';
          const statusConfig = STATUS_CONFIG[status];
          const StatusIcon = statusConfig.icon;

          return (
            <Card
              key={workflow.id}
              className={cn(
                "transition-all duration-200 cursor-pointer",
                isSelected && "ring-2 ring-healthcare-accent shadow-md"
              )}
            >
              <CardContent className="p-3">
                {/* Workflow Header */}
                <div className="flex items-start gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 flex-shrink-0"
                    onClick={() => toggleWorkflow(workflow.id)}
                  >
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </Button>

                  <div
                    className="flex-1 min-w-0"
                    onClick={() => onWorkflowSelect?.(workflow.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        #{idx + 1}
                      </Badge>
                      <div className={cn("flex items-center gap-1", statusConfig.bg, "px-2 py-0.5 rounded")}>
                        <StatusIcon
                          className={cn("h-3 w-3", statusConfig.color, statusConfig.animate && "animate-spin")}
                        />
                        <span className={cn("text-xs font-medium", statusConfig.color)}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-sm text-deep-charcoal line-clamp-2 mb-2">
                      {workflow.name}
                    </h3>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-xs text-medical-gray mb-2">
                      {workflow.metadata?.duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{workflow.metadata.duration_minutes}m</span>
                        </div>
                      )}
                      {workflow.metadata?.complexity && (
                        <Badge variant="secondary" className="text-xs">
                          {workflow.metadata.complexity}
                        </Badge>
                      )}
                      <span className="ml-auto">{workflowTasks.length} tasks</span>
                    </div>

                    {/* Progress Bar */}
                    {status !== 'idle' && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs text-medical-gray mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-300",
                              status === 'completed' ? "bg-green-500" :
                              status === 'failed' ? "bg-red-500" :
                              "bg-blue-500"
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      size="sm"
                      variant={status === 'running' ? 'outline' : 'default'}
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onWorkflowRun?.(workflow.id);
                      }}
                      disabled={status === 'running'}
                    >
                      {status === 'running' ? (
                        <>
                          <Pause className="mr-1 h-3 w-3" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-1 h-3 w-3" />
                          Run Workflow
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Tasks List (when expanded) */}
                {isExpanded && workflowTasks.length > 0 && (
                  <div className="mt-3 ml-8 space-y-1.5 border-l-2 border-neutral-200 pl-3">
                    {workflowTasks
                      .sort((a, b) => a.position - b.position)
                      .map((task) => {
                        const taskStatus = task.status || 'pending';
                        const taskStatusConfig = STATUS_CONFIG[taskStatus];
                        const TaskStatusIcon = taskStatusConfig.icon;
                        const isTaskSelected = selectedTaskId === task.id;

                        return (
                          <div
                            key={task.id}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors hover:bg-white",
                              isTaskSelected && "bg-blue-50 border border-blue-200"
                            )}
                            onClick={() => onTaskSelect?.(task.id)}
                          >
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-healthcare-accent text-white text-xs flex items-center justify-center font-semibold">
                              {task.position}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-deep-charcoal truncate">
                                {task.title}
                              </p>
                              {task.duration && (
                                <p className="text-xs text-medical-gray">
                                  {task.duration}m
                                </p>
                              )}
                            </div>
                            <div className={cn(taskStatusConfig.bg, "p-1 rounded")}>
                              <TaskStatusIcon
                                className={cn("h-3 w-3", taskStatusConfig.color, taskStatusConfig.animate && "animate-spin")}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

