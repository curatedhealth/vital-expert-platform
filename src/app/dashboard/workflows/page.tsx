'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VisualWorkflowBuilder } from '@/components/workflow/VisualWorkflowBuilder';
import {
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Settings,
  BarChart3,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Download,
  Upload,
  Edit,
  Copy,
  Trash2,
  Eye
} from 'lucide-react';
import {
  EnhancedWorkflowDefinition,
  WorkflowTemplate,
  WorkflowExecution,
  WorkflowCategory
} from '@/types/workflow-enhanced';
import { pharmaceuticalTemplates } from '@/lib/templates/pharmaceutical-templates';
// import { workflowService } from '@/lib/workflow/workflow-service';

interface WorkflowsPageState {
  templates: WorkflowTemplate[];
  executions: WorkflowExecution[];
  selectedWorkflow: EnhancedWorkflowDefinition | null;
  isBuilderOpen: boolean;
  isLoading: boolean;
  searchQuery: string;
  categoryFilter: WorkflowCategory | 'all';
  complexityFilter: 'all' | 'Low' | 'Medium' | 'High';
}

export default function WorkflowsPage() {
  const [state, setState] = useState<WorkflowsPageState>({
    templates: [],
    executions: [],
    selectedWorkflow: null,
    isBuilderOpen: false,
    isLoading: true,
    searchQuery: '',
    categoryFilter: 'all',
    complexityFilter: 'all',
  });

  const [activeTab, setActiveTab] = useState('templates');

  useEffect(() => {
    loadWorkflowData();
  }, []);

  const loadWorkflowData = async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Load real pharmaceutical workflow templates
      const templates: WorkflowTemplate[] = pharmaceuticalTemplates;

      const executions: WorkflowExecution[] = [];

      setState(prev => ({
        ...prev,
        templates,
        executions,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error loading workflow data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        templates: [],
        executions: []
      }));
    }
  };

  const filteredTemplates = state.templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesCategory = state.categoryFilter === 'all' || template.category === state.categoryFilter;
    const matchesComplexity = state.complexityFilter === 'all' || template.complexity_level === state.complexityFilter;

    return matchesSearch && matchesCategory && matchesComplexity;
  });

  const handleCreateWorkflow = () => {
    setState(prev => ({
      ...prev,
      selectedWorkflow: {
        id: `workflow-${Date.now()}`,
        name: 'New Workflow',
        description: '',
        version: '1.0',
        category: 'Custom',
        industry_tags: [],
        complexity_level: 'Medium',
        estimated_duration: 60,
        steps: [],
        execution_config: {
          auto_assign_agents: true,
          require_approval: false,
          allow_parallel: true,
          max_concurrent_steps: 3,
          global_timeout: 3600000,
          error_handling: { strategy: 'retry' }
        },
        created_by: 'current-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0,
        rating: 0,
        is_public: false
      },
      isBuilderOpen: true
    }));
  };

  const handleEditWorkflow = (template: WorkflowTemplate) => {
    setState(prev => ({
      ...prev,
      selectedWorkflow: template.template_data,
      isBuilderOpen: true
    }));
  };

  const handleSaveWorkflow = async (workflow: EnhancedWorkflowDefinition) => {
    try {
      // Save workflow logic here
      console.log('Saving workflow:', workflow);
      setState(prev => ({ ...prev, isBuilderOpen: false, selectedWorkflow: null }));
      await loadWorkflowData();
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };

  const handleValidateWorkflow = async (workflow: EnhancedWorkflowDefinition) => {
    // return await workflowService.validateWorkflow(workflow);
    return { isValid: true, errors: [], warnings: [] };
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: WorkflowCategory) => {
    switch (category) {
      case 'Regulatory': return '📋';
      case 'Clinical': return '🔬';
      case 'Market Access': return '💼';
      case 'Medical Affairs': return '⚕️';
      default: return '⚙️';
    }
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Management</h1>
          <p className="text-gray-600 mt-1">Design, execute, and optimize your JTBD workflows</p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Button onClick={handleCreateWorkflow} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Workflow
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold">{state.templates.length}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600">Active Executions</p>
                <p className="text-2xl font-bold">{state.executions.filter(e => e.status === 'running').length}</p>
              </div>
              <Play className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold">2.4h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search workflows..."
                value={state.searchQuery}
                onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Select
              value={state.categoryFilter}
              onValueChange={(value) => setState(prev => ({ ...prev, categoryFilter: value as any }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Regulatory">Regulatory</SelectItem>
                <SelectItem value="Clinical">Clinical</SelectItem>
                <SelectItem value="Market Access">Market Access</SelectItem>
                <SelectItem value="Medical Affairs">Medical Affairs</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={state.complexityFilter}
              onValueChange={(value) => setState(prev => ({ ...prev, complexityFilter: value as any }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Complexity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Complexity</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getCategoryIcon(template.category)}</span>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <Badge className={getComplexityColor(template.complexity_level)}>
                      {template.complexity_level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {template.estimated_duration}min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {template.usage_count} uses
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.industry_tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.industry_tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.industry_tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleEditWorkflow(template)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or create a new workflow.</p>
              <Button onClick={handleCreateWorkflow}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Workflow
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Play className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No executions yet. Run a workflow to see execution history.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Analytics will appear here once you have execution data.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Agent Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Agent performance metrics will be shown here.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Workflow Builder Dialog */}
      <Dialog open={state.isBuilderOpen} onOpenChange={(open) =>
        setState(prev => ({ ...prev, isBuilderOpen: open, selectedWorkflow: open ? prev.selectedWorkflow : null }))
      }>
        <DialogContent className="max-w-7xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {state.selectedWorkflow?.name || 'Workflow Builder'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-full">
            {state.selectedWorkflow && (
              <VisualWorkflowBuilder
                workflow={state.selectedWorkflow}
                onSave={handleSaveWorkflow}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}