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

  { type: 'start', label: 'Start', icon: Play, color: 'bg-green-100 border-green-500 text-green-800' },
  { type: 'end', label: 'End', icon: Square, color: 'bg-red-100 border-red-500 text-red-800' },
  { type: 'activity', label: 'Activity', icon: Circle, color: 'bg-blue-100 border-blue-500 text-blue-800' },
  { type: 'gateway', label: 'Decision', icon: Diamond, color: 'bg-yellow-100 border-yellow-500 text-yellow-800' },
  { type: 'event', label: 'Event', icon: AlertTriangle, color: 'bg-purple-100 border-purple-500 text-purple-800' }
];

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

export function VisualProtocolDesigner({
  workflow: initialWorkflow,
  readonly = false,
  onSave,
  onExport,
  onValidate,
  className = ''
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

    const newNode: WorkflowNode = {
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
        const newEdge: WorkflowEdge = {
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
      nodes: prev.nodes.filter((n: any) => n.id !== nodeId),
      edges: prev.edges.filter((e: any) => e.source !== nodeId && e.target !== nodeId),
      metadata: { ...prev.metadata, modified: new Date() }
    }));
    setSelectedNode(null);
  }, [readonly]);

    if (readonly) return;

    setWorkflow(prev => ({
      ...prev,
      edges: prev.edges.filter((e: any) => e.id !== edgeId),
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
    <div className={`flex h-full ${className}`}>
      {/* Toolbar */}
      <div className="w-80 border-r bg-gray-50/50 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Protocol Designer</h3>
          <p className="text-sm text-gray-600 mt-1">Drag components to canvas</p>
        </div>

        <Tabs defaultValue="components" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 m-2">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="flex-1 p-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Workflow Components</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {nodeTypes.map((nodeType) => {

                    return (
                      <div
                        key={nodeType.type}
                        className={`p-3 rounded-lg border-2 border-dashed cursor-move transition-colors hover:bg-gray-100 ${nodeType.color}`}
                        draggable
                        onMouseDown={(e) => handleDragStart(nodeType.type, e)}
                      >
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4" />
                          <span className="text-sm font-medium">{nodeType.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">Workflow Actions</Label>
                <div className="flex flex-col space-y-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsConnecting(selectedNode ? { from: selectedNode } : null)}
                    disabled={!selectedNode || readonly}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Connect Nodes
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleValidate}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Validate Workflow
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={readonly}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Protocol
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="flex-1">
            <ScrollArea className="h-full p-4">
              {selectedNodeData ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Node Properties</h4>
                    <div className="mt-2 space-y-3">
                      <div>
                        <Label htmlFor="node-label">Label</Label>
                        <Input
                          id="node-label"
                          value={selectedNodeData.label}
                          onChange={(e) => {
                            setWorkflow(prev => ({
                              ...prev,
                              nodes: prev.nodes.map((n: any) =>
                                n.id === selectedNode
                                  ? { ...n, label: e.target.value }
                                  : n
                              )
                            }));
                          }}
                          disabled={readonly}
                        />
                      </div>

                      <div>
                        <Label htmlFor="node-description">Description</Label>
                        <Textarea
                          id="node-description"
                          value={selectedNodeData.description || ''}
                          onChange={(e) => {
                            setWorkflow(prev => ({
                              ...prev,
                              nodes: prev.nodes.map((n: any) =>
                                n.id === selectedNode
                                  ? { ...n, description: e.target.value }
                                  : n
                              )
                            }));
                          }}
                          disabled={readonly}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="duration-estimate">Duration (hours)</Label>
                        <Input
                          id="duration-estimate"
                          type="number"
                          value={selectedNodeData.data.durationEstimate || ''}
                          onChange={(e) => {
                            setWorkflow(prev => ({
                              ...prev,
                              nodes: prev.nodes.map((n: any) =>
                                n.id === selectedNode
                                  ? { ...n, data: { ...n.data, durationEstimate: parseInt(e.target.value) || undefined }}
                                  : n
                              )
                            }));
                          }}
                          disabled={readonly}
                        />
                      </div>

                      <div>
                        <Label htmlFor="required-role">Required Role</Label>
                        <Select
                          value={selectedNodeData.data.requiredRole || ''}
                          onValueChange={(value) => {
                            setWorkflow(prev => ({
                              ...prev,
                              nodes: prev.nodes.map((n: any) =>
                                n.id === selectedNode
                                  ? { ...n, data: { ...n.data, requiredRole: value }}
                                  : n
                              )
                            }));
                          }}
                          disabled={readonly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="physician">Physician</SelectItem>
                            <SelectItem value="nurse">Nurse</SelectItem>
                            <SelectItem value="pharmacist">Pharmacist</SelectItem>
                            <SelectItem value="technician">Technician</SelectItem>
                            <SelectItem value="coordinator">Study Coordinator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium">Medical Coding</h4>
                    {selectedNodeData.data.medicalCoding ? (
                      <div className="mt-2 space-y-2">
                        <Badge variant="outline">
                          {selectedNodeData.data.medicalCoding.system}: {selectedNodeData.data.medicalCoding.code}
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-2">No medical coding assigned</p>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => selectedNode && handleDeleteNode(selectedNode)}
                      disabled={readonly}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Node
                    </Button>
                  </div>
                </div>
              ) : selectedEdgeData ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Edge Properties</h4>
                    <div className="mt-2 space-y-3">
                      <div>
                        <Label htmlFor="edge-label">Label</Label>
                        <Input
                          id="edge-label"
                          value={selectedEdgeData.label || ''}
                          onChange={(e) => {
                            setWorkflow(prev => ({
                              ...prev,
                              edges: prev.edges.map((e: any) =>
                                e.id === selectedEdge
                                  ? { ...e, label: e.target.value }
                                  : e
                              )
                            }));
                          }}
                          disabled={readonly}
                        />
                      </div>

                      <div>
                        <Label htmlFor="edge-condition">Condition</Label>
                        <Textarea
                          id="edge-condition"
                          value={selectedEdgeData.condition || ''}
                          onChange={(e) => {
                            setWorkflow(prev => ({
                              ...prev,
                              edges: prev.edges.map((e: any) =>
                                e.id === selectedEdge
                                  ? { ...e, condition: e.target.value }
                                  : e
                              )
                            }));
                          }}
                          disabled={readonly}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => selectedEdge && handleDeleteEdge(selectedEdge)}
                      disabled={readonly}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Connection
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Select a component to edit properties</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="validation" className="flex-1">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Validation Results</h4>
                  <Button variant="outline" size="sm" onClick={handleValidate}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Re-validate
                  </Button>
                </div>

                {validationResult ? (
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg ${
                      validationResult.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        {validationResult.isValid ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${
                          validationResult.isValid ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {validationResult.isValid ? 'Workflow is valid' : 'Workflow has issues'}
                        </span>
                      </div>
                    </div>

                    {validationResult.errors.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-red-800 mb-2">Errors:</h5>
                        {validationResult.errors.map((error, idx) => (
                          <div key={idx} className="text-sm text-red-700 mb-1">
                            • {error.message}
                          </div>
                        ))}
                      </div>
                    )}

                    {validationResult.warnings.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-yellow-800 mb-2">Warnings:</h5>
                        {validationResult.warnings.map((warning, idx) => (
                          <div key={idx} className="text-sm text-yellow-700 mb-1">
                            • {warning.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Run validation to see results</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{workflow.name}</h2>
              <div className="flex items-center space-x-4 mt-1">
                <Badge variant="outline" className="capitalize">
                  {workflow.type.replace('_', ' ')}
                </Badge>
                <Badge variant={workflow.metadata.reviewStatus === 'approved' ? 'default' : 'secondary'}>
                  {workflow.metadata.reviewStatus}
                </Badge>
                <span className="text-sm text-gray-500">
                  {workflow.metadata.medicalSpecialty}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                  -
                </Button>
                <span className="text-sm min-w-12 text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                  +
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onExport?.('PDF')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export as PDF</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          className="flex-1 bg-gray-50 relative overflow-auto"
          style={{ backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        >
          <div
            ref={canvasRef}
            className="relative w-full h-full min-h-[600px]"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasDrop}
            onClick=(e) => {
              if (e.target === e.currentTarget) {
                setSelectedNode(null);
                setSelectedEdge(null);
               onKeyDown=(e) => {
              if (e.target === e.currentTarget) {
                setSelectedNode(null);
                setSelectedEdge(null);
               role="button" tabIndex={0}
            }}
          >
            {/* Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              {workflow.edges.map((edge) => {

                if (!sourceNode || !targetNode) return null;

                return (
                  <g key={edge.id}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={selectedEdge === edge.id ? "#3b82f6" : "#6b7280"}
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                      className="pointer-events-auto cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEdge(edge.id);
                        setSelectedNode(null);
                      }}
                    />
                    {edge.label && (
                      <text
                        x={(x1 + x2) / 2}
                        y={(y1 + y2) / 2 - 5}
                        textAnchor="middle"
                        className="text-xs fill-gray-600 pointer-events-none"
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}
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

            {/* Nodes */}
            {workflow.nodes.map((node) => {

              return (
                <div
                  key={node.id}
                  className={`absolute cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-sm hover:shadow-md'
                  }`}
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    zIndex: isSelected ? 10 : 2
                  }}
                  onClick=(e) => {
                    e.stopPropagation();
                    handleNodeClick(node.id);
                   onKeyDown=(e) => {
                    e.stopPropagation();
                    handleNodeClick(node.id);
                   role="button" tabIndex={0}}
                >
                  <div className={`w-24 h-12 rounded-lg border-2 flex items-center justify-center bg-white ${getNodeColor(node.type)}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="text-xs text-center mt-1 px-1 truncate max-w-24">
                    {node.label}
                  </div>

                  {node.data.durationEstimate && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {node.data.durationEstimate}h
                    </div>
                  )}
                </div>
              );
            })}

            {/* Connection indicator */}
            {isConnecting && (
              <div className="absolute top-4 left-4 bg-blue-100 border border-blue-300 rounded-lg p-2 text-sm text-blue-800 z-20">
                Click on a target node to create connection
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-auto p-0"
                  onClick={() => setIsConnecting(null)}
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Empty state */}
            {workflow.nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Circle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Protocol</h3>
                  <p className="text-gray-500 mb-4">Drag components from the sidebar to begin</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="outline">Drag & Drop</Badge>
                    <Badge variant="outline">Connect Nodes</Badge>
                    <Badge variant="outline">Configure Properties</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="border-t p-3 bg-white">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-6">
              <span>{workflow.nodes.length} components</span>
              <span>{workflow.edges.length} connections</span>
              <span>Modified {workflow.metadata.modified.toLocaleDateString()}</span>
            </div>

            <div className="flex items-center space-x-2">
              {validationResult && (
                <div className="flex items-center space-x-1">
                  {validationResult.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={validationResult.isValid ? 'text-green-600' : 'text-red-600'}>
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