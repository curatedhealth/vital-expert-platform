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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgentAvatar } from '@/components/ui/agent-avatar';
import {
  Save,
  X,
  Settings,
  Users,
  CheckSquare,
  Info,
  ExternalLink,
  AlertCircle,
  Filter,
  Workflow,
  Target,
  Plus,
  Bot,
  User,
} from 'lucide-react';
import { ToolRegistryService, Tool } from '@/lib/services/tool-registry-service';
import { createClient } from '@/lib/supabase/client';

interface ToolDetailModalProps {
  tool: Tool | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedTool: Tool) => void;
  mode?: 'view' | 'edit';
}

interface Agent {
  id: string;
  name: string;
  title?: string;
  description?: string;
  is_active: boolean;
  avatar?: string;
  display_name?: string;
  expertise?: string[];
  specialties?: string[];
  metadata?: {
    avatar?: string;
    display_name?: string;
    [key: string]: any;
  };
}

interface TaskAssignment {
  id: string;
  task_name: string;
  use_case: string;
  workflow: string;
  description?: string;
  is_enabled: boolean;
  priority?: number;
}

export function ToolDetailModal({
  tool,
  isOpen,
  onClose,
  onSave,
  mode: initialMode = 'view',
}: ToolDetailModalProps) {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<Tool>>({});

  // Tasks tab state
  const [taskAssignments, setTaskAssignments] = useState<TaskAssignment[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskAssignment[]>([]);
  const [useCaseFilter, setUseCaseFilter] = useState<string>('all');
  const [workflowFilter, setWorkflowFilter] = useState<string>('all');
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    task_name: '',
    use_case: '',
    workflow: '',
    description: '',
    priority: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    if (tool) {
      setFormData(tool);
      loadAgents();
      loadToolAssignments();
      loadTaskAssignments();
    }
  }, [tool]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    filterTasks();
  }, [useCaseFilter, workflowFilter, taskAssignments]);

  const loadAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id, name, title, description, is_active, slug, expertise, specialties, metadata')
        .eq('is_active', true)
        .order('metadata->>display_name');

      if (error) throw error;
      
      // Transform data to match AgentAvatar expectations
      const transformedAgents = (data || []).map(agent => {
        let avatarCode = agent.metadata?.avatar || 'avatar_0001';
        
        // Convert descriptive avatar strings to avatar codes
        // e.g., "01arab_male_people_beard..." -> "avatar_0001"
        // e.g., "08boy_people_avatar..." -> "avatar_0008"
        if (avatarCode && typeof avatarCode === 'string' &&
            !avatarCode.match(/^avatar_\d{3,4}$/) && 
            !avatarCode.startsWith('http') && 
            !avatarCode.startsWith('/')) {
          
          // Extract number from prefix
          const match = avatarCode.match(/^(\d+)/);
          if (match) {
            const num = match[1].padStart(4, '0');
            avatarCode = `avatar_${num}`;
          } else {
            // Fallback mapping for descriptive terms without number prefix
            if (avatarCode.includes('beard') || avatarCode.includes('arab')) {
              avatarCode = 'avatar_0015';
            } else if (avatarCode.includes('medical') || avatarCode.includes('doctor')) {
              avatarCode = 'avatar_0010';
            } else if (avatarCode.includes('scientist') || avatarCode.includes('research')) {
              avatarCode = 'avatar_0012';
            } else if (avatarCode.includes('boy') || avatarCode.includes('teenager')) {
              avatarCode = 'avatar_0005';
            } else {
              avatarCode = 'avatar_0001';
            }
          }
        }
        
        return {
          ...agent,
          avatar: avatarCode,
          display_name: agent.metadata?.display_name || agent.title || agent.name
        };
      });
      
      setAgents(transformedAgents);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const getDisplayName = (agent: Agent) => {
    return agent.display_name || agent.metadata?.display_name || agent.title || agent.name;
  };

  const loadToolAssignments = async () => {
    if (!tool?.id) return;

    try {
      const { data, error } = await supabase
        .from('agent_tool_assignments')
        .select('agent_id')
        .eq('tool_id', tool.id);

      if (error) throw error;
      setSelectedAgents(data?.map(a => a.agent_id) || []);
    } catch (error) {
      console.error('Error loading tool assignments:', error);
    }
  };

  const loadTaskAssignments = async () => {
    if (!tool?.id) return;

    try {
      // Mock data for now - in production, this would query a tool_task_assignments table
      const mockTasks: TaskAssignment[] = [
        {
          id: '1',
          task_name: 'Literature Review',
          use_case: 'Clinical Research',
          workflow: 'Research Workflow',
          description: 'Automated literature search and summarization',
          is_enabled: true,
          priority: 1,
        },
        {
          id: '2',
          task_name: 'Patient Data Analysis',
          use_case: 'Patient Care',
          workflow: 'Clinical Workflow',
          description: 'Analyze patient records and generate insights',
          is_enabled: true,
          priority: 2,
        },
        {
          id: '3',
          task_name: 'Drug Interaction Check',
          use_case: 'Patient Safety',
          workflow: 'Medication Workflow',
          description: 'Check for potential drug interactions',
          is_enabled: false,
          priority: 3,
        },
        {
          id: '4',
          task_name: 'Clinical Trial Matching',
          use_case: 'Clinical Research',
          workflow: 'Research Workflow',
          description: 'Match patients to relevant clinical trials',
          is_enabled: true,
          priority: 1,
        },
        {
          id: '5',
          task_name: 'Symptom Assessment',
          use_case: 'Patient Care',
          workflow: 'Triage Workflow',
          description: 'Assess patient symptoms and recommend actions',
          is_enabled: false,
          priority: 2,
        },
      ];

      setTaskAssignments(mockTasks);
      setFilteredTasks(mockTasks);
    } catch (error) {
      console.error('Error loading task assignments:', error);
    }
  };

  const filterTasks = () => {
    let filtered = [...taskAssignments];

    if (useCaseFilter !== 'all') {
      filtered = filtered.filter(task => task.use_case === useCaseFilter);
    }

    if (workflowFilter !== 'all') {
      filtered = filtered.filter(task => task.workflow === workflowFilter);
    }

    setFilteredTasks(filtered);
  };

  const getUniqueUseCases = () => {
    return Array.from(new Set(taskAssignments.map(t => t.use_case)));
  };

  const getUniqueWorkflows = () => {
    return Array.from(new Set(taskAssignments.map(t => t.workflow)));
  };

  const handleTaskToggle = (taskId: string) => {
    setTaskAssignments(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, is_enabled: !task.is_enabled } : task
      )
    );
    
    // Also update filteredTasks to reflect the change immediately
    setFilteredTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, is_enabled: !task.is_enabled } : task
      )
    );
  };

  const handleAddTask = () => {
    const newTask: TaskAssignment = {
      id: Date.now().toString(),
      ...newTaskForm,
      is_enabled: true,
    };

    setTaskAssignments(prev => [...prev, newTask]);
    setShowAddTaskDialog(false);
    setNewTaskForm({
      task_name: '',
      use_case: '',
      workflow: '',
      description: '',
      priority: 0,
    });
  };

  const handleSave = async () => {
    if (!tool?.id) return;

    try {
      setSaving(true);

      // Update tool data via API (bypasses RLS)
      const response = await fetch(`/api/tools-crud/${tool.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          tool_description: formData.tool_description,
          category: formData.category,
          tool_type: formData.tool_type,
          implementation_type: formData.implementation_type,
          implementation_path: formData.implementation_path,
          function_name: formData.function_name,
          lifecycle_stage: formData.lifecycle_stage,
          is_active: formData.is_active,
          documentation_url: formData.documentation_url,
          access_level: formData.access_level,
          max_execution_time_seconds: formData.max_execution_time_seconds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update tool');
      }

      // Update agent assignments
      await updateAgentAssignments();

      if (onSave) {
        onSave(formData as Tool);
      }

      setMode('view');
    } catch (error: any) {
      console.error('Error saving tool:', error);
      alert(`Failed to save tool: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const updateAgentAssignments = async () => {
    if (!tool?.id) return;

    try {
      // Delete existing assignments
      await supabase
        .from('agent_tool_assignments')
        .delete()
        .eq('tool_id', tool.id);

      // Insert new assignments
      if (selectedAgents.length > 0) {
        const assignments = selectedAgents.map(agentId => ({
          agent_id: agentId,
          tool_id: tool.id,
          is_enabled: true,
          priority: 0,
        }));

        await supabase.from('agent_tool_assignments').insert(assignments);
      }
    } catch (error) {
      console.error('Error updating agent assignments:', error);
      throw error;
    }
  };

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const getAgentInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAgentAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!tool) return null;

  const categoryConfig: any = {
    'Healthcare/FHIR': { color: 'bg-blue-100 text-blue-800' },
    'Healthcare/Clinical NLP': { color: 'bg-purple-100 text-purple-800' },
    'Research': { color: 'bg-cyan-100 text-cyan-800' },
  };

  const lifecycleColors: any = {
    production: 'bg-green-100 text-green-800',
    testing: 'bg-yellow-100 text-yellow-800',
    development: 'bg-neutral-100 text-neutral-800',
    staging: 'bg-blue-100 text-blue-800',
    deprecated: 'bg-red-100 text-red-800',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">
                {mode === 'edit' ? 'Edit Tool' : tool.name}
              </DialogTitle>
              <DialogDescription>
                {mode === 'edit'
                  ? 'Update tool configuration and assignments'
                  : 'View tool details, assign to agents, and configure settings'}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {mode === 'view' && (
                <Button variant="outline" size="sm" onClick={() => setMode('edit')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">
              <Info className="h-4 w-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="configuration">
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="agents">
              <Users className="h-4 w-4 mr-2" />
              Agents ({selectedAgents.length})
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <CheckSquare className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Tool Name</Label>
                      {mode === 'edit' ? (
                        <Input
                          id="name"
                          value={formData.name || ''}
                          onChange={e =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                        />
                      ) : (
                        <p className="text-sm font-medium">{tool.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="code">Code</Label>
                      <p className="text-sm text-muted-foreground">{tool.code}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tool_description">Description</Label>
                    {mode === 'edit' ? (
                      <Textarea
                        id="tool_description"
                        value={formData.tool_description || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            tool_description: e.target.value,
                          })
                        }
                        rows={3}
                        placeholder="Detailed description of what this tool does..."
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {tool.tool_description || tool.description || 'No description available'}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      {mode === 'edit' ? (
                        <Select
                          value={formData.category || ''}
                          onValueChange={value =>
                            setFormData({ ...formData, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Healthcare/FHIR">Healthcare/FHIR</SelectItem>
                            <SelectItem value="Healthcare/EHR">Healthcare/EHR</SelectItem>
                            <SelectItem value="Healthcare/Clinical NLP">
                              Healthcare/Clinical NLP
                            </SelectItem>
                            <SelectItem value="Research">Research</SelectItem>
                            <SelectItem value="Data/Quality">Data Quality</SelectItem>
                            <SelectItem value="Communication">Communication</SelectItem>
                            <SelectItem value="Computation">Computation</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={categoryConfig[tool.category || '']?.color}>
                          {tool.category}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Lifecycle Stage</Label>
                      {mode === 'edit' ? (
                        <Select
                          value={formData.lifecycle_stage || ''}
                          onValueChange={value =>
                            setFormData({ ...formData, lifecycle_stage: value as any })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="production">Production</SelectItem>
                            <SelectItem value="testing">Testing</SelectItem>
                            <SelectItem value="staging">Staging</SelectItem>
                            <SelectItem value="development">Development</SelectItem>
                            <SelectItem value="deprecated">Deprecated</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={lifecycleColors[tool.lifecycle_stage || 'development']}>
                          {tool.lifecycle_stage}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      {mode === 'edit' ? (
                        <div className="flex items-center space-x-2 pt-2">
                          <Switch
                            checked={formData.is_active ?? true}
                            onCheckedChange={checked =>
                              setFormData({ ...formData, is_active: checked })
                            }
                          />
                          <Label>{formData.is_active ? 'Active' : 'Inactive'}</Label>
                        </div>
                      ) : (
                        <Badge variant={tool.is_active ? 'default' : 'secondary'}>
                          {tool.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {tool.documentation_url && (
                    <div className="space-y-2">
                      <Label>Documentation</Label>
                      {mode === 'edit' ? (
                        <Input
                          value={formData.documentation_url || ''}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              documentation_url: e.target.value,
                            })
                          }
                          placeholder="https://..."
                        />
                      ) : (
                        <a
                          href={tool.documentation_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {tool.documentation_url}
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Usage Information */}
              {mode === 'view' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Total Calls</Label>
                        <p className="text-2xl font-bold">{tool.total_calls || 0}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Success Rate</Label>
                        <p className="text-2xl font-bold">
                          {tool.success_rate ? `${tool.success_rate}%` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Avg Response Time</Label>
                        <p className="text-2xl font-bold">
                          {tool.avg_response_time_ms
                            ? `${tool.avg_response_time_ms}ms`
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Implementation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tool Type</Label>
                    {mode === 'edit' ? (
                      <Select
                        value={formData.tool_type || ''}
                        onValueChange={value =>
                          setFormData({ ...formData, tool_type: value as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ai_function">AI Function</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                          <SelectItem value="database">Database</SelectItem>
                          <SelectItem value="software_reference">Software Reference</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm">{tool.tool_type}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Implementation Type</Label>
                    {mode === 'edit' ? (
                      <Select
                        value={formData.implementation_type || ''}
                        onValueChange={value =>
                          setFormData({ ...formData, implementation_type: value as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="langchain_tool">LangChain Tool</SelectItem>
                          <SelectItem value="python_function">Python Function</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                          <SelectItem value="function">Function</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm">{tool.implementation_type}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Implementation Path</Label>
                  {mode === 'edit' ? (
                    <Input
                      value={formData.implementation_path || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          implementation_path: e.target.value,
                        })
                      }
                      placeholder="tools.research_tools"
                    />
                  ) : (
                    <p className="text-sm font-mono bg-neutral-100 p-2 rounded">
                      {tool.implementation_path || 'Not specified'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Function Name</Label>
                  {mode === 'edit' ? (
                    <Input
                      value={formData.function_name || ''}
                      onChange={e =>
                        setFormData({ ...formData, function_name: e.target.value })
                      }
                      placeholder="arxiv_search"
                    />
                  ) : (
                    <p className="text-sm font-mono bg-neutral-100 p-2 rounded">
                      {tool.function_name || 'Not specified'}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Rate Limit (per min)</Label>
                    {mode === 'edit' ? (
                      <Input
                        type="number"
                        value={formData.rate_limit_per_minute || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            rate_limit_per_minute: parseInt(e.target.value) || null,
                          })
                        }
                      />
                    ) : (
                      <p className="text-sm">{tool.rate_limit_per_minute || 'Unlimited'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Cost per Execution</Label>
                    {mode === 'edit' ? (
                      <Input
                        type="number"
                        step="0.0001"
                        value={formData.cost_per_execution || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            cost_per_execution: parseFloat(e.target.value) || null,
                          })
                        }
                      />
                    ) : (
                      <p className="text-sm">
                        ${tool.cost_per_execution?.toFixed(4) || '0.0000'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Max Execution Time (s)</Label>
                    {mode === 'edit' ? (
                      <Input
                        type="number"
                        value={formData.max_execution_time_seconds || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            max_execution_time_seconds: parseInt(e.target.value) || null,
                          })
                        }
                      />
                    ) : (
                      <p className="text-sm">
                        {tool.max_execution_time_seconds || 30}s
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assign to Agents</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select which agents can use this tool ({selectedAgents.length} of {agents.length} selected)
                </p>
              </CardHeader>
              <CardContent>
                {agents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No active agents found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {agents.map(agent => {
                      const isSelected = selectedAgents.includes(agent.id);
                      const displayName = getDisplayName(agent);
                      
                      return (
                        <Card
                          key={agent.id}
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950 border-blue-500'
                              : 'hover:shadow-md hover:border-neutral-300'
                          }`}
                          onClick={() => handleAgentToggle(agent.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Avatar using shared component */}
                              <div className="flex-shrink-0">
                                <AgentAvatar
                                  avatar={agent.avatar}
                                  name={displayName}
                                  size="lg"
                                  className="rounded-lg"
                                />
                              </div>

                              {/* Agent Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 line-clamp-1">
                                    {displayName}
                                  </h4>
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <Switch
                                      checked={isSelected}
                                      onCheckedChange={() => handleAgentToggle(agent.id)}
                                    />
                                  </div>
                                </div>
                                
                                {agent.title && agent.title !== displayName && (
                                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1 line-clamp-1">
                                    {agent.title}
                                  </p>
                                )}
                                
                                {agent.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                    {agent.description}
                                  </p>
                                )}

                                {/* Expertise Tags */}
                                {agent.expertise && agent.expertise.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {agent.expertise.slice(0, 3).map((skill, index) => (
                                      <Badge
                                        key={index}
                                        variant="secondary"
                                        className="text-xs px-2 py-0"
                                      >
                                        {skill}
                                      </Badge>
                                    ))}
                                    {agent.expertise.length > 3 && (
                                      <Badge variant="secondary" className="text-xs px-2 py-0">
                                        +{agent.expertise.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Task Assignments</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Assign this tool to specific tasks with use case and workflow filters
                    </p>
                  </div>
                  {mode === 'edit' && (
                    <Button
                      size="sm"
                      onClick={() => setShowAddTaskDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4" />
                      Use Case
                    </Label>
                    <Select value={useCaseFilter} onValueChange={setUseCaseFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Use Cases" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Use Cases</SelectItem>
                        {getUniqueUseCases().map(useCase => (
                          <SelectItem key={useCase} value={useCase}>
                            {useCase}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <Label className="flex items-center gap-2 mb-2">
                      <Workflow className="h-4 w-4" />
                      Workflow
                    </Label>
                    <Select value={workflowFilter} onValueChange={setWorkflowFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Workflows" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Workflows</SelectItem>
                        {getUniqueWorkflows().map(workflow => (
                          <SelectItem key={workflow} value={workflow}>
                            {workflow}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(useCaseFilter !== 'all' || workflowFilter !== 'all') && (
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUseCaseFilter('all');
                          setWorkflowFilter('all');
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>

                {/* Results Summary */}
                <div className="text-sm text-muted-foreground">
                  Showing {filteredTasks.length} of {taskAssignments.length} tasks
                  {useCaseFilter !== 'all' && ` in ${useCaseFilter}`}
                  {workflowFilter !== 'all' && ` • ${workflowFilter}`}
                </div>

                {/* Task List */}
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Filter className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No tasks found matching the selected filters</p>
                    {mode === 'edit' && (
                      <Button
                        variant="link"
                        className="mt-2"
                        onClick={() => setShowAddTaskDialog(true)}
                      >
                        Add a new task assignment
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTasks.map(task => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-neutral-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{task.task_name}</p>
                            {task.priority && (
                              <Badge variant="secondary" className="text-xs">
                                P{task.priority}
                              </Badge>
                            )}
                            <Badge
                              variant={task.is_enabled ? 'default' : 'secondary'}
                              className={`text-xs ml-auto ${
                                task.is_enabled 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-cyan-100 text-cyan-800'
                              }`}
                            >
                              {task.is_enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              <Target className="h-3 w-3 mr-1" />
                              {task.use_case}
                            </Badge>
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              <Workflow className="h-3 w-3 mr-1" />
                              {task.workflow}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Switch
                            checked={task.is_enabled}
                            onCheckedChange={() => handleTaskToggle(task.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Task Dialog */}
                {showAddTaskDialog && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-lg mx-4">
                      <CardHeader>
                        <CardTitle>Add Task Assignment</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Create a new task assignment for this tool
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Task Name</Label>
                          <Input
                            value={newTaskForm.task_name}
                            onChange={e =>
                              setNewTaskForm({ ...newTaskForm, task_name: e.target.value })
                            }
                            placeholder="e.g., Literature Review"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Use Case</Label>
                          <Input
                            value={newTaskForm.use_case}
                            onChange={e =>
                              setNewTaskForm({ ...newTaskForm, use_case: e.target.value })
                            }
                            placeholder="e.g., Clinical Research"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Workflow</Label>
                          <Input
                            value={newTaskForm.workflow}
                            onChange={e =>
                              setNewTaskForm({ ...newTaskForm, workflow: e.target.value })
                            }
                            placeholder="e.g., Research Workflow"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={newTaskForm.description}
                            onChange={e =>
                              setNewTaskForm({ ...newTaskForm, description: e.target.value })
                            }
                            placeholder="Brief description of how the tool is used in this task"
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Input
                            type="number"
                            value={newTaskForm.priority}
                            onChange={e =>
                              setNewTaskForm({
                                ...newTaskForm,
                                priority: parseInt(e.target.value) || 0,
                              })
                            }
                            placeholder="0"
                          />
                        </div>
                      </CardContent>
                      <div className="flex justify-end gap-2 p-6 pt-0">
                        <Button
                          variant="outline"
                          onClick={() => setShowAddTaskDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddTask}
                          disabled={!newTaskForm.task_name || !newTaskForm.use_case}
                        >
                          Add Task
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {mode === 'edit' ? (
            <>
              <Button variant="outline" onClick={() => setMode('view')}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

