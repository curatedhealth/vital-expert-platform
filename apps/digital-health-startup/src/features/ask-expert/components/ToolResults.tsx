/**
 * Tool Results Display Component
 * 
 * Displays formatted results from tool execution.
 * Each tool type has a specific display format.
 * 
 * Supported Tools:
 * - Web Search: Links with snippets
 * - PubMed: Article cards
 * - FDA Database: Data table
 * - Calculator: Formatted result
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Globe,
  BookOpen,
  Shield,
  Calculator,
  FileText,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tool result from backend
export interface ToolResult {
  tool_name: string;
  display_name: string;
  status: 'success' | 'error' | 'timeout';
  result?: {
    type: string;
    [key: string]: any;
  };
  error?: string;
  duration_seconds: number;
  cost: number;
}

export interface ToolResultsProps {
  /** Tool execution results */
  results: ToolResult[];
  
  /** Show cost information */
  showCost?: boolean;
  
  /** Initially expanded */
  defaultExpanded?: boolean;
  
  /** Additional className */
  className?: string;
}

export function ToolResults({
  results,
  showCost = true,
  defaultExpanded = false,
  className,
}: ToolResultsProps) {
  const [expandedResults, setExpandedResults] = React.useState<Set<number>>(
    new Set(defaultExpanded ? results.map((_, i) => i) : [])
  );
  
  const toggleExpanded = (index: number) => {
    setExpandedResults(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };
  
  // Calculate totals
  const totalCost = results.reduce((sum, r) => sum + (r.cost || 0), 0);
  const successfulResults = results.filter(r => r.status === 'success');
  
  if (results.length === 0) return null;
  
  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Tool Results</h4>
          </div>
          
          <div className="flex items-center gap-2">
            {showCost && totalCost > 0 && (
              <Badge variant="outline" className="text-xs">
                ${totalCost.toFixed(3)}
              </Badge>
            )}
            
            <Badge variant="secondary" className="text-xs">
              {successfulResults.length} / {results.length} successful
            </Badge>
          </div>
        </div>
        
        {/* Results */}
        <div className="space-y-3">
          {results.map((result, index) => (
            <ToolResultItem
              key={index}
              result={result}
              expanded={expandedResults.has(index)}
              onToggle={() => toggleExpanded(index)}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

// Individual tool result item
interface ToolResultItemProps {
  result: ToolResult;
  expanded: boolean;
  onToggle: () => void;
}

function ToolResultItem({ result, expanded, onToggle }: ToolResultItemProps) {
  // Get tool icon
  const getToolIcon = () => {
    switch (result.tool_name) {
      case 'web_search':
        return <Globe className="h-4 w-4" />;
      case 'pubmed_search':
        return <BookOpen className="h-4 w-4" />;
      case 'fda_database':
        return <Shield className="h-4 w-4" />;
      case 'calculator':
        return <Calculator className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  // Render result based on type
  const renderResult = () => {
    if (result.status !== 'success' || !result.result) {
      return (
        <div className="text-sm text-red-600 dark:text-red-400">
          {result.error || 'Execution failed'}
        </div>
      );
    }
    
    switch (result.result.type) {
      case 'web_search':
        return <WebSearchResults data={result.result} />;
      case 'pubmed_search':
        return <PubMedResults data={result.result} />;
      case 'fda_database':
        return <FDAResults data={result.result} />;
      case 'calculation':
        return <CalculatorResults data={result.result} />;
      default:
        return <GenericResults data={result.result} />;
    }
  };
  
  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <div className="border rounded-lg">
        {/* Header */}
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded bg-primary/10">
                {getToolIcon()}
              </div>
              
              <div className="text-left">
                <h5 className="font-medium text-sm">{result.display_name}</h5>
                {result.result?.summary && (
                  <p className="text-xs text-muted-foreground">
                    {result.result.summary}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {result.duration_seconds.toFixed(1)}s
              </span>
              
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        
        {/* Content */}
        <CollapsibleContent>
          <div className="p-3 pt-0 border-t">
            {renderResult()}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// Web Search Results
function WebSearchResults({ data }: { data: any }) {
  const results = data.results || [];
  
  return (
    <div className="space-y-2">
      {results.map((item: any, index: number) => (
        <a
          key={index}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
        >
          <div className="flex items-start gap-2">
            <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0 group-hover:text-primary transition-colors" />
            
            <div className="flex-1 min-w-0">
              <h6 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                {item.title}
              </h6>
              
              {item.domain && (
                <p className="text-xs text-muted-foreground mb-1">
                  {item.domain}
                </p>
              )}
              
              {item.snippet && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.snippet}
                </p>
              )}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

// PubMed Results
function PubMedResults({ data }: { data: any }) {
  const articles = data.articles || [];
  
  return (
    <div className="space-y-3">
      {articles.map((article: any, index: number) => (
        <Card key={index} className="p-3">
          <div className="space-y-2">
            {/* Title */}
            <h6 className="font-medium text-sm">{article.title}</h6>
            
            {/* Metadata */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              {article.authors && article.authors.length > 0 && (
                <span>{article.authors.slice(0, 3).join(', ')}</span>
              )}
              
              {article.journal && (
                <span>• {article.journal}</span>
              )}
              
              {article.year && (
                <span>• {article.year}</span>
              )}
              
              {article.pmid && (
                <Badge variant="outline" className="text-xs">
                  PMID: {article.pmid}
                </Badge>
              )}
            </div>
            
            {/* Abstract */}
            {article.abstract && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {article.abstract}
              </p>
            )}
            
            {/* Link */}
            {article.url && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                asChild
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on PubMed
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

// FDA Results
function FDAResults({ data }: { data: any }) {
  const records = data.records || [];
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2 font-medium">Device/Drug</th>
            <th className="text-left p-2 font-medium">Applicant</th>
            <th className="text-left p-2 font-medium">Decision</th>
            <th className="text-left p-2 font-medium">Date</th>
            <th className="text-left p-2 font-medium">K Number</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record: any, index: number) => (
            <tr key={index} className="border-b last:border-0">
              <td className="p-2">{record.device_name}</td>
              <td className="p-2 text-muted-foreground">{record.applicant}</td>
              <td className="p-2">
                <Badge variant="outline" className="text-xs">
                  {record.decision}
                </Badge>
              </td>
              <td className="p-2 text-muted-foreground text-xs">
                {record.decision_date}
              </td>
              <td className="p-2 text-xs font-mono">{record.k_number}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Calculator Results
function CalculatorResults({ data }: { data: any }) {
  return (
    <Card className="p-4 bg-primary/5">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          {data.expression}
        </div>
        
        <div className="text-2xl font-bold">
          = {data.result}
        </div>
      </div>
    </Card>
  );
}

// Generic Results (fallback)
function GenericResults({ data }: { data: any }) {
  return (
    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

