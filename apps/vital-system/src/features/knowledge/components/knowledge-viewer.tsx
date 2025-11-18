'use client';

import {
  Search,
  FileText,
  ExternalLink,
  Clock,
  Database,
  Filter,
  ChevronRight,
  BookOpen,
  Globe,
  User,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent } from '@vital/ui';
import { Input } from '@vital/ui';
import { cn } from '@vital/ui/lib/utils';

interface KnowledgeChunk {
  id: string;
  content: string;
  title: string;
  source: string;
  sourceType: string;
  domain: string;
  similarity: number;
  isGlobal: boolean;
  agentId?: string;
  metadata: {
    page?: number;
    section?: string;
    uploadedAt: string;
    chunkIndex: number;
  };
}

interface SearchResult {
  query: string;
  results: KnowledgeChunk[];
  totalResults: number;
  searchTime: number;
}

export function KnowledgeViewer() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedScope, setSelectedScope] = useState('all');
  const [expandedChunk, setExpandedChunk] = useState<string | null>(null);

  const domains = [
    { value: 'all', label: 'All Domains' },
    { value: 'digital-health', label: 'Digital Health' },
    { value: 'clinical-research', label: 'Clinical Research' },
    { value: 'market-access', label: 'Market Access' },
    { value: 'regulatory', label: 'Regulatory' },
    { value: 'quality-assurance', label: 'Quality Assurance' },
    { value: 'health-economics', label: 'Health Economics' },
  ];

  const mockResults: KnowledgeChunk[] = [
    {
      id: '1',
      content: 'Digital health technologies must undergo rigorous validation processes to ensure safety and efficacy. The FDA has established specific guidelines for software as medical devices (SaMD) that outline the requirements for clinical evidence, risk management, and post-market surveillance. These guidelines emphasize the importance of real-world evidence and continuous monitoring of device performance.',
      title: 'FDA Digital Health Guidelines - Software as Medical Device',
      source: 'FDA Digital Health Guidelines.pdf',
      sourceType: 'PDF',
      domain: 'digital-health',
      similarity: 0.95,
      isGlobal: true,
      metadata: {
        page: 23,
        section: 'Software as Medical Device (SaMD)',
        uploadedAt: '2024-01-15T10:30:00Z',
        chunkIndex: 15,
      },
    },
    {
      id: '2',
      content: 'Clinical trial design for digital therapeutics requires special consideration of digital endpoints and remote monitoring capabilities. Traditional endpoint measurement may not capture the full therapeutic benefit of digital interventions. Researchers should consider incorporating patient-reported outcomes, behavioral analytics, and real-time physiological data to create a comprehensive efficacy profile.',
      title: 'Clinical Trial Design Best Practices - Digital Endpoints',
      source: 'Clinical Trial Design Best Practices.docx',
      sourceType: 'Word Document',
      domain: 'clinical-research',
      similarity: 0.88,
      isGlobal: true,
      metadata: {
        section: 'Digital Endpoints and Remote Monitoring',
        uploadedAt: '2024-01-14T14:20:00Z',
        chunkIndex: 8,
      },
    },
    {
      id: '3',
      content: 'Market access strategies for digital health solutions must address unique value propositions that traditional pharmaceuticals do not offer. Payers are increasingly interested in real-world outcomes, cost-effectiveness data, and the ability to demonstrate population health improvements. Digital solutions should emphasize their ability to provide continuous care, reduce healthcare utilization, and improve patient engagement.',
      title: 'Market Access Strategies - Digital Health Value Proposition',
      source: 'Market Access Strategies.pdf',
      sourceType: 'PDF',
      domain: 'market-access',
      similarity: 0.82,
      isGlobal: false,
      agentId: 'market-access',
      metadata: {
        page: 45,
        section: 'Digital Health Value Proposition',
        uploadedAt: '2024-01-13T09:15:00Z',
        chunkIndex: 22,
      },
    },
  ];

  const performSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);

    try {
      const response = await fetch('/api/knowledge/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          domain: selectedDomain,
          scope: selectedScope,
          limit: 10,
          // Note: agentId would be passed here if we had a selected agent context
          // agentId: selectedAgent?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const result = await response.json();

      if (result.success) {
        setSearchResults({
          query,
          results: result.results,
          totalResults: result.totalResults,
          searchTime: result.searchTime,
        });
      } else {
        throw new Error(result.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to mock results on error
      const filteredResults = mockResults.filter((result: any) => {
        const domainMatch = selectedDomain === 'all' || result.domain === selectedDomain;
        const scopeMatch = selectedScope === 'all' ||
          (selectedScope === 'global' && result.isGlobal) ||
          (selectedScope === 'agent' && !result.isGlobal);

        return domainMatch && scopeMatch;
      });

      setSearchResults({
        query,
        results: filteredResults,
        totalResults: filteredResults.length,
        searchTime: 1500,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDomainColor = (domain: string) => {
    const colors = {
      'digital-health': 'bg-trust-blue/10 text-trust-blue border-trust-blue/20',
      'clinical-research': 'bg-progress-teal/10 text-progress-teal border-progress-teal/20',
      'market-access': 'bg-market-purple/10 text-market-purple border-market-purple/20',
      'regulatory': 'bg-clinical-green/10 text-clinical-green border-clinical-green/20',
      'quality-assurance': 'bg-amber-100 text-amber-800 border-amber-200',
      'health-economics': 'bg-rose-100 text-rose-800 border-rose-200',
    };
    return colors[domain as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.trim()})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medical-gray" />
          <Input
            placeholder="Search knowledge base... (e.g., 'FDA approval process', 'clinical trial design')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-20"
          />
          <Button
            onClick={performSearch}
            disabled={!query.trim() || isSearching}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-progress-teal hover:bg-progress-teal/90"
            size="sm"
          >
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-medical-gray" />
            <span className="text-sm text-medical-gray">Filters:</span>
          </div>

          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            {domains.map((domain: any) => (
              <option key={domain.value} value={domain.value}>
                {domain.label}
              </option>
            ))}
          </select>

          <select
            value={selectedScope}
            onChange={(e) => setSelectedScope(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Knowledge</option>
            <option value="global">Global Only</option>
            <option value="agent">Agent-Specific Only</option>
          </select>
        </div>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-deep-charcoal">
                Search Results for "{searchResults.query}"
              </h3>
              <Badge variant="outline">
                {searchResults.totalResults} results
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-medical-gray">
              <Clock className="h-3 w-3" />
              {searchResults.searchTime}ms
            </div>
          </div>

          {/* Results List */}
          {searchResults.results.length > 0 ? (
            <div className="space-y-4">
              {searchResults.results.map((result) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-trust-blue" />
                            <h4 className="font-medium text-deep-charcoal">
                              {result.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-medical-gray">
                            <span>{result.source}</span>
                            <span>•</span>
                            <span>{formatDate(result.metadata.uploadedAt)}</span>
                            {result.metadata.page && (
                              <>
                                <span>•</span>
                                <span>Page {result.metadata.page}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getDomainColor(result.domain)}>
                            {domains.find((d: any) => d.value === result.domain)?.label}
                          </Badge>
                          <Badge variant={result.isGlobal ? 'default' : 'secondary'}>
                            {result.isGlobal ? (
                              <><Globe className="h-3 w-3 mr-1" />Global</>
                            ) : (
                              <><User className="h-3 w-3 mr-1" />Agent</>
                            )}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(result.similarity * 100)}% match
                          </Badge>
                        </div>
                      </div>

                      {/* Content Preview */}
                      <div className="text-sm text-deep-charcoal">
                        <p className={cn(
                          'line-clamp-3',
                          expandedChunk === result.id && 'line-clamp-none'
                        )}>
                          {highlightText(result.content, searchResults.query)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedChunk(
                              expandedChunk === result.id ? null : result.id
                            )}
                          >
                            {expandedChunk === result.id ? 'Show Less' : 'Read More'}
                            <ChevronRight className={cn(
                              'ml-1 h-3 w-3 transition-transform',
                              expandedChunk === result.id && 'rotate-90'
                            )} />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="mr-1 h-3 w-3" />
                            View Source
                          </Button>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-medical-gray">
                          <Database className="h-3 w-3" />
                          Chunk {result.metadata.chunkIndex}
                          {result.metadata.section && (
                            <>
                              <span>•</span>
                              <span>{result.metadata.section}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-medical-gray mx-auto mb-4" />
                <h3 className="font-semibold text-deep-charcoal mb-2">
                  No results found
                </h3>
                <p className="text-medical-gray">
                  Try adjusting your search terms or filters to find relevant knowledge.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Initial State */}
      {!searchResults && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-medical-gray mx-auto mb-4" />
            <h3 className="font-semibold text-deep-charcoal mb-2">
              Search Global Knowledge Base
            </h3>
            <p className="text-medical-gray mb-4">
              Search through uploaded documents, guidelines, and resources to find relevant information for your agents.
            </p>
            <div className="text-sm text-medical-gray">
              <p className="mb-2"><strong>Example searches:</strong></p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-50" onClick={() => setQuery('FDA approval process')}>
                  FDA approval process
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-50" onClick={() => setQuery('clinical trial design')}>
                  clinical trial design
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-50" onClick={() => setQuery('market access')}>
                  market access
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-50" onClick={() => setQuery('digital therapeutics')}>
                  digital therapeutics
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}