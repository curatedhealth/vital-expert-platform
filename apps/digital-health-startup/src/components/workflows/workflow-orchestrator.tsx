"use client";

import {
  Play,
  Pause,
  Square,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  GitBranch,
  Plus,
  Edit,
  Eye,
  Download,
  Upload
} from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Progress } from '@/shared/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'agent_task' | 'decision' | 'approval' | 'data_transform' | 'notification';
  agentType?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  input?: any;
  output?: any;
  error?: string;
  duration?: number;
  startTime?: Date;
  endTime?: Date;
  dependencies: string[];
  conditions?: {
    success?: string;
    failure?: string;
  };
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created: Date;
  updated: Date;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  steps: WorkflowStep[];
  metadata: {
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    progress: number;
    estimatedDuration?: number;
  };
  config: {
    autoRetry: boolean;
    maxRetries: number;
    timeout: number;
    parallelExecution: boolean;
  };
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'clinical_development' | 'regulatory' | 'market_access' | 'general';
  steps: Omit<WorkflowStep, 'status' | 'startTime' | 'endTime' | 'duration' | 'input' | 'output' | 'error'>[];
}

const MOCK_WORKFLOWS: Workflow[] = [
  {
    id: 'wf-001',
    name: 'Drug Development Pipeline',
    description: 'Comprehensive drug development workflow from preclinical to market access',
    version: '2.1.0',
    status: 'active',
    priority: 'high',
    created: new Date('2024-01-15'),
    updated: new Date(),
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    steps: [
      {
        id: 'step-001',
        name: 'Preclinical Assessment',
        type: 'agent_task',
        agentType: 'clinical_trial_designer',
        status: 'completed',
        startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
        duration: 30 * 60 * 1000,
        dependencies: [],
        output: 'Preclinical package validated with positive efficacy signals'
      },
      {
        id: 'step-002',
        name: 'Phase I Design',
        type: 'agent_task',
        agentType: 'clinical_trial_designer',
        status: 'completed',
        startTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 2.8 * 60 * 60 * 1000),
        duration: 42 * 60 * 1000,
        dependencies: ['step-001'],
        output: 'Phase I protocol designed with dose escalation scheme'
      },
      {
        id: 'step-003',
        name: 'Regulatory Strategy',
        type: 'agent_task',
        agentType: 'regulatory_strategist',
        status: 'running',
        startTime: new Date(Date.now() - 2.8 * 60 * 60 * 1000),
        dependencies: ['step-002']
      },
      {
        id: 'step-004',
        name: 'Market Access Planning',
        type: 'agent_task',
        agentType: 'market_access_strategist',
        status: 'pending',
        dependencies: ['step-003']
      },
      {
        id: 'step-005',
        name: 'Advisory Board Review',
        type: 'agent_task',
        agentType: 'virtual_advisory_board',
        status: 'pending',
        dependencies: ['step-003', 'step-004']
      }
    ],
    metadata: {
      totalSteps: 5,
      completedSteps: 2,
      failedSteps: 0,
      progress: 40
    },
    config: {
      autoRetry: true,
      maxRetries: 3,
      timeout: 7200000,
      parallelExecution: true
    }
  },
  {
    id: 'wf-002',
    name: 'Regulatory Submission Package',
    description: 'End-to-end regulatory submission preparation and review process',
    version: '1.5.0',
    status: 'paused',
    priority: 'medium',
    created: new Date('2024-02-01'),
    updated: new Date(Date.now() - 2 * 60 * 60 * 1000),
    startTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
    steps: [
      {
        id: 'step-101',
        name: 'Document Collection',
        type: 'data_transform',
        status: 'completed',
        dependencies: []
      },
      {
        id: 'step-102',
        name: 'Regulatory Assessment',
        type: 'agent_task',
        agentType: 'regulatory_strategist',
        status: 'completed',
        dependencies: ['step-101']
      },
      {
        id: 'step-103',
        name: 'Quality Review',
        type: 'approval',
        status: 'failed',
        error: 'Missing CMC section documentation',
        dependencies: ['step-102']
      }
    ],
    metadata: {
      totalSteps: 3,
      completedSteps: 2,
      failedSteps: 1,
      progress: 67
    },
    config: {
      autoRetry: false,
      maxRetries: 2,
      timeout: 3600000,
      parallelExecution: false
    }
  },
  {
    id: 'wf-003',
    name: 'Market Entry Strategy',
    description: 'Comprehensive market access and commercialization planning workflow',
    version: '1.0.0',
    status: 'draft',
    priority: 'low',
    created: new Date('2024-02-10'),
    updated: new Date('2024-02-10'),
    steps: [
      {
        id: 'step-201',
        name: 'Market Analysis',
        type: 'agent_task',
        agentType: 'market_access_strategist',
        status: 'pending',
        dependencies: []
      },
      {
        id: 'step-202',
        name: 'Competitive Assessment',
        type: 'agent_task',
        agentType: 'market_access_strategist',
        status: 'pending',
        dependencies: ['step-201']
      },
      {
        id: 'step-203',
        name: 'Pricing Strategy',
        type: 'agent_task',
        agentType: 'market_access_strategist',
        status: 'pending',
        dependencies: ['step-202']
      }
    ],
    metadata: {
      totalSteps: 3,
      completedSteps: 0,
      failedSteps: 0,
      progress: 0
    },
    config: {
      autoRetry: true,
      maxRetries: 2,
      timeout: 5400000,
      parallelExecution: true
    }
  }
];

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'template-001',
    name: 'Clinical Development Standard',
    description: 'Standard clinical development workflow template',
    category: 'clinical_development',
    steps: [
      {
        id: 'temp-step-1',
        name: 'Protocol Design',
        type: 'agent_task',
        agentType: 'clinical_trial_designer',
        dependencies: []
      },
      {
        id: 'temp-step-2',
        name: 'Regulatory Review',
        type: 'agent_task',
        agentType: 'regulatory_strategist',
        dependencies: ['temp-step-1']
      },
      {
        id: 'temp-step-3',
        name: 'Market Assessment',
        type: 'agent_task',
        agentType: 'market_access_strategist',
        dependencies: ['temp-step-2']
      }
    ]
  }
];

const WorkflowCard: React.FC<{
  workflow: Workflow;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onStop: (id: string) => void;
  onView: (workflow: Workflow) => void;
  onEdit: (workflow: Workflow) => void;
  onDelete: (id: string) => void;
}> = ({ workflow, onStart, onPause, onStop, onView, onEdit, onDelete }) => {

    draft: { color: 'bg-gray-100 text-gray-800', icon: Edit },
    active: { color: 'bg-green-100 text-green-800', icon: Play },
    paused: { color: 'bg-yellow-100 text-yellow-800', icon: Pause },
    completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    failed: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
    cancelled: { color: 'bg-gray-100 text-gray-800', icon: Square }
  };

    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{workflow.name}</CardTitle>
              <Badge className={config.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {workflow.status}
              </Badge>
              <Badge className={priorityConfig[workflow.priority]}>
                {workflow.priority}
              </Badge>
            </div>
            <CardDescription className="text-sm">
              {workflow.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{workflow.metadata.progress}%</span>
          </div>
          <Progress value={workflow.metadata.progress} />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{workflow.metadata.completedSteps}/{workflow.metadata.totalSteps} steps</span>
            {workflow.metadata.failedSteps > 0 && (
              <span className="text-red-600">{workflow.metadata.failedSteps} failed</span>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Created: {workflow.created.toLocaleDateString()}</div>
          <div>Updated: {workflow.updated.toLocaleDateString()}</div>
          {workflow.startTime && (
            <div>
              Started: {workflow.startTime.toLocaleString()}
              {workflow.status === 'active' && (
                <span className="ml-2">
                  (Running for {Math.round((Date.now() - workflow.startTime.getTime()) / (60 * 1000))} min)
                </span>
              )}
            </div>
          )}
          {workflow.endTime && (
            <div>Completed: {workflow.endTime.toLocaleString()}</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          {workflow.status === 'draft' && (
            <Button size="sm" onClick={() => onStart(workflow.id)}>
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          )}
          {workflow.status === 'active' && (
            <Button variant="outline" size="sm" onClick={() => onPause(workflow.id)}>
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          )}
          {workflow.status === 'paused' && (
            <Button size="sm" onClick={() => onStart(workflow.id)}>
              <Play className="h-4 w-4 mr-1" />
              Resume
            </Button>
          )}
          {(workflow.status === 'active' || workflow.status === 'paused') && (
            <Button variant="destructive" size="sm" onClick={() => onStop(workflow.id)}>
              <Square className="h-4 w-4 mr-1" />
              Stop
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onView(workflow)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(workflow)}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const WorkflowStepItem: React.FC<{ step: WorkflowStep; isFirst: boolean; isLast: boolean }> = ({
  step,
  isFirst,
  isLast
}) => {

    pending: { color: 'bg-gray-200', textColor: 'text-gray-600', icon: Clock },
    running: { color: 'bg-blue-500', textColor: 'text-blue-600', icon: RefreshCw },
    completed: { color: 'bg-green-500', textColor: 'text-green-600', icon: CheckCircle },
    failed: { color: 'bg-red-500', textColor: 'text-red-600', icon: AlertTriangle },
    skipped: { color: 'bg-gray-300', textColor: 'text-gray-500', icon: ArrowRight }
  };

  return (
    <div className="flex items-start gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}>
          <StatusIcon className={`h-4 w-4 ${step.status === 'pending' ? 'text-gray-500' : 'text-white'}`} />
        </div>
        {!isLast && <div className="w-0.5 h-12 bg-gray-200 mt-2" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-8">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-gray-900">{step.name}</h4>
          <Badge className={`${config.textColor} bg-transparent border-current`}>
            {step.status}
          </Badge>
        </div>

        <div className="text-sm text-gray-600 mb-2">
          Type: {step.type.replace('_', ' ')}
          {step.agentType && ` • Agent: ${step.agentType.replace('_', ' ')}`}
        </div>

        {step.duration && (
          <div className="text-xs text-gray-500">
            Duration: {Math.round(step.duration / 1000)}s
          </div>
        )}

        {step.output && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
            <strong>Output:</strong> {step.output}
          </div>
        )}

        {step.error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
            <strong>Error:</strong> {step.error}
          </div>
        )}

        {step.dependencies.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            Dependencies: {step.dependencies.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

const WorkflowViewer: React.FC<{
  workflow: Workflow | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ workflow, isOpen, onClose }) => {
  if (!workflow) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            {workflow.name}
          </DialogTitle>
          <DialogDescription>
            {workflow.description} • Version {workflow.version}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Workflow Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-900">Status</div>
              <div className="text-sm text-gray-600">{workflow.status}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Priority</div>
              <div className="text-sm text-gray-600">{workflow.priority}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Progress</div>
              <div className="text-sm text-gray-600">
                {workflow.metadata.progress}% ({workflow.metadata.completedSteps}/{workflow.metadata.totalSteps} steps)
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Duration</div>
              <div className="text-sm text-gray-600">
                {workflow.startTime ? (
                  workflow.endTime ? (
                    `${Math.round((workflow.endTime.getTime() - workflow.startTime.getTime()) / (60 * 1000))} min`
                  ) : (
                    `${Math.round((Date.now() - workflow.startTime.getTime()) / (60 * 1000))} min (running)`
                  )
                ) : (
                  'Not started'
                )}
              </div>
            </div>
          </div>

          {/* Steps */}
          <div>
            <h3 className="text-lg font-medium mb-4">Workflow Steps</h3>
            <div className="space-y-0">
              {workflow.steps.map((step, index) => (
                <WorkflowStepItem
                  key={step.id}
                  step={step}
                  isFirst={index === 0}
                  isLast={index === workflow.steps.length - 1}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const WorkflowOrchestrator: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(MOCK_WORKFLOWS);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

    setWorkflows(prev => prev.map(wf =>
      wf.id === id
        ? { ...wf, status: 'active' as const, startTime: new Date() }
        : wf
    ));
  };

    setWorkflows(prev => prev.map(wf =>
      wf.id === id ? { ...wf, status: 'paused' as const } : wf
    ));
  };

    setWorkflows(prev => prev.map(wf =>
      wf.id === id
        ? { ...wf, status: 'cancelled' as const, endTime: new Date() }
        : wf
    ));
  };

    setSelectedWorkflow(workflow);
    setViewerOpen(true);
  };

    // TODO: Implement workflow editor
    // };

    setWorkflows(prev => prev.filter(wf => wf.id !== id));
  };

                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch && matchesStatus && matchesPriority;
  });

    total: workflows.length,
    active: workflows.filter((w: any) => w.status === 'active').length,
    completed: workflows.filter((w: any) => w.status === 'completed').length,
    failed: workflows.filter((w: any) => w.status === 'failed').length,
    draft: workflows.filter((w: any) => w.status === 'draft').length
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflow Orchestrator</h1>
          <p className="text-gray-600 mt-1">
            Design, execute, and monitor complex AI-driven workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{workflowStats.total}</div>
            <div className="text-sm text-gray-600">Total Workflows</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{workflowStats.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{workflowStats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{workflowStats.failed}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{workflowStats.draft}</div>
            <div className="text-sm text-gray-600">Draft</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search workflows..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredWorkflows.map((workflow) => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            onStart={handleStartWorkflow}
            onPause={handlePauseWorkflow}
            onStop={handleStopWorkflow}
            onView={handleViewWorkflow}
            onEdit={handleEditWorkflow}
            onDelete={handleDeleteWorkflow}
          />
        ))}
      </div>

      {/* Workflow Viewer Dialog */}
      <WorkflowViewer
        workflow={selectedWorkflow}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
};

export default WorkflowOrchestrator;