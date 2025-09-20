'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AgentAvatar } from '@/components/ui/agent-avatar';
import { useChatStore } from '@/lib/stores/chat-store';
import {
  ChevronDown,
  ChevronUp,
  Settings,
  Star,
  Zap,
  Brain,
  CheckCircle,
  Edit,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentSelectorProps {
  compact?: boolean;
  onEditAgent?: (agent: any) => void;
}

export function AgentSelector({ compact = false, onEditAgent }: AgentSelectorProps) {
  const { agents, selectedAgent, setSelectedAgent } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);

  if (compact) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          className="w-full justify-between h-auto p-3"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-3">
            <AgentAvatar
              avatar={selectedAgent?.avatar || ''}
              name={selectedAgent?.name || ''}
              size="md"
            />
            <div className="text-left">
              <div className="font-medium text-sm">{selectedAgent?.name}</div>
              <div className="text-xs text-medical-gray">
                {selectedAgent?.capabilities[0]}
              </div>
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {agents.map((agent) => (
                <Button
                  key={agent.id}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 border-b border-gray-100 last:border-b-0"
                  onClick={() => {
                    setSelectedAgent(agent);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <AgentAvatar
                      avatar={agent.avatar}
                      name={agent.name}
                      size="md"
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{agent.name}</span>
                        {selectedAgent?.id === agent.id && (
                          <CheckCircle className="h-3 w-3 text-progress-teal" />
                        )}
                        {agent.ragEnabled && (
                          <Zap className="h-3 w-3 text-regulatory-gold" />
                        )}
                      </div>
                      <div className="text-xs text-medical-gray">
                        {agent.capabilities[0]}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Full agent selector
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-deep-charcoal">
          Select AI Expert
        </h3>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const isSelected = selectedAgent?.id === agent.id;

          return (
            <Card
              key={agent.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md relative group',
                isSelected && 'ring-2 ring-progress-teal bg-progress-teal/5'
              )}
              onClick={() => setSelectedAgent(agent)}
            >
              {/* Edit Button */}
              {onEditAgent && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditAgent(agent);
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}

              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AgentAvatar
                    avatar={agent.avatar}
                    name={agent.name}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-deep-charcoal text-sm">
                        {agent.name}
                      </h4>
                      {isSelected && (
                        <CheckCircle className="h-4 w-4 text-progress-teal flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-medical-gray mb-3 line-clamp-2">
                      {agent.description}
                    </p>

                    {/* Capabilities */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {agent.capabilities.slice(0, 2).map((capability) => (
                        <Badge
                          key={capability}
                          variant="outline"
                          className={cn(
                            'text-xs',
                            isSelected ? 'border-progress-teal/30 text-progress-teal' : ''
                          )}
                        >
                          {capability}
                        </Badge>
                      ))}
                      {agent.capabilities.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{agent.capabilities.length - 2}
                        </Badge>
                      )}
                    </div>

                    {/* Features */}
                    <div className="flex items-center gap-3 text-xs text-medical-gray">
                      <div className="flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        {agent.model}
                      </div>
                      {agent.ragEnabled && (
                        <div className="flex items-center gap-1 text-regulatory-gold">
                          <Zap className="h-3 w-3" />
                          RAG
                        </div>
                      )}
                      {agent.isCustom && (
                        <div className="flex items-center gap-1 text-market-purple">
                          <Star className="h-3 w-3" />
                          Custom
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Agent Details */}
      {selectedAgent && (
        <Card className="bg-background-gray/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AgentAvatar
                avatar={selectedAgent.avatar}
                name={selectedAgent.name}
                size="lg"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-deep-charcoal mb-1">
                  {selectedAgent.name} - Ready to Help
                </h4>
                <p className="text-sm text-medical-gray mb-3">
                  {selectedAgent.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {selectedAgent.capabilities.map((capability) => (
                    <Badge
                      key={capability}
                      variant="secondary"
                      className="text-xs bg-progress-teal/10 text-progress-teal"
                    >
                      {capability}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs text-medical-gray">
                  <span>Model: {selectedAgent.model}</span>
                  <span>Temperature: {selectedAgent.temperature}</span>
                  <span>Max Tokens: {selectedAgent.maxTokens}</span>
                  {selectedAgent.ragEnabled && (
                    <Badge variant="outline" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      Knowledge Base Enabled
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}