"use client";

import {
  Brain,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Progress } from '@/shared/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

interface Agent {
  id: string;
  name: string;
  type: 'clinical_trial_designer' | 'regulatory_strategist' | 'market_access_strategist' | 'virtual_advisory_board' | 'conversational_ai';
  status: 'active' | 'idle' | 'busy' | 'error' | 'maintenance';
  version: string;
  description: string;
  capabilities: string[];
  metrics: {
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
    currentLoad: number;
    uptime: number;
  };
  config: {
    maxConcurrentTasks: number;
    timeout: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  lastActivity: Date;
  created: Date;
}

interface AgentExecution {
  id: string;
  agentId: string;
  taskType: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  input: string;
  output?: string;
  error?: string;
}

const MOCK_AGENTS: Agent[] = [
  {
    id: 'cta-001',
    name: 'Clinical Trial Designer',
    type: 'clinical_trial_designer',
    status: 'active',
    version: '2.1.0',
    description: 'Designs comprehensive clinical trial protocols with regulatory compliance and statistical rigor.',
    capabilities: [
      'Protocol Design',
      'Endpoint Selection',
      'Sample Size Calculation',
      'Regulatory Pathway Planning',
      'Risk Assessment'
    ],
    metrics: {
      totalRequests: 1247,
      successRate: 97.8,
      avgResponseTime: 1850,
      currentLoad: 23,
      uptime: 99.94
    },
    config: {
      maxConcurrentTasks: 5,
      timeout: 300000,
      priority: 'high'
    },
    lastActivity: new Date(Date.now() - 5 * 60 * 1000),
    created: new Date('2024-01-15')
  },
  {
    id: 'rs-001',
    name: 'Regulatory Strategist',
    type: 'regulatory_strategist',
    status: 'active',
    version: '1.8.2',
    description: 'Navigates regulatory pathways and develops compliance strategies across global markets.',
    capabilities: [
      'Regulatory Pathway Analysis',
      'Submission Planning',
      'Compliance Assessment',
      'Global Coordination',
      'Risk Mitigation'
    ],
    metrics: {
      totalRequests: 892,
      successRate: 95.4,
      avgResponseTime: 2340,
      currentLoad: 67,
      uptime: 99.87
    },
    config: {
      maxConcurrentTasks: 3,
      timeout: 450000,
      priority: 'high'
    },
    lastActivity: new Date(Date.now() - 2 * 60 * 1000),
    created: new Date('2024-01-20')
  },
  {
    id: 'mas-001',
    name: 'Market Access Strategist',
    type: 'market_access_strategist',
    status: 'busy',
    version: '1.5.1',
    description: 'Develops market access strategies and reimbursement pathways for global markets.',
    capabilities: [
      'Value Proposition Development',
      'Payer Strategy',
      'Health Economics',
      'Pricing Strategy',
      'Access Planning'
    ],
    metrics: {
      totalRequests: 634,
      successRate: 98.1,
      avgResponseTime: 3120,
      currentLoad: 87,
      uptime: 99.91
    },
    config: {
      maxConcurrentTasks: 2,
      timeout: 600000,
      priority: 'medium'
    },
    lastActivity: new Date(Date.now() - 30 * 1000),
    created: new Date('2024-02-01')
  },
  {
    id: 'vab-001',
    name: 'Virtual Advisory Board',
    type: 'virtual_advisory_board',
    status: 'idle',
    version: '1.2.0',
    description: 'Facilitates multi-expert collaboration with consensus-building algorithms.',
    capabilities: [
      'Expert Coordination',
      'Consensus Building',
      'Decision Aggregation',
      'Board Management',
      'Outcome Synthesis'
    ],
    metrics: {
      totalRequests: 156,
      successRate: 94.2,
      avgResponseTime: 5680,
      currentLoad: 12,
      uptime: 99.95
    },
    config: {
      maxConcurrentTasks: 1,
      timeout: 900000,
      priority: 'medium'
    },
    lastActivity: new Date(Date.now() - 45 * 60 * 1000),
    created: new Date('2024-02-10')
  }
];

const MOCK_EXECUTIONS: AgentExecution[] = [
  {
    id: 'exec-001',
    agentId: 'cta-001',
    taskType: 'protocol_design',
    status: 'running',
    startTime: new Date(Date.now() - 10 * 60 * 1000),
    input: 'Design Phase II oncology trial for novel PD-1 inhibitor'
  },
  {
    id: 'exec-002',
    agentId: 'rs-001',
    taskType: 'regulatory_strategy',
    status: 'completed',
    startTime: new Date(Date.now() - 30 * 60 * 1000),
    endTime: new Date(Date.now() - 5 * 60 * 1000),
    duration: 25 * 60 * 1000,
    input: 'Develop FDA breakthrough therapy designation strategy',
    output: 'Comprehensive regulatory strategy with 85% success probability'
  },
  {
    id: 'exec-003',
    agentId: 'mas-001',
    taskType: 'value_proposition',
    status: 'failed',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    duration: 30 * 60 * 1000,
    input: 'Create payer value proposition for rare disease therapy',
    error: 'Insufficient market data for rare disease indication'
  }
];

const AgentCard: React.FC<{
  agent: Agent;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onConfigure: (agent: Agent) => void;
}> = ({ agent, onStart, onStop, onConfigure }) => {
  const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
    active: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    idle: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock },
    busy: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Activity },
    error: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle },
    maintenance: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: RefreshCw }
  };

  const config = statusConfig[agent.status] || statusConfig.idle;
  const StatusIcon = config.icon;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <CardDescription>v{agent.version}</CardDescription>
            </div>
          </div>
          <Badge className={config.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {agent.status}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mt-2">{agent.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Capabilities */}
        <div>
          <h4 className="text-sm font-medium mb-2">Capabilities</h4>
          <div className="flex flex-wrap gap-1">
            {agent.capabilities.map((capability, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {capability}
              </Badge>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500">Success Rate</div>
            <div className="text-lg font-semibold text-green-600">
              {agent.metrics.successRate}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Avg Response</div>
            <div className="text-lg font-semibold">
              {agent.metrics.avgResponseTime}ms
            </div>
          </div>
        </div>

        {/* Current Load */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Current Load</span>
            <span>{agent.metrics.currentLoad}%</span>
          </div>
          <Progress value={agent.metrics.currentLoad} />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {agent.status === 'active' || agent.status === 'busy' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStop(agent.id)}
              className="flex-1"
            >
              <Pause className="h-4 w-4 mr-1" />
              Stop
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => onStart(agent.id)}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onConfigure(agent)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Last Activity */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          Last activity: {agent.lastActivity.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};

const ExecutionItem: React.FC<{ execution: AgentExecution }> = ({ execution }) => {
  const statusConfig: Record<string, { color: string; icon: string }> = {
    running: { color: 'bg-blue-100 text-blue-800', icon: '🔄' },
    completed: { color: 'bg-green-100 text-green-800', icon: '✅' },
    failed: { color: 'bg-red-100 text-red-800', icon: '❌' },
    cancelled: { color: 'bg-gray-100 text-gray-800', icon: '⏹️' }
  };

  const config = statusConfig[execution.status] || statusConfig.running;

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{config.icon}</span>
            <span className="font-medium">{execution.taskType.replace('_', ' ').toUpperCase()}</span>
            <Badge className={config.color}>
              {execution.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-2">{execution.input}</p>

          {execution.output && (
            <div className="bg-green-50 p-2 rounded text-xs">
              <strong>Output:</strong> {execution.output}
            </div>
          )}

          {execution.error && (
            <div className="bg-red-50 p-2 rounded text-xs">
              <strong>Error:</strong> {execution.error}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Started: {execution.startTime.toLocaleString()}</span>
        {execution.duration && (
          <span>Duration: {Math.round(execution.duration / 1000)}s</span>
        )}
        {execution.status === 'running' && (
          <span>Running for: {Math.round((Date.now() - execution.startTime.getTime()) / 1000)}s</span>
        )}
      </div>
    </div>
  );
};

const AgentConfigDialog: React.FC<{
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: unknown) => void;
}> = ({ agent, isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState({
    maxConcurrentTasks: 5,
    timeout: 300000,
    priority: 'medium'
  });

  useEffect(() => {
    if (agent) {
      setConfig(agent.config);
    }
  }, [agent]);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  if (!agent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configure {agent.name}</DialogTitle>
          <DialogDescription>
            Adjust agent settings and performance parameters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Concurrent Tasks</label>
            <Input
              type="number"
              value={config.maxConcurrentTasks}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                maxConcurrentTasks: parseInt(e.target.value) || 1
              }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Timeout (ms)</label>
            <Input
              type="number"
              value={config.timeout}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                timeout: parseInt(e.target.value) || 60000
              }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select
              value={config.priority}
              onValueChange={(value) => setConfig(prev => ({
                ...prev,
                priority: value as 'low' | 'medium' | 'high' | 'critical'
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AgentManager: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [executions, setExecutions] = useState<AgentExecution[]>(MOCK_EXECUTIONS);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleStart = (agentId: string) => {
    setAgents(prev => prev.map(agent =>
      agent.id === agentId ? { ...agent, status: 'active' as const } : agent
    ));
  };

  const handleStop = (agentId: string) => {
    setAgents(prev => prev.map(agent =>
      agent.id === agentId ? { ...agent, status: 'idle' as const } : agent
    ));
  };

  const handleConfigure = (agent: Agent) => {
    setSelectedAgent(agent);
    setConfigDialogOpen(true);
  };

  const handleSaveConfig = (config: unknown) => {
    if (selectedAgent) {
      setAgents(prev => prev.map(agent =>
        agent.id === selectedAgent.id ? { ...agent, config } : agent
      ));
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const agentStats = {
    total: agents.length,
    active: agents.filter(a => a.status === 'active').length,
    busy: agents.filter(a => a.status === 'busy').length,
    idle: agents.filter(a => a.status === 'idle').length,
    error: agents.filter(a => a.status === 'error').length
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agent Manager</h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor AI agents across the VITAL Path platform
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Deploy New Agent
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{agentStats.total}</div>
                <div className="text-sm text-gray-600">Total Agents</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{agentStats.active}</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{agentStats.busy}</div>
                <div className="text-sm text-gray-600">Busy</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <div>
                <div className="text-2xl font-bold">{agentStats.idle}</div>
                <div className="text-sm text-gray-600">Idle</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{agentStats.error}</div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="busy">Busy</SelectItem>
            <SelectItem value="idle">Idle</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="executions">Recent Executions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onStart={handleStartAgent}
                onStop={handleStopAgent}
                onConfigure={handleConfigureAgent}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="executions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>
                Latest agent execution results and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executions.map((execution) => (
                  <ExecutionItem key={execution.id} execution={execution} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-gray-600">
                          {agent.metrics.totalRequests} requests • {agent.metrics.successRate}% success
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{agent.metrics.avgResponseTime}ms</div>
                        <div className="text-sm text-gray-600">avg response</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div key={agent.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{agent.name}</span>
                        <span>{agent.metrics.currentLoad}%</span>
                      </div>
                      <Progress value={agent.metrics.currentLoad} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Config Dialog */}
      <AgentConfigDialog
        agent={selectedAgent}
        isOpen={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        onSave={handleSaveConfig}
      />
    </div>
  );
};

export default AgentManager;