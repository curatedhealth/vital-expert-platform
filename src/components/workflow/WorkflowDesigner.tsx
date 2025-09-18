'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  EdgeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Play, Save, Settings, GitBranch, Users,
  AlertCircle, CheckCircle, Clock, DollarSign,
  Plus, Trash2, Edit3, Copy
} from 'lucide-react';

import {
  EnhancedWorkflowDefinition,
  EnhancedWorkflowStep,
  WorkflowTemplate,
  ValidationResult,
  WorkflowDesignerProps
} from '@/types/workflow-enhanced';
import { Agent } from '@/lib/agents/agent-service';

import { WorkflowStepNode } from './WorkflowStepNode';
import { StepLibraryPanel } from './StepLibraryPanel';
import { StepPropertiesPanel } from './StepPropertiesPanel';
import { AgentSelectionPanel } from './AgentSelectionPanel';
import { ConditionalLogicPanel } from './ConditionalLogicPanel';
import { TemplateLibraryModal } from './TemplateLibraryModal';

// Custom node types for React Flow
const nodeTypes: NodeTypes = {
  workflowStep: WorkflowStepNode,
};

// Custom edge types
const edgeTypes: EdgeTypes = {};

export const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({
  workflowId,
  onSave,
  onTest,
  availableAgents,
  templates
}) => {
  const [workflow, setWorkflow] = useState<EnhancedWorkflowDefinition | null>(null);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Initialize workflow
  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
    } else {
      initializeEmptyWorkflow();
    }
  }, [workflowId]);

  // Convert workflow to nodes/edges when workflow changes
  useEffect(() => {
    if (workflow) {
      convertWorkflowToNodes(workflow);
    }
  }, [workflow]);

  const loadWorkflow = async (id: string) => {
    try {
      const response = await fetch(`/api/workflows/${id}`);
      if (response.ok) {
        const data = await response.json();
        setWorkflow(data);
      } else {
        console.error('Failed to load workflow');
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
    }
  };

  const initializeEmptyWorkflow = () => {
    const emptyWorkflow: EnhancedWorkflowDefinition = {
      id: crypto.randomUUID(),
      name: 'New Pharmaceutical Workflow',
      description: '',
      version: '1.0',
      category: 'Custom',
      steps: [],
      conditional_logic: [],
      parallel_branches: [],
      error_strategies: [],
      success_criteria: {
        required_outputs: [],
        quality_thresholds: {}
      },
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    setWorkflow(emptyWorkflow);
  };

  const convertWorkflowToNodes = (workflow: EnhancedWorkflowDefinition) => {
    const newNodes: Node[] = workflow.steps.map((step, index) => ({
      id: step.id,
      type: 'workflowStep',
      position: step.position || {
        x: 200 + (index % 3) * 300,
        y: 100 + Math.floor(index / 3) * 200
      },
      data: {
        step,
        agent: availableAgents.find(a => a.id === step.agent_id),
        capabilities: step.required_capabilities,
        isSelected: step.id === selectedStep,
        onSelect: (stepId: string) => setSelectedStep(stepId),
        onUpdate: (updates: Partial<EnhancedWorkflowStep>) => updateStep(step.id, updates),
        onDelete: () => deleteStep(step.id)
      }
    }));

    const newEdges: Edge[] = [];
    workflow.steps.forEach(step => {
      step.conditional_next?.forEach((cond, index) => {
        newEdges.push({
          id: `${step.id}-${cond.next_step_id}-${index}`,
          source: step.id,
          target: cond.next_step_id,
          label: cond.condition === 'true' ? '' : cond.condition,
          type: cond.condition === 'true' ? 'default' : 'smoothstep',
          animated: true,
          style: {
            stroke: cond.condition === 'true' ? '#6366f1' : '#f59e0b',
            strokeWidth: 2
          }
        });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const handleAddStep = useCallback((stepType: string, position: { x: number, y: number }) => {
    if (!workflow) return;

    const newStepId = crypto.randomUUID();
    const newStep: EnhancedWorkflowStep = {
      id: newStepId,
      jtbd_id: workflow.id,
      step_number: workflow.steps.length + 1,
      step_name: `New ${stepType} Step`,
      step_description: '',
      estimated_duration: 30,
      required_capabilities: getDefaultCapabilities(stepType),
      agent_selection: {
        strategy: 'automatic',
        criteria: {}
      },
      position,
      validation_rules: [],
      monitoring_config: {
        track_performance: true,
        alert_on_failure: true
      }
    };

    setWorkflow(prev => ({
      ...prev!,
      steps: [...prev!.steps, newStep]
    }));

    // Auto-select the new step
    setSelectedStep(newStepId);
  }, [workflow]);

  const getDefaultCapabilities = (stepType: string): string[] => {
    const capabilityMap: Record<string, string[]> = {
      'Regulatory Analysis': ['regulatory_analysis', 'fda_expertise'],
      'Clinical Design': ['clinical_design', 'protocol_development'],
      'Market Access': ['market_analysis', 'hta_analysis'],
      'Data Analysis': ['data_analysis', 'statistical_analysis'],
      'Report Generation': ['report_generation', 'medical_writing'],
      'Quality Review': ['quality_assessment', 'compliance_analysis']
    };
    return capabilityMap[stepType] || [];
  };

  const updateStep = useCallback((stepId: string, updates: Partial<EnhancedWorkflowStep>) => {
    if (!workflow) return;

    setWorkflow(prev => ({
      ...prev!,
      steps: prev!.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
  }, [workflow]);

  const deleteStep = useCallback((stepId: string) => {
    if (!workflow) return;

    setWorkflow(prev => ({
      ...prev!,
      steps: prev!.steps.filter(step => step.id !== stepId)
    }));

    if (selectedStep === stepId) {
      setSelectedStep(null);
    }
  }, [workflow, selectedStep]);

  const handleConnect = useCallback((params: Connection) => {
    if (!workflow || !params.source || !params.target) return;

    // Add edge to React Flow
    setEdges(eds => addEdge({
      ...params,
      type: 'default',
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 }
    }, eds));

    // Update workflow step with conditional logic
    setWorkflow(prev => ({
      ...prev!,
      steps: prev!.steps.map(step =>
        step.id === params.source
          ? {
              ...step,
              conditional_next: [
                ...(step.conditional_next || []),
                {
                  condition: 'true',
                  next_step_id: params.target!,
                  priority: 1
                }
              ]
            }
          : step
      )
    }));
  }, [workflow]);

  const validateWorkflow = useCallback(async () => {
    if (!workflow) return false;

    setIsValidating(true);
    try {
      const response = await fetch('/api/workflows/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow)
      });

      if (response.ok) {
        const result = await response.json();
        setValidationResult(result);
        return result.isValid;
      } else {
        setValidationResult({
          isValid: false,
          errors: [{ type: 'system_error', message: 'Validation service unavailable' }],
          warnings: []
        });
        return false;
      }
    } catch (error) {
      console.error('Validation failed:', error);
      setValidationResult({
        isValid: false,
        errors: [{ type: 'system_error', message: 'Validation failed' }],
        warnings: []
      });
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [workflow]);

  const handleSave = useCallback(async () => {
    if (!workflow) return;

    setIsSaving(true);
    try {
      const isValid = await validateWorkflow();
      if (!isValid) {
        return; // Validation errors will be shown
      }

      await onSave(workflow);
    } catch (error) {
      console.error('Failed to save workflow:', error);
    } finally {
      setIsSaving(false);
    }
  }, [workflow, validateWorkflow, onSave]);

  const handleTest = useCallback(async () => {
    if (!workflow) return;

    setIsTestMode(true);
    try {
      const testData = {
        test_scenario: 'Test execution with sample data',
        test_inputs: {
          company_name: 'Test Pharmaceutical Company',
          product_type: 'Digital Therapeutic',
          target_indication: 'Depression'
        }
      };

      await onTest(workflow, testData);
    } catch (error) {
      console.error('Failed to test workflow:', error);
    } finally {
      setIsTestMode(false);
    }
  }, [workflow, onTest]);

  const applyTemplate = useCallback((template: WorkflowTemplate) => {
    const customizedWorkflow = {
      ...template.template_data,
      id: workflow?.id || crypto.randomUUID(),
      name: template.name + ' (Customized)',
      version: '1.0'
    };

    setWorkflow(customizedWorkflow);
    setShowTemplates(false);
  }, [workflow]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedStep(node.id);
  }, []);

  const getWorkflowStats = () => {
    if (!workflow) return { steps: 0, duration: 0, agents: 0, cost: '$0.00' };

    const steps = workflow.steps.length;
    const duration = workflow.steps.reduce((sum, s) => sum + (s.estimated_duration || 0), 0);
    const agents = new Set(workflow.steps.map(s => s.agent_id).filter(Boolean)).size;
    const cost = `$${(steps * 0.15 + duration * 0.02).toFixed(2)}`;

    return { steps, duration, agents, cost };
  };

  const stats = getWorkflowStats();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="workflow-designer h-screen flex flex-col bg-gray-50">
        {/* Header Toolbar */}
        <div className="bg-white border-b shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {workflow?.name || 'Workflow Designer'}
                </h1>
                <p className="text-sm text-gray-600">
                  {workflow?.description || 'Design your pharmaceutical workflow'}
                </p>
              </div>
              <div className="flex space-x-2">
                <Badge variant={workflow?.category === 'Regulatory' ? 'destructive' : 'default'}>
                  {workflow?.category}
                </Badge>
                <Badge variant="outline">v{workflow?.version}</Badge>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(true)}
              >
                Templates
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={validateWorkflow}
                disabled={isValidating}
              >
                {isValidating ? 'Validating...' : 'Validate'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={isTestMode || !workflow?.steps.length}
              >
                <Play className="w-4 h-4 mr-1" />
                {isTestMode ? 'Testing...' : 'Test'}
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !workflow?.steps.length}
              >
                <Save className="w-4 h-4 mr-1" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>

        {/* Validation Messages */}
        {validationResult && (
          <div className="p-4 bg-white border-b">
            {validationResult.errors.length > 0 && (
              <Alert variant="destructive" className="mb-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {validationResult.errors.length} validation error(s):
                  {validationResult.errors[0].message}
                </AlertDescription>
              </Alert>
            )}
            {validationResult.warnings.length > 0 && (
              <Alert className="mb-2">
                <AlertDescription>
                  {validationResult.warnings.length} warning(s) found
                </AlertDescription>
              </Alert>
            )}
            {validationResult.isValid && (
              <Alert className="mb-2 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Workflow is valid and ready for execution
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Left Panel - Step Library */}
          <div className="w-80 bg-white border-r overflow-y-auto">
            <StepLibraryPanel
              onAddStep={handleAddStep}
              categories={[
                'Regulatory Analysis',
                'Clinical Design',
                'Market Access',
                'Data Analysis',
                'Report Generation',
                'Quality Review'
              ]}
            />
          </div>

          {/* Center - Canvas */}
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={handleConnect}
              onNodeClick={handleNodeClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              className="bg-gray-50"
            >
              <Controls />
              <Background variant="dots" gap={20} size={1} />
            </ReactFlow>

            {/* Floating Analytics Panel */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-64">
              <h3 className="font-semibold text-sm mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Workflow Analytics
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center">
                    <GitBranch className="w-4 h-4 mr-1" />
                    Total Steps:
                  </span>
                  <span className="font-medium">{stats.steps}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Est. Duration:
                  </span>
                  <span className="font-medium">{stats.duration} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Agents Required:
                  </span>
                  <span className="font-medium">{stats.agents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Est. Cost:
                  </span>
                  <span className="font-medium">{stats.cost}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Properties */}
          <div className="w-96 bg-white border-l">
            <Tabs defaultValue="step" className="h-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="step">Properties</TabsTrigger>
                <TabsTrigger value="agents">Agents</TabsTrigger>
                <TabsTrigger value="conditions">Logic</TabsTrigger>
              </TabsList>

              <TabsContent value="step" className="p-4 h-full overflow-y-auto">
                <StepPropertiesPanel
                  step={selectedStep ? workflow?.steps.find(s => s.id === selectedStep) || null : null}
                  onUpdate={(updates) => {
                    if (selectedStep && workflow) {
                      updateStep(selectedStep, updates);
                    }
                  }}
                />
              </TabsContent>

              <TabsContent value="agents" className="p-4 h-full overflow-y-auto">
                <AgentSelectionPanel
                  step={selectedStep ? workflow?.steps.find(s => s.id === selectedStep) || null : null}
                  availableAgents={availableAgents}
                  onSelectAgent={(agentId) => {
                    if (selectedStep && workflow) {
                      updateStep(selectedStep, { agent_id: agentId });
                    }
                  }}
                  onSetStrategy={(strategy) => {
                    if (selectedStep && workflow) {
                      updateStep(selectedStep, {
                        agent_selection: {
                          strategy,
                          criteria: workflow.steps.find(s => s.id === selectedStep)?.agent_selection?.criteria || {}
                        }
                      });
                    }
                  }}
                />
              </TabsContent>

              <TabsContent value="conditions" className="p-4 h-full overflow-y-auto">
                <ConditionalLogicPanel
                  step={selectedStep ? workflow?.steps.find(s => s.id === selectedStep) || null : null}
                  allSteps={workflow?.steps || []}
                  onAddCondition={(condition) => {
                    if (selectedStep && workflow) {
                      const currentStep = workflow.steps.find(s => s.id === selectedStep);
                      if (currentStep) {
                        updateStep(selectedStep, {
                          conditional_next: [...(currentStep.conditional_next || []), condition]
                        });
                      }
                    }
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Template Modal */}
        {showTemplates && (
          <TemplateLibraryModal
            templates={templates}
            onSelectTemplate={applyTemplate}
            onClose={() => setShowTemplates(false)}
          />
        )}
      </div>
    </DndProvider>
  );
};