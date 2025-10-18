'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Clock, DollarSign, CheckCircle, XCircle, Play } from 'lucide-react';
import { SessionResponse, SessionListResponse } from '@/types/expert-consultation';
import { formatDistanceToNow } from 'date-fns';

interface SessionHistoryProps {
  userId: string;
  limit?: number;
}

export function SessionHistory({ userId, limit = 5 }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [userId, limit]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/ask-expert/sessions/${userId}?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      
      const data: SessionListResponse = await response.json();
      setSessions(data.sessions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Play className="w-4 h-4 text-blue-500" />;
      case 'paused': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatQuery = (query: string) => {
    return query.length > 60 ? `${query.slice(0, 60)}...` : query;
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchSessions}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <History className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No recent sessions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Sessions
          </div>
          <Button variant="ghost" size="sm" onClick={fetchSessions}>
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.session_id}
              className="border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => {
                // In production, navigate to session details or resume
                console.log('Navigate to session:', session.session_id);
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {formatQuery(session.original_query)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {session.expert_type.replace('-', ' ').toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  {getStatusIcon(session.status)}
                  <Badge className={getStatusColor(session.status)}>
                    {session.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(session.created_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    ${session.cost_accumulated.toFixed(2)}
                  </div>
                </div>
                <div className="text-xs">
                  {session.iterations_completed} iterations
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {sessions.length >= limit && (
          <div className="mt-4 pt-3 border-t">
            <Button variant="ghost" size="sm" className="w-full">
              View All Sessions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
