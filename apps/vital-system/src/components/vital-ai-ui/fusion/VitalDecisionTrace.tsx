'use client';

import { cn } from '@/lib/utils';
import { 
  ChevronRight, 
  Info, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Users,
  GitBranch,
  Wrench,
  HandMetal,
  MessageSquare
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { formatDistanceToNow } from 'date-fns';

type DecisionType = 'selection' | 'delegation' | 'tool_call' | 'checkpoint' | 'output';

interface DecisionNode {
  id: string;
  timestamp: Date;
  type: DecisionType;
  agent: {
    id: string;
    name: string;
    level: string;
  };
  decision: string;
  evidence?: string;
  outcome?: 'success' | 'failure' | 'pending';
  duration?: number;
  children?: DecisionNode[];
}

interface VitalDecisionTraceProps {
  decisions: DecisionNode[];
  title?: string;
  className?: string;
}

const typeIcons: Record<DecisionType, React.ComponentType<{ className?: string }>> = {
  selection: Users,
  delegation: GitBranch,
  tool_call: Wrench,
  checkpoint: HandMetal,
  output: MessageSquare,
};

const typeColors: Record<DecisionType, string> = {
  selection: 'border-l-purple-500',
  delegation: 'border-l-blue-500',
  tool_call: 'border-l-green-500',
  checkpoint: 'border-l-orange-500',
  output: 'border-l-cyan-500',
};

const typeLabels: Record<DecisionType, string> = {
  selection: 'Team Selection',
  delegation: 'Delegation',
  tool_call: 'Tool Call',
  checkpoint: 'Checkpoint',
  output: 'Output',
};

/**
 * VitalDecisionTrace - Full audit trail of all decisions
 * 
 * Displays hierarchical decision tree with color-coded types,
 * outcome indicators, evidence display, and nested children.
 */
export function VitalDecisionTrace({
  decisions,
  title = "Decision Trace",
  className
}: VitalDecisionTraceProps) {
  const totalDuration = decisions.reduce((acc, d) => acc + (d.duration || 0), 0);
  const successCount = decisions.filter(d => d.outcome === 'success').length;
  
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          {title}
        </h4>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{decisions.length} decisions</span>
          <span>{successCount} succeeded</span>
          {totalDuration > 0 && <span>{totalDuration}ms total</span>}
        </div>
      </div>
      
      <Accordion type="multiple" className="space-y-1">
        {decisions.map((decision) => (
          <DecisionNodeItem key={decision.id} node={decision} depth={0} />
        ))}
      </Accordion>
      
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
        <span className="text-xs text-muted-foreground">Legend:</span>
        {Object.entries(typeLabels).map(([type, label]) => {
          const Icon = typeIcons[type as DecisionType];
          return (
            <div key={type} className="flex items-center gap-1 text-xs">
              <div className={cn(
                "w-2 h-2 rounded-full",
                type === 'selection' && "bg-purple-500",
                type === 'delegation' && "bg-blue-500",
                type === 'tool_call' && "bg-green-500",
                type === 'checkpoint' && "bg-orange-500",
                type === 'output' && "bg-cyan-500",
              )} />
              <span className="text-muted-foreground">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * DecisionNodeItem - Individual decision node with nested children
 */
function DecisionNodeItem({ 
  node, 
  depth 
}: { 
  node: DecisionNode; 
  depth: number;
}) {
  const outcomeIcons = {
    success: <CheckCircle className="h-4 w-4 text-green-500" />,
    failure: <AlertCircle className="h-4 w-4 text-red-500" />,
    pending: <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />,
  };
  
  const Icon = typeIcons[node.type];
  const levelColors: Record<string, string> = {
    L1: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    L2: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    L3: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    L4: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    L5: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };
  
  const hasChildren = node.children && node.children.length > 0;
  
  return (
    <AccordionItem 
      value={node.id}
      className={cn(
        "border rounded-lg overflow-hidden",
        typeColors[node.type],
        "border-l-4"
      )}
      style={{ marginLeft: depth * 20 }}
    >
      <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline hover:bg-muted/50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Outcome icon */}
          {node.outcome && outcomeIcons[node.outcome]}
          
          {/* Type icon */}
          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
          
          {/* Decision text */}
          <span className="font-medium truncate">{node.decision}</span>
          
          {/* Agent badge */}
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ml-auto mr-2",
            levelColors[node.agent.level] || 'bg-secondary'
          )}>
            {node.agent.level} · {node.agent.name}
          </span>
          
          {/* Duration */}
          {node.duration && (
            <span className="text-xs text-muted-foreground shrink-0">
              {node.duration}ms
            </span>
          )}
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="px-3 pb-3 pt-0">
        {/* Timestamp */}
        <div className="text-xs text-muted-foreground mb-2">
          {formatDistanceToNow(node.timestamp, { addSuffix: true })}
        </div>
        
        {/* Evidence */}
        {node.evidence && (
          <div className="text-sm text-muted-foreground bg-muted rounded p-2 mb-3">
            <span className="font-medium text-foreground">Evidence: </span>
            {node.evidence}
          </div>
        )}
        
        {/* Nested children */}
        {hasChildren && (
          <div className="space-y-1 mt-3 pt-3 border-t">
            <div className="text-xs text-muted-foreground mb-2">
              Child decisions ({node.children!.length})
            </div>
            {node.children!.map((child) => (
              <DecisionNodeItem 
                key={child.id} 
                node={child} 
                depth={depth + 1} 
              />
            ))}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

/**
 * DecisionSummary - Compact summary of decision trace
 */
export function DecisionTraceSummary({ 
  decisions,
  className 
}: { 
  decisions: DecisionNode[];
  className?: string;
}) {
  const byType = decisions.reduce((acc, d) => {
    acc[d.type] = (acc[d.type] || 0) + 1;
    return acc;
  }, {} as Record<DecisionType, number>);
  
  const successRate = decisions.length > 0
    ? (decisions.filter(d => d.outcome === 'success').length / decisions.length) * 100
    : 0;
  
  return (
    <div className={cn(
      "flex items-center gap-4 p-3 bg-muted/50 rounded-lg text-sm",
      className
    )}>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Decisions:</span>
        <span className="font-medium">{decisions.length}</span>
      </div>
      
      <div className="h-4 w-px bg-border" />
      
      {Object.entries(byType).map(([type, count]) => {
        const Icon = typeIcons[type as DecisionType];
        return (
          <div key={type} className="flex items-center gap-1">
            <Icon className="h-3 w-3 text-muted-foreground" />
            <span>{count}</span>
          </div>
        );
      })}
      
      <div className="h-4 w-px bg-border" />
      
      <div className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3 text-green-500" />
        <span>{successRate.toFixed(0)}%</span>
      </div>
    </div>
  );
}

export default VitalDecisionTrace;
