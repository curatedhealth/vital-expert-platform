/**
 * Workflow Marketplace Component
 * Browse, search, and discover published workflows
 * 
 * Features:
 * - Browse published workflows
 * - Search and filtering
 * - Rating and favorites
 * - Clone workflow
 * - View workflow details
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Grid, 
  List, 
  Star, 
  Clock, 
  TrendingUp, 
  Filter, 
  X, 
  Heart, 
  Copy, 
  Eye,
  Download
} from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface WorkflowLibraryItem {
  id: string;
  workflow_id: string;
  library_name: string;
  library_slug: string;
  display_name: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  thumbnail_url: string | null;
  author_name: string | null;
  author_avatar: string | null;
  tags: string[] | null;
  is_featured: boolean;
  is_verified: boolean;
  is_public: boolean;
  view_count: number;
  clone_count: number;
  favorite_count: number;
  rating_average: number | null;
  rating_count: number;
  version: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

interface WorkflowMarketplaceProps {
  onCloneWorkflow?: (workflow: WorkflowLibraryItem) => void;
  onViewWorkflow?: (workflow: WorkflowLibraryItem) => void;
  onFavoriteWorkflow?: (workflowId: string, isFavorited: boolean) => void;
  className?: string;
}

export function WorkflowMarketplace({ 
  onCloneWorkflow, 
  onViewWorkflow,
  onFavoriteWorkflow,
  className = '' 
}: WorkflowMarketplaceProps) {
  const [workflows, setWorkflows] = useState<WorkflowLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchWorkflows();
  }, [selectedCategory, sortBy]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      params.append('sortBy', sortBy);
      params.append('order', 'desc');
      params.append('featured', 'true');

      const response = await fetch(`/api/workflows/library?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workflows');
      }

      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      workflow.display_name.toLowerCase().includes(query) ||
      workflow.description?.toLowerCase().includes(query) ||
      workflow.tags?.some(tag => tag.toLowerCase().includes(query)) ||
      workflow.author_name?.toLowerCase().includes(query)
    );
  });

  const handleCloneWorkflow = async (workflow: WorkflowLibraryItem) => {
    if (onCloneWorkflow) {
      onCloneWorkflow(workflow);
    }
  };

  const handleViewWorkflow = (workflow: WorkflowLibraryItem) => {
    if (onViewWorkflow) {
      onViewWorkflow(workflow);
    }
  };

  const handleToggleFavorite = async (workflowId: string) => {
    const isFavorited = favorites.has(workflowId);
    
    // Optimistic update
    const newFavorites = new Set(favorites);
    if (isFavorited) {
      newFavorites.delete(workflowId);
    } else {
      newFavorites.add(workflowId);
    }
    setFavorites(newFavorites);

    if (onFavoriteWorkflow) {
      onFavoriteWorkflow(workflowId, !isFavorited);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workflows...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 ${className}`}>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Workflows</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={fetchWorkflows}>Try Again</Button>
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
            <h2 className="text-3xl font-bold tracking-tight">Workflow Marketplace</h2>
            <p className="text-muted-foreground">
              Discover and clone community-created workflows
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
            placeholder="Search workflows by name, description, tags, or author..."
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
                  <SelectItem value="expert_consultation">Expert Consultation</SelectItem>
                  <SelectItem value="panel_discussion">Panel Discussion</SelectItem>
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
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="clone_count">Most Cloned</SelectItem>
                  <SelectItem value="favorite_count">Most Favorited</SelectItem>
                  <SelectItem value="view_count">Most Viewed</SelectItem>
                  <SelectItem value="published_at">Recently Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Featured/All Tabs */}
      <Tabs defaultValue="featured" className="w-full">
        <TabsList>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="all">All Workflows</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredWorkflows.length} {filteredWorkflows.length === 1 ? 'workflow' : 'workflows'} found
        </p>
      </div>

      {/* Workflow Grid/List */}
      {filteredWorkflows.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workflows found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters, or check back later for new workflows
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
          {filteredWorkflows.map((workflow) => (
            <Card
              key={workflow.id}
              className="group hover:shadow-lg transition-shadow cursor-pointer relative"
              onClick={() => handleViewWorkflow(workflow)}
            >
              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(workflow.workflow_id);
                }}
              >
                <Heart
                  className={`h-4 w-4 ${
                    favorites.has(workflow.workflow_id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-muted-foreground'
                  }`}
                />
              </Button>

              <CardHeader>
                <div className="flex items-start justify-between pr-8">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {workflow.display_name}
                      {workflow.is_featured && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                      {workflow.is_verified && (
                        <Badge variant="default" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {workflow.description || 'No description available'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Author Info */}
                {workflow.author_name && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={workflow.author_avatar || undefined} />
                      <AvatarFallback>
                        {workflow.author_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      by {workflow.author_name}
                    </span>
                  </div>
                )}

                {/* Category Badge */}
                {workflow.category && (
                  <div>
                    <Badge variant="secondary">{workflow.category}</Badge>
                  </div>
                )}

                {/* Tags */}
                {workflow.tags && workflow.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {workflow.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {workflow.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{workflow.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{workflow.view_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Copy className="h-3 w-3" />
                    <span>{workflow.clone_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{workflow.favorite_count}</span>
                  </div>
                  {workflow.rating_average !== null && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>
                        {workflow.rating_average.toFixed(1)} ({workflow.rating_count})
                      </span>
                    </div>
                  )}
                </div>

                {/* Version & Date */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>v{workflow.version}</span>
                  </div>
                  <span>
                    Published {new Date(workflow.published_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewWorkflow(workflow);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloneWorkflow(workflow);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Clone
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

