'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/page-header';
import {
  Search,
  Users,
  Briefcase,
  Target,
  TrendingUp,
  Building2,
  UserCircle
} from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  description: string;
  role?: string;
  department?: string;
  business_function?: string;
  goals?: string[];
  pain_points?: string[];
  context?: string;
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
}

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    byRole: {} as Record<string, number>,
    byDepartment: {} as Record<string, number>,
    byFunction: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  useEffect(() => {
    loadPersonas();
  }, []);

  useEffect(() => {
    filterPersonas();
  }, [searchQuery, selectedRole, selectedDepartment, personas]);

  const loadPersonas = async () => {
    try {
      setLoading(true);
      console.log('Personas page: Loading personas for current tenant...');

      // Fetch from API endpoint - no showAll parameter means tenant-filtered
      const response = await fetch('/api/personas');

      if (!response.ok) {
        throw new Error(`Failed to fetch personas: ${response.statusText}`);
      }

      const data = await response.json();
      const allPersonas = data.personas || [];

      console.log('Personas page: Loaded', allPersonas.length, 'personas');

      setPersonas(allPersonas);

      // Calculate stats
      const byRole: Record<string, number> = {};
      const byDepartment: Record<string, number> = {};
      const byFunction: Record<string, number> = {};

      allPersonas.forEach((persona: Persona) => {
        if (persona.role) {
          byRole[persona.role] = (byRole[persona.role] || 0) + 1;
        }
        if (persona.department) {
          byDepartment[persona.department] = (byDepartment[persona.department] || 0) + 1;
        }
        if (persona.business_function) {
          byFunction[persona.business_function] = (byFunction[persona.business_function] || 0) + 1;
        }
      });

      setStats({
        total: allPersonas.length,
        byRole,
        byDepartment,
        byFunction,
      });
    } catch (error) {
      console.error('Error loading personas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPersonas = () => {
    let filtered = [...personas];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(persona =>
        persona.name.toLowerCase().includes(query) ||
        persona.description?.toLowerCase().includes(query) ||
        persona.role?.toLowerCase().includes(query) ||
        persona.department?.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(persona => persona.role === selectedRole);
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(persona => persona.department === selectedDepartment);
    }

    setFilteredPersonas(filtered);
  };

  const getUniqueRoles = () => {
    const roles = new Set(personas.map(p => p.role).filter(Boolean));
    return Array.from(roles).sort();
  };

  const getUniqueDepartments = () => {
    const departments = new Set(personas.map(p => p.department).filter(Boolean));
    return Array.from(departments).sort();
  };

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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-600">Total Personas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-blue-800 flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(stats.byRole).length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-green-800 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Departments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Object.keys(stats.byDepartment).length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-purple-800 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Functions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(stats.byFunction).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search personas by name, description, or role..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Role Filter */}
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="all">All Roles</option>
                  {getUniqueRoles().map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>

                {/* Department Filter */}
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="all">All Departments</option>
                  {getUniqueDepartments().map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                {/* Reset */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedRole('all');
                    setSelectedDepartment('all');
                  }}
                >
                  Reset
                </Button>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Showing {filteredPersonas.length} of {stats.total} personas
              </div>
            </CardContent>
          </Card>

          {/* Personas Grid */}
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="departments">By Department</TabsTrigger>
            </TabsList>

            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPersonas.map((persona) => (
                  <PersonaCard key={persona.id} persona={persona} onClick={setSelectedPersona} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-4">
                {filteredPersonas.map((persona) => (
                  <PersonaListItem key={persona.id} persona={persona} onClick={setSelectedPersona} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="departments">
              <div className="space-y-8">
                {getUniqueDepartments().map(department => {
                  const deptPersonas = filteredPersonas.filter(p => p.department === department);
                  if (deptPersonas.length === 0) return null;

                  return (
                    <div key={department}>
                      <div className="flex items-center gap-3 mb-4">
                        <Building2 className="h-6 w-6" />
                        <h2 className="text-2xl font-bold">{department}</h2>
                        <Badge variant="secondary">{deptPersonas.length}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {deptPersonas.map((persona) => (
                          <PersonaCard key={persona.id} persona={persona} compact onClick={setSelectedPersona} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>

          {filteredPersonas.length === 0 && !loading && (
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

function PersonaCard({ persona, compact = false, onClick }: { persona: Persona; compact?: boolean; onClick?: (persona: Persona) => void }) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onClick?.(persona)}>
      <CardHeader className={compact ? 'pb-3' : ''}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            <CardTitle className="text-lg">{persona.name}</CardTitle>
          </div>
        </div>
        {!compact && (
          <CardDescription className="line-clamp-2">
            {persona.description || 'No description available'}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {persona.role && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {persona.role}
              </Badge>
            )}

            {persona.department && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                {persona.department}
              </Badge>
            )}

            {persona.business_function && (
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                {persona.business_function}
              </Badge>
            )}
          </div>

          {/* Goals and Pain Points Preview */}
          {!compact && (
            <div className="text-xs text-gray-500 space-y-1">
              {persona.goals && persona.goals.length > 0 && (
                <div>
                  <span className="font-semibold">Goals:</span> {persona.goals.length}
                </div>
              )}
              {persona.pain_points && persona.pain_points.length > 0 && (
                <div>
                  <span className="font-semibold">Pain Points:</span> {persona.pain_points.length}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PersonaListItem({ persona, onClick }: { persona: Persona; onClick?: (persona: Persona) => void }) {
  return (
    <Card className="cursor-pointer hover:bg-gray-50" onClick={() => onClick?.(persona)}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <UserCircle className="h-6 w-6 text-gray-600" />
            <div className="flex-1">
              <h3 className="font-semibold">{persona.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-1">
                {persona.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {persona.role && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {persona.role}
              </Badge>
            )}

            {persona.department && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                {persona.department}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
