'use client';

import { Eye, MessageSquare, Edit, Copy, Heart, Trash2, MoreVertical, Brain } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

import { AgentAvatar } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent } from '@vital/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@vital/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@vital/ui';
import { useAgentsFilter } from '@/contexts/agents-filter-context';
import { AgentCreator } from '@/features/chat/components/agent-creator';
import { useAgentsStore, type Agent } from '@/lib/stores/agents-store';
import { cn } from '@vital/ui/lib/utils';

interface AgentsTableProps {
  onAgentSelect?: (agent: Agent) => void;
  onAddToChat?: (agent: Agent) => void;
}

export function AgentsTable({ onAgentSelect, onAddToChat }: AgentsTableProps) {
  const { agents, updateAgent, deleteAgent, createCustomAgent, loadAgents } = useAgentsStore();
  const { searchQuery, filters } = useAgentsFilter();
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [savedAgents, setSavedAgents] = useState<Set<string>>(new Set());

  useEffect(() => {
    console.log('AgentsTable mounted, agents.length:', agents.length);
    if (agents.length === 0) {
      console.log('AgentsTable: Loading agents for current tenant...');
      loadAgents(false).catch(err => {
        console.error('AgentsTable: Failed to load agents:', err);
      });
    }
  }, []);

  const handleSaveToLibrary = (agentId: string) => {
    setSavedAgents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  };

  const handleDuplicateAgent = (agent: Agent) => {
    const duplicatedAgent: Agent = {
      ...agent,
      id: `${agent.id}-copy-${Date.now()}`,
      display_name: `${agent.display_name} (Copy)`,
      is_custom: true,
    };
    createCustomAgent(duplicatedAgent);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setShowCreateModal(true);
  };

  const handleDeleteAgent = (agent: Agent) => {
    if (agent.is_custom) {
      if (
        confirm(
          `Are you sure you want to delete "${agent.display_name}"? This action cannot be undone.`
        )
      ) {
        deleteAgent(agent.id);
      }
    } else {
      alert('Default agents cannot be deleted. You can only delete custom agents.');
    }
  };

  // Filter agents based on search and filters
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        agent.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Business function filter
      const matchesFunction =
        filters.selectedBusinessFunction === 'all' ||
        agent.business_function === filters.selectedBusinessFunction;

      // Department filter
      const matchesDepartment =
        filters.selectedDepartment === 'all' || agent.department === filters.selectedDepartment;

      // Role filter
      const matchesRole = filters.selectedRole === 'all' || agent.role === filters.selectedRole;

      // Tier filter
      const matchesTier =
        filters.selectedAgentLevel === 'all' ||
        agent.agent_level === filters.selectedAgentLevel ||
        agent.agent_level_name === filters.selectedAgentLevel ||
        agent.level === filters.selectedAgentLevel;

      // Status filter
      const matchesStatus =
        filters.selectedStatus === 'all' || agent.status === filters.selectedStatus;

      return (
        matchesSearch &&
        matchesFunction &&
        matchesDepartment &&
        matchesRole &&
        matchesTier &&
        matchesStatus
      );
    });
  }, [agents, searchQuery, filters]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-medical-gray">
          {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Agent</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Business Function</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.map((agent) => (
                  <TableRow
                    key={agent.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => onAgentSelect?.(agent)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <AgentAvatar avatar={agent.avatar} name={agent.name} size="list" />
                        <div className="min-w-0">
                          <div className="font-semibold text-deep-charcoal truncate">
                            {agent.display_name}
                          </div>
                          <div className="text-sm text-medical-gray truncate max-w-[250px]">
                            {agent.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {agent.tier !== undefined && (
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs font-bold',
                            agent.tier === 1 &&
                              'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 border-purple-300',
                            agent.tier === 2 && 'bg-blue-50 text-blue-700 border-blue-200',
                            agent.tier === 3 && 'bg-green-50 text-green-700 border-green-200',
                            agent.tier === 4 && 'bg-orange-50 text-orange-700 border-orange-200',
                            agent.tier === 5 && 'bg-gray-50 text-gray-700 border-gray-200'
                          )}
                        >
                          L{agent.tier}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          'text-xs font-medium',
                          agent.status === 'active' &&
                            'bg-green-100 text-green-700 border-green-200',
                          agent.status === 'development' &&
                            'bg-blue-100 text-blue-700 border-blue-200',
                          agent.status === 'testing' &&
                            'bg-yellow-100 text-yellow-700 border-yellow-200',
                          agent.status === 'deprecated' && 'bg-red-100 text-red-700 border-red-200',
                          agent.status === 'inactive' && 'bg-gray-100 text-gray-600 border-gray-200'
                        )}
                      >
                        {agent.status === 'active'
                          ? 'Active'
                          : agent.status === 'development'
                            ? 'Dev'
                            : agent.status === 'testing'
                              ? 'Test'
                              : agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {agent.business_function ? (
                        <Badge
                          variant="outline"
                          className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200"
                        >
                          {agent.business_function.replace(/_/g, ' ')}
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Brain className="h-3 w-3" />
                        <span className="font-medium">{agent.model}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onAgentSelect?.(agent);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {onAddToChat && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToChat(agent);
                              }}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Add to Chat
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAgent(agent);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateAgent(agent);
                            }}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveToLibrary(agent.id);
                            }}
                          >
                            <Heart
                              className={cn(
                                'h-4 w-4 mr-2',
                                savedAgents.has(agent.id) && 'fill-current text-red-500'
                              )}
                            />
                            {savedAgents.has(agent.id) ? 'Remove from Library' : 'Save to Library'}
                          </DropdownMenuItem>
                          {agent.is_custom && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAgent(agent);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAgents.length === 0 && (
            <div className="p-12 text-center">
              <Brain className="h-12 w-12 text-medical-gray mx-auto mb-4" />
              <h3 className="font-semibold text-deep-charcoal mb-2">No agents found</h3>
              <p className="text-medical-gray">
                Try adjusting your search terms or filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent Creator Modal */}
      {showCreateModal && (
        <AgentCreator
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAgent(null);
          }}
          onSave={() => {
            setShowCreateModal(false);
            setEditingAgent(null);
            loadAgents(false);
          }}
          editingAgent={
            editingAgent
              ? {
                  ...editingAgent,
                  categories: [],
                }
              : null
          }
        />
      )}
    </div>
  );
}
