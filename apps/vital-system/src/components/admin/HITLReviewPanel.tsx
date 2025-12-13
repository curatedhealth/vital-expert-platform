'use client';

/**
 * HITL Review Panel Component
 *
 * Admin dashboard component for reviewing Human-in-the-Loop approval requests.
 * Connects to the AI Engine HITL WebSocket for real-time updates.
 *
 * Features:
 * - Real-time WebSocket connection for live approvals
 * - Plan/Tool/Sub-agent/Decision approval UI
 * - Approval history tracking
 * - Bulk approval actions
 *
 * Phase 6 Implementation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Users,
  Zap,
  FileText,
  GitBranch,
  ShieldCheck,
  Settings,
  Eye,
  Edit2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui';
import { Button } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { ScrollArea } from '@vital/ui';
import { Textarea } from '@vital/ui';

// ============================================================================
// TYPES
// ============================================================================

interface HITLApproval {
  id: string;
  checkpoint_id: string;
  thread_id: string;
  checkpoint_type: 'plan_approval' | 'tool_execution' | 'sub_agent_spawning' | 'critical_decision' | 'artifact_generation';
  request_data: any;
  created_at: string;
  expires_at: string | null;
}

interface ApprovalStats {
  total_pending: number;
  total_approved: number;
  total_rejected: number;
  approval_rate: number;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function CheckpointIcon({ type }: { type: string }) {
  switch (type) {
    case 'plan_approval':
      return <FileText className="h-5 w-5 text-blue-500" />;
    case 'tool_execution':
      return <Zap className="h-5 w-5 text-yellow-500" />;
    case 'sub_agent_spawning':
      return <GitBranch className="h-5 w-5 text-purple-500" />;
    case 'critical_decision':
      return <ShieldCheck className="h-5 w-5 text-rose-500" />;
    case 'artifact_generation':
      return <Settings className="h-5 w-5 text-green-500" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-neutral-500" />;
  }
}

function formatCheckpointType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function TimeAgo({ date }: { date: string }) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

  if (seconds < 60) return <span>{seconds}s ago</span>;
  if (seconds < 3600) return <span>{Math.floor(seconds / 60)}m ago</span>;
  if (seconds < 86400) return <span>{Math.floor(seconds / 3600)}h ago</span>;
  return <span>{Math.floor(seconds / 86400)}d ago</span>;
}

// ============================================================================
// APPROVAL CARD
// ============================================================================

interface ApprovalCardProps {
  approval: HITLApproval;
  onApprove: (id: string, feedback?: string) => void;
  onReject: (id: string, feedback?: string) => void;
  onModify: (id: string, modifications: any, feedback?: string) => void;
}

function ApprovalCard({ approval, onApprove, onReject, onModify }: ApprovalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(approval.id, feedback || undefined);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject(approval.id, feedback || undefined);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get summary based on checkpoint type
  const getSummary = () => {
    const data = approval.request_data;
    switch (approval.checkpoint_type) {
      case 'plan_approval':
        return `${data.plan_steps?.length || 0} steps, ~${data.total_estimated_time_minutes || 0}min`;
      case 'tool_execution':
        const tools = data.tools || [];
        return `${tools.length} tool(s): ${tools.map((t: any) => t.name).join(', ')}`;
      case 'sub_agent_spawning':
        return `${data.sub_agent_name} (Level ${data.sub_agent_level})`;
      case 'critical_decision':
        return data.decision_title || 'Decision pending';
      case 'artifact_generation':
        const artifacts = data.artifacts || [];
        return `${artifacts.length} artifact(s)`;
      default:
        return 'Pending review';
    }
  };

  return (
    <Card className="border-l-4 border-l-yellow-500 transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckpointIcon type={approval.checkpoint_type} />
            <div>
              <CardTitle className="text-base">
                {formatCheckpointType(approval.checkpoint_type)}
              </CardTitle>
              <CardDescription className="text-xs">
                {getSummary()}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              <TimeAgo date={approval.created_at} />
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-2 space-y-4">
          {/* Request Details */}
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 text-sm">
            <pre className="whitespace-pre-wrap overflow-auto max-h-60 text-xs">
              {JSON.stringify(approval.request_data, null, 2)}
            </pre>
          </div>

          {/* Feedback Input */}
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
              Feedback (optional)
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add feedback or notes..."
              className="h-20"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              disabled={isProcessing}
              className="text-rose-600 hover:bg-rose-50"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isProcessing}
              className="text-yellow-600 hover:bg-yellow-50"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Modify
            </Button>
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface HITLReviewPanelProps {
  tenantId: string;
  userId: string;
  aiEngineUrl?: string;
}

export function HITLReviewPanel({
  tenantId,
  userId,
  aiEngineUrl = process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://localhost:8000',
}: HITLReviewPanelProps) {
  const [approvals, setApprovals] = useState<HITLApproval[]>([]);
  const [stats, setStats] = useState<ApprovalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch pending approvals via REST
  const fetchApprovals = useCallback(async () => {
    try {
      const response = await fetch(
        `${aiEngineUrl}/api/hitl/pending?tenant_id=${tenantId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch approvals: ${response.statusText}`);
      }

      const data = await response.json();
      setApprovals(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch approvals');
    } finally {
      setLoading(false);
    }
  }, [aiEngineUrl, tenantId]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(
        `${aiEngineUrl}/api/hitl/stats?tenant_id=${tenantId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch HITL stats:', err);
    }
  }, [aiEngineUrl, tenantId]);

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = aiEngineUrl.replace('http', 'ws');
    const ws = new WebSocket(
      `${wsUrl}/api/hitl/ws?tenant_id=${tenantId}&user_id=${userId}`
    );

    ws.onopen = () => {
      setConnected(true);
      console.log('HITL WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'pending_approvals') {
          setApprovals(data.approvals);
        } else if (data.type === 'approval_request') {
          // Add new approval to list
          setApprovals((prev) => [data.approval, ...prev]);
        } else if (data.type === 'approval_update') {
          // Remove approved/rejected approval from list
          setApprovals((prev) =>
            prev.filter((a) => a.id !== data.approval_id)
          );
        }
      } catch (err) {
        console.error('Failed to parse HITL message:', err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('HITL WebSocket disconnected');

      // Reconnect after 5 seconds
      if (autoRefresh) {
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
      }
    };

    ws.onerror = (error) => {
      console.error('HITL WebSocket error:', error);
    };

    wsRef.current = ws;

    // Send heartbeat every 30 seconds
    const heartbeatInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [aiEngineUrl, tenantId, userId, autoRefresh]);

  // Initial load and WebSocket connection
  useEffect(() => {
    fetchApprovals();
    fetchStats();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [fetchApprovals, fetchStats, connectWebSocket]);

  // Auto-refresh polling as fallback
  useEffect(() => {
    if (!autoRefresh || connected) return;

    const interval = setInterval(() => {
      fetchApprovals();
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, connected, fetchApprovals]);

  // Respond to approval via REST
  const respondToApproval = async (
    approvalId: string,
    status: 'approved' | 'rejected' | 'modified',
    feedback?: string,
    modifications?: any
  ) => {
    try {
      const response = await fetch(
        `${aiEngineUrl}/api/hitl/respond/${approvalId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            status,
            user_feedback: feedback,
            modifications,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to respond: ${response.statusText}`);
      }

      // Remove from local list
      setApprovals((prev) => prev.filter((a) => a.id !== approvalId));

      // Refresh stats
      fetchStats();
    } catch (err) {
      console.error('Failed to respond to approval:', err);
      setError(err instanceof Error ? err.message : 'Failed to respond');
    }
  };

  const handleApprove = (id: string, feedback?: string) => {
    respondToApproval(id, 'approved', feedback);
  };

  const handleReject = (id: string, feedback?: string) => {
    respondToApproval(id, 'rejected', feedback);
  };

  const handleModify = (id: string, modifications: any, feedback?: string) => {
    respondToApproval(id, 'modified', feedback, modifications);
  };

  // Group approvals by type
  const groupedApprovals = approvals.reduce((acc, approval) => {
    const type = approval.checkpoint_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(approval);
    return acc;
  }, {} as Record<string, HITLApproval[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading HITL approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">HITL Review Panel</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Human-in-the-Loop approval queue for autonomous workflows
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <Badge
            variant={connected ? 'default' : 'destructive'}
            className="flex items-center gap-1"
          >
            {connected ? (
              <>
                <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                Connected
              </>
            ) : (
              <>
                <span className="h-2 w-2 bg-red-400 rounded-full" />
                Disconnected
              </>
            )}
          </Badge>

          {/* Auto-refresh Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? (
              <Pause className="h-4 w-4 mr-1" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            {autoRefresh ? 'Auto' : 'Manual'}
          </Button>

          {/* Refresh Button */}
          <Button variant="outline" size="sm" onClick={fetchApprovals}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {approvals.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.total_approved}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">
                {stats.total_rejected}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">
                Approval Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.approval_rate * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-rose-500 bg-rose-50 dark:bg-red-900/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approvals List */}
      {approvals.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-neutral-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">No pending approvals</p>
              <p className="text-sm mt-1">
                All HITL checkpoints have been reviewed
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">
              All ({approvals.length})
            </TabsTrigger>
            {Object.entries(groupedApprovals).map(([type, items]) => (
              <TabsTrigger key={type} value={type}>
                {formatCheckpointType(type)} ({items.length})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {approvals.map((approval) => (
                  <ApprovalCard
                    key={approval.id}
                    approval={approval}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onModify={handleModify}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {Object.entries(groupedApprovals).map(([type, items]) => (
            <TabsContent key={type} value={type} className="mt-4">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {items.map((approval) => (
                    <ApprovalCard
                      key={approval.id}
                      approval={approval}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onModify={handleModify}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

export default HITLReviewPanel;
