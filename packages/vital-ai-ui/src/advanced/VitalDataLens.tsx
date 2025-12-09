'use client';

import { useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import {
  Eye,
  Database,
  Link2,
  Calculator,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface DataSource {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file' | 'calculation';
  table?: string;
  query?: string;
  url?: string;
  timestamp?: Date;
  confidence?: number;
}

export interface DataLineage {
  value: unknown;
  formattedValue: string;
  sources: DataSource[];
  calculation?: {
    formula: string;
    inputs: { name: string; value: unknown }[];
    steps?: string[];
  };
  transformations?: string[];
  warnings?: string[];
}

export interface VitalDataLensProps {
  /** Data with lineage information */
  data: DataLineage;
  /** Display format */
  displayFormat?: 'inline' | 'popover' | 'panel';
  /** Whether to show raw value */
  showRawValue?: boolean;
  /** Whether to show calculation details */
  showCalculation?: boolean;
  /** Whether to show all sources */
  showAllSources?: boolean;
  /** Callback when source clicked */
  onSourceClick?: (source: DataSource) => void;
  /** Callback to verify source */
  onVerify?: (source: DataSource) => void;
  /** Custom class name */
  className?: string;
  /** Children (the data point to wrap) */
  children?: React.ReactNode;
}

/**
 * VitalDataLens - Trust X-Ray for Data Points
 * 
 * X-Ray vision for charts/tables. Hovering a data point reveals a popover
 * with the raw lineage and calculation logic (from GraphRAG).
 * 
 * @example
 * ```tsx
 * <VitalDataLens
 *   data={{
 *     value: 42.5,
 *     formattedValue: "42.5%",
 *     sources: [{ id: '1', name: 'FDA Database', type: 'database' }],
 *     calculation: {
 *       formula: "(total_responses / sample_size) * 100",
 *       inputs: [
 *         { name: 'total_responses', value: 425 },
 *         { name: 'sample_size', value: 1000 }
 *       ]
 *     }
 *   }}
 * >
 *   <span className="font-bold">42.5%</span>
 * </VitalDataLens>
 * ```
 */
export function VitalDataLens({
  data,
  displayFormat = 'popover',
  showRawValue = true,
  showCalculation = true,
  showAllSources = true,
  onSourceClick,
  onVerify,
  className,
  children,
}: VitalDataLensProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const getSourceIcon = (type: DataSource['type']) => {
    switch (type) {
      case 'database':
        return <Database className="h-3.5 w-3.5" />;
      case 'api':
        return <Link2 className="h-3.5 w-3.5" />;
      case 'calculation':
        return <Calculator className="h-3.5 w-3.5" />;
      default:
        return <Database className="h-3.5 w-3.5" />;
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-muted-foreground';
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const LensContent = (
    <div className="space-y-4 p-1">
      {/* Value Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Value</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => handleCopy(String(data.value))}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{data.formattedValue}</span>
          {showRawValue && data.formattedValue !== String(data.value) && (
            <span className="text-xs text-muted-foreground">
              (raw: {String(data.value)})
            </span>
          )}
        </div>
      </div>

      {/* Warnings */}
      {data.warnings && data.warnings.length > 0 && (
        <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          {data.warnings.map((warning, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span className="text-amber-700 dark:text-amber-300">{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Calculation */}
      {showCalculation && data.calculation && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Calculator className="h-3.5 w-3.5" />
            Calculation
          </span>
          <div className="p-2 rounded bg-muted/50 font-mono text-xs">
            <p className="text-primary font-medium">{data.calculation.formula}</p>
            
            {/* Inputs */}
            {data.calculation.inputs.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <p className="text-muted-foreground mb-1">Inputs:</p>
                <Table>
                  <TableBody>
                    {data.calculation.inputs.map((input, idx) => (
                      <TableRow key={idx} className="border-0">
                        <TableCell className="py-1 pl-0 pr-2 text-muted-foreground">
                          {input.name}
                        </TableCell>
                        <TableCell className="py-1 px-0 text-right">
                          {String(input.value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Steps */}
            {data.calculation.steps && data.calculation.steps.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <p className="text-muted-foreground mb-1">Steps:</p>
                <ol className="list-decimal list-inside space-y-0.5">
                  {data.calculation.steps.map((step, idx) => (
                    <li key={idx} className="text-muted-foreground">{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transformations */}
      {data.transformations && data.transformations.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">
            Transformations Applied
          </span>
          <div className="flex flex-wrap gap-1">
            {data.transformations.map((transform, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {transform}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      {showAllSources && data.sources.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Database className="h-3.5 w-3.5" />
            Data Sources ({data.sources.length})
          </span>
          <div className="space-y-1">
            {data.sources.map((source) => (
              <div
                key={source.id}
                className={cn(
                  'flex items-center gap-2 p-2 rounded',
                  'bg-muted/30 hover:bg-muted/50 transition-colors',
                  onSourceClick && 'cursor-pointer'
                )}
                onClick={() => onSourceClick?.(source)}
              >
                <div className="p-1 rounded bg-background">
                  {getSourceIcon(source.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{source.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{source.type}</span>
                    {source.table && (
                      <>
                        <span>•</span>
                        <span>{source.table}</span>
                      </>
                    )}
                    {source.confidence && (
                      <>
                        <span>•</span>
                        <span className={getConfidenceColor(source.confidence)}>
                          {source.confidence}% confidence
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {source.url && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(source.url, '_blank');
                    }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verify Button */}
      {onVerify && data.sources.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onVerify(data.sources[0])}
        >
          <Eye className="h-4 w-4 mr-2" />
          Verify Sources
        </Button>
      )}
    </div>
  );

  // Inline display
  if (displayFormat === 'inline') {
    return (
      <div className={cn('inline-flex items-center gap-1', className)}>
        {children || <span>{data.formattedValue}</span>}
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 p-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Eye className="h-3 w-3 text-muted-foreground" />
        </Button>
        {isOpen && (
          <div className="absolute z-50 mt-1 w-80 p-3 rounded-lg border bg-popover shadow-lg">
            {LensContent}
          </div>
        )}
      </div>
    );
  }

  // Panel display
  if (displayFormat === 'panel') {
    return (
      <div className={cn('rounded-lg border bg-card', className)}>
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <h3 className="font-medium text-sm">Data Lineage</h3>
          </div>
          {data.sources[0]?.confidence && (
            <Badge
              variant="outline"
              className={cn('text-xs', getConfidenceColor(data.sources[0].confidence))}
            >
              {data.sources[0].confidence}% confidence
            </Badge>
          )}
        </div>
        <ScrollArea className="max-h-[400px] p-3">
          {LensContent}
        </ScrollArea>
      </div>
    );
  }

  // Popover display (default)
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span
          className={cn(
            'inline-flex items-center gap-1 cursor-pointer',
            'hover:bg-muted/50 rounded px-1 -mx-1 transition-colors',
            className
          )}
        >
          {children || <span>{data.formattedValue}</span>}
          <Eye className="h-3 w-3 text-muted-foreground opacity-50 hover:opacity-100" />
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        {LensContent}
      </PopoverContent>
    </Popover>
  );
}

export default VitalDataLens;
