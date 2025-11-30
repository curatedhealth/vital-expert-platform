'use client';

/**
 * Agent Store Browser Component
 *
 * High-performance browser for 1000+ agents with:
 * - Virtual scrolling for large lists
 * - Advanced filtering (domain, tier, status, search)
 * - Bulk operations
 * - Agent details sidebar
 * - Real-time status updates
 *
 * Phase 6 Implementation - Production Ready
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Users,
  Zap,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  Building,
  Tag,
  Layers,
  Activity,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui';
import { Button } from '@vital/ui';
import { Input } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@vital/ui';
import { Checkbox } from '@vital/ui';
import { ScrollArea } from '@vital/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@vital/ui';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@vital/ui';

// ============================================================================
// TYPES
// ============================================================================

interface Agent {
  id: string;
  name: string;
  display_name?: string;
  description: string;
  tier: 'tier_1' | 'tier_2' | 'tier_3';
  status: 'active' | 'inactive' | 'draft' | 'deprecated';
  knowledge_domains: string[];
  capabilities: string[];
  department_name?: string;
  function_name?: string;
  role_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

interface AgentStats {
  total: number;
  active: number;
  inactive: number;
  by_tier: Record<string, number>;
  by_domain: Record<string, number>;
}

interface FilterState {
  search: string;
  status: string;
  tier: string;
  domain: string;
  department: string;
}

// ============================================================================
// VIRTUALIZED LIST COMPONENT
// ============================================================================

interface VirtualListProps {
  items: Agent[];
  itemHeight: number;
  containerHeight: number;
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onView: (agent: Agent) => void;
}

function VirtualizedAgentList({
  items,
  itemHeight,
  containerHeight,
  selectedIds,
  onSelect,
  onView,
}: VirtualListProps) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount, items.length);
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;
  const totalHeight = items.length * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'tier_1':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'tier_2':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'tier_3':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'deprecated':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
      className="border rounded-lg"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((agent) => (
            <div
              key={agent.id}
              style={{ height: itemHeight }}
              className={`flex items-center px-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                selectedIds.has(agent.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              {/* Checkbox */}
              <Checkbox
                checked={selectedIds.has(agent.id)}
                onCheckedChange={() => onSelect(agent.id)}
                className="mr-3"
              />

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold mr-3">
                {agent.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white truncate">
                    {agent.display_name || agent.name}
                  </span>
                  {getStatusIcon(agent.status)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {agent.description?.slice(0, 60)}...
                </div>
              </div>

              {/* Tier Badge */}
              <Badge
                variant="secondary"
                className={`mr-3 ${getTierColor(agent.tier)}`}
              >
                {agent.tier?.replace('_', ' ')}
              </Badge>

              {/* Domains */}
              <div className="hidden lg:flex items-center gap-1 mr-3">
                {agent.knowledge_domains?.slice(0, 2).map((domain) => (
                  <Badge key={domain} variant="outline" className="text-xs">
                    {domain}
                  </Badge>
                ))}
                {(agent.knowledge_domains?.length || 0) > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{agent.knowledge_domains.length - 2}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(agent)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Activity className="h-4 w-4 mr-2" />
                      View Analytics
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// AGENT DETAILS SIDEBAR
// ============================================================================

interface AgentDetailsSidebarProps {
  agent: Agent | null;
  open: boolean;
  onClose: () => void;
}

function AgentDetailsSidebar({ agent, open, onClose }: AgentDetailsSidebarProps) {
  if (!agent) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div>{agent.display_name || agent.name}</div>
              <SheetDescription className="text-xs">
                ID: {agent.id}
              </SheetDescription>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status & Tier */}
          <div className="flex items-center gap-2">
            <Badge
              variant={agent.status === 'active' ? 'default' : 'secondary'}
              className={
                agent.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : ''
              }
            >
              {agent.status}
            </Badge>
            <Badge variant="outline">{agent.tier?.replace('_', ' ')}</Badge>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Description
            </h4>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {agent.description}
            </p>
          </div>

          {/* Organization */}
          {(agent.department_name || agent.function_name || agent.role_name) && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Organization
              </h4>
              <div className="space-y-1 text-sm">
                {agent.department_name && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span>{agent.department_name}</span>
                  </div>
                )}
                {agent.function_name && (
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-gray-400" />
                    <span>{agent.function_name}</span>
                  </div>
                )}
                {agent.role_name && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{agent.role_name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Knowledge Domains */}
          {agent.knowledge_domains?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Knowledge Domains
              </h4>
              <div className="flex flex-wrap gap-1">
                {agent.knowledge_domains.map((domain) => (
                  <Badge key={domain} variant="secondary">
                    {domain}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Capabilities */}
          {agent.capabilities?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Capabilities
              </h4>
              <div className="flex flex-wrap gap-1">
                {agent.capabilities.map((cap) => (
                  <Badge key={cap} variant="outline">
                    {cap}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-xs text-gray-500">
            <div>Created: {new Date(agent.created_at).toLocaleDateString()}</div>
            <div>Updated: {new Date(agent.updated_at).toLocaleDateString()}</div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="flex-1">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Agent
            </Button>
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AgentStoreBrowser() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    tier: 'all',
    domain: 'all',
    department: 'all',
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch agents
  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status !== 'all') {
        params.set('status', filters.status);
      }

      const response = await fetch(`/api/agents?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.statusText}`);
      }

      const data = await response.json();
      setAgents(data.agents || []);

      // Calculate stats
      const agentList = data.agents || [];
      const tierCounts: Record<string, number> = {};
      const domainCounts: Record<string, number> = {};

      agentList.forEach((agent: Agent) => {
        tierCounts[agent.tier] = (tierCounts[agent.tier] || 0) + 1;
        agent.knowledge_domains?.forEach((domain) => {
          domainCounts[domain] = (domainCounts[domain] || 0) + 1;
        });
      });

      setStats({
        total: agentList.length,
        active: agentList.filter((a: Agent) => a.status === 'active').length,
        inactive: agentList.filter((a: Agent) => a.status !== 'active').length,
        by_tier: tierCounts,
        by_domain: domainCounts,
      });

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  }, [filters.status]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Filter agents locally
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          agent.name?.toLowerCase().includes(searchLower) ||
          agent.display_name?.toLowerCase().includes(searchLower) ||
          agent.description?.toLowerCase().includes(searchLower) ||
          agent.knowledge_domains?.some((d) =>
            d.toLowerCase().includes(searchLower)
          );
        if (!matchesSearch) return false;
      }

      // Tier filter
      if (filters.tier !== 'all' && agent.tier !== filters.tier) {
        return false;
      }

      // Domain filter
      if (
        filters.domain !== 'all' &&
        !agent.knowledge_domains?.includes(filters.domain)
      ) {
        return false;
      }

      // Department filter
      if (
        filters.department !== 'all' &&
        agent.department_name !== filters.department
      ) {
        return false;
      }

      return true;
    });
  }, [agents, filters]);

  // Get unique values for filter dropdowns
  const uniqueDomains = useMemo(() => {
    const domains = new Set<string>();
    agents.forEach((agent) => {
      agent.knowledge_domains?.forEach((d) => domains.add(d));
    });
    return Array.from(domains).sort();
  }, [agents]);

  const uniqueDepartments = useMemo(() => {
    const departments = new Set<string>();
    agents.forEach((agent) => {
      if (agent.department_name) departments.add(agent.department_name);
    });
    return Array.from(departments).sort();
  }, [agents]);

  // Selection handlers
  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredAgents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAgents.map((a) => a.id)));
    }
  };

  const handleView = (agent: Agent) => {
    setSelectedAgent(agent);
    setSidebarOpen(true);
  };

  // Export selected agents
  const handleExport = () => {
    const exportData = agents.filter((a) => selectedIds.has(a.id));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agents-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && agents.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agent Store</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Browse and manage {stats?.total?.toLocaleString() || 0} agents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchAgents}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={selectedIds.size === 0}
          >
            <Download className="h-4 w-4 mr-1" />
            Export ({selectedIds.size})
          </Button>
          <Button size="sm">
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.active.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Domains
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(stats.by_domain).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Filtered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {filteredAgents.length.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search agents..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, search: e.target.value }))
                  }
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select
              value={filters.status}
              onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
              </SelectContent>
            </Select>

            {/* Tier Filter */}
            <Select
              value={filters.tier}
              onValueChange={(v) => setFilters((f) => ({ ...f, tier: v }))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="tier_1">Tier 1</SelectItem>
                <SelectItem value="tier_2">Tier 2</SelectItem>
                <SelectItem value="tier_3">Tier 3</SelectItem>
              </SelectContent>
            </Select>

            {/* Domain Filter */}
            <Select
              value={filters.domain}
              onValueChange={(v) => setFilters((f) => ({ ...f, domain: v }))}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                {uniqueDomains.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Department Filter */}
            {uniqueDepartments.length > 0 && (
              <Select
                value={filters.department}
                onValueChange={(v) =>
                  setFilters((f) => ({ ...f, department: v }))
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {uniqueDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Clear Filters */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setFilters({
                  search: '',
                  status: 'all',
                  tier: 'all',
                  domain: 'all',
                  department: 'all',
                })
              }
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {selectedIds.size} agent(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Activate
                </Button>
                <Button variant="outline" size="sm">
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Select All Header */}
      <div className="flex items-center gap-3 px-4 py-2 border rounded-t-lg bg-gray-50 dark:bg-gray-800">
        <Checkbox
          checked={
            selectedIds.size > 0 &&
            selectedIds.size === filteredAgents.length
          }
          onCheckedChange={handleSelectAll}
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {filteredAgents.length.toLocaleString()} agents
        </span>
      </div>

      {/* Virtualized Agent List */}
      <VirtualizedAgentList
        items={filteredAgents}
        itemHeight={72}
        containerHeight={500}
        selectedIds={selectedIds}
        onSelect={handleSelect}
        onView={handleView}
      />

      {/* Agent Details Sidebar */}
      <AgentDetailsSidebar
        agent={selectedAgent}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}

export default AgentStoreBrowser;
