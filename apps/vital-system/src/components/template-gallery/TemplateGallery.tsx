/**
 * Template Gallery Component
 * Browse, search, and preview workflow templates
 * 
 * Features:
 * - Grid/List view toggle
 * - Search and filtering
 * - Category tabs
 * - Template preview
 * - Load template into designer
 */

'use client';

import { useState, useEffect } from 'react';
import { Search, Grid, List, Star, Clock, TrendingUp, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Template {
  id: string;
  template_name: string;
  template_slug: string;
  display_name: string;
  description: string | null;
  template_type: string;
  template_category: string | null;
  icon: string | null;
  thumbnail_url: string | null;
  content: any;
  framework: string | null;
  tags: string[] | null;
  is_featured: boolean;
  is_builtin: boolean;
  usage_count: number;
  rating_average: number | null;
  rating_count: number;
  version: string;
  created_at: string;
  updated_at: string;
}

interface TemplateGalleryProps {
  onSelectTemplate?: (template: Template) => void;
  onLoadTemplate?: (template: Template) => void;
  className?: string;
}

export function TemplateGallery({ 
  onSelectTemplate, 
  onLoadTemplate,
  className = '' 
}: TemplateGalleryProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [selectedType, selectedCategory, sortBy]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      params.append('sortBy', sortBy);
      params.append('order', 'desc');

      const response = await fetch(`/api/templates?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      template.display_name.toLowerCase().includes(query) ||
      template.description?.toLowerCase().includes(query) ||
      template.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const handleLoadTemplate = (template: Template) => {
    if (onLoadTemplate) {
      onLoadTemplate(template);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 ${className}`}>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Templates</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={fetchTemplates}>Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Template Gallery</h2>
            <p className="text-muted-foreground">
              Browse and load pre-built workflow templates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-accent' : ''}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-accent' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 bg-accent/50 rounded-lg">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                  <SelectItem value="prompt">Prompt</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="panel">Panel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="conversation">Conversation</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="automation">Automation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Newest First</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="usage">Most Used</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Type Tabs */}
      <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="workflow">Workflows</TabsTrigger>
          <TabsTrigger value="prompt">Prompts</TabsTrigger>
          <TabsTrigger value="agent">Agents</TabsTrigger>
          <TabsTrigger value="panel">Panels</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'} found
        </p>
      </div>

      {/* Template Grid/List */}
      {filteredTemplates.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        </Card>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="group hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleSelectTemplate(template)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {template.display_name}
                      {template.is_featured && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {template.description || 'No description available'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Metadata */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{template.template_type}</Badge>
                  {template.framework && (
                    <Badge variant="outline">{template.framework}</Badge>
                  )}
                  {template.is_builtin && <Badge variant="outline">Built-in</Badge>}
                </div>

                {/* Tags */}
                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{template.usage_count}</span>
                  </div>
                  {template.rating_average !== null && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      <span>
                        {template.rating_average.toFixed(1)} ({template.rating_count})
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>v{template.version}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectTemplate(template);
                  }}
                >
                  Preview
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadTemplate(template);
                  }}
                >
                  Load Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

