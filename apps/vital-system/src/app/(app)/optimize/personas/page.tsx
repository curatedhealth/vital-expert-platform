'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/page-header';
import {
  Users,
  Building2,
  Zap,
  Brain,
  Lightbulb,
  AlertTriangle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  PersonaCard,
  PersonaListItem,
  PersonaStatsCards,
  type Persona,
  type PersonaStats,
  type PersonaFiltersType,
} from '@/components/personas';
import { AssetLoadingSkeleton } from '@/components/shared/AssetLoadingSkeleton';
import { AssetEmptyState } from '@/components/shared/AssetEmptyState';
import { AssetResultsCount } from '@/components/shared/AssetResultsCount';

// View types for URL persistence
type ViewMode = 'grid' | 'list' | 'archetypes' | 'departments' | 'focus';
type SortKey = 'priority' | 'ai' | 'work' | 'jtbd' | 'name';

// Archetype configuration for grouping view
const archetypeConfig: Record<string, { icon: React.ReactNode; color: string; description: string }> = {
  AUTOMATOR: {
    icon: <Zap className="h-6 w-6" />,
    color: 'text-blue-600',
    description: 'High AI readiness + Low complexity: Efficiency-focused, automation champions',
  },
  ORCHESTRATOR: {
    icon: <Brain className="h-6 w-6" />,
    color: 'text-purple-600',
    description: 'High AI readiness + High complexity: Strategic leaders, AI power users',
  },
  LEARNER: {
    icon: <Lightbulb className="h-6 w-6" />,
    color: 'text-green-600',
    description: 'Low AI readiness + Low complexity: Building skills, needs guidance',
  },
  SKEPTIC: {
    icon: <AlertTriangle className="h-6 w-6" />,
    color: 'text-orange-600',
    description: 'Low AI readiness + High complexity: Proof-driven, values multiple perspectives',
  },
};

export default function PersonasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL-based state
  const viewMode = (searchParams.get('view') as ViewMode) || 'grid';
  const sortKey = (searchParams.get('sort') as SortKey) || 'priority';

  // Component state
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [allDepartments, setAllDepartments] = useState<Array<{ id: string; name: string; department_code?: string }>>([]);
  const [filters, setFilters] = useState<PersonaFiltersType>({
    searchQuery: '',
    selectedRole: 'all',
    selectedDepartment: 'all',
    selectedFunction: 'all',
    selectedSeniority: 'all',
    selectedArchetype: 'all',
    selectedServiceLayer: 'all',
  });
  const [stats, setStats] = useState<PersonaStats>({
    total: 0,
    byRole: {},
    byDepartment: {},
    byFunction: {},
    bySeniority: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // URL update helper
  const updateURL = useCallback((params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'grid' && value !== 'priority') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    const newURL = newParams.toString() ? `?${newParams.toString()}` : '';
    router.replace(`/optimize/personas${newURL}`, { scroll: false });
  }, [router, searchParams]);

  // Priority score calculation
  const computePriorityScore = useCallback((persona: Persona, maxJtbd: number) => {
    const ai = typeof persona.ai_readiness_score === 'number'
      ? persona.ai_readiness_score
      : typeof persona.ai_readiness_score === 'string'
        ? parseFloat(persona.ai_readiness_score)
        : 0;
    const work = typeof persona.work_complexity_score === 'number'
      ? persona.work_complexity_score
      : typeof persona.work_complexity_score === 'string'
        ? parseFloat(persona.work_complexity_score)
        : 0;
    const jtbdWeight = maxJtbd > 0 ? Math.min((persona.jtbds_count || 0) / maxJtbd, 1) : 0;
    return (ai * 0.5) + (work * 0.35) + (jtbdWeight * 0.15);
  }, []);

  // Load personas
  const loadPersonas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/personas');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication required. Please sign in to view personas.');
        }
        throw new Error(errorData.error || `Failed to fetch personas: ${response.statusText}`);
      }

      const data = await response.json();
      const allPersonas = data.personas || [];
      const apiStats = data.stats || {};

      setPersonas(allPersonas);

      // Calculate stats
      const byRole: Record<string, number> = {};
      const byDepartment: Record<string, number> = {};
      const byFunction: Record<string, number> = {};
      const bySeniority: Record<string, number> = {};

      allPersonas.forEach((persona: Persona) => {
        if (persona.role_slug) byRole[persona.role_slug] = (byRole[persona.role_slug] || 0) + 1;
        if (persona.department_slug) byDepartment[persona.department_slug] = (byDepartment[persona.department_slug] || 0) + 1;
        if (persona.function_slug) byFunction[persona.function_slug] = (byFunction[persona.function_slug] || 0) + 1;
        if (persona.seniority_level) bySeniority[persona.seniority_level] = (bySeniority[persona.seniority_level] || 0) + 1;
      });

      setStats({
        total: apiStats.totalPersonas || allPersonas.length,
        totalRoles: apiStats.totalRoles || Object.keys(byRole).length,
        totalDepartments: apiStats.totalDepartments || Object.keys(byDepartment).length,
        totalFunctions: apiStats.totalFunctions || Object.keys(byFunction).length,
        byRole,
        byDepartment,
        byFunction,
        bySeniority,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load personas';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load org structure for department grouping
  const loadOrgStructure = useCallback(async () => {
    try {
      const response = await fetch('/api/org-structure');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.departments) {
          setAllDepartments(data.data.departments || []);
        }
      }
    } catch {
      // Optional data - don't set error
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadPersonas();
    loadOrgStructure();
  }, [loadPersonas, loadOrgStructure]);

  // Sync filters with sidebar
  useEffect(() => {
    const handleFilterChange = (e: CustomEvent) => {
      setFilters(e.detail.filters);
    };
    window.addEventListener('personas-filters-change' as any, handleFilterChange);
    return () => window.removeEventListener('personas-filters-change' as any, handleFilterChange);
  }, []);

  // Filtered personas
  const filteredPersonas = useMemo(() => {
    let filtered = [...personas];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(persona =>
        persona.name.toLowerCase().includes(query) ||
        persona.title?.toLowerCase().includes(query) ||
        persona.tagline?.toLowerCase().includes(query) ||
        persona.derived_archetype?.toLowerCase().includes(query)
      );
    }

    if (filters.selectedRole !== 'all') {
      filtered = filtered.filter(p => p.role_id === filters.selectedRole);
    }
    if (filters.selectedDepartment !== 'all') {
      filtered = filtered.filter(p => p.department_id === filters.selectedDepartment);
    }
    if (filters.selectedFunction !== 'all') {
      filtered = filtered.filter(p => p.function_id === filters.selectedFunction);
    }
    if (filters.selectedSeniority !== 'all') {
      filtered = filtered.filter(p => p.seniority_level === filters.selectedSeniority);
    }
    if (filters.selectedArchetype && filters.selectedArchetype !== 'all') {
      filtered = filtered.filter(p => p.derived_archetype === filters.selectedArchetype);
    }
    if (filters.selectedServiceLayer && filters.selectedServiceLayer !== 'all') {
      filtered = filtered.filter(p => p.preferred_service_layer === filters.selectedServiceLayer);
    }

    return filtered;
  }, [personas, filters]);

  // Sorted personas
  const sortedPersonas = useMemo(() => {
    const maxJtbd = Math.max(...filteredPersonas.map(p => p.jtbds_count || 0), 0);
    const scored = filteredPersonas.map(p => ({
      persona: p,
      score: computePriorityScore(p, maxJtbd),
      ai: typeof p.ai_readiness_score === 'number' ? p.ai_readiness_score : parseFloat(String(p.ai_readiness_score || 0)),
      work: typeof p.work_complexity_score === 'number' ? p.work_complexity_score : parseFloat(String(p.work_complexity_score || 0)),
      jtbd: p.jtbds_count || 0,
    }));

    const comparator: Record<SortKey, (a: any, b: any) => number> = {
      priority: (a, b) => b.score - a.score,
      ai: (a, b) => b.ai - a.ai,
      work: (a, b) => b.work - a.work,
      jtbd: (a, b) => b.jtbd - a.jtbd,
      name: (a, b) => a.persona.name.localeCompare(b.persona.name),
    };

    return scored.sort(comparator[sortKey]).map(entry => entry.persona);
  }, [filteredPersonas, sortKey, computePriorityScore]);

  // Notify sidebar of filter updates
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('personas-filters-update', {
      detail: { filters, filteredCount: filteredPersonas.length, totalCount: stats.total },
    }));
  }, [filters, filteredPersonas.length, stats.total]);

  // Get departments for grouping view
  const getDepartmentsForGrouping = useCallback(() => {
    if (allDepartments.length > 0) {
      const personaDeptIds = new Set(personas.map(p => p.department_id).filter(Boolean));
      const withPersonas = allDepartments
        .filter(d => personaDeptIds.has(d.id))
        .map(d => ({ id: d.id, name: d.name || d.department_code || 'Unknown', slug: d.department_code || d.id }));
      const withoutPersonas = allDepartments
        .filter(d => !personaDeptIds.has(d.id))
        .map(d => ({ id: d.id, name: d.name || d.department_code || 'Unknown', slug: d.department_code || d.id }));
      return [...withPersonas, ...withoutPersonas];
    }
    const departments = new Set(personas.map(p => p.department_slug).filter(Boolean));
    return Array.from(departments).map(slug => ({ id: slug, name: slug, slug }));
  }, [allDepartments, personas]);

  // Handle view change
  const handleViewChange = (newView: string) => {
    updateURL({ view: newView });
  };

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    updateURL({ sort: newSort });
  };

  // Navigate to persona detail
  const handlePersonaClick = (persona: Persona) => {
    router.push(`/optimize/personas/${persona.slug}`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Header */}
      <PageHeader
        icon={Users}
        title="Personas"
        description={`${stats.total} user personas across roles and departments`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadPersonas} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Persona
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Results Count & Sort */}
          {!isLoading && !error && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <AssetResultsCount count={filteredPersonas.length} singular="persona" />
              <div className="flex items-center gap-2 text-sm">
                <span className="text-neutral-500">Sort by</span>
                <select
                  value={sortKey}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-canvas-surface dark:bg-neutral-900 text-sm"
                >
                  <option value="priority">Priority (AI + Work + JTBDs)</option>
                  <option value="ai">AI Readiness</option>
                  <option value="work">Work Complexity</option>
                  <option value="jtbd">JTBD Count</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <span className="font-semibold">Error:</span>
                    <span>{error}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={loadPersonas}>Retry</Button>
                    {error.includes('Authentication') && (
                      <Button onClick={() => window.location.href = '/auth/signin'}>Sign In</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && <AssetLoadingSkeleton variant={viewMode === 'list' ? 'list' : 'grid'} />}

          {/* Stats Cards */}
          {!isLoading && !error && <PersonaStatsCards stats={stats} />}

          {/* Empty State */}
          {!isLoading && !error && filteredPersonas.length === 0 && (
            <AssetEmptyState
              icon={Users}
              title="No personas found"
              description="Try adjusting your filters or create a new persona."
              actionLabel="Create Persona"
              onAction={() => setShowCreateModal(true)}
              showAction={true}
            />
          )}

          {/* Personas Views */}
          {!isLoading && !error && filteredPersonas.length > 0 && (
            <Tabs value={viewMode} onValueChange={handleViewChange} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="archetypes">By Archetype</TabsTrigger>
                <TabsTrigger value="departments">By Department</TabsTrigger>
                <TabsTrigger value="focus">Focus</TabsTrigger>
              </TabsList>

              {/* Grid View */}
              <TabsContent value="grid">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedPersonas.map((persona) => (
                    <PersonaCard
                      key={persona.id}
                      persona={persona}
                      onClick={handlePersonaClick}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* List View */}
              <TabsContent value="list">
                <div className="space-y-4">
                  {sortedPersonas.map((persona) => (
                    <PersonaListItem
                      key={persona.id}
                      persona={persona}
                      onClick={handlePersonaClick}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* By Archetype View */}
              <TabsContent value="archetypes">
                <div className="space-y-8">
                  {['AUTOMATOR', 'ORCHESTRATOR', 'LEARNER', 'SKEPTIC'].map(archetype => {
                    const archetypePersonas = filteredPersonas.filter(p =>
                      p.derived_archetype === archetype || p.archetype === archetype
                    );
                    const config = archetypeConfig[archetype];

                    return (
                      <div key={archetype}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={config.color}>{config.icon}</div>
                          <h2 className={`text-2xl font-bold ${config.color}`}>{archetype}</h2>
                          <Badge variant={archetypePersonas.length > 0 ? "default" : "secondary"}>
                            {archetypePersonas.length}
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-600 mb-4">{config.description}</p>
                        {archetypePersonas.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {archetypePersonas.map((persona) => (
                              <PersonaCard
                                key={persona.id}
                                persona={persona}
                                compact
                                onClick={handlePersonaClick}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-neutral-500 italic py-4 border-l-4 border-neutral-200 pl-4">
                            No personas with this archetype
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Unassigned */}
                  {(() => {
                    const unknownPersonas = filteredPersonas.filter(p => !p.derived_archetype && !p.archetype);
                    if (unknownPersonas.length === 0) return null;

                    return (
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Users className="h-6 w-6 text-neutral-500" />
                          <h2 className="text-2xl font-bold text-neutral-500">Unassigned</h2>
                          <Badge variant="secondary">{unknownPersonas.length}</Badge>
                        </div>
                        <p className="text-sm text-neutral-600 mb-4">Personas without MECE archetype assignment</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {unknownPersonas.map((persona) => (
                            <PersonaCard
                              key={persona.id}
                              persona={persona}
                              compact
                              onClick={handlePersonaClick}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </TabsContent>

              {/* By Department View */}
              <TabsContent value="departments">
                <div className="space-y-8">
                  {getDepartmentsForGrouping().map(dept => {
                    const deptPersonas = filteredPersonas.filter(p =>
                      p.department_id === dept.id || p.department_slug === dept.slug
                    );

                    return (
                      <div key={dept.id || dept.slug}>
                        <div className="flex items-center gap-3 mb-4">
                          <Building2 className="h-6 w-6" />
                          <h2 className="text-2xl font-bold">{dept.name}</h2>
                          <Badge variant={deptPersonas.length > 0 ? "default" : "secondary"}>
                            {deptPersonas.length}
                          </Badge>
                        </div>
                        {deptPersonas.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {deptPersonas.map((persona) => (
                              <PersonaCard
                                key={persona.id}
                                persona={persona}
                                compact
                                onClick={handlePersonaClick}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-neutral-500 italic py-4">
                            No personas in this department
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Focus View */}
              <TabsContent value="focus">
                <div className="space-y-6">
                  {/* Top 3 Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {sortedPersonas.slice(0, 3).map((persona) => (
                      <PersonaCard
                        key={persona.id}
                        persona={persona}
                        onClick={handlePersonaClick}
                      />
                    ))}
                  </div>

                  {/* Focus Order List */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-neutral-500">Top opportunities</p>
                          <h3 className="text-xl font-bold text-neutral-900">Focus Order</h3>
                          <p className="text-sm text-neutral-500">Sorted by composite priority (AI readiness, work complexity, JTBD load)</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleSortChange('priority')}>
                          Reset priority sort
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {sortedPersonas.slice(0, 12).map((persona, index) => {
                          const aiScore = Number(persona.ai_readiness_score ?? 0);
                          const workScore = Number(persona.work_complexity_score ?? 0);
                          const aiLabel = Number.isFinite(aiScore) && aiScore > 0 ? `${Math.round(aiScore * 100)}% AI` : 'AI —';
                          const workLabel = Number.isFinite(workScore) && workScore > 0 ? `${Math.round(workScore * 100)}% Work` : 'Work —';

                          return (
                            <div
                              key={persona.id}
                              className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-neutral-50 cursor-pointer"
                              onClick={() => handlePersonaClick(persona)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold flex items-center justify-center">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-semibold text-neutral-900">{persona.name}</p>
                                  <p className="text-xs text-neutral-500">{persona.title || persona.function_name || persona.role_name}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="text-blue-600 font-semibold">{aiLabel}</div>
                                <div className="text-purple-600 font-semibold">{workLabel}</div>
                                <div className="text-neutral-600 font-medium">{persona.jtbds_count || 0} JTBDs</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* TODO: Add PersonaEditModalV2 when showCreateModal is true */}
    </div>
  );
}
