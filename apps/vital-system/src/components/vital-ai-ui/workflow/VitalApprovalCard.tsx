'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  User,
  FileText,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';
type ApprovalType = 'checkpoint' | 'safety' | 'cost' | 'delegation' | 'output';
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface ApprovalAction {
  id: string;
  label: string;
  description: string;
  riskLevel: RiskLevel;
}

interface ApprovalContext {
  agent: {
    id: string;
    name: string;
    level: 'L1' | 'L2' | 'L3' | 'L4';
  };
  task: string;
  reason: string;
  evidence?: string[];
  estimatedCost?: number;
  estimatedTime?: number;
}

interface VitalApprovalCardProps {
  id: string;
  type: ApprovalType;
  status: ApprovalStatus;
  title: string;
  description: string;
  context: ApprovalContext;
  actions: ApprovalAction[];
  createdAt: Date;
  expiresAt?: Date;
  onApprove: (actionId: string, comment?: string) => Promise<void>;
  onReject: (comment: string) => Promise<void>;
  onRequestMoreInfo?: () => void;
  className?: string;
}

const typeConfig: Record<ApprovalType, { icon: typeof Shield; color: string; label: string }> = {
  checkpoint: { icon: Shield, color: 'text-blue-500 bg-blue-50', label: 'Checkpoint' },
  safety: { icon: AlertTriangle, color: 'text-red-500 bg-red-50', label: 'Safety Review' },
  cost: { icon: FileText, color: 'text-orange-500 bg-orange-50', label: 'Cost Approval' },
  delegation: { icon: User, color: 'text-purple-500 bg-purple-50', label: 'Delegation' },
  output: { icon: CheckCircle2, color: 'text-green-500 bg-green-50', label: 'Output Review' },
};

const riskColors: Record<RiskLevel, string> = {
  low: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
};

const statusConfig: Record<ApprovalStatus, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-500', label: 'Pending' },
  approved: { icon: CheckCircle2, color: 'text-green-500', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-500', label: 'Rejected' },
  expired: { icon: AlertTriangle, color: 'text-gray-500', label: 'Expired' },
};

export function VitalApprovalCard({
  id,
  type,
  status,
  title,
  description,
  context,
  actions,
  createdAt,
  expiresAt,
  onApprove,
  onReject,
  onRequestMoreInfo,
  className,
}: VitalApprovalCardProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const TypeIcon = typeConfig[type].icon;
  const StatusIcon = statusConfig[status].icon;
  const isPending = status === 'pending';

  const timeRemaining = expiresAt ? getTimeRemaining(expiresAt) : null;

  const handleApprove = async () => {
    if (!selectedAction) return;
    setIsSubmitting(true);
    try {
      await onApprove(selectedAction, comment || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) return;
    setIsSubmitting(true);
    try {
      await onReject(comment);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden',
        status === 'pending' && 'border-yellow-200 shadow-yellow-100/50 shadow-lg',
        status === 'approved' && 'border-green-200 bg-green-50/30',
        status === 'rejected' && 'border-red-200 bg-red-50/30',
        status === 'expired' && 'border-gray-200 bg-gray-50/30 opacity-75',
        className
      )}
    >
      {/* Type indicator stripe */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1',
          type === 'safety' && 'bg-red-500',
          type === 'checkpoint' && 'bg-blue-500',
          type === 'cost' && 'bg-orange-500',
          type === 'delegation' && 'bg-purple-500',
          type === 'output' && 'bg-green-500'
        )}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg', typeConfig[type].color)}>
              <TypeIcon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-xs">
                {typeConfig[type].label} • {formatTime(createdAt)}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {timeRemaining && isPending && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {timeRemaining}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Time remaining before expiration</TooltipContent>
              </Tooltip>
            )}
            <Badge
              variant="outline"
              className={cn('text-xs', statusConfig[status].color)}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig[status].label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground">{description}</p>

        {/* Context */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="secondary" className="text-xs">
              {context.agent.level}
            </Badge>
            <span className="font-medium">{context.agent.name}</span>
          </div>
          <p className="text-sm">{context.task}</p>
          <p className="text-xs text-muted-foreground">{context.reason}</p>

          {/* Cost/Time estimates */}
          {(context.estimatedCost || context.estimatedTime) && (
            <div className="flex gap-4 pt-2 border-t border-muted">
              {context.estimatedCost && (
                <span className="text-xs text-muted-foreground">
                  Est. cost: ${context.estimatedCost.toFixed(4)}
                </span>
              )}
              {context.estimatedTime && (
                <span className="text-xs text-muted-foreground">
                  Est. time: {context.estimatedTime}s
                </span>
              )}
            </div>
          )}
        </div>

        {/* Evidence (collapsible) */}
        {context.evidence && context.evidence.length > 0 && (
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  showDetails && 'rotate-180'
                )}
              />
              View evidence ({context.evidence.length} items)
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <ul className="space-y-1 text-sm text-muted-foreground bg-muted/30 rounded p-2">
                {context.evidence.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Actions selection (only when pending) */}
        {isPending && actions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Select action to approve:</p>
            <div className="space-y-2">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => setSelectedAction(action.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-all',
                    selectedAction === action.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-muted hover:border-muted-foreground/30'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{action.label}</span>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', riskColors[action.riskLevel])}
                    >
                      {action.riskLevel} risk
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comment input (only when pending) */}
        {isPending && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Comment {status === 'pending' && '(required for rejection)'}
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[80px] resize-none"
            />
          </div>
        )}
      </CardContent>

      {/* Actions */}
      {isPending && (
        <CardFooter className="flex justify-between gap-2 pt-0">
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReject}
              disabled={isSubmitting || !comment.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <XCircle className="h-4 w-4 mr-1" />
              )}
              Reject
            </Button>
            {onRequestMoreInfo && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRequestMoreInfo}
                disabled={isSubmitting}
              >
                Request Info
              </Button>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={isSubmitting || !selectedAction}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-1" />
            )}
            Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// Helper functions
function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

function getTimeRemaining(expiresAt: Date): string | null {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) return null;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (minutes < 60) return `${minutes}m left`;
  return `${hours}h ${minutes % 60}m left`;
}

export type {
  ApprovalStatus,
  ApprovalType,
  RiskLevel,
  ApprovalAction,
  ApprovalContext,
  VitalApprovalCardProps,
};
