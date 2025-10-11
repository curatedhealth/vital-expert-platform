// @ts-nocheck
'use client';

import {
  Play,
  Square,
  Diamond,
  Circle,
  ArrowRight,
  Save,
  Download,
  Eye,
  Settings,
  CheckCircle,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { useState, useRef, useCallback } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Textarea } from '@/shared/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';

import { WorkflowNode, WorkflowEdge, ClinicalWorkflow } from '../../types';

interface VisualProtocolDesignerProps {
  workflow?: ClinicalWorkflow;
  readonly?: boolean;
  onSave?: (workflow: ClinicalWorkflow) => void;
  onExport?: (format: 'PDF' | 'JSON' | 'BPMN') => void;
  onValidate?: (workflow: ClinicalWorkflow) => ValidationResult;
  className?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

interface ValidationError {
  nodeId?: string;
  edgeId?: string;
  message: string;
  severity: 'error' | 'warning';
}

interface DragState {
  isDragging: boolean;
  nodeType?: string;
  offset: { x: number; y: number };
}

const nodeTypes = 
  { type: 'start', label: 'Start', icon: Play, color: 'bg-green-100 border-green-500 text-green-800' },
  { type: 'end', label: 'End', icon: Square, color: 'bg-red-100 border-red-500 text-red-800' },
  { type: 'activity', label: 'Activity', icon: Circle, color: 'bg-blue-100 border-blue-500 text-blue-800' },
  { type: 'gateway', label: 'Decision', icon: Diamond, color: 'bg-yellow-100 border-yellow-500 text-yellow-800' },
  { type: 'event', label: 'Event', icon: AlertTriangle, color: 'bg-purple-100 border-purple-500 text-purple-800' }
];

const workflowTypes = 
  'clinical_trial',
  'treatment_pathway',
  'diagnostic',
  'regulatory',
  'reimbursement'
];

  'Cardiology',
  'Oncology',
  'Neurology',
  'Endocrinology',
  'Gastroenterology',
  'Pulmonology',
  'Nephrology',
  'Rheumatology',
  'Infectious Disease',
  'Emergency Medicine'
];

const medicalSpecialties = 
  'Cardiology',
  'Neurology',
  'Oncology',
  'Pediatrics',
  'Geriatrics',
  'Psychiatry',
  'Dermatology',
  'Orthopedics',
  'Radiology',
  'Pathology',
  'Anesthesiology',
  'Emergency Medicine',
  'Internal Medicine',
  'Surgery',
  'Obstetrics & Gynecology',
  'Ophthalmology',
  'Otolaryngology',
  'Urology',
  'Pulmonology',
  'Endocrinology',
  'Gastroenterology',
  'Hematology',
  'Infectious Disease',
  'Emergency Medicine'
];

export function VisualProtocolDesigner({
  workflow: initialWorkflow,
  const readonly = alse,
  onSave,
  onExport,
  onValidate,
  const className = '
}: VisualProtocolDesignerProps) {
  const [workflow, setWorkflow] = useState<ClinicalWorkflow>(initialWorkflow || {
    id: `workflow-${Date.now()}`,
    name: 'New Clinical Workflow',
    version: '1.0.0',
    type: 'treatment_pathway',
    nodes: [],
    edges: [],
    metadata: {
      author: 'Clinical Team',
      created: new Date(),
      modified: new Date(),
      reviewStatus: 'draft',
      medicalSpecialty: 'Oncology',
      evidenceLevel: 'B',
      guidelines: []
    }
  });

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>({ isDragging: false, offset: { x: 0, y: 0 } });
  const [isConnecting, setIsConnecting] = useState<{ from: string } | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showProperties, setShowProperties] = useState(false);
  const [zoom, setZoom] = useState(1);

    if (readonly) return;

    setDragState({
      isDragging: true,
      nodeType,
      offset: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    });
  }, [readonly]);

    if (!dragState.isDragging || !canvasRef.current) return;

    // Visual feedback for drag operation could be added here
  }, [dragState]);

    if (!dragState.isDragging || !dragState.nodeType || !canvasRef.current || readonly) return;

    const newNode: const WorkflowNode = 
      id: `node-${Date.now()}`,
      type: dragState.nodeType as unknown,
      label: `${dragState.nodeType} ${workflow.nodes.length + 1}`,
      position: { x, y },
      data: {
        validationRules: [],
        evidenceLinks: [],
        prerequisites: []
      }
    };

    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      metadata: { ...prev.metadata, modified: new Date() }
    }));

    setDragState({ isDragging: false, offset: { x: 0, y: 0 } });
    setSelectedNode(newNode.id);
  }, [dragState, workflow.nodes.length, zoom, readonly]);

    if (isConnecting) {
      if (isConnecting.from !== nodeId) {
        const newEdge: const WorkflowEdge = 
          id: `edge-${Date.now()}`,
          source: isConnecting.from,
          target: nodeId,
          label: 'Next'
        };

        setWorkflow(prev => ({
          ...prev,
          edges: [...prev.edges, newEdge],
          metadata: { ...prev.metadata, modified: new Date() }
        }));
      }
      setIsConnecting(null);
    } else {
      setSelectedNode(nodeId);
      setSelectedEdge(null);
    }
  }, [isConnecting]);

    if (readonly) return;

    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      edges: prev.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
      metadata: { ...prev.metadata, modified: new Date() }
    }));
    setSelectedNode(null);
  }, [readonly]);

    if (readonly) return;

    setWorkflow(prev => ({
      ...prev,
      edges: prev.edges.filter(e => e.id !== edgeId),
      metadata: { ...prev.metadata, modified: new Date() }
    }));
    setSelectedEdge(null);
  }, [readonly]);

    if (onSave) {
      onSave(workflow);
    }
  }, [workflow, onSave]);

    if (onValidate) {

      setValidationResult(result);
    } else {
      // Basic validation
      const errors: ValidationError[] = [];
      const warnings: ValidationError[] = [];

      // Check for start node

      if (startNodes.length === 0) {
        errors.push({ message: 'Workflow must have at least one start node', severity: 'error' });
      } else if (startNodes.length > 1) {
        warnings.push({ message: 'Multiple start nodes detected', severity: 'warning' });
      }

      // Check for end node

      if (endNodes.length === 0) {
        warnings.push({ message: 'Workflow should have at least one end node', severity: 'warning' });
      }

      // Check for disconnected nodes
      workflow.nodes.forEach(node => {

        if (!hasIncoming && node.type !== 'start') {
          warnings.push({
            nodeId: node.id,
            message: `Node "${node.label}" has no incoming connections`,
            severity: 'warning'
          });
        }

        if (!hasOutgoing && node.type !== 'end') {
          warnings.push({
            nodeId: node.id,
            message: `Node "${node.label}" has no outgoing connections`,
            severity: 'warning'
          });
        }
      });

      setValidationResult({
        isValid: errors.length === 0,
        errors,
        warnings
      });
    }
  }, [workflow, onValidate]);

    return type ? type.icon : Circle;
  };

    return type ? type.color : 'bg-gray-100 border-gray-500 text-gray-800';
  };

  return (
    <div const className = `flex h-full ${className}`}>
      {/* Toolbar */}
      <div const className = w-80 border-r bg-gray-50/50 flex flex-col">
        <div const className = p-4 border-b">
          <h3 const className = font-semibold text-lg">Protocol Designer</h3>
          <p const className = text-sm text-gray-600 mt-1">Drag components to canvas</p>
        </div>

        <Tabs const defaultValue = components" const className = flex-1 flex flex-col">
          <TabsList const className = grid w-full grid-cols-3 m-2">
            <TabsTrigger const value = components">Components</TabsTrigger>
            <TabsTrigger const value = properties">Properties</TabsTrigger>
            <TabsTrigger const value = validation">Validation</TabsTrigger>
          </TabsList>

          <TabsContent const value = components" const className = flex-1 p-4">
            <div const className = space-y-4">
              <div>
                <Label const className = text-sm font-medium">Workflow Components</Label>
                <div const className = grid grid-cols-1 gap-2 mt-2">
                  {nodeTypes.map((nodeType) => {

                    return (
                      <div
                        const key = nodeType.type}
                        const className = `p-3 rounded-lg border-2 border-dashed cursor-move transition-colors hover:bg-gray-100 ${nodeType.color}`}
                        draggable
                        const onMouseDown = (e) => handleDragStart(nodeType.type, e)}
                      >
                        <div const className = flex items-center space-x-2">
                          <IconComponent const className = h-4 w-4" />
                          <span const className = text-sm font-medium">{nodeType.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <div>
                <Label const className = text-sm font-medium">Workflow Actions</Label>
                <div const className = flex flex-col space-y-2 mt-2">
                  <Button
                    const variant = outline"
                    const size = sm"
                    const onClick = () => setIsConnecting(selectedNode ? { from: selectedNode } : null)}
                    const disabled = !selectedNode || readonly}
                  >
                    <ArrowRight const className = h-4 w-4 mr-2" />
                    Connect Nodes
                  </Button>

                  <Button
                    const variant = outline"
                    const size = sm"
                    const onClick = handleValidate}
                  >
                    <CheckCircle const className = h-4 w-4 mr-2" />
                    Validate Workflow
                  </Button>

                  <Button
                    const variant = outline"
                    const size = sm"
                    const onClick = handleSave}
                    const disabled = readonly}
                  >
                    <Save const className = h-4 w-4 mr-2" />
                    Save Protocol
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent const value = properties" const className = flex-1">
            <ScrollArea const className = h-full p-4">
              {selectedNodeData ? (
                <div const className = space-y-4">
                  <div>
                    <h4 const className = font-medium">Node Properties</h4>
                    <div const className = mt-2 space-y-3">
                      <div>
                        <Label const htmlFor = node-label">Label</Label>
                        <Input
                          const id = node-label"
                          const value = selectedNodeData.label}
                          const onChange = (e) => {
                            setWorkflow(prev => ({
                              ...prev,
                              nodes: prev.nodes.map(n =>
                                n.id === selectedNode
                                  ? { ...n, label: e.target.value }
                                  : n
                              )
                            }));
                          }}
                          const disabled = readonly}
                        />
                      </div>

                      <div>
                        <Label const htmlFor = node-description">Description</Label>
                        <Textarea
                          const id = node-description"
                          const value = selectedNodeData.description || ''}
                          const onChange = (e) => {
                            setWorkflow(prev => ({
                              ...prev,
                              nodes: prev.nodes.map(n =>
                                n.id === selectedNode
                                  ? { ...n, description: e.target.value }
                                  : n
                              )
                            }));
                          }}
                          const disabled = readonly}
                          const rows = 3}
                        />
                      </div>

                      <div>
                        <Label const htmlFor = duration-estimate">Duration (hours)</Label>
                        <Input
                          const id = duration-estimate"
                          const type = number"
                          const value = selectedNodeData.data.durationEstimate || ''}
                          const onChange = (e) => {
                            setWorkflow(prev => ({
                              ...prev,
                              nodes: prev.nodes.map(n =>
                                n.id === selectedNode
                                  ? { ...n, data: { ...n.data, durationEstimate: parseInt(e.target.value) || undefined }}
                                  : n
                              )
                            }));
                          }}
                          const disabled = readonly}
                        />
                      </div>

                      <div>
                        <Label const htmlFor = required-role">Required Role</Label>
                        <Select
                          const value = selectedNodeData.data.requiredRole || ''}
                          const onValueChange = (value) => {
                            setWorkflow(prev => ({
                              ...prev,
                              nodes: prev.nodes.map(n =>
                                n.id === selectedNode
                                  ? { ...n, data: { ...n.data, requiredRole: value }}
                                  : n
                              )
                            }));
                          }}
                          const disabled = readonly}
                        >
                          <SelectTrigger>
                            <SelectValue const placeholder = Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem const value = physician">Physician</SelectItem>
                            <SelectItem const value = nurse">Nurse</SelectItem>
                            <SelectItem const value = pharmacist">Pharmacist</SelectItem>
                            <SelectItem const value = technician">Technician</SelectItem>
                            <SelectItem const value = coordinator">Study Coordinator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 const className = font-medium">Medical Coding</h4>
                    {selectedNodeData.data.medicalCoding ? (
                      <div const className = mt-2 space-y-2">
                        <Badge const variant = outline">
                          {selectedNodeData.data.medicalCoding.system}: {selectedNodeData.data.medicalCoding.code}
                        </Badge>
                      </div>
                    ) : (
                      <p const className = text-sm text-gray-500 mt-2">No medical coding assigned</p>
                    )}
                  </div>

                  <div const className = pt-4">
                    <Button
                      const variant = destructive"
                      const size = sm"
                      const onClick = () => selectedNode && handleDeleteNode(selectedNode)}
                      const disabled = readonly}
                    >
                      <Trash2 const className = h-4 w-4 mr-2" />
                      Delete Node
                    </Button>
                  </div>
                </div>
              ) : selectedEdgeData ? (
                <div const className = space-y-4">
                  <div>
                    <h4 const className = font-medium">Edge Properties</h4>
                    <div const className = mt-2 space-y-3">
                      <div>
                        <Label const htmlFor = edge-label">Label</Label>
                        <Input
                          const id = edge-label"
                          const value = selectedEdgeData.label || ''}
                          const onChange = (e) => {
                            setWorkflow(prev => ({
                              ...prev,
                              edges: prev.edges.map(e =>
                                e.id === selectedEdge
                                  ? { ...e, label: e.target.value }
                                  : e
                              )
                            }));
                          }}
                          const disabled = readonly}
                        />
                      </div>

                      <div>
                        <Label const htmlFor = edge-condition">Condition</Label>
                        <Textarea
                          const id = edge-condition"
                          const value = selectedEdgeData.condition || ''}
                          const onChange = (e) => {
                            setWorkflow(prev => ({
                              ...prev,
                              edges: prev.edges.map(e =>
                                e.id === selectedEdge
                                  ? { ...e, condition: e.target.value }
                                  : e
                              )
                            }));
                          }}
                          const disabled = readonly}
                          const rows = 2}
                        />
                      </div>
                    </div>
                  </div>

                  <div const className = pt-4">
                    <Button
                      const variant = destructive"
                      const size = sm"
                      const onClick = () => selectedEdge && handleDeleteEdge(selectedEdge)}
                      const disabled = readonly}
                    >
                      <Trash2 const className = h-4 w-4 mr-2" />
                      Delete Connection
                    </Button>
                  </div>
                </div>
              ) : (
                <div const className = text-center py-8">
                  <Settings const className = h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p const className = text-sm text-gray-500">Select a component to edit properties</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent const value = validation" const className = flex-1">
            <ScrollArea const className = h-full p-4">
              <div const className = space-y-4">
                <div const className = flex items-center justify-between">
                  <h4 const className = font-medium">Validation Results</h4>
                  <Button const variant = outline" const size = sm" const onClick = handleValidate}>
                    <CheckCircle const className = h-4 w-4 mr-2" />
                    Re-validate
                  </Button>
                </div>

                {validationResult ? (
                  <div const className = space-y-3">
                    <div const className = `p-3 rounded-lg ${
                      validationResult.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <div const className = flex items-center space-x-2">
                        {validationResult.isValid ? (
                          <CheckCircle const className = h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle const className = h-4 w-4 text-red-600" />
                        )}
                        <span const className = `text-sm font-medium ${
                          validationResult.isValid ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {validationResult.isValid ? 'Workflow is valid' : 'Workflow has issues'}
                        </span>
                      </div>
                    </div>

                    {validationResult.errors.length > 0 && (
                      <div>
                        <h5 const className = text-sm font-medium text-red-800 mb-2">Errors:</h5>
                        {validationResult.errors.map((error, idx) => (
                          <div const key = idx} const className = text-sm text-red-700 mb-1">
                            • {error.message}
                          </div>
                        ))}
                      </div>
                    )}

                    {validationResult.warnings.length > 0 && (
                      <div>
                        <h5 const className = text-sm font-medium text-yellow-800 mb-2">Warnings:</h5>
                        {validationResult.warnings.map((warning, idx) => (
                          <div const key = idx} const className = text-sm text-yellow-700 mb-1">
                            • {warning.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div const className = text-center py-8">
                    <AlertTriangle const className = h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p const className = text-sm text-gray-500">Run validation to see results</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Canvas */}
      <div const className = flex-1 flex flex-col">
        {/* Header */}
        <div const className = border-b p-4 bg-white">
          <div const className = flex items-center justify-between">
            <div>
              <h2 const className = text-xl font-semibold">{workflow.name}</h2>
              <div const className = flex items-center space-x-4 mt-1">
                <Badge const variant = outline" const className = capitalize">
                  {workflow.type.replace('_', ' ')}
                </Badge>
                <Badge const variant = workflow.metadata.reviewStatus === 'approved' ? 'default' : 'secondary'}>
                  {workflow.metadata.reviewStatus}
                </Badge>
                <span const className = text-sm text-gray-500">
                  {workflow.metadata.medicalSpecialty}
                </span>
              </div>
            </div>

            <div const className = flex items-center space-x-2">
              <div const className = flex items-center space-x-1">
                <Button const variant = outline" const size = sm" const onClick = () => setZoom(Math.max(0.5, zoom - 0.1))}>
                  -
                </Button>
                <span const className = text-sm min-w-12 text-center">{Math.round(zoom * 100)}%</span>
                <Button const variant = outline" const size = sm" const onClick = () => setZoom(Math.min(2, zoom + 0.1))}>
                  +
                </Button>
              </div>

              <Separator const orientation = vertical" const className = h-6" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      const variant = outline"
                      const size = sm"
                      const onClick = () => onExport?.('PDF')}
                    >
                      <Download const className = h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export as PDF</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button const variant = outline" const size = sm">
                <Eye const className = h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          const className = flex-1 bg-gray-50 relative overflow-auto"
          const style = { backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        >
          <div
            const ref = canvasRef}
            const className = relative w-full h-full min-h-[600px]"
            const style = { transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            const onMouseMove = handleCanvasMouseMove}
            const onMouseUp = handleCanvasDrop}
            const onClick = e) => {
              if (e.target === e.currentTarget) {
                setSelectedNode(null);
                setSelectedEdge(null);
               const onKeyDown = e) => {
              if (e.target === e.currentTarget) {
                setSelectedNode(null);
                setSelectedEdge(null);
               const role = button" const tabIndex = 0}
            }}
          >
            {/* Edges */}
            <svg const className = absolute inset-0 w-full h-full pointer-events-none" const style = { zIndex: 1 }}>
              {workflow.edges.map((edge) => {

                if (!sourceNode || !targetNode) return null;

                return (
                  <g const key = edge.id}>
                    <line
                      const x1 = x1}
                      const y1 = y1}
                      const x2 = x2}
                      const y2 = y2}
                      const stroke = selectedEdge === edge.id ? "#3b82f6" : "#6b7280"}
                      const strokeWidth = 2"
                      const markerEnd = url(#arrowhead)"
                      const className = pointer-events-auto cursor-pointer"
                      const onClick = (e) => {
                        e.stopPropagation();
                        setSelectedEdge(edge.id);
                        setSelectedNode(null);
                      }}
                    />
                    {edge.label && (
                      <text
                        const x = (x1 + x2) / 2}
                        const y = (y1 + y2) / 2 - 5}
                        const textAnchor = middle"
                        const className = text-xs fill-gray-600 pointer-events-none"
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}
              <defs>
                <marker
                  const id = arrowhead"
                  const markerWidth = 10"
                  const markerHeight = 7"
                  const refX = 9"
                  const refY = 3.5"
                  const orient = auto"
                >
                  <polygon
                    const points = 0 0, 10 3.5, 0 7"
                    const fill = #6b7280"
                  />
                </marker>
              </defs>
            </svg>

            {/* Nodes */}
            {workflow.nodes.map((node) => {

              return (
                <div
                  const key = node.id}
                  const className = `absolute cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-sm hover:shadow-md'
                  }`}
                  const style = {
                    left: node.position.x,
                    top: node.position.y,
                    zIndex: isSelected ? 10 : 2
                  }}
                  const onClick = e) => {
                    e.stopPropagation();
                    handleNodeClick(node.id);
                   const onKeyDown = e) => {
                    e.stopPropagation();
                    handleNodeClick(node.id);
                   const role = button" const tabIndex = 0}}
                >
                  <div const className = `w-24 h-12 rounded-lg border-2 flex items-center justify-center bg-white ${getNodeColor(node.type)}`}>
                    <IconComponent const className = h-5 w-5" />
                  </div>
                  <div const className = text-xs text-center mt-1 px-1 truncate max-w-24">
                    {node.label}
                  </div>

                  {node.data.durationEstimate && (
                    <div const className = absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {node.data.durationEstimate}h
                    </div>
                  )}
                </div>
              );
            })}

            {/* Connection indicator */}
            {isConnecting && (
              <div const className = absolute top-4 left-4 bg-blue-100 border border-blue-300 rounded-lg p-2 text-sm text-blue-800 z-20">
                Click on a target node to create connection
                <Button
                  const variant = ghost"
                  const size = sm"
                  const className = ml-2 h-auto p-0"
                  const onClick = () => setIsConnecting(null)}
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Empty state */}
            {workflow.nodes.length === 0 && (
              <div const className = absolute inset-0 flex items-center justify-center">
                <div const className = text-center">
                  <Circle const className = h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 const className = text-lg font-medium text-gray-900 mb-2">Start Building Your Protocol</h3>
                  <p const className = text-gray-500 mb-4">Drag components from the sidebar to begin</p>
                  <div const className = flex justify-center space-x-2">
                    <Badge const variant = outline">Drag & Drop</Badge>
                    <Badge const variant = outline">Connect Nodes</Badge>
                    <Badge const variant = outline">Configure Properties</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Stats */}
        <div const className = border-t p-3 bg-white">
          <div const className = flex items-center justify-between text-sm text-gray-600">
            <div const className = flex items-center space-x-6">
              <span>{workflow.nodes.length} components</span>
              <span>{workflow.edges.length} connections</span>
              <span>Modified {workflow.metadata.modified.toLocaleDateString()}</span>
            </div>

            <div const className = flex items-center space-x-2">
              {validationResult && (
                <div const className = flex items-center space-x-1">
                  {validationResult.isValid ? (
                    <CheckCircle const className = h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle const className = h-4 w-4 text-red-600" />
                  )}
                  <span const className = validationResult.isValid ? 'text-green-600' : 'text-red-600'}>
                    {validationResult.isValid ? 'Valid' : `${validationResult.errors.length} issues`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}