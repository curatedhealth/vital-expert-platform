/**
 * Enhanced Agent Store Page v2.0
 * Premium agent browsing experience with modern UI/UX
 * 
 * Features:
 * - Animated hero header with stats
 * - Premium card designs with VITAL avatars
 * - Smooth animations and transitions
 * - Virtual scrolling for performance
 * - Enhanced filter panel
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AgentStoreHeader } from './agent-store-header';
import { AgentGridEnhanced } from './agent-grid-enhanced';
import { AgentCardEnhanced, type CardVariant } from './agent-card-enhanced';
import { AgentDetailModal } from './agent-detail-modal-v2';
import { AgentFilters } from './agent-filters';
import { useAgentStore, useFilteredAgents, useAgentLoading } from '../stores/agent-store';
import { agentApi } from '../services/agent-api';
import type { Agent } from '../types/agent.types';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Toaster, toast } from 'sonner';
import {
  Filter,
  SlidersHorizontal,
  X,
  Check,
  Sparkles,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type ViewMode = 'grid' | 'list' | 'kanban';

// ============================================================================
// FILTER PANEL COMPONENT
// ============================================================================

const FilterPanel: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const filters = useAgentStore((state) => state.filters);
  const resetFilters = useAgentStore((state) => state.resetFilters);
  
  // Count active filters
  const activeCount = React.useMemo(() => {
    let count = 0;
    if (filters.levels?.length) count += filters.levels.length;
    if (filters.functions?.length) count += filters.functions.length;
    if (filters.departments?.length) count += filters.departments.length;
    if (filters.roles?.length) count += filters.roles.length;
    if (filters.status && filters.status !== 'all') count++;
    return count;
  }, [filters]);
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Filter Agents
          </SheetTitle>
          <SheetDescription>
            Refine your search with advanced filters
          </SheetDescription>
        </SheetHeader>
        
        {/* Embedded filters */}
        <div className="space-y-6">
          <AgentFilters />
        </div>
        
        {/* Footer Actions */}
        {activeCount > 0 && (
          <div className="mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => {
                resetFilters();
                toast.success('Filters cleared');
              }}
              className="w-full gap-2"
            >
              <X className="w-4 h-4" />
              Clear all filters ({activeCount})
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AgentStoreEnhanced: React.FC = () => {
  // Local state
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [cardVariant, setCardVariant] = React.useState<CardVariant>('default');
  const [filterPanelOpen, setFilterPanelOpen] = React.useState(false);
  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [bookmarkedIds, setBookmarkedIds] = React.useState<Set<string>>(new Set());
  
  // Store selectors
  const setAgents = useAgentStore((state) => state.setAgents);
  const setLoading = useAgentStore((state) => state.setLoading);
  const setError = useAgentStore((state) => state.setError);
  const selectAgent = useAgentStore((state) => state.selectAgent);
  const selectedAgent = useAgentStore((state) => state.selectedAgent);
  const updateFilters = useAgentStore((state) => state.updateFilters);
  const resetFilters = useAgentStore((state) => state.resetFilters);
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
        toast.error('Failed to load agents');
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
      agentApi.clearCache();
      const agents = await agentApi.getAgents({ status: 'all' });
      setAgents(agents);
      toast.success('Agents refreshed');
    } catch (error) {
      console.error('Failed to refresh agents:', error);
      setError(error as Error);
      toast.error('Failed to refresh agents');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    updateFilters({ search: query });
  };

  // Handle agent selection
  const handleSelectAgent = (agent: Agent) => {
    selectAgent(agent);
    setDetailModalOpen(true);
  };

  // Handle bookmark
  const handleBookmark = (agent: Agent) => {
    setBookmarkedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(agent.id)) {
        newSet.delete(agent.id);
        toast.success(`Removed ${agent.name} from bookmarks`);
      } else {
        newSet.add(agent.id);
        toast.success(`Added ${agent.name} to bookmarks`);
      }
      return newSet;
    });
  };

  // Handle duplicate
  const handleDuplicate = (agent: Agent) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: `Duplicating ${agent.name}...`,
        success: `${agent.name} duplicated successfully`,
        error: 'Failed to duplicate agent',
      }
    );
  };

  // Handle add to chat
  const handleAddToChat = (agent: Agent) => {
    toast.success(`${agent.name} added to chat`, {
      description: 'You can now start a conversation with this agent',
      action: {
        label: 'Open Chat',
        onClick: () => console.log('Navigate to chat'),
      },
    });
  };

  // Handle create agent
  const handleCreateAgent = () => {
    toast.info('Agent creation wizard coming soon!', {
      icon: <Sparkles className="w-4 h-4" />,
    });
  };

  // Clear filters
  const handleClearFilters = () => {
    resetFilters();
    toast.success('All filters cleared');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          },
        }}
      />
      
      {/* Header */}
      <AgentStoreHeader
        onSearch={handleSearch}
        onViewModeChange={setViewMode}
        onFilterClick={() => setFilterPanelOpen(true)}
        onCreateClick={handleCreateAgent}
        onRefresh={handleRefresh}
        viewMode={viewMode}
        isLoading={loading}
      />
      
      {/* Card Size Selector (for grid view) */}
      {viewMode === 'grid' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10"
        >
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredAgents.length}</span> agents
            </p>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Card size:</span>
              <Select
                value={cardVariant}
                onValueChange={(value) => setCardVariant(value as CardVariant)}
              >
                <SelectTrigger className="w-32 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-6 h-full">
          <AnimatePresence mode="wait">
            {viewMode === 'grid' && (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <AgentGridEnhanced
                  agents={filteredAgents}
                  loading={loading}
                  cardVariant={cardVariant}
                  onSelectAgent={handleSelectAgent}
                  onDuplicateAgent={handleDuplicate}
                  onBookmarkAgent={handleBookmark}
                  onAddToChat={handleAddToChat}
                  bookmarkedIds={bookmarkedIds}
                  onClearFilters={handleClearFilters}
                  className="h-full"
                />
              </motion.div>
            )}
            
            {viewMode === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {filteredAgents.map((agent, index) => (
                  <AgentCardEnhanced
                    key={agent.id}
                    agent={agent}
                    variant="detailed"
                    onSelect={handleSelectAgent}
                    onDuplicate={handleDuplicate}
                    onBookmark={handleBookmark}
                    onAddToChat={handleAddToChat}
                    isBookmarked={bookmarkedIds.has(agent.id)}
                    animationDelay={index * 0.03}
                    className="max-w-4xl"
                  />
                ))}
              </motion.div>
            )}
            
            {viewMode === 'kanban' && (
              <motion.div
                key="kanban"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Kanban View Coming Soon</h3>
                  <p className="text-muted-foreground text-sm max-w-md">
                    Organize agents by status, level, or custom columns in an intuitive board view.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      {/* Filter Panel */}
      <FilterPanel
        open={filterPanelOpen}
        onOpenChange={setFilterPanelOpen}
      />
      
      {/* Agent Detail Modal */}
      <AgentDetailModal
        open={detailModalOpen}
        onOpenChange={(open) => {
          setDetailModalOpen(open);
          if (!open) {
            selectAgent(null);
          }
        }}
        onEdit={(agent) => {
          toast.info(`Editing ${agent.name}...`);
          setDetailModalOpen(false);
        }}
        onDuplicate={handleDuplicate}
        onBookmark={handleBookmark}
        onAddToChat={handleAddToChat}
      />
    </div>
  );
};

AgentStoreEnhanced.displayName = 'AgentStoreEnhanced';

// ============================================================================
// EXPORTS
// ============================================================================

export default AgentStoreEnhanced;


















