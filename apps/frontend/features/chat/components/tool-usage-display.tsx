'use client';

import React, { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  Search, FileText, Calculator, Database, FlaskConical, Shield, Activity, Globe, ChevronDown, ChevronUp
} from 'lucide-react';
import type { ToolCall } from '@/lib/services/expert-tools';

interface ToolUsageDisplayProps {
  toolCalls: ToolCall[];
  compact?: boolean;
}

const TOOL_ICONS: Record<string, any> = {
  web_search: Globe,
  pubmed_search: FileText,
  search_clinical_trials: FlaskConical,
  search_fda_approvals: Shield,
  search_ich_guidelines: Shield,
  search_iso_standards: Shield,
  search_dime_resources: Activity,
  search_ichom_standard_sets: Activity,
  calculator: Calculator,
  knowledge_base: Database
};

const TOOL_COLORS: Record<string, string> = {
  web_search: 'bg-blue-100 text-blue-800 border-blue-300',
  pubmed_search: 'bg-green-100 text-green-800 border-green-300',
  search_clinical_trials: 'bg-purple-100 text-purple-800 border-purple-300',
  search_fda_approvals: 'bg-red-100 text-red-800 border-red-300',
  search_ich_guidelines: 'bg-orange-100 text-orange-800 border-orange-300',
  calculator: 'bg-gray-100 text-gray-800 border-gray-300',
  knowledge_base: 'bg-indigo-100 text-indigo-800 border-indigo-300'
};

export function ToolUsageDisplay({ toolCalls, compact = false }: ToolUsageDisplayProps) {
  const [expanded, setExpanded] = useState(false);

  if (toolCalls.length === 0) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5 mt-2 items-center">
        <span className="text-xs text-muted-foreground font-medium">🔧 Tools:</span>
        {toolCalls.map((toolCall, idx) => {
          const Icon = TOOL_ICONS[toolCall.toolName] || Search;
          const colorClass = TOOL_COLORS[toolCall.toolName] || 'bg-gray-100 text-gray-800';

          return (
            <Badge key={idx} variant="outline" className={`${colorClass} text-xs`}>
              <Icon className="h-3 w-3 mr-1" />
              {toolCall.toolName.replace(/_/g, ' ').replace(/^search /, '')}
            </Badge>
          );
        })}
      </div>
    );
  }

  return (
    <Card className="mt-3 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Search className="h-4 w-4 text-blue-600" />
            Research Conducted ({toolCalls.length} {toolCalls.length === 1 ? 'tool' : 'tools'})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" /> Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" /> Expand
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {toolCalls.map((toolCall, idx) => {
          const Icon = TOOL_ICONS[toolCall.toolName] || Search;
          const colorClass = TOOL_COLORS[toolCall.toolName] || 'bg-gray-100 text-gray-800';

          return (
            <div key={idx} className="bg-white rounded-lg p-3 border shadow-sm">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium mb-1">
                    {toolCall.toolName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  {expanded && (
                    <>
                      <div className="text-xs text-muted-foreground mb-2">
                        <strong>Query:</strong>{' '}
                        {typeof toolCall.input === 'string'
                          ? toolCall.input
                          : JSON.stringify(toolCall.input).substring(0, 150)}
                      </div>
                      {toolCall.output && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 font-medium">
                            View results
                          </summary>
                          <div className="mt-2 text-xs bg-gray-50 p-2 rounded max-h-32 overflow-y-auto font-mono">
                            <pre className="whitespace-pre-wrap">
                              {toolCall.output.substring(0, 500)}
                              {toolCall.output.length > 500 && '... (truncated)'}
                            </pre>
                          </div>
                        </details>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default ToolUsageDisplay;
