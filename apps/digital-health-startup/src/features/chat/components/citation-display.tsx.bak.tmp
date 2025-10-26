'use client';

import { ExternalLink, FileText, FlaskConical, Shield, Activity, Database, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';

import { formatCitation } from '@/lib/services/evidence-retrieval';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import type { Citation } from '../services/enhanced-agent-orchestrator';

interface CitationDisplayProps {
  citations: Citation[];
  format?: 'apa' | 'vancouver' | 'chicago';
  compact?: boolean;
}

const CITATION_TYPE_INFO: Record<string, { label: string; icon: any; color: string }> = {
  'pubmed': { label: 'PubMed', icon: FileText, color: 'bg-green-100 text-green-800 border-green-300' },
  'clinical-trial': { label: 'Clinical Trial', icon: FlaskConical, color: 'bg-purple-100 text-purple-800 border-purple-300' },
  'fda-approval': { label: 'FDA', icon: Shield, color: 'bg-red-100 text-red-800 border-red-300' },
  'ich-guideline': { label: 'ICH', icon: Shield, color: 'bg-orange-100 text-orange-800 border-orange-300' },
  'iso-standard': { label: 'ISO', icon: Shield, color: 'bg-blue-100 text-blue-800 border-blue-300' },
  'dime-resource': { label: 'DiMe', icon: Activity, color: 'bg-pink-100 text-pink-800 border-pink-300' },
  'ichom-set': { label: 'ICHOM', icon: Activity, color: 'bg-teal-100 text-teal-800 border-teal-300' },
  'knowledge-base': { label: 'Internal KB', icon: Database, color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  'web-source': { label: 'Web', icon: ExternalLink, color: 'bg-gray-100 text-gray-800 border-gray-300' }
};

export function CitationDisplay({ citations, format = 'apa', compact = false }: CitationDisplayProps) {
  const [expanded, setExpanded] = useState(false);
  const [citationFormat, setCitationFormat] = useState<'apa' | 'vancouver' | 'chicago'>(format);

  if (citations.length === 0) return null;

  if (compact) {
    return (
      <div className="mt-2 text-xs text-muted-foreground">
        📚 {citations.length} {citations.length === 1 ? 'source' : 'sources'} cited
      </div>
    );
  }

  return (
    <Card className="mt-4 border-green-200 bg-green-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-green-600" />
            References ({citations.length})
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
                <ChevronDown className="h-3 w-3 mr-1" /> Show Details
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={expanded ? 'detailed' : 'compact'} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value="compact" onClick={() => setExpanded(false)}>
              Compact View
            </TabsTrigger>
            <TabsTrigger value="detailed" onClick={() => setExpanded(true)}>
              Detailed View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compact" className="space-y-2">
            {citations.map((citation, idx) => {
              const typeInfo = CITATION_TYPE_INFO[citation.type] || CITATION_TYPE_INFO['web-source'];
              const Icon = typeInfo.icon;

              return (
                <div key={idx} className="flex items-center gap-2 text-sm bg-white p-2 rounded border">
                  <span className="text-xs font-medium text-muted-foreground">[{idx + 1}]</span>
                  <Badge variant="outline" className={`${typeInfo.color} text-xs flex-shrink-0`}>
                    <Icon className="h-3 w-3 mr-1" />
                    {typeInfo.label}
                  </Badge>
                  <span className="flex-1 truncate">{citation.title}</span>
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="detailed" className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">Citation Format:</span>
              <div className="flex gap-1">
                {(['apa', 'vancouver', 'chicago'] as const).map((fmt) => (
                  <Button
                    key={fmt}
                    variant={citationFormat === fmt ? 'default' : 'outline'}
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={() => setCitationFormat(fmt)}
                  >
                    {fmt.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {citations.map((citation, idx) => {
              const typeInfo = CITATION_TYPE_INFO[citation.type] || CITATION_TYPE_INFO['web-source'];
              const Icon = typeInfo.icon;

              return (
                <div key={idx} className="bg-white rounded-lg p-4 border shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-semibold text-muted-foreground">[{idx + 1}]</span>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`${typeInfo.color} text-xs`}>
                          <Icon className="h-3 w-3 mr-1" />
                          {typeInfo.label}
                        </Badge>
                        {citation.relevance && (
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(citation.relevance * 100)}% relevant
                          </Badge>
                        )}
                        {citation.date && (
                          <span className="text-xs text-muted-foreground">{citation.date}</span>
                        )}
                      </div>

                      <div className="text-sm font-medium">{citation.title}</div>

                      <div className="text-xs text-muted-foreground">
                        {citation.source} • ID: {citation.id}
                      </div>

                      {citation.authors && citation.authors.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Authors: {citation.authors.join(', ')}
                        </div>
                      )}

                      <a
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 mt-1"
                      >
                        View source <ExternalLink className="h-3 w-3" />
                      </a>

                      {/* Formatted citation */}
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground font-medium">
                          Formatted citation ({citationFormat.toUpperCase()})
                        </summary>
                        <div className="mt-2 text-xs bg-gray-50 p-2 rounded border-l-2 border-gray-300">
                          {formatCitation(citation as any, citationFormat)}
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default CitationDisplay;
