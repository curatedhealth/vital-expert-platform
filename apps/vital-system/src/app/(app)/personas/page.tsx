'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/page-header';
import { Users, Building2 } from 'lucide-react';
import {
  PersonaCard,
  PersonaListItem,
  PersonaStatsCards,
  PersonaFilters,
  type Persona,
  type PersonaStats,
  type PersonaFiltersType,
} from '@/components/personas';

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [allDepartments, setAllDepartments] = useState<Array<{ id: string; name: string; department_code?: string }>>([]);
  const [filters, setFilters] = useState<PersonaFiltersType>({
    searchQuery: '',
    selectedRole: 'all',
    selectedDepartment: 'all',
    selectedFunction: 'all',
    selectedSeniority: 'all',
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
        persona.tags?.some(tag => tag.toLowerCase().includes(query))
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

    return filtered;
  }, [personas, filters]);

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
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                  <p className="text-gray-500">Loading personas...</p>
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
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                  <p className="text-gray-500">Loading personas...</p>
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
              <TabsTrigger value="departments">By Department</TabsTrigger>
            </TabsList>

            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPersonas.map((persona) => (
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
                {filteredPersonas.map((persona) => (
                  <PersonaListItem 
                    key={persona.id} 
                    persona={persona} 
                    onClick={(p) => router.push(`/personas/${p.slug}`)} 
                  />
                ))}
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
                        <div className="text-sm text-gray-500 italic py-4">
                          No personas in this department
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
          )}

          {filteredPersonas.length === 0 && !loading && !error && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No personas found matching your filters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
