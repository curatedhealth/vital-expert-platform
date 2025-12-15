'use client';

/**
 * VITAL Platform - Panel Conversation Detail
 *
 * Shows the full conversation history for a panel discussion.
 */

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Loader2,
  Clock,
  Users,
  BarChart3,
  MessageSquare,
  User,
  Bot,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant' | 'system' | 'consensus';
  content: string;
  timestamp?: number;
  expert?: {
    name: string;
    avatar?: string;
    confidence?: number;
  };
}

interface ConversationDetail {
  id: string;
  title: string;
  panelType: string;
  messages: Message[];
  agents: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  consensusScore?: number;
  createdAt: string;
  metadata?: Record<string, any>;
}

// Panel type display names
const PANEL_TYPE_META: Record<string, { name: string; color: string }> = {
  structured: { name: 'Structured Panel', color: 'purple' },
  open: { name: 'Open Panel', color: 'violet' },
  socratic: { name: 'Socratic Panel', color: 'fuchsia' },
  adversarial: { name: 'Adversarial Panel', color: 'pink' },
  delphi: { name: 'Delphi Panel', color: 'indigo' },
  hybrid: { name: 'Hybrid Panel', color: 'cyan' },
};

export default function PanelConversationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);

  useEffect(() => {
    async function fetchConversation() {
      if (!user?.id || !conversationId) {
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();

        const { data, error: fetchError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .eq('user_id', user.id)
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          // Parse messages from the conversation - stored in context.messages
          const rawMessages = data.context?.messages || data.messages || [];
          const messages: Message[] = rawMessages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            expert: msg.expert,
          }));

          // Get panel type from metadata
          const panelType = data.metadata?.panel_type || data.metadata?.mode || 'structured';

          // Get agents from metadata - could be agent_names or agents array
          const agentNames = data.metadata?.agent_names || [];
          const agentIds = data.metadata?.agent_ids || [];
          const agents = agentNames.map((name: string, idx: number) => ({
            id: agentIds[idx] || `agent-${idx}`,
            name: name,
          }));

          setConversation({
            id: data.id,
            title: data.title || 'Panel Discussion',
            panelType,
            messages,
            agents,
            consensusScore: data.metadata?.consensus_score || data.context?.panel_result?.consensus_score,
            createdAt: data.created_at,
            metadata: data.metadata,
          });
        }
      } catch (err: any) {
        console.error('Error fetching conversation:', err);
        setError(err.message || 'Failed to load conversation');
      } finally {
        setLoading(false);
      }
    }

    fetchConversation();
  }, [user?.id, conversationId]);

  // Format timestamp
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get consensus color
  const getConsensusColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading conversation...</span>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <MessageSquare className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {error ? 'Error Loading Conversation' : 'Conversation Not Found'}
        </h3>
        <p className="text-muted-foreground mb-4">{error || 'This conversation may have been deleted.'}</p>
        <Button onClick={() => router.push('/ask-panel/history')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to History
        </Button>
      </div>
    );
  }

  const typeMeta = PANEL_TYPE_META[conversation.panelType] || { name: 'Panel', color: 'gray' };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.push('/ask-panel/history')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-semibold truncate max-w-md">{conversation.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{typeMeta.name}</Badge>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {conversation.agents.length} experts
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(conversation.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            {conversation.consensusScore !== undefined && (
              <Badge className={cn("text-sm", getConsensusColor(conversation.consensusScore))}>
                <BarChart3 className="w-4 h-4 mr-1" />
                {Math.round(conversation.consensusScore * 100)}% Consensus
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {conversation.messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {message.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                ) : message.role === 'consensus' ? (
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                ) : message.expert?.avatar ? (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.expert.avatar} />
                    <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                      {message.expert.name?.charAt(0) || 'E'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className={cn(
                "flex-1 max-w-[80%]",
                message.role === 'user' ? "text-right" : "text-left"
              )}>
                {/* Expert name */}
                {message.expert?.name && message.role !== 'user' && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {message.expert.name}
                    </span>
                    {message.expert.confidence !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        {Math.round(message.expert.confidence * 100)}% confident
                      </Badge>
                    )}
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={cn(
                    "rounded-lg px-4 py-3 text-sm",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground rounded-br-sm ml-auto"
                      : message.role === 'consensus'
                      ? "bg-green-50 border border-green-200 text-green-900 rounded-bl-sm"
                      : message.role === 'system'
                      ? "bg-muted text-muted-foreground rounded-bl-sm italic"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}
                >
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>
                </div>

                {/* Timestamp */}
                {message.timestamp && (
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {formatTime(message.timestamp)}
                  </span>
                )}
              </div>
            </div>
          ))}

          {conversation.messages.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No messages in this conversation</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
