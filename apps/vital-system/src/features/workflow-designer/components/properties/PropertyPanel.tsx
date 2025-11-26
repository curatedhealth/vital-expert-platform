/**
 * Property Panel Component
 * 
 * Edit properties of selected nodes and edges
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, X, Save } from 'lucide-react';
import { getNodeTypeDefinition } from '../../constants/node-types';
import type { WorkflowNode, NodeConfig } from '../../types/workflow';

interface Agent {
  id: string;
  name: string;
  display_name?: string;
}

interface PropertyPanelProps {
  selectedNode: WorkflowNode | null;
  onUpdate: (nodeId: string, config: Partial<NodeConfig>) => void;
  onClose: () => void;
}

export function PropertyPanel({ selectedNode, onUpdate, onClose }: PropertyPanelProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  
  // Check if this is an expert/agent node that needs agent selection
  const isExpertNode = selectedNode?.type === 'agent' || 
    selectedNode?.data?.task?.id === 'expert_agent' ||
    selectedNode?.data?.type === 'agent' ||
    selectedNode?.data?._original_type === 'agent';
  
  // Fetch agents when expert node is selected
  useEffect(() => {
    if (isExpertNode && agents.length === 0 && !loadingAgents) {
      setLoadingAgents(true);
      fetch('/api/agents?status=active')
        .then(res => res.json())
        .then(data => {
          if (data.agents && Array.isArray(data.agents)) {
            setAgents(data.agents);
          }
        })
        .catch(err => {
          console.error('Failed to fetch agents:', err);
        })
        .finally(() => {
          setLoadingAgents(false);
        });
    }
  }, [isExpertNode, agents.length, loadingAgents]);

  if (!selectedNode) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <Settings className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Select a node to edit its properties</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const nodeDef = getNodeTypeDefinition(selectedNode.type);
  const config = selectedNode.config;

  const handleConfigUpdate = (key: string, value: any) => {
    onUpdate(selectedNode.id, { [key]: value });
  };

  const handleLabelUpdate = (newLabel: string) => {
    // Update label - this is stored in node.data.label, not in config
    onUpdate(selectedNode.id, { label: newLabel });
  };

  const handleSave = () => {
    // Save is automatic, just close
    onClose();
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${nodeDef.color}20` }}
            >
              <nodeDef.icon className="w-4 h-4" style={{ color: nodeDef.color }} />
            </div>
            <div>
              <CardTitle className="text-base">{selectedNode.label}</CardTitle>
              <Badge variant="outline" className="text-[10px] mt-1">
                {selectedNode.type}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Common Properties */}
        <div className="space-y-2">
          <Label htmlFor="label">Node Label</Label>
          <Input
            id="label"
            value={selectedNode.label}
            onChange={(e) => handleLabelUpdate(e.target.value)}
            placeholder="Enter node label..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={config.description || ''}
            onChange={(e) => handleConfigUpdate('description', e.target.value)}
            placeholder="Enter node description..."
            rows={2}
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-sm mb-3">Type-Specific Configuration</h3>

          {/* Expert/Agent Node - Agent Selection */}
          {isExpertNode && (
            <div className="space-y-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="agentId">Select Expert Agent</Label>
                <Select
                  value={config.agentId || ''}
                  onValueChange={(value) => {
                    // Update agent ID in config
                    handleConfigUpdate('agentId', value);
                    
                    // Automatically update node label to match selected agent name
                    const selectedAgent = agents.find(a => a.id === value);
                    if (selectedAgent) {
                      const agentName = selectedAgent.display_name || selectedAgent.name;
                      handleLabelUpdate(agentName);
                    }
                  }}
                  disabled={loadingAgents}
                >
                  <SelectTrigger id="agentId">
                    <SelectValue placeholder={loadingAgents ? "Loading agents..." : "Choose an expert agent..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.display_name || agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {config.agentId 
                    ? `Selected: ${agents.find(a => a.id === config.agentId)?.display_name || agents.find(a => a.id === config.agentId)?.name || config.agentId}`
                    : 'Select a real agent from the database to use in this panel workflow'}
                </p>
              </div>
            </div>
          )}

          {/* Agent Properties */}
          {selectedNode.type === 'agent' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  value={config.systemPrompt || ''}
                  onChange={(e) => handleConfigUpdate('systemPrompt', e.target.value)}
                  placeholder="You are a helpful AI assistant..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select
                  value={config.model || 'gpt-4'}
                  onValueChange={(value) => handleConfigUpdate('model', value)}
                >
                  <SelectTrigger id="model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">
                  Temperature: {(config.temperature || 0.7).toFixed(2)}
                </Label>
                <Slider
                  id="temperature"
                  min={0}
                  max={2}
                  step={0.1}
                  value={[config.temperature || 0.7]}
                  onValueChange={([value]) => handleConfigUpdate('temperature', value)}
                />
                <p className="text-xs text-gray-500">
                  Lower = more focused, Higher = more creative
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={config.maxTokens || 2000}
                  onChange={(e) => handleConfigUpdate('maxTokens', parseInt(e.target.value))}
                  min={100}
                  max={32000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tools">Tools (comma-separated)</Label>
                <Input
                  id="tools"
                  value={(config.tools || []).join(', ')}
                  onChange={(e) => handleConfigUpdate('tools', e.target.value.split(',').map(t => t.trim()))}
                  placeholder="web_search, calculator, ..."
                />
              </div>
            </div>
          )}

          {/* Tool Properties */}
          {selectedNode.type === 'tool' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="toolName">Tool Name</Label>
                <Input
                  id="toolName"
                  value={config.toolName || ''}
                  onChange={(e) => handleConfigUpdate('toolName', e.target.value)}
                  placeholder="e.g., web_search"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="toolParams">Tool Parameters (JSON)</Label>
                <Textarea
                  id="toolParams"
                  value={JSON.stringify(config.toolParams || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const params = JSON.parse(e.target.value);
                      handleConfigUpdate('toolParams', params);
                    } catch (err) {
                      // Invalid JSON, show error in UI
                      console.warn('Invalid JSON:', err);
                    }
                  }}
                  placeholder='{\n  "key": "value"\n}'
                  rows={4}
                  className={`font-mono text-xs ${
                    (() => {
                      try {
                        JSON.parse(JSON.stringify(config.toolParams || {}));
                        return '';
                      } catch {
                        return 'border-red-500';
                      }
                    })()
                  }`}
                />
                <p className="text-xs text-gray-500">
                  Enter valid JSON format for tool parameters
                </p>
              </div>
            </div>
          )}

          {/* Condition Properties */}
          {selectedNode.type === 'condition' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="conditionType">Condition Type</Label>
                <Select
                  value={config.conditionType || 'simple'}
                  onValueChange={(value) => handleConfigUpdate('conditionType', value)}
                >
                  <SelectTrigger id="conditionType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conditionExpression">Condition Expression</Label>
                <Textarea
                  id="conditionExpression"
                  value={config.conditionExpression || ''}
                  onChange={(e) => handleConfigUpdate('conditionExpression', e.target.value)}
                  placeholder="state.value > 10"
                  rows={3}
                  className="font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* Parallel Properties */}
          {selectedNode.type === 'parallel' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mergeStrategy">Merge Strategy</Label>
                <Select
                  value={config.mergeStrategy || 'all'}
                  onValueChange={(value) => handleConfigUpdate('mergeStrategy', value)}
                >
                  <SelectTrigger id="mergeStrategy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wait for All</SelectItem>
                    <SelectItem value="first">First to Complete</SelectItem>
                    <SelectItem value="any">Any Result</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Human Properties */}
          {selectedNode.type === 'human' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="humanApprovalRequired">Approval Required</Label>
                <Switch
                  id="humanApprovalRequired"
                  checked={config.humanApprovalRequired !== false}
                  onCheckedChange={(checked) => handleConfigUpdate('humanApprovalRequired', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="humanInstructions">Instructions</Label>
                <Textarea
                  id="humanInstructions"
                  value={config.humanInstructions || ''}
                  onChange={(e) => handleConfigUpdate('humanInstructions', e.target.value)}
                  placeholder="Please review and approve..."
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Advanced Options */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-sm mb-3">Advanced Options</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                value={config.timeout || 300}
                onChange={(e) => handleConfigUpdate('timeout', parseInt(e.target.value))}
                min={1}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="retryOnError">Retry on Error</Label>
              <Switch
                id="retryOnError"
                checked={config.retryOnError === true}
                onCheckedChange={(checked) => handleConfigUpdate('retryOnError', checked)}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t pt-4 flex gap-2">
          <Button onClick={handleSave} className="flex-1 gap-2">
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

