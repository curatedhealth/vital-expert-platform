'use client';

import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  RefreshCw,
  Filter,
  Code,
  CheckCircle,
  XCircle,
  Clock,
  Tag,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { createClient } from '@vital/sdk/client';

interface Prompt {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
  system_prompt: string;
  user_prompt_template?: string;
  domain: string;
  complexity_level?: string;
  estimated_tokens?: number;
  validation_status?: string;
  status?: string;
  version?: string;
  compliance_tags?: string[];
  created_at?: string;
  updated_at?: string;
}

interface PromptStats {
  total: number;
  active: number;
  draft: number;
  deprecated: number;
}

const supabase = createClient();

export function PromptManagement() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [stats, setStats] = useState<PromptStats>({
    total: 0,
    active: 0,
    draft: 0,
    deprecated: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    category: '',
    system_prompt: '',
    user_prompt_template: '',
    domain: 'general',
    complexity_level: 'intermediate',
    estimated_tokens: 1000,
    status: 'active',
  });

  useEffect(() => {
    loadPrompts();
  }, []);

  useEffect(() => {
    filterPrompts();
  }, [searchQuery, statusFilter, categoryFilter, prompts]);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setPrompts(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (promptList: Prompt[]) => {
    const total = promptList.length;
    const active = promptList.filter(p => p.status === 'active').length;
    const draft = promptList.filter(p => p.status === 'draft').length;
    const deprecated = promptList.filter(p => p.status === 'deprecated').length;

    setStats({ total, active, draft, deprecated });
  };

  const filterPrompts = () => {
    let filtered = prompts;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        prompt =>
          prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prompt.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prompt.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(prompt => prompt.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(prompt => prompt.category === categoryFilter);
    }

    setFilteredPrompts(filtered);
  };

  const handleCreatePrompt = async () => {
    try {
      const { error } = await supabase.from('prompts').insert([formData]);

      if (error) throw error;

      setShowCreateDialog(false);
      resetForm();
      loadPrompts();
    } catch (error: any) {
      console.error('Error creating prompt:', error);
      alert(`Failed to create prompt: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUpdatePrompt = async () => {
    if (!selectedPrompt) return;

    try {
      const { error } = await supabase
        .from('prompts')
        .update(formData)
        .eq('id', selectedPrompt.id);

      if (error) throw error;

      setShowEditDialog(false);
      setSelectedPrompt(null);
      resetForm();
      loadPrompts();
    } catch (error: any) {
      console.error('Error updating prompt:', error);
      alert(`Failed to update prompt: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeletePrompt = async () => {
    if (!selectedPrompt) return;

    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', selectedPrompt.id);

      if (error) throw error;

      setShowDeleteDialog(false);
      setSelectedPrompt(null);
      loadPrompts();
    } catch (error: any) {
      console.error('Error deleting prompt:', error);
      alert(`Failed to delete prompt: ${error.message || 'Unknown error'}`);
    }
  };

  const handleClonePrompt = async (prompt: Prompt) => {
    try {
      const { error } = await supabase.from('prompts').insert([
        {
          ...prompt,
          id: undefined,
          name: `${prompt.name}-copy-${Date.now()}`,
          display_name: `${prompt.display_name} (Copy)`,
          status: 'draft',
          created_at: undefined,
          updated_at: undefined,
        },
      ]);

      if (error) throw error;

      loadPrompts();
      alert('Prompt cloned successfully!');
    } catch (error: any) {
      console.error('Error cloning prompt:', error);
      alert(`Failed to clone prompt: ${error.message || 'Unknown error'}`);
    }
  };

  const openEditDialog = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setFormData({
      name: prompt.name,
      display_name: prompt.display_name,
      description: prompt.description,
      category: prompt.category,
      system_prompt: prompt.system_prompt,
      user_prompt_template: prompt.user_prompt_template || '',
      domain: prompt.domain,
      complexity_level: prompt.complexity_level || 'intermediate',
      estimated_tokens: prompt.estimated_tokens || 1000,
      status: prompt.status || 'active',
    });
    setShowEditDialog(true);
  };

  const openViewDialog = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowViewDialog(true);
  };

  const openDeleteDialog = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      category: '',
      system_prompt: '',
      user_prompt_template: '',
      domain: 'general',
      complexity_level: 'intermediate',
      estimated_tokens: 1000,
      status: 'active',
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'deprecated':
        return <Badge className="bg-red-100 text-red-800">Deprecated</Badge>;
      case 'archived':
        return <Badge className="bg-neutral-100 text-neutral-800">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  const getComplexityBadge = (level?: string) => {
    switch (level) {
      case 'basic':
        return <Badge variant="outline">Basic</Badge>;
      case 'intermediate':
        return <Badge className="bg-blue-100 text-blue-800">Intermediate</Badge>;
      case 'advanced':
        return <Badge className="bg-purple-100 text-purple-800">Advanced</Badge>;
      case 'expert':
        return <Badge className="bg-red-100 text-red-800">Expert</Badge>;
      default:
        return <Badge variant="secondary">{level || 'Unknown'}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const uniqueCategories = Array.from(new Set(prompts.map(p => p.category)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading prompts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prompt Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage prompt templates, configurations, and library
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadPrompts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Prompt
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deprecated</CardTitle>
            <XCircle className="h-4 w-4 text-rose-600" />
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
                placeholder="Search prompts by name, display name, or description..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Prompts Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Complexity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrompts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No prompts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrompts.map(prompt => (
                  <TableRow key={prompt.id}>
                    <TableCell className="font-medium font-mono text-sm">
                      {prompt.name}
                    </TableCell>
                    <TableCell>{prompt.display_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{prompt.category}</Badge>
                    </TableCell>
                    <TableCell>{prompt.domain}</TableCell>
                    <TableCell>{getComplexityBadge(prompt.complexity_level)}</TableCell>
                    <TableCell>{getStatusBadge(prompt.status)}</TableCell>
                    <TableCell>{prompt.estimated_tokens || '-'}</TableCell>
                    <TableCell>{formatDate(prompt.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(prompt)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(prompt)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleClonePrompt(prompt)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Clone
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(prompt)}
                            className="text-rose-600"
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

      {/* Create Prompt Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Prompt</DialogTitle>
            <DialogDescription>
              Create a new prompt template for your library
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name (ID) *</Label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="clinical-trial-design"
                  />
                </div>
                <div>
                  <Label>Display Name *</Label>
                  <Input
                    value={formData.display_name}
                    onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="Clinical Trial Design"
                  />
                </div>
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this prompt does..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Input
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Regulatory Affairs"
                  />
                </div>
                <div>
                  <Label>Domain</Label>
                  <Select
                    value={formData.domain}
                    onValueChange={value => setFormData({ ...formData, domain: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="clinical">Clinical</SelectItem>
                      <SelectItem value="regulatory">Regulatory</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>System Prompt *</Label>
                <Textarea
                  value={formData.system_prompt}
                  onChange={e => setFormData({ ...formData, system_prompt: e.target.value })}
                  placeholder="You are a helpful AI assistant..."
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label>User Prompt Template</Label>
                <Textarea
                  value={formData.user_prompt_template}
                  onChange={e => setFormData({ ...formData, user_prompt_template: e.target.value })}
                  placeholder="Template for user inputs with {{variables}}..."
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>
            <TabsContent value="advanced" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Complexity Level</Label>
                  <Select
                    value={formData.complexity_level}
                    onValueChange={value => setFormData({ ...formData, complexity_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={value => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estimated Tokens</Label>
                  <Input
                    type="number"
                    value={formData.estimated_tokens}
                    onChange={e =>
                      setFormData({ ...formData, estimated_tokens: parseInt(e.target.value) })
                    }
                  />
                </div>
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
            <Button onClick={handleCreatePrompt}>Create Prompt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Prompt Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
            <DialogDescription>Update prompt template configuration</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name (ID)</Label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Display Name</Label>
                  <Input
                    value={formData.display_name}
                    onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
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
                  <Label>Domain</Label>
                  <Select
                    value={formData.domain}
                    onValueChange={value => setFormData({ ...formData, domain: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="clinical">Clinical</SelectItem>
                      <SelectItem value="regulatory">Regulatory</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>System Prompt</Label>
                <Textarea
                  value={formData.system_prompt}
                  onChange={e => setFormData({ ...formData, system_prompt: e.target.value })}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label>User Prompt Template</Label>
                <Textarea
                  value={formData.user_prompt_template}
                  onChange={e => setFormData({ ...formData, user_prompt_template: e.target.value })}
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>
            <TabsContent value="advanced" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Complexity Level</Label>
                  <Select
                    value={formData.complexity_level}
                    onValueChange={value => setFormData({ ...formData, complexity_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={value => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estimated Tokens</Label>
                  <Input
                    type="number"
                    value={formData.estimated_tokens}
                    onChange={e =>
                      setFormData({ ...formData, estimated_tokens: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedPrompt(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdatePrompt}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Prompt Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPrompt?.display_name}</DialogTitle>
            <DialogDescription>{selectedPrompt?.description}</DialogDescription>
          </DialogHeader>
          {selectedPrompt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name (ID)</Label>
                  <p className="font-mono text-sm">{selectedPrompt.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p>{selectedPrompt.category}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Domain</Label>
                  <p>{selectedPrompt.domain}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Complexity</Label>
                  <div className="mt-1">{getComplexityBadge(selectedPrompt.complexity_level)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPrompt.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estimated Tokens</Label>
                  <p>{selectedPrompt.estimated_tokens || '-'}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">System Prompt</Label>
                <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                  {selectedPrompt.system_prompt}
                </pre>
              </div>

              {selectedPrompt.user_prompt_template && (
                <div>
                  <Label className="text-muted-foreground">User Prompt Template</Label>
                  <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                    {selectedPrompt.user_prompt_template}
                  </pre>
                </div>
              )}

              {selectedPrompt.compliance_tags && selectedPrompt.compliance_tags.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Compliance Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPrompt.compliance_tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
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
                setSelectedPrompt(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Prompt Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Prompt</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this prompt? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedPrompt && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">{selectedPrompt.display_name}</p>
              <p className="text-sm text-muted-foreground font-mono">{selectedPrompt.name}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedPrompt(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePrompt}>
              Delete Prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

