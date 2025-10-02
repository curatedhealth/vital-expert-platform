'use client';

import { Search, Filter, Grid, List, Copy, Edit, Plus, Star, ChevronDown, MoreVertical } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

import PromptEditor from './PromptEditor';

interface Prompt {
  id?: string;
  name: string;
  display_name: string;
  description: string;
  domain: string;
  system_prompt: string;
  user_prompt_template: string;
  acronym?: string;
  suite?: string;
  created_by?: string;
  is_favorite?: boolean;
  is_user_created?: boolean;
}

  'medical_affairs': 'bg-blue-100 text-blue-800',
  'commercial': 'bg-green-100 text-green-800',
  'compliance': 'bg-red-100 text-red-800',
  'marketing': 'bg-purple-100 text-purple-800',
  'patient_advocacy': 'bg-pink-100 text-pink-800',
  'general': 'bg-gray-100 text-gray-800'
};

  { name: 'RULES™', description: 'Regulatory Excellence', domain: 'medical_affairs', color: 'bg-blue-500' },
  { name: 'TRIALS™', description: 'Clinical Development', domain: 'medical_affairs', color: 'bg-indigo-500' },
  { name: 'GUARD™', description: 'Safety Framework', domain: 'compliance', color: 'bg-red-500' },
  { name: 'VALUE™', description: 'Market Access', domain: 'commercial', color: 'bg-green-500' },
  { name: 'BRIDGE™', description: 'Stakeholder Engagement', domain: 'medical_affairs', color: 'bg-cyan-500' },
  { name: 'PROOF™', description: 'Evidence Analytics', domain: 'medical_affairs', color: 'bg-teal-500' },
  { name: 'CRAFT™', description: 'Medical Writing', domain: 'medical_affairs', color: 'bg-orange-500' },
  { name: 'SCOUT™', description: 'Competitive Intelligence', domain: 'commercial', color: 'bg-purple-500' }
];

interface PromptLibraryProps {
  searchQuery?: string;
  filters?: {
    selectedSuite: string;
    selectedDomain: string;
    selectedFunction: string;
    selectedDepartment: string;
  };
  onSearchChange?: (query: string) => void;
  onFilterChange?: (filters: unknown) => void;
}

export default function PromptLibrary({
  searchQuery = '',
  filters,
  onSearchChange,
  onFilterChange
}: PromptLibraryProps = { /* TODO: implement */ }) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalFilters, setInternalFilters] = useState({
    selectedSuite: 'all',
    selectedDomain: 'all',
    selectedFunction: 'all',
    selectedDepartment: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | undefined>();
  const [editorMode, setEditorMode] = useState<'create' | 'edit' | 'copy'>('create');
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  // Use external props when available, otherwise use internal state

  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    filterPrompts();
  }, [prompts, currentSearchQuery, currentFilters, activeTab]);

    try {
      setLoading(true);

      if (!response.ok) throw new Error('Failed to fetch prompts');

      setPrompts(data);
    } catch (error) {
      // console.error('Error fetching prompts:', error);
      toast({
        title: "Error",
        description: "Failed to load prompts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

    // Tab-based filtering
    if (activeTab === 'favorites') {
      filtered = filtered.filter(prompt => prompt.is_favorite);
    } else if (activeTab === 'custom') {
      filtered = filtered.filter(prompt => prompt.is_user_created);
    }

    // Search filter
    if (currentSearchQuery) {
      filtered = filtered.filter(prompt =>
        prompt.name.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
        prompt.display_name.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
        prompt.description.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
        prompt.acronym?.toLowerCase().includes(currentSearchQuery.toLowerCase())
      );
    }

    // Domain filter
    if (currentFilters.selectedDomain !== 'all') {
      filtered = filtered.filter(prompt => prompt.domain === currentFilters.selectedDomain);
    }

    // Suite filter
    if (currentFilters.selectedSuite !== 'all') {
      filtered = filtered.filter(prompt => prompt.suite === currentFilters.selectedSuite);
    }

    // Function filter (for external filtering)
    if (currentFilters.selectedFunction !== 'all') {
      // Map function to domain or other relevant filtering logic
      // This would need to be implemented based on your data structure
    }

    // Department filter (for external filtering)
    if (currentFilters.selectedDepartment !== 'all') {
      // Map department to domain or other relevant filtering logic
      // This would need to be implemented based on your data structure
    }

    setFilteredPrompts(filtered);
  };

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

    try {
      // TODO: Implement favorite API endpoint
      setPrompts(prevPrompts =>
        prevPrompts.map(prompt =>
          prompt.id === promptId
            ? { ...prompt, is_favorite: !prompt.is_favorite }
            : prompt
        )
      );
      toast({
        title: "Updated",
        description: "Favorite status updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite",
        variant: "destructive",
      });
    }
  };

    setSelectedPrompt(undefined);
    setEditorMode('create');
    setEditorOpen(true);
  };

    setSelectedPrompt(prompt);
    setEditorMode('edit');
    setEditorOpen(true);
  };

    setSelectedPrompt(prompt);
    setEditorMode('copy');
    setEditorOpen(true);
  };

    try {
      let response;
      if (editorMode === 'create' || editorMode === 'copy') {
        response = await fetch('/api/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...promptData,
            created_by: 'current-user-id' // TODO: Get from auth context
          })
        });
      } else {
        response = await fetch(`/api/prompts/${promptData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...promptData,
            updated_by: 'current-user-id' // TODO: Get from auth context
          })
        });
      }

      if (!response.ok) throw new Error('Failed to save prompt');

      await fetchPrompts(); // Refresh the list
    } catch (error) {
      // console.error('Error saving prompt:', error);
      toast({
        title: "Error",
        description: "Failed to save prompt",
        variant: "destructive",
      });
    }
  };

    // Extract acronym from prompt names like "PRISM DRAFT - Document..."

    return match ? match[1] : '';
  };

    // Determine suite based on acronym

    if (['DRAFT', 'RADAR', 'REPLY', 'GUIDE'].includes(acronym)) return 'RULES™';
    if (['DESIGN', 'QUALIFY', 'MONITOR', 'ENROLL'].includes(acronym)) return 'TRIALS™';
    if (['DETECT', 'ASSESS', 'REPORT', 'SIGNAL'].includes(acronym)) return 'GUARD™';
    if (['WORTH', 'PITCH', 'JUSTIFY', 'BUDGET'].includes(acronym)) return 'VALUE™';
    if (['CONNECT', 'RESPOND', 'EDUCATE', 'ALIGN'].includes(acronym)) return 'BRIDGE™';
    if (['STUDY', 'COMPARE', 'ANALYZE', 'PUBLISH'].includes(acronym)) return 'PROOF™';
    if (['WRITE', 'PLAN', 'REVIEW', 'STYLE'].includes(acronym)) return 'CRAFT™';
    if (['WATCH', 'TRACK', 'ASSESS', 'BRIEF'].includes(acronym)) return 'SCOUT™';
    return '';
  };

    return (
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {acronym && (
                <div className="flex items-center gap-2 mb-2">
                  <div className={`px-2 py-1 rounded text-xs font-bold text-white ${suiteInfo?.color || 'bg-gray-500'}`}>
                    {acronym}
                  </div>
                  {suite && (
                    <Badge variant="outline" className="text-xs">
                      {suite}
                    </Badge>
                  )}
                </div>
              )}
              <CardTitle className="text-sm font-medium line-clamp-2">
                {prompt.display_name}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => prompt.id && toggleFavorite(prompt.id)}
              className="p-1"
            >
              <Star
                className={`h-4 w-4 ${prompt.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
              />
            </Button>
          </div>
          <CardDescription className="text-xs line-clamp-2">
            {prompt.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-3">
            <Badge className={`text-xs ${DOMAIN_COLORS[prompt.domain as keyof typeof DOMAIN_COLORS]}`}>
              {prompt.domain.replace('_', ' ').toUpperCase()}
            </Badge>
            {prompt.is_user_created && (
              <Badge variant="secondary" className="text-xs">
                Custom
              </Badge>
            )}
          </div>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditPrompt(prompt)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Prompt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCopyPrompt(prompt)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy as New
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  };

    return (
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
        <div className="flex items-center gap-4 flex-1">
          {acronym && (
            <div className={`px-3 py-1 rounded text-sm font-bold text-white min-w-fit ${suiteInfo?.color || 'bg-gray-500'}`}>
              {acronym}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm truncate">{prompt.display_name}</h3>
              {suite && (
                <Badge variant="outline" className="text-xs">
                  {suite}
                </Badge>
              )}
              {prompt.is_user_created && (
                <Badge variant="secondary" className="text-xs">
                  Custom
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-600 line-clamp-1">{prompt.description}</p>
            <Badge className={`text-xs mt-1 ${DOMAIN_COLORS[prompt.domain as keyof typeof DOMAIN_COLORS]}`}>
              {prompt.domain.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => prompt.id && toggleFavorite(prompt.id)}
          >
            <Star
              className={`h-4 w-4 ${prompt.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyPrompt(prompt)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditPrompt(prompt)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Prompt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCopyPrompt(prompt)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy as New
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PRISM™ Library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">PRISM™ Prompt Library</h1>
          <p className="text-gray-600">
            Professional Regulatory Intelligence & Scientific Methodology
          </p>
        </div>
        <Button onClick={handleCreatePrompt}>
          <Plus className="h-4 w-4 mr-2" />
          Create Prompt
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search prompts, acronyms, or descriptions..."
              value={currentSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Select
              value={currentFilters.selectedDomain}
              onValueChange={(value) => handleFilterChange({ ...currentFilters, selectedDomain: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                <SelectItem value="medical_affairs">Medical Affairs</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="patient_advocacy">Patient Advocacy</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={currentFilters.selectedSuite}
              onValueChange={(value) => handleFilterChange({ ...currentFilters, selectedSuite: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by suite" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suites</SelectItem>
                {PRISM_SUITES.map(suite => (
                  <SelectItem key={suite.name} value={suite.name}>
                    {suite.name} - {suite.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentFilters.selectedFunction}
              onValueChange={(value) => handleFilterChange({ ...currentFilters, selectedFunction: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by function" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Functions</SelectItem>
                <SelectItem value="regulatory_affairs">Regulatory Affairs</SelectItem>
                <SelectItem value="clinical_development">Clinical Development</SelectItem>
                <SelectItem value="pharmacovigilance">Pharmacovigilance</SelectItem>
                <SelectItem value="market_access">Market Access</SelectItem>
                <SelectItem value="medical_writing">Medical Writing</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={currentFilters.selectedDepartment}
              onValueChange={(value) => handleFilterChange({ ...currentFilters, selectedDepartment: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="medical_affairs">Medical Affairs</SelectItem>
                <SelectItem value="clinical_operations">Clinical Operations</SelectItem>
                <SelectItem value="regulatory_affairs">Regulatory Affairs</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="market_access">Market Access</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredPrompts.length} of {prompts.length} prompts
        </p>
      </div>

      {/* Tabs for Organization */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Prompts</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="custom">My Prompts</TabsTrigger>
          <TabsTrigger value="suites">By Suite</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPrompts.map(prompt => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPrompts.map(prompt => (
                <PromptListItem key={prompt.id} prompt={prompt} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPrompts.map(prompt => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPrompts.map(prompt => (
                <PromptListItem key={prompt.id} prompt={prompt} />
              ))}
            </div>
          )}
          {filteredPrompts.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No favorite prompts</h3>
              <p>Star prompts to add them to your favorites</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPrompts.map(prompt => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPrompts.map(prompt => (
                <PromptListItem key={prompt.id} prompt={prompt} />
              ))}
            </div>
          )}
          {filteredPrompts.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Plus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No custom prompts</h3>
              <p>Create your first custom prompt to get started</p>
              <Button onClick={handleCreatePrompt} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Prompt
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="suites" className="space-y-6">
          {PRISM_SUITES.map(suite => {

            if (suitePrompts.length === 0) return null;

            return (
              <div key={suite.name}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-4 h-4 rounded ${suite.color}`}></div>
                  <h3 className="text-lg font-semibold">{suite.name}</h3>
                  <Badge variant="outline">{suite.description}</Badge>
                  <span className="text-sm text-gray-500">({suitePrompts.length} prompts)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {suitePrompts.map(prompt => (
                    <PromptCard key={prompt.id} prompt={prompt} />
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>

      {filteredPrompts.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No prompts found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Prompt Editor Modal */}
      <PromptEditor
        prompt={selectedPrompt}
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSavePrompt}
        mode={editorMode}
      />
    </div>
  );
}