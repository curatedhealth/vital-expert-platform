'use client';

import { 
  Copy, 
  Star, 
  Eye, 
  Search,
  Landmark,
  Microscope,
  Shield,
  Gem,
  Network,
  BarChart3,
  PenTool,
  Radar,
  ClipboardList,
  Zap,
  ChevronRight,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@vital/ui';
import { Input } from '@vital/ui';
import { useToast } from '@vital/ui';

interface Prompt {
  id: string;
  prompt_code?: string;
  name: string;
  display_name: string;
  title?: string;
  description: string;
  content: string;
  system_prompt?: string;
  user_template?: string;
  category?: string;
  function?: string;
  task_type?: string;
  complexity?: string;
  tags?: string[];
  variables?: string[];
  estimated_time_minutes?: number;
  usage_count?: number;
  expert_validated?: boolean;
  version?: string;
  rag_enabled?: boolean;
  suite?: string;
  suite_id?: string;
  suite_name?: string;
  suite_full_name?: string;
  suite_icon?: string;
  suite_color?: string;
  sub_suite?: string;
  sub_suite_id?: string;
  sub_suite_name?: string;
  sort_order?: number;
  is_favorite?: boolean;
}

interface Suite {
  id: string;
  code: string;
  name: string;
  fullName: string;
  description: string;
  icon: string;
  color: string;
  promptCount: number;
  sortOrder: number;
}

interface SubSuite {
  id: string;
  suiteId: string;
  code: string;
  name: string;
  fullName: string;
  description: string;
  promptCount: number;
  sortOrder: number;
}

interface SuiteConfig {
  name: string;
  code: string;
  description: string;
  color: string;
  Icon: LucideIcon;
}

// Default PRISM suites configuration (used when DB suites aren't available)
const DEFAULT_PRISM_SUITES: SuiteConfig[] = [
  { code: 'RULES', name: 'RULES™', description: 'Regulatory Excellence', color: 'bg-blue-500', Icon: Landmark },
  { code: 'TRIALS', name: 'TRIALS™', description: 'Clinical Development', color: 'bg-violet-500', Icon: Microscope },
  { code: 'GUARD', name: 'GUARD™', description: 'Safety Framework', color: 'bg-red-500', Icon: Shield },
  { code: 'VALUE', name: 'VALUE™', description: 'Market Access', color: 'bg-emerald-500', Icon: Gem },
  { code: 'BRIDGE', name: 'BRIDGE™', description: 'Stakeholder Engagement', color: 'bg-orange-500', Icon: Network },
  { code: 'PROOF', name: 'PROOF™', description: 'Evidence Analytics', color: 'bg-cyan-500', Icon: BarChart3 },
  { code: 'CRAFT', name: 'CRAFT™', description: 'Medical Writing', color: 'bg-purple-500', Icon: PenTool },
  { code: 'SCOUT', name: 'SCOUT™', description: 'Competitive Intelligence', color: 'bg-lime-500', Icon: Radar },
  { code: 'PROJECT', name: 'PROJECT™', description: 'Project Management', color: 'bg-indigo-500', Icon: ClipboardList },
  { code: 'FORGE', name: 'FORGE™', description: 'Digital Health', color: 'bg-amber-500', Icon: Zap }
];

// Map suite codes to icons
const SUITE_ICONS: Record<string, LucideIcon> = {
  'RULES': Landmark,
  'TRIALS': Microscope,
  'GUARD': Shield,
  'VALUE': Gem,
  'BRIDGE': Network,
  'PROOF': BarChart3,
  'CRAFT': PenTool,
  'SCOUT': Radar,
  'PROJECT': ClipboardList,
  'FORGE': Zap
};

// Map suite codes to colors
const SUITE_COLORS: Record<string, string> = {
  'RULES': 'bg-blue-500',
  'TRIALS': 'bg-violet-500',
  'GUARD': 'bg-red-500',
  'VALUE': 'bg-emerald-500',
  'BRIDGE': 'bg-orange-500',
  'PROOF': 'bg-cyan-500',
  'CRAFT': 'bg-purple-500',
  'SCOUT': 'bg-lime-500',
  'PROJECT': 'bg-indigo-500',
  'FORGE': 'bg-amber-500'
};

type PromptTypeFilter = 'all' | 'detailed' | 'starter';

export default function PromptLibrary() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [suites, setSuites] = useState<Suite[]>([]);
  const [subSuites, setSubSuites] = useState<SubSuite[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('');
  const [activeSubSuite, setActiveSubSuite] = useState<string | null>(null);
  const [promptTypeFilter, setPromptTypeFilter] = useState<PromptTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [dataSource, setDataSource] = useState<string>('');
  const { toast } = useToast();

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      
      // First try the new PRISM API
      const response = await fetch('/api/prism');
      
      if (!response.ok) {
        throw new Error('Failed to fetch from PRISM API');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Use data from PRISM API
        if (data.suites && data.suites.length > 0) {
          setSuites(data.suites);
          setActiveTab(data.suites[0]?.name || 'RULES™');
        } else {
          // Use default suites if none in DB
          const defaultSuites = DEFAULT_PRISM_SUITES.map((s, idx) => ({
            id: s.code,
            code: s.code,
            name: s.name,
            fullName: s.description,
            description: s.description,
            icon: '',
            color: s.color,
            promptCount: 0,
            sortOrder: idx
          }));
          setSuites(defaultSuites);
          setActiveTab('RULES™');
        }
        
        setSubSuites(data.subSuites || []);
        setPrompts(data.prompts || []);
        setDataSource(data.source || 'api');
        
        if (data.message) {
          console.log('PRISM API message:', data.message);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch prompts');
      }
    } catch (error) {
      console.error('Error fetching from PRISM API, falling back to prompts-crud:', error);
      
      // Fallback to old API
      try {
        const fallbackResponse = await fetch('/api/prompts-crud?showAll=true');
        if (!fallbackResponse.ok) throw new Error('Fallback API failed');
        
        const fallbackData = await fallbackResponse.json();
        const promptsArray = Array.isArray(fallbackData) ? fallbackData : 
                           (fallbackData.prompts || []);
        
        setPrompts(promptsArray);
        
        // Use default suites
        const defaultSuites = DEFAULT_PRISM_SUITES.map((s, idx) => ({
          id: s.code,
          code: s.code,
          name: s.name,
          fullName: s.description,
          description: s.description,
          icon: '',
          color: s.color,
          promptCount: promptsArray.filter((p: Prompt) => p.suite === s.name).length,
          sortOrder: idx
        }));
        setSuites(defaultSuites);
        setActiveTab('RULES™');
        setDataSource('fallback');
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
        setPrompts([]);
        toast({
          title: "Error",
          description: "Failed to load prompts",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyPrompt = async (prompt: Prompt) => {
    try {
      const textToCopy = prompt.content || prompt.system_prompt || '';
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy prompt",
        variant: "destructive",
      });
    }
  };

  // Get prompts for the active suite
  const getPromptsForSuite = (suiteName: string) => {
    if (!Array.isArray(prompts)) return [];
    return prompts.filter(prompt => prompt.suite === suiteName);
  };

  // Get sub-suites for the active suite
  const getSubSuitesForSuite = (suiteName: string) => {
    const suite = suites.find(s => s.name === suiteName);
    if (!suite) return [];
    // Match by suiteId (UUID) to the suite's id
    return subSuites.filter(ss => ss.suiteId === suite.id);
  };

  // Debug: log sub-suites for active tab
  useEffect(() => {
    const suite = suites.find(s => s.name === activeTab);
    if (suite) {
      const matchingSubSuites = subSuites.filter(ss => ss.suiteId === suite.id);
      console.log(`[PromptLibrary] Active suite: ${activeTab} (${suite.id}), Sub-suites: ${matchingSubSuites.length}`);
    }
  }, [activeTab, suites, subSuites]);

  // Filter prompts based on search query, sub-suite, and prompt type
  const filteredPrompts = useMemo(() => {
    let suitePrompts = getPromptsForSuite(activeTab);
    
    // Filter by sub-suite if selected
    if (activeSubSuite) {
      suitePrompts = suitePrompts.filter(p => p.sub_suite === activeSubSuite);
    }
    
    // Filter by prompt type (detailed vs starter)
    if (promptTypeFilter === 'detailed') {
      suitePrompts = suitePrompts.filter(p => p.user_template && p.user_template.trim().length > 0);
    } else if (promptTypeFilter === 'starter') {
      suitePrompts = suitePrompts.filter(p => !p.user_template || p.user_template.trim().length === 0);
    }
    
    // Filter by search
    if (!searchQuery.trim()) return suitePrompts;
    
    const query = searchQuery.toLowerCase();
    return suitePrompts.filter(prompt => 
      (prompt.display_name || prompt.name || '').toLowerCase().includes(query) ||
      (prompt.description || '').toLowerCase().includes(query) ||
      (prompt.title || '').toLowerCase().includes(query) ||
      (prompt.tags || []).some(tag => tag.toLowerCase().includes(query))
    );
  }, [prompts, activeTab, activeSubSuite, promptTypeFilter, searchQuery]);
  
  // Count prompts by type for current suite
  const promptTypeCounts = useMemo(() => {
    const suitePrompts = getPromptsForSuite(activeTab);
    const detailed = suitePrompts.filter(p => p.user_template && p.user_template.trim().length > 0).length;
    const starter = suitePrompts.filter(p => !p.user_template || p.user_template.trim().length === 0).length;
    return { detailed, starter, all: suitePrompts.length };
  }, [prompts, activeTab]);

  // Get icon for a suite
  const getSuiteIcon = (suiteCode: string): LucideIcon => {
    const code = suiteCode.replace('™', '');
    return SUITE_ICONS[code] || Landmark;
  };

  // Get color for a suite
  const getSuiteColor = (suiteCode: string): string => {
    const code = suiteCode.replace('™', '');
    return SUITE_COLORS[code] || 'bg-blue-500';
  };

  // Get complexity badge color
  const getComplexityColor = (complexity: string | undefined) => {
    switch (complexity) {
      case 'basic': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'expert': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Get total count for all suites
  const totalPrompts = prompts.length;
  const currentSubSuites = getSubSuitesForSuite(activeTab);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading PRISM Library...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeSuite = suites.find((s) => s.name === activeTab);
  const ActiveIcon = getSuiteIcon(activeTab);

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">PRISM™ Prompt Library</h1>
          {dataSource && (
            <Badge variant="outline" className="text-xs">
              {dataSource === 'normalized_tables' ? 'Database' : 
               dataSource === 'flat_table_with_categorization' ? 'Categorized' : 'Fallback'}
            </Badge>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Professional Healthcare Prompt Templates & Strategies
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          {totalPrompts} prompts available across {suites.length} suites
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search prompts by name, description, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Suite Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex overflow-x-auto pb-px -mb-px scrollbar-hide">
          {suites.map(suite => {
            const count = getPromptsForSuite(suite.name).length;
            const SuiteIcon = getSuiteIcon(suite.name);
            return (
              <button
                key={suite.id}
                onClick={() => {
                  setActiveTab(suite.name);
                  setActiveSubSuite(null);
                }}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                  border-b-2 transition-colors min-w-fit
                  ${activeTab === suite.name
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <SuiteIcon className="h-4 w-4" />
                <span>{suite.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === suite.name 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompt Type Filter */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Prompt Type:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPromptTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              promptTypeFilter === 'all'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
            }`}
          >
            All Prompts
            <span className="ml-1.5 text-xs opacity-70">({promptTypeCounts.all})</span>
          </button>
          <button
            onClick={() => setPromptTypeFilter('detailed')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              promptTypeFilter === 'detailed'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
            }`}
          >
            <PenTool className="h-3 w-3 inline mr-1" />
            Detailed Templates
            <span className="ml-1.5 text-xs opacity-70">({promptTypeCounts.detailed})</span>
          </button>
          <button
            onClick={() => setPromptTypeFilter('starter')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              promptTypeFilter === 'starter'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
            }`}
          >
            <Zap className="h-3 w-3 inline mr-1" />
            Conversation Starters
            <span className="ml-1.5 text-xs opacity-70">({promptTypeCounts.starter})</span>
          </button>
        </div>
      </div>

      {/* Sub-Suite Pills (if available) */}
      {currentSubSuites.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 self-center mr-2">Sub-Suite:</span>
          <button
            onClick={() => setActiveSubSuite(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !activeSubSuite
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {currentSubSuites.map(subSuite => (
            <button
              key={subSuite.id}
              onClick={() => setActiveSubSuite(subSuite.code)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeSubSuite === subSuite.code
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {subSuite.name}
              <span className="ml-1.5 text-xs opacity-70">({subSuite.promptCount})</span>
            </button>
          ))}
        </div>
      )}

      {/* Active Tab Content */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <ActiveIcon className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">{activeTab}</h2>
          <Badge variant="outline" className="text-sm">{activeSuite?.fullName || activeSuite?.description}</Badge>
          {searchQuery && (
            <Badge variant="secondary" className="text-sm">
              {filteredPrompts.length} results
            </Badge>
          )}
          {activeSubSuite && (
            <Badge variant="secondary" className="text-sm flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {activeSubSuite}
            </Badge>
          )}
        </div>

        {filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrompts.map(prompt => {
              const isDetailedPrompt = prompt.user_template && prompt.user_template.trim().length > 0;
              return (
              <Card key={prompt.id} className={`hover:shadow-lg transition-shadow group ${isDetailedPrompt ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-purple-500'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        {isDetailedPrompt ? (
                          <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            <PenTool className="h-3 w-3 mr-1" />
                            Template
                          </Badge>
                        ) : (
                          <Badge className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                            <Zap className="h-3 w-3 mr-1" />
                            Starter
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-sm font-medium line-clamp-2">
                        {prompt.display_name || prompt.title || prompt.name}
                      </CardTitle>
                      {prompt.prompt_code && (
                        <span className="text-xs text-gray-400 font-mono">{prompt.prompt_code}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {prompt.expert_validated && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" title="Expert Validated" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Star className={`h-4 w-4 ${prompt.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-xs line-clamp-3 mt-1">
                    {prompt.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {prompt.complexity && (
                      <Badge className={`text-xs ${getComplexityColor(prompt.complexity)}`}>
                        {prompt.complexity}
                      </Badge>
                    )}
                    {prompt.category && (
                      <Badge variant="secondary" className="text-xs">
                        {prompt.category}
                      </Badge>
                    )}
                    {prompt.sub_suite && (
                      <Badge variant="outline" className="text-xs">
                        {prompt.sub_suite_name || prompt.sub_suite}
                      </Badge>
                    )}
                    {prompt.estimated_time_minutes && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {prompt.estimated_time_minutes}m
                      </Badge>
                    )}
                    {isDetailedPrompt && prompt.variables && prompt.variables.length > 0 && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1 bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                        {prompt.variables.length} variables
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPrompt(prompt)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyPrompt(prompt)}
                      className="flex-1"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            {searchQuery ? (
              <>
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No matching prompts found</p>
                <p className="text-sm">Try adjusting your search query</p>
              </>
            ) : (
              <>
                <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No prompts in this suite yet</p>
                <p className="text-sm">Check back later for new {activeTab} prompts</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Prompt Detail Dialog */}
      <Dialog open={!!selectedPrompt} onOpenChange={() => setSelectedPrompt(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-xl">
                  {selectedPrompt?.display_name || selectedPrompt?.title || selectedPrompt?.name}
                </DialogTitle>
                {selectedPrompt?.prompt_code && (
                  <span className="text-sm text-gray-500 font-mono">{selectedPrompt.prompt_code}</span>
                )}
              </div>
              {selectedPrompt?.expert_validated && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Expert Validated
                </Badge>
              )}
            </div>
            <DialogDescription>
              {selectedPrompt?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Metadata badges */}
            <div className="flex flex-wrap gap-2">
              {selectedPrompt?.suite && (
                <Badge variant="outline" className={getSuiteColor(selectedPrompt.suite.replace('™', ''))}>
                  {selectedPrompt.suite}
                </Badge>
              )}
              {selectedPrompt?.sub_suite && (
                <Badge variant="secondary">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  {selectedPrompt.sub_suite_name || selectedPrompt.sub_suite}
                </Badge>
              )}
              {selectedPrompt?.category && (
                <Badge variant="outline">{selectedPrompt.category}</Badge>
              )}
              {selectedPrompt?.complexity && (
                <Badge className={getComplexityColor(selectedPrompt.complexity)}>
                  {selectedPrompt.complexity}
                </Badge>
              )}
              {selectedPrompt?.version && (
                <Badge variant="outline">v{selectedPrompt.version}</Badge>
              )}
              {selectedPrompt?.rag_enabled && (
                <Badge variant="outline" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                  RAG Enabled
                </Badge>
              )}
            </div>

            {/* Tags */}
            {selectedPrompt?.tags && selectedPrompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedPrompt.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* System Prompt */}
            {selectedPrompt?.system_prompt && (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-medium mb-2 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  System Prompt
                </h4>
                <pre className="text-sm whitespace-pre-wrap font-mono text-blue-800 dark:text-blue-200 max-h-48 overflow-y-auto">
                  {selectedPrompt.system_prompt}
                </pre>
              </div>
            )}

            {/* User Template */}
            {selectedPrompt?.user_template && (
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="text-sm font-medium mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  User Template
                </h4>
                <pre className="text-sm whitespace-pre-wrap font-mono text-green-800 dark:text-green-200 max-h-48 overflow-y-auto">
                  {selectedPrompt.user_template}
                </pre>
              </div>
            )}

            {/* Main Content */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Prompt Content</h4>
              <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800 dark:text-gray-200 max-h-96 overflow-y-auto">
                {selectedPrompt?.content || 'No content available'}
              </pre>
            </div>

            {/* Variables */}
            {selectedPrompt?.variables && selectedPrompt.variables.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <h4 className="text-sm font-medium mb-2 text-amber-700 dark:text-amber-300">Variables</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPrompt.variables.map((variable, idx) => (
                    <code key={idx} className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900 rounded font-mono">
                      {`{{${variable}}}`}
                    </code>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => selectedPrompt && copyPrompt(selectedPrompt)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
