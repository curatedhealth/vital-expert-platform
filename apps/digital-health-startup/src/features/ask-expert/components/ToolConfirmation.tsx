/**
 * Tool Confirmation Modal
 * 
 * Shows when expensive/slow tools need user approval before execution.
 * 
 * Features:
 * - Clean, modern UI
 * - Tool details (name, description, cost, duration)
 * - Approve/Decline actions
 * - Multiple tools support
 * - Reasoning display
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  AlertCircle,
  Clock,
  DollarSign,
  Info,
  Zap,
  Globe,
  BookOpen,
  Shield,
  Calculator,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

// Tool icon mapping
const TOOL_ICONS: Record<string, React.ElementType> = {
  web_search: Globe,
  pubmed_search: BookOpen,
  fda_database: Shield,
  calculator: Calculator,
};

// Tool suggestion from backend
export interface ToolSuggestion {
  tool_name: string;
  display_name?: string;
  description?: string;
  confidence: number;
  reasoning: string;
  parameters: Record<string, any>;
  cost_tier?: 'free' | 'low' | 'medium' | 'high';
  estimated_cost?: number;
  estimated_duration?: number;
}

export interface ToolConfirmationProps {
  /** Whether modal is open */
  open: boolean;
  
  /** Tools requiring confirmation */
  tools: ToolSuggestion[];
  
  /** Message explaining why tools are needed */
  message?: string;
  
  /** Overall reasoning for tool usage */
  reasoning?: string;
  
  /** Callback when user approves */
  onApprove: () => void;
  
  /** Callback when user declines */
  onDecline: () => void;
  
  /** Loading state during confirmation */
  loading?: boolean;
}

export function ToolConfirmation({
  open,
  tools,
  message,
  reasoning,
  onApprove,
  onDecline,
  loading = false,
}: ToolConfirmationProps) {
  // Calculate totals
  const totalCost = tools.reduce(
    (sum, tool) => sum + (tool.estimated_cost || 0),
    0
  );
  
  const maxDuration = Math.max(
    ...tools.map(t => t.estimated_duration || 0)
  );
  
  // Get cost tier color
  const getCostTierColor = (tier?: string) => {
    switch (tier) {
      case 'free':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDecline()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <DialogTitle>Tool Confirmation Required</DialogTitle>
          </div>
          <DialogDescription>
            {message || 'The following tools require your approval before execution.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Overall Reasoning */}
          {reasoning && (
            <Card className="p-3 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <span className="font-medium">Why these tools: </span>
                  {reasoning}
                </div>
              </div>
            </Card>
          )}
          
          {/* Tools List */}
          <div className="space-y-3">
            {tools.map((tool, index) => {
              const Icon = TOOL_ICONS[tool.tool_name] || Zap;
              
              return (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Tool Icon */}
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    
                    {/* Tool Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">
                          {tool.display_name || tool.tool_name}
                        </h4>
                        
                        {/* Cost Badge */}
                        <Badge
                          variant="outline"
                          className={getCostTierColor(tool.cost_tier)}
                        >
                          {tool.cost_tier === 'free'
                            ? 'Free'
                            : `$${tool.estimated_cost?.toFixed(3) || '0.000'}`}
                        </Badge>
                        
                        {/* Confidence Badge */}
                        {tool.confidence >= 0.8 && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            High confidence
                          </Badge>
                        )}
                      </div>
                      
                      {/* Description */}
                      {tool.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {tool.description}
                        </p>
                      )}
                      
                      {/* Reasoning */}
                      <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 mb-2">
                        💡 {tool.reasoning}
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {tool.estimated_duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>~{tool.estimated_duration}s</span>
                          </div>
                        )}
                        
                        {/* Show parameters count */}
                        {tool.parameters && Object.keys(tool.parameters).length > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs">
                              {Object.keys(tool.parameters).length} parameter
                              {Object.keys(tool.parameters).length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          
          {/* Summary */}
          <Card className="p-3 bg-muted/50">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                {/* Total Cost */}
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {totalCost === 0 ? 'Free' : `$${totalCost.toFixed(3)}`}
                  </span>
                  <span className="text-muted-foreground">total</span>
                </div>
                
                {/* Max Duration */}
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">~{maxDuration}s</span>
                  <span className="text-muted-foreground">estimated</span>
                </div>
              </div>
              
              {/* Tool Count */}
              <Badge variant="secondary">
                {tools.length} tool{tools.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </Card>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onDecline}
            disabled={loading}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Decline
          </Button>
          <Button
            type="button"
            onClick={onApprove}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve & Execute
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook for managing tool confirmation state
export function useToolConfirmation() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tools, setTools] = React.useState<ToolSuggestion[]>([]);
  const [message, setMessage] = React.useState<string>();
  const [reasoning, setReasoning] = React.useState<string>();
  const [onApproveCallback, setOnApproveCallback] = React.useState<(() => void) | null>(null);
  const [onDeclineCallback, setOnDeclineCallback] = React.useState<(() => void) | null>(null);
  
  const showConfirmation = React.useCallback(
    (
      toolsToConfirm: ToolSuggestion[],
      options?: {
        message?: string;
        reasoning?: string;
        onApprove?: () => void;
        onDecline?: () => void;
      }
    ) => {
      setTools(toolsToConfirm);
      setMessage(options?.message);
      setReasoning(options?.reasoning);
      setOnApproveCallback(() => options?.onApprove || (() => {}));
      setOnDeclineCallback(() => options?.onDecline || (() => {}));
      setIsOpen(true);
    },
    []
  );
  
  const hideConfirmation = React.useCallback(() => {
    setIsOpen(false);
  }, []);
  
  const handleApprove = React.useCallback(() => {
    onApproveCallback?.();
    hideConfirmation();
  }, [onApproveCallback, hideConfirmation]);
  
  const handleDecline = React.useCallback(() => {
    onDeclineCallback?.();
    hideConfirmation();
  }, [onDeclineCallback, hideConfirmation]);
  
  return {
    isOpen,
    tools,
    message,
    reasoning,
    showConfirmation,
    hideConfirmation,
    handleApprove,
    handleDecline,
  };
}

