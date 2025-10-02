'use client';

import { MessageSquare, Send, Paperclip, Mic, Settings, Users, Brain, Zap } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AgentDetailsModal } from '@/features/agents/components/agent-details-modal';
import { AgentsBoard } from '@/features/agents/components/agents-board';
import { Response } from '@/shared/components/ui/ai';
import { useAgentsStore } from '@/shared/services/agents/agents-store';
import { useChatStore } from '@/shared/services/chat/chat-store';

import { PanelBuilder } from './components/panel-builder';
import { PanelInterface } from './components/panel-interface';
import { PanelTemplates } from './components/panel-templates';
import { usePanelStore } from './services/panel-store';

function AskPanelContent() {
  const [currentView, setCurrentView] = useState<'templates' | 'builder' | 'panel' | 'agents' | 'chat'>('templates');
  const [selectedPanel, setSelectedPanel] = useState<unknown>(null);
  const [selectedAgent, setSelectedAgent] = useState<unknown>(null);
  const [showAgentDetails, setShowAgentDetails] = useState(false);
  const [panelAgents, setPanelAgents] = useState<unknown[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatMode, setChatMode] = useState<'discussion' | 'consensus' | 'debate'>('discussion');
  const searchParams = useSearchParams();
  const router = useRouter();

  const { agents, loadAgents, isLoading } = useAgentsStore();
  const { createPanel } = usePanelStore();
  const { messages, addMessage, createNewChat } = useChatStore();

  // Load agents on mount
  useEffect(() => {
    if (agents.length === 0 && !isLoading) {
      loadAgents();
    }
  }, [agents.length, isLoading, loadAgents]);

  // Handle panel creation from URL params
  useEffect(() => {
    const panelId = searchParams.get('panel');
    const template = searchParams.get('template');

    if (panelId) {
      // Load existing panel
      setCurrentView('panel');
    } else if (template) {
      // Create panel from template
      setCurrentView('builder');
    }
  }, [searchParams]);

  const handleTemplateSelect = (template: any) => {
    // Update URL to show template
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('template', template.id);
    router.push(`/ask-panel?${newParams.toString()}`);

    setCurrentView('builder');
  };

  const handlePanelSelect = (panel: any) => {
    setSelectedPanel(panel);

    // Update URL to show panel
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('panel', panel.id);
    router.push(`/ask-panel?${newParams.toString()}`);

    setCurrentView('panel');
  };

  const handleBackToTemplates = () => {
    setCurrentView('templates');
    setSelectedPanel(null);

    // Clear URL params
    router.push('/ask-panel');
  };

  const handleAgentSelect = (agent: any) => {
    // Add agent to panel
    // setPanelAgents(prev => [...prev, agent]);
    setCurrentView('builder');
  };

  const handleStartChat = () => {
    if (panelAgents.length === 0) return;
    setCurrentView('chat');
    createNewChat();
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isProcessing || panelAgents.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Add user message
      const userMessage = {
        id: `user-${Date.now()}`,
        content: currentMessage,
        role: 'user' as const,
        timestamp: new Date()
      };
      addMessage(userMessage);

      // Send to panel agents
      const response = await fetch('/api/panel/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          agents: panelAgents.map((a: any) => a.name),
          mode: chatMode,
          context: {
            user_id: 'anonymous',
            session_id: 'panel-session',
            compliance_level: 'HIGH'
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Add panel response
      addMessage({
        id: `panel-${Date.now()}`,
        content: result.content,
        role: 'assistant',
        timestamp: new Date(),
        metadata: {
          model: 'panel-orchestrator',
          mode: chatMode,
          panelAgents: panelAgents.map(a => a.name)
        }
      });
      
      setCurrentMessage('');
    } catch (error) {
      // console.error('Error sending panel message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToBuilder = () => {
    setCurrentView('builder');

    // Update URL
    const newParams = new URLSearchParams(searchParams.toString());
    if (selectedPanel?.templateId) {
      newParams.set('template', selectedPanel.templateId);
    }
    router.push(`/ask-panel?${newParams.toString()}`);
  };

  const handleViewAgentDetails = (agent: any) => {
    setSelectedAgent(agent);
    setShowAgentDetails(true);
  };

  const handleBrowseAgents = () => {
    setCurrentView('agents');
  };

  if (currentView === 'panel' && selectedPanel) {
    return (
      <PanelInterface
        panel={selectedPanel}
        onBackToBuilder={handleBackToBuilder}
        onBackToTemplates={handleBackToTemplates}
      />
    );
  }

  if (currentView === 'builder') {

    return (
      <PanelBuilder
        templateId={templateId}
        experts={agents}
        onPanelCreate={handlePanelCreate}
        onBackToTemplates={handleBackToTemplates}
      />
    );
  }

  if (currentView === 'agents') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">AI Agents Management</h1>
              <p className="text-muted-foreground mt-2">
                Select and manage AI agents for your panel
              </p>
            </div>
            <Button onClick={() => setCurrentView('templates')} variant="outline">
              Back to Templates
            </Button>
          </div>
          
          <AgentsBoard
            onAgentSelect={handleAgentSelect}
            onAddToChat={handleAddToPanel}
            showCreateButton={true}
            hiddenControls={false}
            searchQuery=""
            onSearchChange={() => { /* TODO: implement */ }}
            selectedDomain="all"
            onFilterChange={() => { /* TODO: implement */ }}
            viewMode="grid"
            onViewModeChange={() => { /* TODO: implement */ }}
          />
        </div>

        {/* Agent Details Modal */}
        {selectedAgent && (
          <AgentDetailsModal
            agent={selectedAgent}
            onClose={() => {
              setShowAgentDetails(false);
              setSelectedAgent(null);
            }}
            onEdit={(agent) => {
              // setShowAgentDetails(false);
              setSelectedAgent(null);
            }}
            onDuplicate={(agent) => {
              // setShowAgentDetails(false);
              setSelectedAgent(null);
            }}
          />
        )}
      </div>
    );
  }

  if (currentView === 'chat') {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Panel Chat Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView('builder')}
              >
                ← Back to Builder
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Panel Discussion</h1>
                <p className="text-sm text-muted-foreground">
                  {panelAgents.length} agents participating
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <Button
                  variant={chatMode === 'discussion' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChatMode('discussion')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Discussion
                </Button>
                <Button
                  variant={chatMode === 'consensus' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChatMode('consensus')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Consensus
                </Button>
                <Button
                  variant={chatMode === 'debate' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChatMode('debate')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Debate
                </Button>
              </div>
            </div>
          </div>
          
          {/* Panel Agents */}
          <div className="mt-4 flex flex-wrap gap-2">
            {panelAgents.map((agent) => (
              <Badge key={agent.id} variant="secondary" className="flex items-center space-x-2">
                <Brain className="h-3 w-3" />
                <span>{agent.name}</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Start Panel Discussion</h3>
                  <p className="text-muted-foreground">
                    Ask your panel of {panelAgents.length} experts a question
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold text-sm">
                      {message.role === 'user' ? 'U' : 'P'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <Response>{message.content}</Response>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.role === 'user' ? 'You' : 'Panel'} • {message.timestamp.toLocaleTimeString()}
                      {message.metadata?.panelAgents && (
                        <span className="ml-2">
                          ({message.metadata.panelAgents?.join(', ') || 'Multiple agents'})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="border-t bg-white p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask your panel of experts..."
                className="w-full min-h-[80px] max-h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                disabled={isProcessing}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendPanelMessage();
                  }
                }}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {currentMessage.length}/4000
                  </span>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleSendPanelMessage}
              disabled={!currentMessage.trim() || isProcessing}
              className="bg-purple-600 hover:bg-purple-700 text-white w-12 h-12 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
        <PanelTemplates
          onTemplateSelect={handleTemplateSelect}
        />
  );
}

export default function AskPanelPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AskPanelContent />
    </Suspense>
  );
}