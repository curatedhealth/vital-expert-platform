// @ts-nocheck
'use client';

import {
  CheckCircle, XCircle, AlertTriangle, Lock,
  UserCheck, FileText, Activity, Shield, Brain, Diamond, Circle, Save
} from 'lucide-react';
import React, { useState, useRef } from 'react';

import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';

// Clinical Workflow Types
interface ClinicalProtocolNode {
  id: string;
  type: 'assessment' | 'intervention' | 'decision' | 'safety_check' | 'expert_review';
  position: { x: number; y: number };
  data: {
    label: string;
    medicalValidation: {
      required: boolean;
      validated: boolean;
      validatedBy?: string;
      validationTimestamp?: Date;
      evidenceLevel: 'A' | 'B' | 'C' | 'D';
    };
    safetyRequirements: {
      contraindications: string[];
      requiredMonitoring: string[];
      alertThresholds: Record<string, number>;
    };
    regulatoryCompliance: {
      fdaApproved: boolean;
      guidelineAligned: boolean;
      documentationRequired: string[];
    };
    pharmaValidation: {
      purposeAligned: boolean;
      hypothesisValid: boolean;
      audienceAppropriate: boolean;
      requirementsMet: boolean;
      metricsTracked: boolean;
      actionable: boolean;
    };
    verifyChecks: {
      sourcesValidated: boolean;
      citationsComplete: boolean;
      confidenceProvided: boolean;
      gapsIdentified: boolean;
      factsChecked: boolean;
      expertReviewNeeded: boolean;
    };
  };
}

interface ClinicalSafetyGate {
  id: string;
  type: 'safety_gate';
  position: { x: number; y: number };
  data: {
    label: string;
    gateType: 'mandatory_review' | 'safety_validation' | 'regulatory_check';
    criteria: SafetyCriteria[];
    approvers: string[];
    timeoutHours: number;
    escalationPath: string[];
  };
}

interface SafetyCriteria {
  name: string;
  type: 'clinical' | 'regulatory' | 'safety';
  threshold: number;
  currentValue?: number;
  status: 'pending' | 'passed' | 'failed';
  validator?: string;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type: 'default' | 'conditional' | 'emergency';
  data?: {
    condition?: string;
    emergency?: boolean;
  };
}

interface ClinicalWorkflow {
  id: string;
  name: string;
  version: string;
  nodes: (ClinicalProtocolNode | ClinicalSafetyGate)[];
  edges: WorkflowEdge[];
  metadata: {
    author: string;
    reviewStatus: 'draft' | 'review' | 'approved';
    complianceChecks: ComplianceCheck[];
    lastValidated?: Date;
  };
}

interface WorkflowValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  safetyChecksPassed: number;
  totalSafetyChecks: number;
  medicalValidationScore: number;
  complianceScore: number;
  expertReviewsCompleted: number;
  expertReviewsRequired: number;
}

interface ValidationIssue {
  nodeId: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
}

interface ValidationResult {
  isValid: boolean;
  issues: string[];
}

interface ComplianceCheck {
  name: string;
  status: 'passed' | 'failed' | 'pending';
  description: string;
}

type ValidationMode = 'design' | 'validate' | 'execute';

// Main Enhanced Workflow Builder Component
export const EnhancedWorkflowBuilder: React.FC = () => {
  const [nodes, setNodes] = useState<(ClinicalProtocolNode | ClinicalSafetyGate)[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<ClinicalProtocolNode | ClinicalSafetyGate | null>(null);
  const [validationMode, setValidationMode] = useState<ValidationMode>('design');
  const [workflowValidation, setWorkflowValidation] = useState<WorkflowValidationResult>();
  const [workflow, setWorkflow] = useState<ClinicalWorkflow>({
    id: 'workflow-1',
    name: 'New Clinical Protocol',
    version: '1.0.0',
    nodes: [],
    edges: [],
    metadata: {
      author: 'Dr. Clinical User',
      reviewStatus: 'draft',
      complianceChecks: []
    }
  });

  const [draggedNode, setDraggedNode] = useState<unknown>(null);

  // Validate workflow

    const validation: WorkflowValidationResult = {
      isValid: true,
      issues: [],
      safetyChecksPassed: 0,
      totalSafetyChecks: 0,
      medicalValidationScore: 0,
      complianceScore: 100,
      expertReviewsCompleted: 0,
      expertReviewsRequired: 0
    };

    // Count safety checks
    nodes.forEach(node => {
      if (node.type === 'safety_check' || ('data' in node && 'medicalValidation' in node.data && node.data.medicalValidation?.required)) {
        validation.totalSafetyChecks++;
        if ('data' in node && 'medicalValidation' in node.data && node.data.medicalValidation?.validated) {
          validation.safetyChecksPassed++;
        }
      }

      if ('data' in node && 'verifyChecks' in node.data && node.data.verifyChecks?.expertReviewNeeded) {
        validation.expertReviewsRequired++;
      }
    });

    // Calculate scores
    validation.medicalValidationScore = validation.totalSafetyChecks > 0
      ? (validation.safetyChecksPassed / validation.totalSafetyChecks) * 100
      : 100;

    // Check for issues
    if (validation.safetyChecksPassed < validation.totalSafetyChecks) {
      validation.issues.push({
        nodeId: 'workflow',
        severity: 'warning',
        title: 'Incomplete Safety Validation',
        description: 'Some nodes require safety validation before workflow can be executed'
      });
      validation.isValid = false;
    }

    setWorkflowValidation(validation);
    return validation;
  };

    const issues: string[] = [];

    if ('data' in node) {
      // Check PHARMA validation
      if ('pharmaValidation' in node.data) {

        if (pharmaScore < 0.8) {
          issues.push('PHARMA framework validation score is below 80%');
        }
      }

      // Check VERIFY protocol
      if ('verifyChecks' in node.data) {

        if (verifyScore < 0.8) {
          issues.push('VERIFY protocol compliance is below 80%');
        }
      }

      // Check evidence level
      if ('medicalValidation' in node.data && node.data.medicalValidation.evidenceLevel === 'D') {
        issues.push('Evidence level D requires expert review');
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  };

    setNodes(prevNodes =>
      prevNodes.map(node =>
        node.id === updatedNode.id ? updatedNode : node
      )
    );
    setSelectedNode(updatedNode);
  };

    event.preventDefault();

    if (!rect || !draggedNode) return;

    const newNode: ClinicalProtocolNode = {
      id: `node-${Date.now()}`,
      type: draggedNode.type,
      position: { x, y },
      data: {
        label: draggedNode.label,
        medicalValidation: {
          required: draggedNode.validation?.safetyCheck || false,
          validated: false,
          evidenceLevel: draggedNode.validation?.evidenceLevel || 'C'
        },
        safetyRequirements: {
          contraindications: [],
          requiredMonitoring: [],
          alertThresholds: { /* TODO: implement */ }
        },
        regulatoryCompliance: {
          fdaApproved: false,
          guidelineAligned: false,
          documentationRequired: []
        },
        pharmaValidation: {
          purposeAligned: false,
          hypothesisValid: false,
          audienceAppropriate: true,
          requirementsMet: false,
          metricsTracked: false,
          actionable: false
        },
        verifyChecks: {
          sourcesValidated: false,
          citationsComplete: false,
          confidenceProvided: false,
          gapsIdentified: false,
          factsChecked: false,
          expertReviewNeeded: draggedNode.validation?.expertReview || false
        }
      }
    };

    setNodes(prev => [...prev, newNode]);
    setDraggedNode(null);
  };

    event.preventDefault();
  };

    setSelectedNode(node);
  };

    return {
      safetyGates: nodes.filter(node => node.type === 'safety_check').length,
      expertReviews: nodes.filter(node => 'data' in node && 'verifyChecks' in node.data && node.data.verifyChecks.expertReviewNeeded).length,
      validationCoverage: nodes.length > 0
        ? (nodes.filter(node => 'data' in node && 'medicalValidation' in node.data && node.data.medicalValidation.validated).length / nodes.length) * 100
        : 0,
      complianceScore: 95
    };
  };

  return (
    <div className="enhanced-workflow-builder h-screen flex flex-col bg-gray-50">
      {/* Workflow Header with Validation Status */}
      <WorkflowHeader
        validationMode={validationMode}
        onModeChange={setValidationMode}
        onValidate={validateWorkflow}
        validationStatus={workflowValidation}
        workflow={workflow}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Node Palette */}
        <div className="w-64 bg-white border-r shadow-lg overflow-y-auto">
          <ClinicalNodePalette onDragStart={setDraggedNode} />
        </div>

        {/* Main Workflow Canvas */}
        <div className="flex-1 relative">
          <div
            ref={canvasRef}
            className="w-full h-full bg-gray-100 relative"
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
          >
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Workflow Nodes */}
            {nodes.map(node => (
              <WorkflowNode
                key={node.id}
                node={node}
                onClick={() => handleNodeClick(node)}
                isSelected={selectedNode?.id === node.id}
                validationMode={validationMode}
              />
            ))}

            {/* Workflow Edges */}
            {edges.map(edge => (
              <WorkflowEdge key={edge.id} edge={edge} nodes={nodes} />
            ))}
          </div>

          {/* Validation Overlay */}
          {validationMode === 'validate' && workflowValidation && (
            <ValidationOverlay validation={workflowValidation} />
          )}

          {/* Safety Indicators */}
          <SafetyIndicatorPanel
            nodes={nodes}
            edges={edges}
            metrics={safetyMetrics}
          />
        </div>

        {/* Properties Panel */}
        <div className="w-96 bg-white border-l shadow-lg overflow-y-auto">
          {selectedNode ? (
            <ClinicalNodeProperties
              node={selectedNode}
              onUpdate={updateNodeProperties}
              onValidate={validateNode}
            />
          ) : (
            <WorkflowProperties
              nodes={nodes}
              edges={edges}
              validation={workflowValidation}
              workflow={workflow}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Workflow Header Component
const WorkflowHeader: React.FC<{
  validationMode: ValidationMode;
  onModeChange: (mode: ValidationMode) => void;
  onValidate: () => Promise<WorkflowValidationResult>;
  validationStatus?: WorkflowValidationResult;
  workflow: ClinicalWorkflow;
}> = ({ validationMode, onModeChange, onValidate, validationStatus, workflow }) => {
  const [isValidating, setIsValidating] = useState(false);

    setIsValidating(true);
    await onValidate();
    setIsValidating(false);
  };

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{workflow.name}</h1>
              <p className="text-sm text-gray-600">Version {workflow.version} • {workflow.metadata.reviewStatus}</p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={validationMode === 'design' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onModeChange('design')}
              >
                Design
              </Button>
              <Button
                variant={validationMode === 'validate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onModeChange('validate')}
              >
                Validate
              </Button>
              <Button
                variant={validationMode === 'execute' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onModeChange('execute')}
                disabled={!validationStatus?.isValid}
              >
                Execute
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {validationStatus && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <div className={`font-bold ${
                    validationStatus.medicalValidationScore >= 90 ? 'text-green-600' :
                    validationStatus.medicalValidationScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {validationStatus.medicalValidationScore.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">Medical</div>
                </div>

                <div className="text-center">
                  <div className={`font-bold ${
                    validationStatus.complianceScore >= 95 ? 'text-green-600' :
                    validationStatus.complianceScore >= 80 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {validationStatus.complianceScore}%
                  </div>
                  <div className="text-xs text-gray-500">Compliance</div>
                </div>
              </div>
            )}

            <Button
              onClick={handleValidate}
              disabled={isValidating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isValidating ? 'Validating...' : 'Validate Workflow'}
            </Button>

            <Button variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Clinical Node Palette Component
const ClinicalNodePalette: React.FC<{
  onDragStart: (nodeData: unknown) => void;
}> = ({ onDragStart }) => {

    {
      category: 'Clinical Assessment',
      nodes: [
        {
          type: 'assessment',
          label: 'Patient Assessment',
          icon: <Activity className="h-4 w-4" />,
          validation: { evidenceLevel: 'A' }
        },
        {
          type: 'assessment',
          label: 'Diagnostic Test',
          icon: <FileText className="h-4 w-4" />,
          validation: { evidenceLevel: 'B' }
        },
        {
          type: 'assessment',
          label: 'Risk Stratification',
          icon: <Brain className="h-4 w-4" />,
          validation: { evidenceLevel: 'A' }
        }
      ]
    },
    {
      category: 'Clinical Interventions',
      nodes: [
        {
          type: 'intervention',
          label: 'Medication',
          icon: <Shield className="h-4 w-4" />,
          validation: { evidenceLevel: 'A', safetyCheck: true }
        },
        {
          type: 'intervention',
          label: 'Procedure',
          icon: <Activity className="h-4 w-4" />,
          validation: { evidenceLevel: 'B', expertReview: true }
        },
        {
          type: 'intervention',
          label: 'Therapy',
          icon: <Heart className="h-4 w-4" />,
          validation: { evidenceLevel: 'B' }
        }
      ]
    },
    {
      category: 'Safety & Compliance',
      nodes: [
        {
          type: 'safety_check',
          label: 'Safety Gate',
          icon: <Shield className="h-4 w-4" />,
          validation: { mandatory: true }
        },
        {
          type: 'expert_review',
          label: 'Expert Review',
          icon: <UserCheck className="h-4 w-4" />,
          validation: { mandatory: true }
        },
        {
          type: 'decision',
          label: 'Regulatory Check',
          icon: <Lock className="h-4 w-4" />,
          validation: { mandatory: true }
        }
      ]
    }
  ];

    onDragStart(nodeData);
  };

  return (
    <div className="p-4">
      <h3 className="font-semibold mb-4">Clinical Protocol Nodes</h3>

      {nodeTemplates.map((category) => (
        <div key={category.category} className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {category.category}
          </h4>
          <div className="space-y-2">
            {category.nodes.map((node, idx) => (
              <div
                key={`${category.category}-${idx}`}
                draggable
                onDragStart={() => handleDragStart(node)}
                className="flex items-center p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 border border-gray-200"
              >
                <div className="mr-3 text-gray-600">{node.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{node.label}</div>
                  <div className="text-xs text-gray-500">
                    Evidence: {'evidenceLevel' in node.validation ? node.validation.evidenceLevel : 'N/A'}
                    {'safetyCheck' in node.validation && node.validation.safetyCheck && ' • Safety Required'}
                    {'expertReview' in node.validation && node.validation.expertReview && ' • Expert Review'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Workflow Node Component
const WorkflowNode: React.FC<{
  node: ClinicalProtocolNode | ClinicalSafetyGate;
  onClick: () => void;
  isSelected: boolean;
  validationMode: ValidationMode;
}> = ({ node, onClick, isSelected, validationMode }) => {

    switch (node.type) {
      case 'assessment':
        return <Activity className="h-4 w-4" />;
      case 'intervention':
        return <FileText className="h-4 w-4" />;
      case 'decision':
        return <Diamond className="h-4 w-4" />;
      case 'safety_check':
        return <Shield className="h-4 w-4" />;
      case 'expert_review':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

    if ('data' in node && 'pharmaValidation' in node.data && 'verifyChecks' in node.data) {

      if (pharmaScore >= 0.8 && verifyScore >= 0.8 && node.data.medicalValidation.validated) {
        return 'validated';
      }
      if (pharmaScore >= 0.5 || verifyScore >= 0.5) {
        return 'partial';
      }
    }
    return 'pending';
  };

    if (validationMode === 'validate') {
      switch (validationStatus) {
        case 'validated':
          return 'bg-green-100 border-green-400';
        case 'partial':
          return 'bg-yellow-100 border-yellow-400';
        case 'pending':
          return 'bg-red-100 border-red-400';
      }
    }
    return 'bg-white border-gray-300';
  };

  return (
    <div
      className={`absolute p-3 rounded-lg border-2 cursor-pointer transition-all ${getNodeColor()} ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        left: node.position.x,
        top: node.position.y,
        minWidth: '120px'
      }}
      onClick=onClick onKeyDown=onClick role="button" tabIndex={0}
    >
      <div className="flex items-center space-x-2 mb-1">
        {getNodeIcon()}
        <span className="text-sm font-medium">
          {node.data.label}
        </span>
      </div>

      {validationMode === 'validate' && (
        <div className="flex items-center space-x-1">
          {validationStatus === 'validated' && <CheckCircle className="h-3 w-3 text-green-600" />}
          {validationStatus === 'partial' && <AlertTriangle className="h-3 w-3 text-yellow-600" />}
          {validationStatus === 'pending' && <XCircle className="h-3 w-3 text-red-600" />}
          <span className="text-xs capitalize">{validationStatus}</span>
        </div>
      )}

      {'data' in node && 'medicalValidation' in node.data && node.data.medicalValidation.evidenceLevel && (
        <Badge variant="outline" className="text-xs mt-1">
          Level {node.data.medicalValidation.evidenceLevel}
        </Badge>
      )}
    </div>
  );
};

// Workflow Edge Component (simplified for now)
const WorkflowEdge: React.FC<{
  edge: WorkflowEdge;
  nodes: (ClinicalProtocolNode | ClinicalSafetyGate)[];
}> = ({ edge, nodes }) => {
  // This would normally draw SVG lines between nodes
  // For now, we'll return null as this requires more complex positioning calculations
  return null;
};

// Clinical Node Properties Panel
const ClinicalNodeProperties: React.FC<{
  node: ClinicalProtocolNode | ClinicalSafetyGate;
  onUpdate: (node: ClinicalProtocolNode | ClinicalSafetyGate) => void;
  onValidate: (node: ClinicalProtocolNode | ClinicalSafetyGate) => Promise<ValidationResult>;
}> = ({ node, onUpdate, onValidate }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult>();

    setIsValidating(true);

    setValidationResult(result);
    setIsValidating(false);
  };

  if (!('data' in node)) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Safety Gate Properties</h3>
        <p className="text-sm text-gray-600">Safety gate configuration options would go here.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Node Properties</h3>

        {/* Basic Properties */}
        <div className="mb-6">
          <Label className="text-sm font-medium">Label</Label>
          <Input
            value={node.data.label}
            onChange={(e) => onUpdate({
              ...node,
              data: { ...node.data, label: e.target.value }
            } as ClinicalProtocolNode | ClinicalSafetyGate)}
            className="mt-1"
          />
        </div>

        {/* Medical Validation */}
        <div className="mb-6">
          <h4 className="font-medium mb-3 flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Medical Validation
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Validation Required</Label>
              <Switch
                checked={'medicalValidation' in node.data ? node.data.medicalValidation.required : false}
                onCheckedChange={(checked) => {
                  if ('medicalValidation' in node.data) {
                    onUpdate({
                      ...node,
                      data: {
                        ...node.data,
                        medicalValidation: {
                          ...node.data.medicalValidation,
                          required: checked
                        }
                      }
                    } as ClinicalProtocolNode | ClinicalSafetyGate);
                  }
                }}
              />
            </div>

            <div>
              <Label className="text-sm">Evidence Level</Label>
              <Select
                value={node.data.medicalValidation.evidenceLevel}
                onValueChange={(value) => onUpdate({
                  ...node,
                  data: {
                    ...node.data,
                    medicalValidation: {
                      ...node.data.medicalValidation,
                      evidenceLevel: value as 'A' | 'B' | 'C' | 'D'
                    }
                  }
                })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Level A - Multiple RCTs</SelectItem>
                  <SelectItem value="B">Level B - Single RCT or Observational</SelectItem>
                  <SelectItem value="C">Level C - Expert Opinion</SelectItem>
                  <SelectItem value="D">Level D - Limited Evidence</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {node.data.medicalValidation.validated && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="text-green-800">
                    Validated by {node.data.medicalValidation.validatedBy}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {node.data.medicalValidation.validationTimestamp?.toLocaleString()}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* PHARMA Framework Validation */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">PHARMA Framework</h4>
          <div className="space-y-2">
            {Object.entries(node.data.pharmaValidation).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => onUpdate({
                    ...node,
                    data: {
                      ...node.data,
                      pharmaValidation: {
                        ...node.data.pharmaValidation,
                        [key]: checked
                      }
                    }
                  })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* VERIFY Protocol Checks */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">VERIFY Protocol</h4>
          <div className="space-y-2">
            {Object.entries(node.data.verifyChecks).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => onUpdate({
                    ...node,
                    data: {
                      ...node.data,
                      verifyChecks: {
                        ...node.data.verifyChecks,
                        [key]: checked
                      }
                    }
                  })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Safety Requirements */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Safety Requirements</h4>

          <div className="space-y-3">
            <div>
              <Label className="text-sm">Contraindications</Label>
              <Textarea
                value={node.data.safetyRequirements.contraindications.join('\n')}
                onChange={(e) => onUpdate({
                  ...node,
                  data: {
                    ...node.data,
                    safetyRequirements: {
                      ...node.data.safetyRequirements,
                      contraindications: e.target.value.split('\n').filter(Boolean)
                    }
                  }
                })}
                className="mt-1"
                rows={3}
                placeholder="Enter contraindications (one per line)"
              />
            </div>

            <div>
              <Label className="text-sm">Required Monitoring</Label>
              <Textarea
                value={node.data.safetyRequirements.requiredMonitoring.join('\n')}
                onChange={(e) => onUpdate({
                  ...node,
                  data: {
                    ...node.data,
                    safetyRequirements: {
                      ...node.data.safetyRequirements,
                      requiredMonitoring: e.target.value.split('\n').filter(Boolean)
                    }
                  }
                })}
                className="mt-1"
                rows={3}
                placeholder="Enter monitoring requirements (one per line)"
              />
            </div>
          </div>
        </div>

        {/* Validate Node Button */}
        <Button
          onClick={handleValidate}
          disabled={isValidating}
          className="w-full mb-4"
        >
          {isValidating ? 'Validating...' : 'Validate Node'}
        </Button>

        {/* Validation Result */}
        {validationResult && (
          <Alert className={validationResult.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
            <AlertDescription>
              <div className={`font-medium mb-2 ${
                validationResult.isValid ? 'text-green-800' : 'text-red-800'
              }`}>
                {validationResult.isValid ? 'Validation Passed' : 'Validation Failed'}
              </div>
              {validationResult.issues && validationResult.issues.length > 0 && (
                <ul className="text-sm space-y-1">
                  {validationResult.issues.map((issue, idx) => (
                    <li key={idx} className="flex items-start">
                      <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </ScrollArea>
  );
};

// Workflow Properties Panel
const WorkflowProperties: React.FC<{
  nodes: (ClinicalProtocolNode | ClinicalSafetyGate)[];
  edges: WorkflowEdge[];
  validation?: WorkflowValidationResult;
  workflow: ClinicalWorkflow;
}> = ({ nodes, edges, validation, workflow }) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Workflow Overview</h3>

      <div className="space-y-4">
        <div>
          <Label className="text-sm text-gray-600">Workflow Name</Label>
          <p className="font-medium">{workflow.name}</p>
        </div>

        <div>
          <Label className="text-sm text-gray-600">Version</Label>
          <p className="font-medium">{workflow.version}</p>
        </div>

        <div>
          <Label className="text-sm text-gray-600">Status</Label>
          <Badge variant="outline" className="capitalize">
            {workflow.metadata.reviewStatus}
          </Badge>
        </div>

        <Separator />

        <div>
          <Label className="text-sm text-gray-600">Nodes</Label>
          <p className="font-medium">{nodes.length}</p>
        </div>

        <div>
          <Label className="text-sm text-gray-600">Connections</Label>
          <p className="font-medium">{edges.length}</p>
        </div>

        {validation && (
          <>
            <Separator />
            <div>
              <Label className="text-sm text-gray-600">Validation Status</Label>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Safety Checks</span>
                  <span>{validation.safetyChecksPassed}/{validation.totalSafetyChecks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Medical Validation</span>
                  <span>{validation.medicalValidationScore.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Compliance</span>
                  <span>{validation.complianceScore}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Expert Reviews</span>
                  <span>{validation.expertReviewsCompleted}/{validation.expertReviewsRequired}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Validation Overlay Component
const ValidationOverlay: React.FC<{ validation: WorkflowValidationResult }> = ({ validation }) => {
  return (
    <div className="absolute top-4 right-4 max-w-md bg-white rounded-lg shadow-xl border p-4 z-50">
      <h3 className="font-semibold mb-3 flex items-center">
        {validation.isValid ? (
          <>
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            Workflow Valid
          </>
        ) : (
          <>
            <XCircle className="mr-2 h-5 w-5 text-red-500" />
            Validation Issues Found
          </>
        )}
      </h3>

      {/* Validation Summary */}
      <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div className="p-2 bg-gray-50 rounded">
          <div className="text-gray-600">Safety Checks</div>
          <div className="font-semibold">{validation.safetyChecksPassed}/{validation.totalSafetyChecks}</div>
        </div>
        <div className="p-2 bg-gray-50 rounded">
          <div className="text-gray-600">Medical Validation</div>
          <div className="font-semibold">{validation.medicalValidationScore.toFixed(0)}%</div>
        </div>
        <div className="p-2 bg-gray-50 rounded">
          <div className="text-gray-600">Compliance</div>
          <div className="font-semibold">{validation.complianceScore}%</div>
        </div>
        <div className="p-2 bg-gray-50 rounded">
          <div className="text-gray-600">Expert Reviews</div>
          <div className="font-semibold">{validation.expertReviewsCompleted}/{validation.expertReviewsRequired}</div>
        </div>
      </div>

      {/* Issues List */}
      {validation.issues && validation.issues.length > 0 && (
        <div>
          <h4 className="font-medium mb-2 text-sm">Issues to Address:</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {validation.issues.map((issue, idx) => (
              <div key={idx} className="flex items-start text-sm">
                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 mr-2 ${
                  issue.severity === 'critical' ? 'bg-red-500' :
                  issue.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div>
                  <div className="font-medium">{issue.nodeId}: {issue.title}</div>
                  <div className="text-gray-600">{issue.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Safety Indicator Panel Component
const SafetyIndicatorPanel: React.FC<{
  nodes: (ClinicalProtocolNode | ClinicalSafetyGate)[];
  edges: WorkflowEdge[];
  metrics: {
    safetyGates: number;
    expertReviews: number;
    validationCoverage: number;
    complianceScore: number;
  };
}> = ({ metrics }) => {
  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 border">
      <h4 className="font-medium mb-3 text-sm">Workflow Safety Status</h4>
      <div className="space-y-2 text-sm">
        <SafetyMetric
          label="Safety Gates"
          value={metrics.safetyGates.toString()}
          status={metrics.safetyGates > 0 ? 'good' : 'warning'}
        />
        <SafetyMetric
          label="Expert Reviews"
          value={metrics.expertReviews.toString()}
          status={metrics.expertReviews > 0 ? 'good' : 'warning'}
        />
        <SafetyMetric
          label="Validation Coverage"
          value={`${metrics.validationCoverage.toFixed(0)}%`}
          status={metrics.validationCoverage > 80 ? 'good' :
                  metrics.validationCoverage > 60 ? 'warning' : 'critical'}
        />
        <SafetyMetric
          label="Compliance Score"
          value={`${metrics.complianceScore}%`}
          status={metrics.complianceScore === 100 ? 'good' :
                  metrics.complianceScore > 90 ? 'warning' : 'critical'}
        />
      </div>
    </div>
  );
};

// Safety Metric Component
const SafetyMetric: React.FC<{
  label: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
}> = ({ label, value, status }) => {

    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
    }
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={`font-semibold ${getStatusColor()}`}>{value}</span>
    </div>
  );
};

// Missing import for Heart icon
const Heart: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

export default EnhancedWorkflowBuilder;