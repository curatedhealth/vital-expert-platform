'use client';

/**
 * VITAL Platform - Conversation History Sidebar
 *
 * Displays past conversations for the current user/tenant.
 * Allows searching, filtering by expert/date, and resuming conversations.
 *
 * Features:
 * - Search across conversation history
 * - Filter by expert, date range, mode
 * - Quick preview of conversation summaries
 * - Resume or delete conversations
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MessageSquare,
  Clock,
  User,
  Bot,
  ChevronRight,
  Trash2,
  Filter,
  Calendar,
  X,
  Plus,
  History,
  Star,
  StarOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';

// =============================================================================
// TYPES
// =============================================================================

export interface ConversationPreview {
  id: string;
  title: string;
  summary?: string;
  lastMessage: string;
  expertName?: string;
  expertAvatar?: string;
  mode: 'mode1' | 'mode2';
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  isFavorite?: boolean;
}

export interface ConversationHistorySidebarProps {
  /** List of conversations to display */
  conversations: ConversationPreview[];
  /** Currently active conversation ID */
  activeConversationId?: string;
  /** Called when user selects a conversation */
  onSelect: (conversationId: string) => void;
  /** Called when user wants to start a new conversation */
  onNewConversation: () => void;
  /** Called when user deletes a conversation */
  onDelete?: (conversationId: string) => void;
  /** Called when user toggles favorite */
  onToggleFavorite?: (conversationId: string) => void;
  /** Whether sidebar is collapsed */
  isCollapsed?: boolean;
  /** Called when collapse state changes */
  onToggleCollapse?: () => void;
  /** Whether conversations are loading */
  isLoading?: boolean;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function groupConversationsByDate(conversations: ConversationPreview[]) {
  const groups: { label: string; conversations: ConversationPreview[] }[] = [];
  const today: ConversationPreview[] = [];
  const yesterday: ConversationPreview[] = [];
  const thisWeek: ConversationPreview[] = [];
  const thisMonth: ConversationPreview[] = [];
  const older: ConversationPreview[] = [];

  for (const conv of conversations) {
    const date = new Date(conv.updatedAt);
    if (isToday(date)) {
      today.push(conv);
    } else if (isYesterday(date)) {
      yesterday.push(conv);
    } else if (isThisWeek(date)) {
      thisWeek.push(conv);
    } else if (isThisMonth(date)) {
      thisMonth.push(conv);
    } else {
      older.push(conv);
    }
  }

  if (today.length > 0) groups.push({ label: 'Today', conversations: today });
  if (yesterday.length > 0) groups.push({ label: 'Yesterday', conversations: yesterday });
  if (thisWeek.length > 0) groups.push({ label: 'This Week', conversations: thisWeek });
  if (thisMonth.length > 0) groups.push({ label: 'This Month', conversations: thisMonth });
  if (older.length > 0) groups.push({ label: 'Older', conversations: older });

  return groups;
}

function getModeLabel(mode: 'mode1' | 'mode2'): string {
  return mode === 'mode1' ? 'Expert Chat' : 'Smart Copilot';
}

function getModeColor(mode: 'mode1' | 'mode2'): string {
  return mode === 'mode1' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ConversationItemProps {
  conversation: ConversationPreview;
  isActive: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onToggleFavorite,
}: ConversationItemProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'group relative p-3 rounded-lg cursor-pointer transition-all',
        isActive
          ? 'bg-blue-50 border border-blue-200'
          : 'hover:bg-slate-50 border border-transparent'
      )}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Main content */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={cn(
          'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium',
          isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
        )}>
          {conversation.expertAvatar ? (
            <img
              src={conversation.expertAvatar}
              alt={conversation.expertName || 'Expert'}
              className="w-full h-full rounded-lg object-cover"
            />
          ) : conversation.expertName ? (
            conversation.expertName.charAt(0)
          ) : (
            <MessageSquare className="w-4 h-4" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              'font-medium truncate text-sm',
              isActive ? 'text-blue-900' : 'text-slate-900'
            )}>
              {conversation.title}
            </span>
            {conversation.isFavorite && (
              <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {conversation.lastMessage}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={cn('px-1.5 py-0.5 text-xs rounded', getModeColor(conversation.mode))}>
              {getModeLabel(conversation.mode)}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(conversation.updatedAt, { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className={cn(
          'w-4 h-4 flex-shrink-0 transition-colors',
          isActive ? 'text-blue-500' : 'text-slate-300 group-hover:text-slate-400'
        )} />
      </div>

      {/* Hover actions */}
      <AnimatePresence>
        {showActions && (onDelete || onToggleFavorite) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 right-2 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {onToggleFavorite && (
              <button
                onClick={onToggleFavorite}
                className="p-1.5 rounded hover:bg-slate-200 transition-colors"
                title={conversation.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {conversation.isFavorite ? (
                  <StarOff className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <Star className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 rounded hover:bg-red-100 transition-colors"
                title="Delete conversation"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ConversationHistorySidebar({
  conversations,
  activeConversationId,
  onSelect,
  onNewConversation,
  onDelete,
  onToggleFavorite,
  isCollapsed = false,
  onToggleCollapse,
  isLoading = false,
  className,
}: ConversationHistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let filtered = [...conversations];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.lastMessage.toLowerCase().includes(query) ||
          c.expertName?.toLowerCase().includes(query)
      );
    }

    // Filter by favorites
    if (showFavoritesOnly) {
      filtered = filtered.filter((c) => c.isFavorite);
    }

    // Sort by updatedAt descending
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return filtered;
  }, [conversations, searchQuery, showFavoritesOnly]);

  // Group by date
  const groupedConversations = useMemo(() => {
    return groupConversationsByDate(filteredConversations);
  }, [filteredConversations]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Collapsed state
  if (isCollapsed) {
    return (
      <div className={cn(
        'w-12 border-r border-slate-200 bg-slate-50 flex flex-col items-center py-4 gap-4',
        className
      )}>
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
          title="Expand sidebar"
        >
          <History className="w-5 h-5 text-slate-600" />
        </button>
        <button
          onClick={onNewConversation}
          className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          title="New conversation"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn(
      'w-80 border-r border-slate-200 bg-white flex flex-col',
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5" />
            History
          </h2>
          <div className="flex items-center gap-1">
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded hover:bg-slate-100 transition-colors"
                title="Collapse sidebar"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className={cn(
              'w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg',
              'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            )}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-slate-100"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg transition-colors',
              showFavoritesOnly
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            <Star className={cn('w-3 h-3', showFavoritesOnly && 'fill-amber-500')} />
            Favorites
          </button>
        </div>
      </div>

      {/* New Conversation Button */}
      <div className="p-3 border-b border-slate-100">
        <button
          onClick={onNewConversation}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
            'bg-blue-600 text-white font-medium text-sm',
            'hover:bg-blue-700 transition-colors'
          )}
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-3 p-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              {searchQuery
                ? 'No conversations match your search'
                : showFavoritesOnly
                ? 'No favorite conversations yet'
                : 'No conversations yet'}
            </p>
            {!searchQuery && !showFavoritesOnly && (
              <button
                onClick={onNewConversation}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700"
              >
                Start your first conversation
              </button>
            )}
          </div>
        ) : (
          <div className="p-2">
            {groupedConversations.map((group) => (
              <div key={group.label} className="mb-4">
                <h3 className="px-3 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {group.label}
                </h3>
                <div className="space-y-1">
                  {group.conversations.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      isActive={conversation.id === activeConversationId}
                      onSelect={() => onSelect(conversation.id)}
                      onDelete={onDelete ? () => onDelete(conversation.id) : undefined}
                      onToggleFavorite={
                        onToggleFavorite
                          ? () => onToggleFavorite(conversation.id)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="p-3 border-t border-slate-100 text-xs text-slate-400 text-center">
        {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

export default ConversationHistorySidebar;
