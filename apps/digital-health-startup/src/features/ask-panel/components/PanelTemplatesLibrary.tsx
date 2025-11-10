/**
 * Panel Templates Library
 *
 * Comprehensive library of preset panel templates with:
 * - Template browsing by category
 * - Panel type and management type filtering
 * - Template customization
 * - Duplication and AI-powered modification
 * - Favorite templates
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Copy,
  Star,
  Play,
  Sparkles,
  Search,
  Filter,
  Users,
  Bot,
  Zap,
  Clock,
  TrendingUp,
  ArrowRight,
  Edit,
  Eye,
  Bookmark,
  BookmarkCheck,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PanelTemplate, PanelType, ManagementType } from '@/types/panel.types';
import { usePanelTemplates, getPanelTemplatesAPI } from '@/services/panel-templates-api';
import { CleanTemplateCard } from './CleanTemplateCard';

// ============================================================================
// SAMPLE TEMPLATES DATA
// ============================================================================

const PRESET_TEMPLATES: PanelTemplate[] = [
  {
    id: 'fda-regulatory-strategy',
    name: 'FDA Regulatory Strategy Panel',
    description: 'Sequential moderated discussion for FDA submission pathways and regulatory decisions',
    category: 'Regulatory Affairs',
    panelType: 'structured',
    managementType: 'ai_only',
    facilitationPattern: 'sequential',
    suggestedAgents: [
      'FDA Regulatory Strategist',
      'Clinical Development Expert',
      'Regulatory CMC Expert',
      'Quality/Compliance Expert',
      'Reimbursement Specialist',
    ],
    minExperts: 3,
    maxExperts: 7,
    optimalExperts: 5,
    durationMin: 10,
    durationTypical: 15,
    durationMax: 30,
    maxRounds: 3,
    requiresModerator: true,
    parallelExecution: false,
    enableConsensus: true,
    useCases: [
      '510(k) vs PMA pathway selection',
      'Breakthrough Therapy Designation',
      'FDA meeting preparation',
      'Compliance verification',
    ],
    exampleScenarios: [
      {
        scenario: 'FDA 510(k) vs PMA Pathway Selection',
        context: 'Novel cardiac monitoring device with AI algorithms',
        expectedOutcome: 'Clear recommendation with regulatory precedents and risk assessment',
        duration: 15,
      },
    ],
    tags: ['regulatory', 'fda', 'structured', 'medical-affairs'],
    usageCount: 245,
    avgRating: 4.8,
    isPreset: true,
  },
  {
    id: 'innovation-brainstorming',
    name: 'Innovation Brainstorming Panel',
    description: 'Free-flowing parallel exploration for creative problem-solving and innovation',
    category: 'Innovation & Strategy',
    panelType: 'open',
    managementType: 'ai_only',
    facilitationPattern: 'parallel',
    suggestedAgents: [
      'Digital Health Innovator',
      'Patient Experience Designer',
      'Behavioral Scientist',
      'Mobile Health Expert',
      'Data Analytics Lead',
      'Medical Education Designer',
    ],
    minExperts: 5,
    maxExperts: 8,
    optimalExperts: 6,
    durationMin: 5,
    durationTypical: 10,
    durationMax: 20,
    maxRounds: 0,
    requiresModerator: false,
    parallelExecution: true,
    enableConsensus: false,
    useCases: [
      'Patient support program innovation',
      'Digital biomarker development',
      'Medical education platform design',
    ],
    tags: ['innovation', 'brainstorming', 'open', 'creative'],
    usageCount: 189,
    avgRating: 4.6,
    isPreset: true,
  },
  {
    id: 'clinical-trial-failure-analysis',
    name: 'Clinical Trial Failure Analysis',
    description: 'Deep analysis through systematic questioning to understand trial failures',
    category: 'Clinical Development',
    panelType: 'socratic',
    managementType: 'human_moderated',
    facilitationPattern: 'round_robin',
    suggestedAgents: [
      'Clinical Development Leader',
      'Biostatistician',
      'Medical Monitor',
      'Regulatory Scientist',
    ],
    minExperts: 3,
    maxExperts: 4,
    optimalExperts: 4,
    durationMin: 15,
    durationTypical: 20,
    durationMax: 30,
    maxRounds: 5,
    requiresModerator: true,
    parallelExecution: false,
    enableConsensus: true,
    useCases: [
      'Phase 3 endpoint failure',
      'Enrollment challenges',
      'Protocol deviation analysis',
    ],
    tags: ['analysis', 'socratic', 'clinical-trials', 'investigation'],
    usageCount: 134,
    avgRating: 4.9,
    isPreset: true,
  },
  {
    id: 'go-no-go-decision',
    name: 'Go/No-Go Decision Panel',
    description: 'Structured debate format with pro/con sides for critical investment decisions',
    category: 'Strategic Planning',
    panelType: 'adversarial',
    managementType: 'human_moderated',
    facilitationPattern: 'sequential',
    suggestedAgents: [
      'Commercial Strategy Lead',
      'Chief Medical Officer',
      'Regulatory Affairs Director',
      'Financial Analyst',
      'Market Access Director',
      'Legal Counsel',
    ],
    minExperts: 4,
    maxExperts: 8,
    optimalExperts: 6,
    durationMin: 10,
    durationTypical: 15,
    durationMax: 30,
    maxRounds: 4,
    requiresModerator: true,
    parallelExecution: false,
    enableConsensus: true,
    useCases: [
      'Label expansion decisions',
      'Pipeline prioritization',
      'Investment decisions',
    ],
    tags: ['decision', 'adversarial', 'debate', 'strategic'],
    usageCount: 198,
    avgRating: 4.7,
    isPreset: true,
  },
  {
    id: 'treatment-guideline-consensus',
    name: 'Treatment Guideline Consensus',
    description: 'Anonymous multi-round consensus building for clinical guidelines',
    category: 'Medical Affairs',
    panelType: 'delphi',
    managementType: 'ai_only',
    facilitationPattern: 'consensus_driven',
    suggestedAgents: [
      'Disease Expert 1',
      'Disease Expert 2',
      'Disease Expert 3',
      'Clinical Researcher',
      'Patient Advocate',
      'Health Economist',
      'Regulatory Expert',
      'Payer Representative',
    ],
    minExperts: 5,
    maxExperts: 12,
    optimalExperts: 8,
    durationMin: 15,
    durationTypical: 20,
    durationMax: 25,
    maxRounds: 3,
    requiresModerator: false,
    parallelExecution: true,
    enableConsensus: true,
    useCases: [
      'Rare disease management guidelines',
      'Treatment algorithms',
      'Best practice development',
    ],
    tags: ['consensus', 'delphi', 'guidelines', 'medical-affairs'],
    usageCount: 167,
    avgRating: 4.8,
    isPreset: true,
  },
  {
    id: 'ma-due-diligence',
    name: 'M&A Due Diligence Panel',
    description: 'Combined human-AI panel for critical asset evaluation',
    category: 'Business Development',
    panelType: 'hybrid',
    managementType: 'human_expert',
    facilitationPattern: 'sequential',
    suggestedAgents: [
      'Clinical Trial Analyzer (AI)',
      'Regulatory Intelligence (AI)',
      'Market Landscape Scanner (AI)',
      'Patent Analyzer (AI)',
      'Chief Medical Officer',
      'BD Director',
      'Regulatory Head',
    ],
    minExperts: 3,
    maxExperts: 8,
    optimalExperts: 5,
    durationMin: 30,
    durationTypical: 45,
    durationMax: 60,
    maxRounds: 4,
    requiresModerator: true,
    parallelExecution: false,
    enableConsensus: true,
    useCases: [
      'Pipeline acquisition',
      'Asset valuation',
      'Clinical program assessment',
    ],
    tags: ['hybrid', 'ma', 'bd', 'strategic'],
    usageCount: 89,
    avgRating: 4.9,
    isPreset: true,
  },
];

// ============================================================================
// COMPONENTS
// ============================================================================

interface TemplateCardProps {
  template: PanelTemplate;
  onRun: (template: PanelTemplate) => void;
  onCustomize: (template: PanelTemplate) => void;
  onDuplicate: (template: PanelTemplate) => void;
  onViewDetails: (template: PanelTemplate) => void;
  onToggleFavorite: (templateId: string) => void;
}

function TemplateCard({
  template,
  onRun,
  onCustomize,
  onDuplicate,
  onViewDetails,
  onToggleFavorite,
}: TemplateCardProps) {
  const panelTypeColors: Record<PanelType, string> = {
    structured: 'blue',
    open: 'purple',
    socratic: 'amber',
    adversarial: 'red',
    delphi: 'green',
    hybrid: 'violet',
  };

  const color = panelTypeColors[template.panelType];

  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <CardHeader>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              {template.isPreset && (
                <Badge variant="secondary" className="text-xs">
                  Preset
                </Badge>
              )}
            </div>
            <CardDescription className="text-sm line-clamp-2">
              {template.description}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(template.id);
            }}
          >
            {template.isFavorite ? (
              <BookmarkCheck className="w-4 h-4 text-yellow-500" />
            ) : (
              <Bookmark className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="outline" className={`text-xs text-${color}-600 border-${color}-300`}>
            {template.panelType}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {template.managementType.replace(/_/g, ' ')}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Bot className="w-3 h-3 mr-1" />
            {template.optimalExperts} experts
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {template.durationTypical}min
          </Badge>
        </div>

        {/* Category & Rating */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{template.category}</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{template.avgRating}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{template.usageCount}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Use Cases */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase">
            Use Cases
          </h4>
          <div className="space-y-1">
            {template.useCases.slice(0, 2).map((useCase, idx) => (
              <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1.5">
                <div className={`w-1 h-1 rounded-full bg-${color}-500`} />
                {useCase}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(template);
            }}
          >
            <Eye className="w-3 h-3 mr-1" />
            Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(template);
            }}
          >
            <Copy className="w-3 h-3 mr-1" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCustomize(template);
            }}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Customize
          </Button>
          <Button
            size="sm"
            className={`bg-gradient-to-r from-${color}-500 to-${color}-600 hover:opacity-90`}
            onClick={(e) => {
              e.stopPropagation();
              onRun(template);
            }}
          >
            <Play className="w-3 h-3 mr-1" />
            Run
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Template Details Dialog
interface TemplateDetailsDialogProps {
  template: PanelTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRun: (template: PanelTemplate) => void;
  onCustomize: (template: PanelTemplate) => void;
}

function TemplateDetailsDialog({
  template,
  open,
  onOpenChange,
  onRun,
  onCustomize,
}: TemplateDetailsDialogProps) {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{template.name}</DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{template.category}</Badge>
            <Badge variant="outline" className="capitalize">
              {template.panelType}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {template.managementType.replace(/_/g, ' ')}
            </Badge>
            <Badge variant="outline">
              <Users className="w-3 h-3 mr-1" />
              {template.minExperts}-{template.maxExperts} experts
            </Badge>
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              {template.durationMin}-{template.durationMax} min
            </Badge>
          </div>

          {/* Suggested Agents */}
          <div>
            <h3 className="font-semibold mb-3">Suggested Agents</h3>
            <div className="grid grid-cols-2 gap-2">
              {template.suggestedAgents.map((agent, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted text-sm">
                  <Bot className="w-4 h-4 text-purple-500" />
                  {agent}
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <h3 className="font-semibold mb-3">Core Use Cases</h3>
            <ul className="space-y-2">
              {template.useCases.map((useCase, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                  {useCase}
                </li>
              ))}
            </ul>
          </div>

          {/* Example Scenarios */}
          {template.exampleScenarios && template.exampleScenarios.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Example Scenarios</h3>
              <div className="space-y-3">
                {template.exampleScenarios.map((scenario, idx) => (
                  <Card key={idx} className="bg-muted/50">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">{scenario.scenario}</h4>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-muted-foreground">Context:</span> {scenario.context}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Expected Outcome:</span>{' '}
                          {scenario.expectedOutcome}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span> {scenario.duration}{' '}
                          minutes
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Configuration */}
          <div>
            <h3 className="font-semibold mb-3">Configuration</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xs text-muted-foreground mb-1">Facilitation</div>
                <div className="font-medium capitalize">{template.facilitationPattern.replace(/_/g, ' ')}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xs text-muted-foreground mb-1">Rounds</div>
                <div className="font-medium">{template.maxRounds || 'Continuous'}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xs text-muted-foreground mb-1">Moderator</div>
                <div className="font-medium">{template.requiresModerator ? 'Required' : 'Not Required'}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xs text-muted-foreground mb-1">Execution</div>
                <div className="font-medium">{template.parallelExecution ? 'Parallel' : 'Sequential'}</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              <CardContent className="p-3 text-center">
                <Star className="w-6 h-6 mx-auto mb-1" />
                <div className="text-2xl font-bold">{template.avgRating}</div>
                <div className="text-xs opacity-90">Average Rating</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CardContent className="p-3 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-1" />
                <div className="text-2xl font-bold">{template.usageCount}</div>
                <div className="text-xs opacity-90">Times Used</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onCustomize(template);
              onOpenChange(false);
            }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Customize
          </Button>
          <Button
            className="bg-gradient-to-r from-purple-500 to-pink-500"
            onClick={() => {
              onRun(template);
              onOpenChange(false);
            }}
          >
            <Play className="w-4 h-4 mr-2" />
            Run Panel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface PanelTemplatesLibraryProps {
  onRunTemplate: (template: PanelTemplate) => void;
  onCustomizeTemplate: (template: PanelTemplate) => void;
  onDuplicateTemplate: (template: PanelTemplate) => void;
}

export function PanelTemplatesLibrary({
  onRunTemplate,
  onCustomizeTemplate,
  onDuplicateTemplate,
}: PanelTemplatesLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPanelType, setSelectedPanelType] = useState<string>('all');
  const [selectedManagementType, setSelectedManagementType] = useState<string>('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PanelTemplate | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<string[]>(['all']);

  // Fetch templates from API
  const { templates: apiTemplates, loading, error } = usePanelTemplates();

  // Merge with PRESET_TEMPLATES if API fails
  const allTemplates = useMemo(() => {
    if (apiTemplates.length > 0) {
      return apiTemplates;
    }
    return PRESET_TEMPLATES;
  }, [apiTemplates]);

  // Get unique categories
  useEffect(() => {
    const uniqueCategories = Array.from(new Set(allTemplates.map((t) => t.category)));
    setCategories(['all', ...uniqueCategories.sort()]);
  }, [allTemplates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((template) => {
      const matchesSearch =
        searchQuery === '' ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesPanelType = selectedPanelType === 'all' || template.panelType === selectedPanelType;
      const matchesManagementType =
        selectedManagementType === 'all' || template.managementType === selectedManagementType;
      const matchesFavorites = !showOnlyFavorites || favoriteIds.has(template.id);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPanelType &&
        matchesManagementType &&
        matchesFavorites
      );
    }).map((template) => ({
      ...template,
      isFavorite: favoriteIds.has(template.id),
    }));
  }, [allTemplates, searchQuery, selectedCategory, selectedPanelType, selectedManagementType, showOnlyFavorites, favoriteIds]);

  const handleToggleFavorite = (templateId: string) => {
    setFavoriteIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(templateId)) {
        newSet.delete(templateId);
      } else {
        newSet.add(templateId);
      }
      return newSet;
    });
  };

  const handleViewDetails = (template: PanelTemplate) => {
    setSelectedTemplate(template);
    setShowDetails(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Panel Templates Library</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Browse our curated collection of expert panel templates. Each template is pre-configured
          with optimal settings, expert selections, and proven use cases.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPanelType} onValueChange={setSelectedPanelType}>
                <SelectTrigger>
                  <SelectValue placeholder="Panel Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Panel Types</SelectItem>
                  <SelectItem value="structured">Structured</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="socratic">Socratic</SelectItem>
                  <SelectItem value="adversarial">Adversarial</SelectItem>
                  <SelectItem value="delphi">Delphi</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedManagementType} onValueChange={setSelectedManagementType}>
                <SelectTrigger>
                  <SelectValue placeholder="Management Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Management Types</SelectItem>
                  <SelectItem value="ai_only">AI Only</SelectItem>
                  <SelectItem value="human_moderated">Human Moderated</SelectItem>
                  <SelectItem value="hybrid_facilitated">Hybrid Facilitated</SelectItem>
                  <SelectItem value="human_expert">Human Expert</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showOnlyFavorites ? 'default' : 'outline'}
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className="w-full"
              >
                <Star className="w-4 h-4 mr-2" />
                Favorites Only
              </Button>
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading templates...
                </div>
              ) : (
                <>Showing {filteredTemplates.length} of {allTemplates.length} templates</>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading panel templates...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-12 text-center">
            <p className="text-red-600 mb-2">Error loading templates</p>
            <p className="text-sm text-red-500">{error.message}</p>
            <p className="text-xs text-muted-foreground mt-2">Showing preset templates instead</p>
          </CardContent>
        </Card>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <CleanTemplateCard
              key={template.id}
              template={template}
              onRun={onRunTemplate}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No templates found matching your filters. Try adjusting your search criteria.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Template Details Dialog */}
      <TemplateDetailsDialog
        template={selectedTemplate}
        open={showDetails}
        onOpenChange={setShowDetails}
        onRun={onRunTemplate}
        onCustomize={onCustomizeTemplate}
      />
    </div>
  );
}

export { PRESET_TEMPLATES };
export type { PanelTemplate };
