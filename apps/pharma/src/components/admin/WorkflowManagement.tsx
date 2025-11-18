'use client';

import {
  GitBranch,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  RefreshCw,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
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
import { createClient } from '@vital/sdk/client';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  definition: any;
  status?: string;
  created_by?: string;
  organization_id?: string;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface WorkflowStats {
  total: number;
  active: number;
  draft: number;
  paused: number;
}

const supabase = createClient();

export function WorkflowManagement() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);
  const [stats, setStats] = useState<WorkflowStats>({
    total: 0,
    active: 0,
    draft: 0,
    paused: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    definition: {},
    status: 'draft',
    is_public: false,
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  useEffect(() => {
    filterWorkflows();
  }, [searchQuery, statusFilter, workflows]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setWorkflows(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (workflowList: Workflow[]) => {
    const total = workflowList.length;
    const active = workflowList.filter(w => w.status === 'active').length;
    const draft = workflowList.filter(w => w.status === 'draft').length;
    const paused = workflowList.filter(w => w.status === 'paused').length;

    setStats({ total, active, draft, paused });
  };

  const filterWorkflows = () => {
    let filtered = workflows;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        workflow =>
          workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          workflow.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(workflow => workflow.status === statusFilter);
    }

    setFilteredWorkflows(filtered);
  };

  const handleCreateWorkflow = async () => {
    try {
      const { error } = await supabase.from('workflows').insert([
        {
          ...formData,
          definition: formData.definition || {},
        },
      ]);

      if (error) throw error;

      setShowCreateDialog(false);
      resetForm();
      loadWorkflows();
    } catch (error: any) {
      console.error('Error creating workflow:', error);
      alert(`Failed to create workflow: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUpdateWorkflow = async () => {
    if (!selectedWorkflow) return;

    try {
      const { error } = await supabase
        .from('workflows')
        .update(formData)
        .eq('id', selectedWorkflow.id);

      if (error) throw error;

      setShowEditDialog(false);
      setSelectedWorkflow(null);
      resetForm();
      loadWorkflows();
    } catch (error: any) {
      console.error('Error updating workflow:', error);
      alert(`Failed to update workflow: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteWorkflow = async () => {
    if (!selectedWorkflow) return;

    try {
      const { error } = await supabase.from('workflows').delete().eq('id', selectedWorkflow.id);

      if (error) throw error;

      setShowDeleteDialog(false);
      setSelectedWorkflow(null);
      loadWorkflows();
    } catch (error: any) {
      console.error('Error deleting workflow:', error);
      alert(`Failed to delete workflow: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCloneWorkflow = async (workflow: Workflow) => {
    try {
      const { error } = await supabase.from('workflows').insert([
        {
          ...workflow,
          id: undefined,
          name: `${workflow.name} (Copy)`,
          status: 'draft',
          created_at: undefined,
          updated_at: undefined,
        },
      ]);

      if (error) throw error;

      loadWorkflows();
      alert('Workflow cloned successfully!');
    } catch (error: any) {
      console.error('Error cloning workflow:', error);
      alert(`Failed to clone workflow: ${error.message || 'Unknown error'}`);
    }
  };

  const handleToggleStatus = async (workflow: Workflow) => {
    try {
      const newStatus = workflow.status === 'active' ? 'paused' : 'active';
      const { error } = await supabase
        .from('workflows')
        .update({ status: newStatus })
        .eq('id', workflow.id);

      if (error) throw error;

      loadWorkflows();
    } catch (error: any) {
      console.error('Error toggling workflow status:', error);
      alert(`Failed to update workflow: ${error.message || 'Unknown error'}`);
    }
  };

  const openEditDialog = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setFormData({
      name: workflow.name,
      description: workflow.description || '',
      definition: workflow.definition || {},
      status: workflow.status || 'draft',
      is_public: workflow.is_public || false,
    });
    setShowEditDialog(true);
  };

  const openViewDialog = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setShowViewDialog(true);
  };

  const openDeleteDialog = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      definition: {},
      status: 'draft',
      is_public: false,
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
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
          <p className="text-muted-foreground">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Workflow Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage automation workflows and orchestrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadWorkflows}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
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
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paused}</div>
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
                placeholder="Search workflows by name or description..."
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
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workflows Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Public</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkflows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No workflows found
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorkflows.map(workflow => (
                  <TableRow key={workflow.id}>
                    <TableCell className="font-medium">{workflow.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{workflow.description || '-'}</TableCell>
                    <TableCell>{getStatusBadge(workflow.status)}</TableCell>
                    <TableCell>
                      {workflow.is_public ? (
                        <Badge variant="outline">Public</Badge>
                      ) : (
                        <Badge variant="secondary">Private</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(workflow.created_at)}</TableCell>
                    <TableCell>{formatDate(workflow.updated_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(workflow)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(workflow)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCloneWorkflow(workflow)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Clone
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(workflow)}>
                            {workflow.status === 'active' ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
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
                            onClick={() => openDeleteDialog(workflow)}
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

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>Create a new automation workflow</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Customer Onboarding Flow"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this workflow does..."
                rows={3}
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={value => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_public}
                onCheckedChange={checked => setFormData({ ...formData, is_public: checked })}
              />
              <Label>Make public</Label>
            </div>
          </div>
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
            <Button onClick={handleCreateWorkflow}>Create Workflow</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Workflow Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Workflow</DialogTitle>
            <DialogDescription>Update workflow configuration</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={value => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_public}
                onCheckedChange={checked => setFormData({ ...formData, is_public: checked })}
              />
              <Label>Public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedWorkflow(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateWorkflow}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Workflow Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedWorkflow?.name}</DialogTitle>
            <DialogDescription>{selectedWorkflow?.description}</DialogDescription>
          </DialogHeader>
          {selectedWorkflow && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedWorkflow.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Visibility</Label>
                  <div className="mt-1">
                    {selectedWorkflow.is_public ? (
                      <Badge variant="outline">Public</Badge>
                    ) : (
                      <Badge variant="secondary">Private</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p>{formatDate(selectedWorkflow.created_at)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Updated</Label>
                  <p>{formatDate(selectedWorkflow.updated_at)}</p>
                </div>
              </div>

              {selectedWorkflow.definition && (
                <div>
                  <Label className="text-muted-foreground">Workflow Definition</Label>
                  <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                    {JSON.stringify(selectedWorkflow.definition, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowViewDialog(false);
                setSelectedWorkflow(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Workflow Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workflow</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this workflow? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedWorkflow && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">{selectedWorkflow.name}</p>
              <p className="text-sm text-muted-foreground">{selectedWorkflow.description}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedWorkflow(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteWorkflow}>
              Delete Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

