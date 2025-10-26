import React from 'react';

import { Button } from '@vital/ui';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  capabilities?: string[];
  configuration?: Record<string, unknown>;
}

interface AgentDetailsModalProps {
  agent?: Agent | null;
  onClose: () => void;
  onEdit?: (agent: Agent) => void;
  onDelete?: (agentId: string) => void;
}

export function AgentDetailsModal({
  agent,
  onClose,
  onEdit,
  onDelete
}: AgentDetailsModalProps) {

  if (!isOpen || !agent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">{agent.name}</h2>
            <span className={`px-3 py-1 rounded-full text-sm ${
              agent.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {agent.status}
            </span>
          </div>
          <Button variant="outline" onClick={onClose}>
            ×
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-gray-600">{agent.description}</p>
          </div>

          {agent.capabilities && agent.capabilities.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Capabilities</h3>
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.map((capability, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>
          )}

          {agent.configuration && Object.keys(agent.configuration).length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Configuration</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(agent.configuration, null, 2)}
              </pre>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            {agent.created_at && (
              <div>
                <span className="font-medium">Created:</span>
                <br />
                {new Date(agent.created_at).toLocaleString()}
              </div>
            )}
            {agent.updated_at && (
              <div>
                <span className="font-medium">Updated:</span>
                <br />
                {new Date(agent.updated_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-8">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={() => onEdit?.(agent)}>
            Edit Agent
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDelete?.(agent.id)}
          >
            Delete Agent
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AgentDetailsModal;