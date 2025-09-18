'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  X,
  Info
} from 'lucide-react';
import {
  StepPropertiesPanelProps,
  EnhancedWorkflowStep,
  ValidationRule,
  RetryConfiguration
} from '@/types/workflow-enhanced';

export const StepPropertiesPanel: React.FC<StepPropertiesPanelProps> = ({
  step,
  onUpdate
}) => {
  if (!step) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Settings className="w-8 h-8 mb-2 text-gray-300" />
        <p className="text-sm">Select a step to edit its properties</p>
      </div>
    );
  }

  const handleBasicUpdate = (field: keyof EnhancedWorkflowStep, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleCapabilityAdd = (capability: string) => {
    if (!capability.trim()) return;
    const currentCapabilities = step.required_capabilities || [];
    if (!currentCapabilities.includes(capability.trim())) {
      onUpdate({
        required_capabilities: [...currentCapabilities, capability.trim()]
      });
    }
  };

  const handleCapabilityRemove = (capability: string) => {
    const currentCapabilities = step.required_capabilities || [];
    onUpdate({
      required_capabilities: currentCapabilities.filter(c => c !== capability)
    });
  };

  const handleValidationRuleAdd = () => {
    const newRule: ValidationRule = {
      field: '',
      rule: 'required',
      message: '',
      severity: 'error'
    };
    const currentRules = step.validation_rules || [];
    onUpdate({
      validation_rules: [...currentRules, newRule]
    });
  };

  const handleValidationRuleUpdate = (index: number, updates: Partial<ValidationRule>) => {
    const currentRules = step.validation_rules || [];
    const updatedRules = currentRules.map((rule, i) =>
      i === index ? { ...rule, ...updates } : rule
    );
    onUpdate({ validation_rules: updatedRules });
  };

  const handleValidationRuleRemove = (index: number) => {
    const currentRules = step.validation_rules || [];
    onUpdate({
      validation_rules: currentRules.filter((_, i) => i !== index)
    });
  };

  const handleRetryConfigUpdate = (updates: Partial<RetryConfiguration>) => {
    onUpdate({
      retry_config: {
        ...step.retry_config,
        ...updates
      } as RetryConfiguration
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Properties */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Basic Properties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="step-name">Step Name</Label>
            <Input
              id="step-name"
              value={step.step_name}
              onChange={(e) => handleBasicUpdate('step_name', e.target.value)}
              placeholder="Enter step name..."
            />
          </div>

          <div>
            <Label htmlFor="step-description">Description</Label>
            <Textarea
              id="step-description"
              value={step.step_description}
              onChange={(e) => handleBasicUpdate('step_description', e.target.value)}
              placeholder="Describe what this step does..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="step-number">Step Number</Label>
              <Input
                id="step-number"
                type="number"
                value={step.step_number}
                onChange={(e) => handleBasicUpdate('step_number', parseInt(e.target.value))}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="estimated-duration" className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Duration (minutes)
              </Label>
              <Input
                id="estimated-duration"
                type="number"
                value={step.estimated_duration || 30}
                onChange={(e) => handleBasicUpdate('estimated_duration', parseInt(e.target.value))}
                min="1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Required Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Required Capabilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(step.required_capabilities || []).map((capability, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center space-x-1"
              >
                <span>{capability.replace(/_/g, ' ')}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleCapabilityRemove(capability)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>

          <div className="flex space-x-2">
            <Input
              placeholder="Add capability..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCapabilityAdd((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.querySelector('input[placeholder="Add capability..."]') as HTMLInputElement;
                if (input) {
                  handleCapabilityAdd(input.value);
                  input.value = '';
                }
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            Common capabilities: regulatory_analysis, clinical_design, data_analysis, report_generation
          </div>
        </CardContent>
      </Card>

      {/* Execution Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Execution Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Parallel Execution</Label>
              <p className="text-xs text-gray-500">Allow this step to run in parallel with others</p>
            </div>
            <Switch
              checked={step.is_parallel || false}
              onCheckedChange={(checked) => handleBasicUpdate('is_parallel', checked)}
            />
          </div>

          <Separator />

          <div>
            <Label className="text-sm font-medium mb-2 block">Retry Configuration</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="max-retries" className="text-xs">Max Retries</Label>
                <Input
                  id="max-retries"
                  type="number"
                  value={step.retry_config?.max_retries || 3}
                  onChange={(e) => handleRetryConfigUpdate({ max_retries: parseInt(e.target.value) })}
                  min="0"
                  max="10"
                />
              </div>
              <div>
                <Label htmlFor="retry-delay" className="text-xs">Retry Delay (ms)</Label>
                <Input
                  id="retry-delay"
                  type="number"
                  value={step.retry_config?.retry_delay_ms || 1000}
                  onChange={(e) => handleRetryConfigUpdate({ retry_delay_ms: parseInt(e.target.value) })}
                  min="100"
                />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={step.retry_config?.exponential_backoff || false}
                  onCheckedChange={(checked) => handleRetryConfigUpdate({ exponential_backoff: checked })}
                />
                <Label className="text-xs">Exponential backoff</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Validation Rules
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleValidationRuleAdd}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(step.validation_rules || []).map((rule, index) => (
            <Card key={index} className="p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Select
                    value={rule.severity}
                    onValueChange={(value: 'error' | 'warning') =>
                      handleValidationRuleUpdate(index, { severity: value })
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">
                        <span className="flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1 text-red-500" />
                          Error
                        </span>
                      </SelectItem>
                      <SelectItem value="warning">
                        <span className="flex items-center">
                          <Info className="w-3 h-3 mr-1 text-yellow-500" />
                          Warning
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleValidationRuleRemove(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor={`rule-field-${index}`} className="text-xs">Field</Label>
                    <Input
                      id={`rule-field-${index}`}
                      value={rule.field}
                      onChange={(e) => handleValidationRuleUpdate(index, { field: e.target.value })}
                      placeholder="Field name"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`rule-type-${index}`} className="text-xs">Rule Type</Label>
                    <Select
                      value={rule.rule}
                      onValueChange={(value: ValidationRule['rule']) =>
                        handleValidationRuleUpdate(index, { rule: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="required">Required</SelectItem>
                        <SelectItem value="min">Minimum</SelectItem>
                        <SelectItem value="max">Maximum</SelectItem>
                        <SelectItem value="pattern">Pattern</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor={`rule-message-${index}`} className="text-xs">Message</Label>
                  <Input
                    id={`rule-message-${index}`}
                    value={rule.message}
                    onChange={(e) => handleValidationRuleUpdate(index, { message: e.target.value })}
                    placeholder="Validation message"
                  />
                </div>
              </div>
            </Card>
          ))}

          {(!step.validation_rules || step.validation_rules.length === 0) && (
            <div className="text-center py-4 text-gray-500">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-gray-300" />
              <p className="text-xs">No validation rules configured</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monitoring Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Monitoring</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Track Performance</Label>
              <p className="text-xs text-gray-500">Record execution metrics for optimization</p>
            </div>
            <Switch
              checked={step.monitoring_config?.track_performance || true}
              onCheckedChange={(checked) =>
                onUpdate({
                  monitoring_config: {
                    alert_on_failure: step.monitoring_config?.alert_on_failure ?? false,
                    quality_thresholds: step.monitoring_config?.quality_thresholds,
                    track_performance: checked
                  }
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Alert on Failure</Label>
              <p className="text-xs text-gray-500">Send notifications when step fails</p>
            </div>
            <Switch
              checked={step.monitoring_config?.alert_on_failure || true}
              onCheckedChange={(checked) =>
                onUpdate({
                  monitoring_config: {
                    ...step.monitoring_config,
                    alert_on_failure: checked
                  }
                })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};