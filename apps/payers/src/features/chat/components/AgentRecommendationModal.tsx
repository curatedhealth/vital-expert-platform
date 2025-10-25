'use client';

import { X } from 'lucide-react';
import Image from 'next/image';

import { Badge } from '@vital/ui/components/badge';
import { Button } from '@vital/ui/components/button';
import { Card } from '@vital/ui/components/card';

interface RecommendedAgent {
  id: string;
  name: string;
  display_name?: string;
  description: string;
  avatar: string;
  tier?: number;
  reasoning: string;
  score?: number;
}

interface AgentRecommendationModalProps {
  isOpen: boolean;
  recommendedAgents: RecommendedAgent[];
  pendingMessage: string;
  onSelectAgent: (agent: RecommendedAgent) => void;
  onCancel: () => void;
}

/**
 * Modal displaying agent recommendations based on user query
 * Shows top 3 recommended agents with reasoning and allows selection
 */
export function AgentRecommendationModal({
  isOpen,
  recommendedAgents,
  pendingMessage,
  onSelectAgent,
  onCancel,
}: AgentRecommendationModalProps) {
  if (!isOpen || recommendedAgents.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Which expert would you like to consult?
            </h3>
            <p className="text-sm text-gray-600">
              Your question: &quot;{pendingMessage}&quot;
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="p-4 space-y-3">
          {recommendedAgents.map((agent, index) => (
            <Card
              key={agent.id}
              className="p-4 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200 border-2"
              onClick={() => onSelectAgent(agent)}
            >
              <div className="flex items-start gap-4">
                {/* Agent Avatar */}
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 flex-shrink-0 overflow-hidden">
                  {agent.avatar && (agent.avatar.startsWith('/') || agent.avatar.includes('avatar_')) ? (
                    <Image
                      src={agent.avatar}
                      alt={agent.display_name || agent.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-2xl">{agent.avatar || '>'}</span>
                  )}
                </div>

                {/* Agent Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-semibold text-gray-900">
                      {agent.display_name || agent.name}
                    </h4>
                    {index === 0 && (
                      <Badge variant="default" className="bg-blue-600">
                        Best Match
                      </Badge>
                    )}
                    {agent.tier && (
                      <Badge variant="outline">
                        Tier {agent.tier}
                      </Badge>
                    )}
                    {agent.score && (
                      <Badge variant="secondary">
                        {Math.round(agent.score)}% match
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {agent.description}
                  </p>
                  <p className="text-xs text-gray-500 italic line-clamp-2">
                    {agent.reasoning}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full"
          >
            Cancel and edit question
          </Button>
        </div>
      </Card>
    </div>
  );
}
