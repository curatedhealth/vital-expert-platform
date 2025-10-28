'use client';

/**
 * Ask Expert - Modern ChatGPT/Claude-style Interface
 *
 * Features:
 * - Clean, minimalist design
 * - 2-toggle mode selector (subtle, above chat)
 * - Full-screen chat experience
 * - Collapsible sidebar
 * - Streaming responses
 * - Markdown rendering
 * - Agent selection (when manual mode)
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Settings, Menu, X, Sparkles, User, ChevronDown, MessageSquare, History, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@vital/ui';
import { Card } from '@vital/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@vital/ui';
import { Switch } from '@vital/ui';
import { Label } from '@vital/ui';
import { Separator } from '@vital/ui';
import { ScrollArea } from '@vital/ui';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@vital/ui';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { useAgentsStore, Agent } from '@/lib/stores/agents-store';
import { getBackendMode, getModeName, requiresAgentSelection } from '@/features/ask-expert/utils/simplified-mode-mapper';

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentName?: string;
  agentAvatar?: string;
  isStreaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AskExpertModern() {
  const { user } = useAuth();
  const { agents, loadAgents } = useAgentsStore();

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [agentSelectorOpen, setAgentSelectorOpen] = useState(false);

  // Mode State (2 Toggles)
  const [isAutonomous, setIsAutonomous] = useState(false);
  const [isAutomatic, setIsAutomatic] = useState(true);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState('new');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load agents on mount
  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  // Check if agent selection is required
  const needsAgentSelection = requiresAgentSelection(isAutonomous, isAutomatic);

  // Handle send message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (needsAgentSelection && !selectedAgent) {
      alert('Please select an expert first');
      return;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Call real API with simplified mode system
      const mode = getBackendMode(isAutonomous, isAutomatic);

      // Simulate streaming response
      await simulateResponse(userMessage.content);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate streaming response (replace with real API)
  const simulateResponse = async (query: string) => {
    const assistantMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      agentName: selectedAgent?.name || 'AI Expert',
      agentAvatar: selectedAgent?.avatar,
      isStreaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    const response = `Based on your query about "${query.substring(0, 50)}...", here's my expert analysis:\n\n**Key Points:**\n\n1. First important consideration\n2. Second critical factor\n3. Third essential element\n\n**Recommendation:**\n\nI recommend proceeding with a comprehensive approach that addresses all these factors systematically.`;

    // Simulate streaming
    for (let i = 0; i < response.length; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 20));
      const chunk = response.substring(0, i + 5);
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessage.id
          ? { ...msg, content: chunk }
          : msg
      ));
    }

    setMessages(prev => prev.map(msg =>
      msg.id === assistantMessage.id
        ? { ...msg, isStreaming: false }
        : msg
    ));
  };

  // New conversation
  const handleNewConversation = () => {
    setMessages([]);
    setCurrentConversationId('new');
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.2 }}
            className="w-[280px] border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <Button
                onClick={handleNewConversation}
                className="w-full justify-start gap-2"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                New Conversation
              </Button>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Today
                </div>
                {conversations.slice(0, 3).map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setCurrentConversationId(conv.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      currentConversationId === conv.id
                        ? 'bg-gray-200 dark:bg-gray-800'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 mt-0.5 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {conv.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {conv.preview}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.email?.[0].toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user?.email || 'User'}
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 bg-white dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>

            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Ask Expert
              </h1>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {getModeName(isAutonomous, isAutomatic)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Agent Selector (when manual mode) */}
            {needsAgentSelection && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setAgentSelectorOpen(!agentSelectorOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {selectedAgent ? (
                        <>
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={selectedAgent.avatar} />
                            <AvatarFallback>{selectedAgent.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{selectedAgent.name}</span>
                        </>
                      ) : (
                        <>
                          <User className="h-4 w-4" />
                          <span className="text-sm">Select Expert</span>
                        </>
                      )}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Choose your expert</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettingsOpen(!settingsOpen)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Mode Settings Panel (Collapsible) */}
        <AnimatePresence>
          {settingsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-hidden"
            >
              <div className="p-4 max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Toggle 1: Interactive vs Autonomous */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-semibold">Conversation Type</Label>
                      <Switch
                        checked={isAutonomous}
                        onCheckedChange={setIsAutonomous}
                      />
                    </div>
                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className={`p-2 rounded ${!isAutonomous ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                        <span className="font-medium">💬 Interactive:</span> Back-and-forth conversation
                      </div>
                      <div className={`p-2 rounded ${isAutonomous ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}>
                        <span className="font-medium">🤖 Autonomous:</span> Goal-driven task execution
                      </div>
                    </div>
                  </Card>

                  {/* Toggle 2: Manual vs Automatic */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-semibold">Expert Selection</Label>
                      <Switch
                        checked={isAutomatic}
                        onCheckedChange={setIsAutomatic}
                      />
                    </div>
                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className={`p-2 rounded ${!isAutomatic ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                        <span className="font-medium">👤 Manual:</span> You choose the expert
                      </div>
                      <div className={`p-2 rounded ${isAutomatic ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}>
                        <span className="font-medium">✨ Automatic:</span> AI picks best expert(s)
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Agent Selector Dropdown */}
        <AnimatePresence>
          {agentSelectorOpen && needsAgentSelection && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden"
            >
              <div className="p-4 max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                  {agents.slice(0, 12).map((agent: Agent) => (
                    <button
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgent(agent);
                        setAgentSelectorOpen(false);
                      }}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedAgent?.id === agent.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={agent.avatar} />
                          <AvatarFallback>{agent.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate">{agent.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {agent.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages Area */}
        <ScrollArea className="flex-1 bg-white dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {messages.length === 0 ? (
              // Welcome Screen
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)] text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  {isAutonomous ? 'What would you like me to accomplish?' : 'How can I help you today?'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                  {isAutonomous
                    ? 'Describe your goal and I\'ll execute a multi-step workflow to achieve it.'
                    : 'Ask me anything and I\'ll provide expert insights.'
                  }
                </p>

                {/* Suggested Prompts */}
                <div className="grid md:grid-cols-2 gap-3 w-full max-w-2xl">
                  {[
                    { icon: '📋', text: 'FDA 510(k) submission strategy', type: 'Regulatory' },
                    { icon: '💊', text: 'Clinical trial design for Phase 2', type: 'Clinical' },
                    { icon: '💰', text: 'Reimbursement pathway planning', type: 'Market Access' },
                    { icon: '🔬', text: 'Preclinical study requirements', type: 'Research' }
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(prompt.text)}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all text-left group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{prompt.icon}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {prompt.text}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {prompt.type}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Messages
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={message.agentAvatar} />
                        <AvatarFallback>
                          <Sparkles className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className={`flex-1 max-w-3xl ${message.role === 'user' ? 'ml-12' : 'mr-12'}`}>
                      {message.role === 'assistant' && message.agentName && (
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {message.agentName}
                        </div>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        )}

                        {message.isStreaming && (
                          <span className="inline-block w-1 h-4 bg-current animate-pulse ml-1" />
                        )}
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="max-w-4xl mx-auto p-4">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isAutonomous
                    ? "Describe your goal (e.g., 'Create a comprehensive FDA 510(k) submission strategy')"
                    : "Ask a question (e.g., 'What are the FDA pathways for Class II devices?')"
                }
                disabled={isLoading || (needsAgentSelection && !selectedAgent)}
                className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 disabled:opacity-50 disabled:cursor-not-allowed"
                rows={1}
              />

              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || (needsAgentSelection && !selectedAgent)}
                size="sm"
                className="absolute right-2 bottom-2 rounded-xl"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
              {needsAgentSelection && !selectedAgent ? (
                <span className="text-amber-600 dark:text-amber-400">
                  Please select an expert to continue
                </span>
              ) : (
                <span>
                  Press <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded">Shift + Enter</kbd> for new line
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
