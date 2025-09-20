'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { ChatMessages } from '@/components/chat/chat-messages';
import { ChatInput } from '@/components/chat/chat-input';
import { AgentSelector } from '@/components/chat/agent-selector';
import { ChatHeader } from '@/components/chat/chat-header';
import { AgentCreator } from '@/components/chat/agent-creator';
import { AgentAvatar } from '@/components/ui/agent-avatar';
import { useChatStore, Agent } from '@/lib/stores/chat-store';
import { useAuth } from '@/lib/auth/auth-context';
import { useAgentsStore } from '@/lib/stores/agents-store';
import { cn } from '@/lib/utils';
import type { AgentWithCategories } from '@/lib/agents/agent-service';
import { IconService, type Icon } from '@/lib/services/icon-service';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  MessageSquare,
  Brain,
  FileText,
  Search,
  Settings,
  Plus,
  Zap,
  Users,
  Workflow,
  Stethoscope,
  Home,
  Database,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Trash2,
  Bot,
} from 'lucide-react';

// Global navigation items (unused in chat page but kept for consistency)
const globalNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Agents',
    href: '/agents',
    icon: Users,
  },
  {
    title: 'Chat',
    href: '/chat',
    icon: MessageSquare,
  },
  {
    title: 'Knowledge',
    href: '/knowledge',
    icon: Database,
  },
  {
    title: 'Workflows',
    href: '/workflows',
    icon: Workflow,
    badge: 'Coming Soon',
  },
];

// Helper functions for dynamic prompt generation
const generateDynamicPrompts = (capabilities: string[]) => {
  const capabilityPrompts: Record<string, {text: string, description: string, color: string}[]> = {
    'regulatory': [
      { text: 'Regulatory pathway guidance', description: 'Get guidance on regulatory submissions', color: 'blue' },
      { text: 'Compliance requirements', description: 'Understand regulatory compliance needs', color: 'green' }
    ],
    'clinical': [
      { text: 'Clinical study design', description: 'Design clinical studies and trials', color: 'purple' },
      { text: 'Clinical data analysis', description: 'Analyze clinical trial data', color: 'orange' }
    ],
    'reimbursement': [
      { text: 'Market access strategy', description: 'Develop market access plans', color: 'blue' },
      { text: 'Payer analysis', description: 'Analyze payer landscape', color: 'green' }
    ],
    'medical-writing': [
      { text: 'Document drafting', description: 'Draft medical documents', color: 'purple' },
      { text: 'Regulatory writing', description: 'Create regulatory submissions', color: 'orange' }
    ]
  };

  const prompts: {text: string, description: string, color: string}[] = [];
  capabilities.forEach(capability => {
    const capabilityKey = capability.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (capabilityPrompts[capabilityKey]) {
      prompts.push(...capabilityPrompts[capabilityKey]);
    }
  });

  return prompts.length > 0 ? prompts : getDefaultPrompts();
};

const getDefaultPrompts = () => [
  { text: 'General assistance', description: 'Get help with general questions', color: 'blue' },
  { text: 'Knowledge search', description: 'Search the knowledge base', color: 'green' },
  { text: 'Best practices', description: 'Learn about best practices', color: 'purple' },
  { text: 'Expert guidance', description: 'Get expert recommendations', color: 'orange' }
];

export default function ChatPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const { createUserCopy, canEditAgent } = useAgentsStore();

  const {
    chats,
    currentChat,
    messages,
    selectedAgent,
    agents,
    isLoading,
    isLoadingAgents,
    createNewChat,
    selectChat,
    deleteChat,
    sendMessage,
    setSelectedAgent,
    loadAgentsFromDatabase,
    syncWithGlobalStore,
    subscribeToGlobalChanges,
  } = useChatStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [input, setInput] = useState('');
  const [promptIcons, setPromptIcons] = useState<Icon[]>([]);
  const [iconService] = useState(() => new IconService());
  const [editingAgent, setEditingAgent] = useState<AgentWithCategories | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAgentCreator, setShowAgentCreator] = useState(false);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [userAgents, setUserAgents] = useState<Agent[]>([]); // User's selected agents for chat
  const [mounted, setMounted] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    chatManagement: false,
    ragCategories: false,
    aiAgents: false,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load userAgents from localStorage after component mounts to prevent hydration issues
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user-chat-agents');
      if (saved) {
        try {
          const agents = JSON.parse(saved);
          // Ensure all existing agents are marked as user copies for edit permissions
          const markedAgents = agents.map((agent: Agent) => ({
            ...agent,
            is_user_copy: true, // Mark existing agents as user copies
            isCustom: true, // Also mark as custom for backwards compatibility
          }));
          setUserAgents(markedAgents);
        } catch (error) {
          console.error('Failed to parse user agents from localStorage:', error);
          setUserAgents([]);
        }
      }
    }
  }, []);

  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Load agents from database on component mount and sync with global store
  useEffect(() => {
    loadAgentsFromDatabase();
    syncWithGlobalStore();

    // Subscribe to global changes
    const unsubscribe = subscribeToGlobalChanges();

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [loadAgentsFromDatabase, syncWithGlobalStore, subscribeToGlobalChanges]);

  // Load prompt icons from database
  useEffect(() => {
    const loadIcons = async () => {
      try {
        const icons = await iconService.getPromptIcons();
        setPromptIcons(icons);
      } catch (error) {
        console.error('Failed to load prompt icons:', error);
      }
    };
    loadIcons();
  }, [iconService]);

  // Helper function to get icon for prompt starter
  const getPromptIcon = (promptText: string) => {
    const iconMap: Record<string, string> = {
      '510(k) vs PMA requirements': 'medical_document',
      'Regulatory strategy guidance': 'healthcare_analysis',
      'De Novo vs 510(k) pathways': 'stethoscope',
      'Submission checklist review': 'checklist',
      'Clinical trial design': 'stethoscope',
      'Sample size calculation': 'medical_document',
      'Biostatistics review': 'healthcare_analysis',
      'Endpoint selection': 'checklist',
      'Market access strategy': 'healthcare_analysis',
      'Payer engagement': 'medical_document',
      'Health economics model': 'stethoscope',
      'Coverage determination': 'checklist',
      'Protocol development': 'medical_document',
      'Regulatory writing': 'healthcare_analysis',
      'Clinical study report': 'stethoscope',
      'Medical communication': 'checklist'
    };

    const iconName = iconMap[promptText];
    const icon = promptIcons.find(i => i.name === iconName);
    return icon?.file_url || '📋'; // Fallback emoji
  };

  // Get agent-specific prompt starters with memoization
  const promptStarters = useMemo(() => {
    // Debug logging
    console.log('=== PROMPT STARTERS DEBUG ===');
    console.log('Selected agent:', selectedAgent?.id, selectedAgent?.name);

    if (!selectedAgent) {
      console.log('No agent selected, using default prompts');
      return [
        { text: '510(k) vs PMA requirements', description: 'Compare pathway requirements and timelines', color: 'blue' },
        { text: 'Regulatory strategy guidance', description: 'Get strategic advice for your submission', color: 'green' },
        { text: 'De Novo vs 510(k) pathways', description: 'Understand novel device classification options', color: 'purple' },
        { text: 'Submission checklist review', description: 'Ensure your submission is complete', color: 'orange' }
      ];
    }

    // Dynamic prompts based on agent capabilities or use default general prompts
    const prompts = selectedAgent?.capabilities && selectedAgent.capabilities.length > 0
      ? generateDynamicPrompts(selectedAgent.capabilities)
      : getDefaultPrompts();
    console.log('Using prompts for agent:', selectedAgent.id, prompts);
    console.log('=== END DEBUG ===');

    return prompts;
  }, [selectedAgent?.id]);

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

  const filteredChats = chats
    .filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .map((chat) => ({
      ...chat,
      updatedAt: chat.updatedAt instanceof Date ? chat.updatedAt.toISOString() : chat.updatedAt
    }));

  const formatDate = (date: Date | string) => {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return 'Unknown';
    }

    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return dateObj.toLocaleDateString();
  };

  const groupChatsByDate = (chats: typeof filteredChats) => {
    const groups: Record<string, typeof filteredChats> = {};

    chats.forEach((chat) => {
      const dateKey = formatDate(chat.createdAt);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(chat);
    });

    return groups;
  };

  const groupedChats = groupChatsByDate(filteredChats);



  const handleAgentStoreClick = () => {
    console.log('Opening Agent Store');
    // TODO: Navigate to agent marketplace/store
    router.push('/agents');
  };

  const handleCreateAgentClick = () => {
    console.log('Opening Agent Creator');
    setShowAgentCreator(true);
  };

  const handleAddAgentToChat = async (agent: Agent) => {
    try {
      // Check if this is an admin agent that needs to be copied
      // Admin agents are not custom, so we need to create user copies
      if (!agent.isCustom) {
        console.log('Creating user copy of admin agent:', agent.name);

        // Create user copy through the store
        const userCopy = await createUserCopy({
          id: agent.id,
          name: agent.name,
          display_name: agent.name,
          description: agent.description,
          system_prompt: agent.systemPrompt || '',
          model: agent.model || 'gpt-4',
          avatar: agent.avatar || '🤖',
          color: agent.color || '#3B82F6',
          capabilities: agent.capabilities || [],
          rag_enabled: agent.ragEnabled || false,
          temperature: agent.temperature || 0.7,
          max_tokens: agent.maxTokens || 2000,
          is_custom: agent.isCustom || false,
          is_public: true,
          status: 'active' as const,
          tier: 1,
          priority: 1,
          implementation_phase: 1,
          knowledge_domains: agent.knowledgeDomains || [],
          business_function: agent.businessFunction || '',
          role: agent.role || '',
        } as any);

        // Convert to chat store format and add to user's agents
        const chatAgent: Agent = {
          id: userCopy.id,
          name: userCopy.display_name,
          description: userCopy.description,
          systemPrompt: userCopy.system_prompt,
          model: userCopy.model,
          avatar: userCopy.avatar,
          color: userCopy.color,
          capabilities: userCopy.capabilities,
          ragEnabled: userCopy.rag_enabled,
          temperature: userCopy.temperature,
          maxTokens: userCopy.max_tokens,
          isCustom: userCopy.is_custom,
          knowledgeDomains: userCopy.knowledge_domains,
          businessFunction: userCopy.business_function || undefined,
          role: userCopy.role || undefined,
        };

        // Check if agent is already in user's chat list
        const isAlreadyAdded = userAgents.some(ua => ua.id === agent.id || ua.name === agent.name);
        if (!isAlreadyAdded) {
          const newUserAgents = [...userAgents, chatAgent];
          setUserAgents(newUserAgents);
          // Persist to localStorage
          localStorage.setItem('user-chat-agents', JSON.stringify(newUserAgents));
          console.log('Added user copy to chat:', chatAgent.name);
        } else {
          console.log('User copy already exists in chat');
        }
      } else {
        // This is already a user copy, just add it directly
        const isAlreadyAdded = userAgents.some(ua => ua.id === agent.id);
        if (!isAlreadyAdded) {
          const newUserAgents = [...userAgents, agent];
          setUserAgents(newUserAgents);
          // Persist to localStorage
          localStorage.setItem('user-chat-agents', JSON.stringify(newUserAgents));
          console.log('Added existing user copy to chat:', agent.name);
        } else {
          console.log('Agent already in chat:', agent.name);
        }
      }
    } catch (error) {
      console.error('Failed to add agent to chat:', error);
      // Fallback to old behavior if copy fails
      const isAlreadyAdded = userAgents.some(ua => ua.id === agent.id);
      if (!isAlreadyAdded) {
        const newUserAgents = [...userAgents, agent];
        setUserAgents(newUserAgents);
        localStorage.setItem('user-chat-agents', JSON.stringify(newUserAgents));
        console.log('Added agent to chat (fallback):', agent.name);
      }
    }
  };

  const handleAgentSelect = (agentId: string) => {
    console.log('=== AGENT SELECTION DEBUG ===');
    console.log('Selecting agent ID:', agentId);
    console.log('Available user agents:', userAgents.map(a => ({ id: a.id, name: a.name })));
    console.log('Available system agents:', agents.map(a => ({ id: a.id, name: a.name })));

    // First try to find in user's agents, then in all system agents
    let agent = userAgents.find(a => a.id === agentId);
    if (!agent) {
      agent = agents.find(a => a.id === agentId);
    }

    console.log('Found agent:', agent?.id, agent?.name);

    if (agent) {
      console.log('Setting selected agent to:', agent.id);
      setSelectedAgent(agent);
      // Don't auto-create chat - let user see the updated prompt starters first
      // createNewChat will be called when they send their first message
    } else {
      console.log(`Agent not found for ID: ${agentId}`);
    }
    console.log('=== END AGENT SELECTION DEBUG ===');
  };

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Render agent selection layout matching the provided design
  const renderAgentSelection = () => (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          {selectedAgent ? `Chat with ${selectedAgent.name}` : 'Select an AI Expert to Begin'}
        </h2>
        {selectedAgent && (
          <p className="text-muted-foreground">{selectedAgent.description}</p>
        )}
      </div>

      {/* User's selected agents */}
      {!mounted ? (
        <div className="mb-8">
          <Card className="p-8 text-center">
            <div className="text-lg mb-2">Loading your agents...</div>
          </Card>
        </div>
      ) : userAgents.length > 0 ? (
        <div className="space-y-4 mb-8">
          {userAgents.map((agent) => (
            <Card
              key={agent.id}
              className={cn(
                "p-4 hover:shadow-lg transition-shadow cursor-pointer",
                selectedAgent?.id === agent.id && "ring-2 ring-blue-500 bg-blue-50"
              )}
              onClick={() => handleAgentSelect(agent.id)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg">
                    {agent.avatar}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{agent.name}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Remove agent from user's collection
                        const updatedAgents = userAgents.filter(ua => ua.id !== agent.id);
                        setUserAgents(updatedAgents);
                        localStorage.setItem('user-chat-agents', JSON.stringify(updatedAgents));
                        // If this was the selected agent, clear selection
                        if (selectedAgent?.id === agent.id) {
                          setSelectedAgent(null);
                        }
                      }}
                    >
                      <span className="text-xs">×</span>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Click to start chatting with this agent
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mb-8">
          <Card className="p-8 text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold mb-2">No Agents Added</h3>
            <p className="text-muted-foreground mb-4">
              Visit the Agent Store to add AI experts to your chat interface
            </p>
            <Button
              onClick={() => window.location.href = '/agents'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Browse Agent Store
            </Button>
          </Card>
        </div>
      )}

      {/* Show prompt starters when agent is selected */}
      {selectedAgent && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">How can I help you today?</h3>
          <p className="text-gray-600 mb-6">
            Choose a topic below or ask me anything about {selectedAgent?.description ? selectedAgent.description.toLowerCase() : 'healthcare and regulatory topics'}
          </p>

          <div key={selectedAgent?.id || 'default'} className="grid gap-6 md:grid-cols-2">
            {promptStarters.map((prompt, index) => (
              <Card
                key={index}
                className="group p-5 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300 border-gray-200 bg-white hover:-translate-y-0.5"
                onClick={() => {
                  // Make sure we have an agent selected before sending message
                  if (!selectedAgent && agents.length > 0) {
                    setSelectedAgent(agents[0]);
                  }
                  setInput(prompt.text);
                  // Create chat first, then send message
                  createNewChat();
                  setTimeout(() => handleSendMessage(), 100);
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                    prompt.color === 'blue' && "bg-blue-100 group-hover:bg-blue-200",
                    prompt.color === 'green' && "bg-green-100 group-hover:bg-green-200",
                    prompt.color === 'purple' && "bg-purple-100 group-hover:bg-purple-200",
                    prompt.color === 'orange' && "bg-orange-100 group-hover:bg-orange-200"
                  )}>
                    {getPromptIcon(prompt.text).startsWith('http') || getPromptIcon(prompt.text).startsWith('/') ? (
                      <Image
                        src={getPromptIcon(prompt.text)}
                        alt={prompt.text}
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                    ) : (
                      <span className="text-lg">{getPromptIcon(prompt.text)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{prompt.text}</h4>
                    <p className="text-sm text-gray-600">{prompt.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render chat interface with prompt starters
  const renderChatInterface = () => (
    <div className="flex-1 flex flex-col bg-gray-50/30">
      {/* Enhanced Agent header with RAG status */}
      <div className="border-b bg-white shadow-sm">
        <div className="max-w-5xl mx-auto p-6">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-blue-100">
              {selectedAgent?.avatar && (selectedAgent.avatar.startsWith('/') || selectedAgent.avatar.startsWith('http')) ? (
                <Image
                  src={selectedAgent.avatar}
                  alt={selectedAgent.name || "Agent"}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-2xl">
                  {selectedAgent?.avatar || '🤖'}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-semibold text-gray-900">{selectedAgent?.name || "FDA Regulatory Navigator"}</h2>
                <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                  <span className="mr-1">⚡</span>
                  RAG Enabled
                </Badge>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedAgent?.description || "Guide regulatory pathway selection and submission strategies for FDA approvals"}
              </p>
            </div>
{selectedAgent && selectedAgent.isCustom && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0 text-gray-500 hover:text-gray-700"
              onClick={() => {
                if (selectedAgent) {
                  // Convert the selected agent to the expected format for editing
                  const currentAgent = {
                    id: selectedAgent.id,
                    name: selectedAgent.name,
                    display_name: selectedAgent.name,
                    description: selectedAgent.description,
                    system_prompt: selectedAgent.systemPrompt || '',
                    avatar: selectedAgent.avatar,
                    color: selectedAgent.color || '#3B82F6',
                    model: selectedAgent.model || 'gpt-4',
                    capabilities: selectedAgent.capabilities || [],
                    tier: 1,
                    priority: 1,
                    implementation_phase: 1,
                    rag_enabled: selectedAgent.ragEnabled || true,
                    knowledge_domains: selectedAgent.knowledgeDomains || [],
                    status: 'active' as const,
                    is_custom: selectedAgent.isCustom || false,
                    created_by: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    temperature: selectedAgent.temperature || 0.7,
                    max_tokens: selectedAgent.maxTokens || 2000,
                    categories: [],
                    business_function: selectedAgent.businessFunction || '',
                    role: selectedAgent.role || '',
                    // Fields that exist in the database schema
                    target_users: (selectedAgent as any).target_users || [],
                    // Healthcare compliance fields
                    medical_specialty: (selectedAgent as any).medicalSpecialty || '',
                    validation_status: (selectedAgent as any).validationStatus || 'pending',
                    accuracy_score: (selectedAgent as any).medicalAccuracyScore || 0.95,
                    hipaa_compliant: (selectedAgent as any).hipaaCompliant || false,
                    pharma_enabled: (selectedAgent as any).pharmaEnabled || false,
                    verify_enabled: (selectedAgent as any).verifyEnabled || false,
                    // Performance tracking fields
                    cost_per_query: null
                  };
                  setEditingAgent(currentAgent as unknown as AgentWithCategories);
                }
              }}
            >
              <Settings className="h-4 w-4" />
              <span className="ml-1">Edit</span>
            </Button>
            )}
          </div>
        </div>
      </div>

      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="max-w-4xl mx-auto p-8">
            {/* Welcome Section */}
            <div className="text-left mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">How can I help you today?</h3>
              <p className="text-gray-600">
                Choose a topic below or ask me anything about {selectedAgent?.description ? selectedAgent.description.toLowerCase() : 'healthcare and regulatory topics'}
              </p>
            </div>

            {/* Enhanced Prompt Starters */}
            <div key={selectedAgent?.id || 'default'} className="grid gap-6 md:grid-cols-2 mb-16">
              {promptStarters.map((prompt, index) => (
                <Card
                  key={index}
                  className="group p-5 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300 border-gray-200 bg-white hover:-translate-y-0.5"
                  onClick={() => {
                    // Make sure we have an agent selected before sending message
                    if (!selectedAgent && agents.length > 0) {
                      setSelectedAgent(agents[0]);
                    }
                    setInput(prompt.text);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                    prompt.color === 'blue' && "bg-blue-100 group-hover:bg-blue-200",
                    prompt.color === 'green' && "bg-green-100 group-hover:bg-green-200",
                    prompt.color === 'purple' && "bg-purple-100 group-hover:bg-purple-200",
                    prompt.color === 'orange' && "bg-orange-100 group-hover:bg-orange-200"
                  )}>
                      {getPromptIcon(prompt.text).startsWith('http') || getPromptIcon(prompt.text).startsWith('/') ? (
                        <Image
                          src={getPromptIcon(prompt.text)}
                          alt={prompt.text}
                          width={20}
                          height={20}
                          className="w-5 h-5"
                        />
                      ) : (
                        <span className="text-lg">{getPromptIcon(prompt.text)}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{prompt.text}</h4>
                      <p className="text-sm text-gray-600">{prompt.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

          </div>
        ) : (
          <div className="max-w-5xl mx-auto p-6">
            <ChatMessages messages={messages} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input area */}
      <div className="border-t bg-white shadow-sm">
        <div className="max-w-5xl mx-auto p-6">
          <div className="space-y-4">
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
      </div>
    </div>
  );

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <ChatSidebar
        chats={filteredChats}
        currentChat={currentChat ? {
          ...currentChat,
          updatedAt: currentChat.updatedAt instanceof Date ? currentChat.updatedAt.toISOString() : currentChat.updatedAt
        } : null}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewChat={createNewChat}
        onSelectChat={selectChat}
        onAgentStoreClick={handleAgentStoreClick}
        onCreateAgentClick={handleCreateAgentClick}
        onAgentSelect={handleAgentSelect}
        selectedAgentId={selectedAgent?.id}
        agents={mounted ? userAgents : []}
        formatDate={formatDate}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        mounted={mounted}
      />

      <SidebarInset>
        {/* Main Content Area */}
        <div className="flex flex-col h-full">


          {/* Content - Either agent selection or chat interface */}
          <div className="flex-1 overflow-hidden">
            {currentChat ? renderChatInterface() : renderAgentSelection()}
          </div>
        </div>
      </SidebarInset>


      {/* Agent Creator Modal */}
      {(editingAgent || showAgentCreator) && (
        <AgentCreator
          isOpen={!!editingAgent || showAgentCreator}
          onClose={() => {
            setEditingAgent(null);
            setShowAgentCreator(false);
          }}
          onSave={() => {
            setEditingAgent(null);
            setShowAgentCreator(false);
            // Refresh agents list after saving and sync with global store
            loadAgentsFromDatabase();
            syncWithGlobalStore();
            // Also refresh userAgents from localStorage
            const saved = localStorage.getItem('user-chat-agents');
            if (saved) {
              const agents = JSON.parse(saved);
              const markedAgents = agents.map((agent: Agent) => ({
                ...agent,
                is_user_copy: true,
                isCustom: true,
              }));
              setUserAgents(markedAgents);
            }
          }}
          editingAgent={editingAgent}
        />
      )}

    </SidebarProvider>
  );
}