/**
 * Agent RAG Assignments Component
 * Shows and manages RAG databases assigned to a specific agent
 */

'use client';

import { Settings, Star, Database, FileText, Calendar, Trash2, Edit } from 'lucide-react';
import React, { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Slider } from '@/shared/components/ui';

import { RagContextModal } from './RagContextModal';

interface AgentRagAssignment {
  id: string;
  name: string;
  display_name: string;
  description: string;
  purpose_description: string;
  rag_type: 'global' | 'agent_specific';
  knowledge_domains: string[];
  document_count: number;
  is_assigned?: boolean;
  assignment_priority?: number;
  usage_context?: string;
  is_primary?: boolean;
  last_used_at?: string;
  custom_prompt_instructions?: string;
}

interface AgentRagAssignmentsProps {
  agentName: string;
  agentDisplayName: string;
  assignedRagDatabases: AgentRagAssignment[];
  onUnassignRag: (ragId: string) => void;
  onUpdatePriority: (ragId: string, priority: number) => void;
}

export const AgentRagAssignments: React.FC<AgentRagAssignmentsProps> = ({
  agentName,
  agentDisplayName,
  assignedRagDatabases,
  onUnassignRag,
  onUpdatePriority
}) => {
  const [selectedRag, setSelectedRag] = useState<AgentRagAssignment | null>(null);
  const [showContextModal, setShowContextModal] = useState(false);

    setSelectedRag(rag);
    setShowContextModal(true);
  };

    usage_context: string;
    custom_prompt_instructions: string;
    is_primary: boolean;
  }) => {
    // // In a real implementation, this would update the database
    setShowContextModal(false);
  };

    if (priority >= 80) return { label: 'High', color: 'destructive' };
    if (priority >= 60) return { label: 'Medium', color: 'default' };
    return { label: 'Low', color: 'secondary' };
  };

    if (!lastUsed) return 'Never used';
    return new Date(lastUsed).toLocaleDateString();
  };

  if (assignedRagDatabases.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Database className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No RAG Databases Assigned</h3>
          <p className="text-muted-foreground text-center mb-4">
            {agentDisplayName} doesn't have any RAG knowledge bases assigned yet.
          </p>
          <p className="text-sm text-muted-foreground text-center">
            Go to the "Assign RAG" tab to connect global or agent-specific knowledge bases.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            RAG Configuration for {agentDisplayName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-foreground">Total RAG Databases</div>
              <div className="text-2xl font-bold text-primary">{assignedRagDatabases.length}</div>
            </div>
            <div>
              <div className="font-medium text-foreground">Primary RAG</div>
              <div className="text-2xl font-bold text-primary">
                {assignedRagDatabases.filter(rag => rag.is_primary).length}
              </div>
            </div>
            <div>
              <div className="font-medium text-foreground">Global RAG</div>
              <div className="text-2xl font-bold text-blue-600">
                {assignedRagDatabases.filter(rag => rag.rag_type === 'global').length}
              </div>
            </div>
            <div>
              <div className="font-medium text-foreground">Agent-Specific</div>
              <div className="text-2xl font-bold text-green-600">
                {assignedRagDatabases.filter(rag => rag.rag_type === 'agent_specific').length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned RAG Databases */}
      <div className="grid gap-4 lg:grid-cols-2">
        {assignedRagDatabases.map((rag) => {

          return (
            <Card key={rag.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{rag.display_name}</span>
                    {rag.is_primary && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={rag.rag_type === 'global' ? 'secondary' : 'default'}
                      className="text-xs"
                    >
                      {rag.rag_type === 'global' ? 'Global' : 'Agent-Specific'}
                    </Badge>
                    <Badge variant={priorityInfo.color as unknown} className="text-xs">
                      {priorityInfo.label} Priority
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Description */}
                <div>
                  <h4 className="font-medium text-sm mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{rag.description}</p>
                </div>

                {/* Purpose */}
                <div>
                  <h4 className="font-medium text-sm mb-1">Usage Purpose</h4>
                  <p className="text-sm text-muted-foreground">{rag.purpose_description}</p>
                </div>

                {/* Usage Context */}
                {rag.usage_context && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Usage Context</h4>
                    <p className="text-sm text-muted-foreground">{rag.usage_context}</p>
                  </div>
                )}

                {/* Custom Instructions */}
                {rag.custom_prompt_instructions && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Custom Instructions</h4>
                    <p className="text-sm text-muted-foreground font-mono bg-muted/50 p-2 rounded">
                      {rag.custom_prompt_instructions}
                    </p>
                  </div>
                )}

                {/* Priority Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">Priority Level</h4>
                    <span className="text-sm font-medium">{rag.assignment_priority || 50}</span>
                  </div>
                  <Slider
                    value={[rag.assignment_priority || 50]}
                    onValueChange={([value]: number[]) => onUpdatePriority(rag.id, value)}
                    max={100}
                    min={1}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>{rag.document_count.toLocaleString()} docs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatLastUsed(rag.last_used_at)}</span>
                  </div>
                </div>

                {/* Knowledge Domains */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Knowledge Domains</h4>
                  <div className="flex flex-wrap gap-1">
                    {rag.knowledge_domains.slice(0, 4).map((domain) => (
                      <Badge key={domain} variant="outline" className="text-xs">
                        {domain}
                      </Badge>
                    ))}
                    {rag.knowledge_domains.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{rag.knowledge_domains.length - 4}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConfigureRag(rag)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Configure
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUnassignRag(rag.id)}
                    className="flex items-center gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                    Unassign
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Context Configuration Modal */}
      <RagContextModal
        isOpen={showContextModal}
        onClose={() => setShowContextModal(false)}
        onSave={handleSaveContext}
        rag={selectedRag}
        agentName={agentName}
      />
    </div>
  );
};