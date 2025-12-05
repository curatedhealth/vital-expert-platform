'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAskExpert } from '@/contexts/ask-expert-context';

// Category colors for visual differentiation
const categoryColors: Record<string, string> = {
  clinical: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  regulatory: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  research: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  safety: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  analytics: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  strategy: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  operations: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  default: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-300'
};

export function AgentLibrary() {
  const [searchQuery, setSearchQuery] = useState('');

  // Get USER'S agents list (not all agents) and selection functions from context
  const {
    agents,
    selectedAgents,
    setSelectedAgents,
    agentsLoading,
    removeAgentFromUserList
  } = useAskExpert();

  // Filter agents based on search
  const filteredAgents = useMemo(() => {
    if (!searchQuery) return agents;

    const searchLower = searchQuery.toLowerCase();
    return agents.filter((agent) =>
      (agent.name || '').toLowerCase().includes(searchLower) ||
      (agent.displayName || '').toLowerCase().includes(searchLower) ||
      (agent.description || '').toLowerCase().includes(searchLower)
    );
  }, [agents, searchQuery]);

  // Handle agent selection - updates the shared context
  const handleAgentSelect = (agentId: string) => {
    setSelectedAgents([agentId]);
  };

  // Handle removing agent from user's list
  const handleRemoveAgent = async (e: React.MouseEvent, agentId: string) => {
    e.stopPropagation(); // Prevent selecting the agent
    try {
      await removeAgentFromUserList(agentId);
    } catch (error) {
      console.error('Failed to remove agent:', error);
    }
  };

  // Check if an agent is currently selected
  const isAgentSelected = (agentId: string) => selectedAgents.includes(agentId);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">My Agents</h3>
          <Link
            href="/agents"
            className="text-xs text-primary hover:underline"
          >
            + Add more
          </Link>
        </div>
        <input
          type="text"
          placeholder="Search my agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto">
        {agentsLoading ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <div className="text-2xl mb-2 animate-pulse">🔄</div>
            <p className="text-sm text-center">Loading agents...</p>
          </div>
        ) : agents.length === 0 ? (
          /* Empty state - no agents added yet */
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground p-4">
            <div className="text-3xl mb-3">🤖</div>
            <p className="text-sm text-center font-medium mb-2">No agents added yet</p>
            <p className="text-xs text-center mb-4">
              Browse and add agents to start conversations
            </p>
            <Link
              href="/agents"
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse Agents
            </Link>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <div className="text-2xl mb-2">🔍</div>
            <p className="text-sm text-center">No matching agents</p>
            <p className="text-xs text-center mt-1">Try a different search</p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredAgents.map((agent) => {
              const isSelected = isAgentSelected(agent.id);

              return (
                <div
                  key={agent.id}
                  className={`relative w-full text-left p-3 rounded-lg transition-colors group ${
                    isSelected
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'hover:bg-muted/50 border-2 border-transparent'
                  }`}
                >
                  <button
                    onClick={() => handleAgentSelect(agent.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-3">
                      {/* Agent Avatar */}
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-lg overflow-hidden">
                        {agent.avatar ? (
                          <img
                            src={agent.avatar.startsWith('/') ? agent.avatar : `/icons/png/avatars/${agent.avatar}.png`}
                            alt={agent.displayName || agent.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to first letter if image fails
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span>{(agent.displayName || agent.name)?.[0] || '🤖'}</span>
                        )}
                      </div>

                      {/* Agent Details */}
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {agent.displayName || agent.name}
                          </h4>
                          {isSelected && (
                            <span className="text-xs text-primary font-medium">✓</span>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {agent.description || 'AI Expert Agent'}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Remove button - appears on hover */}
                  <button
                    onClick={(e) => handleRemoveAgent(e, agent.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    title="Remove from my agents"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {agents.length > 0 && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            <span className="font-medium">{agents.length}</span> agent{agents.length !== 1 ? 's' : ''} in my list
          </div>
        </div>
      )}
    </div>
  );
}
