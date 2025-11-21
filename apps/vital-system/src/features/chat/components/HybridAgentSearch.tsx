/**
 * Hybrid Agent Search Component
 *
 * React component demonstrating integration with the Python hybrid search API
 *
 * Features:
 * - Real-time search with debouncing
 * - Advanced filtering (domains, capabilities, tier)
 * - WebSocket support for live results
 * - Performance metrics display
 * - Error handling and loading states
 *
 * Created: 2025-10-24
 * Phase: 3 Week 4 - Production Integration
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, X, Zap, TrendingUp, Users, Layers } from 'lucide-react';
import { Button } from '@vital/ui';
import { Input } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@vital/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@vital/ui';
import { Skeleton } from '@vital/ui';
import { Alert, AlertDescription } from '@vital/ui';

import {
  HybridSearchClient,
  SearchRequest,
  SearchResponse,
  AgentResult
} from '@/services/hybrid-search-client';

// ============================================================================
// TYPES
// ============================================================================

interface HybridAgentSearchProps {
  onAgentSelect?: (agent: AgentResult) => void;
  defaultQuery?: string;
  enableWebSocket?: boolean;
  showPerformanceMetrics?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function HybridAgentSearch({
  onAgentSelect,
  defaultQuery = '',
  enableWebSocket = false,
  showPerformanceMetrics = true
}: HybridAgentSearchProps) {
  // State
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState<AgentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMetrics, setSearchMetrics] = useState<{
    searchTimeMs: number;
    cacheHit: boolean;
    totalResults: number;
  } | null>(null);

  // Filters
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3 | null>(null);
  const [maxResults, setMaxResults] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  // Client
  const searchClient = useMemo(() => new HybridSearchClient({
    enableLogging: true
  }), []);

  // WebSocket state
  const [wsConnected, setWsConnected] = useState(false);

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  useEffect(() => {
    if (enableWebSocket) {
      const clientId = `client-${Math.random().toString(36).substring(7)}`;
      searchClient.connectWebSocket(clientId, (message) => {
        if (message.status === 'results' && message.results) {
          setResults(message.results);
          setSearchMetrics({
            searchTimeMs: message.searchTimeMs || 0,
            cacheHit: false,
            totalResults: message.totalResults || 0
          });
          setLoading(false);
        } else if (message.status === 'error') {
          setError(message.error || 'Search failed');
          setLoading(false);
        }
      });
      setWsConnected(true);

      return () => {
        searchClient.disconnectWebSocket();
        setWsConnected(false);
      };
    }
  }, [enableWebSocket, searchClient]);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([]);
      setSearchMetrics(null);
      return;
    }

    const timer = setTimeout(() => {
      performSearch();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query, selectedDomains, selectedCapabilities, selectedTier, maxResults]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const performSearch = async () => {
    if (!query || query.length < 3) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchRequest: SearchRequest = {
        query,
        domains: selectedDomains.length > 0 ? selectedDomains : undefined,
        capabilities: selectedCapabilities.length > 0 ? selectedCapabilities : undefined,
        tier: selectedTier || undefined,
        maxResults,
        includeGraphContext: true,
        useCache: true
      };

      if (enableWebSocket && wsConnected) {
        // Use WebSocket
        await searchClient.searchWebSocket(searchRequest, (message) => {
          if (message.status === 'results' && message.results) {
            setResults(message.results);
            setSearchMetrics({
              searchTimeMs: message.searchTimeMs || 0,
              cacheHit: false,
              totalResults: message.totalResults || 0
            });
            setLoading(false);
          } else if (message.status === 'error') {
            setError(message.error || 'Search failed');
            setLoading(false);
          }
        });
      } else {
        // Use REST API
        const response: SearchResponse = await searchClient.searchAgents(searchRequest);

        setResults(response.results);
        setSearchMetrics({
          searchTimeMs: response.searchTimeMs,
          cacheHit: response.cacheHit,
          totalResults: response.totalResults
        });
        setLoading(false);
      }

    } catch (err) {
      console.error('Search failed:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedDomains([]);
    setSelectedCapabilities([]);
    setSelectedTier(null);
    setMaxResults(10);
  };

  const getTierBadgeColor = (tier: number): string => {
    switch (tier) {
      case 1: return 'bg-yellow-500 text-white';
      case 2: return 'bg-blue-500 text-white';
      case 3: return 'bg-gray-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getTierLabel = (tier: number): string => {
    switch (tier) {
      case 1: return 'Elite';
      case 2: return 'Advanced';
      case 3: return 'Specialist';
      default: return 'Unknown';
    }
  };

  const formatScore = (score: number): string => {
    return `${(score * 100).toFixed(1)}%`;
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search for agents (e.g., 'FDA regulatory submissions')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        {enableWebSocket && (
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{wsConnected ? 'Live' : 'Disconnected'}</span>
          </div>
        )}
        {searchMetrics && showPerformanceMetrics && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>{searchMetrics.searchTimeMs.toFixed(0)}ms</span>
            </div>
            {searchMetrics.cacheHit && (
              <Badge variant="secondary" className="text-xs">
                Cached
              </Badge>
            )}
            <span>{searchMetrics.totalResults} results</span>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Advanced Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tier</label>
                <Select
                  value={selectedTier?.toString() || 'all'}
                  onValueChange={(value) => setSelectedTier(value === 'all' ? null : parseInt(value) as 1 | 2 | 3)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="1">Tier 1 - Elite</SelectItem>
                    <SelectItem value="2">Tier 2 - Advanced</SelectItem>
                    <SelectItem value="3">Tier 3 - Specialist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Max Results</label>
                <Select
                  value={maxResults.toString()}
                  onValueChange={(value) => setMaxResults(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 results</SelectItem>
                    <SelectItem value="10">10 results</SelectItem>
                    <SelectItem value="20">20 results</SelectItem>
                    <SelectItem value="50">50 results</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="space-y-3">
          {results.map((agent) => (
            <Card
              key={agent.agentId}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onAgentSelect?.(agent)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={agent.avatarUrl} alt={agent.displayName || agent.name} />
                    <AvatarFallback>
                      {(agent.displayName || agent.name).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">
                          {agent.displayName || agent.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {agent.description || 'No description available'}
                        </p>
                      </div>

                      {/* Overall Score */}
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatScore(agent.overallScore)}
                        </div>
                        <Badge className={getTierBadgeColor(agent.tier)}>
                          {getTierLabel(agent.tier)}
                        </Badge>
                      </div>
                    </div>

                    {/* Domains & Capabilities */}
                    <div className="mt-3 space-y-2">
                      {agent.domains.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Layers className="h-3 w-3 text-gray-400" />
                          {agent.domains.slice(0, 3).map((domain) => (
                            <Badge key={domain} variant="outline" className="text-xs">
                              {domain}
                            </Badge>
                          ))}
                          {agent.domains.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{agent.domains.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Score Breakdown */}
                    {showPerformanceMetrics && (
                      <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                        <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                          <TrendingUp className="h-3 w-3 text-purple-500 mb-1" />
                          <span className="font-medium">{formatScore(agent.vectorScore)}</span>
                          <span className="text-gray-500">Vector</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                          <Layers className="h-3 w-3 text-blue-500 mb-1" />
                          <span className="font-medium">{formatScore(agent.domainScore)}</span>
                          <span className="text-gray-500">Domain</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                          <Zap className="h-3 w-3 text-yellow-500 mb-1" />
                          <span className="font-medium">{formatScore(agent.capabilityScore)}</span>
                          <span className="text-gray-500">Capability</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                          <Users className="h-3 w-3 text-green-500 mb-1" />
                          <span className="font-medium">{formatScore(agent.graphScore)}</span>
                          <span className="text-gray-500">Graph</span>
                        </div>
                      </div>
                    )}

                    {/* Graph Context */}
                    {agent.escalationPaths && agent.escalationPaths.length > 0 && (
                      <div className="mt-3 text-xs text-gray-600">
                        <Users className="h-3 w-3 inline mr-1" />
                        Works with: {agent.escalationPaths.slice(0, 2).map((p: any) => p.toAgentName).join(', ')}
                        {agent.escalationPaths.length > 2 && ` +${agent.escalationPaths.length - 2} more`}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && query.length >= 3 && results.length === 0 && !error && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No agents found for "{query}"</p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search query or filters
            </p>
          </CardContent>
        </Card>
      )}

      {/* Initial State */}
      {!loading && query.length < 3 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Start typing to search for agents</p>
            <p className="text-sm text-gray-500 mt-2">
              Minimum 3 characters required
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default HybridAgentSearch;
