'use client';

import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface AgentPropertiesProps {
  data: any;
  onUpdate: (key: string, value: any) => void;
}

export function AgentProperties({ data, onUpdate }: AgentPropertiesProps) {
  const agent = data.agents?.[0];
  
  if (!agent) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center">
        No agent configured. Drag an agent from the Library to configure.
      </div>
    );
  }

  return (
    <>
      <Separator />
      <div className="space-y-2">
        <Label>Configured Agent</Label>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm font-medium">{agent.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{agent.agent_type}</p>
            {agent.framework && (
              <Badge variant="secondary" className="text-xs mt-2">
                {agent.framework}
              </Badge>
            )}
            {agent.specialty && (
              <p className="text-xs text-muted-foreground mt-2">{agent.specialty}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

