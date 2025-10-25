'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, MoreVertical, Star, Clock, TrendingUp,
  Filter, X, Bookmark, Trash2, Share2, ChevronRight
} from 'lucide-react';
import { useState, useCallback, useMemo } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@vital/ui/components/avatar';
import { Badge } from '@vital/ui/components/badge';
import { Button } from '@vital/ui/components/button';
import { Card, CardContent } from '@vital/ui/components/card';
import { Input } from '@vital/ui/components/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@vital/ui/components/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui/components/tabs';
import { cn } from '@vital/ui/lib/utils';

interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  mode: string;
  agentName?: string;
  agentAvatar?: string;
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

interface IntelligentSidebarProps {
  conversations: Conversation[];
  currentConversationId?: string;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation?: (id: string) => void;
  onBookmarkToggle?: (id: string) => void;
  sessionStats?: SessionStats;
  className?: string;
}

export function IntelligentSidebar({
  conversations,
  currentConversationId,
  onConversationSelect,
  onNewConversation,
  onDeleteConversation,
  onBookmarkToggle,
  sessionStats,
  className
}: IntelligentSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'recent' | 'bookmarked' | 'stats'>('recent');

  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.preview.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Mode filter
    if (filterMode) {
      filtered = filtered.filter(conv => conv.mode === filterMode);
    }

    // Tab filter
    if (activeTab === 'bookmarked') {
      filtered = filtered.filter(conv => conv.isBookmarked);
    }

    return filtered;
  }, [conversations, searchQuery, filterMode, activeTab]);

  const groupedConversations = useMemo(() => {
    const groups: Record<string, Conversation[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    filteredConversations.forEach(conv => {
      const convDate = new Date(conv.timestamp);
      if (convDate >= today) {
        groups.today.push(conv);
      } else if (convDate >= yesterday) {
        groups.yesterday.push(conv);
      } else if (convDate >= weekAgo) {
        groups.thisWeek.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  }, [filteredConversations]);

  const formatTimestamp = useCallback((date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }, []);

  const ConversationItem = ({ conversation }: { conversation: Conversation }) => {
    const isActive = currentConversationId === conversation.id;

    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        whileHover={{ scale: 1.02 }}
      >
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md mb-2",
            isActive && "ring-2 ring-blue-600 bg-blue-50/50"
          )}
          onClick={() => onConversationSelect(conversation.id)}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              {conversation.agentAvatar && (
                <Avatar className="h-8 w-8 mt-0.5">
                  <AvatarImage src={conversation.agentAvatar} />
                  <AvatarFallback>{conversation.agentName?.[0]}</AvatarFallback>
                </Avatar>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium truncate flex-1">
                    {conversation.title || 'Untitled conversation'}
                  </h4>
                  {conversation.isBookmarked && (
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                  )}
                </div>

                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                  {conversation.preview}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {conversation.mode}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {conversation.messageCount} messages
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(conversation.timestamp)}
                  </span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookmarkToggle?.(conversation.id);
                    }}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {conversation.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation?.(conversation.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className={cn("h-full flex flex-col bg-white", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <Button onClick={onNewConversation} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
        <TabsList className="w-full border-b rounded-none">
          <TabsTrigger value="recent" className="flex-1">
            <Clock className="h-4 w-4 mr-1" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="bookmarked" className="flex-1">
            <Bookmark className="h-4 w-4 mr-1" />
            Saved
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex-1">
            <TrendingUp className="h-4 w-4 mr-1" />
            Stats
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="recent" className="p-4 space-y-4 mt-0">
            {Object.entries(groupedConversations).map(([group, convs]) => {
              if (convs.length === 0) return null;

              const groupLabels = {
                today: 'Today',
                yesterday: 'Yesterday',
                thisWeek: 'This Week',
                older: 'Older'
              };

              return (
                <div key={group}>
                  <h3 className="text-xs font-medium text-gray-500 mb-2 uppercase">
                    {groupLabels[group as keyof typeof groupLabels]}
                  </h3>
                  <AnimatePresence>
                    {convs.map((conv) => (
                      <ConversationItem key={conv.id} conversation={conv} />
                    ))}
                  </AnimatePresence>
                </div>
              );
            })}

            {filteredConversations.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No conversations found</p>
                {searchQuery && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarked" className="p-4 space-y-2 mt-0">
            <AnimatePresence>
              {filteredConversations.map((conv) => (
                <ConversationItem key={conv.id} conversation={conv} />
              ))}
            </AnimatePresence>

            {filteredConversations.length === 0 && (
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No bookmarked conversations</p>
                <p className="text-xs text-gray-500 mt-1">
                  Bookmark conversations to find them easily later
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="p-4 space-y-4 mt-0">
            {sessionStats && (
              <>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium mb-3">Session Overview</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Total Conversations</span>
                        <span className="text-sm font-medium">{sessionStats.totalConversations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Total Messages</span>
                        <span className="text-sm font-medium">{sessionStats.totalMessages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Avg. Session Duration</span>
                        <span className="text-sm font-medium">{sessionStats.avgSessionDuration}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium mb-3">Most Used</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Mode</span>
                          <Badge variant="outline" className="text-xs">
                            {sessionStats.mostUsedMode}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Expert</span>
                          <span className="font-medium">{sessionStats.mostUsedAgent}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
