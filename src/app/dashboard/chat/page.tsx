'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { ChatMessages } from '@/components/chat/chat-messages';
import { ChatInput } from '@/components/chat/chat-input';
import { AgentSelector } from '@/components/chat/agent-selector';
import { ChatHeader } from '@/components/chat/chat-header';
import { AgentCreator } from '@/components/chat/agent-creator';
import { useChatStore, Agent } from '@/lib/stores/chat-store';
import type { AgentWithCategories } from '@/lib/agents/agent-service';
import {
  MessageSquare,
  Brain,
  FileText,
  Search,
  Settings,
  Plus,
  Zap,
} from 'lucide-react';

export default function ChatPage() {
  const {
    currentChat,
    messages,
    selectedAgent,
    isLoading,
    isLoadingAgents,
    createNewChat,
    sendMessage,
    setSelectedAgent,
    loadAgentsFromDatabase,
  } = useChatStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState('');
  const [editingAgent, setEditingAgent] = useState<AgentWithCategories | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load agents from database on component mount
  useEffect(() => {
    loadAgentsFromDatabase();
  }, [loadAgentsFromDatabase]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const message = input.trim();
    setInput('');

    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex bg-background-gray">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <ChatHeader
          selectedAgent={selectedAgent}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNewChat={createNewChat}
          onEditAgent={(agent) => setEditingAgent(agent as unknown as AgentWithCategories)}
        />

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          {currentChat ? (
            <div className="h-full flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <ChatMessages
                  messages={messages}
                />
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <ChatInput
                  value={input}
                  onChange={setInput}
                  onSend={handleSendMessage}
                  onKeyPress={handleKeyPress}
                  isLoading={isLoading}
                  selectedAgent={selectedAgent}
                />
              </div>
            </div>
          ) : (
            /* Welcome Screen */
            <div className="h-full flex items-center justify-center p-8">
              <div className="max-w-2xl text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-trust-blue to-progress-teal rounded-lg flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>

                <h1 className="text-3xl font-bold text-deep-charcoal mb-4">
                  Welcome to VITALpath AI Chat
                </h1>

                <p className="text-medical-gray mb-8 text-lg">
                  Chat with specialized AI agents for regulatory, clinical, and market access guidance.
                  Get expert insights to accelerate your digital health transformation.
                </p>

                {/* Quick Start Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <Brain className="h-8 w-8 text-trust-blue mx-auto mb-3" />
                      <h3 className="font-semibold text-deep-charcoal mb-2">
                        Ask Regulatory Expert
                      </h3>
                      <p className="text-sm text-medical-gray">
                        Get FDA/EMA guidance and regulatory pathway advice
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <FileText className="h-8 w-8 text-progress-teal mx-auto mb-3" />
                      <h3 className="font-semibold text-deep-charcoal mb-2">
                        Clinical Research Assistant
                      </h3>
                      <p className="text-sm text-medical-gray">
                        Protocol design and clinical evidence support
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Button
                  onClick={createNewChat}
                  className="bg-progress-teal hover:bg-progress-teal/90 px-8 py-3"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Start New Conversation
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agent Editor Modal */}
      {editingAgent && (
        <AgentCreator
          isOpen={!!editingAgent}
          onClose={() => setEditingAgent(null)}
          onSave={() => setEditingAgent(null)}
          editingAgent={editingAgent}
        />
      )}
    </div>
  );
}