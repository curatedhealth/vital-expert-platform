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
  Target,
  CheckCircle2,
  TrendingUp,
  Users,
  Zap,
  AlertCircle
} from 'lucide-react';

interface JTBD {
  id: string;
  job_statement: string;
  description?: string;
  category?: string;
  persona?: string;
  context?: string;
  success_criteria?: string[];
  obstacles?: string[];
  priority?: 'high' | 'medium' | 'low';
  status?: 'active' | 'planned' | 'completed';
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
}

export default function JTBDPage() {
  const [jtbds, setJTBDs] = useState<JTBD[]>([]);
  const [filteredJTBDs, setFilteredJTBDs] = useState<JTBD[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    byCategory: {} as Record<string, number>,
    byPriority: {
      high: 0,
      medium: 0,
      low: 0,
    },
    byStatus: {
      active: 0,
      planned: 0,
      completed: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [selectedJTBD, setSelectedJTBD] = useState<JTBD | null>(null);

  useEffect(() => {
    loadJTBDs();
  }, []);

  useEffect(() => {
    filterJTBDs();
  }, [searchQuery, selectedCategory, selectedPriority, selectedStatus, jtbds]);

  const loadJTBDs = async () => {
    try {
      setLoading(true);
      console.log('JTBD page: Loading jobs-to-be-done for current tenant...');

      // Fetch from API endpoint - no showAll parameter means tenant-filtered
      const response = await fetch('/api/jtbd');

      if (!response.ok) {
        throw new Error(`Failed to fetch JTBD: ${response.statusText}`);
      }

      const data = await response.json();
      const allJTBDs = data.jtbd || [];

      console.log('JTBD page: Loaded', allJTBDs.length, 'jobs-to-be-done');

      setJTBDs(allJTBDs);

      // Calculate stats
      const byCategory: Record<string, number> = {};
      const byPriority = { high: 0, medium: 0, low: 0 };
      const byStatus = { active: 0, planned: 0, completed: 0 };

      allJTBDs.forEach((jtbd: JTBD) => {
        if (jtbd.category) {
          byCategory[jtbd.category] = (byCategory[jtbd.category] || 0) + 1;
        }
        if (jtbd.priority) {
          byPriority[jtbd.priority]++;
        }
        if (jtbd.status) {
          byStatus[jtbd.status]++;
        }
      });

      setStats({
        total: allJTBDs.length,
        byCategory,
        byPriority,
        byStatus,
      });
    } catch (error) {
      console.error('Error loading JTBD:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJTBDs = () => {
    let filtered = [...jtbds];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(jtbd =>
        jtbd.job_statement.toLowerCase().includes(query) ||
        jtbd.description?.toLowerCase().includes(query) ||
        jtbd.category?.toLowerCase().includes(query) ||
        jtbd.persona?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(jtbd => jtbd.category === selectedCategory);
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(jtbd => jtbd.priority === selectedPriority);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(jtbd => jtbd.status === selectedStatus);
    }

    setFilteredJTBDs(filtered);
  };

  const getUniqueCategories = () => {
    const categories = new Set(jtbds.map(j => j.category).filter(Boolean));
    return Array.from(categories).sort();
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'planned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Header */}
      <PageHeader
        icon={Target}
        title="Jobs to Be Done"
        description={`${stats.total} user jobs across categories and priorities`}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-600">Total Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-red-800 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  High Priority
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.byPriority.high}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-green-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.byStatus.active}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-purple-800 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(stats.byCategory).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Priority/Status Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Priority</span>
                    <Badge className="bg-red-100 text-red-800">{stats.byPriority.high}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medium Priority</span>
                    <Badge className="bg-yellow-100 text-yellow-800">{stats.byPriority.medium}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Low Priority</span>
                    <Badge className="bg-blue-100 text-blue-800">{stats.byPriority.low}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active</span>
                    <Badge className="bg-green-100 text-green-800">{stats.byStatus.active}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Planned</span>
                    <Badge className="bg-blue-100 text-blue-800">{stats.byStatus.planned}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed</span>
                    <Badge className="bg-purple-100 text-purple-800">{stats.byStatus.completed}</Badge>
                  </div>
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
                      placeholder="Search jobs by statement, category, or persona..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="all">All Categories</option>
                  {getUniqueCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                {/* Priority Filter */}
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="planned">Planned</option>
                  <option value="completed">Completed</option>
                </select>

                {/* Reset */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedPriority('all');
                    setSelectedStatus('all');
                  }}
                >
                  Reset
                </Button>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Showing {filteredJTBDs.length} of {stats.total} jobs
              </div>
            </CardContent>
          </Card>

          {/* JTBD Grid */}
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="categories">By Category</TabsTrigger>
            </TabsList>

            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJTBDs.map((jtbd) => (
                  <JTBDCard key={jtbd.id} jtbd={jtbd} onClick={setSelectedJTBD} getPriorityColor={getPriorityColor} getStatusColor={getStatusColor} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-4">
                {filteredJTBDs.map((jtbd) => (
                  <JTBDListItem key={jtbd.id} jtbd={jtbd} onClick={setSelectedJTBD} getPriorityColor={getPriorityColor} getStatusColor={getStatusColor} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="categories">
              <div className="space-y-8">
                {getUniqueCategories().map(category => {
                  const categoryJTBDs = filteredJTBDs.filter(j => j.category === category);
                  if (categoryJTBDs.length === 0) return null;

                  return (
                    <div key={category}>
                      <div className="flex items-center gap-3 mb-4">
                        <Target className="h-6 w-6" />
                        <h2 className="text-2xl font-bold">{category}</h2>
                        <Badge variant="secondary">{categoryJTBDs.length}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryJTBDs.map((jtbd) => (
                          <JTBDCard key={jtbd.id} jtbd={jtbd} compact onClick={setSelectedJTBD} getPriorityColor={getPriorityColor} getStatusColor={getStatusColor} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>

          {filteredJTBDs.length === 0 && !loading && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No jobs found matching your filters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function JTBDCard({ jtbd, compact = false, onClick, getPriorityColor, getStatusColor }: {
  jtbd: JTBD;
  compact?: boolean;
  onClick?: (jtbd: JTBD) => void;
  getPriorityColor: (priority?: string) => string;
  getStatusColor: (status?: string) => string;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onClick?.(jtbd)}>
      <CardHeader className={compact ? 'pb-3' : ''}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <CardTitle className="text-lg line-clamp-2">{jtbd.job_statement}</CardTitle>
          </div>
        </div>
        {!compact && jtbd.description && (
          <CardDescription className="line-clamp-2">
            {jtbd.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {jtbd.priority && (
              <Badge className={getPriorityColor(jtbd.priority)}>
                {jtbd.priority.toUpperCase()}
              </Badge>
            )}

            {jtbd.status && (
              <Badge className={getStatusColor(jtbd.status)}>
                {jtbd.status}
              </Badge>
            )}

            {jtbd.category && (
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                {jtbd.category}
              </Badge>
            )}
          </div>

          {/* Metadata */}
          {!compact && (
            <div className="text-xs text-gray-500 space-y-1">
              {jtbd.persona && (
                <div>
                  <span className="font-semibold">Persona:</span> {jtbd.persona}
                </div>
              )}
              {jtbd.success_criteria && jtbd.success_criteria.length > 0 && (
                <div>
                  <span className="font-semibold">Success Criteria:</span> {jtbd.success_criteria.length}
                </div>
              )}
              {jtbd.obstacles && jtbd.obstacles.length > 0 && (
                <div>
                  <span className="font-semibold">Obstacles:</span> {jtbd.obstacles.length}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function JTBDListItem({ jtbd, onClick, getPriorityColor, getStatusColor }: {
  jtbd: JTBD;
  onClick?: (jtbd: JTBD) => void;
  getPriorityColor: (priority?: string) => string;
  getStatusColor: (status?: string) => string;
}) {
  return (
    <Card className="cursor-pointer hover:bg-gray-50" onClick={() => onClick?.(jtbd)}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Target className="h-6 w-6 text-gray-600" />
            <div className="flex-1">
              <h3 className="font-semibold line-clamp-1">{jtbd.job_statement}</h3>
              {jtbd.description && (
                <p className="text-sm text-gray-500 line-clamp-1">
                  {jtbd.description}
                </p>
              )}
              {jtbd.persona && (
                <p className="text-xs text-gray-400 mt-1">Persona: {jtbd.persona}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {jtbd.priority && (
              <Badge className={getPriorityColor(jtbd.priority)}>
                {jtbd.priority}
              </Badge>
            )}

            {jtbd.status && (
              <Badge className={getStatusColor(jtbd.status)}>
                {jtbd.status}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
