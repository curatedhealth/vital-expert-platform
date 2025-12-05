'use client';

import {
  Bot,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  RefreshCw,
  Filter,
  Settings,
  Brain,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  X,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Input } from '@vital/ui';
import { Textarea } from '@vital/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@vital/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@vital/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@vital/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@vital/ui';
import { Switch } from '@vital/ui';
import { createClient } from '@vital/sdk/client';
import { STARTUP_TENANT_ID } from '@/lib/constants/tenant';

interface Agent {
  id: string;
  name: string;
  title?: string;
  description?: string;
  system_prompt?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  is_active?: boolean;
  capabilities?: string[];
  expertise?: string[];
  avatar_url?: string;
  rating?: number;
  total_consultations?: number;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
  tenant_id?: string;
}

interface KDNamespace {
  namespace: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
}

interface AgentStats {
  total: number;
  active: number;
  inactive: number;
  draft: number;
}

export function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<AgentStats>({
    total: 0,
    active: 0,
    inactive: 0,
    draft: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // KD Namespaces state
  const [kdNamespaces, setKdNamespaces] = useState<KDNamespace[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    system_prompt: '',
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 2000,
    is_active: true,
    capabilities: [] as string[],
    expertise: [] as string[],
    knowledge_namespaces: [] as string[],
  });

  const supabase = createClient();

  useEffect(() => {
    loadAgents();
    loadKdNamespaces();
  }, []);

  const loadKdNamespaces = async () => {
    try {
      const response = await fetch('/api/kd-namespaces');
      if (response.ok) {
        const data = await response.json();
        setKdNamespaces(data.namespaces || []);
      }
    } catch (error) {
      console.error('Error loading KD namespaces:', error);
    }
  };

  useEffect(() => {
    filterAgents();
  }, [searchQuery, statusFilter, agents]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('tenant_id', STARTUP_TENANT_ID)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setAgents(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (agentList: Agent[]) => {
    const total = agentList.length;
    const active = agentList.filter(a => a.is_active === true).length;
    const inactive = agentList.filter(a => a.is_active === false).length;
    const draft = agentList.filter(a => a.metadata?.status === 'draft').length;
    
    setStats({ total, active, inactive, draft });
  };

  const filterAgents = () => {
    let filtered = agents;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(agent => {
        switch (statusFilter) {
          case 'active':
            return agent.is_active === true;
          case 'inactive':
            return agent.is_active === false;
          case 'draft':
            return agent.metadata?.status === 'draft';
          default:
            return true;
        }
      });
    }

    setFilteredAgents(filtered);
  };

  const handleCreateAgent = async () => {
    try {
      // Extract knowledge_namespaces from formData for metadata
      const { knowledge_namespaces, ...agentData } = formData;

      const { data, error } = await supabase
        .from('agents')
        .insert([
          {
            ...agentData,
            tenant_id: STARTUP_TENANT_ID,
            slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
            metadata: {
              status: 'draft',
              knowledge_namespaces: knowledge_namespaces,
            },
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setShowCreateDialog(false);
      resetForm();
      loadAgents();
    } catch (error: any) {
      console.error('Error creating agent:', error);
      alert(`Failed to create agent: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUpdateAgent = async () => {
    if (!selectedAgent) return;

    try {
      // Extract knowledge_namespaces from formData for metadata
      const { knowledge_namespaces, ...agentData } = formData;

      // Merge with existing metadata, updating knowledge_namespaces
      const updatedMetadata = {
        ...selectedAgent.metadata,
        knowledge_namespaces: knowledge_namespaces,
      };

      const { error } = await supabase
        .from('agents')
        .update({
          ...agentData,
          metadata: updatedMetadata,
        })
        .eq('id', selectedAgent.id);

      if (error) throw error;

      setShowEditDialog(false);
      setSelectedAgent(null);
      resetForm();
      loadAgents();
    } catch (error: any) {
      console.error('Error updating agent:', error);
      alert(`Failed to update agent: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteAgent = async () => {
    if (!selectedAgent) return;

    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', selectedAgent.id);

      if (error) throw error;

      setShowDeleteDialog(false);
      setSelectedAgent(null);
      loadAgents();
    } catch (error: any) {
      console.error('Error deleting agent:', error);
      alert(`Failed to delete agent: ${error.message || 'Unknown error'}`);
    }
  };

  const handleToggleActive = async (agent: Agent) => {
    try {
      const { error } = await supabase
        .from('agents')
        .update({ is_active: !agent.is_active })
        .eq('id', agent.id);

      if (error) throw error;

      loadAgents();
    } catch (error: any) {
      console.error('Error toggling agent status:', error);
      alert(`Failed to update agent: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCloneAgent = async (agent: Agent) => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .insert([
          {
            ...agent,
            id: undefined,
            name: `${agent.name} (Copy)`,
            title: `${agent.title || agent.name} (Copy)`,
            slug: `${agent.slug || agent.name.toLowerCase()}-copy-${Date.now()}`,
            created_at: undefined,
            updated_at: undefined,
            is_active: false,
            metadata: {
              ...agent.metadata,
              status: 'draft',
              cloned_from: agent.id,
            },
          },
        ])
        .select()
        .single();

      if (error) throw error;

      loadAgents();
      alert('Agent cloned successfully!');
    } catch (error: any) {
      console.error('Error cloning agent:', error);
      alert(`Failed to clone agent: ${error.message || 'Unknown error'}`);
    }
  };

  const openEditDialog = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData({
      name: agent.name,
      title: agent.title || '',
      description: agent.description || '',
      system_prompt: agent.system_prompt || '',
      model: agent.model || 'gpt-4',
      temperature: agent.temperature || 0.7,
      max_tokens: agent.max_tokens || 2000,
      is_active: agent.is_active ?? true,
      capabilities: agent.capabilities || [],
      expertise: agent.expertise || [],
      knowledge_namespaces: agent.metadata?.knowledge_namespaces || [],
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      description: '',
      system_prompt: '',
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 2000,
      is_active: true,
      capabilities: [],
      expertise: [],
      knowledge_namespaces: [],
    });
  };

  // Helper to toggle namespace selection
  const toggleNamespace = (namespace: string) => {
    setFormData(prev => ({
      ...prev,
      knowledge_namespaces: prev.knowledge_namespaces.includes(namespace)
        ? prev.knowledge_namespaces.filter(ns => ns !== namespace)
        : [...prev.knowledge_namespaces, namespace]
    }));
  };

  // Group namespaces by category for display
  const groupedNamespaces = kdNamespaces.reduce((acc, ns) => {
    if (!acc[ns.category]) {
      acc[ns.category] = [];
    }
    acc[ns.category].push(ns);
    return acc;
  }, {} as Record<string, KDNamespace[]>);

  const categoryLabels: Record<string, string> = {
    regulatory: 'Regulatory',
    digital_health: 'Digital Health',
    clinical: 'Clinical',
    medical_affairs: 'Medical Affairs',
    heor: 'HEOR',
    safety: 'Safety',
    general: 'General',
  };

  const getStatusBadge = (agent: Agent) => {
    if (!agent.is_active) {
      return <Badge className="bg-neutral-100 text-neutral-800">Inactive</Badge>;
    }
    if (agent.metadata?.status === 'draft') {
      return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Agent Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage AI agents, configurations, and deployments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAgents}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <XCircle className="h-4 w-4 text-neutral-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents by name, title, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Consultations</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No agents found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell>{agent.title || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{agent.model || 'gpt-4'}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(agent)}</TableCell>
                    <TableCell>{agent.total_consultations || 0}</TableCell>
                    <TableCell>
                      {agent.rating ? `${agent.rating.toFixed(1)}⭐` : '-'}
                    </TableCell>
                    <TableCell>{formatDate(agent.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(agent)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCloneAgent(agent)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Clone
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(agent)}>
                            {agent.is_active ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(agent)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Agent Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Agent</DialogTitle>
            <DialogDescription>
              Configure a new AI agent for your organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="clinical-advisor"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Clinical Advisor"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this agent does..."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">System Prompt</label>
              <Textarea
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                placeholder="You are a helpful AI assistant..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Model</label>
                <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Temperature</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max Tokens</label>
                <Input
                  type="number"
                  value={formData.max_tokens}
                  onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <label className="text-sm font-medium">Active</label>
            </div>

            {/* Knowledge Domain Selection */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Database className="h-4 w-4" />
                Knowledge Domains
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Select which knowledge domains this agent can access for RAG retrieval
              </p>

              {/* Selected namespaces display */}
              {formData.knowledge_namespaces.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {formData.knowledge_namespaces.map((ns) => {
                    const nsInfo = kdNamespaces.find(k => k.namespace === ns);
                    return (
                      <Badge
                        key={ns}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => toggleNamespace(ns)}
                      >
                        {nsInfo?.icon} {nsInfo?.name || ns}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Namespace selection by category */}
              <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-3">
                {Object.entries(groupedNamespaces).map(([category, namespaces]) => (
                  <div key={category}>
                    <div className="text-xs font-semibold text-muted-foreground mb-1">
                      {categoryLabels[category] || category}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {namespaces.map((ns) => (
                        <Badge
                          key={ns.namespace}
                          variant={formData.knowledge_namespaces.includes(ns.namespace) ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => toggleNamespace(ns.namespace)}
                        >
                          {ns.icon} {ns.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateAgent}>Create Agent</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>
              Update agent configuration and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">System Prompt</label>
              <Textarea
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Model</label>
                <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Temperature</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max Tokens</label>
                <Input
                  type="number"
                  value={formData.max_tokens}
                  onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <label className="text-sm font-medium">Active</label>
            </div>

            {/* Knowledge Domain Selection */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Database className="h-4 w-4" />
                Knowledge Domains
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Select which knowledge domains this agent can access for RAG retrieval
              </p>

              {/* Selected namespaces display */}
              {formData.knowledge_namespaces.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {formData.knowledge_namespaces.map((ns) => {
                    const nsInfo = kdNamespaces.find(k => k.namespace === ns);
                    return (
                      <Badge
                        key={ns}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => toggleNamespace(ns)}
                      >
                        {nsInfo?.icon} {nsInfo?.name || ns}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Namespace selection by category */}
              <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-3">
                {Object.entries(groupedNamespaces).map(([category, namespaces]) => (
                  <div key={category}>
                    <div className="text-xs font-semibold text-muted-foreground mb-1">
                      {categoryLabels[category] || category}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {namespaces.map((ns) => (
                        <Badge
                          key={ns.namespace}
                          variant={formData.knowledge_namespaces.includes(ns.namespace) ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => toggleNamespace(ns.namespace)}
                        >
                          {ns.icon} {ns.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); setSelectedAgent(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAgent}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Agent Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agent</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this agent? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedAgent && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">{selectedAgent.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedAgent.title || selectedAgent.name}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setSelectedAgent(null); }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAgent}>
              Delete Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

