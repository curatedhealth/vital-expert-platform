'use client';

/**
 * VITAL Platform - Ask Panel History
 *
 * Shows history of panel executions from conversations table (same storage as ask-expert).
 */

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, History, Loader2, Clock, Users, CheckCircle2, AlertCircle, RefreshCw, Bot, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth/supabase-auth-context';

interface PanelSession {
  sessionId: string;
  conversationId: string;
  title: string;
  questionPreview: string;
  panelType: string;
  agents: Array<{
    id: string;
    name: string;
    description?: string;
    avatar?: string;
  }>;
  agentCount: number;
  consensusScore?: number;
  executionTimeMs?: number;
  metadata?: {
    mode?: string;
    panel_type?: string;
    panel_id?: string;
  };
  lastMessage: string;
  messageCount: number;
}

// Panel type display names and colors
const PANEL_TYPE_META: Record<string, { name: string; color: string }> = {
  structured: { name: 'Structured', color: 'purple' },
  open: { name: 'Open', color: 'violet' },
  socratic: { name: 'Socratic', color: 'fuchsia' },
  adversarial: { name: 'Adversarial', color: 'pink' },
  delphi: { name: 'Delphi', color: 'indigo' },
  hybrid: { name: 'Hybrid', color: 'cyan' },
};

export default function PanelHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<PanelSession[]>([]);

  const fetchHistory = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch from the new API endpoint
      const response = await fetch(`/api/ask-panel?userId=${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch panel history');
      }

      setSessions(data.sessions || []);
    } catch (err: any) {
      console.error('Error fetching panel history:', err);
      setError(err.message || 'Failed to fetch panel history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchHistory();
    }
  }, [user?.id]);

  // Get consensus color based on score
  const getConsensusColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    if (score >= 0.4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Header */}
      <PageHeader
        icon={History}
        title="Panel History"
        description="View your past panel discussions and results"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Back Button & Refresh */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.push('/ask-panel')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Panel Types
            </Button>
            <Button variant="outline" size="sm" onClick={fetchHistory} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div className="flex-1">
                    <p className="font-medium text-red-900">Error loading history</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchHistory}>
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!user?.id ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
                  <p className="text-muted-foreground mb-4">
                    Please sign in to view your panel history.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">Loading history...</span>
            </div>
          ) : sessions.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <History className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Panel History Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Your panel discussions will appear here after you run them.
                  </p>
                  <Button onClick={() => router.push('/ask-panel')}>
                    Start a Panel Discussion
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Showing {sessions.length} panel{sessions.length !== 1 ? 's' : ''}
              </p>
              {sessions.map((session) => {
                const typeMeta = PANEL_TYPE_META[session.panelType] || { name: session.panelType, color: 'gray' };
                return (
                  <Card
                    key={session.sessionId}
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => {
                      router.push(`/ask-panel/history/${session.conversationId}`);
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">{session.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              {formatTimeAgo(session.lastMessage)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 flex-shrink-0" />
                              {session.agentCount} experts
                            </span>
                            {session.executionTimeMs && (
                              <span className="text-xs">
                                {(session.executionTimeMs / 1000).toFixed(1)}s
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                          {session.consensusScore !== undefined && (
                            <Badge className={getConsensusColor(session.consensusScore)}>
                              <BarChart3 className="w-3 h-3 mr-1" />
                              {Math.round(session.consensusScore * 100)}%
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {typeMeta.name}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Question Preview */}
                      {session.questionPreview && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {session.questionPreview}
                        </p>
                      )}

                      {/* Agent Avatars */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Experts:</span>
                        <div className="flex -space-x-2">
                          {session.agents.slice(0, 5).map((agent, idx) => (
                            <Avatar key={agent.id || idx} className="w-6 h-6 border-2 border-background">
                              <AvatarImage src={agent.avatar} alt={agent.name} />
                              <AvatarFallback className="text-xs bg-purple-100 text-purple-700">
                                {agent.name?.charAt(0) || 'E'}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {session.agents.length > 5 && (
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                              +{session.agents.length - 5}
                            </div>
                          )}
                        </div>
                        {session.agents.length > 0 && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {session.agents.slice(0, 2).map(a => a.name).join(', ')}
                            {session.agents.length > 2 && ` +${session.agents.length - 2} more`}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
