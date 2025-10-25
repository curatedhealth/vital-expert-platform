import React from 'react';

import { Button } from '@vital/ui/components/button';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

interface AgentsBoardProps {
  agents?: Agent[];
  onCreateAgent?: () => void;
  onEditAgent?: (agent: Agent) => void;
  onDeleteAgent?: (agentId: string) => void;
  onAgentSelect?: (agent: Agent) => void;
  onAddToChat?: (agent: Agent) => void;
  showCreateButton?: boolean;
  hiddenControls?: boolean;
}

export function AgentsBoard({
  agents = [],
  onCreateAgent,
  onEditAgent,
  onDeleteAgent,
  onAgentSelect,
  onAddToChat,
  showCreateButton = true,
  hiddenControls = false
}: AgentsBoardProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agents Board</h1>
        {showCreateButton && (
          <Button onClick={onCreateAgent}>
            Create Agent
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No agents created yet. Click "Create Agent" to get started.
          </div>
        ) : (
          agents.map((agent) => (
            <div key={agent.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{agent.name}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  agent.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {agent.status}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{agent.description}</p>
              <div className="flex gap-2">
                {onAgentSelect && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAgentSelect(agent)}
                  >
                    View
                  </Button>
                )}
                {onAddToChat && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddToChat(agent)}
                  >
                    Add to Chat
                  </Button>
                )}
                {!hiddenControls && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditAgent?.(agent)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteAgent?.(agent.id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AgentsBoard;