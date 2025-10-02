'use client';

import {
  Users,
  Workflow,
  Play,
  Settings,
  Plus,
  Search,
  Filter,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentDetailsModal } from '@/features/agents/components/agent-details-modal';
import { AgentsBoard } from '@/features/agents/components/agents-board';
import { useAgentsStore } from '@/shared/services/agents/agents-store';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  agents: string[];
  steps: WorkflowStep[];
  createdAt: string;
  lastRun: string;
  successRate: number;
}

interface WorkflowStep {
  id: string;
  name: string;
  agent: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  order: number;
  dependencies: string[];
}

export default function AskTeamPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<unknown>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('workflows');

  const { agents, loadAgents, isLoading } = useAgentsStore();

  useEffect(() => {
    if (agents.length === 0 && !isLoading) {
      loadAgents();
    }
  }, [agents.length, isLoading, loadAgents]);

  // Mock workflows data
  useEffect(() => {
    setWorkflows([
      {
        id: '1',
        name: 'FDA Submission Workflow',
        description: 'Complete FDA submission process with regulatory, clinical, and quality agents',
        status: 'active',
        agents: ['FDA Regulatory Strategist', 'Clinical Trial Designer', 'QMS Architect'],
        steps: [
          { id: '1', name: 'Regulatory Strategy', agent: 'FDA Regulatory Strategist', status: 'completed', order: 1, dependencies: [] },
          { id: '2', name: 'Clinical Protocol', agent: 'Clinical Trial Designer', status: 'running', order: 2, dependencies: ['1'] },
          { id: '3', name: 'Quality Review', agent: 'QMS Architect', status: 'pending', order: 3, dependencies: ['2'] }
        ],
        createdAt: '2024-01-15',
        lastRun: '2024-03-20',
        successRate: 92
      },
      {
        id: '2',
        name: 'Market Access Strategy',
        description: 'Comprehensive market access planning with reimbursement and health economics',
        status: 'paused',
        agents: ['Reimbursement Strategist', 'Health Economics Analyst', 'HCP Marketing Strategist'],
        steps: [
          { id: '1', name: 'Payer Analysis', agent: 'Reimbursement Strategist', status: 'completed', order: 1, dependencies: [] },
          { id: '2', name: 'Health Economics', agent: 'Health Economics Analyst', status: 'pending', order: 2, dependencies: ['1'] },
          { id: '3', name: 'HCP Strategy', agent: 'HCP Marketing Strategist', status: 'pending', order: 3, dependencies: ['2'] }
        ],
        createdAt: '2024-02-01',
        lastRun: '2024-03-18',
        successRate: 87
      }
    ]);
  }, []);

  const handleAgentSelect = (agent: unknown) => {
    setSelectedAgent(agent);
  };

  const handleAddToWorkflow = () => {
    // TODO: implement add to workflow
  };

  const handleCreateWorkflow = () => {
    // TODO: implement create workflow
  };

  const handleRunWorkflow = (workflow?: Workflow) => {
    // TODO: implement run workflow
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Ask Team</h1>
            <p className="text-lg text-muted-foreground">
              Orchestrated workflows with structured multi-step processes
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveTab('agents')}>
              <Users className="h-4 w-4 mr-2" />
              Manage Agents
            </Button>
            <Button onClick={handleCreateWorkflow}>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search workflows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Workflows Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {workflow.description}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Agents */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Agents ({workflow.agents.length})</h4>
                        <div className="flex flex-wrap gap-1">
                          {workflow.agents.slice(0, 3).map((agent, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {agent}
                            </Badge>
                          ))}
                          {workflow.agents.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{workflow.agents.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Steps Progress */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Progress</h4>
                        <div className="space-y-2">
                          {workflow.steps.map((step) => (
                            <div key={step.id} className="flex items-center gap-2">
                              <Badge className={getStepStatusColor(step.status)} variant="outline">
                                {step.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{step.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Success Rate</div>
                          <div className="font-medium">{workflow.successRate}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Last Run</div>
                          <div className="font-medium">{workflow.lastRun}</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedWorkflow(workflow)}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleRunWorkflow(workflow)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Run
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Available Agents</h3>
                  <p className="text-sm text-muted-foreground">
                    Select agents to add to your workflows
                  </p>
                </div>
              </div>

              <AgentsBoard
                onAgentSelect={handleAgentSelect}
                onAddToChat={handleAddToWorkflow}
                showCreateButton={true}
                hiddenControls={false}
                searchQuery=""
                onSearchChange={() => { /* TODO: implement */ }}
                selectedDomain="all"
                onFilterChange={() => { /* TODO: implement */ }}
                viewMode="grid"
                onViewModeChange={() => { /* TODO: implement */ }}
              />
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Workflow className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">Total Workflows</div>
                        <div className="text-2xl font-bold">{workflows.length}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">Active</div>
                        <div className="text-2xl font-bold">
                          {workflows.filter(w => w.status === 'active').length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">Avg Success Rate</div>
                        <div className="text-2xl font-bold">
                          {Math.round(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-orange-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">Total Agents</div>
                        <div className="text-2xl font-bold">{agents.length}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Workflow Performance</CardTitle>
                  <CardDescription>Recent workflow execution metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Analytics dashboard coming soon...
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Agent Details Modal */}
        {selectedAgent && (
          <AgentDetailsModal
            agent={selectedAgent}
            onClose={() => {
              setSelectedAgent(null);
            }}
            onEdit={() => {
              setSelectedAgent(null);
            }}
            onDuplicate={() => {
              setSelectedAgent(null);
            }}
          />
        )}
      </div>
    </div>
  );
}