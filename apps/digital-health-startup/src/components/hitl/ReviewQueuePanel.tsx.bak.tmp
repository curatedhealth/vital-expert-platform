/**
 * HITL Review Queue Panel
 *
 * Human-in-the-loop review queue for high-risk agent responses
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui'
import { Badge } from '@vital/ui'
import { Button } from '@vital/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui'
import { Alert, AlertDescription } from '@vital/ui'
import { Skeleton } from '@vital/ui'
import { Textarea } from '@vital/ui'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@vital/ui'
import { useHITLQueue } from '@/lib/services/hooks/useBackendIntegration'
import type { ReviewQueueItem } from '@/lib/services/backend-integration-client'
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  User,
  Calendar,
  FileText
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ReviewQueuePanelProps {
  userId?: string
  queueName?: string
  autoRefresh?: boolean
  refreshInterval?: number // ms
  className?: string
}

const RISK_COLORS = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
  minimal: 'bg-green-500'
}

const STATUS_ICONS = {
  pending: <Clock className="w-4 h-4" />,
  in_review: <AlertCircle className="w-4 h-4" />,
  approved: <CheckCircle className="w-4 h-4" />,
  rejected: <XCircle className="w-4 h-4" />,
  escalated: <TrendingUp className="w-4 h-4" />
}

export function ReviewQueuePanel({
  userId,
  queueName,
  autoRefresh = true,
  refreshInterval = 30000, // 30s
  className = ''
}: ReviewQueuePanelProps) {
  const { queue, breached, loading, error, getQueue, getBreachedItems, approve, reject } = useHITLQueue()
  const [selectedStatus, setSelectedStatus] = useState<string>('pending')
  const [selectedItem, setSelectedItem] = useState<ReviewQueueItem | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Load queue on mount and refresh
  useEffect(() => {
    loadQueue()

    if (autoRefresh) {
      const interval = setInterval(loadQueue, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [selectedStatus, queueName]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadQueue = async () => {
    try {
      await getQueue(
        selectedStatus === 'all' ? undefined : selectedStatus,
        queueName
      )
      await getBreachedItems()
    } catch (err) {
      console.error('Failed to load queue:', err)
    }
  }

  const handleApprove = async () => {
    if (!selectedItem || !userId) return

    setActionLoading(true)
    try {
      await approve(selectedItem.id, userId, reviewNotes)
      setSelectedItem(null)
      setReviewNotes('')
    } catch (err) {
      console.error('Failed to approve:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedItem || !userId || !rejectReason) return

    setActionLoading(true)
    try {
      await reject(selectedItem.id, userId, rejectReason, reviewNotes)
      setSelectedItem(null)
      setReviewNotes('')
      setRejectReason('')
    } catch (err) {
      console.error('Failed to reject:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const filteredQueue = selectedStatus === 'all' ? queue : queue.filter(item => item.status === selectedStatus)

  if (loading && queue.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load review queue: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Review Queue ({queue.length})
            </span>
            <div className="flex items-center gap-2">
              {breached.length > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {breached.length} SLA Breached
                </Badge>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={loadQueue}
                disabled={loading}
              >
                Refresh
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Human-in-the-loop review queue for high-risk responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">
                All ({queue.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({queue.filter(i => i.status === 'pending').length})
              </TabsTrigger>
              <TabsTrigger value="in_review">
                In Review ({queue.filter(i => i.status === 'in_review').length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({queue.filter(i => i.status === 'approved').length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({queue.filter(i => i.status === 'rejected').length})
              </TabsTrigger>
              <TabsTrigger value="escalated">
                Escalated ({queue.filter(i => i.status === 'escalated').length})
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              {filteredQueue.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No items in queue
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredQueue.map((item) => (
                    <ReviewQueueItem
                      key={item.id}
                      item={item}
                      onReview={() => setSelectedItem(item)}
                      isBreached={breached.some(b => b.id === item.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Review Item
              <Badge variant={selectedItem?.slaBreached ? 'destructive' : 'outline'}>
                Priority {selectedItem?.priority}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Review this {selectedItem?.reviewType} item and approve or reject
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Queue:</span>{' '}
                  <span className="font-medium">{selectedItem.queueName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>{' '}
                  <span className="font-medium capitalize">{selectedItem.reviewType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>{' '}
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(selectedItem.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">SLA:</span>{' '}
                  <span className={`font-medium ${selectedItem.slaBreached ? 'text-red-500' : ''}`}>
                    {selectedItem.slaMinutes} minutes {selectedItem.slaBreached && '(BREACHED)'}
                  </span>
                </div>
              </div>

              {/* Risk Assessment (if available) */}
              {(selectedItem as any).risk_assessment && (
                <div className="border rounded-lg p-4 space-y-2">
                  <h4 className="font-medium">Risk Assessment</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Risk Level:</span>{' '}
                      <Badge className={(RISK_COLORS as any)[(selectedItem as any).risk_assessment.riskLevel]}>
                        {(selectedItem as any).risk_assessment.riskLevel}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Risk Score:</span>{' '}
                      <span className="font-medium">
                        {((selectedItem as any).risk_assessment.riskScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Category:</span>{' '}
                      <span className="font-medium">{(selectedItem as any).risk_assessment.riskCategory}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Review Notes */}
              <div>
                <label className="text-sm font-medium mb-2 block">Review Notes</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add your review notes..."
                  rows={3}
                />
              </div>

              {/* Reject Reason (shown when rejecting) */}
              <div>
                <label className="text-sm font-medium mb-2 block">Rejection Reason (if rejecting)</label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Required if rejecting..."
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedItem(null)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectReason}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={actionLoading}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Individual Review Queue Item
 */
function ReviewQueueItem({
  item,
  onReview,
  isBreached
}: {
  item: ReviewQueueItem
  onReview: () => void
  isBreached: boolean
}) {
  return (
    <div
      className={`border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer ${
        isBreached ? 'border-red-500' : ''
      }`}
      onClick={onReview}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {STATUS_ICONS[item.status as keyof typeof STATUS_ICONS]}
            <span className="font-medium capitalize">{item.status.replace('_', ' ')}</span>
            <Badge variant="outline">Priority {item.priority}</Badge>
            <Badge variant="outline" className="capitalize">{item.reviewType}</Badge>
            {isBreached && (
              <Badge variant="destructive">SLA Breached</Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <User className="w-3 h-3" />
              <span>User: {item.userId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>Created {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
            </div>
            {item.assignedTo && (
              <div className="flex items-center gap-2">
                <User className="w-3 h-3" />
                <span>Assigned to: {item.assignedTo}</span>
              </div>
            )}
          </div>
        </div>
        <Button size="sm" variant="outline">
          Review
        </Button>
      </div>
    </div>
  )
}

/**
 * Queue Statistics Widget
 */
export function QueueStatsWidget({ className = '' }: { className?: string }) {
  const { queue, breached } = useHITLQueue()

  const stats = {
    total: queue.length,
    pending: queue.filter(i => i.status === 'pending').length,
    breached: breached.length,
    avgPriority: queue.length > 0
      ? (queue.reduce((sum, i) => sum + i.priority, 0) / queue.length).toFixed(1)
      : '0'
  }

  return (
    <div className={`grid grid-cols-4 gap-4 ${className}`}>
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Items</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold">{stats.pending}</div>
          <div className="text-sm text-muted-foreground">Pending Review</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold text-red-500">{stats.breached}</div>
          <div className="text-sm text-muted-foreground">SLA Breached</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold">{stats.avgPriority}</div>
          <div className="text-sm text-muted-foreground">Avg Priority</div>
        </CardContent>
      </Card>
    </div>
  )
}
