'use client';

import { useState } from 'react';
import { AgentsBoard } from '@/components/agents/agents-board';
import { AgentDetailsModal } from '@/components/agents/agent-details-modal';
import { type Agent } from '@/lib/stores/chat-store';

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <div className="space-y-6 p-6">
      <AgentsBoard
        onAgentSelect={setSelectedAgent}
        showCreateButton={true}
      />

      {selectedAgent && (
        <AgentDetailsModal
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}