'use client';

/**
 * AgentKnowledgeTab - Knowledge Domains & RAG Config
 *
 * Displays agent knowledge domains and RAG configuration
 * Uses Brand Guidelines v6.0 styling
 */

import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Database } from 'lucide-react';
import { type Agent } from '@/lib/stores/agents-store';

interface AgentKnowledgeTabProps {
  agent: Agent;
}

export function AgentKnowledgeTab({ agent }: AgentKnowledgeTabProps) {
  return (
    <div className="space-y-6">
      {/* Knowledge Domains */}
      <Card className="border-stone-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-stone-900">
            <Database className="w-4 h-4 text-stone-500" />
            Knowledge Domains
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {agent.knowledge_domains && agent.knowledge_domains.length > 0 ? (
              agent.knowledge_domains.map((domain: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-sm bg-blue-50 text-blue-700 border-blue-200"
                >
                  {domain}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-stone-500 italic">No knowledge domains specified</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* RAG Configuration */}
      <Card className="border-stone-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-stone-900">
            <Database className="w-4 h-4 text-stone-500" />
            RAG Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-stone-50">
            <span className="text-sm text-stone-600">RAG Enabled</span>
            <Badge
              variant={agent.rag_enabled !== false ? 'default' : 'secondary'}
              className={agent.rag_enabled !== false ? 'bg-emerald-100 text-emerald-700' : ''}
            >
              {agent.rag_enabled !== false ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          {(agent as any).rag_collections && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-stone-50">
              <span className="text-sm text-stone-600">Collections</span>
              <span className="text-sm font-medium text-stone-900">
                {Array.isArray((agent as any).rag_collections)
                  ? (agent as any).rag_collections.join(', ')
                  : (agent as any).rag_collections}
              </span>
            </div>
          )}
          {(agent as any).context_window && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-stone-50">
              <span className="text-sm text-stone-600">Context Window</span>
              <span className="text-sm font-medium text-stone-900">
                {(agent as any).context_window.toLocaleString()} tokens
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
