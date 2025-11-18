'use client';

import {
  ChevronDown,
  ChevronUp,
  Settings,
  Zap,
  CheckCircle,
  Edit,
  BookmarkPlus,
  BookmarkCheck,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AgentAvatar } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent } from '@vital/ui';
import { EnhancedAgentCard, AgentCardGrid } from '@vital/ui';
import { useChatStore } from '@/lib/stores/chat-store';
import { cn } from '@vital/ui/lib/utils';

interface AgentSelectorProps {
  compact?: boolean;
  onEditAgent?: (agent: unknown) => void;
}

export function AgentSelector({ compact = false, onEditAgent }: AgentSelectorProps) {
  const { agents, selectedAgent, setSelectedAgent, addToLibrary, removeFromLibrary, isInLibrary } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleLibrary = (agentId: string, agentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInLibrary(agentId)) {
      removeFromLibrary(agentId);
      toast.success(`Removed ${agentName} from your library`);
    } else {
      addToLibrary(agentId);
      toast.success(`Added ${agentName} to your library`);
    }
  };

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
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsOpen(false);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Close agent selector"
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

      <AgentCardGrid columns={3} className="gap-4">
        {agents.map((agent) => {
          const isSelected = selectedAgent?.id === agent.id;

          return (
            <div key={agent.id} className="relative group">
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

              <EnhancedAgentCard
                agent={agent}
                isSelected={isSelected}
                onClick={() => setSelectedAgent(agent)}
                showReasoning={false}
                showTier={true}
                size="md"
              />
            </div>
          );
        })}
      </AgentCardGrid>

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
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-deep-charcoal">
                    {selectedAgent.name} - Ready to Help
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleToggleLibrary(selectedAgent.id, selectedAgent.name, e)}
                    className={cn(
                      "h-8",
                      isInLibrary(selectedAgent.id) && "text-market-purple"
                    )}
                  >
                    {isInLibrary(selectedAgent.id) ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 mr-1" />
                        In Library
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="h-4 w-4 mr-1" />
                        Add to Library
                      </>
                    )}
                  </Button>
                </div>
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