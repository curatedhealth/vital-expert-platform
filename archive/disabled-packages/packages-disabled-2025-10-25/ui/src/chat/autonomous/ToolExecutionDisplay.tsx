'use client';

import { Wrench, ChevronDown, ChevronRight, Clock, CheckCircle2, Database, Search, FileText } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import type { ToolExecution } from '@/types/autonomous-agent.types';

interface ToolExecutionDisplayProps {
  executions: ToolExecution[];
  showDetails?: boolean;
  className?: string;
}

const toolIcons: Record<string, any> = {
  fda_database_search: Database,
  fda_guidance_lookup: FileText,
  clinical_trials_search: Search,
  tavily_search: Search,
  pubmed_literature_search: Search,
  arxiv_research_search: Search,
  default: Wrench,
};

const toolLabels: Record<string, string> = {
  fda_database_search: 'FDA Database',
  fda_guidance_lookup: 'FDA Guidance',
  regulatory_calculator: 'Regulatory Calculator',
  clinical_trials_search: 'ClinicalTrials.gov',
  study_design_helper: 'Study Design',
  endpoint_selector: 'Endpoint Selection',
  tavily_search: 'Web Search',
  wikipedia_lookup: 'Wikipedia',
  arxiv_research_search: 'arXiv Research',
  pubmed_literature_search: 'PubMed',
  eu_devices_search: 'EU Devices',
};

export function ToolExecutionDisplay({
  executions,
  showDetails = false,
  className,
}: ToolExecutionDisplayProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  if (executions.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          <CardTitle className="text-sm">Tool Executions</CardTitle>
          <Badge variant="secondary" className="ml-auto">
            {executions.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-96">
          <div className="space-y-2">
            {executions.map((execution, index) => {
              const Icon = toolIcons[execution.tool] || toolIcons.default;
              const label = toolLabels[execution.tool] || execution.tool;
              const isOpen = openItems.has(index);

              return (
                <Collapsible
                  key={index}
                  open={isOpen}
                  onOpenChange={() => toggleItem(index)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{label}</span>
                          {execution.success && (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(execution.timestamp).toLocaleTimeString()}</span>
                          {execution.duration && (
                            <>
                              <span>•</span>
                              <span>{execution.duration}ms</span>
                            </>
                          )}
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="mt-2 p-3 rounded-lg bg-muted/50 space-y-3">
                      {/* Input */}
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Input
                        </div>
                        <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                          {typeof execution.input === 'string'
                            ? execution.input
                            : JSON.stringify(execution.input, null, 2)}
                        </pre>
                      </div>

                      {/* Output */}
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Output
                        </div>
                        <div className="text-xs bg-background p-2 rounded max-h-48 overflow-y-auto">
                          {execution.output.length > 500 && !showDetails ? (
                            <>
                              <p className="whitespace-pre-wrap">
                                {execution.output.substring(0, 500)}...
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Could expand to show full output
                                }}
                                className="text-primary hover:underline mt-2"
                              >
                                Show more
                              </button>
                            </>
                          ) : (
                            <pre className="whitespace-pre-wrap">
                              {execution.output}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/**
 * Compact version for inline display in chat messages
 */
export function CompactToolExecutionDisplay({
  executions,
}: {
  executions: ToolExecution[];
}) {
  if (executions.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Wrench className="h-3 w-3 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Used:</span>
      {executions.map((execution, index) => {
        const label = toolLabels[execution.tool] || execution.tool;
        return (
          <Badge key={index} variant="outline" className="text-xs">
            {label}
          </Badge>
        );
      })}
    </div>
  );
}
