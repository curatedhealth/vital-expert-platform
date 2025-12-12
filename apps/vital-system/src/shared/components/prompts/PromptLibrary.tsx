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
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@vital/ui';
import { Input } from '@vital/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@vital/ui';
import { useToast } from '@vital/ui';
import { PromptEnhancer } from '@/shared/components/chat/prompt-enhancer';

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
  const [sortMode, setSortMode] = useState<'recent' | 'popular' | 'validated'>('recent');
  const { toast } = useToast();
  const [enhancedContent, setEnhancedContent] = useState<string>('');

  const loadFallback = async () => {
    const fallbackResponse = await fetch('/api/prompts-crud?showAll=true');
    if (!fallbackResponse.ok) throw new Error('Fallback API failed');

    const fallbackData = await fallbackResponse.json();
    const promptsArray = Array.isArray(fallbackData) ? fallbackData : (fallbackData.prompts || []);

    setPrompts(promptsArray);

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
    setActiveTab(defaultSuites[0]?.name || 'RULES™');
    setDataSource('fallback');
  };

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/prism');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (data.suites && data.suites.length > 0) {
            setSuites(data.suites);
            setActiveTab(data.suites[0]?.name || 'RULES™');
          } else {
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
          return;
        }
      }

      // If we reach here, use fallback
      await loadFallback();
    } catch (error) {
      try {
        await loadFallback();
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

  useEffect(() => {
    setEnhancedContent('');
  }, [selectedPrompt]);

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
    const results = suitePrompts.filter(prompt => 
      (prompt.display_name || prompt.name || '').toLowerCase().includes(query) ||
      (prompt.description || '').toLowerCase().includes(query) ||
      (prompt.title || '').toLowerCase().includes(query) ||
      (prompt.tags || []).some(tag => tag.toLowerCase().includes(query))
    );

    return results;
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
      default: return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';
    }
  };

  // Get total count for all suites
  const totalPrompts = prompts.length;
  const currentSubSuites = getSubSuitesForSuite(activeTab);

  const sortPrompts = (items: Prompt[]) => {
    if (sortMode === 'popular') {
      return [...items].sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
    }
    if (sortMode === 'validated') {
      return [...items].sort((a, b) => Number(b.expert_validated || 0) - Number(a.expert_validated || 0));
    }
    return [...items]; // keep natural order (recent from API)
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, idx) => (
        <Card key={idx} className="border-l-4 border-l-neutral-200">
          <CardHeader className="pb-3 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-10" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 flex gap-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const activeSuite = suites.find((s) => s.name === activeTab);
  const ActiveIcon = getSuiteIcon(activeTab);

  const getObjective = (prompt: Prompt | null | undefined) => {
    if (!prompt) return '';
    if (prompt.description) return prompt.description;
    const text = (prompt.content || prompt.title || prompt.name || '').trim();
    if (!text) return '';
    const taskSplit = text.split(/(?:\n\s*Task:|\n\s*Output format:)/i)[0];
    const firstLine = taskSplit.split('\n').filter(Boolean)[0] || taskSplit;
    return firstLine.slice(0, 220);
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">PRISM™ Prompt Library</h1>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          Professional Healthcare Prompt Templates & Strategies
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-500">
          {totalPrompts} prompts available across {suites.length} suites
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Search prompts by name, description, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
        {/* Sidebar */}
        <aside className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-6 h-fit sticky top-4">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Suites</div>
            <div className="space-y-1">
              {suites.map((suite) => {
                const count = getPromptsForSuite(suite.name).length;
                const SuiteIcon = getSuiteIcon(suite.name);
                const active = activeTab === suite.name;
                return (
                  <button
                    key={suite.id}
                    onClick={() => {
                      setActiveTab(suite.name);
                      setActiveSubSuite(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors border ${
                      active
                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200'
                        : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <SuiteIcon className="h-4 w-4" />
                      {suite.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {currentSubSuites.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Sub-suites</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveSubSuite(null)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    !activeSubSuite
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                  }`}
                >
                  All
                </button>
                {currentSubSuites.map((subSuite) => (
                  <button
                    key={subSuite.id}
                    onClick={() => setActiveSubSuite(subSuite.code)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activeSubSuite === subSuite.code
                        ? 'bg-blue-600 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {subSuite.name || subSuite.code}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Prompt type</div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'detailed', 'starter'] as PromptTypeFilter[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setPromptTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    promptTypeFilter === type
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'detailed' ? 'Detailed' : 'Starters'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Quick actions</div>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
                Start new prompt
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
                Upload prompt
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
                Manage prompts
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Sort</div>
            <Select
              value={sortMode}
              onValueChange={(val) =>
                setSortMode(val as 'recent' | 'popular' | 'validated')
              }
            >
              <SelectTrigger className="w-full border-2 border-purple-200 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="validated">Validated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </aside>

        {/* Active Tab Content */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
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
              {sortPrompts(filteredPrompts).map(prompt => {
                const isDetailedPrompt = prompt.user_template && prompt.user_template.trim().length > 0;
                return (
                  <Card key={prompt.id} className="hover:shadow-lg transition-shadow group border border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="text-xs" variant="outline">
                              {prompt.sub_suite_name || prompt.sub_suite || prompt.suite}
                            </Badge>
                            {prompt.complexity && (
                              <Badge className={`text-xs ${getComplexityColor(prompt.complexity)}`}>
                                {prompt.complexity}
                              </Badge>
                            )}
                            {prompt.expert_validated && (
                              <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Validated
                              </Badge>
                            )}
                            <Badge className="text-xs bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                              {isDetailedPrompt ? 'Detailed' : 'Starter'}
                            </Badge>
                          </div>
                          <CardTitle className="text-base font-semibold line-clamp-2">
                            {prompt.display_name || prompt.title || prompt.name}
                          </CardTitle>
                          {prompt.prompt_code && (
                            <span className="text-xs text-neutral-400 font-mono">{prompt.prompt_code}</span>
                          )}
                          <CardDescription className="text-sm line-clamp-3 mt-1">
                            {getObjective(prompt)}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Star className={`h-4 w-4 ${prompt.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-400'}`} />
                        </Button>
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
            <div className="text-center text-neutral-400 py-16 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg">
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
      </div>

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
            {sortPrompts(filteredPrompts).map(prompt => {
              const isDetailedPrompt = prompt.user_template && prompt.user_template.trim().length > 0;
              return (
                <Card key={prompt.id} className="hover:shadow-lg transition-shadow group border border-neutral-200 dark:border-neutral-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="text-xs" variant="outline">
                            {prompt.sub_suite_name || prompt.sub_suite || prompt.suite}
                          </Badge>
                          {prompt.complexity && (
                            <Badge className={`text-xs ${getComplexityColor(prompt.complexity)}`}>
                              {prompt.complexity}
                            </Badge>
                          )}
                          {prompt.expert_validated && (
                            <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Validated
                            </Badge>
                          )}
                          <Badge className="text-xs bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                            {isDetailedPrompt ? 'Detailed' : 'Starter'}
                          </Badge>
                        </div>
                        <CardTitle className="text-base font-semibold line-clamp-2">
                          {prompt.display_name || prompt.title || prompt.name}
                        </CardTitle>
                        {prompt.prompt_code && (
                          <span className="text-xs text-neutral-400 font-mono">{prompt.prompt_code}</span>
                        )}
                        <CardDescription className="text-sm line-clamp-3 mt-1">
                          {getObjective(prompt)}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Star className={`h-4 w-4 ${prompt.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-400'}`} />
                      </Button>
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
          <div className="text-center text-neutral-400 py-16 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg">
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
                  <span className="text-sm text-neutral-500 font-mono">{selectedPrompt.prompt_code}</span>
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
              {getObjective(selectedPrompt as Prompt)}
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
                  <span key={idx} className="text-xs px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Starter / Objective */}
            <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
              <h4 className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Prompt Starter / Objective
              </h4>
              <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                {getObjective(selectedPrompt as Prompt)}
              </p>
            </div>

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
            <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Prompt Content
                </h4>
                {enhancedContent && (
                  <Badge variant="outline" className="text-xs text-blue-700 border-blue-200 dark:text-blue-200 dark:border-blue-800">
                    AI enhanced
                  </Badge>
                )}
              </div>
              <pre className="text-sm whitespace-pre-wrap font-mono text-neutral-800 dark:text-neutral-200 max-h-96 overflow-y-auto">
                {enhancedContent || selectedPrompt?.content || 'No content available'}
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
            <div className="flex items-center justify-between gap-3 pt-4 border-t">
              <div className="flex items-center gap-2">
                {selectedPrompt && (
                  <PromptEnhancer
                    value={selectedPrompt.content || selectedPrompt.user_template || selectedPrompt.system_prompt || ''}
                    onApply={(val) => setEnhancedContent(val)}
                    triggerClassName="h-9 w-9"
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={copySelectedContent}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy {enhancedContent ? 'Enhanced' : 'Original'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
  const copySelectedContent = async () => {
    if (!selectedPrompt) return;
    try {
      const textToCopy = enhancedContent || selectedPrompt.content || selectedPrompt.system_prompt || '';
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Copied!",
        description: enhancedContent ? "Enhanced prompt copied to clipboard" : "Prompt copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy prompt:", error);
      toast({
        title: "Error",
        description: "Failed to copy the prompt",
        variant: "destructive"
      });
    }
  };
