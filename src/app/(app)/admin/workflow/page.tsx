'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  RefreshCw,
  Eye,
  Code,
  GitBranch,
  Activity,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { WorkflowVisualizer } from '@/components/admin/workflow-visualizer';
// import { useWorkflowAdmin } from '@/hooks/use-workflow-admin';

interface WorkflowNode {
  id: string;
  name: string;
  type: 'start' | 'end' | 'process' | 'decision' | 'interrupt' | 'parallel';
  position: { x: number; y: number };
  config: Record<string, any>;
  status: 'active' | 'inactive' | 'error' | 'running';
  lastExecuted?: Date;
  executionCount: number;
  averageLatency: number;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
  label?: string;
  status: 'active' | 'inactive' | 'error';
}

interface WorkflowExecution {
  id: string;
  sessionId: string;
  userId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  currentNode: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  error?: string;
  metadata: Record<string, any>;
}

interface WorkflowMetrics {
  totalExecutions: number;
  successRate: number;
  averageLatency: number;
  errorRate: number;
  activeExecutions: number;
  nodePerformance: Record<string, {
    executions: number;
    averageLatency: number;
    errorRate: number;
  }>;
}

export default function WorkflowAdminPage() {
  // const {
  //   workflow,
  //   executions,
  //   metrics,
  //   selectedNode,
  //   isEditing,
  //   isLoading,
  //   error,
  //   logs,
  //   setSelectedNode,
  //   setIsEditing,
  //   updateNode,
  //   addNode,
  //   deleteNode,
  //   addEdge,
  //   saveWorkflow,
  //   deployWorkflow,
  //   testWorkflow,
  //   addLog,
  //   clearLogs
  // } = useWorkflowAdmin();
  
  // Mock data for now
  const workflow = { nodes: [], edges: [] };
  const executions = [];
  const metrics = {
    totalExecutions: 0,
    successRate: 0,
    averageLatency: 0,
    activeExecutions: 0,
    errorRate: 0,
    nodePerformance: {},
    recentErrors: [],
    hourlyTrends: []
  };
  const selectedNode = null;
  const isEditing = false;
  const isLoading = false;
  const error = null;
  const logs = [];
  const setSelectedNode = () => {};
  const setIsEditing = () => {};
  const updateNode = () => {};
  const addNode = () => {};
  const deleteNode = () => {};
  const addEdge = () => {};
  const saveWorkflow = () => {};
  const deployWorkflow = () => {};
  const testWorkflow = () => {};
  const addLog = () => {};
  const clearLogs = () => {};

  const handleTestWorkflow = async () => {
    await testWorkflow('digital health reimbursement', 'automatic', false);
  };

  const getNodeStatusColor = (status: WorkflowNode['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      case 'running': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getNodeIcon = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'start': return <Play className="w-4 h-4" />;
      case 'end': return <Square className="w-4 h-4" />;
      case 'process': return <Settings className="w-4 h-4" />;
      case 'decision': return <GitBranch className="w-4 h-4" />;
      case 'interrupt': return <Pause className="w-4 h-4" />;
      case 'parallel': return <Zap className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">LangGraph Workflow Admin</h1>
          <p className="text-muted-foreground">
            Manage and monitor the multi-agent workflow system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <Edit className="w-4 h-4" />
            {isEditing ? 'Stop Editing' : 'Edit Workflow'}
          </Button>
          <Button
            onClick={saveWorkflow}
            disabled={!isEditing || isLoading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
          <Button
            onClick={deployWorkflow}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Deploying...' : 'Deploy'}
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Executions</p>
                  <p className="text-2xl font-bold">{metrics.totalExecutions}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Latency</p>
                  <p className="text-2xl font-bold">{metrics.averageLatency.toFixed(0)}ms</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Executions</p>
                  <p className="text-2xl font-bold">{metrics.activeExecutions}</p>
                </div>
                <Zap className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="visual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visual">Visual Editor</TabsTrigger>
          <TabsTrigger value="code">Code Editor</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Visual Editor */}
        <TabsContent value="visual">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Workflow Canvas */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5" />
                    Workflow Canvas
                  </CardTitle>
                  <CardDescription>
                    Drag and drop nodes to build your workflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WorkflowVisualizer
                    nodes={workflow.nodes}
                    edges={workflow.edges}
                    selectedNode={selectedNode}
                    onNodeSelect={setSelectedNode}
                    onNodeUpdate={updateNode}
                    isEditing={isEditing}
                    className="h-96"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Node Properties */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Node Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedNode ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nodeName">Name</Label>
                        <Input
                          id="nodeName"
                          value={selectedNode.name}
                          onChange={(e) => updateNode(selectedNode.id, { name: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="nodeType">Type</Label>
                        <Select
                          value={selectedNode.type}
                          onValueChange={(value) => updateNode(selectedNode.id, { type: value as WorkflowNode['type'] })}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="start">Start</SelectItem>
                            <SelectItem value="end">End</SelectItem>
                            <SelectItem value="process">Process</SelectItem>
                            <SelectItem value="decision">Decision</SelectItem>
                            <SelectItem value="interrupt">Interrupt</SelectItem>
                            <SelectItem value="parallel">Parallel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="nodeStatus">Status</Label>
                        <Select
                          value={selectedNode.status}
                          onValueChange={(value) => updateNode(selectedNode.id, { status: value as WorkflowNode['status'] })}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                            <SelectItem value="running">Running</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Performance</Label>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Executions: {selectedNode.executionCount}</div>
                          <div>Avg Latency: {selectedNode.averageLatency}ms</div>
                          <div>Last Executed: {selectedNode.lastExecuted?.toLocaleString() || 'Never'}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Select a node to edit its properties</p>
                  )}
                </CardContent>
              </Card>

              {/* Add Node */}
              {isEditing && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add Node</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => addNode({
                        name: 'New Node',
                        type: 'process',
                        position: { x: 50, y: 50 },
                        config: {},
                        status: 'active'
                      })}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Node
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Code Editor */}
        <TabsContent value="code">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Workflow Definition
              </CardTitle>
              <CardDescription>
                Edit the workflow configuration in JSON format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={JSON.stringify(workflow, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setWorkflow(parsed);
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                className="min-h-[400px] font-mono text-sm"
                disabled={!isEditing}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Executions */}
        <TabsContent value="executions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Workflow Executions
              </CardTitle>
              <CardDescription>
                Monitor active and completed workflow executions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executions.map((execution) => (
                  <div
                    key={execution.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          execution.status === 'completed' ? 'default' :
                          execution.status === 'failed' ? 'destructive' :
                          execution.status === 'running' ? 'secondary' : 'outline'
                        }>
                          {execution.status}
                        </Badge>
                        <span className="font-medium">{execution.sessionId}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        User: {execution.userId} | 
                        Current Node: {execution.currentNode} |
                        Started: {execution.startTime.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {execution.status === 'running' && (
                        <Button size="sm" variant="destructive">
                          <Square className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                System Logs
              </CardTitle>
              <CardDescription>
                Real-time workflow execution logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button onClick={handleTestWorkflow} size="sm" disabled={isLoading}>
                  <Play className="w-4 h-4 mr-2" />
                  Test Workflow
                </Button>
                <Button onClick={clearLogs} size="sm" variant="outline">
                  Clear Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
