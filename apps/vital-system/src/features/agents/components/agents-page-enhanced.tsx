'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  List,
  Table as TableIcon,
  Kanban,
  BarChart3,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { AgentDetailModal } from './agent-detail-modal';
import { AgentsTableEnhanced } from './agents-table-enhanced';
import { AgentsKanban } from './agents-kanban';
import { AgentsBulkActions } from './agents-bulk-actions';
import type { ClientAgent } from '../types/agent-schema';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface AgentsPageEnhancedProps {
  agents: ClientAgent[];
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
  onAgentUpdate?: (agentId: string, updates: Partial<ClientAgent>) => Promise<void>;
  onAgentDelete?: (agentId: string) => Promise<void>;
  onBulkStatusChange?: (agentIds: string[], status: ClientAgent['status']) => Promise<void>;
  onBulkDelete?: (agentIds: string[]) => Promise<void>;
}

type ViewMode = 'overview' | 'grid' | 'list' | 'table' | 'kanban';

// ============================================================================
// Helper Functions
// ============================================================================

function calculateStatistics(agents: ClientAgent[]) {
  const total = agents.length;
  const active = agents.filter((a) => a.status === 'active').length;
  const testing = agents.filter((a) => a.status === 'testing').length;
  const inactive = agents.filter((a) => a.status === 'inactive').length;

  const tier1 = agents.filter((a) => a.tier === '1').length;
  const tier2 = agents.filter((a) => a.tier === '2').length;
  const tier3 = agents.filter((a) => a.tier === '3').length;

  const models = new Set(agents.map((a) => a.model)).size;

  return {
    total,
    active,
    testing,
    inactive,
    tier1,
    tier2,
    tier3,
    models,
  };
}

// ============================================================================
// Sub-Components
// ============================================================================

interface StatisticsCardProps {
  title: string;
  value: number;
  description?: string;
  color?: string;
}

function StatisticsCard({ title, value, description, color }: StatisticsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn('text-3xl font-bold', color)}>{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AgentsPageEnhanced({
  agents,
  isLoading = false,
  onRefresh,
  onAgentUpdate,
  onAgentDelete,
  onBulkStatusChange,
  onBulkDelete,
}: AgentsPageEnhancedProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClientAgent['status']>('all');
  const [tierFilter, setTierFilter] = useState<'all' | '1' | '2' | '3'>('all');
  const [selectedAgent, setSelectedAgent] = useState<ClientAgent | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter agents
  const filteredAgents = React.useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch =
        !searchQuery ||
        agent.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
      const matchesTier = tierFilter === 'all' || agent.tier === tierFilter;

      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [agents, searchQuery, statusFilter, tierFilter]);

  // Calculate statistics
  const statistics = React.useMemo(() => calculateStatistics(agents), [agents]);

  // Handle refresh
  const handleRefresh = async () => {
    if (!onRefresh) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
      toast.success('Agents refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh agents');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (agentId: string, newStatus: ClientAgent['status']) => {
    if (!onAgentUpdate) return;

    try {
      await onAgentUpdate(agentId, { status: newStatus });
      toast.success('Agent status updated');
    } catch (error) {
      toast.error('Failed to update agent status');
      throw error;
    }
  };

  // Handle bulk status change
  const handleBulkStatusChange = async (agentIds: string[], newStatus: ClientAgent['status']) => {
    if (!onBulkStatusChange) return;

    try {
      await onBulkStatusChange(agentIds, newStatus);
    } catch (error) {
      throw error;
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async (agentIds: string[]) => {
    if (!onBulkDelete) return;

    try {
      await onBulkDelete(agentIds);
    } catch (error) {
      throw error;
    }
  };

  // Handle agent edit
  const handleEditAgent = (agent: ClientAgent) => {
    // TODO: Implement edit modal
    console.log('Edit agent:', agent);
    toast.info('Edit functionality coming soon');
  };

  // Handle agent duplicate
  const handleDuplicateAgent = (agent: ClientAgent) => {
    // TODO: Implement duplicate
    console.log('Duplicate agent:', agent);
    toast.info('Duplicate functionality coming soon');
  };

  // Handle agent delete
  const handleDeleteAgent = async (agent: ClientAgent) => {
    if (!agent.is_custom) {
      toast.error('Only custom agents can be deleted');
      return;
    }

    if (!onAgentDelete) return;

    try {
      await onAgentDelete(agent.id);
      toast.success('Agent deleted successfully');
    } catch (error) {
      toast.error('Failed to delete agent');
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">Manage your AI expert agents</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
            Refresh
          </Button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>

          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        </div>
      </div>

      {/* Statistics Overview - Always Visible */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatisticsCard
          title="Total Agents"
          value={statistics.total}
          description={`${statistics.active} active`}
        />
        <StatisticsCard
          title="By Status"
          value={statistics.active}
          description={`${statistics.testing} testing, ${statistics.inactive} inactive`}
          color="text-green-600"
        />
        <StatisticsCard
          title="By Tier"
          value={statistics.tier3}
          description={`T1: ${statistics.tier1}, T2: ${statistics.tier2}, T3: ${statistics.tier3}`}
          color="text-amber-600"
        />
        <StatisticsCard
          title="Models"
          value={statistics.models}
          description="Unique AI models in use"
          color="text-purple-600"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Filters & Search</CardTitle>
              <CardDescription>Find and filter your agents</CardDescription>
            </div>

            <Badge variant="secondary">{filteredAgents.length} agents</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tierFilter} onValueChange={(v: any) => setTierFilter(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="1">Tier 1: Foundational</SelectItem>
                <SelectItem value="2">Tier 2: Specialist</SelectItem>
                <SelectItem value="3">Tier 3: Ultra-Specialist</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="table" className="gap-2">
            <TableIcon className="h-4 w-4" />
            Table
          </TabsTrigger>
          <TabsTrigger value="kanban" className="gap-2">
            <Kanban className="h-4 w-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="grid" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Grid
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* Table View */}
          <TabsContent value="table" className="mt-0">
            <AgentsTableEnhanced
              agents={filteredAgents}
              onAgentSelect={setSelectedAgent}
              onEdit={handleEditAgent}
              onDuplicate={handleDuplicateAgent}
              onDelete={handleDeleteAgent}
              selectedAgents={selectedAgents}
              onSelectionChange={setSelectedAgents}
            />
          </TabsContent>

          {/* Kanban View */}
          <TabsContent value="kanban" className="mt-0">
            <AgentsKanban
              agents={filteredAgents}
              onAgentSelect={setSelectedAgent}
              onStatusChange={handleStatusChange}
              groupBy="status"
            />
          </TabsContent>

          {/* Grid View (Placeholder) */}
          <TabsContent value="grid" className="mt-0">
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                  <LayoutGrid className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Grid view coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          open={!!selectedAgent}
          onOpenChange={(open) => !open && setSelectedAgent(null)}
          onEdit={handleEditAgent}
        />
      )}

      {/* Bulk Actions Toolbar */}
      <AgentsBulkActions
        selectedAgents={selectedAgents}
        agents={filteredAgents}
        onClearSelection={() => setSelectedAgents(new Set())}
        onStatusChange={handleBulkStatusChange}
        onDelete={handleBulkDelete}
      />
    </div>
  );
}
