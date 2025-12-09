'use client';

import { useState } from 'react';
import { cn } from '../lib/utils';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  DollarSign,
  Key,
  Users,
  Clock,
  Shield,
  ChevronDown,
  Rocket,
  ArrowDownCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export type CheckStatus = 'pending' | 'checking' | 'passed' | 'failed' | 'warning';

export interface PreFlightCheckItem {
  id: string;
  name: string;
  description: string;
  status: CheckStatus;
  category: 'budget' | 'permissions' | 'agents' | 'time' | 'safety';
  details?: string;
  required: boolean;
}

export interface VitalPreFlightCheckProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close modal */
  onClose: () => void;
  /** Mission title */
  missionTitle: string;
  /** Pre-flight checks */
  checks: PreFlightCheckItem[];
  /** Estimated budget for mission */
  estimatedBudget?: {
    tokens: number;
    cost: number;
    currency?: string;
  };
  /** Estimated duration */
  estimatedDuration?: string;
  /** Whether checks are running */
  isChecking?: boolean;
  /** Callback to launch mission */
  onLaunch: () => void;
  /** Callback to downgrade to simpler mode */
  onDowngrade?: () => void;
  /** Callback to retry failed checks */
  onRetry?: () => void;
  /** Target mode (for display) */
  targetMode?: number;
  /** Fallback mode suggestion */
  fallbackMode?: number;
  /** Custom class name */
  className?: string;
}

const categoryConfig: Record<PreFlightCheckItem['category'], { icon: typeof CheckCircle; label: string }> = {
  budget: { icon: DollarSign, label: 'Budget' },
  permissions: { icon: Key, label: 'Permissions' },
  agents: { icon: Users, label: 'Agent Compatibility' },
  time: { icon: Clock, label: 'Time Estimate' },
  safety: { icon: Shield, label: 'Safety' },
};

const statusConfig: Record<CheckStatus, { icon: typeof CheckCircle; color: string; label: string }> = {
  pending: { icon: CheckCircle, color: 'text-muted-foreground', label: 'Pending' },
  checking: { icon: Loader2, color: 'text-blue-500', label: 'Checking...' },
  passed: { icon: CheckCircle, color: 'text-green-500', label: 'Passed' },
  failed: { icon: XCircle, color: 'text-red-500', label: 'Failed' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', label: 'Warning' },
};

/**
 * VitalPreFlightCheck - Circuit Breaker Modal
 * 
 * Validates Mode 4 requirements before launch to prevent mid-mission failure.
 * Checks: Budget, Tool Access Permissions, Agent Compatibility.
 * Provides "Downgrade to Mode 2" fallback button.
 * 
 * Used with Vercel AI SDK for pre-flight validation before autonomous missions.
 * 
 * @example
 * ```tsx
 * <VitalPreFlightCheck
 *   isOpen={showPreFlight}
 *   onClose={() => setShowPreFlight(false)}
 *   missionTitle="Drug Interaction Analysis"
 *   checks={preFlightChecks}
 *   estimatedBudget={{ tokens: 50000, cost: 2.50 }}
 *   estimatedDuration="~8 minutes"
 *   onLaunch={() => launchMission()}
 *   onDowngrade={() => downgradeToMode2()}
 *   targetMode={4}
 *   fallbackMode={2}
 * />
 * ```
 */
export function VitalPreFlightCheck({
  isOpen,
  onClose,
  missionTitle,
  checks,
  estimatedBudget,
  estimatedDuration,
  isChecking = false,
  onLaunch,
  onDowngrade,
  onRetry,
  targetMode = 4,
  fallbackMode = 2,
  className,
}: VitalPreFlightCheckProps) {
  const [showDetails, setShowDetails] = useState(false);

  const passedCount = checks.filter(c => c.status === 'passed').length;
  const failedCount = checks.filter(c => c.status === 'failed' && c.required).length;
  const warningCount = checks.filter(c => c.status === 'warning' || (c.status === 'failed' && !c.required)).length;
  const progress = Math.round((passedCount / checks.length) * 100);

  const canLaunch = failedCount === 0 && !isChecking;
  const allPassed = passedCount === checks.length;

  // Group checks by category
  const groupedChecks = checks.reduce((acc, check) => {
    if (!acc[check.category]) acc[check.category] = [];
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, PreFlightCheckItem[]>);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn('max-w-lg', className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Pre-Flight Check
          </DialogTitle>
          <DialogDescription>
            Validating requirements for Mode {targetMode}: {missionTitle}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">System Readiness</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-3 w-3" />
              {passedCount} passed
            </span>
            {failedCount > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <XCircle className="h-3 w-3" />
                {failedCount} failed
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1 text-amber-600">
                <AlertTriangle className="h-3 w-3" />
                {warningCount} warnings
              </span>
            )}
          </div>
        </div>

        <Separator />

        {/* Estimates */}
        {(estimatedBudget || estimatedDuration) && (
          <div className="grid grid-cols-2 gap-4">
            {estimatedBudget && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Estimated Cost</p>
                <p className="text-lg font-semibold">
                  {estimatedBudget.currency || '$'}{estimatedBudget.cost.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  ~{estimatedBudget.tokens.toLocaleString()} tokens
                </p>
              </div>
            )}
            {estimatedDuration && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Estimated Duration</p>
                <p className="text-lg font-semibold">{estimatedDuration}</p>
              </div>
            )}
          </div>
        )}

        {/* Check Details */}
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span className="text-sm">View Details</span>
              <ChevronDown className={cn(
                'h-4 w-4 transition-transform',
                showDetails && 'rotate-180'
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-4 pt-2">
              {Object.entries(groupedChecks).map(([category, categoryChecks]) => {
                const config = categoryConfig[category as PreFlightCheckItem['category']];
                const CategoryIcon = config.icon;

                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-2">
                      <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{config.label}</span>
                    </div>
                    <div className="space-y-1.5 ml-6">
                      {categoryChecks.map((check) => {
                        const statusCfg = statusConfig[check.status];
                        const StatusIcon = statusCfg.icon;

                        return (
                          <div
                            key={check.id}
                            className="flex items-start gap-2 text-sm"
                          >
                            <StatusIcon
                              className={cn(
                                'h-4 w-4 flex-shrink-0 mt-0.5',
                                statusCfg.color,
                                check.status === 'checking' && 'animate-spin'
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  check.status === 'passed' && 'text-muted-foreground'
                                )}>
                                  {check.name}
                                </span>
                                {!check.required && (
                                  <Badge variant="outline" className="text-[10px]">
                                    Optional
                                  </Badge>
                                )}
                              </div>
                              {check.details && check.status !== 'passed' && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {check.details}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Status Message */}
        {!isChecking && (
          <div className={cn(
            'p-3 rounded-lg text-sm',
            allPassed && 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300',
            failedCount > 0 && 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300',
            warningCount > 0 && failedCount === 0 && 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
          )}>
            {allPassed && (
              <p className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                All systems ready for launch!
              </p>
            )}
            {failedCount > 0 && (
              <p className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                {failedCount} required check(s) failed. Consider downgrading to Mode {fallbackMode}.
              </p>
            )}
            {warningCount > 0 && failedCount === 0 && (
              <p className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Ready with {warningCount} warning(s). Review before launching.
              </p>
            )}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {failedCount > 0 && onDowngrade && (
            <Button
              variant="outline"
              onClick={onDowngrade}
              className="w-full sm:w-auto"
            >
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Downgrade to Mode {fallbackMode}
            </Button>
          )}
          {failedCount > 0 && onRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
              disabled={isChecking}
            >
              Retry Checks
            </Button>
          )}
          <Button
            onClick={onLaunch}
            disabled={!canLaunch}
            className="w-full sm:w-auto"
          >
            {isChecking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                Launch Mission
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default VitalPreFlightCheck;
