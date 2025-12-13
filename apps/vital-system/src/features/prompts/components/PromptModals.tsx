/**
 * PromptModals - Create/Edit/Delete modals for Prompts
 *
 * Comprehensive form with all relevant fields including:
 * - Basic info (name, display_name, description)
 * - PRISM Suite & Sub-Suite
 * - Organization context (Function, Department, Role)
 * - Prompt content (prompt_starter, detailed_prompt, system_prompt, user_template)
 * - Classification (complexity, domain, task_type, pattern_type)
 * - Metadata (tags, variables, version)
 * - Flags (RAG, expert validated, active)
 */
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Save,
  Loader2,
  Trash2,
  FileText,
  Shield,
  PenTool,
  Layers,
  Building2,
  Users,
  UserCircle,
  Bot,
  Sparkles,
  Zap,
  Settings,
  Tag,
} from 'lucide-react';
import { PRISM_SUITES } from './PromptSuiteFilter';

// Types
export interface Prompt {
  id?: string;
  name: string;
  slug?: string;
  prompt_code?: string;
  display_name?: string;
  title?: string;
  description?: string;
  content?: string;
  // Prompt content
  prompt_starter?: string;
  detailed_prompt?: string;
  system_prompt?: string;
  user_template?: string;
  user_prompt_template?: string;
  // Classification
  category?: string;
  domain?: string;
  function?: string;
  function_id?: string;
  function_name?: string;
  department?: string;
  department_id?: string;
  department_name?: string;
  role?: string;
  role_id?: string;
  role_name?: string;
  task_type?: string;
  pattern_type?: string;
  role_type?: string;
  complexity?: string;
  complexity_level?: string;
  // Tags and variables
  tags?: string[];
  variables?: string[];
  // Validation
  expert_validated?: boolean;
  validation_date?: string;
  validator_name?: string;
  validator_credentials?: string;
  version?: string;
  rag_enabled?: boolean;
  rag_context_sources?: string[];
  // Suite info
  suite?: string;
  suite_id?: string;
  suite_name?: string;
  sub_suite?: string;
  sub_suite_id?: string;
  sub_suite_name?: string;
  // Agent association
  agent_id?: string;
  agent_name?: string;
  // Status
  status?: string;
  is_active?: boolean;
  is_user_created?: boolean;
  // Timestamps
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

// Sub-suite interface
interface SubSuite {
  id: string;
  code: string;
  name: string;
  fullName?: string;
  description?: string;
  suiteId: string;
  suiteCode?: string;
}

// Default prompt for create form
export const DEFAULT_PROMPT: Partial<Prompt> = {
  name: '',
  display_name: '',
  description: '',
  prompt_starter: '',
  detailed_prompt: '',
  content: '',
  system_prompt: '',
  user_template: '',
  domain: '',
  complexity: 'basic',
  task_type: '',
  pattern_type: '',
  tags: [],
  variables: [],
  version: '1.0',
  rag_enabled: false,
  expert_validated: false,
  status: 'active',
  is_active: true,
};

// Generate slug from name
export function generatePromptSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Complexity options
export const COMPLEXITY_OPTIONS = [
  { value: 'basic', label: 'Basic', description: 'Simple, straightforward prompts' },
  { value: 'intermediary', label: 'Intermediary', description: 'Moderate complexity with some structure' },
  { value: 'advanced', label: 'Advanced', description: 'Complex prompts with detailed instructions' },
  { value: 'expert', label: 'Expert', description: 'Highly specialized expert-level prompts' },
];

// Domain options
export const DOMAIN_OPTIONS = [
  'regulatory',
  'clinical',
  'safety',
  'market-access',
  'medical-affairs',
  'evidence',
  'medical-writing',
  'competitive-intelligence',
  'project-management',
  'digital-health',
];

// Task type options
export const TASK_TYPE_OPTIONS = [
  'analysis',
  'generation',
  'summarization',
  'extraction',
  'classification',
  'translation',
  'review',
  'planning',
  'research',
  'compliance',
  'documentation',
  'strategy',
];

// Pattern type options
export const PATTERN_TYPE_OPTIONS = [
  'chain-of-thought',
  'few-shot',
  'zero-shot',
  'react',
  'tree-of-thought',
  'self-consistency',
  'role-playing',
  'structured-output',
  'iterative-refinement',
  'multi-step',
];

// Status options
export const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
  { value: 'deprecated', label: 'Deprecated' },
];

// Props for Create/Edit Modal
export interface PromptEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Partial<Prompt> | null;
  onPromptChange: (prompt: Partial<Prompt>) => void;
  onSave: () => void;
  isSaving: boolean;
  error: string | null;
}

export function PromptEditModal({
  isOpen,
  onClose,
  prompt,
  onPromptChange,
  onSave,
  isSaving,
  error,
}: PromptEditModalProps) {
  // Lookup data state
  const [subSuites, setSubSuites] = useState<SubSuite[]>([]);
  const [functions, setFunctions] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string; function_id?: string }[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string; department_id?: string }[]>([]);
  const [agents, setAgents] = useState<{ id: string; name: string; display_name?: string }[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);

  // Load lookup data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadLookupData();
    }
  }, [isOpen]);

  // Load sub-suites when suite changes
  useEffect(() => {
    if (prompt?.suite) {
      loadSubSuites(prompt.suite);
    } else {
      setSubSuites([]);
    }
  }, [prompt?.suite]);

  // Load departments when function changes
  useEffect(() => {
    if (prompt?.function_id) {
      loadDepartments(prompt.function_id);
    }
  }, [prompt?.function_id]);

  // Load roles when department changes
  useEffect(() => {
    if (prompt?.department_id) {
      loadRoles(prompt.department_id);
    }
  }, [prompt?.department_id]);

  const loadLookupData = async () => {
    setLoadingLookups(true);
    try {
      // Load functions
      const functionsRes = await fetch('/api/functions');
      if (functionsRes.ok) {
        const data = await functionsRes.json();
        setFunctions(data.functions || []);
      }

      // Load agents
      const agentsRes = await fetch('/api/agents?limit=500');
      if (agentsRes.ok) {
        const data = await agentsRes.json();
        setAgents(data.agents || []);
      }

      // Load initial sub-suites if suite is set
      if (prompt?.suite) {
        loadSubSuites(prompt.suite);
      }
    } catch (err) {
      console.error('Error loading lookup data:', err);
    } finally {
      setLoadingLookups(false);
    }
  };

  const loadSubSuites = async (suiteCode: string) => {
    try {
      const res = await fetch('/api/prism-suites');
      if (res.ok) {
        const data = await res.json();
        const allSubSuites = data.subSuites || [];
        const cleanSuiteCode = suiteCode.replace('™', '').toUpperCase();
        const filtered = allSubSuites.filter(
          (ss: SubSuite) => ss.suiteCode === cleanSuiteCode || ss.suiteCode === suiteCode
        );
        setSubSuites(filtered);
      }
    } catch (err) {
      console.error('Error loading sub-suites:', err);
    }
  };

  const loadDepartments = async (functionId: string) => {
    try {
      const res = await fetch(`/api/departments?function_id=${functionId}`);
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments || []);
      }
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  };

  const loadRoles = async (departmentId: string) => {
    try {
      const res = await fetch(`/api/roles?department_id=${departmentId}`);
      if (res.ok) {
        const data = await res.json();
        setRoles(data.roles || []);
      }
    } catch (err) {
      console.error('Error loading roles:', err);
    }
  };

  if (!prompt) return null;

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(t => t.trim()).filter(Boolean);
    onPromptChange({ ...prompt, tags });
  };

  const handleVariablesChange = (value: string) => {
    const variables = value.split(',').map(v => v.trim()).filter(Boolean);
    onPromptChange({ ...prompt, variables });
  };

  const handleSuiteChange = (value: string) => {
    onPromptChange({
      ...prompt,
      suite: value ? value + '™' : '',
      sub_suite: '', // Reset sub-suite when suite changes
      sub_suite_name: '',
    });
  };

  const handleSubSuiteChange = (value: string) => {
    const selectedSubSuite = subSuites.find(ss => ss.code === value || ss.name === value);
    onPromptChange({
      ...prompt,
      sub_suite: value,
      sub_suite_name: selectedSubSuite?.name || value,
    });
  };

  const handleFunctionChange = (value: string) => {
    const selectedFunction = functions.find(f => f.id === value);
    onPromptChange({
      ...prompt,
      function_id: value,
      function_name: selectedFunction?.name || '',
      department_id: '', // Reset downstream
      department_name: '',
      role_id: '',
      role_name: '',
    });
    setDepartments([]);
    setRoles([]);
  };

  const handleDepartmentChange = (value: string) => {
    const selectedDept = departments.find(d => d.id === value);
    onPromptChange({
      ...prompt,
      department_id: value,
      department_name: selectedDept?.name || '',
      role_id: '', // Reset downstream
      role_name: '',
    });
    setRoles([]);
  };

  const handleRoleChange = (value: string) => {
    const selectedRole = roles.find(r => r.id === value);
    onPromptChange({
      ...prompt,
      role_id: value,
      role_name: selectedRole?.name || '',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {prompt.id ? 'Edit Prompt' : 'Create New Prompt'}
          </DialogTitle>
          <DialogDescription>
            {prompt.id
              ? 'Update the prompt details below'
              : 'Fill in the details to create a new prompt'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mx-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Tabs defaultValue="basic" className="flex-1">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic" className="gap-1">
                <FileText className="h-3 w-3" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-1">
                <PenTool className="h-3 w-3" />
                Content
              </TabsTrigger>
              <TabsTrigger value="organization" className="gap-1">
                <Building2 className="h-3 w-3" />
                Organization
              </TabsTrigger>
              <TabsTrigger value="classification" className="gap-1">
                <Tag className="h-3 w-3" />
                Classification
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1">
                <Settings className="h-3 w-3" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[55vh] px-6 py-4">
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-0">
              {/* Name & Display Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={prompt.name || ''}
                    onChange={(e) => {
                      const name = e.target.value;
                      onPromptChange({
                        ...prompt,
                        name,
                        display_name: prompt.display_name || name,
                      });
                    }}
                    placeholder="e.g., Clinical Trial Protocol Review"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={prompt.display_name || ''}
                    onChange={(e) => onPromptChange({ ...prompt, display_name: e.target.value })}
                    placeholder="e.g., Protocol Review Assistant"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={prompt.description || ''}
                  onChange={(e) => onPromptChange({ ...prompt, description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of what this prompt does..."
                />
              </div>

              {/* Suite & Sub-Suite */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-600" />
                    PRISM Suite
                  </Label>
                  <Select
                    value={prompt.suite?.replace('™', '') || ''}
                    onValueChange={handleSuiteChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select suite" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {PRISM_SUITES.map((suite) => (
                        <SelectItem key={suite.code} value={suite.code}>
                          <span className="flex items-center gap-2">
                            <suite.icon className="h-4 w-4" />
                            {suite.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-purple-600" />
                    Sub-Suite
                  </Label>
                  <Select
                    value={prompt.sub_suite || ''}
                    onValueChange={handleSubSuiteChange}
                    disabled={!prompt.suite || subSuites.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={prompt.suite ? 'Select sub-suite' : 'Select suite first'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {subSuites.map((ss) => (
                        <SelectItem key={ss.id} value={ss.code}>
                          {ss.name || ss.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Version & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={prompt.version || '1.0'}
                    onChange={(e) => onPromptChange({ ...prompt, version: e.target.value })}
                    placeholder="e.g., 1.0, 2.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={prompt.status || 'active'}
                    onValueChange={(value) => onPromptChange({ ...prompt, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4 mt-0">
              {/* Prompt Starter */}
              <div className="space-y-2">
                <Label htmlFor="prompt_starter" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  Prompt Starter
                </Label>
                <Textarea
                  id="prompt_starter"
                  value={prompt.prompt_starter || ''}
                  onChange={(e) => onPromptChange({ ...prompt, prompt_starter: e.target.value })}
                  rows={3}
                  className="font-mono text-sm"
                  placeholder="A quick-start version of the prompt for immediate use..."
                />
                <p className="text-xs text-muted-foreground">
                  A concise version users can start with immediately
                </p>
              </div>

              {/* Detailed Prompt */}
              <div className="space-y-2">
                <Label htmlFor="detailed_prompt" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-violet-600" />
                  Detailed Prompt
                </Label>
                <Textarea
                  id="detailed_prompt"
                  value={prompt.detailed_prompt || ''}
                  onChange={(e) => onPromptChange({ ...prompt, detailed_prompt: e.target.value })}
                  rows={6}
                  className="font-mono text-sm"
                  placeholder="The full detailed prompt with complete instructions..."
                />
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <Label htmlFor="system_prompt" className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  System Prompt
                </Label>
                <Textarea
                  id="system_prompt"
                  value={prompt.system_prompt || ''}
                  onChange={(e) => onPromptChange({ ...prompt, system_prompt: e.target.value })}
                  rows={5}
                  className="font-mono text-sm"
                  placeholder="You are an expert in..."
                />
              </div>

              {/* User Template */}
              <div className="space-y-2">
                <Label htmlFor="user_template" className="flex items-center gap-2">
                  <PenTool className="h-4 w-4 text-green-600" />
                  User Template
                </Label>
                <Textarea
                  id="user_template"
                  value={prompt.user_template || ''}
                  onChange={(e) => onPromptChange({ ...prompt, user_template: e.target.value })}
                  rows={4}
                  className="font-mono text-sm"
                  placeholder="USER_GOAL: {{question}}&#10;CONTEXT: {{context}}&#10;..."
                />
                <p className="text-xs text-muted-foreground">
                  Use {'{{variable}}'} syntax for dynamic values
                </p>
              </div>

              {/* Variables */}
              <div className="space-y-2">
                <Label htmlFor="variables">Variables (comma-separated)</Label>
                <Input
                  id="variables"
                  value={(prompt.variables || []).join(', ')}
                  onChange={(e) => handleVariablesChange(e.target.value)}
                  placeholder="question, context, document, criteria"
                />
                <p className="text-xs text-muted-foreground">
                  Template variables that will be replaced at runtime
                </p>
              </div>
            </TabsContent>

            {/* Organization Tab */}
            <TabsContent value="organization" className="space-y-4 mt-0">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Link this prompt to organizational structure for better discoverability and targeting.
                </p>
              </div>

              {/* Function */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  Function
                </Label>
                <Select
                  value={prompt.function_id || ''}
                  onValueChange={handleFunctionChange}
                  disabled={loadingLookups}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingLookups ? 'Loading...' : 'Select function'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {functions.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  Department
                </Label>
                <Select
                  value={prompt.department_id || ''}
                  onValueChange={handleDepartmentChange}
                  disabled={!prompt.function_id || departments.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={prompt.function_id ? 'Select department' : 'Select function first'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-green-600" />
                  Role
                </Label>
                <Select
                  value={prompt.role_id || ''}
                  onValueChange={handleRoleChange}
                  disabled={!prompt.department_id || roles.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={prompt.department_id ? 'Select role' : 'Select department first'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Agent Association */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-orange-600" />
                  Associated Agent
                </Label>
                <Select
                  value={prompt.agent_id || ''}
                  onValueChange={(value) => {
                    const selectedAgent = agents.find(a => a.id === value);
                    onPromptChange({
                      ...prompt,
                      agent_id: value,
                      agent_name: selectedAgent?.display_name || selectedAgent?.name || '',
                    });
                  }}
                  disabled={loadingLookups}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingLookups ? 'Loading...' : 'Select agent (optional)'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.display_name || a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Optionally link this prompt to a specific AI agent
                </p>
              </div>
            </TabsContent>

            {/* Classification Tab */}
            <TabsContent value="classification" className="space-y-4 mt-0">
              {/* Domain & Complexity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Domain</Label>
                  <Select
                    value={prompt.domain || ''}
                    onValueChange={(value) => onPromptChange({ ...prompt, domain: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {DOMAIN_OPTIONS.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    Complexity
                  </Label>
                  <Select
                    value={prompt.complexity || 'basic'}
                    onValueChange={(value) => onPromptChange({ ...prompt, complexity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select complexity" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPLEXITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Task Type & Pattern Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Task Type</Label>
                  <Select
                    value={prompt.task_type || ''}
                    onValueChange={(value) => onPromptChange({ ...prompt, task_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {TASK_TYPE_OPTIONS.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Pattern Type</Label>
                  <Select
                    value={prompt.pattern_type || ''}
                    onValueChange={(value) => onPromptChange({ ...prompt, pattern_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pattern type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {PATTERN_TYPE_OPTIONS.map((pattern) => (
                        <SelectItem key={pattern} value={pattern}>
                          {pattern.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={prompt.category || ''}
                  onChange={(e) => onPromptChange({ ...prompt, category: e.target.value })}
                  placeholder="e.g., Regulatory, Clinical, Research"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={(prompt.tags || []).join(', ')}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="regulatory, clinical, protocol, FDA"
                />
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {prompt.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4 mt-0">
              {/* Switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                    <p className="text-xs text-muted-foreground">
                      Prompt is available for use
                    </p>
                  </div>
                  <Switch
                    id="is_active"
                    checked={prompt.is_active ?? true}
                    onCheckedChange={(checked) => onPromptChange({ ...prompt, is_active: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="rag_enabled" className="cursor-pointer">RAG Enabled</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable retrieval-augmented generation for this prompt
                    </p>
                  </div>
                  <Switch
                    id="rag_enabled"
                    checked={prompt.rag_enabled || false}
                    onCheckedChange={(checked) => onPromptChange({ ...prompt, rag_enabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="expert_validated" className="cursor-pointer">Expert Validated</Label>
                    <p className="text-xs text-muted-foreground">
                      Prompt has been reviewed and approved by domain experts
                    </p>
                  </div>
                  <Switch
                    id="expert_validated"
                    checked={prompt.expert_validated || false}
                    onCheckedChange={(checked) => onPromptChange({ ...prompt, expert_validated: checked })}
                  />
                </div>
              </div>

              {/* Validation Details (shown if expert validated) */}
              {prompt.expert_validated && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-sm font-medium">Validation Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="validator_name">Validator Name</Label>
                      <Input
                        id="validator_name"
                        value={prompt.validator_name || ''}
                        onChange={(e) => onPromptChange({ ...prompt, validator_name: e.target.value })}
                        placeholder="Dr. Jane Smith"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="validator_credentials">Credentials</Label>
                      <Input
                        id="validator_credentials"
                        value={prompt.validator_credentials || ''}
                        onChange={(e) => onPromptChange({ ...prompt, validator_credentials: e.target.value })}
                        placeholder="MD, PhD, Regulatory Affairs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* RAG Context Sources (shown if RAG enabled) */}
              {prompt.rag_enabled && (
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="rag_context_sources">RAG Context Sources (comma-separated)</Label>
                  <Input
                    id="rag_context_sources"
                    value={(prompt.rag_context_sources || []).join(', ')}
                    onChange={(e) => {
                      const sources = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      onPromptChange({ ...prompt, rag_context_sources: sources });
                    }}
                    placeholder="clinical_trials, regulatory_docs, guidelines"
                  />
                  <p className="text-xs text-muted-foreground">
                    Knowledge base collections to use for context retrieval
                  </p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {prompt.id ? 'Update Prompt' : 'Create Prompt'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Props for Delete Modal
export interface PromptDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function PromptDeleteModal({
  isOpen,
  onClose,
  prompt,
  onConfirm,
  isDeleting,
}: PromptDeleteModalProps) {
  if (!prompt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Prompt
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{prompt.display_name || prompt.name}&rdquo;?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300">
            This will permanently delete the prompt and remove it from any associated agents.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Prompt
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PromptEditModal;
