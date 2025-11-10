'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid, List, Table2, Search } from 'lucide-react';
import { Button } from '@vital/ui';
import { Input } from '@vital/ui';
import { useToast } from '@vital/ui';
import PromptDashboard from './PromptDashboard';
import SuiteDetailView from './SuiteDetailView';
import PromptSidebar from './PromptSidebar';
import BoardView from './views/BoardView';
import ListView from './views/ListView';
import TableView from './views/TableView';
import type {
  Prompt,
  PromptSuite,
  PromptSubsuite,
  ViewMode,
  PromptPattern,
  ComplexityLevel,
} from '@/types/prompts';

export default function PromptViewManager() {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedSuite, setSelectedSuite] = useState<PromptSuite | undefined>();
  const [selectedSubsuite, setSelectedSubsuite] = useState<PromptSubsuite | undefined>();

  const [suites, setSuites] = useState<PromptSuite[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPattern, setSelectedPattern] = useState<PromptPattern | 'all'>('all');
  const [selectedComplexity, setSelectedComplexity] = useState<ComplexityLevel | 'all'>('all');
  const [promptViewMode, setPromptViewMode] = useState<'board' | 'list' | 'table'>('board');

  const { toast } = useToast();

  // Fetch suites on mount
  useEffect(() => {
    fetchSuites();
  }, []);

  // Fetch prompts when filters change
  useEffect(() => {
    if (viewMode === 'board' || viewMode === 'list' || viewMode === 'table') {
      fetchPrompts();
    }
  }, [viewMode, selectedSuite, selectedSubsuite]);

  const fetchSuites = async () => {
    try {
      const response = await fetch('/api/prompts/suites');
      const data = await response.json();

      if (data.success) {
        setSuites(data.suites);
      }
    } catch (error) {
      console.error('Error fetching suites:', error);
      toast({
        title: 'Error',
        description: 'Failed to load prompt suites',
        variant: 'destructive',
      });
    }
  };

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedSuite) {
        params.append('suite', selectedSuite.name);
      }

      const response = await fetch(`/api/prompts?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setPrompts(data.prompts || []);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load prompts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuiteClick = (suite: PromptSuite) => {
    setSelectedSuite(suite);
    setViewMode('suite');
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedSuite(undefined);
    setSelectedSubsuite(undefined);
  };

  const handleViewAllPrompts = () => {
    setViewMode(promptViewMode);
  };

  const handleSubsuiteClick = (subsuite: PromptSubsuite) => {
    setSelectedSubsuite(subsuite);
    setViewMode(promptViewMode);
  };

  const handleCopyPrompt = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.system_prompt);
      toast({
        title: 'Copied!',
        description: 'Prompt copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy prompt',
        variant: 'destructive',
      });
    }
  };

  const handleResetFilters = () => {
    setSelectedSuite(undefined);
    setSelectedSubsuite(undefined);
    setSelectedPattern('all');
    setSelectedComplexity('all');
    setSearchTerm('');
  };

  // Filter prompts based on current filters
  const filteredPrompts = prompts.filter((prompt) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        prompt.display_name.toLowerCase().includes(searchLower) ||
        prompt.description.toLowerCase().includes(searchLower) ||
        prompt.name.toLowerCase().includes(searchLower) ||
        prompt.metadata?.tags?.some((tag) => tag.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;
    }

    // Pattern filter
    if (selectedPattern !== 'all' && prompt.metadata?.pattern !== selectedPattern) {
      return false;
    }

    // Complexity filter
    if (selectedComplexity !== 'all' && prompt.complexity_level !== selectedComplexity) {
      return false;
    }

    return true;
  });

  // Render appropriate view
  const renderView = () => {
    switch (viewMode) {
      case 'dashboard':
        return <PromptDashboard onSuiteClick={handleSuiteClick} />;

      case 'suite':
        return selectedSuite ? (
          <SuiteDetailView
            suite={selectedSuite}
            onBack={handleBackToDashboard}
            onSubsuiteClick={handleSubsuiteClick}
            onViewAllPrompts={handleViewAllPrompts}
          />
        ) : null;

      case 'board':
      case 'list':
      case 'table':
        return (
          <div className="flex h-full">
            {/* Sidebar */}
            <PromptSidebar
              suites={suites}
              selectedSuite={selectedSuite?.id}
              selectedSubsuite={selectedSubsuite?.id}
              selectedPattern={selectedPattern}
              selectedComplexity={selectedComplexity}
              onSuiteChange={(suiteId) => {
                const suite = suites.find((s) => s.id === suiteId);
                setSelectedSuite(suite);
                setSelectedSubsuite(undefined);
              }}
              onSubsuiteChange={(subsuiteId) => {
                // Note: In a full implementation, you'd fetch and set the actual subsuite
                setSelectedSubsuite(subsuiteId ? ({ id: subsuiteId } as PromptSubsuite) : undefined);
              }}
              onPatternChange={setSelectedPattern}
              onComplexityChange={setSelectedComplexity}
              onReset={handleResetFilters}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="border-b bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {selectedSuite ? selectedSuite.name : 'All Prompts'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {selectedSubsuite
                        ? `${selectedSubsuite.name} • ${filteredPrompts.length} prompts`
                        : `${filteredPrompts.length} prompts`}
                    </p>
                  </div>

                  {/* View Switcher */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={promptViewMode === 'board' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setPromptViewMode('board');
                        setViewMode('board');
                      }}
                    >
                      <LayoutGrid className="h-4 w-4 mr-1.5" />
                      Board
                    </Button>
                    <Button
                      variant={promptViewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setPromptViewMode('list');
                        setViewMode('list');
                      }}
                    >
                      <List className="h-4 w-4 mr-1.5" />
                      List
                    </Button>
                    <Button
                      variant={promptViewMode === 'table' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setPromptViewMode('table');
                        setViewMode('table');
                      }}
                    >
                      <Table2 className="h-4 w-4 mr-1.5" />
                      Table
                    </Button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search prompts by name, description, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-auto p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading prompts...</p>
                    </div>
                  </div>
                ) : promptViewMode === 'board' ? (
                  <BoardView
                    prompts={filteredPrompts}
                    onCopy={handleCopyPrompt}
                  />
                ) : promptViewMode === 'list' ? (
                  <ListView
                    prompts={filteredPrompts}
                    onCopy={handleCopyPrompt}
                  />
                ) : (
                  <TableView
                    prompts={filteredPrompts}
                    onCopy={handleCopyPrompt}
                  />
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="h-full">{renderView()}</div>;
}
