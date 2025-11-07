'use client';

import { useState } from 'react';
import { Search, Loader2, Database, FileText, BookOpen, Building2, CheckCircle2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SearchResult {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  publication_date: string;
  publication_year?: number;
  journal?: string;
  url: string;
  pdf_link?: string;
  source: string;
  source_id: string;
  firm: string;
  file_type: string;
  access_type: string;
  direct_download?: boolean;
}

interface SearchResults {
  [source: string]: SearchResult[];
}

interface KnowledgeSearchImportProps {
  onAddToQueue: (sources: any[]) => void;
}

const AVAILABLE_SOURCES = [
  { id: 'pubmed', name: 'PubMed', icon: Database, description: 'Medical & health research', color: 'bg-blue-500' },
  { id: 'arxiv', name: 'arXiv', icon: FileText, description: 'Physics, CS, Math preprints', color: 'bg-green-500' },
  { id: 'bcg', name: 'BCG', icon: Building2, description: 'Boston Consulting Group', color: 'bg-purple-500' },
  { id: 'mckinsey', name: 'McKinsey', icon: Building2, description: 'McKinsey & Company', color: 'bg-indigo-500' },
  { id: 'accenture', name: 'Accenture', icon: Building2, description: 'Accenture Research', color: 'bg-pink-500' },
  { id: 'deloitte', name: 'Deloitte', icon: Building2, description: 'Deloitte Insights', color: 'bg-cyan-500' },
  { id: 'bain', name: 'Bain', icon: Building2, description: 'Bain & Company', color: 'bg-orange-500' },
];

export default function KnowledgeSearchImport({ onAddToQueue }: KnowledgeSearchImportProps) {
  const [query, setQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>(['pubmed', 'arxiv']);
  const [maxResults, setMaxResults] = useState(20);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    if (selectedSources.length === 0) {
      setError('Please select at least one source');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResults(null);
    setSelectedResults(new Set());

    try {
      const response = await fetch('/api/pipeline/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          sources: selectedSources,
          maxResults,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Search failed');
      }

      setSearchResults(data.results);
      console.log('✅ Search results:', data);
    } catch (err: any) {
      console.error('❌ Search error:', err);
      setError(err.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSourceSelection = (sourceId: string) => {
    setSelectedSources((prev) =>
      prev.includes(sourceId) ? prev.filter((s) => s !== sourceId) : [...prev, sourceId]
    );
  };

  const toggleResultSelection = (resultId: string) => {
    setSelectedResults((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(resultId)) {
        newSet.delete(resultId);
      } else {
        newSet.add(resultId);
      }
      return newSet;
    });
  };

  const selectAllResults = () => {
    if (!searchResults) return;

    const allIds = Object.values(searchResults)
      .flat()
      .map((r) => r.source_id);

    setSelectedResults(new Set(allIds));
  };

  const deselectAllResults = () => {
    setSelectedResults(new Set());
  };

  const handleAddToQueue = () => {
    if (!searchResults || selectedResults.size === 0) return;

    // Convert selected results to pipeline sources
    const allResults = Object.values(searchResults).flat();
    const selectedItems = allResults.filter((r) => selectedResults.has(r.source_id));

    const pipelineSources = selectedItems.map((result) => ({
      url: result.pdf_link || result.url,
      description: result.title,
      firm: result.firm,
      domain: 'imported',
      category: result.source.toLowerCase(),
      tags: [result.source, result.journal || result.firm].filter(Boolean),
      priority: 'medium',
      
      // Advanced metadata
      title: result.title,
      abstract: result.abstract,
      authors: result.authors,
      publication_date: result.publication_date,
      publication_year: result.publication_year,
      source_url: result.url,
      pdf_link: result.pdf_link,
      file_type: result.file_type,
      content_file_type: result.file_type,
      direct_download: result.direct_download || false,
      access_type: result.access_type,
      source_id: result.source_id,
      journal: result.journal,
      
      // Mark as imported
      imported_from: result.source,
      import_date: new Date().toISOString(),
    }));

    console.log(`✅ Adding ${pipelineSources.length} sources to queue`);
    onAddToQueue(pipelineSources);

    // Reset selection
    setSelectedResults(new Set());
  };

  const totalResults = searchResults
    ? Object.values(searchResults).reduce((sum, arr) => sum + arr.length, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Import Knowledge Sources
          </CardTitle>
          <CardDescription>
            Search multiple academic and industry sources, then add selected results to your scraping queue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="search-query">Search Query</Label>
            <div className="flex gap-2">
              <Input
                id="search-query"
                placeholder="e.g., artificial intelligence healthcare, digital transformation, etc."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Source Selection */}
          <div className="space-y-3">
            <Label>Select Sources</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {AVAILABLE_SOURCES.map((source) => {
                const Icon = source.icon;
                const isSelected = selectedSources.includes(source.id);

                return (
                  <button
                    key={source.id}
                    onClick={() => toggleSourceSelection(source.id)}
                    className={`
                      p-3 rounded-lg border-2 transition-all text-left
                      ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`p-1.5 rounded ${source.color} text-white`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm flex items-center gap-1">
                          {source.name}
                          {isSelected && <CheckCircle2 className="h-3 w-3 text-primary" />}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {source.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Max Results */}
          <div className="space-y-2">
            <Label htmlFor="max-results">Max Results per Source</Label>
            <Input
              id="max-results"
              type="number"
              min={1}
              max={50}
              value={maxResults}
              onChange={(e) => setMaxResults(parseInt(e.target.value) || 20)}
              className="w-32"
            />
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>
                  Found {totalResults} results • {selectedResults.size} selected
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {selectedResults.size > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={deselectAllResults}>
                      Deselect All
                    </Button>
                    <Button onClick={handleAddToQueue}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add {selectedResults.size} to Queue
                    </Button>
                  </>
                )}
                {selectedResults.size === 0 && totalResults > 0 && (
                  <Button variant="outline" size="sm" onClick={selectAllResults}>
                    Select All ({totalResults})
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(searchResults).map(([source, results]) => {
              if (results.length === 0) return null;

              const sourceInfo = AVAILABLE_SOURCES.find((s) => s.id === source);

              return (
                <div key={source} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded ${sourceInfo?.color || 'bg-gray-500'} text-white`}>
                      {sourceInfo?.icon && <sourceInfo.icon className="h-4 w-4" />}
                    </div>
                    <h3 className="font-semibold">
                      {sourceInfo?.name || source} ({results.length})
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {results.map((result) => {
                      const isSelected = selectedResults.has(result.source_id);

                      return (
                        <div
                          key={result.source_id}
                          className={`
                            p-4 border rounded-lg cursor-pointer transition-colors
                            ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                          `}
                          onClick={() => toggleResultSelection(result.source_id)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleResultSelection(result.source_id)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm mb-1 line-clamp-2">{result.title}</h4>
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                {result.abstract}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                {result.authors.length > 0 && (
                                  <span className="text-muted-foreground">
                                    {result.authors.slice(0, 3).join(', ')}
                                    {result.authors.length > 3 && ' et al.'}
                                  </span>
                                )}
                                {result.publication_year && (
                                  <Badge variant="outline" className="text-xs">
                                    {result.publication_year}
                                  </Badge>
                                )}
                                {result.journal && (
                                  <Badge variant="outline" className="text-xs">
                                    {result.journal}
                                  </Badge>
                                )}
                                {result.pdf_link && (
                                  <Badge variant="secondary" className="text-xs">
                                    PDF Available
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {totalResults === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No results found. Try a different query or sources.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

