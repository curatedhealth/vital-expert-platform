'use client';

/**
 * Ask Expert - Complete Integration
 *
 * This page integrates all 7 UI/UX enhancement components:
 * 1. EnhancedModeSelector
 * 2. ExpertAgentCard
 * 3. EnhancedMessageDisplay
 * 4. InlineDocumentGenerator
 * 5. NextGenChatInput
 * 6. IntelligentSidebar
 * 7. AdvancedStreamingWindow
 */

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { Button } from '@vital/ui';
import { Separator } from '@vital/ui';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { useAgentsStore, Agent } from '@/lib/stores/agents-store';
import {
  EnhancedModeSelector,
  ExpertAgentCard,
  EnhancedMessageDisplay,
  InlineDocumentGenerator,
  NextGenChatInput,
  IntelligentSidebar,
  AdvancedStreamingWindow
} from '@/features/ask-expert/components';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    reasoning?: Array<{ step: string; content: string }>;
    sources?: Array<{
      id: string;
      title: string;
      url: string;
      excerpt: string;
      similarity: number;
    }>;
    confidence?: number;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
  };
  agentName?: string;
  agentAvatar?: string;
  isStreaming?: boolean;
}

interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
  startTime?: Date;
  endTime?: Date;
}

interface ReasoningStep {
  id: string;
  type: 'thought' | 'action' | 'observation';
  content: string;
  confidence?: number;
  timestamp: Date;
}

interface StreamingMetrics {
  tokensGenerated: number;
  tokensPerSecond: number;
  elapsedTime: number;
  estimatedTimeRemaining?: number;
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  mode: string;
  agentName?: string;
  messageCount: number;
  isBookmarked?: boolean;
  tags?: string[];
}

interface SessionStats {
  totalConversations: number;
  totalMessages: number;
  avgSessionDuration: string;
  mostUsedMode: string;
  mostUsedAgent: string;
}

// ============================================================================
// Mode Configuration
// ============================================================================

const MODE_CONFIG = {
  'mode-1-query-automatic': {
    searchFunction: 'search_knowledge_by_embedding',
    params: { domain_filter: null, max_results: 10 }
  },
  'mode-2-query-manual': {
    searchFunction: 'search_knowledge_for_agent',
    params: { max_results: 15 }
  },
  'mode-3-chat-automatic': {
    searchFunction: 'hybrid_search',
    params: { keyword_weight: 0.3, semantic_weight: 0.7 }
  },
  'mode-4-chat-manual': {
    searchFunction: 'search_knowledge_for_agent',
    params: { max_results: 12 }
  },
  'mode-5-agent-autonomous': {
    searchFunction: 'hybrid_search',
    params: { max_results: 20, include_metadata: true }
  }
} as const;

// ============================================================================
// Main Component
// ============================================================================

export default function AskExpertComplete() {
  const router = useRouter();
  const { user } = useAuth();
  const { agents, loadAgents } = useAgentsStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ===== State Management =====
  const [activeTab, setActiveTab] = useState<'setup' | 'chat'>('setup');
  const [selectedMode, setSelectedMode] = useState('mode-1-query-automatic');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string>('conv-1');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  const [streamingMetrics, setStreamingMetrics] = useState<StreamingMetrics>({
    tokensGenerated: 0,
    tokensPerSecond: 0,
    elapsedTime: 0
  });

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalConversations: 0,
    totalMessages: 0,
    avgSessionDuration: '0m',
    mostUsedMode: 'mode-1-query-automatic',
    mostUsedAgent: ''
  });

  const [showDocumentGenerator, setShowDocumentGenerator] = useState(false);

  // ===== Effects =====
  useEffect(() => {
    loadAgents();
    loadConversations();
    loadSessionStats();
  }, [loadAgents]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-switch to chat tab when agent is selected
  useEffect(() => {
    if (selectedAgent && activeTab === 'setup') {
      setActiveTab('chat');
    }
  }, [selectedAgent, activeTab]);

  // ===== Handlers =====
  const handleModeChange = useCallback((modeId: string) => {
    setSelectedMode(modeId);
  }, []);

  const handleAgentSelect = useCallback((agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      setSelectedAgent(agent);
    }
  }, [agents]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    // Simulate streaming workflow
    await simulateStreamingResponse(userMessage.content);
  }, [input, isStreaming]);

  const handleStopStreaming = useCallback(() => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const handlePauseStreaming = useCallback(() => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
  }, []);

  const handleResumeStreaming = useCallback(() => {
    // Resume streaming logic
    console.log('Resuming stream...');
  }, []);

  const handleCopyMessage = useCallback((message: Message) => {
    navigator.clipboard.writeText(message.content);
  }, []);

  const handleRegenerateMessage = useCallback((message: Message) => {
    console.log('Regenerating message:', message.id);
    // Regenerate logic
  }, []);

  const handleFeedback = useCallback((message: Message, type: 'positive' | 'negative') => {
    console.log('Feedback:', message.id, type);
    // Submit feedback
  }, []);

  const handleAttachment = useCallback(async (file: File) => {
    console.log('File attached:', file.name);
    // Upload file logic
  }, []);

  const handleGenerateDocument = useCallback(async (
    templateId: string,
    format: 'pdf' | 'docx' | 'xlsx' | 'md',
    customPrompt?: string
  ) => {
    console.log('Generating document:', templateId, format);
    // Document generation logic
    return {
      id: `doc-${Date.now()}`,
      url: '/mock-document.pdf',
      metadata: {
        title: 'Generated Document',
        pages: 5,
        wordCount: 1200
      }
    };
  }, []);

  const handleConversationSelect = useCallback((conversationId: string) => {
    setCurrentConversationId(conversationId);
    // Load conversation messages
    loadConversationMessages(conversationId);
  }, []);

  const handleNewConversation = useCallback(() => {
    const newConvId = `conv-${Date.now()}`;
    setCurrentConversationId(newConvId);
    setMessages([]);
    setActiveTab('setup');
  }, []);

  // ===== Mock Data Loaders =====
  const loadConversations = () => {
    // Mock conversations for sidebar
    const mockConversations: Conversation[] = [
      {
        id: 'conv-1',
        title: 'FDA 510(k) Submission Strategy',
        preview: 'Discussed predicate device selection and substantial equivalence...',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        mode: 'mode-1-query-automatic',
        agentName: selectedAgent?.name || 'Expert Agent',
        messageCount: 12,
        isBookmarked: true,
        tags: ['FDA', 'Regulatory']
      },
      {
        id: 'conv-2',
        title: 'Clinical Trial Protocol Review',
        preview: 'Reviewed Phase II trial design for cardiovascular device...',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        mode: 'mode-3-chat-automatic',
        agentName: selectedAgent?.name || 'Clinical Expert',
        messageCount: 8,
        tags: ['Clinical', 'Protocol']
      }
    ];
    setConversations(mockConversations);
  };

  const loadSessionStats = () => {
    setSessionStats({
      totalConversations: 45,
      totalMessages: 523,
      avgSessionDuration: '5h 10m',
      mostUsedMode: 'mode-1-query-automatic',
      mostUsedAgent: selectedAgent?.name || 'Expert Agent'
    });
  };

  const loadConversationMessages = (conversationId: string) => {
    // Load messages for selected conversation
    console.log('Loading conversation:', conversationId);
  };

  // ===== Simulation Functions =====
  const simulateStreamingResponse = async (userQuery: string) => {
    const startTime = Date.now();

    // Step 1: Context Retrieval
    setWorkflowSteps([
      {
        id: 'step-1',
        name: 'Context Retrieval',
        description: 'Searching knowledge base for relevant information',
        status: 'running',
        progress: 0,
        startTime: new Date()
      }
    ]);

    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (progress <= 100) {
        setWorkflowSteps(prev => prev.map((step, idx) =>
          idx === 0 ? { ...step, progress } : step
        ));
      }
    }, 200);

    // Add reasoning steps
    setTimeout(() => {
      setReasoningSteps([
        {
          id: 'reason-1',
          type: 'thought',
          content: 'Analyzing user query to identify key regulatory requirements',
          confidence: 0.89,
          timestamp: new Date()
        }
      ]);
    }, 500);

    setTimeout(() => {
      clearInterval(progressInterval);
      setWorkflowSteps(prev => prev.map((step, idx) =>
        idx === 0 ? { ...step, status: 'completed', progress: 100, endTime: new Date() } : step
      ));

      // Step 2: Expert Analysis
      setWorkflowSteps(prev => [...prev, {
        id: 'step-2',
        name: 'Expert Analysis',
        description: `${selectedAgent?.name || 'Expert'} analyzing requirements`,
        status: 'running',
        progress: 45,
        startTime: new Date()
      }]);

      setReasoningSteps(prev => [...prev, {
        id: 'reason-2',
        type: 'action',
        content: 'Searching FDA 510(k) database for predicate devices',
        timestamp: new Date()
      }]);
    }, 2000);

    // Complete and add response
    setTimeout(() => {
      setWorkflowSteps(prev => prev.map(step => ({
        ...step,
        status: 'completed',
        progress: 100,
        endTime: new Date()
      })));

      setReasoningSteps(prev => [...prev, {
        id: 'reason-3',
        type: 'observation',
        content: 'Found 3 relevant predicate devices with similar indications',
        confidence: 0.94,
        timestamp: new Date()
      }]);

      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Based on FDA guidance [1], your 510(k) submission should focus on establishing substantial equivalence to a predicate device. Here are the key requirements:

## Regulatory Requirements

1. **Predicate Device Selection**: Identify a legally marketed device with similar intended use and technological characteristics [2]

2. **Substantial Equivalence Determination**: Demonstrate your device is as safe and effective as the predicate through:
   - Performance testing
   - Biocompatibility studies
   - Clinical data (if needed)

3. **Submission Components**: Your 510(k) must include:
   - Cover letter
   - Indications for use
   - Device description
   - Performance data
   - Substantial equivalence discussion

\`\`\`typescript
// Example: Device classification lookup
interface DeviceClassification {
  classType: 'I' | 'II' | 'III';
  regulatoryPath: '510(k)' | 'PMA' | 'De Novo';
  predicateRequired: boolean;
}

const classification: DeviceClassification = {
  classType: 'II',
  regulatoryPath: '510(k)',
  predicateRequired: true
};
\`\`\`

## Next Steps

Based on your device characteristics, I recommend:
- Conducting a comprehensive predicate search
- Preparing performance test protocols
- Engaging with FDA through Pre-Submission meeting

Would you like me to elaborate on any of these areas?`,
        timestamp: new Date(),
        metadata: {
          reasoning: [
            { step: 'Analysis', content: 'Reviewed FDA 21 CFR 807 requirements for 510(k) submissions' },
            { step: 'Synthesis', content: 'Compared Class II device pathways and identified optimal approach' },
            { step: 'Recommendation', content: 'Prioritized predicate device selection as critical first step' }
          ],
          sources: [
            {
              id: 'src-1',
              title: 'FDA 510(k) Premarket Notification Guidance',
              url: 'https://www.fda.gov/medical-devices/premarket-submissions/510k-clearances',
              excerpt: 'A 510(k) is a premarket submission made to FDA to demonstrate that the device to be marketed is as safe and effective...',
              similarity: 0.94
            },
            {
              id: 'src-2',
              title: 'Deciding When to Submit a 510(k) for a Change to an Existing Device',
              url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents',
              excerpt: 'This guidance document provides recommendations to manufacturers on when to submit a 510(k) for a change...',
              similarity: 0.88
            }
          ],
          confidence: 0.92,
          tokenUsage: {
            prompt: 1247,
            completion: 458,
            total: 1705
          }
        },
        agentName: selectedAgent?.name || 'Expert Agent',
        agentAvatar: (selectedAgent as any)?.avatar_url || (selectedAgent as any)?.avatar
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsStreaming(false);
      setWorkflowSteps([]);
      setReasoningSteps([]);

      const elapsedTime = Date.now() - startTime;
      setStreamingMetrics({
        tokensGenerated: 458,
        tokensPerSecond: (458 / (elapsedTime / 1000)),
        elapsedTime
      });
    }, 4500);

    // Update metrics during streaming
    streamIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setStreamingMetrics(prev => ({
        ...prev,
        elapsedTime: elapsed,
        tokensGenerated: Math.floor(elapsed / 100),
        tokensPerSecond: Math.floor(elapsed / 100) / (elapsed / 1000)
      }));
    }, 100);
  };

  // ===== Render =====
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <IntelligentSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onConversationSelect={handleConversationSelect}
        onNewConversation={handleNewConversation}
        sessionStats={sessionStats}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Ask VITAL Expert</h1>
              <p className="text-sm text-muted-foreground">
                Get expert insights powered by AI
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedAgent && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium">{selectedAgent.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(selectedAgent as any).specialty || (selectedAgent as any).type}
                    </div>
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewConversation}
              >
                New Conversation
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'setup' | 'chat')} className="flex-1 flex flex-col">
          <TabsList className="mx-6 mt-4 w-auto">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="flex-1 overflow-auto p-6 space-y-6">
            {/* Mode Selector */}
            <EnhancedModeSelector
              selectedMode={selectedMode}
              onModeChange={handleModeChange}
            />

            <Separator />

            {/* Agent Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Your Expert</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.slice(0, 6).map(agent => (
                  <ExpertAgentCard
                    key={agent.id}
                    agent={{
                      id: agent.id,
                      name: agent.name,
                      description: agent.description || '',
                      specialty: (agent as any).specialty,
                      avatar: (agent as any).avatar_url,
                      expertise: agent.capabilities?.slice(0, 4),
                      availability: 'online' as const,
                      responseTime: 25,
                      totalConsultations: Math.floor(Math.random() * 1000) + 100,
                      satisfactionScore: 4.5 + Math.random() * 0.5,
                      successRate: 85 + Math.floor(Math.random() * 15)
                    }}
                    isSelected={selectedAgent?.id === agent.id}
                    onSelect={handleAgentSelect}
                    variant="detailed"
                    showStats={true}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden">
            {/* Streaming Window */}
            {isStreaming && (
              <div className="px-6 pt-4">
                <AdvancedStreamingWindow
                  workflowSteps={workflowSteps}
                  reasoningSteps={reasoningSteps}
                  metrics={streamingMetrics}
                  isStreaming={isStreaming}
                  canPause={true}
                  onPause={handlePauseStreaming}
                  onResume={handleResumeStreaming}
                />
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground">
                    <p className="text-lg font-medium">Start a conversation</p>
                    <p className="text-sm">Ask your expert anything</p>
                  </div>
                </div>
              ) : (
                messages.map(msg => (
                  <EnhancedMessageDisplay
                    key={msg.id}
                    {...(msg as any)}
                    onCopy={() => handleCopyMessage(msg)}
                    onRegenerate={() => handleRegenerateMessage(msg)}
                    onFeedback={(type) => handleFeedback(msg, type)}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Document Generator Toggle */}
            {messages.length > 0 && (
              <div className="px-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDocumentGenerator(!showDocumentGenerator)}
                  className="mb-2"
                >
                  {showDocumentGenerator ? 'Hide' : 'Show'} Document Generator
                </Button>

                {showDocumentGenerator && (
                  <InlineDocumentGenerator
                    conversationId={currentConversationId}
                    conversationContext={JSON.stringify({
                      messages,
                      expertName: selectedAgent?.name || 'Expert Agent',
                      topic: 'Expert Consultation'
                    })}
                    onGenerate={handleGenerateDocument as any}
                  />
                )}
              </div>
            )}

            {/* Chat Input */}
            <div className="border-t bg-white px-6 py-4">
              <NextGenChatInput
                value={input}
                onChange={setInput}
                onSend={handleSendMessage}
                onStop={handleStopStreaming}
                isLoading={isStreaming}
                enableVoice={true}
                enableAttachments={true}
                enableSuggestions={true}
                maxLength={4000}
                onAttachment={handleAttachment}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
