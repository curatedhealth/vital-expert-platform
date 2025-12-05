'use client';

import {
  Wrench,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  AlertCircle,
  Zap,
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
import { Label } from '@vital/ui';
import { Switch } from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { createClient } from '@vital/sdk/client';
import { STARTUP_TENANT_ID } from '@/lib/constants/tenant';

interface Tool {
  id: string;
  unique_id: string;
  code: string;
  name: string;
  category?: string;
  tool_type?: string;
  tool_description?: string;
  vendor?: string;
  version?: string;
  implementation_type?: string;
  implementation_path?: string;
  function_name?: string;
  is_active: boolean;
  lifecycle_stage?: string;
  health_status?: string;
  usage_count?: number;
  success_rate?: number;
  rating?: number;
  cost_per_execution?: number;
  last_used_at?: string;
  documentation_url?: string;
  capabilities?: string[];
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

interface ToolStats {
  total: number;
  active: number;
  inactive: number;
  deprecated: number;
}

const supabase = createClient();

export function ToolManagement() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [stats, setStats] = useState<ToolStats>({
    total: 0,
    active: 0,
    inactive: 0,
    deprecated: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    tool_type: 'api',
    tool_description: '',
    vendor: '',
    version: '1.0.0',
    implementation_type: 'api_endpoint',
    implementation_path: '',
    function_name: '',
    is_active: true,
    lifecycle_stage: 'production',
    documentation_url: '',
  });

  useEffect(() => {
    loadTools();
  }, []);

  useEffect(() => {
    filterTools();
  }, [searchQuery, statusFilter, categoryFilter, tools]);

  const loadTools = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dh_tool')
        .select('*')
        .eq('tenant_id', STARTUP_TENANT_ID)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setTools(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error loading tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (toolList: Tool[]) => {
    const total = toolList.length;
    const active = toolList.filter(t => t.is_active === true).length;
    const inactive = toolList.filter(t => t.is_active === false).length;
    const deprecated = toolList.filter(t => t.lifecycle_stage === 'deprecated').length;

    setStats({ total, active, inactive, deprecated });
  };

  const filterTools = () => {
    let filtered = tools;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        tool =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.tool_description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tool => {
        switch (statusFilter) {
          case 'active':
            return tool.is_active === true;
          case 'inactive':
            return tool.is_active === false;
          case 'deprecated':
            return tool.lifecycle_stage === 'deprecated';
          default:
            return true;
        }
      });
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(tool => tool.category === categoryFilter);
    }

    setFilteredTools(filtered);
  };

  const handleCreateTool = async () => {
    try {
      const { error } = await supabase.from('dh_tool').insert([
        {
          ...formData,
          unique_id: `TL-${formData.category?.toUpperCase() || 'TOOL'}-${formData.code}`,
          tenant_id: STARTUP_TENANT_ID,
          metadata: {},
          access_requirements: {},
        },
      ]);

      if (error) throw error;

      setShowCreateDialog(false);
      resetForm();
      loadTools();
    } catch (error: any) {
      console.error('Error creating tool:', error);
      alert(`Failed to create tool: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUpdateTool = async () => {
    if (!selectedTool) return;

    try {
      const { error } = await supabase.from('dh_tool').update(formData).eq('id', selectedTool.id);

      if (error) throw error;

      setShowEditDialog(false);
      setSelectedTool(null);
      resetForm();
      loadTools();
    } catch (error: any) {
      console.error('Error updating tool:', error);
      alert(`Failed to update tool: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteTool = async () => {
    if (!selectedTool) return;

    try {
      const { error } = await supabase.from('dh_tool').delete().eq('id', selectedTool.id);

      if (error) throw error;

      setShowDeleteDialog(false);
      setSelectedTool(null);
      loadTools();
    } catch (error: any) {
      console.error('Error deleting tool:', error);
      alert(`Failed to delete tool: ${error.message || 'Unknown error'}`);
    }
  };

  const handleToggleActive = async (tool: Tool) => {
    try {
      const { error } = await supabase
        .from('dh_tool')
        .update({ is_active: !tool.is_active })
        .eq('id', tool.id);

      if (error) throw error;

      loadTools();
    } catch (error: any) {
      console.error('Error toggling tool status:', error);
      alert(`Failed to update tool: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCloneTool = async (tool: Tool) => {
    try {
      const { error } = await supabase.from('dh_tool').insert([
        {
          ...tool,
          id: undefined,
          unique_id: `${tool.unique_id}-copy-${Date.now()}`,
          code: `${tool.code}-copy`,
          name: `${tool.name} (Copy)`,
          is_active: false,
          created_at: undefined,
          updated_at: undefined,
        },
      ]);

      if (error) throw error;

      loadTools();
      alert('Tool cloned successfully!');
    } catch (error: any) {
      console.error('Error cloning tool:', error);
      alert(`Failed to clone tool: ${error.message || 'Unknown error'}`);
    }
  };

  const openEditDialog = (tool: Tool) => {
    setSelectedTool(tool);
    setFormData({
      code: tool.code,
      name: tool.name,
      category: tool.category || '',
      tool_type: tool.tool_type || 'api',
      tool_description: tool.tool_description || '',
      vendor: tool.vendor || '',
      version: tool.version || '1.0.0',
      implementation_type: tool.implementation_type || 'api_endpoint',
      implementation_path: tool.implementation_path || '',
      function_name: tool.function_name || '',
      is_active: tool.is_active,
      lifecycle_stage: tool.lifecycle_stage || 'production',
      documentation_url: tool.documentation_url || '',
    });
    setShowEditDialog(true);
  };

  const openViewDialog = (tool: Tool) => {
    setSelectedTool(tool);
    setShowViewDialog(true);
  };

  const openDeleteDialog = (tool: Tool) => {
    setSelectedTool(tool);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      category: '',
      tool_type: 'api',
      tool_description: '',
      vendor: '',
      version: '1.0.0',
      implementation_type: 'api_endpoint',
      implementation_path: '',
      function_name: '',
      is_active: true,
      lifecycle_stage: 'production',
      documentation_url: '',
    });
  };

  const getStatusBadge = (tool: Tool) => {
    if (!tool.is_active) {
      return <Badge className="bg-neutral-100 text-neutral-800">Inactive</Badge>;
    }
    if (tool.lifecycle_stage === 'deprecated') {
      return <Badge className="bg-red-100 text-red-800">Deprecated</Badge>;
    }
    if (tool.lifecycle_stage === 'beta') {
      return <Badge className="bg-yellow-100 text-yellow-800">Beta</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  const getHealthBadge = (status?: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>;
      case 'unhealthy':
        return <Badge className="bg-red-100 text-red-800">Unhealthy</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const uniqueCategories = Array.from(new Set(tools.map(t => t.category).filter(Boolean)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tool Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage AI tools, integrations, and configurations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTools}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Tool
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Deprecated</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deprecated}</div>
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
                placeholder="Search tools by name, code, or description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(cat => (
                  <SelectItem key={cat} value={cat!}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tools Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No tools found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTools.map(tool => (
                  <TableRow key={tool.id}>
                    <TableCell className="font-medium">{tool.name}</TableCell>
                    <TableCell className="font-mono text-sm">{tool.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tool.category || '-'}</Badge>
                    </TableCell>
                    <TableCell>{tool.tool_type || '-'}</TableCell>
                    <TableCell>{getStatusBadge(tool)}</TableCell>
                    <TableCell>{getHealthBadge(tool.health_status)}</TableCell>
                    <TableCell>{tool.usage_count || 0}</TableCell>
                    <TableCell>
                      {tool.success_rate ? `${(tool.success_rate * 100).toFixed(1)}%` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(tool)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(tool)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCloneTool(tool)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Clone
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(tool)}>
                            {tool.is_active ? (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(tool)}
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

      {/* Create Tool Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Tool</DialogTitle>
            <DialogDescription>Add a new tool to your toolbox</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Code *</Label>
                  <Input
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    placeholder="TOOL-SEARCH-WEB"
                  />
                </div>
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Web Search Tool"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Input
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Search"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={formData.tool_type}
                    onValueChange={value => setFormData({ ...formData, tool_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="function">Function</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="search">Search</SelectItem>
                      <SelectItem value="calculation">Calculation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.tool_description}
                  onChange={e => setFormData({ ...formData, tool_description: e.target.value })}
                  placeholder="Describe what this tool does..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vendor</Label>
                  <Input
                    value={formData.vendor}
                    onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                    placeholder="Google, OpenAI, etc."
                  />
                </div>
                <div>
                  <Label>Version</Label>
                  <Input
                    value={formData.version}
                    onChange={e => setFormData({ ...formData, version: e.target.value })}
                    placeholder="1.0.0"
                  />
                </div>
              </div>

              <div>
                <Label>Documentation URL</Label>
                <Input
                  value={formData.documentation_url}
                  onChange={e => setFormData({ ...formData, documentation_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </TabsContent>
            <TabsContent value="advanced" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Implementation Type</Label>
                  <Select
                    value={formData.implementation_type}
                    onValueChange={value => setFormData({ ...formData, implementation_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="python_function">Python Function</SelectItem>
                      <SelectItem value="api_endpoint">API Endpoint</SelectItem>
                      <SelectItem value="langchain_tool">LangChain Tool</SelectItem>
                      <SelectItem value="external_api">External API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lifecycle Stage</Label>
                  <Select
                    value={formData.lifecycle_stage}
                    onValueChange={value => setFormData({ ...formData, lifecycle_stage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="beta">Beta</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Implementation Path</Label>
                <Input
                  value={formData.implementation_path}
                  onChange={e => setFormData({ ...formData, implementation_path: e.target.value })}
                  placeholder="app.tools.web_search or https://api.example.com"
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label>Function Name</Label>
                <Input
                  value={formData.function_name}
                  onChange={e => setFormData({ ...formData, function_name: e.target.value })}
                  placeholder="search_web"
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={checked => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTool}>Create Tool</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tool Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tool</DialogTitle>
            <DialogDescription>Update tool configuration</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Code</Label>
                  <Input
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Input
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={formData.tool_type}
                    onValueChange={value => setFormData({ ...formData, tool_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="function">Function</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="search">Search</SelectItem>
                      <SelectItem value="calculation">Calculation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.tool_description}
                  onChange={e => setFormData({ ...formData, tool_description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vendor</Label>
                  <Input
                    value={formData.vendor}
                    onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Version</Label>
                  <Input
                    value={formData.version}
                    onChange={e => setFormData({ ...formData, version: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Documentation URL</Label>
                <Input
                  value={formData.documentation_url}
                  onChange={e => setFormData({ ...formData, documentation_url: e.target.value })}
                />
              </div>
            </TabsContent>
            <TabsContent value="advanced" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Implementation Type</Label>
                  <Select
                    value={formData.implementation_type}
                    onValueChange={value => setFormData({ ...formData, implementation_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="python_function">Python Function</SelectItem>
                      <SelectItem value="api_endpoint">API Endpoint</SelectItem>
                      <SelectItem value="langchain_tool">LangChain Tool</SelectItem>
                      <SelectItem value="external_api">External API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lifecycle Stage</Label>
                  <Select
                    value={formData.lifecycle_stage}
                    onValueChange={value => setFormData({ ...formData, lifecycle_stage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="beta">Beta</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Implementation Path</Label>
                <Input
                  value={formData.implementation_path}
                  onChange={e => setFormData({ ...formData, implementation_path: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label>Function Name</Label>
                <Input
                  value={formData.function_name}
                  onChange={e => setFormData({ ...formData, function_name: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={checked => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedTool(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateTool}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Tool Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTool?.name}</DialogTitle>
            <DialogDescription>{selectedTool?.tool_description}</DialogDescription>
          </DialogHeader>
          {selectedTool && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Code</Label>
                  <p className="font-mono text-sm">{selectedTool.code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p>{selectedTool.category || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p>{selectedTool.tool_type || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Vendor</Label>
                  <p>{selectedTool.vendor || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Version</Label>
                  <p>{selectedTool.version}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedTool)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Usage Count</Label>
                  <p>{selectedTool.usage_count || 0}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Success Rate</Label>
                  <p>
                    {selectedTool.success_rate ? `${(selectedTool.success_rate * 100).toFixed(1)}%` : '-'}
                  </p>
                </div>
              </div>

              {selectedTool.implementation_path && (
                <div>
                  <Label className="text-muted-foreground">Implementation Path</Label>
                  <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-sm font-mono">
                    {selectedTool.implementation_path}
                  </pre>
                </div>
              )}

              {selectedTool.function_name && (
                <div>
                  <Label className="text-muted-foreground">Function Name</Label>
                  <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-sm font-mono">
                    {selectedTool.function_name}
                  </pre>
                </div>
              )}

              {selectedTool.documentation_url && (
                <div>
                  <Label className="text-muted-foreground">Documentation</Label>
                  <a
                    href={selectedTool.documentation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block mt-1"
                  >
                    {selectedTool.documentation_url}
                  </a>
                </div>
              )}

              {selectedTool.capabilities && selectedTool.capabilities.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Capabilities</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTool.capabilities.map((cap, i) => (
                      <Badge key={i} variant="outline">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedTool.tags && selectedTool.tags.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTool.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowViewDialog(false);
                setSelectedTool(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tool Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tool</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tool? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedTool && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">{selectedTool.name}</p>
              <p className="text-sm text-muted-foreground font-mono">{selectedTool.code}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedTool(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTool}>
              Delete Tool
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

