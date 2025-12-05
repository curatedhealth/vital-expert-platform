/**
 * Enhanced Sidebar Component
 * Features: Chat management, Agent selection, Settings, Search
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Plus,
  X,
  Search,
  Edit2,
  Trash2,
  Pin,
  MoreVertical,
  MessageSquare,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Filter,
  Star,
  Clock,
  Zap,
  Brain,
  Folder,
  Archive,
  Download,
  Upload,
  Check,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface Conversation {
  id: string;
  title: string;
  messages: any[];
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
  folder?: string;
  tags?: string[];
}

export interface Agent {
  id: string;
  name: string;
  displayName: string;
  description: string;
  tier: number;
  status: string;
  capabilities: string[];
  avatar?: string;
}

interface EnhancedSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePin: (id: string) => void;
  onClose: () => void;
  darkMode: boolean;

  // Agent selection
  agents?: Agent[];
  selectedAgents?: string[];
  onAgentSelect?: (agentIds: string[]) => void;

  // Settings
  settings?: any;
  onSettingsChange?: (settings: any) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EnhancedSidebar({
  conversations,
  activeConversationId,
  onConversationSelect,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onTogglePin,
  onClose,
  darkMode,
  agents = [],
  selectedAgents = [],
  onAgentSelect,
  settings = {},
  onSettingsChange,
}: EnhancedSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<number | null>(null);
  const [showFolders, setShowFolders] = useState(true);
  const [agentSearch, setAgentSearch] = useState('');

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group conversations
  const pinnedConversations = filteredConversations.filter(c => c.isPinned);
  const recentConversations = filteredConversations
    .filter(c => !c.isPinned)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 20);

  // Filter agents
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.displayName.toLowerCase().includes(agentSearch.toLowerCase()) ||
                         agent.description.toLowerCase().includes(agentSearch.toLowerCase());
    const matchesTier = filterTier === null || agent.tier === filterTier;
    return matchesSearch && matchesTier && agent.status === 'active';
  });

  // Group agents by tier
  const agentsByTier = filteredAgents.reduce((acc, agent) => {
    if (!acc[agent.tier]) acc[agent.tier] = [];
    acc[agent.tier].push(agent);
    return acc;
  }, {} as Record<number, Agent[]>);

  const handleRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const saveRename = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim());
      setEditingId(null);
      setEditTitle('');
    }
  };

  const toggleAgent = (agentId: string) => {
    if (!onAgentSelect) return;

    const newSelection = selectedAgents.includes(agentId)
      ? selectedAgents.filter(id => id !== agentId)
      : [...selectedAgents, agentId];

    onAgentSelect(newSelection);
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      className="w-80 border-r border-neutral-200 dark:border-neutral-800 flex flex-col bg-neutral-50 dark:bg-neutral-900 h-screen"
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            <span className="font-semibold text-neutral-900 dark:text-white">My Agents</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        {/* Browse Agent Store Button */}
        <a
          href="/agents"
          className="w-full flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all shadow-sm hover:shadow-md mb-3"
        >
          <Plus className="w-5 h-5" />
          <span>Browse Agent Store</span>
        </a>
      </div>

      {/* Agents Content */}
      <div className="flex-1 overflow-hidden">
        {/* Remove tabs - show only agents */}
        <div className="h-full flex flex-col">
          {/* Search & Filter */}
          <div className="p-3 space-y-2 border-b border-neutral-200 dark:border-neutral-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search agents..."
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-canvas-surface dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tier Filter */}
            <div className="flex gap-1">
              <button
                onClick={() => setFilterTier(null)}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                  filterTier === null
                    ? 'bg-blue-500 text-white'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                }`}
              >
                All
              </button>
              {[1, 2, 3].map(tier => (
                <button
                  key={tier}
                  onClick={() => setFilterTier(tier)}
                  className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                    filterTier === tier
                      ? 'bg-blue-500 text-white'
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                  }`}
                >
                  Tier {tier}
                </button>
              ))}
            </div>

            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected
            </div>
          </div>

          {/* Agents List */}
          <div className="flex-1 overflow-y-auto p-2">
            {Object.entries(agentsByTier)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([tier, tierAgents]) => (
                <div key={tier} className="mb-4">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    <Star className={`w-3 h-3 ${Number(tier) === 1 ? 'text-yellow-500' : ''}`} />
                    Tier {tier} ({tierAgents.length})
                  </div>
                  {tierAgents.map(agent => (
                    <AgentItem
                      key={agent.id}
                      agent={agent}
                      isSelected={selectedAgents.includes(agent.id)}
                      onToggle={() => toggleAgent(agent.id)}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              ))}

            {filteredAgents.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
                <Users className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-3" />
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  No agents found
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
                  Click "Browse Agent Store" to add agents
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

// ============================================================================
// SUB-COMPONENTS - Keep these for agent rendering
// ============================================================================

// AgentItem component
interface AgentItemProps {
  agent: Agent;
  isSelected: boolean;
  onToggle: () => void;
  darkMode: boolean;
}

function AgentItem({ agent, isSelected, onToggle, darkMode }: AgentItemProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full px-3 py-2.5 rounded-lg transition-all mb-1 ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 border-2 border-transparent'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {isSelected && (
          <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-neutral-900 dark:text-white truncate">
              {agent.displayName}
            </span>
            <span className={`px-1.5 py-0.5 text-xs rounded ${
              agent.tier === 1
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                : agent.tier === 2
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400'
            }`}>
              T{agent.tier}
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
            {agent.description}
          </p>
          {agent.capabilities && agent.capabilities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {agent.capabilities.slice(0, 2).map((cap, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded"
                >
                  {cap}
                </span>
              ))}
              {agent.capabilities.length > 2 && (
                <span className="text-xs text-neutral-500 dark:text-neutral-500">
                  +{agent.capabilities.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// Remove all the old tab-based code below (ConversationItem, SettingsSection, etc.)
// The component now only shows agents

// OLD CODE REMOVED - No longer needed:
// - ConversationItem component
// - SettingsSection component
// - SettingItem component
// All the tab-based conditional rendering

// Keeping minimal sub-components needed
function ConversationItem(props: any) {
  // Stub - not used anymore but keeping to avoid breaking existing imports
  return null;
}

function SettingsSection(props: any) {
  // Stub - not used anymore but keeping to avoid breaking existing imports
  return null;
}

function SettingItem(props: any) {
  // Stub - not used anymore but keeping to avoid breaking existing imports
  return null;
}
