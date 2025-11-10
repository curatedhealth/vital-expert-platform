'use client';

import { Copy, Star, Search, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui';
import { useToast } from '@vital/ui';
import { Input } from '@vital/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@vital/ui';

interface Prompt {
  id: string;
  name: string;
  display_name: string;
  description: string;
  domain: string;
  system_prompt: string;
  suite?: string;
  is_favorite?: boolean;
  category?: string;
  metadata?: {
    pattern?: string;
    tags?: string[];
    source?: 'prompts' | 'dh_prompt';
    unique_id?: string;
    suite?: string;
    workflow?: string;
    sub_suite?: string;
  };
}

const PRISM_SUITES = [
  { name: 'RULES™', description: 'Regulatory Excellence', color: 'bg-blue-500' },
  { name: 'TRIALS™', description: 'Clinical Development', color: 'bg-indigo-500' },
  { name: 'GUARD™', description: 'Safety Framework', color: 'bg-red-500' },
  { name: 'VALUE™', description: 'Market Access', color: 'bg-green-500' },
  { name: 'BRIDGE™', description: 'Stakeholder Engagement', color: 'bg-cyan-500' },
  { name: 'PROOF™', description: 'Evidence Analytics', color: 'bg-teal-500' },
  { name: 'CRAFT™', description: 'Medical Writing', color: 'bg-orange-500' },
  { name: 'SCOUT™', description: 'Competitive Intelligence', color: 'bg-purple-500' },
  { name: 'PROJECT™', description: 'Project Management Excellence', color: 'bg-amber-500' },
  { name: 'FORGE™', description: 'Digital Health Development', color: 'bg-emerald-500' }
];

export default function PromptLibrary() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('RULES™');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPattern, setSelectedPattern] = useState<string>('all');
  const { toast } = useToast();

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/prompts');
      if (!response.ok) throw new Error('Failed to fetch prompts');
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setPrompts(data);
      } else if (data && Array.isArray(data.prompts)) {
        // Handle case where API returns { prompts: [...] }
        setPrompts(data.prompts);
      } else {
        console.error('Invalid prompts data format:', data);
        setPrompts([]);
        toast({
          title: "Warning",
          description: "No prompts available",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      setPrompts([]); // Set empty array on error
      toast({
        title: "Error",
        description: "Failed to load prompts",
        variant: "destructive",
      });
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
      await navigator.clipboard.writeText(prompt.system_prompt);
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

  const getPromptsForSuite = (suiteName: string) => {
    // Ensure prompts is an array before filtering
    if (!Array.isArray(prompts)) {
      console.error('prompts is not an array:', prompts);
      return [];
    }

    let filtered = prompts.filter(prompt => prompt.suite === suiteName);

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(prompt =>
        prompt.display_name.toLowerCase().includes(searchLower) ||
        prompt.description.toLowerCase().includes(searchLower) ||
        prompt.name.toLowerCase().includes(searchLower) ||
        prompt.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply pattern filter
    if (selectedPattern !== 'all') {
      filtered = filtered.filter(prompt => prompt.metadata?.pattern === selectedPattern);
    }

    return filtered;
  };

  // Get unique patterns for filter dropdown
  const getAvailablePatterns = () => {
    const patterns = new Set<string>();
    prompts.forEach(prompt => {
      if (prompt.metadata?.pattern) {
        patterns.add(prompt.metadata.pattern);
      }
    });
    return Array.from(patterns).sort();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading PROMPTS Library...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeSuite = PRISM_SUITES.find((s: any) => s.name === activeTab);
  const activePrompts = getPromptsForSuite(activeTab);
  const availablePatterns = getAvailablePatterns();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PROMPTS Library</h1>
        <p className="text-gray-600 mb-4">
          Professional Healthcare Prompt Templates & Strategies
        </p>

        {/* Stats */}
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Total Prompts: <strong>{prompts.length}</strong></span>
          <span>Active Suite: <strong>{activePrompts.length}</strong></span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search prompts by name, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedPattern} onValueChange={setSelectedPattern}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by pattern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Patterns</SelectItem>
            {availablePatterns.map(pattern => (
              <SelectItem key={pattern} value={pattern}>
                {pattern}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex overflow-x-auto">
          {PRISM_SUITES.map(suite => {
            const count = getPromptsForSuite(suite.name).length;
            return (
              <button
                key={suite.name}
                onClick={() => setActiveTab(suite.name)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                  border-b-2 transition-colors
                  ${activeTab === suite.name
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <div className={`w-3 h-3 rounded ${suite.color}`}></div>
                <span>{suite.name}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-4 h-4 rounded ${activeSuite?.color}`}></div>
          <h2 className="text-2xl font-semibold">{activeTab}</h2>
          <Badge variant="outline">{activeSuite?.description}</Badge>
        </div>

        {activePrompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePrompts.map(prompt => (
              <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm font-medium line-clamp-2">
                        {prompt.display_name}
                      </CardTitle>
                      {prompt.metadata?.unique_id && (
                        <div className="text-xs text-gray-500 mt-1 font-mono">
                          {prompt.metadata.unique_id}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1"
                    >
                      <Star className={`h-4 w-4 ${prompt.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                    </Button>
                  </div>
                  <CardDescription className="text-xs line-clamp-2">
                    {prompt.description}
                  </CardDescription>

                  {/* Metadata badges */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {prompt.metadata?.pattern && (
                      <Badge variant="outline" className="text-xs">
                        {prompt.metadata.pattern}
                      </Badge>
                    )}
                    {prompt.category && (
                      <Badge variant="secondary" className="text-xs">
                        {prompt.category}
                      </Badge>
                    )}
                    {prompt.metadata?.source === 'dh_prompt' && (
                      <Badge variant="default" className="text-xs bg-emerald-500">
                        Workflow
                      </Badge>
                    )}
                  </div>

                  {/* Tags */}
                  {prompt.metadata?.tags && prompt.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {prompt.metadata.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {tag}
                        </span>
                      ))}
                      {prompt.metadata.tags.length > 3 && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          +{prompt.metadata.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
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
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-16 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-lg font-medium mb-2">No prompts in this suite yet</p>
            <p className="text-sm">Check back later for new {activeTab} prompts</p>
          </div>
        )}
      </div>
    </div>
  );
}
