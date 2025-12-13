'use client';

/**
 * AgentSettingsTab - Model Configuration & Settings
 *
 * Displays model configuration and system prompt
 * Uses Brand Guidelines v6.0 styling
 */

import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Brain, Thermometer, Hash, Star } from 'lucide-react';
import { type Agent } from '@/lib/stores/agents-store';

interface AgentSettingsTabProps {
  agent: Agent;
}

export function AgentSettingsTab({ agent }: AgentSettingsTabProps) {
  return (
    <div className="space-y-6">
      <Card className="border-stone-200">
        <CardHeader>
          <CardTitle className="text-base text-stone-900">Model Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-stone-50">
              <Brain className="w-5 h-5 text-stone-500" />
              <div>
                <p className="text-sm font-medium text-stone-900">Model</p>
                <p className="text-xs text-stone-600">{agent.model || 'gpt-4'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-stone-50">
              <Thermometer className="w-5 h-5 text-stone-500" />
              <div>
                <p className="text-sm font-medium text-stone-900">Temperature</p>
                <p className="text-xs text-stone-600">{agent.temperature ?? 0.7}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-stone-50">
              <Hash className="w-5 h-5 text-stone-500" />
              <div>
                <p className="text-sm font-medium text-stone-900">Max Tokens</p>
                <p className="text-xs text-stone-600">{agent.max_tokens || 2000}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-stone-50">
              <Star className="w-5 h-5 text-stone-500" />
              <div>
                <p className="text-sm font-medium text-stone-900">Priority</p>
                <p className="text-xs text-stone-600">{agent.priority || 1}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {agent.system_prompt && (
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="text-base text-stone-900">System Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-stone-700 bg-stone-50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-[500px] overflow-y-auto">
              {agent.system_prompt}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
