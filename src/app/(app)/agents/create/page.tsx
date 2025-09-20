'use client';

import { AgentCreator } from '@/components/chat/agent-creator';

export default function CreateAgentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Agent</h1>
        <p className="text-muted-foreground mt-2">
          Configure a new AI agent with specific capabilities and behavior.
        </p>
      </div>

      <AgentCreator
        isOpen={true}
        onClose={() => window.history.back()}
        onSave={() => {
          // Redirect to agents list after creation
          window.location.href = '/agents';
        }}
      />
    </div>
  );
}