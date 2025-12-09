'use client';

import { cn } from '@/lib/utils';
import { 
  Database, 
  Network, 
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface RankedItem {
  id: string;
  name: string;
  vectorRank?: number;
  graphRank?: number;
  relationalRank?: number;
  vectorScore?: number;
  graphScore?: number;
  relationalScore?: number;
  rrfScore: number;
  finalRank: number;
}

interface VitalRRFVisualizationProps {
  items: RankedItem[];
  k?: number;
  weights?: { vector: number; graph: number; relational: number };
  showFormula?: boolean;
  maxItems?: number;
  className?: string;
}

/**
 * VitalRRFVisualization - Reciprocal Rank Fusion visualization
 * 
 * Shows how RRF combines multiple ranking sources to produce
 * final rankings with score breakdowns.
 */
export function VitalRRFVisualization({
  items,
  k = 60,
  weights = { vector: 0.4, graph: 0.35, relational: 0.25 },
  showFormula = true,
  maxItems = 5,
  className
}: VitalRRFVisualizationProps) {
  const sortedItems = [...items].sort((a, b) => a.finalRank - b.finalRank);
  const displayItems = sortedItems.slice(0, maxItems);
  
  const maxScore = Math.max(...items.map(i => i.rrfScore));
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          Reciprocal Rank Fusion
        </h4>
        <Badge variant="outline">k={k}</Badge>
      </div>
      
      {/* Formula */}
      {showFormula && (
        <div className="bg-muted/50 rounded-lg p-3 text-sm font-mono text-center">
          RRF(d) = Σ (w<sub>s</sub> × 1 / (k + rank<sub>s</sub>(d)))
        </div>
      )}
      
      {/* Source weights */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center gap-2 p-2 rounded bg-blue-50 dark:bg-blue-950">
          <Database className="h-4 w-4 text-blue-600" />
          <div className="text-xs">
            <div className="font-medium">Vector</div>
            <div className="text-muted-foreground">{(weights.vector * 100).toFixed(0)}%</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-950">
          <Network className="h-4 w-4 text-green-600" />
          <div className="text-xs">
            <div className="font-medium">Graph</div>
            <div className="text-muted-foreground">{(weights.graph * 100).toFixed(0)}%</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded bg-orange-50 dark:bg-orange-950">
          <Clock className="h-4 w-4 text-orange-600" />
          <div className="text-xs">
            <div className="font-medium">Historical</div>
            <div className="text-muted-foreground">{(weights.relational * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>
      
      {/* Ranked items */}
      <div className="space-y-2">
        {displayItems.map((item) => (
          <div 
            key={item.id}
            className="border rounded-lg p-3 space-y-2"
          >
            {/* Item header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "w-6 h-6 p-0 justify-center font-bold",
                    item.finalRank === 1 && "bg-yellow-100 border-yellow-500 text-yellow-700"
                  )}
                >
                  {item.finalRank}
                </Badge>
                <span className="font-medium">{item.name}</span>
              </div>
              <span className="text-sm font-mono">
                {item.rrfScore.toFixed(4)}
              </span>
            </div>
            
            {/* Score breakdown */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Vector</span>
                  <span>#{item.vectorRank || '-'}</span>
                </div>
                <Progress 
                  value={item.vectorScore ? item.vectorScore * 100 : 0} 
                  className="h-1 [&>div]:bg-blue-500"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Graph</span>
                  <span>#{item.graphRank || '-'}</span>
                </div>
                <Progress 
                  value={item.graphScore ? item.graphScore * 100 : 0} 
                  className="h-1 [&>div]:bg-green-500"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Historical</span>
                  <span>#{item.relationalRank || '-'}</span>
                </div>
                <Progress 
                  value={item.relationalScore ? item.relationalScore * 100 : 0} 
                  className="h-1 [&>div]:bg-orange-500"
                />
              </div>
            </div>
            
            {/* RRF score bar */}
            <div className="pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">RRF Score</span>
                <Progress 
                  value={(item.rrfScore / maxScore) * 100} 
                  className="h-2 flex-1 [&>div]:bg-purple-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {items.length > maxItems && (
        <div className="text-center text-sm text-muted-foreground">
          +{items.length - maxItems} more items
        </div>
      )}
    </div>
  );
}

export default VitalRRFVisualization;
