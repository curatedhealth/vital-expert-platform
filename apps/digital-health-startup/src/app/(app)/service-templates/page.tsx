'use client';

/**
 * Service Templates Page
 * Browse and launch pre-configured AI services following Ask Expert design patterns
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Filter,
  Search,
  Grid3x3,
  List,
  TrendingUp,
  Star,
  Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ServiceTemplateCard, ServiceTemplateCardCompact } from '@/components/service-templates/ServiceTemplateCard';
import {
  SERVICE_TEMPLATES,
  SERVICE_TEMPLATES_BY_CATEGORY,
} from '@/lib/service-templates/template-definitions';
import { ServiceTemplateConfig } from '@/types/service-templates';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';
type FilterCategory = ServiceTemplateConfig['category'] | 'all';
type FilterTier = ServiceTemplateConfig['tier'] | 'all';
type SortBy = 'popular' | 'recent' | 'name' | 'time';

export default function ServiceTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [filterTier, setFilterTier] = useState<FilterTier>('all');
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let templates = [...SERVICE_TEMPLATES];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(
        (template) =>
          template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.capabilities.some((cap) => cap.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      templates = templates.filter((template) => template.category === filterCategory);
    }

    // Apply tier filter
    if (filterTier !== 'all') {
      templates = templates.filter((template) => template.tier === filterTier);
    }

    // Apply sorting
    templates.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'time':
          return a.timeToValue.localeCompare(b.timeToValue);
        case 'popular':
          // Put templates with badges first
          if (a.visual.badge && !b.visual.badge) return -1;
          if (!a.visual.badge && b.visual.badge) return 1;
          return 0;
        case 'recent':
        default:
          return 0;
      }
    });

    return templates;
  }, [searchQuery, filterCategory, filterTier, sortBy]);

  // Get template counts by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SERVICE_TEMPLATES.forEach((template) => {
      counts[template.category] = (counts[template.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="flex h-full flex-col min-h-0">
      {/* Page Header */}
      <PageHeader
        icon={Sparkles}
        title="Service Templates"
        description="Pre-configured AI services ready to deploy. Select a template to get started instantly."
        badge={{
          label: `${SERVICE_TEMPLATES.length} Templates`,
          variant: 'secondary',
        }}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search and Filters Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters and View Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as FilterCategory)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="advisory">Advisory ({categoryCounts.advisory || 0})</SelectItem>
                  <SelectItem value="workflow">Workflow ({categoryCounts.workflow || 0})</SelectItem>
                  <SelectItem value="analysis">Analysis ({categoryCounts.analysis || 0})</SelectItem>
                  <SelectItem value="research">Research ({categoryCounts.research || 0})</SelectItem>
                  <SelectItem value="compliance">Compliance ({categoryCounts.compliance || 0})</SelectItem>
                  <SelectItem value="innovation">Innovation ({categoryCounts.innovation || 0})</SelectItem>
                </SelectContent>
              </Select>

              {/* Tier Filter */}
              <Select value={filterTier} onValueChange={(value) => setFilterTier(value as FilterTier)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <span>Popular</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="recent">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Recent</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="name">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Name</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="time">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Time to Value</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3x3 className="h-4 w-4" />
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
            </div>
          </div>

          {/* Active Filters Display */}
          {(filterCategory !== 'all' || filterTier !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:bg-background rounded-full"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filterCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Category: {filterCategory}
                  <button
                    onClick={() => setFilterCategory('all')}
                    className="ml-1 hover:bg-background rounded-full"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filterTier !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Tier: {filterTier}
                  <button
                    onClick={() => setFilterTier('all')}
                    className="ml-1 hover:bg-background rounded-full"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                  setFilterTier('all');
                }}
                className="h-6 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'}
            </p>
          </div>

          {/* Templates Display */}
          <AnimatePresence mode="wait">
            {filteredTemplates.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCategory('all');
                    setFilterTier('all');
                  }}
                >
                  Clear filters
                </Button>
              </motion.div>
            ) : viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredTemplates.map((template) => (
                  <ServiceTemplateCard key={template.id} template={template} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {filteredTemplates.map((template) => (
                  <ServiceTemplateCardCompact key={template.id} template={template} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Tabs (Alternative view) */}
          <div className="mt-12">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All ({SERVICE_TEMPLATES.length})</TabsTrigger>
                <TabsTrigger value="advisory">Advisory ({categoryCounts.advisory || 0})</TabsTrigger>
                <TabsTrigger value="workflow">Workflow ({categoryCounts.workflow || 0})</TabsTrigger>
                <TabsTrigger value="analysis">Analysis ({categoryCounts.analysis || 0})</TabsTrigger>
                <TabsTrigger value="research">Research ({categoryCounts.research || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {SERVICE_TEMPLATES.map((template) => (
                    <ServiceTemplateCard key={template.id} template={template} />
                  ))}
                </div>
              </TabsContent>

              {Object.entries(SERVICE_TEMPLATES_BY_CATEGORY).map(([category, templates]) => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                      <ServiceTemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
