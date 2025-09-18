'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  GitBranch,
  Plus,
  X,
  ArrowRight,
  Code,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import {
  ConditionalLogicPanelProps,
  ConditionalNext,
  EnhancedWorkflowStep
} from '@/types/workflow-enhanced';

interface ConditionTemplate {
  id: string;
  name: string;
  description: string;
  expression: string;
  category: 'Success' | 'Error' | 'Data' | 'Time';
}

const conditionTemplates: ConditionTemplate[] = [
  {
    id: 'success',
    name: 'On Success',
    description: 'Execute when step completes successfully',
    expression: 'output.status === "completed"',
    category: 'Success'
  },
  {
    id: 'high-confidence',
    name: 'High Confidence',
    description: 'Execute when confidence score is high',
    expression: 'output.confidence > 0.8',
    category: 'Success'
  },
  {
    id: 'low-confidence',
    name: 'Low Confidence',
    description: 'Execute when confidence score is low',
    expression: 'output.confidence < 0.5',
    category: 'Error'
  },
  {
    id: 'has-data',
    name: 'Has Required Data',
    description: 'Execute when required data is present',
    expression: 'output.data && output.data.length > 0',
    category: 'Data'
  },
  {
    id: 'no-data',
    name: 'Missing Data',
    description: 'Execute when data is missing or empty',
    expression: '!output.data || output.data.length === 0',
    category: 'Data'
  },
  {
    id: 'quick-execution',
    name: 'Quick Execution',
    description: 'Execute when step completes quickly',
    expression: 'output.execution_time < 60',
    category: 'Time'
  },
  {
    id: 'slow-execution',
    name: 'Slow Execution',
    description: 'Execute when step takes longer than expected',
    expression: 'output.execution_time > 300',
    category: 'Time'
  },
  {
    id: 'error-occurred',
    name: 'Error Occurred',
    description: 'Execute when an error occurs',
    expression: 'output.status === "failed" || output.error_count > 0',
    category: 'Error'
  }
];

export const ConditionalLogicPanel: React.FC<ConditionalLogicPanelProps> = ({
  step,
  allSteps,
  onAddCondition
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCondition, setNewCondition] = useState<Partial<ConditionalNext>>({
    condition: '',
    next_step_id: '',
    priority: 1
  });

  if (!step) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <GitBranch className="w-8 h-8 mb-2 text-gray-300" />
        <p className="text-sm">Select a step to configure conditional logic</p>
      </div>
    );
  }

  const availableNextSteps = allSteps.filter(s =>
    s.step_number > step.step_number && s.id !== step.id
  );

  const handleAddCondition = () => {
    if (!newCondition.condition || !newCondition.next_step_id) return;

    onAddCondition({
      condition: newCondition.condition,
      next_step_id: newCondition.next_step_id,
      priority: newCondition.priority || 1
    });

    setNewCondition({
      condition: '',
      next_step_id: '',
      priority: 1
    });
    setShowAddForm(false);
  };

  const handleTemplateSelect = (template: ConditionTemplate) => {
    setNewCondition({
      ...newCondition,
      condition: template.expression
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Success':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'Error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'Data':
        return <Info className="w-3 h-3 text-blue-500" />;
      case 'Time':
        return <Info className="w-3 h-3 text-yellow-500" />;
      default:
        return <Info className="w-3 h-3 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Success':
        return 'bg-green-100 text-green-800';
      case 'Error':
        return 'bg-red-100 text-red-800';
      case 'Data':
        return 'bg-blue-100 text-blue-800';
      case 'Time':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStepName = (stepId: string) => {
    const nextStep = allSteps.find(s => s.id.toString() === stepId);
    return nextStep ? nextStep.step_name : 'Unknown Step';
  };

  return (
    <div className="space-y-6">
      {/* Current Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center">
              <GitBranch className="w-4 h-4 mr-2" />
              Conditional Logic
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              disabled={availableNextSteps.length === 0}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {step.conditional_next && step.conditional_next.length > 0 ? (
            step.conditional_next
              .sort((a, b) => (a.priority || 999) - (b.priority || 999))
              .map((condition, index) => (
                <Card key={index} className="p-3 bg-gray-50">
                  <div className="space-y-3">
                    {/* Condition Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          Priority {condition.priority || 1}
                        </Badge>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span className="text-sm font-medium">
                          {getNextStepName(condition.next_step_id)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Condition Expression */}
                    <div className="bg-white rounded border p-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <Code className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500 font-medium">Condition:</span>
                      </div>
                      <code className="text-xs text-gray-800 bg-gray-100 px-2 py-1 rounded">
                        {condition.condition}
                      </code>
                    </div>

                    {/* Data Transformation */}
                    {condition.transform_data && (
                      <div className="bg-white rounded border p-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <Code className="w-3 h-3 text-blue-500" />
                          <span className="text-xs text-blue-600 font-medium">Data Transform:</span>
                        </div>
                        <code className="text-xs text-gray-800 bg-blue-50 px-2 py-1 rounded">
                          {condition.transform_data.expression}
                        </code>
                      </div>
                    )}
                  </div>
                </Card>
              ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              <GitBranch className="w-6 h-6 mx-auto mb-2 text-gray-300" />
              <p className="text-xs">No conditional logic configured</p>
              <p className="text-xs">Steps will execute sequentially</p>
            </div>
          )}

          {availableNextSteps.length === 0 && (
            <div className="text-center py-4 text-yellow-600 bg-yellow-50 rounded">
              <AlertCircle className="w-5 h-5 mx-auto mb-1" />
              <p className="text-xs">No subsequent steps available for branching</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Condition Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              Add New Condition
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Target Step Selection */}
            <div>
              <Label className="text-sm">Next Step</Label>
              <Select
                value={newCondition.next_step_id}
                onValueChange={(value) =>
                  setNewCondition({ ...newCondition, next_step_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select next step..." />
                </SelectTrigger>
                <SelectContent>
                  {availableNextSteps.map(nextStep => (
                    <SelectItem key={nextStep.id} value={nextStep.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {nextStep.step_number}
                        </Badge>
                        <span>{nextStep.step_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <Label className="text-sm">Priority</Label>
              <Input
                type="number"
                value={newCondition.priority || 1}
                onChange={(e) =>
                  setNewCondition({ ...newCondition, priority: parseInt(e.target.value) })
                }
                min="1"
                max="10"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers have higher priority (1 = highest)
              </p>
            </div>

            {/* Condition Templates */}
            <div>
              <Label className="text-sm mb-2 block">Condition Templates</Label>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {conditionTemplates.map(template => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-sm transition-shadow p-2"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(template.category)}
                        <div>
                          <span className="text-sm font-medium">{template.name}</span>
                          <p className="text-xs text-gray-600">{template.description}</p>
                        </div>
                      </div>
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Custom Condition Expression */}
            <div>
              <Label className="text-sm">Condition Expression</Label>
              <Textarea
                value={newCondition.condition}
                onChange={(e) =>
                  setNewCondition({ ...newCondition, condition: e.target.value })
                }
                placeholder="Enter JavaScript expression..."
                rows={3}
              />
              <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                <strong>Available variables:</strong>
                <ul className="mt-1 space-y-1">
                  <li><code>output</code> - Step output data</li>
                  <li><code>confidence</code> - Confidence score (0-1)</li>
                  <li><code>status</code> - Step status</li>
                  <li><code>accumulated_results</code> - All previous step results</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddCondition}
                disabled={!newCondition.condition || !newCondition.next_step_id}
              >
                Add Condition
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Expression Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div>
            <strong>Basic Examples:</strong>
            <ul className="mt-1 space-y-1 text-gray-600">
              <li><code>output.confidence &gt; 0.8</code> - High confidence</li>
              <li><code>output.status === "completed"</code> - Successful completion</li>
              <li><code>output.data.length &gt; 10</code> - Has sufficient data</li>
              <li><code>output.errors === 0</code> - No errors occurred</li>
            </ul>
          </div>
          <Separator />
          <div>
            <strong>Advanced Examples:</strong>
            <ul className="mt-1 space-y-1 text-gray-600">
              <li><code>output.regulatory_status === "approved"</code> - Regulatory approval</li>
              <li><code>output.cost_estimate &lt; 10000</code> - Cost within budget</li>
              <li><code>output.timeline_days &lt;= 30</code> - Fast timeline</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};