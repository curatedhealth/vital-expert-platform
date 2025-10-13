'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AgentAvatar } from '@/components/ui/agent-avatar';
import { cn } from '@/lib/utils';

interface AgentOption {
  id: string;
  name: string;
  display_name?: string;
  description: string;
  capabilities: string[];
  score: number;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  color?: string;
  avatar?: string;
}

interface AgentSelectionProps {
  agents: AgentOption[];
  onSelect: (agent: AgentOption) => void;
  isLoading?: boolean;
  className?: string;
}

export function AgentSelection({ agents, onSelect, isLoading = false, className }: AgentSelectionProps) {
  // Safety check for agents array
  const safeAgents = Array.isArray(agents) ? agents : [];
  
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🤖 Select the Best Agent for Your Query
        </h3>
        <p className="text-sm text-gray-600">
          I've analyzed your question and found these expert agents. Choose the one that best fits your needs:
        </p>
      </div>

      {safeAgents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No agents available at the moment.</p>
        </div>
      ) : (
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {safeAgents.map((agent, index) => (
          <Card
            key={agent.id}
            className={cn(
              'p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-blue-400',
              'border border-gray-200 hover:border-blue-400 bg-white',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isLoading) {
                onSelect(agent);
              }
            }}
          >
            <div className="space-y-3">
              {/* Agent Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <AgentAvatar
                    avatar={agent.avatar || '🤖'}
                    name={agent.display_name || agent.name}
                    size="md"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {agent.display_name || agent.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={cn('text-xs px-2 py-1', getConfidenceColor(agent.confidence))}
                      >
                        {agent.confidence} confidence
                      </Badge>
                      <span className={cn('text-xs font-medium', getScoreColor(agent.score))}>
                        {Math.round(agent.score * 100)}% match
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-300">
                    #{index + 1}
                  </div>
                </div>
              </div>

              {/* Agent Description */}
              <p className="text-sm text-gray-600 line-clamp-2">
                {agent.description}
              </p>

              {/* Capabilities */}
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Capabilities
                </h5>
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.slice(0, 3).map((capability, capIndex) => (
                    <Badge
                      key={capIndex}
                      variant="secondary"
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700"
                    >
                      {capability}
                    </Badge>
                  ))}
                  {agent.capabilities.length > 3 && (
                    <Badge variant="secondary" className="text-xs px-2 py-1 bg-gray-100 text-gray-700">
                      +{agent.capabilities.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Why This Agent */}
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Why This Agent?
                </h5>
                <p className="text-xs text-gray-600 italic line-clamp-2">
                  {agent.reasoning}
                </p>
              </div>

              {/* Select Button */}
              <Button
                className="w-full mt-3 h-9 text-sm font-medium"
                variant="outline"
                disabled={isLoading}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isLoading) {
                    onSelect(agent);
                  }
                }}
              >
                {isLoading ? 'Processing...' : 'Select This Agent'}
              </Button>
            </div>
          </Card>
        ))}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Processing your selection...
          </div>
        </div>
      )}
    </div>
  );
}
