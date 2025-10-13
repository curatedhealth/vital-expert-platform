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
  console.log('🔍 AgentSelection rendered with isLoading:', isLoading, 'agents count:', agents.length);
  
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

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {agents.map((agent, index) => (
          <Card
            key={agent.id}
            className={cn(
              'p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105',
              'border-2 hover:border-blue-300',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🖱️ Agent card clicked:', agent.name, 'isLoading:', isLoading);
              if (!isLoading) {
                console.log('✅ Calling onSelect with agent:', agent);
                onSelect(agent);
              } else {
                console.log('❌ Click ignored - loading state active');
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
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {agent.display_name || agent.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={cn('text-xs', getConfidenceColor(agent.confidence))}
                      >
                        {agent.confidence} confidence
                      </Badge>
                      <span className={cn('text-sm font-medium', getScoreColor(agent.score))}>
                        {Math.round(agent.score * 100)}% match
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
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
                      className="text-xs px-2 py-1"
                    >
                      {capability}
                    </Badge>
                  ))}
                  {agent.capabilities.length > 3 && (
                    <Badge variant="secondary" className="text-xs px-2 py-1">
                      +{agent.capabilities.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Reasoning */}
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Why This Agent?
                </h5>
                <p className="text-xs text-gray-600 italic">
                  {agent.reasoning}
                </p>
              </div>

              {/* Select Button */}
              <Button
                className="w-full mt-3"
                variant="outline"
                disabled={isLoading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🖱️ Select button clicked for agent:', agent.name, 'isLoading:', isLoading);
                  if (!isLoading) {
                    console.log('✅ Calling onSelect from button with agent:', agent);
                    onSelect(agent);
                  } else {
                    console.log('❌ Button click ignored - loading state active');
                  }
                }}
              >
                {(() => {
                  console.log('🔍 Button text logic - isLoading:', isLoading, 'agent:', agent.name);
                  return isLoading ? 'Processing...' : 'Select This Agent';
                })()}
              </Button>
            </div>
          </Card>
        ))}
      </div>

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
