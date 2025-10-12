'use client';

import {
  Search,
  Plus,
  Copy,
  Edit,
  Clock,
  Users,
  Star,
  Download,
  Upload,
  MoreVertical,
  Bookmark,
  Eye,
  Share,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  agent_type?: string;
  use_case: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_time_minutes: number;
  popularity_score: number;
  usage_count: number;
  rating: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  is_public: boolean;
  variables?: string[];
}

const categories = [
  'All Categories',
  'Regulatory',
  'Clinical',
  'Compliance',
  'Quality',
  'Research',
  'Documentation',
  'Analysis',
  'Strategy',
  'Communication',
];

const useCases = [
  'All Use Cases',
  '510k Preparation',
  'Clinical Protocol',
  'Risk Assessment',
  'Regulatory Strategy',
  'Data Analysis',
  'Report Generation',
  'Compliance Review',
  'Documentation',
  'Communication',
];

// Mock prompts removed - will use real data from API
const mockPrompts: Prompt[] = [];

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'recent' | 'usage'>('popular');

  // Load prompts on component mount
  useEffect(() => {
    setPrompts(mockPrompts);
    setLoading(false);
  }, []);

  // Filter and sort prompts
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All Categories' || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.popularity_score - a.popularity_score;
      case 'rating':
        return b.rating - a.rating;
      case 'recent':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case 'usage':
        return b.usage_count - a.usage_count;
      default:
        return 0;
    }
  });

  const featuredPrompts = sortedPrompts.filter(prompt => prompt.is_featured);
  const regularPrompts = sortedPrompts.filter(prompt => !prompt.is_featured);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const PromptCard = ({ prompt, featured = false }: { prompt: Prompt; featured?: boolean }) => (
    <Card className={`cursor-pointer transition-all hover:shadow-lg ${featured ? 'border-blue-200 bg-blue-50/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-semibold">{prompt.title}</CardTitle>
              {featured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
            </div>
            <CardDescription className="text-sm text-muted-foreground">
              {prompt.description}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary">{prompt.category}</Badge>
          <Badge className={getDifficultyColor(prompt.difficulty_level)}>
            {prompt.difficulty_level}
          </Badge>
          {prompt.agent_type && (
            <Badge variant="outline" className="text-xs">
              {prompt.agent_type}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {prompt.estimated_time_minutes}m
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {prompt.usage_count}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {prompt.rating}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {prompt.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {prompt.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{prompt.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setSelectedPrompt(prompt)}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button variant="outline" size="sm">
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
          <Button variant="outline" size="sm">
            <Bookmark className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Prompt Library</h1>
            <p className="text-muted-foreground mt-2">
              Discover and use pre-built prompts for healthcare AI workflows
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prompt Library</h1>
          <p className="text-muted-foreground mt-2">
            Discover and use pre-built prompts for healthcare AI workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Prompt
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts, tags, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedUseCase} onValueChange={setSelectedUseCase}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Use Case" />
          </SelectTrigger>
          <SelectContent>
            {useCases.map(useCase => (
              <SelectItem key={useCase} value={useCase}>
                {useCase}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">Popularity</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="usage">Usage</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Featured Prompts */}
      {featuredPrompts.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Featured Prompts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredPrompts.map(prompt => (
              <PromptCard key={prompt.id} prompt={prompt} featured />
            ))}
          </div>
        </div>
      )}

      {/* All Prompts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            All Prompts ({regularPrompts.length})
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {regularPrompts.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </div>

      {/* Prompt Detail Dialog */}
      <Dialog open={!!selectedPrompt} onOpenChange={() => setSelectedPrompt(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedPrompt && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedPrompt.title}
                  {selectedPrompt.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                </DialogTitle>
                <DialogDescription>
                  {selectedPrompt.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{selectedPrompt.category}</Badge>
                  <Badge className={getDifficultyColor(selectedPrompt.difficulty_level)}>
                    {selectedPrompt.difficulty_level}
                  </Badge>
                  {selectedPrompt.agent_type && (
                    <Badge variant="outline">{selectedPrompt.agent_type}</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Estimated Time</Label>
                    <p className="font-medium">{selectedPrompt.estimated_time_minutes} minutes</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Usage Count</Label>
                    <p className="font-medium">{selectedPrompt.usage_count}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Rating</Label>
                    <p className="font-medium">{selectedPrompt.rating}/5.0</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Use Case</Label>
                    <p className="font-medium">{selectedPrompt.use_case}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPrompt.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedPrompt.variables && selectedPrompt.variables.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Variables</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedPrompt.variables.map(variable => (
                        <Badge key={variable} variant="secondary" className="text-xs">
                          {`{${variable}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-muted-foreground">Prompt Content</Label>
                  <ScrollArea className="h-60 w-full border rounded-md p-4 mt-1">
                    <pre className="whitespace-pre-wrap text-sm">
                      {selectedPrompt.content}
                    </pre>
                  </ScrollArea>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Prompt
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Prompt Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Prompt</DialogTitle>
            <DialogDescription>
              Create a new prompt template for healthcare AI workflows
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Enter prompt title" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Brief description of the prompt" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="useCase">Use Case</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select use case" />
                  </SelectTrigger>
                  <SelectContent>
                    {useCases.slice(1).map(useCase => (
                      <SelectItem key={useCase} value={useCase}>
                        {useCase}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="content">Prompt Content</Label>
              <Textarea
                id="content"
                placeholder="Enter the prompt content..."
                className="min-h-[200px]"
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" placeholder="tag1, tag2, tag3" />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">
                Create Prompt
              </Button>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}