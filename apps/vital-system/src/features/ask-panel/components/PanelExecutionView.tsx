/**
 * Panel Execution View
 * 
 * Displays panel setup with real agent cards and allows users to run panels and collect results
 */

'use client';

import React, { useState, useEffect } from 'react';
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

interface Agent {
  id: string;
  name: string;
  description: string;
  category?: string;
  specialty?: string;
  expertise?: string[];
  status?: string;
}

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
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
  const [useStreaming, setUseStreaming] = useState(true); // Enable streaming by default
  const [showStreamingView, setShowStreamingView] = useState(false);

  const IconComponent = panel.IconComponent || Users;
  const supabase = createClient();

  // Fetch real agents from database
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        
        // Always ensure we have all agents from panel.suggestedAgents (should be 10)
        const allAgentNames = panel.suggestedAgents || [];
        console.log(`[PanelExecutionView] Loading ${allAgentNames.length} agents for panel:`, panel.name);
        
        // Try to fetch agents by name from database
        let fetchedAgents: Agent[] = [];
        try {
          const { data, error } = await supabase
            .from('agents')
            .select('*')
            .eq('tenant_id', STARTUP_TENANT_ID)
            .in('name', allAgentNames);

          if (!error && data) {
            fetchedAgents = data.map((agent: any) => ({
              id: agent.id || `agent-${agent.name}`,
              name: agent.name,
              description: agent.description || agent.display_name || `Expert agent: ${agent.name}`,
              category: agent.category || panel.category,
              specialty: agent.specialty || agent.medical_specialty,
              expertise: agent.expertise || agent.capabilities || [],
              status: agent.status || 'active',
            }));
            console.log(`[PanelExecutionView] Found ${fetchedAgents.length} agents in database`);
          }
        } catch (dbError) {
          console.warn('[PanelExecutionView] Database query failed, using fallback agents:', dbError);
        }

        // Create a map of fetched agents by name for quick lookup
        const fetchedAgentMap = new Map(fetchedAgents.map(a => [a.name, a]));
        
        // Build complete list: use fetched agents where available, create fallback for missing ones
        const completeAgents: Agent[] = allAgentNames.map((name, index) => {
          const fetched = fetchedAgentMap.get(name);
          if (fetched) {
            return fetched;
          }
          // Create fallback agent for any missing from database
          return {
            id: `fallback-${name}-${index}`,
            name,
            description: `Expert agent: ${name.replace(/-/g, ' ')}`,
            category: panel.category,
            status: 'active',
          };
        });

        console.log(`[PanelExecutionView] Total agents prepared: ${completeAgents.length}`);
        setAgents(completeAgents);
        // Select all agents by default
        setSelectedAgentIds(new Set(completeAgents.map(a => a.id)));
      } catch (error) {
        console.error('[PanelExecutionView] Error loading agents:', error);
        // Last resort fallback: create all agents from panel.suggestedAgents
        const mockAgents = (panel.suggestedAgents || []).map((name, index) => ({
          id: `agent-${name}-${index}`,
          name,
          description: `Expert agent: ${name.replace(/-/g, ' ')}`,
          category: panel.category,
          status: 'active',
        }));
        setAgents(mockAgents);
        setSelectedAgentIds(new Set(mockAgents.map(a => a.id)));
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [panel.suggestedAgents, panel.name, panel.category, supabase]);

  const handleRun = async () => {
    const activeAgents = agents.filter((a) => selectedAgentIds.has(a.id));
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
    const activeAgents = agents.filter((a) => selectedAgentIds.has(a.id));
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
              expertIds={activeAgents.map(a => a.id)}
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
                Select which agents to activate ({Array.from(selectedAgentIds).length}/{agents.length} selected). This panel includes {agents.length} available expert agents working in {panel.mode} mode.
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
                        Choose experts ({Array.from(selectedAgentIds).length}/{agents.length})
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3 space-y-2">
                      <p className="text-xs text-muted-foreground mb-1">
                        Select which experts should participate in this run.
                      </p>
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {agents.map((agent) => {
                          const checked = selectedAgentIds.has(agent.id);
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
                                <div className="text-xs font-medium truncate">
                                  {agent.name}
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
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Selected agents summary cards */}
                <div className="grid grid-cols-2 gap-3">
                  {agents
                    .filter((agent) => selectedAgentIds.has(agent.id))
                    .map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:border-purple-300 transition-colors"
                      >
                        <Bot className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{agent.name}</span>
                      </div>
                    ))}
                  {Array.from(selectedAgentIds).length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No experts selected. Use “Choose experts” to pick who should participate.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
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
