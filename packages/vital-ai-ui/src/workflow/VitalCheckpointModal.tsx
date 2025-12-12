'use client';

import { useState } from 'react';
import { cn } from '../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@vital/ui';
import { Button } from '@vital/ui';
import { Textarea } from '@vital/ui';
import { Label } from '@vital/ui';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Shield,
  XCircle,
  Loader2
} from 'lucide-react';
import { Badge } from '@vital/ui';

type CheckpointType = 'approval' | 'review' | 'safety' | 'quality' | 'compliance';
type CheckpointUrgency = 'low' | 'medium' | 'high' | 'critical';

interface CheckpointContext {
  query: string;
  action: string;
  evidence?: string;
  risks?: string[];
  recommendations?: string[];
}

interface VitalCheckpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (feedback?: string) => void;
  onReject: (reason: string) => void;
  title: string;
  description?: string;
  type: CheckpointType;
  urgency: CheckpointUrgency;
  context: CheckpointContext;
  isLoading?: boolean;
  timeoutSeconds?: number;
  className?: string;
}

const typeIcons: Record<CheckpointType, React.ComponentType<{ className?: string }>> = {
  approval: CheckCircle,
  review: AlertCircle,
  safety: Shield,
  quality: CheckCircle,
  compliance: Shield,
};

const typeLabels: Record<CheckpointType, string> = {
  approval: 'Approval Required',
  review: 'Review Required',
  safety: 'Safety Check',
  quality: 'Quality Gate',
  compliance: 'Compliance Check',
};

const urgencyColors: Record<CheckpointUrgency, { badge: string; border: string }> = {
  low: { badge: 'bg-slate-100 text-slate-700', border: 'border-slate-200' },
  medium: { badge: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-200' },
  high: { badge: 'bg-orange-100 text-orange-700', border: 'border-orange-200' },
  critical: { badge: 'bg-red-100 text-red-700', border: 'border-red-200' },
};

/**
 * VitalCheckpointModal - Human-in-the-Loop checkpoint dialog
 * 
 * Displays checkpoint information and allows human approval/rejection
 * with optional feedback. Supports timeout countdowns for time-sensitive decisions.
 */
export function VitalCheckpointModal({
  isOpen,
  onClose,
  onApprove,
  onReject,
  title,
  description,
  type,
  urgency,
  context,
  isLoading = false,
  timeoutSeconds,
  className
}: VitalCheckpointModalProps) {
  const [feedback, setFeedback] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  
  const Icon = typeIcons[type];
  const colors = urgencyColors[urgency];
  
  const handleApprove = () => {
    onApprove(feedback || undefined);
    setFeedback('');
  };
  
  const handleReject = () => {
    if (showRejectForm && rejectionReason.trim()) {
      onReject(rejectionReason);
      setRejectionReason('');
      setShowRejectForm(false);
    } else {
      setShowRejectForm(true);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-lg", className)}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              urgency === 'critical' ? 'bg-red-100' : 'bg-blue-100'
            )}>
              <Icon className={cn(
                "h-5 w-5",
                urgency === 'critical' ? 'text-red-600' : 'text-blue-600'
              )} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg">{title}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={colors.badge}>
                  {typeLabels[type]}
                </Badge>
                <Badge variant="outline" className={colors.badge}>
                  {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority
                </Badge>
              </div>
            </div>
          </div>
          {description && (
            <DialogDescription className="mt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Context */}
          <div className="space-y-3">
            <div className="bg-muted rounded-lg p-3">
              <Label className="text-xs text-muted-foreground">Query</Label>
              <p className="text-sm mt-1">{context.query}</p>
            </div>
            
            <div className="bg-muted rounded-lg p-3">
              <Label className="text-xs text-muted-foreground">Proposed Action</Label>
              <p className="text-sm mt-1 font-medium">{context.action}</p>
            </div>
            
            {context.evidence && (
              <div className="bg-muted rounded-lg p-3">
                <Label className="text-xs text-muted-foreground">Evidence</Label>
                <p className="text-sm mt-1">{context.evidence}</p>
              </div>
            )}
          </div>
          
          {/* Risks */}
          {context.risks && context.risks.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Potential Risks
              </Label>
              <ul className="space-y-1">
                {context.risks.map((risk, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Recommendations */}
          {context.recommendations && context.recommendations.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Recommendations
              </Label>
              <ul className="space-y-1">
                {context.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Feedback input */}
          {!showRejectForm && (
            <div className="space-y-2">
              <Label htmlFor="feedback" className="text-sm">
                Feedback (optional)
              </Label>
              <Textarea
                id="feedback"
                placeholder="Add any feedback or modifications..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[60px]"
              />
            </div>
          )}
          
          {/* Rejection reason */}
          {showRejectForm && (
            <div className="space-y-2">
              <Label htmlFor="rejection" className="text-sm text-red-600">
                Rejection Reason (required)
              </Label>
              <Textarea
                id="rejection"
                placeholder="Please provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[60px] border-red-200 focus:border-red-500"
                autoFocus
              />
            </div>
          )}
          
          {/* Timeout warning */}
          {timeoutSeconds && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-950 rounded-lg p-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span>Auto-proceeding in {timeoutSeconds} seconds if no action taken</span>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2">
          {showRejectForm ? (
            <>
              <Button
                variant="outline"
                onClick={() => setShowRejectForm(false)}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isLoading || !rejectionReason.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Confirm Rejection
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Approve
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default VitalCheckpointModal;
