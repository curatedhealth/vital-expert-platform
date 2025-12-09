'use client';

import {
  Brain,
  Users,
  FileText,
  Activity,
  Settings,
  MessageSquare,
  Clock,
  TrendingUp,
  Target,
  Info,
  Download,
  Share,
  Bookmark,
  Filter
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

import { EnhancedConversationManager } from '@/services/conversation/enhanced-conversation-manager';
import { MasterOrchestrator } from '@/services/orchestration/master-orchestrator';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { cn } from '@/shared/services/utils';
import { ComplianceLevel } from '@/types/digital-health-agent.types';

import { ChatInput } from './chat-input';
import { ChatMessages } from './chat-messages';
import { ChatMode } from './chat-mode-selector';

interface Agent {
  id: string;
  name: string;
  avatar: string;
  role: string;
  domain: string;
  status: 'active' | 'idle' | 'busy';
  confidence?: number;
  lastResponse?: string;
  responseTime?: number;
}

interface ConversationMetrics {
  messageCount: number;
  avgResponseTime: number;
  avgConfidence: number;
  digitalHealthQueries: number;
  multiAgentQueries: number;
  successRate: number;
}

interface SessionArtifact {
  id: string;
  title: string;
  type: 'document' | 'analysis' | 'recommendation' | 'summary';
  content: string;
  timestamp: string;
  agent?: string;
  tags: string[];
}

interface EnhancedChatInterfaceProps {
  sessionId?: string;
  mode: ChatMode;
  initialQuery?: string;
  onModeChange?: (mode: ChatMode) => void;
  className?: string;
  selectedAgent?: any;
  currentChat?: any;
  messages?: unknown[];
  onSendMessage?: (message: string) => void;
}

export function EnhancedChatInterface({
  sessionId,
  mode,
  initialQuery = '',
  onModeChange,
  className,
  selectedAgent,
  currentChat,
  messages,
  onSendMessage
}: EnhancedChatInterfaceProps) {
  // State management
  const [activeAgents, setActiveAgents] = useState<Agent[]>([]);
  const [conversationMetrics, setConversationMetrics] = useState<ConversationMetrics>({
    messageCount: 0,
    avgResponseTime: 0,
    avgConfidence: 0,
    digitalHealthQueries: 0,
    multiAgentQueries: 0,
    successRate: 100
  });
  const [sessionArtifacts, setSessionArtifacts] = useState<SessionArtifact[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<SessionArtifact | null>(null);
  const [orchestrationStatus, setOrchestrationStatus] = useState<'idle' | 'processing' | 'complete'>('idle');
  const [currentQuery, setCurrentQuery] = useState(initialQuery);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionSummary, setSessionSummary] = useState('');

  // Services

  // Initialize session
  useEffect(() => {
    initializeSession();
  }, [sessionId, mode]);

    try {
      if (sessionId) {
        // Load existing session

        if (session) {
          updateMetricsFromSession(session);
          generateArtifactsFromSession(session);
        }
      }
    } catch (error) {
      // console.error('Failed to initialize session:', error);
    }
  };

    setConversationMetrics({
      messageCount: session.metrics.messageCount || 0,
      avgResponseTime: session.metrics.avgResponseTime || 0,
      avgConfidence: session.metrics.avgConfidence || 0,
      digitalHealthQueries: session.metrics.digitalHealthQueries || 0,
      multiAgentQueries: session.metrics.multiAgentQueries || 0,
      successRate: session.metrics.successRate || 100
    });
  };

    const artifacts: SessionArtifact[] = [];

    // Generate summary artifact
    artifacts.push({
      id: 'session-summary',
      title: 'Session Summary',
      type: 'summary',
      content: generateSessionSummary(session),
      timestamp: new Date().toISOString(),
      tags: ['summary', 'overview']
    });

    setSessionArtifacts(artifacts);
  };

    return `Session Summary:
• ${userMessages} user queries processed
• Primary domain: ${primaryDomain}
• ${agentsUsed} AI experts consulted
• Digital health focus: ${session.context?.digitalHealthFocus ? 'Yes' : 'No'}
• Success rate: ${session.metrics?.successRate || 100}%`;
  };

  // Handle message sending

    if (!message.trim() || isProcessing) return;

    setCurrentQuery(message);
    setIsProcessing(true);
    setOrchestrationStatus('processing');

    try {
      // Route through orchestrator

        user_id: 'current-user',
        session_id: sessionId || 'new-session',
        compliance_level: ComplianceLevel.STANDARD,
        audit_required: false
      });

      // Update active agents
      if (result.orchestration?.agents) {
        const newAgents: Agent[] = result.orchestration.agents.map((agentId: string) => ({
          id: agentId,
          name: formatAgentName(agentId),
          avatar: getAgentAvatar(agentId),
          role: getAgentRole(agentId),
          domain: getAgentDomain(agentId),
          status: 'active' as const,
          confidence: result.confidence || 85,
          responseTime: result.responseTime || 0
        }));

        setActiveAgents(newAgents);
      }

      // Create artifact from response
      if (result.success && result.response) {
        const artifact: SessionArtifact = {
          id: `artifact-${Date.now()}`,
          title: `Response: ${message.substring(0, 50)}...`,
          type: 'analysis',
          content: result.response,
          timestamp: new Date().toISOString(),
          agent: result.agent,
          tags: extractTags(result.response)
        };

        setSessionArtifacts(prev => [...prev, artifact]);
      }

      setOrchestrationStatus('complete');
    } catch (error) {
      // console.error('Error processing message:', error);
      setOrchestrationStatus('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  // Utility functions

    return agentId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

    const avatars: Record<string, string> = {
      'fda-regulatory-strategist': '🏛️',
      'clinical-trial-designer': '🧬',
      'digital-therapeutics-expert': '💊',
      'market-access-strategist': '📊',
      'hipaa-compliance-officer': '🔒',
      'qms-architect': '🏗️',
      'medical-safety-officer': '⚕️',
      'ai-ml-clinical-specialist': '🤖'
    };
    // eslint-disable-next-line security/detect-object-injection
    return avatars[agentId] || '👨‍⚕️';
  };

    const roles: Record<string, string> = {
      'fda-regulatory-strategist': 'FDA Regulatory Expert',
      'clinical-trial-designer': 'Clinical Research Specialist',
      'digital-therapeutics-expert': 'Digital Health Expert',
      'market-access-strategist': 'Market Access Strategist',
      'hipaa-compliance-officer': 'Compliance Officer',
      'qms-architect': 'Quality Systems Expert',
      'medical-safety-officer': 'Medical Safety Officer',
      'ai-ml-clinical-specialist': 'AI/ML Clinical Expert'
    };
    // eslint-disable-next-line security/detect-object-injection
    return roles[agentId] || 'Healthcare Expert';
  };

    const domains: Record<string, string> = {
      'fda-regulatory-strategist': 'Regulatory',
      'clinical-trial-designer': 'Clinical',
      'digital-therapeutics-expert': 'Digital Health',
      'market-access-strategist': 'Market Access',
      'hipaa-compliance-officer': 'Compliance',
      'qms-architect': 'Quality',
      'medical-safety-officer': 'Safety',
      'ai-ml-clinical-specialist': 'AI/ML'
    };
    // eslint-disable-next-line security/detect-object-injection
    return domains[agentId] || 'Healthcare';
  };

    const tags: string[] = [];

      'regulatory': ['fda', 'regulatory', 'compliance', 'approval'],
      'clinical': ['clinical', 'trial', 'study', 'patient'],
      'digital-health': ['digital', 'app', 'software', 'technology'],
      'business': ['market', 'strategy', 'commercial', 'business'],
      'safety': ['safety', 'risk', 'adverse', 'monitoring']
    };

    for (const [tag, keywords] of Object.entries(tagKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        tags.push(tag);
      }
    }

    return tags.slice(0, 3); // Limit to 3 tags
  };

    switch (status) {
      case 'active': return 'text-green-600';
      case 'busy': return 'text-yellow-600';
      case 'idle': return 'text-neutral-400';
      default: return 'text-neutral-400';
    }
  };

    switch (type) {
      case 'document': return FileText;
      case 'analysis': return TrendingUp;
      case 'recommendation': return Target;
      case 'summary': return Info;
      default: return FileText;
    }
  };

  return (
    <div className={cn("h-full flex flex-col bg-background", className)}>
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">VITAL Path AI Assistant</h1>
              <p className="text-sm text-muted-foreground">
                {mode === 'virtual-panel' ? 'Virtual Advisory Board' :
                 mode === 'orchestrated-workflow' ? 'Orchestrated Workflow' :
                 mode === 'jobs-framework' ? 'Jobs Framework' :
                 'Expert Consultation'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant={orchestrationStatus === 'processing' ? 'default' : 'secondary'}>
              {orchestrationStatus === 'processing' ? 'Processing' :
               orchestrationStatus === 'complete' ? 'Ready' : 'Idle'}
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
          {/* Agent Panel */}
          <div className="w-1/4 min-w-80 max-w-96">
            <div className="h-full flex flex-col bg-muted/30">
              <div className="border-b p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Active Experts ({activeAgents.length})
                  </h3>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                {/* Session Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Card className="p-3">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Messages</p>
                        <p className="font-semibold">{conversationMetrics.messageCount}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-3">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                        <p className="font-semibold">{Math.round(conversationMetrics.avgConfidence)}%</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Success Rate</span>
                    <span>{conversationMetrics.successRate}%</span>
                  </div>
                  <Progress value={conversationMetrics.successRate} className="h-2" />
                </div>
              </div>

              {/* Active Agents */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {activeAgents.length === 0 ? (
                    <div className="text-center py-8">
                      <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No agents active</p>
                      <p className="text-xs text-muted-foreground mt-1">Start a conversation to engage experts</p>
                    </div>
                  ) : (
                    activeAgents.map((agent: any) => (
                      <Card key={agent.id} className="p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className="text-lg">{agent.avatar}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm truncate">{agent.name}</p>
                              <div className={cn("w-2 h-2 rounded-full",
                                agent.status === 'active' ? 'bg-green-500' :
                                agent.status === 'busy' ? 'bg-yellow-500' : 'bg-neutral-400'
                              )} />
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{agent.role}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">{agent.domain}</Badge>
                              {agent.confidence && (
                                <span className="text-xs font-medium">{agent.confidence}%</span>
                              )}
                            </div>
                            {agent.responseTime && (
                              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {agent.responseTime}ms
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Conversation Panel */}
          <div className="flex-1 min-w-0">
            <div className="h-full flex flex-col">
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Conversation
                  </h3>
                  <div className="flex items-center space-x-2">
                    {isProcessing && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        Processing...
                      </div>
                    )}
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <ChatMessages messages={[]} />
                </ScrollArea>

                <div className="border-t p-4">
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    disabled={isProcessing}
                    placeholder="Ask your healthcare experts anything..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Artifacts Panel */}
          <div className="w-1/3 min-w-80 max-w-96 border-l">
            <div className="h-full flex flex-col bg-muted/30">
              <div className="border-b p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Session Artifacts ({sessionArtifacts.length})
                  </h3>
                  <Button variant="ghost" size="sm">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>

                <Tabs defaultValue="artifacts" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                  </TabsList>

                  <TabsContent value="artifacts" className="mt-4">
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <div className="space-y-3">
                        {sessionArtifacts.length === 0 ? (
                          <div className="text-center py-8">
                            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No artifacts yet</p>
                            <p className="text-xs text-muted-foreground mt-1">Generated content will appear here</p>
                          </div>
                        ) : (
                          sessionArtifacts.map(artifact => {

                            return (
                              <Card key={artifact.id}
                                className={cn("p-3 cursor-pointer transition-colors hover:bg-muted/50",
                                  selectedArtifact?.id === artifact.id && "bg-muted"
                                )}
                                onClick={() => setSelectedArtifact(artifact)}
                              >
                                <div className="flex items-start space-x-3">
                                  <IconComponent className="h-4 w-4 mt-1 text-muted-foreground" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{artifact.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(artifact.timestamp).toLocaleDateString()}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {artifact.tags.map(tag => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="insights" className="mt-4">
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <div className="space-y-4">
                        <Card className="p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Activity className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-sm">Session Activity</span>
                          </div>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex justify-between">
                              <span>Digital Health Queries</span>
                              <span>{conversationMetrics.digitalHealthQueries}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Multi-Agent Queries</span>
                              <span>{conversationMetrics.multiAgentQueries}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Avg Response Time</span>
                              <span>{Math.round(conversationMetrics.avgResponseTime)}ms</span>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-sm">Quality Metrics</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Overall Confidence</span>
                              <span>{Math.round(conversationMetrics.avgConfidence)}%</span>
                            </div>
                            <Progress value={conversationMetrics.avgConfidence} className="h-2" />
                          </div>
                        </Card>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
      </div>

      {/* Artifact Viewer Modal */}
      {selectedArtifact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  {React.createElement(getArtifactIcon(selectedArtifact.type), {
                    className: "h-5 w-5 mr-2"
                  })}
                  {selectedArtifact.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedArtifact.agent && `Generated by ${formatAgentName(selectedArtifact.agent)} • `}
                  {new Date(selectedArtifact.timestamp).toLocaleDateString()}
                </p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedArtifact(null)}>
                ✕
              </Button>
            </CardHeader>
            <CardContent className="max-h-[60vh] overflow-auto">
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedArtifact.tags.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
              <div className="whitespace-pre-wrap text-sm">
                {selectedArtifact.content}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}