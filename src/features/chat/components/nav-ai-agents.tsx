'use client';

import { Search, ShoppingCart, UserPlus, X } from 'lucide-react';
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
  description?: string;
  business_function?: string;
  department?: string;
  tier?: number;
  capabilities?: string[];
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
  const [searchTerm, setSearchTerm] = useState('');
  const [addedAgentName, setAddedAgentName] = useState<string | null>(null);
  
  // Filter agents based on search term
  const filteredAgents = allAgents.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (agent.description && agent.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <div className="mb-2 p-3 bg-muted rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-foreground">Add agents to chat</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAgentSelector(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              {filteredAgents.length} of {allAgents.length} agents
            </div>
            
            {/* Success Message */}
            {addedAgentName && (
              <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                ✓ {addedAgentName} added to your library
              </div>
            )}
            
            {/* Search Input */}
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {filteredAgents.slice(0, 15).map((agent) => {
                const isAlreadyAdded = agents.some(a => a.id === agent.id);
                return (
                  <div key={agent.id} className="flex items-center justify-between p-2 hover:bg-background rounded border-b border-border/50 last:border-b-0">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="relative w-6 h-6 flex-shrink-0">
                        {agent.avatar && (agent.avatar.startsWith('/') || agent.avatar.startsWith('http')) ? (
                          <Image
                            src={agent.avatar}
                            alt={agent.name}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-xs font-medium">
                            {agent.avatar || agent.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-sm font-medium truncate">{agent.name}</div>
                          {agent.tier && (
                            <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                              T{agent.tier}
                            </span>
                          )}
                        </div>
                        {agent.description && (
                          <div className="text-xs text-muted-foreground truncate mb-1">{agent.description}</div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {agent.business_function && (
                            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                              {agent.business_function}
                            </span>
                          )}
                          {agent.department && (
                            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                              {agent.department}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant={isAlreadyAdded ? "secondary" : "default"}
                      size="sm"
                      disabled={isAlreadyAdded}
                      onClick={() => {
                        try {
                          if (typeof window !== 'undefined' && onAddAgentToLibrary) {
                            onAddAgentToLibrary(agent.id);
                            setAddedAgentName(agent.name);
                            console.log('Adding agent to library:', agent.name);
                            
                            // Clear success message after 2 seconds
                            setTimeout(() => setAddedAgentName(null), 2000);
                          }
                        } catch (error) {
                          console.error('Error adding agent to library:', error);
                        }
                      }}
                      className="h-7 px-2 text-xs"
                    >
                      {isAlreadyAdded ? 'Added' : <UserPlus className="h-3 w-3 mr-1" />}
                      {!isAlreadyAdded && 'Add'}
                    </Button>
                  </div>
                );
              })}
              {filteredAgents.length === 0 && searchTerm && (
                <div className="text-xs text-muted-foreground text-center py-4">
                  No agents found matching "{searchTerm}"
                </div>
              )}
              {filteredAgents.length > 15 && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  Showing first 15 of {filteredAgents.length} results
                </div>
              )}
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
                    <div className="relative w-5 h-5 flex-shrink-0">
                      {agent.avatar && (agent.avatar.startsWith('/') || agent.avatar.startsWith('http')) ? (
                        <Image
                          src={agent.avatar}
                          alt={agent.name}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-xs font-medium">
                          {agent.avatar || agent.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {!isCollapsed && (
                      <div className="ml-2 flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-sm font-medium truncate">{agent.name}</div>
                          {agent.tier && (
                            <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                              T{agent.tier}
                            </span>
                          )}
                        </div>
                        {agent.description && (
                          <div className="text-xs text-muted-foreground truncate">{agent.description}</div>
                        )}
                      </div>
                    )}
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