/**
 * Agent Edit Form Component
 * Comprehensive form for editing all agent attributes
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Agent, AgentLevelNumber } from '../types/agent.types';
import { AGENT_LEVEL_COLORS } from '../constants/design-tokens';
import {
  Save,
  X,
  Plus,
  Trash2,
  Settings,
  Building,
  Layers,
  Wrench,
  Lightbulb,
  Cpu,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface AgentEditFormProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (agent: Partial<Agent>) => Promise<void>;
}

interface FormState {
  // Basic Info
  name: string;
  display_name: string;
  description: string;
  tagline: string;
  version: string;

  // Organization
  function_name: string;
  department_name: string;
  role_name: string;

  // Level & Status
  agent_levels: { level_number: AgentLevelNumber };
  tier: 1 | 2 | 3;
  status: 'active' | 'inactive' | 'development' | 'testing' | 'deprecated';

  // LLM Configuration
  model: string;
  temperature: number;
  max_tokens: number;
  context_window: number;
  token_budget: number;

  // Capabilities
  capabilities: string[];
  tools: string[];
  skills: string[];
  knowledge_domains: string[];

  // Advanced
  system_prompt: string;
  cost_per_query: number;
  rag_enabled: boolean;
}

// ============================================================================
// AGENT EDIT FORM COMPONENT
// ============================================================================

export const AgentEditForm: React.FC<AgentEditFormProps> = ({
  agent,
  open,
  onOpenChange,
  onSave,
}) => {
  const [saving, setSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('basic');

  // Initialize form state
  const [formState, setFormState] = React.useState<FormState>({
    name: '',
    display_name: '',
    description: '',
    tagline: '',
    function_name: '',
    department_name: '',
    role_name: '',
    agent_levels: { level_number: 3 },
    status: 'development',
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 2000,
    context_window: 8000,
    capabilities: [],
    tools: [],
    skills: [],
    knowledge_domains: [],
    system_prompt: '',
    cost_per_query: 0,
    rag_enabled: true, // RAG enabled by default for all agents
  });

  // Sync form state with agent prop
  React.useEffect(() => {
    if (agent) {
      setFormState({
        name: agent.name || '',
        display_name: agent.display_name || agent.name || '',
        description: agent.description || '',
        tagline: agent.tagline || '',
        function_name: agent.function_name || '',
        department_name: agent.department_name || '',
        role_name: agent.role_name || '',
        agent_levels: agent.agent_levels || { level_number: 3 },
        status: agent.status || 'development',
        model: agent.model || 'gpt-4',
        temperature: agent.temperature ?? 0.7,
        max_tokens: agent.max_tokens || 2000,
        context_window: agent.context_window || 8000,
        capabilities: Array.isArray(agent.capabilities) ? agent.capabilities : [],
        tools: Array.isArray(agent.tools) ? agent.tools : [],
        skills: Array.isArray(agent.skills) ? agent.skills : [],
        knowledge_domains: Array.isArray(agent.knowledge_domains) ? agent.knowledge_domains : [],
        system_prompt: agent.system_prompt || '',
        cost_per_query: agent.cost_per_query || 0,
        rag_enabled: agent.rag_enabled ?? true, // RAG enabled by default for all agents
      });
    }
  }, [agent]);

  // Handle save
  const handleSave = async () => {
    if (!agent) return;

    setSaving(true);
    try {
      await onSave({
        id: agent.id,
        ...formState,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save agent:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handle array field add
  const handleAddArrayItem = (field: keyof Pick<FormState, 'capabilities' | 'tools' | 'skills' | 'knowledge_domains'>, value: string) => {
    if (!value.trim()) return;
    setFormState(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()],
    }));
  };

  // Handle array field remove
  const handleRemoveArrayItem = (field: keyof Pick<FormState, 'capabilities' | 'tools' | 'skills' | 'knowledge_domains'>, index: number) => {
    setFormState(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl">Edit Agent</DialogTitle>
          <DialogDescription>
            Make changes to {agent.display_name || agent.name}'s configuration
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">
                <Settings className="h-4 w-4 mr-2" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="org">
                <Building className="h-4 w-4 mr-2" />
                Organization
              </TabsTrigger>
              <TabsTrigger value="level">
                <Layers className="h-4 w-4 mr-2" />
                Level & Model
              </TabsTrigger>
              <TabsTrigger value="capabilities">
                <Lightbulb className="h-4 w-4 mr-2" />
                Capabilities
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <Cpu className="h-4 w-4 mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6 max-h-[60vh]">
            {/* BASIC INFO TAB */}
            <TabsContent value="basic" className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Agent ID</Label>
                  <Input
                    id="name"
                    value={formState.name}
                    onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="unique-agent-id"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formState.display_name}
                    onChange={(e) => setFormState(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Human-readable name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={formState.tagline}
                    onChange={(e) => setFormState(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="Brief one-liner"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formState.description}
                    onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed agent description"
                    rows={4}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formState.status}
                    onValueChange={(value: any) => setFormState(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* ORGANIZATION TAB */}
            <TabsContent value="org" className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="function">Business Function</Label>
                  <Input
                    id="function"
                    value={formState.function_name}
                    onChange={(e) => setFormState(prev => ({ ...prev, function_name: e.target.value }))}
                    placeholder="e.g., Medical Affairs"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formState.department_name}
                    onChange={(e) => setFormState(prev => ({ ...prev, department_name: e.target.value }))}
                    placeholder="e.g., Clinical Operations"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={formState.role_name}
                    onChange={(e) => setFormState(prev => ({ ...prev, role_name: e.target.value }))}
                    placeholder="e.g., Clinical Trial Manager"
                  />
                </div>
              </div>
            </TabsContent>

            {/* LEVEL & MODEL TAB */}
            <TabsContent value="level" className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Agent Level</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {([1, 2, 3, 4, 5] as AgentLevelNumber[]).map((level) => {
                      const config = AGENT_LEVEL_COLORS[level];
                      const isSelected = formState.agent_levels.level_number === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormState(prev => ({
                            ...prev,
                            agent_levels: { level_number: level },
                          }))}
                          className={cn(
                            'p-3 border-2 rounded-lg text-center transition-all',
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <div className="font-semibold">L{level}</div>
                          <div className="text-xs text-muted-foreground">{config.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-2">
                  <Label htmlFor="model">LLM Model</Label>
                  <Select
                    value={formState.model}
                    onValueChange={(value) => setFormState(prev => ({ ...prev, model: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                      <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={formState.temperature}
                      onChange={(e) => setFormState(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="max_tokens">Max Tokens</Label>
                    <Input
                      id="max_tokens"
                      type="number"
                      value={formState.max_tokens}
                      onChange={(e) => setFormState(prev => ({ ...prev, max_tokens: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="context_window">Context Window</Label>
                    <Input
                      id="context_window"
                      type="number"
                      value={formState.context_window}
                      onChange={(e) => setFormState(prev => ({ ...prev, context_window: parseInt(e.target.value) }))}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cost_per_query">Cost per Query ($)</Label>
                    <Input
                      id="cost_per_query"
                      type="number"
                      step="0.001"
                      value={formState.cost_per_query}
                      onChange={(e) => setFormState(prev => ({ ...prev, cost_per_query: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* CAPABILITIES TAB */}
            <TabsContent value="capabilities" className="space-y-4 py-4">
              <ArrayFieldEditor
                label="Capabilities"
                items={formState.capabilities}
                onAdd={(value) => handleAddArrayItem('capabilities', value)}
                onRemove={(index) => handleRemoveArrayItem('capabilities', index)}
                placeholder="Enter capability"
              />

              <Separator />

              <ArrayFieldEditor
                label="Tools"
                items={formState.tools}
                onAdd={(value) => handleAddArrayItem('tools', value)}
                onRemove={(index) => handleRemoveArrayItem('tools', index)}
                placeholder="Enter tool name"
              />

              <Separator />

              <ArrayFieldEditor
                label="Skills"
                items={formState.skills}
                onAdd={(value) => handleAddArrayItem('skills', value)}
                onRemove={(index) => handleRemoveArrayItem('skills', index)}
                placeholder="Enter skill"
              />

              <Separator />

              <ArrayFieldEditor
                label="Knowledge Domains"
                items={formState.knowledge_domains}
                onAdd={(value) => handleAddArrayItem('knowledge_domains', value)}
                onRemove={(index) => handleRemoveArrayItem('knowledge_domains', index)}
                placeholder="Enter knowledge domain"
              />
            </TabsContent>

            {/* ADVANCED TAB */}
            <TabsContent value="advanced" className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="system_prompt">System Prompt</Label>
                  <Textarea
                    id="system_prompt"
                    value={formState.system_prompt}
                    onChange={(e) => setFormState(prev => ({ ...prev, system_prompt: e.target.value }))}
                    placeholder="Enter system prompt instructions"
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rag_enabled"
                    checked={formState.rag_enabled}
                    onChange={(e) => setFormState(prev => ({ ...prev, rag_enabled: e.target.checked }))}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="rag_enabled" className="cursor-pointer">
                    Enable RAG (Retrieval Augmented Generation)
                  </Label>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="border-t p-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// ARRAY FIELD EDITOR COMPONENT
// ============================================================================

interface ArrayFieldEditorProps {
  label: string;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  placeholder?: string;
}

const ArrayFieldEditor: React.FC<ArrayFieldEditorProps> = ({
  label,
  items,
  onAdd,
  onRemove,
  placeholder = 'Enter value',
}) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        <Button type="button" onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {items.map((item, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {item}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default AgentEditForm;
