/**
 * Agent Store Example
 * Demonstrates Phase 1 component integration
 *
 * This is a reference implementation showing how all components work together
 * Copy this pattern to create your actual agent pages
 */

'use client';

import * as React from 'react';
import { AgentSearch } from './agent-search';
import { AgentFilters } from './agent-filters';
import { AgentGrid } from './agent-grid';
import { AgentDetailModal } from './agent-detail-modal-v2';
import { AgentEditForm } from './agent-edit-form';
import { useAgentStore, useFilteredAgents, useAgentLoading } from '../stores/agent-store';
import { agentApi } from '../services/agent-api';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, RefreshCw } from 'lucide-react';
import type { Agent } from '../types/agent.types';

// ============================================================================
// AGENT STORE EXAMPLE PAGE
// ============================================================================

export const AgentStoreExample: React.FC = () => {
  const [cardSize, setCardSize] = React.useState<'compact' | 'comfortable' | 'detailed'>('comfortable');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editingAgent, setEditingAgent] = React.useState<Agent | null>(null);

  // Zustand store selectors
  const setAgents = useAgentStore((state) => state.setAgents);
  const setLoading = useAgentStore((state) => state.setLoading);
  const setError = useAgentStore((state) => state.setError);
  const selectAgent = useAgentStore((state) => state.selectAgent);
  const selectedAgent = useAgentStore((state) => state.selectedAgent);
  const filteredAgents = useFilteredAgents();
  const loading = useAgentLoading();

  // Fetch agents on mount
  React.useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const agents = await agentApi.getAgents({ status: 'all' });
        setAgents(agents);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [setAgents, setLoading, setError]);

  // Refresh agents
  const handleRefresh = async () => {
    setLoading(true);
    try {
      agentApi.clearCache(); // Clear cache for fresh data
      const agents = await agentApi.getAgents({ status: 'all' });
      setAgents(agents);
    } catch (error) {
      console.error('Failed to refresh agents:', error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  // Handle agent edit
  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setEditModalOpen(true);
    setModalOpen(false); // Close detail modal
  };

  // Handle save agent
  const handleSaveAgent = async (agentData: Partial<Agent>) => {
    try {
      // TODO: Call API to update agent
      console.log('Saving agent:', agentData);

      // For now, just close the modal and refresh
      setEditModalOpen(false);
      setEditingAgent(null);
      await handleRefresh();
    } catch (error) {
      console.error('Failed to save agent:', error);
      throw error;
    }
  };

  // Handle duplicate agent
  const handleDuplicateAgent = async (agent: Agent) => {
    try {
      // TODO: Call API to duplicate agent
      console.log('Duplicating agent:', agent.name);
      // For now, just log and show feedback
      alert(`Duplicating agent: ${agent.display_name || agent.name}`);
    } catch (error) {
      console.error('Failed to duplicate agent:', error);
    }
  };

  // Handle bookmark agent
  const handleBookmarkAgent = async (agent: Agent) => {
    try {
      // TODO: Call API to bookmark agent
      console.log('Bookmarking agent:', agent.name);
      // For now, just log and show feedback
      alert(`Bookmarked agent: ${agent.display_name || agent.name}`);
    } catch (error) {
      console.error('Failed to bookmark agent:', error);
    }
  };

  // Handle add to chat
  const handleAddToChat = async (agent: Agent) => {
    try {
      // TODO: Call API to add agent to chat
      console.log('Adding agent to chat:', agent.name);
      // For now, just log and show feedback
      alert(`Added ${agent.display_name || agent.name} to chat`);
    } catch (error) {
      console.error('Failed to add agent to chat:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold">Agent Store</h1>
            <p className="text-sm text-muted-foreground">
              Browse and discover {filteredAgents.length} agents
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center gap-4 py-3">
          {/* Search */}
          <AgentSearch
            placeholder="Search agents by name, function, department..."
            showResultsCount
            className="flex-1 max-w-md"
          />

          {/* Filters */}
          <AgentFilters />

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              variant={cardSize === 'compact' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setCardSize('compact')}
              className="h-7 px-2"
            >
              Compact
            </Button>
            <Button
              variant={cardSize === 'comfortable' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setCardSize('comfortable')}
              className="h-7 px-2"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={cardSize === 'detailed' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setCardSize('detailed')}
              className="h-7 px-2"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="flex-1 overflow-hidden">
        <AgentGrid
          agents={filteredAgents}
          loading={loading}
          cardSize={cardSize}
          onSelectAgent={(agent) => {
            selectAgent(agent);
            setModalOpen(true);
          }}
          showMetadata
          showSpawning
          className="h-full"
        />
      </div>

      {/* Agent Detail Modal */}
      <AgentDetailModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            selectAgent(null);
          }
        }}
        onEdit={handleEditAgent}
        onDuplicate={handleDuplicateAgent}
        onBookmark={handleBookmarkAgent}
        onAddToChat={handleAddToChat}
      />

      {/* Agent Edit Form */}
      <AgentEditForm
        agent={editingAgent}
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) {
            setEditingAgent(null);
          }
        }}
        onSave={handleSaveAgent}
      />
    </div>
  );
};

AgentStoreExample.displayName = 'AgentStoreExample';

// ============================================================================
// EXPORTS
// ============================================================================

export default AgentStoreExample;
