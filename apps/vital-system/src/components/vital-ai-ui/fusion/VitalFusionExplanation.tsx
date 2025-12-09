'use client';

import { cn } from '@/lib/utils';
import { Database, Network, Clock, Zap, Brain, ChevronDown } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { useState } from 'react';

interface VectorScore {
  agentId: string;
  name: string;
  score: number;
}

interface GraphPath {
  path: string;
  relevance: number;
}

interface RelationalPattern {
  pattern: string;
  frequency: number;
  success: number;
}

interface FusionEvidence {
  vectorScores: VectorScore[];
  graphPaths: GraphPath[];
  relationalPatterns: RelationalPattern[];
  weights: { vector: number; graph: number; relational: number };
  retrievalTimeMs: number;
}

interface SelectedExpert {
  id: string;
  name: string;
  role: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  confidence: 'high' | 'medium' | 'low';
  evidence: {
    vector: number;
    graph: number;
    relational: number;
  };
}

interface VitalFusionExplanationProps {
  evidence: FusionEvidence;
  selectedExperts: SelectedExpert[];
  reasoning: string;
  isExpanded?: boolean;
  className?: string;
}

/**
 * VitalFusionExplanation - Fusion Intelligence explanation component
 * 
 * THE KEY DIFFERENTIATOR: Shows WHY teams were selected using
 * triple-source evidence (Vector + Graph + Relational).
 */
export function VitalFusionExplanation({
  evidence,
  selectedExperts,
  reasoning,
  isExpanded: initialExpanded = false,
  className
}: VitalFusionExplanationProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  
  return (
    <Card className={cn(
      "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/50",
      className
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
            <div className="p-1.5 rounded bg-purple-100 dark:bg-purple-900">
              <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">Fusion Intelligence</CardTitle>
              <CardDescription className="text-xs">
                Team selection backed by triple-source evidence
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{evidence.retrievalTimeMs.toFixed(0)}ms</span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-180"
              )} />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* Evidence Sources Grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Vector Evidence */}
              <EvidenceSource
                icon={Database}
                title="Vector"
                description="Semantic similarity"
                weight={evidence.weights.vector}
                color="blue"
              >
                <div className="space-y-1.5">
                  {evidence.vectorScores.slice(0, 3).map((score, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="truncate pr-2">{score.name}</span>
                      <span className="font-mono shrink-0">
                        {(score.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </EvidenceSource>
              
              {/* Graph Evidence */}
              <EvidenceSource
                icon={Network}
                title="Graph"
                description="Relationship paths"
                weight={evidence.weights.graph}
                color="green"
              >
                <div className="space-y-1.5">
                  {evidence.graphPaths.slice(0, 3).map((path, i) => (
                    <div key={i} className="text-xs truncate" title={path.path}>
                      {path.path}
                    </div>
                  ))}
                </div>
              </EvidenceSource>
              
              {/* Relational Evidence */}
              <EvidenceSource
                icon={Clock}
                title="Historical"
                description="Past patterns"
                weight={evidence.weights.relational}
                color="orange"
              >
                <div className="space-y-1.5">
                  {evidence.relationalPatterns.slice(0, 2).map((p, i) => (
                    <div key={i} className="text-xs">
                      <span className="truncate">{p.pattern}</span>
                      <span className="text-green-600 dark:text-green-400 ml-1">
                        {p.success}%
                      </span>
                    </div>
                  ))}
                </div>
              </EvidenceSource>
            </div>
            
            {/* Selected Team */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <span>Selected Team</span>
                <span className="text-xs text-muted-foreground">
                  ({selectedExperts.length} experts)
                </span>
              </h4>
              <div className="space-y-2">
                {selectedExperts.map((expert) => (
                  <ExpertCard key={expert.id} expert={expert} />
                ))}
              </div>
            </div>
            
            {/* L1 Master Reasoning */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                L1 Master Reasoning
              </h4>
              <p className="text-sm text-muted-foreground bg-white dark:bg-slate-900 rounded-lg p-3 border">
                {reasoning}
              </p>
            </div>
            
            {/* Performance Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <span>Retrieval: {evidence.retrievalTimeMs.toFixed(0)}ms</span>
              <span>RRF k=60</span>
              <span>
                Weights: V{(evidence.weights.vector * 100).toFixed(0)}% 
                / G{(evidence.weights.graph * 100).toFixed(0)}% 
                / R{(evidence.weights.relational * 100).toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

/**
 * EvidenceSource - Individual evidence source display
 */
function EvidenceSource({
  icon: Icon,
  title,
  description,
  weight,
  color,
  children
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  weight: number;
  color: 'blue' | 'green' | 'orange';
  children: React.ReactNode;
}) {
  const colorClasses = {
    blue: {
      iconBg: 'bg-blue-100 dark:bg-blue-900',
      iconText: 'text-blue-600 dark:text-blue-400',
      progress: 'bg-blue-500',
    },
    green: {
      iconBg: 'bg-green-100 dark:bg-green-900',
      iconText: 'text-green-600 dark:text-green-400',
      progress: 'bg-green-500',
    },
    orange: {
      iconBg: 'bg-orange-100 dark:bg-orange-900',
      iconText: 'text-orange-600 dark:text-orange-400',
      progress: 'bg-orange-500',
    },
  };
  
  const colors = colorClasses[color];
  
  return (
    <div className="border rounded-lg p-3 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("p-1.5 rounded", colors.iconBg)}>
          <Icon className={cn("h-3 w-3", colors.iconText)} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{title}</div>
          <div className="text-xs text-muted-foreground truncate">{description}</div>
        </div>
      </div>
      
      <div className="mb-2">
        <Progress 
          value={weight * 100} 
          className="h-1.5"
        />
        <div className="text-xs text-muted-foreground mt-1">
          Weight: {(weight * 100).toFixed(0)}%
        </div>
      </div>
      
      <div className="pt-2 border-t">
        {children}
      </div>
    </div>
  );
}

/**
 * ExpertCard - Individual expert selection display
 */
function ExpertCard({ expert }: { expert: SelectedExpert }) {
  const confidenceColors = {
    high: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    low: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };
  
  const levelColors: Record<string, string> = {
    L1: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    L2: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    L3: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    L4: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  };
  
  return (
    <div className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-900 rounded-lg border">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{expert.name}</span>
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded font-medium shrink-0",
            levelColors[expert.level]
          )}>
            {expert.level}
          </span>
        </div>
        <div className="text-xs text-muted-foreground truncate">{expert.role}</div>
      </div>
      
      <div className={cn(
        "px-2 py-0.5 rounded text-xs font-medium shrink-0",
        confidenceColors[expert.confidence]
      )}>
        {expert.confidence}
      </div>
      
      <div className="text-xs text-right space-y-0.5 shrink-0 w-16">
        <div className="flex justify-between">
          <span className="text-muted-foreground">V:</span>
          <span>{(expert.evidence.vector * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">G:</span>
          <span>{(expert.evidence.graph * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">R:</span>
          <span>{(expert.evidence.relational * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

export default VitalFusionExplanation;
