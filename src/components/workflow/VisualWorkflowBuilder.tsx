'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus,
  Settings,
  Play,
  ArrowRight,
  Edit,
  Trash2,
  Move,
  Square,
  Circle,
  Diamond,
  Save
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'start' | 'process' | 'decision' | 'end';
  position: { x: number; y: number };
  agent?: string;
  inputs?: string[];
  outputs?: string[];
}

interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
  condition?: string;
}

interface VisualWorkflowBuilderProps {
  workflow: any;
  onSave: (workflow: any) => void;
}

export function VisualWorkflowBuilder({ workflow, onSave }: VisualWorkflowBuilderProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>(() => {
    // Convert workflow steps to visual format
    const workflowSteps = workflow.steps || [];
    const visualSteps: WorkflowStep[] = [];

    // Add start step
    visualSteps.push({
      id: 'start',
      name: 'Start',
      description: 'Workflow begins',
      type: 'start',
      position: { x: 50, y: 50 }
    });

    // Convert workflow steps
    workflowSteps.forEach((step: any, index: number) => {
      visualSteps.push({
        id: step.id?.toString() || `step-${index}`,
        name: step.step_name || step.name || `Step ${index + 1}`,
        description: step.step_description || step.description || 'Process step',
        type: step.conditional_next && step.conditional_next.length > 0 ? 'decision' : 'process',
        position: step.position || {
          x: 50 + (index + 1) * 200,
          y: 50 + Math.floor(index / 3) * 150
        },
        agent: step.agent_selection?.strategy || step.agent_id || 'LLM',
        inputs: step.required_capabilities || [],
        outputs: step.outputs || []
      });
    });

    // Add end step
    if (workflowSteps.length > 0) {
      visualSteps.push({
        id: 'end',
        name: 'End',
        description: 'Workflow completed',
        type: 'end',
        position: {
          x: 50 + (workflowSteps.length + 1) * 200,
          y: 50
        }
      });
    }

    return visualSteps;
  });

  const [connections, setConnections] = useState<WorkflowConnection[]>(() => {
    // Create automatic connections between sequential steps
    const workflowSteps = workflow.steps || [];
    const autoConnections: WorkflowConnection[] = [];

    // Connect start to first step
    if (workflowSteps.length > 0) {
      autoConnections.push({
        id: 'start-to-first',
        from: 'start',
        to: workflowSteps[0].id?.toString() || 'step-0'
      });
    }

    // Connect sequential steps
    for (let i = 0; i < workflowSteps.length - 1; i++) {
      const currentStep = workflowSteps[i];
      const nextStep = workflowSteps[i + 1];

      autoConnections.push({
        id: `step-${i}-to-${i + 1}`,
        from: currentStep.id?.toString() || `step-${i}`,
        to: nextStep.id?.toString() || `step-${i + 1}`
      });
    }

    // Connect last step to end
    if (workflowSteps.length > 0) {
      const lastStep = workflowSteps[workflowSteps.length - 1];
      autoConnections.push({
        id: 'last-to-end',
        from: lastStep.id?.toString() || `step-${workflowSteps.length - 1}`,
        to: 'end'
      });
    }

    return autoConnections;
  });
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
  const [draggedStep, setDraggedStep] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);

  const stepTypes = [
    { value: 'start', label: 'Start', icon: Circle, color: 'bg-green-500' },
    { value: 'process', label: 'Process', icon: Square, color: 'bg-blue-500' },
    { value: 'decision', label: 'Decision', icon: Diamond, color: 'bg-yellow-500' },
    { value: 'end', label: 'End', icon: Circle, color: 'bg-red-500' }
  ];

  const getStepIcon = (type: string) => {
    const stepType = stepTypes.find(t => t.value === type);
    return stepType?.icon || Square;
  };

  const getStepColor = (type: string) => {
    const stepType = stepTypes.find(t => t.value === type);
    return stepType?.color || 'bg-gray-500';
  };

  const handleAddStep = (type: 'process' | 'decision' | 'end') => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      name: type === 'process' ? 'New Process' : type === 'decision' ? 'New Decision' : 'End',
      description: `${type} step`,
      type,
      position: { x: 300, y: 200 + steps.length * 100 }
    };

    setSteps([...steps, newStep]);
  };

  const handleStepEdit = (step: WorkflowStep) => {
    setSelectedStep(step);
    setIsStepDialogOpen(true);
  };

  const handleStepUpdate = (updatedStep: WorkflowStep) => {
    setSteps(steps.map(step => step.id === updatedStep.id ? updatedStep : step));
    setIsStepDialogOpen(false);
    setSelectedStep(null);
  };

  const handleStepDelete = (stepId: string) => {
    if (stepId === 'start') return; // Don't allow deleting start step

    setSteps(steps.filter(step => step.id !== stepId));
    setConnections(connections.filter(conn => conn.from !== stepId && conn.to !== stepId));
  };

  const handleMouseDown = (e: React.MouseEvent, stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - step.position.x,
      y: e.clientY - step.position.y
    });
    setDraggedStep(stepId);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedStep || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;

    setSteps(steps => steps.map(step =>
      step.id === draggedStep
        ? { ...step, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
        : step
    ));
  }, [draggedStep, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setDraggedStep(null);
  }, []);

  React.useEffect(() => {
    if (draggedStep) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedStep, handleMouseMove, handleMouseUp]);

  const handleSave = () => {
    const updatedWorkflow = {
      ...workflow,
      steps: steps.map(step => ({
        id: step.id,
        name: step.name,
        description: step.description,
        type: step.type,
        agent: step.agent || 'LLM',
        inputs: step.inputs || [],
        outputs: step.outputs || []
      })),
      connections
    };
    onSave(updatedWorkflow);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{workflow.name}</h3>
          <Badge variant="secondary">{workflow.category}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAddStep('process')}
            className="flex items-center gap-1"
          >
            <Square className="h-4 w-4" />
            Process
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAddStep('decision')}
            className="flex items-center gap-1"
          >
            <Diamond className="h-4 w-4" />
            Decision
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAddStep('end')}
            className="flex items-center gap-1"
          >
            <Circle className="h-4 w-4" />
            End
          </Button>
          <div className="w-px h-6 bg-gray-300" />
          <Button size="sm" onClick={handleSave} className="flex items-center gap-1">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-auto bg-gray-100" ref={canvasRef}>
        <div className="absolute inset-0 min-w-full min-h-full">
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />

          {/* Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map((connection) => {
              const fromStep = steps.find(s => s.id === connection.from);
              const toStep = steps.find(s => s.id === connection.to);

              if (!fromStep || !toStep) return null;

              const x1 = fromStep.position.x + 60;
              const y1 = fromStep.position.y + 30;
              const x2 = toStep.position.x + 60;
              const y2 = toStep.position.y + 30;

              return (
                <g key={connection.id}>
                  <path
                    d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y1} ${x2} ${y2}`}
                    stroke="#6b7280"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              );
            })}

            {/* Arrow marker */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#6b7280"
                />
              </marker>
            </defs>
          </svg>

          {/* Steps */}
          {steps.map((step) => {
            const StepIcon = getStepIcon(step.type);

            return (
              <div
                key={step.id}
                className={`absolute w-40 h-20 ${getStepColor(step.type)} rounded-lg shadow-md cursor-move
                          text-white font-medium text-sm hover:shadow-lg transition-shadow border-2 border-white
                          ${draggedStep === step.id ? 'opacity-80 scale-105' : ''}`}
                style={{
                  left: step.position.x,
                  top: step.position.y,
                  userSelect: 'none'
                }}
                onMouseDown={(e) => handleMouseDown(e, step.id)}
              >
                <div className="p-2 h-full flex flex-col">
                  <div className="flex items-center mb-1">
                    <StepIcon className="h-4 w-4 mr-1" />
                    <div className="text-xs truncate flex-1">{step.name}</div>
                  </div>
                  {step.agent && (
                    <div className="text-xs opacity-80 mb-1">
                      Agent: {step.agent}
                    </div>
                  )}
                  <div className="text-xs opacity-70 flex-1 overflow-hidden">
                    {step.description?.substring(0, 40)}...
                  </div>
                </div>

                {/* Action buttons */}
                <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStepEdit(step);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  {step.id !== 'start' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStepDelete(step.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Edit Dialog */}
      <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Step</DialogTitle>
          </DialogHeader>
          {selectedStep && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Step Name</label>
                <Input
                  value={selectedStep.name}
                  onChange={(e) => setSelectedStep({
                    ...selectedStep,
                    name: e.target.value
                  })}
                  placeholder="Enter step name"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={selectedStep.description}
                  onChange={(e) => setSelectedStep({
                    ...selectedStep,
                    description: e.target.value
                  })}
                  placeholder="Enter step description"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Step Type</label>
                <Select
                  value={selectedStep.type}
                  onValueChange={(value: any) => setSelectedStep({
                    ...selectedStep,
                    type: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stepTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Agent</label>
                <Select
                  value={selectedStep.agent || 'LLM'}
                  onValueChange={(value) => setSelectedStep({
                    ...selectedStep,
                    agent: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="capability_based">Capability Based</SelectItem>
                    <SelectItem value="automatic">Automatic Selection</SelectItem>
                    <SelectItem value="LLM">LLM Agent</SelectItem>
                    <SelectItem value="Human">Human Agent</SelectItem>
                    <SelectItem value="API">API Agent</SelectItem>
                    <SelectItem value="Database">Database Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedStep.inputs && selectedStep.inputs.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Required Capabilities</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedStep.inputs.map((capability, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsStepDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleStepUpdate(selectedStep)}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}