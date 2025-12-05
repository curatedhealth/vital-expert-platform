import React, { useState, useEffect } from 'react';
import { X, Save, Settings, Info } from 'lucide-react';
// TaskDefinition type is not directly used but imported for type checking
import { MultiSelect } from './MultiSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NodePropertiesPanelProps {
  node: any | null;
  onUpdate: (nodeId: string, updates: any) => void;
  onClose: () => void;
}

export const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({
  node,
  onUpdate,
  onClose,
}) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (node) {
      const task = node.data?.task;
      const nodeConfig = node.data?.config || {};
      const taskConfig = task?.config || {};
      
      // Helper function to get array value with fallback
      const getArrayValue = (primary: any, fallback: any): any[] => {
        if (primary !== undefined && primary !== null) {
          return Array.isArray(primary) ? primary : [];
        }
        if (fallback !== undefined && fallback !== null) {
          return Array.isArray(fallback) ? fallback : [];
        }
        return [];
      };
      
      // Extract tools - panel workflows store tools in task.config.tools
      // Check both locations: node.data.config.tools and task.config.tools
      const extractedTools = getArrayValue(nodeConfig.tools, taskConfig.tools);
      
      // Extract model and temperature
      const extractedModel = nodeConfig.model || taskConfig.model || 'gpt-4o-mini';
      const extractedTemperature = nodeConfig.temperature ?? taskConfig.temperature ?? 0.7;
      
      // Extract label and description - check node.data first, then task
      const extractedLabel = node.data?.label || task?.name || '';
      const extractedDescription = node.data?.description || task?.description || '';
      
      // Priority: node.data.config > task.config > defaults
      // This ensures we show the actual stored values, not just defaults
      const formDataToSet = {
        label: extractedLabel,
        description: extractedDescription,
        model: extractedModel,
        temperature: extractedTemperature,
        // Tools: check node.data.config first (actual stored value), then task.config
        // Panel workflows store tools in task.config.tools as array like ["rag", "pubmed", "fda"]
        tools: extractedTools,
        // Agents: check assignedAgents first (most common location), then config locations
        // Panel workflows don't use assignedAgents, so this will be empty for panel nodes
        agents: getArrayValue(
          node.data?.assignedAgents,
          getArrayValue(nodeConfig.agents, taskConfig.agents)
        ),
        // RAGs: check node.data.config first, then task.config
        // Panel workflows don't use rags field, so this will be empty for panel nodes
        rags: getArrayValue(nodeConfig.rags, taskConfig.rags),
        enabled: node.data?.enabled ?? false,
      };
      
      setFormData(formDataToSet);
    }
  }, [node]);

  const availableAgents = [
    { id: 'medical', name: 'Medical Research Agent', description: 'Clinical trials, drug mechanisms, efficacy, safety data' },
    { id: 'digital_health', name: 'Digital Health Agent', description: 'Health tech innovations, digital therapeutics, AI/ML' },
    { id: 'regulatory', name: 'Regulatory Agent', description: 'FDA/EMA approvals, compliance, regulatory pathways' },
    { id: 'aggregator', name: 'Aggregator Agent', description: 'Synthesizes findings and archives to RAG' },
    { id: 'copywriter', name: 'Copywriter Agent', description: 'Generates professional reports' },
  ];

  const availableTools = [
    { id: 'pubmed', name: 'PubMed', description: 'Search PubMed/MEDLINE for peer-reviewed research' },
    { id: 'clinical_trials', name: 'Clinical Trials', description: 'Search ClinicalTrials.gov for trial data' },
    { id: 'fda', name: 'FDA Search', description: 'Search FDA database for approvals and compliance' },
    { id: 'web_search', name: 'Web Search', description: 'Search the web for general information' },
    { id: 'arxiv', name: 'ArXiv', description: 'Search ArXiv for research papers' },
    { id: 'scraper', name: 'Web Scraper', description: 'Scrape content from URLs' },
    { id: 'rag', name: 'RAG', description: 'Query internal knowledge base using RAG' }, // Support legacy "rag" ID
  ];

  const availableRAGs = [
    { id: 'rag_search', name: 'RAG Search', description: 'Query internal knowledge base using RAG' },
    { id: 'rag_archive', name: 'RAG Archive', description: 'Archive data to knowledge base' },
  ];

  if (!node) {
    return (
      <div className="w-[350px] bg-white border-l border-neutral-200 flex flex-col h-full shadow-lg">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-primary to-neutral-900 text-white">
          <h3 className="text-lg font-semibold">Node Properties</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-600 text-center">
          <Settings size={48} className="mb-4 opacity-50" />
          <p>Select a node to edit its properties</p>
        </div>
      </div>
    );
  }

  const task = node.data?.task;
  const nodeType = task?.category || 'Task';

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (node) {
      const updates: any = {
        label: formData.label,
        description: formData.description,
        config: {
          model: formData.model,
          temperature: formData.temperature,
          tools: formData.tools,
          agents: formData.agents,
          rags: formData.rags,
        },
        assignedAgents: formData.agents,
        enabled: formData.enabled,
      };

      if (task) {
        updates.task = {
          ...task,
          name: formData.label,
          description: formData.description,
          config: {
            ...task.config,
            ...updates.config,
          },
        };
      }

      onUpdate(node.id, updates);
    }
  };



  return (
    <div className="w-[350px] bg-white border-l border-neutral-200 flex flex-col h-full shadow-lg">
      <div className="px-6 py-4 border-b bg-gradient-to-r from-primary to-neutral-900 text-white flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{formData.label || 'Node Properties'}</h3>
          <span className="text-xs opacity-90 block mt-1">{nodeType}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X size={18} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Basic Properties */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide">Basic Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="node-name">Node Name</Label>
              <Input
                id="node-name"
                type="text"
                value={formData.label || ''}
                onChange={(e) => handleChange('label', e.target.value)}
                placeholder="Enter node name..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="node-description">Description</Label>
              <Textarea
                id="node-description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter node description..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="node-enabled"
                checked={formData.enabled ?? false}
                onCheckedChange={(checked) => handleChange('enabled', checked)}
              />
              <Label htmlFor="node-enabled" className="cursor-pointer">Enabled</Label>
            </div>
          </CardContent>
        </Card>

        {/* Model Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide">Model Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="node-model">Model</Label>
              <Select
                value={formData.model || 'gpt-4o-mini'}
                onValueChange={(value) => handleChange('model', value)}
              >
                <SelectTrigger id="node-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Temperature: {formData.temperature ?? 0.7}
              </Label>
              <Slider
                min={0}
                max={2}
                step={0.1}
                value={[formData.temperature ?? 0.7]}
                onValueChange={(values) => handleChange('temperature', values[0])}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Lower = more deterministic, Higher = more creative
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Prompt Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide">System Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Info size={14} className="mt-0.5 flex-shrink-0" />
              <p>Controlled by Orchestrator. Edit it in Settings. Users can set per-task User Prompt when adding from palette.</p>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Agents */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide">Assigned Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiSelect
              label="Assigned Agents"
              options={availableAgents}
              selected={formData.agents || []}
              onChange={(selected) => handleChange('agents', selected)}
              placeholder="Select agents..."
              hint="Select which agents should handle this task. Leave empty to use orchestrator's default assignment."
            />
          </CardContent>
        </Card>

        {/* Tools */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide">Available Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiSelect
              label="Available Tools"
              options={availableTools}
              selected={formData.tools || []}
              onChange={(selected) => handleChange('tools', selected)}
              placeholder="Select tools..."
              hint="Choose which tools this task can use"
            />
          </CardContent>
        </Card>

        {/* RAG Options */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide">RAG Options</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiSelect
              label="RAG Options"
              options={availableRAGs}
              selected={formData.rags || []}
              onChange={(selected) => handleChange('rags', selected)}
              placeholder="Select RAG options..."
              hint="Choose RAG search or archive capabilities"
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="mt-6 pt-6 border-t">
          <Button className="w-full" onClick={handleSave}>
            <Save size={16} className="mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

