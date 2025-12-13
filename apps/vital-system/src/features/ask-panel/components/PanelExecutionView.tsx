/**
 * Panel Execution View
 * 
 * Displays panel setup with real agent cards and allows users to run panels and collect results
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Play,
  Loader2,
  CheckCircle2,
  Users,
  Bot,
  MessageSquare,
  Sparkles,
  Clock,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { EnhancedAgentCard, AgentCardGrid } from '@vital/ui';
import { agentApi } from '@/features/agents/services/agent-api';
import type { Agent as ApiAgent } from '@/features/agents/types/agent.types';
import type { Agent as StoreAgent } from '@/lib/stores/agents-store';
import { useAgentsStore } from '@/lib/stores/agents-store';
import {
  __Popover as Popover,
  __PopoverContent as PopoverContent,
  __PopoverTrigger as PopoverTrigger,
} from '@/components/ui/popover';
import { createClient } from '@vital/sdk/client';
import { STARTUP_TENANT_ID } from '@/lib/constants/tenant';
import type { SavedPanel } from '@/contexts/ask-panel-context';
import { StreamingPanelConsultation } from '@/components/ask-panel/StreamingPanelConsultation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PanelExecutionViewProps {
  panel: SavedPanel;
  onBack: () => void;
}

export function PanelExecutionView({ panel, onBack }: PanelExecutionViewProps) {
  const [question, setQuestion] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [agents, setAgents] = useState<StoreAgent[]>([]);
  const [allAvailableAgents, setAllAvailableAgents] = useState<StoreAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAllAgents, setLoadingAllAgents] = useState(false);
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
  const [useStreaming, setUseStreaming] = useState(true); // Enable streaming by default
  const [showStreamingView, setShowStreamingView] = useState(false);
  const [showAllAgents, setShowAllAgents] = useState(false);

  // Use agents from store (same as agent view)
  const { agents: storeAgents, loadAgents: loadStoreAgents } = useAgentsStore();

  const IconComponent = panel.IconComponent || Users;

  // Load agents from store (same as agent view) - ensures we use the same data source
  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoadingAllAgents(true);
        // Load agents into store if not already loaded
        if (storeAgents.length === 0) {
          await loadStoreAgents(false);
          // After loading, storeAgents will be updated by the store, triggering this effect again
          return;
        }
        // Use agents from store (already in correct format for EnhancedAgentCard)
        // Always sync with storeAgents whenever it changes
        setAllAvailableAgents([...storeAgents]); // Create new array reference to ensure React detects the change
        console.log(`[PanelExecutionView] Loaded ${storeAgents.length} agents from store`);
      } catch (error) {
        console.error('[PanelExecutionView] Error loading agents from store:', error);
        setAllAvailableAgents([]);
      } finally {
        setLoadingAllAgents(false);
      }
    };

    loadAgents();
  }, [storeAgents, loadStoreAgents]); // Sync whenever storeAgents changes (not just length)

  // Helper function to normalize strings for matching (remove special chars, lowercase)
  const normalizeForMatch = useCallback((str: string): string => {
    return (str || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric
      .trim();
  }, []);

  // Helper function to convert display name to slug format (e.g., "FDA Regulatory Strategist" -> "fdaregulatorystrategist")
  const displayNameToSlug = useCallback((displayName: string): string => {
    return (displayName || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric
      .trim();
  }, []);

  // Filter panel's suggested agents from store agents
  useEffect(() => {
    try {
      setLoading(true);
      
      // Always ensure we have all agents from panel.suggestedAgents (should be 10)
      const allAgentNames = panel.suggestedAgents || [];
      console.log(`[PanelExecutionView] Filtering ${allAgentNames.length} suggested agents for panel:`, panel.name);
      console.log(`[PanelExecutionView] Suggested agent slugs:`, allAgentNames);
      console.log(`[PanelExecutionView] Total store agents available:`, storeAgents.length);

      // Filter store agents to only panel-suggested agents by name, display_name, or slug
      // Panel suggestedAgents can be slugs (e.g., "fda-regulatory-strategist") or names
      const fetchedAgents = storeAgents.filter(agent => {
        const agentName = (agent.name || '').trim();
        const agentDisplayName = (agent.display_name || '').trim();
        const agentSlug = ((agent as any).slug || '').trim();
        
        // Normalize all agent identifiers
        const normalizedName = normalizeForMatch(agentName);
        const normalizedDisplayName = normalizeForMatch(agentDisplayName);
        const normalizedSlug = normalizeForMatch(agentSlug);
        
        return allAgentNames.some(suggestedName => {
          const normalizedSuggested = normalizeForMatch(suggestedName);
          
          // Exact matches (case-insensitive)
          if (
            suggestedName.toLowerCase() === agentName.toLowerCase() ||
            suggestedName.toLowerCase() === agentDisplayName.toLowerCase() ||
            suggestedName.toLowerCase() === agentSlug.toLowerCase()
          ) {
            return true;
          }
          
          // Normalized matches (handles hyphens, spaces, underscores)
          if (
            normalizedSuggested === normalizedName ||
            normalizedSuggested === normalizedDisplayName ||
            normalizedSuggested === normalizedSlug
          ) {
            return true;
          }
          
          // Partial matches (e.g., "biostatistician-digital-health" matches "Biostatistician Digital Health")
          // Check if all words in suggested name appear in agent name/display_name
          const suggestedWords = normalizedSuggested.match(/[a-z]+/g) || [];
          if (suggestedWords.length > 0) {
            const agentText = `${normalizedName} ${normalizedDisplayName}`;
            if (suggestedWords.every(word => word.length > 2 && agentText.includes(word))) {
              return true;
            }
          }
          
          // Also try matching by converting display name to slug format
          // e.g., "FDA Regulatory Strategist" -> "fdaregulatorystrategist" matches "fda-regulatory-strategist"
          const agentDisplaySlug = displayNameToSlug(agentDisplayName);
          if (normalizedSuggested === agentDisplaySlug) {
            return true;
          }
          
          return false;
        });
      });

      // Filter out any invalid IDs
      const realAgents = fetchedAgents.filter(agent => 
        agent.id && !agent.id.startsWith('fallback-') && !agent.id.startsWith('agent-')
      );

      if (realAgents.length === 0) {
        console.warn(
          `[PanelExecutionView] No real agents found in database for panel "${panel.name}". ` +
          `Expected agents: ${allAgentNames.join(', ')}. ` +
          `Please ensure these agents exist in the 'agents' table.`
        );
      } else {
        // Calculate missing agents using the same matching logic as the filter
        const missingAgents = allAgentNames.filter(suggestedName => {
          return !realAgents.some(agent => {
            const agentName = (agent.name || '').trim();
            const agentDisplayName = (agent.display_name || '').trim();
            const agentSlug = ((agent as any).slug || '').trim();
            
            const normalizedSuggested = normalizeForMatch(suggestedName);
            const normalizedName = normalizeForMatch(agentName);
            const normalizedDisplayName = normalizeForMatch(agentDisplayName);
            const normalizedSlug = normalizeForMatch(agentSlug);
            
            // Exact matches (case-insensitive)
            if (
              suggestedName.toLowerCase() === agentName.toLowerCase() ||
              suggestedName.toLowerCase() === agentDisplayName.toLowerCase() ||
              suggestedName.toLowerCase() === agentSlug.toLowerCase()
            ) {
              return true;
            }
            
            // Normalized matches (handles hyphens, spaces, underscores)
            if (
              normalizedSuggested === normalizedName ||
              normalizedSuggested === normalizedDisplayName ||
              normalizedSuggested === normalizedSlug
            ) {
              return true;
            }
            
            // Partial matches (e.g., "biostatistician-digital-health" matches "Biostatistician Digital Health")
            const suggestedWords = normalizedSuggested.match(/[a-z]+/g) || [];
            if (suggestedWords.length > 0) {
              const agentText = `${normalizedName} ${normalizedDisplayName}`;
              if (suggestedWords.every(word => word.length > 2 && agentText.includes(word))) {
                return true;
              }
            }
            
            // Also try matching by converting display name to slug format
            const agentDisplaySlug = displayNameToSlug(agentDisplayName);
            if (normalizedSuggested === agentDisplaySlug) {
              return true;
            }
            
            return false;
          });
        });
        
        console.log(
          `[PanelExecutionView] Found ${realAgents.length} real agents out of ${allAgentNames.length} expected. ` +
          (missingAgents.length > 0 ? `Missing: ${missingAgents.join(', ')}` : 'All expected agents found!')
        );
      }

      setAgents(realAgents);
      // Select all real agents by default
      setSelectedAgentIds(new Set(realAgents.map(a => a.id)));
      
      // Log matched agents for debugging
      if (realAgents.length > 0) {
        console.log(`[PanelExecutionView] Matched agents:`, realAgents.map(a => ({
          id: a.id,
          name: a.name,
          display_name: a.display_name,
          slug: (a as any).slug
        })));
      }
    } catch (error) {
      console.error('[PanelExecutionView] Error filtering agents:', error);
      setAgents([]);
      setSelectedAgentIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [panel.suggestedAgents, panel.name, panel.category, storeAgents, normalizeForMatch, displayNameToSlug]);

  const handleRun = async () => {
    // Get all selected agents from the full list, not just panel's suggested ones
    // Fallback to storeAgents if allAvailableAgents is empty (handles race condition)
    const agentsSource = allAvailableAgents.length > 0 ? allAvailableAgents : storeAgents;
    const activeAgents = agentsSource.filter((a) => selectedAgentIds.has(a.id));
    if (!question.trim() || activeAgents.length === 0) return;

    // If streaming is enabled, show streaming view instead
    if (useStreaming) {
      setShowStreamingView(true);
      return;
    }

    setIsRunning(true);
    setResults([]);
    setProgress(0);
    setCurrentAgent(null);

    // Update last_used_at if this is a user custom panel (has UUID format ID)
    if (panel.id && panel.id.length === 36 && panel.id.includes('-')) {
      try {
        await fetch(`/api/user-panels/${panel.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ update_last_used: true }),
        });
      } catch (err) {
        // Silently fail - not critical
        console.debug('Failed to update last_used_at:', err);
      }
    }

    try {
      // Build minimal PanelConfiguration compatible with /api/ask-panel/consult
      const configuration = {
        selectedAgents: activeAgents.map((agent) => ({
          id: agent.id,
          title: agent.name,
          description: agent.description || '',
          category: agent.category || panel.category || 'general',
        })),
        mode: panel.mode === 'collaborative' || panel.mode === 'hybrid' ? panel.mode : 'sequential',
        framework: 'auto' as const,
        executionMode:
          panel.mode === 'sequential' ? 'sequential' : ('conversational' as const),
        userGuidance: 'medium' as const,
        allowDebate: panel.mode !== 'sequential',
        maxRounds: 5,
        requireConsensus: true,
      };

      const response = await fetch('/api/ask-panel/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          configuration,
        }),
      });

      if (!response.ok) {
        console.error('Panel execution failed:', await response.text());
        throw new Error('Panel execution failed');
      }

      const result = await response.json();

      // Map real expert responses into local results format
      if (Array.isArray(result.experts)) {
        const mapped = result.experts.map((expert: any) => {
          const agentMeta =
            activeAgents.find((a) => a.id === expert.agentId) ||
            activeAgents.find((a) => a.name === expert.agentName) ||
            activeAgents[0];

          return {
            agentId: expert.agentId || agentMeta?.id,
            agentName: expert.agentName || agentMeta?.name,
            agentDescription: agentMeta?.description || '',
            response: expert.response || '',
            timestamp: new Date().toISOString(),
            confidence:
              typeof expert.confidence === 'number'
                ? expert.confidence * 100
                : 75,
          };
        });

        setResults(mapped);
        setProgress(100);
      }
    } catch (error) {
      console.error('Error running panel:', error);
    } finally {
      setIsRunning(false);
      setCurrentAgent(null);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading panel agents...</p>
        </div>
      </div>
    );
  }

  // Show streaming view if user clicked run with streaming enabled
  if (showStreamingView) {
    // Filter out any fallback IDs before sending to backend (safety check)
    // Use allAvailableAgents, not just panel-suggested agents
    // Fallback to storeAgents if allAvailableAgents is empty (handles race condition)
    const agentsSource = allAvailableAgents.length > 0 ? allAvailableAgents : storeAgents;
    const activeAgents = agentsSource.filter((a) => {
      const isSelected = selectedAgentIds.has(a.id);
      const isRealAgent = a.id && !a.id.startsWith('fallback-') && !a.id.startsWith('agent-');
      return isSelected && isRealAgent;
    });

    // Validate we have at least one real agent
    if (activeAgents.length === 0) {
      return (
        <div className="h-full flex flex-col bg-background">
          <div className="border-b px-6 py-4">
            <div className="container mx-auto">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowStreamingView(false);
                    setResults([]);
                  }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">{panel.name}</h1>
                    <p className="text-sm text-muted-foreground">Configuration Error</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-destructive mb-2">No Valid Agents Selected</h2>
                <p className="text-muted-foreground mb-4">
                  No valid agents were selected. Please select at least 2 agents from the available agents list.
                </p>
                {selectedAgentIds.size > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Selected agent IDs:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                      {Array.from(selectedAgentIds).map((id) => (
                        <li key={id}>{id}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {allAvailableAgents.length === 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      No agents found in database. Please create agents first.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expected panel agents: {(panel.suggestedAgents || []).join(', ')}
                    </p>
                  </div>
                )}
                <Button
                  className="mt-4"
                  onClick={() => {
                    setShowStreamingView(false);
                    setResults([]);
                  }}
                >
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col bg-background">
        {/* Header with back button */}
        <div className="border-b px-6 py-4">
          <div className="container mx-auto">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowStreamingView(false);
                  setResults([]);
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{panel.name}</h1>
                  <p className="text-sm text-muted-foreground">Real-time Streaming</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Streaming Consultation View */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <StreamingPanelConsultation
              question={question}
              panelId={panel.id}
              agentIds={activeAgents.map(a => a.id)}
              tenantId={STARTUP_TENANT_ID}
              enableDebate={true}
              maxRounds={3}
              onComplete={(messages) => {
                console.log('✅ Panel consultation completed', messages);
              }}
              onError={(error) => {
                console.error('❌ Panel consultation error:', error);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{panel.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Run panel consultation
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="capitalize">
              {panel.category}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8 space-y-6">
          {/* Panel Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Panel Configuration
              </CardTitle>
              <CardDescription>
                Select which agents to activate ({Array.from(selectedAgentIds).length} selected). {allAvailableAgents.length > 0 ? `${allAvailableAgents.length} total agents available` : `${agents.length} panel-suggested agents`} working in {panel.mode} mode.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mode</p>
                  <Badge variant="outline" className="capitalize">
                    {panel.mode}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Agents</p>
                  <Badge variant="outline">
                    <Bot className="w-3 h-3 mr-1" />
                    {Array.from(selectedAgentIds).length}/{agents.length}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Est. Time</p>
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    ~{Array.from(selectedAgentIds).length * 2}min
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Category</p>
                  <Badge variant="secondary" className="capitalize text-xs">
                    {panel.category}
                  </Badge>
                </div>
              </div>

              {/* Expert Agents Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Expert Agents</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs flex items-center gap-1"
                      >
                        <Bot className="w-3 h-3" />
                        Choose experts ({Array.from(selectedAgentIds).length}/{allAvailableAgents.length || agents.length})
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-3 space-y-2">
                      <p className="text-xs text-muted-foreground mb-1">
                        Select which experts should participate in this run. Showing {allAvailableAgents.length} available agents.
                      </p>
                      {loadingAllAgents ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
                        </div>
                      ) : (
                        <div className="max-h-60 overflow-y-auto space-y-1">
                          {allAvailableAgents.map((agent) => {
                            const checked = selectedAgentIds.has(agent.id);
                            const agentSlug = (agent as any).slug || '';
                            // Helper to normalize for matching
                            const normalizeForMatch = (str: string): string => {
                              return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
                            };
                            
                            const isPanelSuggested = panel.suggestedAgents?.some(suggestedName => {
                              const normalizedSuggested = normalizeForMatch(suggestedName);
                              const normalizedName = normalizeForMatch(agent.name || '');
                              const normalizedDisplayName = normalizeForMatch(agent.display_name || '');
                              const normalizedSlug = normalizeForMatch(agentSlug);
                              
                              return (
                                normalizedSuggested === normalizedName ||
                                normalizedSuggested === normalizedDisplayName ||
                                normalizedSuggested === normalizedSlug ||
                                suggestedName.toLowerCase() === agent.name?.toLowerCase() ||
                                suggestedName.toLowerCase() === agent.display_name?.toLowerCase() ||
                                suggestedName.toLowerCase() === agentSlug.toLowerCase()
                              );
                            });
                            return (
                              <label
                                key={agent.id}
                                className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer"
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(value) => {
                                    setSelectedAgentIds((prev) => {
                                      const next = new Set(prev);
                                      if (value) {
                                        next.add(agent.id);
                                      } else {
                                        next.delete(agent.id);
                                      }
                                      return next;
                                    });
                                  }}
                                  className="mt-0.5 h-3.5 w-3.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <div className="text-xs font-medium truncate">
                                      {agent.name}
                                    </div>
                                    {isPanelSuggested && (
                                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                                        Panel
                                      </Badge>
                                    )}
                                  </div>
                                  {agent.specialty && (
                                    <div className="text-[11px] text-muted-foreground truncate">
                                      {agent.specialty}
                                    </div>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                          {allAvailableAgents.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-4">
                              No agents available. Please create agents in the database first.
                            </p>
                          )}
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Selected agents summary cards */}
                <AgentCardGrid columns={4} className="gap-3">
                  {allAvailableAgents
                    .filter((agent) => selectedAgentIds.has(agent.id))
                    .map((agent) => (
                      <EnhancedAgentCard
                        key={agent.id}
                        agent={agent}
                        isSelected={true}
                        onClick={() => {
                          setSelectedAgentIds((prev) => {
                            const next = new Set(prev);
                            next.delete(agent.id);
                            return next;
                          });
                        }}
                        showLevel={true}
                        showLevelName={true}
                        size="sm"
                      />
                    ))}
                </AgentCardGrid>
                {Array.from(selectedAgentIds).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No experts selected. Use "Choose experts" or "Show All Agents" to pick who should participate.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* All Available Agents Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    All Available Real Agents
                  </CardTitle>
                  <CardDescription>
                    Browse and select from all {allAvailableAgents.length} real agents available in your database
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllAgents(!showAllAgents)}
                >
                  {showAllAgents ? 'Hide' : 'Show'} All Agents
                </Button>
              </div>
            </CardHeader>
            {showAllAgents && (
              <CardContent>
                {loadingAllAgents ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading agents...</span>
                  </div>
                ) : allAvailableAgents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No agents found in database. Please create agents first.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {allAvailableAgents.length} total agents available
                      </span>
                      <Badge variant="secondary">
                        {allAvailableAgents.filter(a => selectedAgentIds.has(a.id)).length} selected
                      </Badge>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto">
                      <AgentCardGrid columns={3} className="gap-4">
                        {allAvailableAgents.map((agent) => {
                          const isSelected = selectedAgentIds.has(agent.id);
                          const agentSlug = (agent as any).slug || '';
                          
                          // Helper to normalize for matching
                          const normalizeForMatch = (str: string): string => {
                            return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
                          };
                          
                          const isPanelSuggested = panel.suggestedAgents?.some(suggestedName => {
                            const normalizedSuggested = normalizeForMatch(suggestedName);
                            const normalizedName = normalizeForMatch(agent.name || '');
                            const normalizedDisplayName = normalizeForMatch(agent.display_name || '');
                            const normalizedSlug = normalizeForMatch(agentSlug);
                            
                            return (
                              normalizedSuggested === normalizedName ||
                              normalizedSuggested === normalizedDisplayName ||
                              normalizedSuggested === normalizedSlug ||
                              suggestedName.toLowerCase() === agent.name?.toLowerCase() ||
                              suggestedName.toLowerCase() === agent.display_name?.toLowerCase() ||
                              suggestedName.toLowerCase() === agentSlug.toLowerCase()
                            );
                          });
                          return (
                            <div key={agent.id} className="relative">
                              <EnhancedAgentCard
                                agent={agent}
                                isSelected={isSelected}
                                onClick={() => {
                                  setSelectedAgentIds((prev) => {
                                    const next = new Set(prev);
                                    if (isSelected) {
                                      next.delete(agent.id);
                                    } else {
                                      next.add(agent.id);
                                    }
                                    return next;
                                  });
                                }}
                                showLevel={true}
                                showLevelName={true}
                                size="md"
                              />
                              {isPanelSuggested && (
                                <Badge 
                                  variant="outline" 
                                  className="absolute top-2 right-2 text-xs z-10 bg-white dark:bg-gray-800"
                                >
                                  Panel
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </AgentCardGrid>
                    </div>
                    {allAvailableAgents.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          💡 Tip: Select at least 2 agents to run a panel consultation. 
                          Agents marked with "Panel" are suggested for this panel type.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Your Question
              </CardTitle>
              <CardDescription>
                Describe your question or scenario for the expert panel to analyze
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="E.g., I need help designing a clinical trial for a digital therapeutic targeting depression..."
                className="min-h-[120px]"
                disabled={isRunning}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-xs text-muted-foreground">
                    {question.length} characters
                  </p>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="streaming-mode"
                      checked={useStreaming}
                      onCheckedChange={setUseStreaming}
                      disabled={isRunning}
                    />
                    <Label htmlFor="streaming-mode" className="text-xs text-muted-foreground cursor-pointer">
                      {useStreaming ? '⚡ Real-time Streaming' : '📦 Batch Mode'}
                    </Label>
                  </div>
                </div>
                <Button
                  onClick={handleRun}
                  disabled={!question.trim() || isRunning || Array.from(selectedAgentIds).length === 0}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running Panel...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Panel
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress Section */}
          {isRunning && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing
                </CardTitle>
                <CardDescription>
                  Panel is consulting with expert agents...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                {currentAgent && (
                  <div className="flex items-center gap-2 text-sm">
                    <Bot className="w-4 h-4 text-purple-500 animate-pulse" />
                    <span className="text-muted-foreground">
                      Consulting with <strong>{currentAgent}</strong>...
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Panel Results
                </CardTitle>
                <CardDescription>
                  Responses from {results.length} of {agents.length} expert agents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.map((result, index) => (
                  <Card key={index} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base mb-1">{result.agentName}</CardTitle>
                            {result.agentDescription && (
                              <p className="text-xs text-muted-foreground">{result.agentDescription}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline" className="text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {Math.round(result.confidence)}% confidence
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {result.response}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Completion Message */}
          {!isRunning && results.length === agents.length && (
            <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-900/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 dark:text-green-100">
                      Panel Consultation Complete!
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      All {agents.length} expert agents have provided their insights.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuestion('');
                      setResults([]);
                      setProgress(0);
                    }}
                  >
                    New Consultation
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
