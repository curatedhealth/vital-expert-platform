'use client';

/**
 * AgentCompareTab - Agent Comparison View
 *
 * Displays agent comparison functionality
 * Uses Brand Guidelines v6.0 styling
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@vital/ui';
import { Button } from '@vital/ui';
import { ArrowRightLeft } from 'lucide-react';
import { type Agent } from '@/lib/stores/agents-store';
import { AgentComparison } from '@/features/agents/components/agent-comparison';
import { useAgentComparison } from '@/features/agents/components/agent-comparison-sidebar';

interface AgentCompareTabProps {
  agent: Agent;
  relatedAgents: Agent[];
}

export function AgentCompareTab({ agent, relatedAgents }: AgentCompareTabProps) {
  const { addToComparison, comparisonAgents, removeFromComparison } = useAgentComparison();

  const handleAddToCompare = () => {
    if (agent) {
      addToComparison(agent as any);
    }
  };

  if (!comparisonAgents || comparisonAgents.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="p-12 border-stone-200">
          <div className="text-center">
            <ArrowRightLeft className="h-16 w-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-stone-900 mb-2">
              No Agents Selected for Comparison
            </h3>
            <p className="text-stone-600 mb-6 max-w-md mx-auto">
              Add agents to compare their capabilities, models, and configurations side by side.
            </p>
            <Button onClick={handleAddToCompare} className="bg-purple-600 hover:bg-purple-700">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Add This Agent to Compare
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AgentComparison agents={comparisonAgents as any} onRemoveAgent={removeFromComparison} />

      {/* Quick Add Related Agents */}
      {relatedAgents.length > 0 && comparisonAgents.length < 4 && (
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="text-lg text-stone-900">Quick Add Related Agents</CardTitle>
            <CardDescription>
              Add related agents to compare with {(agent as any).display_name || agent.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {relatedAgents
                .filter((r) => !comparisonAgents.find((c: any) => c.id === r.id))
                .slice(0, 6)
                .map((related) => (
                  <Button
                    key={related.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addToComparison(related as any)}
                    className="border-stone-200 hover:border-purple-300"
                  >
                    <span className="mr-2">{related.avatar || '🤖'}</span>
                    {(related as any).display_name || related.name}
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
