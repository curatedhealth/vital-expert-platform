/**
 * RAG Management Component
 * Manages global and agent-specific RAG knowledge bases
 */

'use client';

import { Database, Brain, Settings, BarChart3, Plus } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle, Button, Tabs, TabsContent, TabsList, TabsTrigger, Badge } from '@/shared/components/ui';
import { RagKnowledgeBase } from '@/shared/services/rag/RagService';

import { AgentRagAssignments } from './AgentRagAssignments';
import { CreateRagModal } from './CreateRagModal';
import { RagAnalytics } from './RagAnalytics';
import { RagKnowledgeBaseSelector } from './RagKnowledgeBaseSelector';

interface RagManagementProps {
  agentId?: string;
  agentName?: string;
  agentDisplayName?: string;
}

export const RagManagement: React.FC<RagManagementProps> = ({
  agentId,
  agentName = 'fda-regulatory-strategist',
  agentDisplayName = 'FDA Regulatory Strategist'
}) => {
  const [globalRagDatabases, setGlobalRagDatabases] = useState<RagKnowledgeBase[]>([]);
  const [agentRagDatabases, setAgentRagDatabases] = useState<RagKnowledgeBase[]>([]);
  const [availableRagDatabases, setAvailableRagDatabases] = useState<RagKnowledgeBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalType, setCreateModalType] = useState<'global' | 'agent_specific'>('global');

  // Load RAG databases
  useEffect(() => {
    loadRagData();
  }, [agentName]);

    setIsLoading(true);
    try {
      // In a real implementation, these would be API calls
      await Promise.all([
        loadGlobalRagDatabases(),
        loadAgentRagDatabases(),
        loadAvailableRagDatabases()
      ]);
    } catch (error) {
      // console.error('❌ Failed to load RAG data:', error);
    } finally {
      setIsLoading(false);
    }
  };

    // Simulate loading global RAG databases
    const mockGlobalRag: RagKnowledgeBase[] = [
      {
        id: '1',
        name: 'fda-guidance-library',
        display_name: 'FDA Guidance Library',
        description: 'Comprehensive collection of FDA guidance documents, regulations, and compliance materials',
        purpose_description: 'Use for regulatory compliance questions, FDA guidance interpretation, and submission requirements',
        rag_type: 'global',
        knowledge_domains: ['regulatory', 'fda', 'compliance'],
        document_count: 1247,
        total_chunks: 45231,
        quality_score: 0.94
      },
      {
        id: '2',
        name: 'clinical-trial-protocols',
        display_name: 'Clinical Trial Protocols Database',
        description: 'Curated database of successful clinical trial protocols and methodologies',
        purpose_description: 'Use for clinical trial design, protocol development, and methodology guidance',
        rag_type: 'global',
        knowledge_domains: ['clinical_trials', 'research', 'protocols'],
        document_count: 892,
        total_chunks: 34567,
        quality_score: 0.91
      },
      {
        id: '3',
        name: 'pharmacovigilance-guidelines',
        display_name: 'Pharmacovigilance Guidelines',
        description: 'Global pharmacovigilance guidelines, safety protocols, and adverse event reporting standards',
        purpose_description: 'Use for safety assessments, adverse event analysis, and pharmacovigilance compliance',
        rag_type: 'global',
        knowledge_domains: ['safety', 'pharmacovigilance', 'adverse_events'],
        document_count: 634,
        total_chunks: 22145,
        quality_score: 0.89
      }
    ];
    setGlobalRagDatabases(mockGlobalRag);
  };

    // Simulate loading agent-specific RAG assignments
    const mockAgentRag: RagKnowledgeBase[] = [
      {
        id: '4',
        name: 'fda-regulatory-specialist-knowledge',
        display_name: 'FDA Regulatory Specialist Knowledge',
        description: 'Specialized knowledge base for FDA regulatory strategy and submission optimization',
        purpose_description: 'Use for complex regulatory strategy decisions, submission planning, and FDA interaction guidance',
        rag_type: 'agent_specific',
        knowledge_domains: ['regulatory_strategy', 'fda_submissions', 'regulatory_science'],
        document_count: 234,
        total_chunks: 8921,
        quality_score: 0.96,
        is_assigned: true,
        assignment_priority: 95
      }
    ];
    setAgentRagDatabases(mockAgentRag);
  };

    // Simulate loading available RAG databases for assignment
    const mockAvailable: RagKnowledgeBase[] = [
      ...globalRagDatabases,
      {
        id: '5',
        name: 'medical-device-regulations',
        display_name: 'Medical Device Regulations',
        description: 'Comprehensive medical device regulatory framework and classification guides',
        purpose_description: 'Use for medical device classification, 510(k) guidance, and device-specific regulations',
        rag_type: 'global',
        knowledge_domains: ['medical_devices', 'classification', '510k'],
        document_count: 456,
        total_chunks: 16789,
        quality_score: 0.87,
        is_assigned: false
      }
    ];
    setAvailableRagDatabases(mockAvailable);
  };

    setCreateModalType(type);
    setShowCreateModal(true);
  };

    if (newRag.rag_type === 'global') {
      setGlobalRagDatabases(prev => [...prev, newRag]);
    } else {
      setAgentRagDatabases(prev => [...prev, newRag]);
    }
    setShowCreateModal(false);
  };

    try {
      // In a real implementation, this would be an API call
      // // Update local state

      if (ragToAssign) {

          ...ragToAssign,
          is_assigned: true,
          assignment_priority: priority
        };
        setAgentRagDatabases(prev => [...prev, assignedRag]);
        setAvailableRagDatabases(prev =>
          prev.map(rag =>
            rag.id === ragId
              ? { ...rag, is_assigned: true, assignment_priority: priority }
              : rag
          )
        );
      }
    } catch (error) {
      // console.error('❌ Failed to assign RAG:', error);
    }
  };

    try {
      // In a real implementation, this would be an API call
      // // Update local state
      setAgentRagDatabases(prev => prev.filter(rag => rag.id !== ragId));
      setAvailableRagDatabases(prev =>
        prev.map(rag =>
          rag.id === ragId
            ? { ...rag, is_assigned: false, assignment_priority: 0 }
            : rag
        )
      );
    } catch (error) {
      // console.error('❌ Failed to unassign RAG:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Database className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading RAG knowledge bases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6" />
            RAG Knowledge Management
          </h1>
          <p className="text-muted-foreground">
            Manage global and agent-specific knowledge bases for {agentDisplayName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleCreateRag('global')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Global RAG
          </Button>
          <Button
            onClick={() => handleCreateRag('agent_specific')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Agent RAG
          </Button>
        </div>
      </div>

      <Tabs defaultValue="agent-assigned" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agent-assigned" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Agent RAG ({agentRagDatabases.length})
          </TabsTrigger>
          <TabsTrigger value="global-available" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Global RAG ({globalRagDatabases.length})
          </TabsTrigger>
          <TabsTrigger value="assign-rag" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Assign RAG
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Agent-Assigned RAG */}
        <TabsContent value="agent-assigned">
          <AgentRagAssignments
            agentName={agentName}
            agentDisplayName={agentDisplayName}
            assignedRagDatabases={agentRagDatabases}
            onUnassignRag={handleUnassignRag}
            onUpdatePriority={(ragId, priority) => {
              setAgentRagDatabases(prev =>
                prev.map(rag =>
                  rag.id === ragId
                    ? { ...rag, assignment_priority: priority }
                    : rag
                )
              );
            }}
          />
        </TabsContent>

        {/* Global RAG Databases */}
        <TabsContent value="global-available">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {globalRagDatabases.map((rag) => (
              <Card key={rag.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-base">{rag.display_name}</span>
                    <Badge variant="secondary">Global</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {rag.description}
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Documents:</span>
                      <span className="font-medium">{rag.document_count.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chunks:</span>
                      <span className="font-medium">{(rag.total_chunks || 0).toLocaleString()}</span>
                    </div>
                    {rag.quality_score && (
                      <div className="flex justify-between">
                        <span>Quality:</span>
                        <Badge variant="outline" className="text-xs">
                          {(rag.quality_score * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {rag.knowledge_domains.slice(0, 3).map((domain) => (
                      <Badge key={domain} variant="outline" className="text-xs">
                        {domain}
                      </Badge>
                    ))}
                    {rag.knowledge_domains.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{rag.knowledge_domains.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* RAG Assignment */}
        <TabsContent value="assign-rag">
          <RagKnowledgeBaseSelector
            availableRagDatabases={availableRagDatabases}
            onAssignRag={handleAssignRag}
            agentName={agentName}
          />
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <RagAnalytics
            agentName={agentName}
            assignedRagDatabases={agentRagDatabases}
          />
        </TabsContent>
      </Tabs>

      {/* Create RAG Modal */}
      <CreateRagModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onRagCreated={handleRagCreated}
        ragType={createModalType}
        agentId={agentId}
        agentName={agentName}
      />
    </div>
  );
};