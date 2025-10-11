'use client';

import {
  MessageSquare,
  Settings,
  Users,
  Workflow,
  Home,
  Database,
  Zap,
  User,
  ImageIcon
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EnhancedAgentCard, AgentCardGrid } from '@/components/ui/enhanced-agent-card';
import {
  SidebarInset,
  SidebarProvider
} from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { AgentCreator } from '@/features/chat/components/agent-creator';
import { ChatInput } from '@/features/chat/components/chat-input';
import { ChatMessages } from '@/features/chat/components/chat-messages';
import { ChatSidebar } from '@/features/chat/components/chat-sidebar';
import { AgentsBoard } from '@/features/agents/components/agents-board';
import type { AgentWithCategories } from '@/lib/agents/agent-service';
import { useAuth } from '@/supabase-auth-context';
import { ClientAuthWrapper } from '@/components/auth/client-auth-wrapper';
import { IconService, type Icon } from '@/lib/services/icon-service';
import { useAgentsStore } from '@/lib/stores/agents-store';
import { useChatStore, Agent, type AIModel } from '@/lib/stores/chat-store';
import { cn } from '@/lib/utils';

// Global navigation items (unused in chat page but kept for consistency)
const navItems = [
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
const generateDynamicPrompts = (capabilities: string[] | undefined | null) => {
  // Ensure capabilities is an array
  const safeCapabilities = Array.isArray(capabilities) ? capabilities : [];
  
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
  safeCapabilities.forEach(capability => {
    const capabilityKey = capability.toLowerCase().replace(/[^a-z0-9]/g, '-');
    // Validate key before accessing object
    if (Object.prototype.hasOwnProperty.call(capabilityPrompts, capabilityKey)) {
      // eslint-disable-next-line security/detect-object-injection
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

function ChatPageContent() {
  const router = useRouter();
  const pathname = usePathname();

  const { user, loading, signOut } = useAuth();
  const { createUserCopy, canEditAgent } = useAgentsStore();

  const {
    chats,
    currentChat,
    messages,
    selectedAgent,
    selectedModel,
    agents,
    isLoading,
    isLoadingAgents,
    liveReasoning,
    isReasoningActive,
    interactionMode,
    autonomousMode,
    currentTier,
    escalationHistory,
    selectedExpert,
    setInteractionMode,
    setAutonomousMode,
    setSelectedExpert,
    createNewChat,
    selectChat,
    deleteChat,
    sendMessage,
    stopGeneration,
    setSelectedAgent,
    setSelectedModel,
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
  const [isSelectingAgent, setIsSelectingAgent] = useState(false);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [userAgents, setUserAgents] = useState<Agent[]>([]); // User's selected agents for chat
  const [recommendedAgents, setRecommendedAgents] = useState<any[]>([]);
  const [pendingMessage, setPendingMessage] = useState<string>('');

  // Auto-agent selection is controlled by interactionMode (automatic = enabled)
  const autoAgentSelection = interactionMode === 'automatic';
  const [mounted, setMounted] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    chatManagement: false,
    ragCategories: false,
    aiAgents: false,
  });
  const [hasUserSelectedAgent, setHasUserSelectedAgent] = useState(false);
  const [useDirectLLM, setUseDirectLLM] = useState(true); // Default to direct LLM
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

  // Helper function to get user initials
  const getUserInitials = (email: string) => {
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

    // Validate key before accessing object
    // eslint-disable-next-line security/detect-object-injection
    const iconName = Object.prototype.hasOwnProperty.call(iconMap, promptText) ? iconMap[promptText] : 'checklist';
    const icon = promptIcons.find(i => i.name === iconName);
    return icon?.file_url || '📋'; // Fallback emoji
  };

  // State for agent-specific prompt starters
  const [agentPromptStarters, setAgentPromptStarters] = useState<{text: string, description: string, color: string, icon?: string, fullPrompt?: string}[]>([]);

  // Fetch agent-specific prompt starters when agent changes
  useEffect(() => {
    const fetchAgentPromptStarters = async () => {
      if (!selectedAgent?.id) {
        setAgentPromptStarters([]);
        return;
      }

      try {
        const response = await fetch(`/api/agents/${selectedAgent.id}/prompt-starters`);
        if (response.ok) {
          const starters = await response.json();
          if (starters && starters.length > 0) {
            setAgentPromptStarters(starters);
          } else {
            // Fallback to default prompts if no agent-specific prompts found
            setAgentPromptStarters([]);
          }
        } else {
          setAgentPromptStarters([]);
        }
      } catch (error) {
        console.error('Error fetching agent prompt starters:', error);
        setAgentPromptStarters([]);
      }
    };

    fetchAgentPromptStarters();
  }, [selectedAgent?.id]);

  // Get agent-specific prompt starters with memoization
  const promptStarters = useMemo(() => {
    // Debug logging
    if (!selectedAgent) {
      return [
        { text: '510(k) vs PMA requirements', description: 'Compare pathway requirements and timelines', color: 'blue' },
        { text: 'Regulatory strategy guidance', description: 'Get strategic advice for your submission', color: 'green' },
        { text: 'De Novo vs 510(k) pathways', description: 'Understand novel device classification options', color: 'purple' },
        { text: 'Submission checklist review', description: 'Ensure your submission is complete', color: 'orange' }
      ];
    }

    // Use agent-specific prompts if available, otherwise use dynamic prompts based on capabilities
    if (agentPromptStarters.length > 0) {
      return agentPromptStarters;
    }

    // Dynamic prompts based on agent capabilities or use default general prompts
    const prompts = selectedAgent?.capabilities && selectedAgent.capabilities.length > 0
      ? generateDynamicPrompts(selectedAgent.capabilities)
      : getDefaultPrompts();
    return prompts;
  }, [selectedAgent?.id, agentPromptStarters]);

  const handleSendMessage = async () => {
    console.log('🚀 handleSendMessage called! input:', input);
    if (!input.trim()) return;

    const message = input.trim();
    console.log('📝 Message:', message);
    console.log('🤖 autoAgentSelection:', autoAgentSelection);
    console.log('👤 selectedAgent:', selectedAgent);

    // Step 1: Show agent recommendations if auto-selection is enabled and no agent selected
    if (autoAgentSelection && !selectedAgent) {
      console.log('✅ Entering recommendation flow');
      setIsSelectingAgent(true);
      setPendingMessage(message);
      setInput(''); // Clear input immediately

      try {
        const response = await fetch('/api/agents/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: message }),
        });

        console.log('📡 Response status:', response.status, response.ok);

        if (response.ok) {
          const data = await response.json();
          console.log('📥 Received recommendation data:', JSON.stringify(data, null, 2));
          console.log('📥 data.success:', data.success);
          console.log('📥 data.agents:', data.agents);
          console.log('📥 data.agents?.length:', data.agents?.length);

          if (data.success && data.agents && data.agents.length > 0) {
            // Show top 2-3 recommendations for user to choose
            const topAgents = data.agents.slice(0, 3);
            console.log('📦 Top agents slice:', topAgents.length);

            const enrichedAgents = topAgents.map((agent: any, index: number) => ({
              ...agent,
              reasoning: data.recommendations?.[index]?.reasoning || 'Best match for your query',
              score: data.recommendations?.[index]?.score || 100
            }));

            console.log('🎯 About to set recommendations:', enrichedAgents.length, 'agents');
            console.log('🎯 Enriched agents:', JSON.stringify(enrichedAgents.map(a => ({ id: a.id, name: a.name })), null, 2));
            setRecommendedAgents(enrichedAgents);
            console.log('✅ setRecommendedAgents called');
          } else {
            console.warn('⚠️ No agents in response or invalid data structure');
            console.warn('⚠️ data.success:', data.success);
            console.warn('⚠️ data.agents:', data.agents);
          }
        } else {
          console.error('❌ API response not OK:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('❌ Error fetching recommendations:', error);
        // If recommendation fails, send message without agent selection
        setIsSelectingAgent(false);
        setInput('');
        await sendMessage(message);
        return;
      }

      setIsSelectingAgent(false);

      // IMPORTANT: Return early to prevent sending message
      // The message will be sent after user selects an agent
      console.log('⏸️ Waiting for user to select agent from recommendations');
      return;
    }

    // Step 2: Send message if agent is already selected
    setInput('');
    await sendMessage(message);
  };

  // Handle agent selection from recommendations
  const handleSelectRecommendedAgent = async (recommendedAgent: any) => {
    console.log('🎯 handleSelectRecommendedAgent called with:', recommendedAgent);
    
    // Convert to Agent type and set as selected
    const agent: Agent = {
      id: recommendedAgent.id,
      name: recommendedAgent.name,
      display_name: recommendedAgent.display_name,
      description: recommendedAgent.description,
      avatar: recommendedAgent.avatar,
      systemPrompt: recommendedAgent.system_prompt || recommendedAgent.systemPrompt || '',
      tier: recommendedAgent.tier,
      capabilities: recommendedAgent.capabilities || [],
      model: selectedModel || recommendedAgent.model || 'gpt-4-turbo-preview', // Use selected model from dropdown
      color: recommendedAgent.color || 'text-blue-600',
      ragEnabled: recommendedAgent.rag_enabled || false,
      temperature: recommendedAgent.temperature || 0.7,
      maxTokens: recommendedAgent.max_tokens || 2000,
      isCustom: recommendedAgent.is_custom || false,
      knowledgeDomains: recommendedAgent.knowledge_domains || [],
      businessFunction: recommendedAgent.business_function,
      role: recommendedAgent.role,
      department: recommendedAgent.department,
      organizationalRole: recommendedAgent.organizational_role,
    };

    console.log('🤖 Converted agent object:', agent);
    console.log('📊 Current state - selectedModel:', selectedModel);
    console.log('📊 Current state - interactionMode:', interactionMode);
    console.log('📊 Current state - autonomousMode:', autonomousMode);

    setSelectedAgent(agent);

    // Clear recommendations and send the pending message
    setRecommendedAgents([]);
    const message = pendingMessage;
    setPendingMessage('');

    console.log('✅ User selected agent:', agent.display_name || agent.name, 'with model:', agent.model);
    console.log('📝 About to send message:', message);
    
    try {
      await sendMessage(message);
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      // Set error state to show user
      setError(error instanceof Error ? error.message : 'Failed to send message');
    }
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
      createdAt: chat.createdAt instanceof Date ? chat.createdAt : new Date(chat.createdAt || Date.now()),
      updatedAt: chat.updatedAt instanceof Date ? chat.updatedAt.toISOString() : chat.updatedAt
    }));

  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) {
      return 'Unknown';
    }
    
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (!dateObj || isNaN(dateObj.getTime())) {
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
    const groups: Record<string, typeof filteredChats> = { /* TODO: implement */ };

    // Ensure chats is an array
    const safeChats = Array.isArray(chats) ? chats : [];
    
    safeChats.forEach((chat) => {
      const dateKey = formatDate(chat.createdAt);
      // Validate key before accessing object
      if (!Object.prototype.hasOwnProperty.call(groups, dateKey)) {
        // eslint-disable-next-line security/detect-object-injection
        groups[dateKey] = [];
      }
      // eslint-disable-next-line security/detect-object-injection
      groups[dateKey].push(chat);
    });

    return groups;
  };

  const handleAgentStoreClick = () => {
    // TODO: Navigate to agent marketplace/store
    router.push('/agents');
  };

  const handleCreateAgentClick = () => {
    setShowAgentCreator(true);
  };

  const handleAddAgentToChat = async (agent: Agent) => {
    try {
      // Check if this is an admin agent that needs to be copied
      // Admin agents are not custom, so we need to create user copies
      if (!agent.isCustom) {
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
        } as unknown);

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
        } else { /* TODO: implement */ }
      } else {
        // This is already a user copy, just add it directly
        const isAlreadyAdded = userAgents.some(ua => ua.id === agent.id);
        if (!isAlreadyAdded) {
          const newUserAgents = [...userAgents, agent];
          setUserAgents(newUserAgents);
          // Persist to localStorage
          localStorage.setItem('user-chat-agents', JSON.stringify(newUserAgents));
        } else { /* TODO: implement */ }
      }
    } catch (error) {
      console.error('Failed to add agent to chat:', error);
      // Fallback to old behavior if copy fails
      const isAlreadyAdded = userAgents.some(ua => ua.id === agent.id);
      if (!isAlreadyAdded) {
        const newUserAgents = [...userAgents, agent];
        setUserAgents(newUserAgents);
        localStorage.setItem('user-chat-agents', JSON.stringify(newUserAgents));
      }
    }
  };

  const handleAgentSelect = (agentId: string) => {
    // First try to find in user's agents, then in all system agents
    let agent = userAgents.find(a => a.id === agentId);
    if (!agent) {
      agent = agents.find(a => a.id === agentId);
    }
    if (agent) {
      setSelectedAgent(agent);
      setHasUserSelectedAgent(true); // Mark that user has explicitly selected an agent
      setUseDirectLLM(false); // Switch to agent mode
      // Create a new chat to show the agent profile with prompt starters
      createNewChat();
    }
  };

  const handleAgentRemove = (agentId: string) => {
    // Remove agent from user's collection
    const updatedAgents = userAgents.filter(ua => ua.id !== agentId);
    setUserAgents(updatedAgents);
    localStorage.setItem('user-chat-agents', JSON.stringify(updatedAgents));

    // If this was the selected agent, clear selection
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(null);
      setHasUserSelectedAgent(false);
    }
  };

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      // eslint-disable-next-line security/detect-object-injection
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
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/agents';
                }
              }}
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
                  // In automatic mode, don't pre-select agent - let recommendation flow handle it
                  if (!autoAgentSelection && !selectedAgent && agents.length > 0) {
                    setSelectedAgent(agents[0]);
                  }
                  // Use fullPrompt if available (from PRISM library), otherwise use display text
                  setInput(prompt.fullPrompt || prompt.text);
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

  // Initial welcome view - no agent selected
  const renderInitialWelcome = () => (
    <div className="flex-1 flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center justify-center h-full px-6">
          {/* Orchestrator Avatar and Info - Show when in automatic mode */}
          {interactionMode === 'automatic' && (
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 mx-auto mb-4 overflow-hidden relative">
                <Image
                  src="/icons/png/general/AI Ethics.png"
                  alt="AI Agent Orchestrator"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                AI Agent Orchestrator
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Automatic agent selection and escalation
              </p>
              {escalationHistory.length > 0 && (
                <div className="text-sm text-gray-600">
                  <Badge variant="outline" className="mr-2">
                    Tier {currentTier === 'human' ? 'Human Expert' : currentTier}
                  </Badge>
                  {escalationHistory.length} escalation(s)
                </div>
              )}
            </div>
          )}

          {/* Simple welcome message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-normal text-gray-900 mb-4">
              What's on the agenda today?
            </h1>
            <p className="text-gray-600 mb-6">
              Ask me anything about digital health, clinical trials, regulatory compliance, and more.
            </p>
            {isSelectingAgent && (
              <div className="flex items-center justify-center gap-2 text-sm text-blue-600 mb-4">
                <Zap className="w-4 h-4 animate-pulse" />
                <span>Finding the best experts for your question...</span>
              </div>
            )}
          </div>

          {/* Agent Recommendations - Step 1 */}
          {console.log('🔍 Rendering check - recommendedAgents.length:', recommendedAgents.length)}
          {recommendedAgents.length > 0 ? (
            <div className="w-full max-w-3xl mb-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Which expert would you like to consult?
                </h3>
                <p className="text-sm text-gray-600">
                  Your question: &quot;{pendingMessage}&quot;
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedAgents.map((agent, index) => {
                  const getRankingTag = (index: number) => {
                    switch (index) {
                      case 0: return { label: 'Best Match', variant: 'default' as const, className: 'bg-blue-600 text-white' };
                      case 1: return { label: '2nd Choice', variant: 'secondary' as const, className: 'bg-green-100 text-green-800' };
                      case 2: return { label: '3rd Choice', variant: 'outline' as const, className: 'bg-orange-100 text-orange-800' };
                      default: return null;
                    }
                  };

                  const rankingTag = getRankingTag(index);

                  return (
                    <Card
                      key={agent.id}
                      className="p-4 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200 h-full"
                      onClick={() => handleSelectRecommendedAgent(agent)}
                    >
                      <div className="flex flex-col h-full">
                        {/* Header with Avatar and Ranking */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 flex-shrink-0 overflow-hidden">
                            {agent.avatar && (agent.avatar.startsWith('/') || agent.avatar.includes('avatar_')) ? (
                              <Image
                                src={agent.avatar}
                                alt={agent.display_name || agent.name}
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <span className="text-lg">{agent.avatar || '🤖'}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm truncate">
                              {agent.display_name || agent.name}
                            </h4>
                            {agent.tier && (
                              <Badge variant="outline" className="text-xs mt-1">
                                Tier {agent.tier}
                              </Badge>
                            )}
                          </div>
                          {rankingTag && (
                            <Badge 
                              variant={rankingTag.variant}
                              className={`text-xs ${rankingTag.className}`}
                            >
                              {rankingTag.label}
                            </Badge>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
                          {agent.description}
                        </p>

                        {/* Score and Reasoning */}
                        <div className="space-y-2">
                          {agent.score !== undefined && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Match Score:</span>
                              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-semibold text-xs">
                                {Math.round(agent.score)}%
                              </div>
                            </div>
                          )}
                          {agent.reasoning && (
                            <p className="text-xs text-gray-500 italic line-clamp-2">
                              {agent.reasoning}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setRecommendedAgents([]);
                    setPendingMessage('');
                    setInput(pendingMessage);
                  }}
                  className="text-sm text-gray-600"
                >
                  Cancel and edit question
                </Button>
              </div>
            </div>
          ) : (
            console.log('❌ Not rendering recommendations - length is 0')
          )}

          {/* Single chat input - always visible */}
          {recommendedAgents.length === 0 && (
            <div className="w-full max-w-3xl">
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={handleSendMessage}
                onKeyPress={handleKeyPress}
                isLoading={isLoading || isSelectingAgent}
                selectedAgent={null}
                enableVoice={true}
                selectedModel={selectedModel || undefined}
                onModelChange={setSelectedModel}
                onStop={stopGeneration}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Agent-specific interface with avatar and prompt starters
  const renderChatInterface = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Expert Profile Header - Show when in manual mode */}
      {interactionMode === 'manual' && selectedExpert && (
        <div className="border-b px-6 py-3 bg-gray-50 flex-shrink-0">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 border-gray-200 overflow-hidden flex-shrink-0">
              {selectedExpert.avatar && (selectedExpert.avatar.startsWith('/') || selectedExpert.avatar?.includes('avatar_')) ? (
                <Image
                  src={selectedExpert.avatar}
                  alt={selectedExpert.display_name || selectedExpert.name}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-xl">{selectedExpert.avatar || '🤖'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{selectedExpert.display_name || selectedExpert.name}</h3>
              <p className="text-xs text-gray-600 truncate">{selectedExpert.description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedExpert(null)}
              className="flex-shrink-0"
            >
              Change
            </Button>
          </div>
        </div>
      )}

      {messages.length === 0 ? (
        // No messages - show centered agent profile with prompt starters and input
        <div className="flex-1 flex items-center justify-center overflow-y-auto px-6">
          <div className="w-full max-w-4xl mx-auto py-8">
            {/* Agent Avatar and Info */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
                {selectedAgent?.avatar && (selectedAgent.avatar.startsWith('/') || selectedAgent.avatar.includes('avatar_')) ? (
                  <Image
                    src={selectedAgent.avatar}
                    alt={selectedAgent.display_name || selectedAgent.name || "AI Assistant"}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-5xl">{selectedAgent?.avatar || '🤖'}</span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedAgent?.display_name || selectedAgent?.name || "AI Assistant"}
              </h1>
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
                {selectedAgent?.description || "Your AI assistant"}
              </p>
            </div>

            {/* 4 Prompt Starters Grid */}
            {promptStarters.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {promptStarters.slice(0, 4).map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(prompt.text);
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                    className="p-4 text-left border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group"
                  >
                    <div className="text-sm text-gray-700 group-hover:text-gray-900 line-clamp-3 font-medium">
                      {prompt.text}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Input component centered with content */}
            <div className="mt-6">
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={handleSendMessage}
                onKeyPress={handleKeyPress}
                isLoading={isLoading}
                selectedAgent={selectedAgent}
                enableVoice={true}
                selectedModel={selectedModel || undefined}
                onModelChange={setSelectedModel}
                onStop={stopGeneration}
              />
            </div>
          </div>
        </div>
      ) : (
        // Has messages - show messages area with input at bottom
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-6">
              <ChatMessages
                messages={messages}
                liveReasoning={liveReasoning}
                isReasoningActive={isReasoningActive}
              />
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Agent Recommendations overlay - Step 1 */}
          {console.log('🎨 Chat interface - recommendedAgents.length:', recommendedAgents.length)}
          {recommendedAgents.length > 0 && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <div className="w-full max-w-5xl">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Which expert would you like to consult?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your question: &quot;{pendingMessage}&quot;
                  </p>
                </div>

                <AgentCardGrid columns={3} layout="horizontal" className="gap-4">
                  {recommendedAgents.map((agent, index) => (
                    <EnhancedAgentCard
                      key={agent.id}
                      agent={agent}
                      isBestMatch={index === 0}
                      onClick={() => handleSelectRecommendedAgent(agent)}
                      showReasoning={false}
                      showTier={true}
                      size="sm"
                    />
                  ))}
                </AgentCardGrid>

                <div className="mt-4 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setRecommendedAgents([]);
                      setPendingMessage('');
                      setInput(pendingMessage);
                    }}
                    className="text-sm text-gray-600"
                  >
                    Cancel and edit question
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Input component at bottom when there are messages */}
          <div className="flex-shrink-0 border-t bg-white">
            <div className="max-w-4xl mx-auto px-6 py-3">
              {isSelectingAgent && (
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600 mb-2">
                  <Zap className="w-4 h-4 animate-pulse" />
                  <span>Finding the best experts for your question...</span>
                </div>
              )}
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={handleSendMessage}
                onKeyPress={handleKeyPress}
                isLoading={isLoading || isSelectingAgent}
                selectedAgent={selectedAgent}
                enableVoice={true}
                selectedModel={selectedModel || undefined}
                onModelChange={setSelectedModel}
                onStop={stopGeneration}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
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
          onAgentRemove={handleAgentRemove}
          selectedAgentId={selectedAgent?.id}
          agents={mounted ? userAgents : []}
          formatDate={formatDate}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          mounted={mounted}
          interactionMode={interactionMode}
          onToggleMode={setInteractionMode}
          autonomousMode={autonomousMode}
          onToggleAutonomous={setAutonomousMode}
        />

        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          {/* Content - Show initial welcome, agent selection, or chat interface */}
          <div className="flex-1 overflow-hidden">
            {(() => {
              // Debug logging
              console.log('🔍 Render Decision:', {
                interactionMode,
                selectedExpert: !!selectedExpert,
                messagesLength: messages.length,
                useDirectLLM,
                hasUserSelectedAgent,
                selectedAgent: !!selectedAgent
              });

              // Simplified dual-mode logic (prioritize new system)
              if (interactionMode === 'manual') {
                // In manual mode, show agent profile when agent is selected
                if (selectedAgent) {
                  console.log('✅ Rendering: Manual mode with selected agent - Chat Interface with Agent Profile');
                  return renderChatInterface();
                } else if (selectedExpert) {
                  console.log('✅ Rendering: Manual mode with expert - Chat Interface');
                  return renderChatInterface();
                } else {
                  console.log('✅ Rendering: Manual mode no agent - Initial Welcome with Agents Board');
                  return renderInitialWelcome();
                }
              }

              if (interactionMode === 'automatic') {
                if (messages.length > 0) {
                  console.log('✅ Rendering: Automatic mode with messages - Chat Interface');
                  return renderChatInterface();
                } else {
                  console.log('✅ Rendering: Automatic mode no messages - Initial Welcome');
                  return renderInitialWelcome();
                }
              }

              // Legacy fallbacks (should rarely be hit now)
              if (!useDirectLLM && !hasUserSelectedAgent) {
                console.log('⚠️ Legacy: Agent mode no agent - Initial Welcome');
                return renderInitialWelcome();
              }

              if (messages.length > 0) {
                console.log('⚠️ Legacy: Has messages - Chat Interface');
                return renderChatInterface();
              }

              if (selectedAgent && hasUserSelectedAgent) {
                console.log('⚠️ Legacy: Agent selected - Chat Interface');
                return renderChatInterface();
              }

              console.log('⚠️ Fallback: Agent Selection');
              return renderAgentSelection();
            })()}
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
    </div>
  );
}

export default function ChatPage() {
  return (
    <ClientAuthWrapper requireAuth={true}>
      <ChatPageContent />
    </ClientAuthWrapper>
  );
}