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
          🎉 Select the Best Agent for Your Query
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
      <div className="grid gap-2 md:grid-cols-1 lg:grid-cols-3">
        {safeAgents.map((agent, index) => (
          <Card
            key={agent.id}
            className={cn(
              'p-2 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-400',
              'border border-gray-200 hover:border-blue-400 bg-white rounded-lg',
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
            <div className="space-y-1.5">
              {/* Agent Header - Compact */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AgentAvatar
                    avatar={agent.avatar || '🤖'}
                    name={agent.display_name || agent.name}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-xs truncate">
                      {agent.display_name || agent.name}
                    </h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Badge 
                        variant="outline" 
                        className={cn('text-xs px-1 py-0.5', getConfidenceColor(agent.confidence))}
                      >
                        {agent.confidence}
                      </Badge>
                      <span className={cn('text-xs font-medium', getScoreColor(agent.score))}>
                        {Math.round(agent.score * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-300">
                    #{index + 1}
                  </div>
                </div>
              </div>

              {/* Agent Description - Ultra Compact */}
              <p className="text-xs text-gray-600 line-clamp-1 leading-tight">
                {agent.description}
              </p>

              {/* Capabilities - Ultra Compact */}
              <div className="flex flex-wrap gap-0.5">
                {agent.capabilities.slice(0, 1).map((capability, capIndex) => (
                  <Badge
                    key={capIndex}
                    variant="secondary"
                    className="text-xs px-1 py-0.5 bg-gray-100 text-gray-700"
                  >
                    {capability}
                  </Badge>
                ))}
                {agent.capabilities.length > 1 && (
                  <Badge variant="secondary" className="text-xs px-1 py-0.5 bg-gray-100 text-gray-700">
                    +{agent.capabilities.length - 1}
                  </Badge>
                )}
              </div>

              {/* Select Button - Ultra Compact */}
              <Button
                className="w-full mt-1.5 h-7 text-xs font-medium"
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
                {isLoading ? 'Processing...' : 'Select'}
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