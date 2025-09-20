'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Filter,
  Plus,
  Copy,
  Edit,
  Trash2,
  FileText,
  Target,
  Clock,
  Users,
  Star,
  Download,
  Upload,
  MoreVertical,
  ChevronDown,
  Tag,
  Bookmark,
  Eye,
  ThumbsUp,
  Share,
} from 'lucide-react';

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

const mockPrompts: Prompt[] = [
  {
    id: '1',
    title: 'FDA 510(k) Predicate Analysis',
    description: 'Generate comprehensive predicate device analysis for FDA 510(k) submissions',
    content: `Analyze the following medical device for FDA 510(k) submission:

Device: {device_name}
Intended Use: {intended_use}
Technology: {technology_description}

Please provide:
1. Predicate device identification and comparison
2. Substantial equivalence assessment
3. Safety and effectiveness comparison
4. Regulatory pathway recommendations
5. Potential risks and mitigation strategies

Format the response as a structured regulatory document suitable for FDA submission.`,
    category: 'Regulatory',
    tags: ['FDA', '510k', 'predicate', 'medical-device', 'regulatory'],
    agent_type: 'FDA Regulatory Strategist',
    use_case: '510k Preparation',
    difficulty_level: 'advanced',
    estimated_time_minutes: 25,
    popularity_score: 95,
    usage_count: 147,
    rating: 4.8,
    created_by: 'system',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-03-10T15:30:00Z',
    is_featured: true,
    is_public: true,
    variables: ['device_name', 'intended_use', 'technology_description'],
  },
  {
    id: '2',
    title: 'Clinical Trial Protocol Design',
    description: 'Create comprehensive clinical trial protocols with statistical analysis plans',
    content: `Design a clinical trial protocol for:

Study Title: {study_title}
Primary Endpoint: {primary_endpoint}
Population: {target_population}
Sample Size: {estimated_sample_size}

Include:
1. Study objectives and hypotheses
2. Study design and methodology
3. Inclusion/exclusion criteria
4. Statistical analysis plan
5. Safety monitoring procedures
6. Data collection timeline
7. Regulatory considerations

Ensure compliance with ICH-GCP guidelines.`,
    category: 'Clinical',
    tags: ['clinical-trial', 'protocol', 'statistics', 'GCP', 'design'],
    agent_type: 'Clinical Trial Designer',
    use_case: 'Clinical Protocol',
    difficulty_level: 'advanced',
    estimated_time_minutes: 35,
    popularity_score: 88,
    usage_count: 89,
    rating: 4.7,
    created_by: 'system',
    created_at: '2024-02-01T14:20:00Z',
    updated_at: '2024-03-15T09:45:00Z',
    is_featured: true,
    is_public: true,
    variables: ['study_title', 'primary_endpoint', 'target_population', 'estimated_sample_size'],
  },
  {
    id: '3',
    title: 'HIPAA Risk Assessment Template',
    description: 'Comprehensive HIPAA compliance risk assessment for healthcare organizations',
    content: `Conduct a HIPAA risk assessment for:

Organization: {organization_name}
Type: {organization_type}
PHI Types: {phi_types_handled}
Systems: {systems_involved}

Assessment Areas:
1. Administrative Safeguards
2. Physical Safeguards
3. Technical Safeguards
4. Risk Analysis and Management
5. Assigned Security Responsibilities
6. Workforce Training
7. Access Management
8. Audit Controls

Provide risk levels, compliance gaps, and remediation recommendations.`,
    category: 'Compliance',
    tags: ['HIPAA', 'privacy', 'security', 'risk-assessment', 'compliance'],
    agent_type: 'HIPAA Compliance Officer',
    use_case: 'Risk Assessment',
    difficulty_level: 'intermediate',
    estimated_time_minutes: 20,
    popularity_score: 82,
    usage_count: 156,
    rating: 4.6,
    created_by: 'system',
    created_at: '2024-01-20T11:15:00Z',
    updated_at: '2024-03-08T16:20:00Z',
    is_featured: false,
    is_public: true,
    variables: ['organization_name', 'organization_type', 'phi_types_handled', 'systems_involved'],
  },
  {
    id: '4',
    title: 'Reimbursement Strategy Development',
    description: 'Create comprehensive reimbursement and market access strategies',
    content: `Develop reimbursement strategy for:

Product: {product_name}
Indication: {indication}
Target Market: {target_market}
Comparators: {existing_treatments}

Strategy Components:
1. Health economic value proposition
2. Payer landscape analysis
3. Coverage and coding strategy
4. Evidence generation plan
5. Value-based contracting opportunities
6. Market access timeline
7. Risk mitigation strategies

Include budget impact modeling framework.`,
    category: 'Strategy',
    tags: ['reimbursement', 'market-access', 'health-economics', 'payer', 'strategy'],
    agent_type: 'Reimbursement Strategist',
    use_case: 'Regulatory Strategy',
    difficulty_level: 'advanced',
    estimated_time_minutes: 30,
    popularity_score: 75,
    usage_count: 63,
    rating: 4.5,
    created_by: 'system',
    created_at: '2024-02-10T08:30:00Z',
    updated_at: '2024-03-12T13:10:00Z',
    is_featured: false,
    is_public: true,
    variables: ['product_name', 'indication', 'target_market', 'existing_treatments'],
  },
  {
    id: '5',
    title: 'Quality Management System Audit',
    description: 'ISO 13485 QMS audit checklist and assessment framework',
    content: `Conduct QMS audit for:

Organization: {company_name}
Scope: {audit_scope}
Standards: {applicable_standards}
Previous Audit Date: {last_audit_date}

Audit Areas:
1. Management Responsibility
2. Resource Management
3. Product Realization
4. Measurement and Improvement
5. Design Controls
6. Risk Management
7. Post-Market Surveillance
8. Management Review

Provide findings, non-conformities, and CAPA recommendations.`,
    category: 'Quality',
    tags: ['QMS', 'ISO-13485', 'audit', 'quality', 'compliance'],
    agent_type: 'QMS Architect',
    use_case: 'Compliance Review',
    difficulty_level: 'intermediate',
    estimated_time_minutes: 40,
    popularity_score: 70,
    usage_count: 92,
    rating: 4.4,
    created_by: 'system',
    created_at: '2024-01-25T12:45:00Z',
    updated_at: '2024-03-05T14:25:00Z',
    is_featured: false,
    is_public: true,
    variables: ['company_name', 'audit_scope', 'applicable_standards', 'last_audit_date'],
  },
  {
    id: '6',
    title: 'Medical Device Labeling Review',
    description: 'Comprehensive medical device labeling review for regulatory compliance',
    content: `Review medical device labeling for:

Device: {device_name}
Classification: {device_class}
Intended Use: {intended_use}
Market: {target_markets}

Review Elements:
1. Indications for Use
2. Contraindications
3. Warnings and Precautions
4. Instructions for Use
5. Device Description
6. Clinical Data Summary
7. Storage and Handling
8. Compatibility Information

Ensure compliance with FDA, EU MDR, and international requirements.`,
    category: 'Documentation',
    tags: ['labeling', 'IFU', 'medical-device', 'regulatory', 'compliance'],
    agent_type: 'Medical Writer',
    use_case: 'Documentation',
    difficulty_level: 'intermediate',
    estimated_time_minutes: 25,
    popularity_score: 68,
    usage_count: 78,
    rating: 4.3,
    created_by: 'system',
    created_at: '2024-02-05T09:20:00Z',
    updated_at: '2024-03-18T11:40:00Z',
    is_featured: false,
    is_public: true,
    variables: ['device_name', 'device_class', 'intended_use', 'target_markets'],
  },
];

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedUseCase, setSelectedUseCase] = useState('All Use Cases');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    // Load data immediately
    setPrompts(mockPrompts);
    setLoading(false);
  }, []);

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All Categories' || prompt.category === selectedCategory;
    const matchesUseCase = selectedUseCase === 'All Use Cases' || prompt.use_case === selectedUseCase;

    return matchesSearch && matchesCategory && matchesUseCase;
  });

  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
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