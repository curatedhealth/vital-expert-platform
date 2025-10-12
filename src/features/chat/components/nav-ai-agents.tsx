'use client';

import { ShoppingCart, UserPlus, X } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Agent {
  id: string;
  name: string;
  avatar: string;
}

interface NavAiAgentsProps {
  onAgentStoreClick: () => void;
  onCreateAgentClick: () => void;
  onAgentSelect?: (agentId: string) => void;
  onAgentRemove?: (agentId: string) => void;
  onAddAgentToLibrary?: (agentId: string) => void;
  selectedAgentId?: string;
  agents?: Agent[];
  allAgents?: Agent[];
  isCollapsed?: boolean;
  mounted?: boolean;
}

// Agents will be passed as props from the chat store

export function NavAiAgents({ onAgentStoreClick, onCreateAgentClick, onAgentSelect, onAgentRemove, onAddAgentToLibrary, selectedAgentId, agents = [], allAgents = [], isCollapsed = false, mounted = false }: NavAiAgentsProps) {
  // Use the mounted prop passed from parent instead of local state
  const safeAgents = mounted ? agents : [];
  const [showAgentSelector, setShowAgentSelector] = useState(false);

  return (
    <div className="px-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between mb-2 px-4">
          <h2 className="text-lg font-semibold tracking-tight">
            {!isCollapsed && "My Agents"}
          </h2>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAgentSelector(!showAgentSelector)}
              className="h-6 w-6 p-0"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Agent Selector */}
        {showAgentSelector && !isCollapsed && (
          <div className="mb-2 p-2 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground mb-2">Add agents to chat:</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {allAgents.slice(0, 10).map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-1 hover:bg-background rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{agent.avatar}</span>
                    <span className="text-xs truncate">{agent.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (onAddAgentToLibrary) {
                        onAddAgentToLibrary(agent.id);
                        setShowAgentSelector(false);
                      }
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <UserPlus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1">
          {!mounted || safeAgents.length === 0 ? (
            <div className="px-4 py-2 text-sm text-muted-foreground">
              {!isCollapsed && (mounted ? "No agents added yet. Click + to add some." : "Loading agents...")}
            </div>
          ) : (
            safeAgents.map((agent) => {
              const isSelected = selectedAgentId === agent.id;
              return (
                <div key={agent.id} className="group relative">
                  <Button
                    variant={isSelected ? "secondary" : "ghost"}
                    className={cn(
                      'w-full',
                      isCollapsed ? 'justify-center px-2' : 'justify-start pr-8',
                      isSelected && 'bg-blue-100 border-blue-200 text-blue-900',
                    )}
                    onClick={() => onAgentSelect?.(agent.id)}
                  >
                    <div className="relative w-4 h-4 flex-shrink-0">
                      {agent.avatar && (agent.avatar.startsWith('/') || agent.avatar.startsWith('http')) ? (
                        <Image
                          src={agent.avatar}
                          alt={agent.name}
                          width={16}
                          height={16}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                          {agent.avatar || '🤖'}
                        </div>
                      )}
                    </div>
                    {!isCollapsed && <span className="ml-2 flex-1 text-left">{agent.name}</span>}
                  </Button>
                  {!isCollapsed && onAgentRemove && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAgentRemove(agent.id);
                      }}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Separator */}
        {!isCollapsed && (
          <div className="px-4 py-2">
            <Separator />
          </div>
        )}

        {/* Agent actions */}
        {!isCollapsed && (
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={onAgentStoreClick}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="ml-2">Agent Store</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={onCreateAgentClick}
            >
              <UserPlus className="h-4 w-4" />
              <span className="ml-2">Create New Agent</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}