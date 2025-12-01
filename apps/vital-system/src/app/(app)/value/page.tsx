'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/page-header';
import {
  Layers,
  Building2,
  Users,
  Bot,
  Target,
  TrendingUp,
  MessageSquare,
  Send,
  Loader2,
  ChevronRight,
  Sparkles,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Network
} from 'lucide-react';
import {
  PersonaCard,
  PersonaListItem,
  PersonaStatsCards,
  type Persona,
  type PersonaStats,
} from '@/components/personas';

// Types for ontology data
interface OntologyLayer {
  name: string;
  count: number;
  description: string;
}

interface OntologyHierarchy {
  layers: Record<string, OntologyLayer>;
  mappings: Record<string, { count: number }>;
  summary: {
    total_functions: number;
    total_roles: number;
    total_personas: number;
    total_agents: number;
  };
}

interface GapAnalysis {
  total_roles: number;
  roles_with_agents: number;
  roles_without_agents: number;
  coverage_percentage: number;
  high_priority_gaps: number;
  gaps_by_function: Record<string, number>;
  top_gaps: Array<{
    role_name: string;
    function: string;
    priority: string;
  }>;
}

interface OpportunityItem {
  role_id: string;
  role_name: string;
  function: string;
  department: string;
  opportunity_score: number;
  has_agent: boolean;
  factors: Record<string, any>;
}

interface AICompanionMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysis_type?: string;
  confidence?: number;
  recommendations?: Array<{
    priority: string;
    category: string;
    text: string;
    impact: string;
  }>;
}

interface SuggestedQuestion {
  question: string;
  category: string;
  description: string;
}

export default function ValuePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('ontology');

  // Ontology state
  const [hierarchy, setHierarchy] = useState<OntologyHierarchy | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Personas state (integrated from personas page)
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [personaStats, setPersonaStats] = useState<PersonaStats>({
    total: 0,
    byRole: {},
    byDepartment: {},
    byFunction: {},
    bySeniority: {},
  });

  // AI Companion state
  const [messages, setMessages] = useState<AICompanionMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedQuestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for sidebar events
  useEffect(() => {
    const handleFilterChange = (e: CustomEvent) => {
      const { function: funcId } = e.detail;
      // Filter data based on selected function
      console.log('Filter changed to:', funcId);
      // TODO: Implement filtering logic if needed
    };

    const handleAISuggestion = (e: CustomEvent) => {
      const { question } = e.detail;
      setInputMessage(question);
    };

    window.addEventListener('value-filter-change' as any, handleFilterChange);
    window.addEventListener('value-ai-suggestion' as any, handleAISuggestion);

    return () => {
      window.removeEventListener('value-filter-change' as any, handleFilterChange);
      window.removeEventListener('value-ai-suggestion' as any, handleAISuggestion);
    };
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load data in parallel
      const [hierarchyRes, gapRes, oppRes, personasRes, suggestionsRes] = await Promise.all([
        fetch('/api/ontology-investigator/hierarchy'),
        fetch('/api/ontology-investigator/gap-analysis', { method: 'POST' }),
        fetch('/api/ontology-investigator/opportunities', { method: 'POST' }),
        fetch('/api/personas'),
        fetch('/api/ontology-investigator/suggestions'),
      ]);

      // Process hierarchy
      if (hierarchyRes.ok) {
        const data = await hierarchyRes.json();
        setHierarchy(data);
      }

      // Process gap analysis
      if (gapRes.ok) {
        const data = await gapRes.json();
        setGapAnalysis(data);
      }

      // Process opportunities
      if (oppRes.ok) {
        const data = await oppRes.json();
        setOpportunities(Array.isArray(data) ? data : []);
      }

      // Process personas
      if (personasRes.ok) {
        const data = await personasRes.json();
        const allPersonas = data.personas || [];
        setPersonas(allPersonas);

        // Calculate stats
        const byRole: Record<string, number> = {};
        const byDepartment: Record<string, number> = {};
        const byFunction: Record<string, number> = {};
        const bySeniority: Record<string, number> = {};

        allPersonas.forEach((persona: Persona) => {
          if (persona.role_slug) byRole[persona.role_slug] = (byRole[persona.role_slug] || 0) + 1;
          if (persona.department_slug) byDepartment[persona.department_slug] = (byDepartment[persona.department_slug] || 0) + 1;
          if (persona.function_slug) byFunction[persona.function_slug] = (byFunction[persona.function_slug] || 0) + 1;
          if (persona.seniority_level) bySeniority[persona.seniority_level] = (bySeniority[persona.seniority_level] || 0) + 1;
        });

        setPersonaStats({
          total: data.stats?.totalPersonas || allPersonas.length,
          totalRoles: data.stats?.totalRoles || Object.keys(byRole).length,
          totalDepartments: data.stats?.totalDepartments || Object.keys(byDepartment).length,
          totalFunctions: data.stats?.totalFunctions || Object.keys(byFunction).length,
          byRole,
          byDepartment,
          byFunction,
          bySeniority,
        });
      }

      // Process suggestions
      if (suggestionsRes.ok) {
        const data = await suggestionsRes.json();
        setSuggestions(data.suggestions || []);
      }

    } catch (err) {
      console.error('Error loading Value data:', err);
      setError('Failed to load ontology data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isAILoading) return;

    const userMessage: AICompanionMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsAILoading(true);

    try {
      const response = await fetch('/api/ontology-investigator/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: inputMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: AICompanionMessage = {
          role: 'assistant',
          content: data.response || 'I apologize, but I could not process that query.',
          timestamp: new Date(),
          analysis_type: data.analysis_type,
          confidence: data.confidence,
          recommendations: data.recommendations,
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (err) {
      const errorMessage: AICompanionMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAILoading(false);
    }
  };

  const handleSuggestionClick = (question: string) => {
    setInputMessage(question);
  };

  // Ontology layer cards
  const ontologyLayers = useMemo(() => {
    if (!hierarchy?.layers) return [];

    return [
      { key: 'L0_tenants', name: 'L0: Tenants', icon: Building2, description: 'Organizations using the platform' },
      { key: 'L1_functions', name: 'L1: Functions', icon: Network, description: 'Business functions (Medical Affairs, R&D, etc.)' },
      { key: 'L2_departments', name: 'L2: Departments', icon: Building2, description: 'Departments within functions' },
      { key: 'L3_roles', name: 'L3: Roles', icon: Users, description: 'Job roles and responsibilities' },
      { key: 'L4_personas', name: 'L4: Personas', icon: Users, description: 'User archetypes (AUTOMATOR, ORCHESTRATOR, etc.)' },
      { key: 'L5_jtbds', name: 'L5: JTBDs', icon: Target, description: 'Jobs-to-be-Done' },
      { key: 'L6_mappings', name: 'L6: JTBD-Role Mappings', icon: Layers, description: 'How JTBDs map to roles' },
      { key: 'L7_agents', name: 'L7: AI Agents', icon: Bot, description: 'AI assistants mapped to roles' },
    ].map(layer => ({
      ...layer,
      count: hierarchy.layers[layer.key]?.count || 0,
    }));
  }, [hierarchy]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          icon={Layers}
          title="Value & Ontology"
          description="Loading enterprise ontology..."
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-500">Loading enterprise ontology data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <PageHeader
        icon={Layers}
        title="Value & Ontology"
        description="Enterprise ontology analysis with AI-powered insights"
        actions={
          <Button variant="outline" size="sm" onClick={loadAllData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full flex gap-6">
          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="mb-4">
                <TabsTrigger value="ontology">
                  <Layers className="h-4 w-4 mr-2" />
                  Ontology
                </TabsTrigger>
                <TabsTrigger value="personas">
                  <Users className="h-4 w-4 mr-2" />
                  Personas
                </TabsTrigger>
                <TabsTrigger value="gaps">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Gap Analysis
                </TabsTrigger>
                <TabsTrigger value="opportunities">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Opportunities
                </TabsTrigger>
              </TabsList>

              {/* Ontology Tab */}
              <TabsContent value="ontology" className="flex-1 overflow-auto">
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Network className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{hierarchy?.summary?.total_functions || 0}</p>
                            <p className="text-sm text-gray-500">Functions</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{hierarchy?.summary?.total_roles || 0}</p>
                            <p className="text-sm text-gray-500">Roles</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Users className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{hierarchy?.summary?.total_personas || 0}</p>
                            <p className="text-sm text-gray-500">Personas</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Bot className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{hierarchy?.summary?.total_agents || 0}</p>
                            <p className="text-sm text-gray-500">AI Agents</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 8-Layer Hierarchy */}
                  <Card>
                    <CardHeader>
                      <CardTitle>8-Layer Enterprise Ontology</CardTitle>
                      <CardDescription>
                        Hierarchical view of your organization's structure from tenants to AI agents
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {ontologyLayers.map((layer, index) => {
                          const Icon = layer.icon;
                          return (
                            <div
                              key={layer.key}
                              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className={`p-2 rounded-lg ${
                                  index < 3 ? 'bg-blue-100' :
                                  index < 5 ? 'bg-green-100' :
                                  index < 7 ? 'bg-purple-100' : 'bg-orange-100'
                                }`}>
                                  <Icon className={`h-5 w-5 ${
                                    index < 3 ? 'text-blue-600' :
                                    index < 5 ? 'text-green-600' :
                                    index < 7 ? 'text-purple-600' : 'text-orange-600'
                                  }`} />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{layer.name}</p>
                                  <p className="text-sm text-gray-500">{layer.description}</p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-lg px-3 py-1">
                                {layer.count.toLocaleString()}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Personas Tab */}
              <TabsContent value="personas" className="flex-1 overflow-auto">
                <div className="space-y-6">
                  <PersonaStatsCards stats={personaStats} />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {personas.slice(0, 12).map((persona) => (
                      <PersonaCard
                        key={persona.id}
                        persona={persona}
                        compact
                        onClick={(p) => router.push(`/personas/${p.slug}`)}
                      />
                    ))}
                  </div>

                  {personas.length > 12 && (
                    <div className="text-center">
                      <Button variant="outline" onClick={() => router.push('/personas')}>
                        View All {personas.length} Personas
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Gap Analysis Tab */}
              <TabsContent value="gaps" className="flex-1 overflow-auto">
                <div className="space-y-6">
                  {gapAnalysis && (
                    <>
                      {/* Coverage Summary */}
                      <div className="grid grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold">{gapAnalysis.coverage_percentage.toFixed(1)}%</p>
                                <p className="text-sm text-gray-500">AI Coverage</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold">{gapAnalysis.roles_with_agents}</p>
                                <p className="text-sm text-gray-500">Roles with AI</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-red-100 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold">{gapAnalysis.roles_without_agents}</p>
                                <p className="text-sm text-gray-500">Gaps</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <Target className="h-5 w-5 text-orange-600" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold">{gapAnalysis.high_priority_gaps}</p>
                                <p className="text-sm text-gray-500">High Priority</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Top Gaps */}
                      {gapAnalysis.top_gaps?.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Top AI Coverage Gaps</CardTitle>
                            <CardDescription>Roles that need AI agent assignment</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {gapAnalysis.top_gaps.slice(0, 10).map((gap, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div>
                                    <p className="font-medium">{gap.role_name}</p>
                                    <p className="text-sm text-gray-500">{gap.function}</p>
                                  </div>
                                  <Badge variant={gap.priority === 'high' ? 'destructive' : 'secondary'}>
                                    {gap.priority}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Opportunities Tab */}
              <TabsContent value="opportunities" className="flex-1 overflow-auto">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Transformation Opportunities</CardTitle>
                      <CardDescription>
                        Roles scored by AI deployment potential
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {opportunities.slice(0, 15).map((opp, index) => (
                          <div
                            key={opp.role_id || index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="text-2xl font-bold text-gray-400 w-8">
                                #{index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{opp.role_name}</p>
                                <p className="text-sm text-gray-500">
                                  {opp.function} {opp.department && `/ ${opp.department}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {opp.has_agent ? (
                                <Badge variant="secondary">Has Agent</Badge>
                              ) : (
                                <Badge variant="outline">No Agent</Badge>
                              )}
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${opp.opportunity_score}%` }}
                                />
                              </div>
                              <span className="font-bold text-blue-600 w-12 text-right">
                                {opp.opportunity_score}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* AI Companion Sidebar */}
          <div className="w-96 flex flex-col border rounded-lg bg-white shadow-sm">
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Ontology Investigator</h3>
                  <p className="text-sm text-gray-500">AI-powered analysis companion</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">
                      Ask me about your enterprise ontology, AI coverage gaps,
                      or opportunities for AI transformation.
                    </p>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                      <div className="mt-6 space-y-2">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Suggested Questions</p>
                        {suggestions.slice(0, 4).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion.question)}
                            className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-700">{suggestion.question}</p>
                            <p className="text-xs text-gray-500">{suggestion.category}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                      {message.recommendations && message.recommendations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-semibold mb-2">Recommendations:</p>
                          {message.recommendations.slice(0, 3).map((rec, idx) => (
                            <div key={idx} className="text-xs bg-white/20 p-2 rounded mb-1">
                              <Badge variant="outline" className="mb-1">{rec.priority}</Badge>
                              <p>{rec.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {message.confidence && (
                        <p className="text-xs opacity-70 mt-2">
                          Confidence: {(message.confidence * 100).toFixed(0)}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {isAILoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about your ontology..."
                  className="resize-none min-h-[40px] max-h-[120px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isAILoading}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
