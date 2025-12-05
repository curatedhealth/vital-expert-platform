/**
 * Chat History Sidebar Component
 * Displays chat sessions and allows navigation between them
 */

'use client';

import React, { useState } from 'react';
import { useChatHistory } from '@/contexts/chat-history-context';
import { useAskExpert } from '@/contexts/ask-expert-context';
import { 
  Plus, 
  MessageSquare, 
  Clock, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  MoreVertical,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ChatHistorySidebarProps {
  className?: string;
}

export function ChatHistorySidebar({ className = '' }: ChatHistorySidebarProps) {
  const { 
    sessions, 
    currentSession, 
    sessionsLoading, 
    createSession, 
    loadSession, 
    updateSession, 
    deleteSession,
    refreshSessions 
  } = useChatHistory();
  
  const { selectedAgents, setSelectedAgents } = useAskExpert();
  
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleNewChat = async () => {
    console.log('🆕 [ChatHistorySidebar] Creating new chat');
    
    // Clear selected agents for new chat
    setSelectedAgents([]);
    
    // Create new session
    const session = await createSession('New Chat', 'manual');
    if (session) {
      console.log('✅ [ChatHistorySidebar] Created new session:', session.id);
    }
  };

  const handleSessionClick = async (sessionId: string) => {
    console.log('📂 [ChatHistorySidebar] Loading session:', sessionId);
    await loadSession(sessionId);
  };

  const handleEditSession = (session: any) => {
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveEdit = async () => {
    if (!editingSessionId || !editingTitle.trim()) return;
    
    await updateSession(editingSessionId, { title: editingTitle.trim() });
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this chat session?')) {
      await deleteSession(sessionId);
    }
  };

  const handleRefresh = async () => {
    await refreshSessions();
  };

  // ============================================================================
  // UTILITIES
  // ============================================================================

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.agent_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getModeBadgeColor = (mode: string) => {
    switch (mode) {
      case 'manual': return 'bg-blue-100 text-blue-800';
      case 'automatic': return 'bg-green-100 text-green-800';
      case 'autonomous': return 'bg-purple-100 text-purple-800';
      case 'multi-expert': return 'bg-orange-100 text-orange-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`flex flex-col h-full bg-white border-r border-neutral-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Chat History</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={sessionsLoading}
            >
              <Clock className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewChat}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
              <p className="text-sm">
                {searchQuery ? 'No chats match your search' : 'No chat history yet'}
              </p>
              {!searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewChat}
                  className="mt-2"
                >
                  Start New Chat
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative rounded-lg p-3 cursor-pointer transition-colors ${
                    currentSession?.id === session.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-neutral-50'
                  }`}
                  onClick={() => handleSessionClick(session.id)}
                >
                  {/* Session Content */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      {editingSessionId === session.id ? (
                        <div className="flex items-center gap-2 mb-1">
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="h-6 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit();
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveEdit}
                            className="h-6 w-6 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <h3 className="text-sm font-medium text-neutral-900 truncate mb-1">
                          {session.title}
                        </h3>
                      )}
                      
                      {/* Agent and Mode */}
                      <div className="flex items-center gap-2 mb-1">
                        {session.agent_name && (
                          <span className="text-xs text-neutral-600 truncate">
                            {session.agent_name}
                          </span>
                        )}
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getModeBadgeColor(session.mode)}`}
                        >
                          {session.mode}
                        </Badge>
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span>{session.message_count} messages</span>
                        <span>•</span>
                        <span>{formatDate(session.last_message_at)}</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                              handleEditSession(session);
                            }}
                          >
                            <Edit3 className="h-3 w-3 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(session.id);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-200">
        <div className="text-xs text-neutral-500 text-center">
          {sessions.length} chat{sessions.length !== 1 ? 's' : ''} total
        </div>
      </div>
    </div>
  );
}
