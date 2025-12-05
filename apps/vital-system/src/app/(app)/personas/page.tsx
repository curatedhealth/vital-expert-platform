'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/page-header';
import { Users, Building2, Zap, Brain, Lightbulb, AlertTriangle } from 'lucide-react';
import {
  PersonaCard,
  PersonaListItem,
  PersonaStatsCards,
  PersonaFilters,
  type Persona,
  type PersonaStats,
  type PersonaFiltersType,
} from '@/components/personas';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [sortKey, setSortKey] = useState<'priority' | 'ai' | 'work' | 'jtbd' | 'name'>('priority');

  // Derived helper: normalized priority score to drive focus tab + card cues
  const computePriorityScore = (persona: Persona, maxJtbd: number) => {
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
    // Weighted mix: AI maturity and work complexity dominate; JTBD count nudges tie-breakers
    return (ai * 0.5) + (work * 0.35) + (jtbdWeight * 0.15);
  };

  useEffect(() => {
    console.log('[PersonasPage] Component mounted, loading personas...');
    loadPersonas();
    loadOrgStructure();
  }, []);

  // Load org structure to get all departments for "By Department" view
  const loadOrgStructure = async () => {
    try {
      const response = await fetch('/api/org-structure');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.departments) {
          console.log('[PersonasPage] Loaded', data.data.departments.length, 'departments from org structure');
          setAllDepartments(data.data.departments || []);
        }
      }
    } catch (error) {
      console.warn('[PersonasPage] Failed to load org structure:', error);
      // Don't set error state - this is optional data for grouping
    }
  };

  // Sync filters with sidebar
  useEffect(() => {
    const handleFilterChange = (e: CustomEvent) => {
      setFilters(e.detail.filters);
    };

    window.addEventListener('personas-filters-change' as any, handleFilterChange);
    return () => {
      window.removeEventListener('personas-filters-change' as any, handleFilterChange);
    };
  }, []);

  // Memoized filtered personas
  const filteredPersonas = useMemo(() => {
    let filtered = [...personas];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(persona =>
        persona.name.toLowerCase().includes(query) ||
        persona.title?.toLowerCase().includes(query) ||
        persona.tagline?.toLowerCase().includes(query) ||
        persona.one_liner?.toLowerCase().includes(query) ||
        persona.role_slug?.toLowerCase().includes(query) ||
        persona.department_slug?.toLowerCase().includes(query) ||
        persona.function_slug?.toLowerCase().includes(query) ||
        persona.seniority_level?.toLowerCase().includes(query) ||
        persona.derived_archetype?.toLowerCase().includes(query) ||
        persona.preferred_service_layer?.toLowerCase().includes(query)
      );
    }

    // Role filter - filter by role_id
    if (filters.selectedRole !== 'all') {
      filtered = filtered.filter(persona => persona.role_id === filters.selectedRole);
    }

    // Department filter - filter by department_id
    if (filters.selectedDepartment !== 'all') {
      filtered = filtered.filter(persona => persona.department_id === filters.selectedDepartment);
    }

    // Function filter - filter by function_id
    if (filters.selectedFunction !== 'all') {
      filtered = filtered.filter(persona => persona.function_id === filters.selectedFunction);
    }

    // Seniority filter
    if (filters.selectedSeniority !== 'all') {
      filtered = filtered.filter(persona => persona.seniority_level === filters.selectedSeniority);
    }

    // Archetype filter
    if (filters.selectedArchetype && filters.selectedArchetype !== 'all') {
      filtered = filtered.filter(persona => persona.derived_archetype === filters.selectedArchetype);
    }

    // Service Layer filter
    if (filters.selectedServiceLayer && filters.selectedServiceLayer !== 'all') {
      filtered = filtered.filter(persona => persona.preferred_service_layer === filters.selectedServiceLayer);
    }

    return filtered;
  }, [personas, filters]);

  // Derived sorted personas for focus/order views
  const sortedPersonas = useMemo(() => {
    const maxJtbd = Math.max(...filteredPersonas.map(p => p.jtbds_count || 0), 0);
    const scored = filteredPersonas.map(p => ({
      persona: p,
      score: computePriorityScore(p, maxJtbd),
      ai: typeof p.ai_readiness_score === 'number' ? p.ai_readiness_score : parseFloat(String(p.ai_readiness_score || 0)),
      work: typeof p.work_complexity_score === 'number' ? p.work_complexity_score : parseFloat(String(p.work_complexity_score || 0)),
      jtbd: p.jtbds_count || 0,
    }));

    const comparator: Record<typeof sortKey, (a: any, b: any) => number> = {
      priority: (a, b) => b.score - a.score,
      ai: (a, b) => b.ai - a.ai,
      work: (a, b) => b.work - a.work,
      jtbd: (a, b) => b.jtbd - a.jtbd,
      name: (a, b) => a.persona.name.localeCompare(b.persona.name),
    };

    return scored.sort(comparator[sortKey]).map(entry => entry.persona);
  }, [filteredPersonas, sortKey]);

  // Notify sidebar of filter updates
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('personas-filters-update', {
      detail: {
        filters,
        filteredCount: filteredPersonas.length,
        totalCount: stats.total,
      },
    }));
  }, [filters, filteredPersonas.length, stats.total]);

  const loadPersonas = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[PersonasPage] Loading personas for current tenant...');

      // Fetch from API endpoint - no showAll parameter means tenant-filtered
      const response = await fetch('/api/personas');
      console.log('[PersonasPage] API response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        const errorMessage = errorData.error || errorData.details || `Failed to fetch personas: ${response.statusText}`;
        
        // Handle authentication errors specifically
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication required. Please sign in to view personas.');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const allPersonas = data.personas || [];
      const apiStats = data.stats || {};

      console.log('Personas page: Loaded', allPersonas.length, 'personas');
      console.log('API Stats:', apiStats);

      setPersonas(allPersonas);

      // Calculate stats from personas for filtering
      const byRole: Record<string, number> = {};
      const byDepartment: Record<string, number> = {};
      const byFunction: Record<string, number> = {};
      const bySeniority: Record<string, number> = {};

      allPersonas.forEach((persona: Persona) => {
        if (persona.role_slug) {
          byRole[persona.role_slug] = (byRole[persona.role_slug] || 0) + 1;
        }
        if (persona.department_slug) {
          byDepartment[persona.department_slug] = (byDepartment[persona.department_slug] || 0) + 1;
        }
        if (persona.function_slug) {
          byFunction[persona.function_slug] = (byFunction[persona.function_slug] || 0) + 1;
        }
        if (persona.seniority_level) {
          bySeniority[persona.seniority_level] = (bySeniority[persona.seniority_level] || 0) + 1;
        }
      });

      // Use API stats for total counts (from org tables), but keep persona-based counts for filtering
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
    } catch (error) {
      console.error('Error loading personas:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load personas. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get departments for grouping - use all departments from org structure if available
  // Otherwise fall back to departments from personas
  const getDepartmentsForGrouping = () => {
    // If we have org structure data, use all departments (even if they have 0 personas)
    if (allDepartments.length > 0) {
      // Create a map of department_id -> department_name for lookup
      const deptMap = new Map(allDepartments.map(d => [d.id, d.name || d.department_code || 'Unknown']));
      
      // Get unique department IDs from personas
      const personaDeptIds = new Set(personas.map(p => p.department_id).filter(Boolean));
      
      // Return all departments, but prioritize those with personas
      const withPersonas = allDepartments
        .filter(d => personaDeptIds.has(d.id))
        .map(d => ({ id: d.id, name: d.name || d.department_code || 'Unknown', slug: d.department_code || d.id }));
      
      const withoutPersonas = allDepartments
        .filter(d => !personaDeptIds.has(d.id))
        .map(d => ({ id: d.id, name: d.name || d.department_code || 'Unknown', slug: d.department_code || d.id }));
      
      // Return departments with personas first, then others
      return [...withPersonas, ...withoutPersonas];
    }
    
    // Fallback: use department slugs from personas (old behavior)
    const departments = new Set(personas.map(p => p.department_slug).filter(Boolean));
    return Array.from(departments).map(slug => ({ id: slug, name: slug, slug }));
  };

  // Early return for loading state with visible indicator
  if (loading && personas.length === 0 && !error) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          icon={Users}
          title="Personas"
          description="Loading personas..."
        />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            <Card>
              <CardContent className="py-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-blue-600"></div>
                  <p className="text-neutral-500">Loading personas...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Header */}
      <PageHeader
        icon={Users}
        title="Personas"
        description={`${stats.total} user personas across roles and departments`}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Controls Row */}
          {!loading && !error && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="text-sm text-neutral-600">
                Showing <span className="font-semibold">{filteredPersonas.length}</span> of <span className="font-semibold">{stats.total}</span> personas
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-neutral-500">Sort by</span>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as any)}
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

          {/* Error Message */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <span className="font-semibold">Error:</span>
                    <span>{error}</span>
                  </div>
                  {error.includes('Authentication required') && (
                    <div className="text-sm text-red-700 bg-red-100 p-3 rounded">
                      <p>You need to be signed in to view personas. Please sign in and try again.</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => loadPersonas()}
                    >
                      Retry
                    </Button>
                    {error.includes('Authentication required') && (
                      <Button
                        variant="default"
                        onClick={() => window.location.href = '/auth/signin'}
                      >
                        Sign In
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && !error && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-blue-600"></div>
                  <p className="text-neutral-500">Loading personas...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          {!loading && !error && <PersonaStatsCards stats={stats} />}

          {/* Personas Grid */}
          {!loading && !error && (
            <Tabs defaultValue="grid" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="archetypes">By Archetype</TabsTrigger>
              <TabsTrigger value="departments">By Department</TabsTrigger>
              <TabsTrigger value="focus">Focus</TabsTrigger>
            </TabsList>

            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedPersonas.map((persona) => (
                  <PersonaCard 
                    key={persona.id} 
                    persona={persona} 
                    onClick={(p) => router.push(`/personas/${p.slug}`)} 
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-4">
                {sortedPersonas.map((persona) => (
                  <PersonaListItem 
                    key={persona.id} 
                    persona={persona} 
                    onClick={(p) => router.push(`/personas/${p.slug}`)} 
                  />
                ))}
              </div>
            </TabsContent>

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
                              onClick={(p) => router.push(`/personas/${p.slug}`)} 
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
                
                {/* Unknown/Unassigned Archetype */}
                {(() => {
                  const unknownPersonas = filteredPersonas.filter(p => 
                    !p.derived_archetype && !p.archetype
                  );
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
                            onClick={(p) => router.push(`/personas/${p.slug}`)} 
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </TabsContent>

            <TabsContent value="departments">
              <div className="space-y-8">
                {getDepartmentsForGrouping().map(dept => {
                  // Match personas by department_id (preferred) or department_slug (fallback)
                  const deptPersonas = filteredPersonas.filter(p => 
                    p.department_id === dept.id || p.department_slug === dept.slug
                  );
                  
                  // Show all departments, even if they have 0 personas (so user can see all 296)
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
                              onClick={(p) => router.push(`/personas/${p.slug}`)} 
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

            <TabsContent value="focus">
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {sortedPersonas.slice(0, 3).map((persona, idx) => (
                    <PersonaCard
                      key={persona.id}
                      persona={persona}
                      onClick={(p) => router.push(`/personas/${p.slug}`)}
                      compact={false}
                    />
                  ))}
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-neutral-500">Top opportunities</p>
                        <h3 className="text-xl font-bold text-neutral-900">Focus Order</h3>
                        <p className="text-sm text-neutral-500">Sorted by composite priority (AI readiness, work complexity, JTBD load)</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSortKey('priority')}>
                        Reset priority sort
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {sortedPersonas.slice(0, 12).map((persona, index) => (
                        <div
                          key={persona.id}
                          className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-neutral-50"
                          onClick={() => router.push(`/personas/${persona.slug}`)}
                        >
                          {(() => {
                            const aiScore = Number(persona.ai_readiness_score ?? 0);
                            const workScore = Number(persona.work_complexity_score ?? 0);
                            const aiLabel = Number.isFinite(aiScore) && aiScore > 0 ? `${Math.round(aiScore * 100)}% AI` : 'AI —';
                            const workLabel = Number.isFinite(workScore) && workScore > 0 ? `${Math.round(workScore * 100)}% Work` : 'Work —';
                            return (
                              <>
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
                              </>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
          )}

          {filteredPersonas.length === 0 && !loading && !error && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-neutral-500">No personas found matching your filters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
