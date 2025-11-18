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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@vital/sdk/client';
import { STARTUP_TENANT_ID } from '@/lib/constants/tenant';
import type { SavedPanel } from '@/contexts/ask-panel-context';

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

  const IconComponent = panel.IconComponent || Users;
  const supabase = createClient();

  // Fetch real agents from database
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        
        // Fetch agents by name from panel.suggestedAgents
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('tenant_id', STARTUP_TENANT_ID)
          .in('name', panel.suggestedAgents);

        if (error) {
          console.error('Error fetching agents:', error);
          // Fallback: create mock agents from names
          const mockAgents = panel.suggestedAgents.map((name, index) => ({
            id: `agent-${index}`,
            name,
            description: `Expert agent: ${name}`,
            category: panel.category,
            status: 'active',
          }));
          setAgents(mockAgents);
        } else {
          // Map fetched agents, filling in missing ones
          const fetchedAgentNames = data?.map(a => a.name) || [];
          const missingAgents = panel.suggestedAgents
            .filter(name => !fetchedAgentNames.includes(name))
            .map((name, index) => ({
              id: `fallback-${index}`,
              name,
              description: `Expert agent: ${name}`,
              category: panel.category,
              status: 'active',
            }));
          
          setAgents([...(data || []), ...missingAgents]);
        }
      } catch (error) {
        console.error('Error loading agents:', error);
        // Fallback to panel agent names
        const mockAgents = panel.suggestedAgents.map((name, index) => ({
          id: `agent-${index}`,
          name,
          description: `Expert agent: ${name}`,
          category: panel.category,
          status: 'active',
        }));
        setAgents(mockAgents);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [panel.suggestedAgents, supabase]);

  const handleRun = async () => {
    if (!question.trim() || agents.length === 0) return;

    setIsRunning(true);
    setResults([]);
    setProgress(0);

    // Simulate panel execution with real agents
    const totalAgents = agents.length;
    
    for (let i = 0; i < totalAgents; i++) {
      const agent = agents[i];
      setCurrentAgent(agent.name);
      setProgress(((i + 1) / totalAgents) * 100);

      // Simulate agent processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add mock result
      setResults(prev => [
        ...prev,
        {
          agentId: agent.id,
          agentName: agent.name,
          agentDescription: agent.description,
          response: `Response from ${agent.name} regarding: "${question}". 

Based on my expertise in ${agent.specialty || agent.category || 'this domain'}, here are my insights:

1. Key considerations for your scenario
2. Recommended approach based on best practices
3. Potential risks and mitigation strategies
4. Next steps for implementation

This analysis takes into account the specific requirements you've outlined.`,
          timestamp: new Date().toISOString(),
          confidence: Math.random() * 30 + 70, // 70-100%
        }
      ]);
    }

    setIsRunning(false);
    setCurrentAgent(null);
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
                This panel includes {agents.length} expert agents working in {panel.mode} mode
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
                    {agents.length}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Est. Time</p>
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    ~{agents.length * 2}min
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Category</p>
                  <Badge variant="secondary" className="capitalize text-xs">
                    {panel.category}
                  </Badge>
                </div>
              </div>

              {/* Expert Agents - Minimal Agent Cards */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Expert Agents</h3>
                <div className="grid grid-cols-2 gap-3">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:border-purple-300 transition-colors"
                    >
                      <Bot className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{agent.name}</span>
                    </div>
                  ))}
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
                <p className="text-xs text-muted-foreground">
                  {question.length} characters
                </p>
                <Button
                  onClick={handleRun}
                  disabled={!question.trim() || isRunning}
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
