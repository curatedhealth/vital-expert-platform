import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Agent {
  id: string;
  name: string;
  display_name?: string;
  description: string;
  business_function?: string;
  tier: number;
  capabilities: string[];
  rag_enabled: boolean;
  model: string;
  avatar?: string;
}

interface AgentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedAgents: Agent[];
  onSelectAgent: (agent: Agent) => void;
}

export function AgentSelectionModal({
  isOpen,
  onClose,
  suggestedAgents,
  onSelectAgent
}: AgentSelectionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select an Expert for Your Question</DialogTitle>
          <DialogDescription>
            Based on your query, these experts are best suited to help you:
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {suggestedAgents.map((agent, index) => (
            <Card
              key={agent.id}
              className="cursor-pointer hover:shadow-lg transition-all"
              onClick={() => {
                onSelectAgent(agent);
                onClose();
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{agent.display_name || agent.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {agent.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge>{agent.business_function}</Badge>
                      <Badge variant="outline">Match Score: {(100 - index * 10)}%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
