'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  Grid,
  List,
  Clock,
  DollarSign,
  Users,
  Brain,
  TrendingUp,
  Star,
  Play,
  Eye,
  Settings
} from 'lucide-react';
import type { JTBD, JTBDFilters } from '@/lib/jtbd/jtbd-service';

interface JTBDExplorerProps {
  onJTBDSelect?: (jtbd: JTBD) => void;
  onJTBDExecute?: (jtbd: JTBD) => void;
}

export const JTBDExplorer: React.FC<JTBDExplorerProps> = ({
  onJTBDSelect,
  onJTBDExecute
}) => {
  const [jtbds, setJtbds] = useState<JTBD[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<JTBDFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFunction, setSelectedFunction] = useState<string>('all');

  // Fetch JTBDs
  useEffect(() => {
    fetchJTBDs();
  }, [filters, selectedFunction]);

  const fetchJTBDs = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();

      if (searchQuery) queryParams.set('search', searchQuery);
      if (selectedFunction !== 'all') queryParams.set('function', selectedFunction);
      if (filters.complexity) queryParams.set('complexity', filters.complexity);
      if (filters.time_to_value) queryParams.set('time_to_value', filters.time_to_value);
      if (filters.workshop_potential) queryParams.set('workshop_potential', filters.workshop_potential);
      if (filters.tags && filters.tags.length > 0) queryParams.set('tags', filters.tags.join(','));

      const response = await fetch(`/api/jtbd/catalog?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch JTBDs: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setJtbds(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch JTBDs');
      }
    } catch (err) {
      console.error('Error fetching JTBDs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch JTBDs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchQuery }));
    fetchJTBDs();
  };

  const handleFilterChange = (key: keyof JTBDFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({});
    setSelectedFunction('all');
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFunctionColor = (func: string) => {
    switch (func) {
      case 'Medical Affairs': return 'bg-blue-100 text-blue-800';
      case 'Commercial': return 'bg-purple-100 text-purple-800';
      case 'Market Access': return 'bg-teal-100 text-teal-800';
      case 'HR': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case '$': return 'text-green-600';
      case '$$': return 'text-yellow-600';
      case '$$$': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const JTBDCard: React.FC<{ jtbd: JTBD; viewMode: 'grid' | 'list' }> = ({ jtbd, viewMode }) => (
    <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${viewMode === 'list' ? 'mb-4' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getFunctionColor(jtbd.function)}>
                {jtbd.function}
              </Badge>
              <Badge variant="outline" className={getComplexityColor(jtbd.complexity)}>
                {jtbd.complexity}
              </Badge>
              <Badge variant="outline">
                {jtbd.workshop_potential} Workshop Potential
              </Badge>
            </div>
            <CardTitle className="text-lg">
              <span className="text-trust-blue font-semibold">{jtbd.verb}</span>{' '}
              <span className="text-deep-charcoal">{jtbd.goal}</span>
            </CardTitle>
          </div>
          <div className="text-right text-sm text-medical-gray">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span>{jtbd.success_rate}%</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Users className="h-3 w-3" />
              <span>{jtbd.usage_count}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-medical-gray text-sm mb-4 line-clamp-3">
          {jtbd.description}
        </p>

        {jtbd.business_value && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800 font-medium">Business Value:</p>
            <p className="text-sm text-green-700">{jtbd.business_value}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-medical-gray" />
            <span className="text-medical-gray">Time to Value:</span>
            <span className="font-medium">{jtbd.time_to_value}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className={`h-4 w-4 ${getCostColor(jtbd.implementation_cost)}`} />
            <span className="text-medical-gray">Cost:</span>
            <span className={`font-medium ${getCostColor(jtbd.implementation_cost)}`}>
              {jtbd.implementation_cost}
            </span>
          </div>
        </div>

        {jtbd.tags && jtbd.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {jtbd.tags.slice(0, 4).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {jtbd.tags.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{jtbd.tags.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-medical-gray">
            <TrendingUp className="h-3 w-3" />
            <span>Maturity: {jtbd.maturity_level}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onJTBDSelect?.(jtbd)}
              className="flex items-center gap-1"
            >
              <Eye className="h-3 w-3" />
              View
            </Button>
            <Button
              size="sm"
              onClick={() => onJTBDExecute?.(jtbd)}
              className="flex items-center gap-1"
              disabled={jtbd.maturity_level === 'Research' || jtbd.maturity_level === 'Concept'}
            >
              <Play className="h-3 w-3" />
              Execute
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const FilterPanel = () => (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medical-gray" />
            <Input
              placeholder="Search JTBDs by title, description, or goal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>

          {/* Function Filter */}
          <select
            value={selectedFunction}
            onChange={(e) => setSelectedFunction(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="all">All Functions</option>
            <option value="Medical Affairs">Medical Affairs</option>
            <option value="Commercial">Commercial</option>
            <option value="Market Access">Market Access</option>
            <option value="HR">HR</option>
          </select>

          {/* Complexity Filter */}
          <select
            value={filters.complexity || ''}
            onChange={(e) => handleFilterChange('complexity', e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="">All Complexity</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {/* Time to Value Filter */}
          <select
            value={filters.time_to_value || ''}
            onChange={(e) => handleFilterChange('time_to_value', e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="">All Time to Value</option>
            <option value="≤12 mo">≤12 months</option>
            <option value="12-24 mo">12-24 months</option>
            <option value=">24 mo">&gt;24 months</option>
            <option value="1-3 months">1-3 months</option>
            <option value="3-6 months">3-6 months</option>
            <option value="6-12 months">6-12 months</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-300 rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedFunction !== 'all' || Object.keys(filters).length > 0) && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-trust-blue border-t-transparent rounded-full animate-spin"></div>
          <span className="text-medical-gray">Loading JTBDs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-clinical-red mb-3">Error loading JTBDs</div>
          <p className="text-medical-gray mb-4">{error}</p>
          <Button onClick={fetchJTBDs} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-deep-charcoal mb-2">
            JTBD Library
          </h1>
          <p className="text-medical-gray">
            Discover and execute Jobs-to-Be-Done to accelerate your digital health transformation
          </p>
        </div>
      </div>

      {/* Filters */}
      <FilterPanel />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-medical-gray">
          Found {jtbds.length} JTBD{jtbds.length !== 1 ? 's' : ''}
          {selectedFunction !== 'all' && ` in ${selectedFunction}`}
        </div>
      </div>

      {/* JTBD Grid/List */}
      {jtbds.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Brain className="h-12 w-12 text-medical-gray mx-auto mb-3" />
            <h3 className="text-lg font-medium text-deep-charcoal mb-2">No JTBDs Found</h3>
            <p className="text-medical-gray mb-4">
              Try adjusting your filters or search terms to find relevant JTBDs.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {jtbds.map((jtbd) => (
            <JTBDCard key={jtbd.id} jtbd={jtbd} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
};