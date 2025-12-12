'use client';

import {
  Plus,
  Heart,
  Edit,
  Copy,
  MoreVertical,
  Brain,
  Eye,
  Trash2,
  Upload,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef, useCallback, KeyboardEvent } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useHotkeys } from 'react-hotkeys-hook';

import { AgentAvatar } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent } from '@vital/ui';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@vital/ui';
import { EnhancedAgentCard, AgentCardGrid } from '@vital/ui';
import { Skeleton } from '@vital/ui';
import { DEPARTMENTS_BY_FUNCTION, ROLES_BY_DEPARTMENT } from '@/config/organizational-structure';
import { AgentCreator } from '@/features/chat/components/agent-creator';
import { AgentEditFormEnhanced } from './agent-edit-form-enhanced';
import { agentService } from '../services/agent-service';
import { useUserRole } from '@/hooks/useUserRole';
import type { AgentWithCategories } from '../services/agent-service';
import { useAgentsStore, type Agent } from '@/lib/stores/agents-store';
import { cn } from '@vital/ui/lib/utils';
import type { HealthcareBusinessFunction } from '@/types/healthcare-compliance';
import { useAgentComparison } from './agent-comparison-sidebar';

// Use shared organizational structure configuration
const staticDepartmentsByFunction = DEPARTMENTS_BY_FUNCTION;
const staticRolesByDepartment = ROLES_BY_DEPARTMENT;

// OLD definitions (replaced by shared config - keeping for reference only)
/*
const staticDepartmentsByFunction_OLD: Record<string, string[]> = {
  'Regulatory Affairs': ['Regulatory Strategy', 'Submissions & Filings', 'Compliance & Quality'],
  'regulatory-affairs': ['Regulatory Strategy', 'Submissions & Filings', 'Compliance & Quality'],
  'Regulatory': ['Regulatory Strategy', 'Submissions & Filings', 'Compliance & Quality'],

  'Clinical Development': ['Clinical Operations', 'Clinical Strategy', 'Medical Monitoring'],
  'clinical-development': ['Clinical Operations', 'Clinical Strategy', 'Medical Monitoring'],
  'Clinical': ['Clinical Operations', 'Clinical Strategy', 'Medical Monitoring'],

  'Market Access': ['Health Economics', 'Payer Relations', 'Market Strategy'],
  'market-access': ['Health Economics', 'Payer Relations', 'Market Strategy'],
  'Market': ['Health Economics', 'Payer Relations', 'Market Strategy'],

  'Information Technology': ['IT Operations', 'Software Development', 'Data Management'],
  'information-technology': ['IT Operations', 'Software Development', 'Data Management'],
  'IT': ['IT Operations', 'Software Development', 'Data Management'],

  'Business Development': ['Corporate Strategy', 'Partnerships', 'M&A'],
  'business-development': ['Corporate Strategy', 'Partnerships', 'M&A'],
  'Business': ['Corporate Strategy', 'Partnerships', 'M&A'],

  'Medical Affairs': ['Medical Information', 'Medical Communications', 'Medical Science Liaison'],
  'medical-affairs': ['Medical Information', 'Medical Communications', 'Medical Science Liaison'],
  'Medical': ['Medical Information', 'Medical Communications', 'Medical Science Liaison'],

  'Human Resources': ['Talent Acquisition', 'Learning & Development', 'Compensation & Benefits'],
  'human-resources': ['Talent Acquisition', 'Learning & Development', 'Compensation & Benefits'],
  'HR': ['Talent Acquisition', 'Learning & Development', 'Compensation & Benefits'],

  'Quality Assurance': ['Quality Management Systems', 'Quality Control', 'Compliance & Auditing'],
  'quality-assurance': ['Quality Management Systems', 'Quality Control', 'Compliance & Auditing'],
  'Quality': ['Quality Management Systems', 'Quality Control', 'Compliance & Auditing'],

  'Manufacturing': ['Production', 'Quality Control', 'Supply Chain'],
  'manufacturing': ['Production', 'Quality Control', 'Supply Chain'],

  'Finance': ['Financial Planning', 'Accounting', 'Treasury'],
  'finance': ['Financial Planning', 'Accounting', 'Treasury'],

  'Legal': ['Corporate Law', 'Compliance', 'Intellectual Property'],
  'legal': ['Corporate Law', 'Compliance', 'Intellectual Property'],

  'Marketing': ['Brand Management', 'Market Research', 'Communications'],
  'marketing': ['Brand Management', 'Market Research', 'Communications'],
};

// Static role mapping by function and department
// Support multiple function key variations for fuzzy matching
const qaDepartmentRoles = {
  'Quality Management Systems': ['QMS Architect', 'ISO 13485 Specialist', 'Design Controls Lead', 'Quality Systems Manager'],
  'Quality Control': ['Quality Analyst', 'Testing Specialist', 'Validation Engineer', 'QC Manager'],
  'Compliance & Auditing': ['Compliance Officer', 'Internal Auditor', 'Regulatory Compliance Specialist', 'Audit Manager'],
};

const regAffairsDepartmentRoles = {
  'Regulatory Strategy': ['Regulatory Strategist', 'Global Strategy Lead', 'Regulatory Project Manager'],
  'Submissions & Filings': ['Submission Specialist', '510(k) Expert', 'PMA Specialist', 'Filing Manager'],
  'Compliance & Quality': ['Compliance Specialist', 'Quality Compliance Lead', 'GCP Specialist'],
};

const clinicalDevDepartmentRoles = {
  'Clinical Operations': ['Clinical Operations Manager', 'CRA', 'Site Manager', 'Clinical Coordinator'],
  'Clinical Strategy': ['Clinical Strategist', 'Protocol Designer', 'Endpoint Specialist'],
  'Medical Monitoring': ['Medical Monitor', 'Safety Physician', 'Data Safety Manager'],
};

const marketAccessDepartmentRoles = {
  'Health Economics': ['Health Economist', 'HEOR Specialist', 'Outcomes Researcher'],
  'Payer Relations': ['Payer Strategy Lead', 'Contracting Specialist', 'Market Access Manager'],
  'Market Strategy': ['Market Strategist', 'Pricing Specialist', 'Launch Planning Lead'],
};

const medicalAffairsDepartmentRoles = {
  'Medical Information': ['Medical Information Specialist', 'Medical Writer', 'Scientific Communications'],
  'Medical Communications': ['Medical Communications Manager', 'Publication Specialist', 'Content Strategist'],
  'Medical Science Liaison': ['MSL', 'Field Medical Director', 'KOL Manager'],
};

const staticRolesByDepartment: Record<string, Record<string, string[]>> = {
  'Quality Assurance': qaDepartmentRoles,
  'quality-assurance': qaDepartmentRoles,
  'Quality': qaDepartmentRoles,

  'Regulatory Affairs': regAffairsDepartmentRoles,
  'regulatory-affairs': regAffairsDepartmentRoles,
  'Regulatory': regAffairsDepartmentRoles,

  'Clinical Development': clinicalDevDepartmentRoles,
  'clinical-development': clinicalDevDepartmentRoles,
  'Clinical': clinicalDevDepartmentRoles,

  'Market Access': marketAccessDepartmentRoles,
  'market-access': marketAccessDepartmentRoles,
  'Market': marketAccessDepartmentRoles,

  'Medical Affairs': medicalAffairsDepartmentRoles,
  'medical-affairs': medicalAffairsDepartmentRoles,
  'Medical': medicalAffairsDepartmentRoles,
};
*/

interface AgentFilters {
  selectedAgentLevel: string;
  selectedStatus: string;
  selectedBusinessFunction: string;
  selectedDepartment: string;
  selectedRole: string;
}

interface AgentsBoardProps {
  onAgentSelect?: (agent: Agent) => void;
  onAddToChat?: (agent: Agent) => void;
  showCreateButton?: boolean;
  hiddenControls?: boolean;
  // External state management for sidebar controls
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  filters?: AgentFilters;
  onFilterChange?: (filters: AgentFilters) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export function AgentsBoard({
  onAgentSelect,
  onAddToChat,
  showCreateButton = true,
  hiddenControls = false,
  // External props for sidebar control
  searchQuery: externalSearchQuery,
  onSearchChange: externalOnSearchChange,
  filters: externalFilters,
  onFilterChange: externalOnFilterChange,
  viewMode: externalViewMode,
  onViewModeChange: externalOnViewModeChange,
}: AgentsBoardProps) {
  const { agents, createCustomAgent, updateAgent, deleteAgent, loadAgents, isLoading } = useAgentsStore();
  const { canEditAgent, canDeleteAgent, isSuperAdmin } = useUserRole();

  // Agent comparison context - may not be available if not wrapped in provider
  const comparisonContext = useAgentComparison();
  const { addToComparison, removeFromComparison, isInComparison } = comparisonContext || {};

  // Handler for compare button
  const handleCompareAgent = useCallback((agent: Agent) => {
    if (!addToComparison || !removeFromComparison || !isInComparison) return;
    if (isInComparison(agent.id)) {
      removeFromComparison(agent.id);
    } else {
      // Cast to the expected Agent type from features/agents/types
      addToComparison(agent as unknown as Parameters<typeof addToComparison>[0]);
    }
  }, [addToComparison, removeFromComparison, isInComparison]);

  // Use external state if provided, otherwise use internal state
  const searchQuery = externalSearchQuery ?? '';
  const selectedAgentLevel = externalFilters?.selectedAgentLevel ?? 'all';
  const selectedStatus = externalFilters?.selectedStatus ?? 'all';
  const selectedBusinessFunction = externalFilters?.selectedBusinessFunction ?? 'all';
  const selectedDepartment = externalFilters?.selectedDepartment ?? 'all';
  const selectedRole = externalFilters?.selectedRole ?? 'all';
  const viewMode = externalViewMode ?? 'grid';
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [savedAgents, setSavedAgents] = useState<Set<string>>(new Set());
  const [dbBusinessFunctions, setDbBusinessFunctions] = useState<HealthcareBusinessFunction[]>([]);

  // Virtual scrolling refs and constants
  const parentRef = useRef<HTMLDivElement>(null);
  const COLUMNS = 3; // 3-column grid
  const CARD_HEIGHT = 280; // Approximate height of agent card in pixels
  const LIST_ITEM_HEIGHT = 80; // Approximate height of list item in pixels
  const GAP = 16; // Gap between items

  // Keyboard navigation state
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);

  // Helper function to get function name by ID
  const getFunctionName = (functionId?: string | null) => {
    if (!functionId) return null;
    const func = dbBusinessFunctions.find((f: any) => f.id === functionId);
    return func?.department_name || null;
  };

  // Load agents on component mount only if not already loaded
  useEffect(() => {
    console.log('AgentsBoard mounted, agents.length:', agents.length);
    if (agents.length === 0) {
      console.log('AgentsBoard: Loading agents for current tenant...');
      loadAgents(false).catch(err => {
        console.error('AgentsBoard: Failed to load agents:', err);
      });
    }
  }, []);

  // Load business functions from API (bypasses RLS)
  useEffect(() => {
    async function loadBusinessFunctions() {
      try {
        const response = await fetch('/api/organizational-structure');
        const result = await response.json();

        if (result.success && result.data) {
          const { functions } = result.data;
          console.log('[Agents Board] Loaded business functions:', functions?.length || 0);
          setDbBusinessFunctions(functions || []);
        } else {
          console.warn(
            '[Agents Board] Business functions unavailable, using empty list:',
            result?.error || 'Unknown error'
          );
          setDbBusinessFunctions([]);
        }
      } catch (error) {
        console.warn('[Agents Board] Error loading business functions, using empty list:', error);
        setDbBusinessFunctions([]);
      }
    }

    loadBusinessFunctions();
  }, []);

  const handleSaveToLibrary = (agentId: string) => {
    setSavedAgents(prev => {
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
    setShowEditModal(true);
  };

  const handleSaveAgent = async (updates: Partial<Agent>) => {
    if (!editingAgent) return;
    try {
      await agentService.updateAgent(editingAgent.id, updates);
      setShowEditModal(false);
      setEditingAgent(null);
      loadAgents(false);
    } catch (error) {
      console.error('Failed to save agent:', error);
      throw error;
    }
  };

  const handleDeleteAgent = (agent: Agent) => {
    // Super admin can delete any agent
    if (isSuperAdmin()) {
      if (confirm(`Are you sure you want to delete "${agent.display_name || agent.name}"? This action cannot be undone.`)) {
        deleteAgent(agent.id);
      }
      return;
    }

    // Regular users can only delete their own custom agents
    if (agent.is_custom) {
      if (confirm(`Are you sure you want to delete "${agent.display_name || agent.name}"? This action cannot be undone.`)) {
        deleteAgent(agent.id);
      }
    } else {
      alert('Default agents cannot be deleted. You can only delete custom agents.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['json', 'md', 'markdown'].includes(fileExtension || '')) {
      alert('Please upload a JSON or Markdown file.');
      return;
    }

    try {
      const content = await file.text();
      let agentData;

      if (fileExtension === 'json') {
        agentData = JSON.parse(content);
      } else {
        // Parse markdown file
        agentData = parseMarkdownToAgent(content);
      }

      // Validate required fields
      if (!agentData.name || !agentData.description) {
        alert('Invalid file format. Agent must have at least a name and description.');
        return;
      }

      // Create the agent with defaults for missing fields
      const newAgent: Agent = {
        id: `imported-${Date.now()}`,
        name: agentData.name,
        display_name: agentData.name,
        description: agentData.description,
        system_prompt: agentData.systemPrompt || agentData.prompt || 'You are a helpful AI assistant.',
        model: agentData.model || 'gpt-4',
        avatar: agentData.avatar || '🤖',
        color: agentData.color || 'text-trust-blue',
        capabilities: agentData.capabilities || [],
        rag_enabled: agentData.ragEnabled ?? true,
        temperature: agentData.temperature ?? 0.7,
        max_tokens: agentData.maxTokens ?? 2000,
        is_custom: true,
        status: 'active' as const,
        tier: 1,
        priority: 1,
        implementation_phase: 1,
        knowledge_domains: agentData.knowledgeDomains || [],
      };

      createCustomAgent(newAgent);
      setShowFileUpload(false);
      alert(`Successfully imported agent: ${newAgent.name}`);

    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file. Please check the file format and try again.');
    }

    // Reset file input
    event.target.value = '';
  };

  const parseMarkdownToAgent = (content: string) => {
    const lines = content.split('\n');
    const agent: Record<string, any> = {};
    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check for headers
      if (trimmedLine.startsWith('# ')) {
        agent.display_name = trimmedLine.substring(2).trim();
      } else       if (trimmedLine.startsWith('## Description')) {
        if (currentSection) {
          // eslint-disable-next-line security/detect-object-injection
          agent[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = 'description';
        currentContent = [];
      } else if (trimmedLine.startsWith('## System Prompt') || trimmedLine.startsWith('## Prompt')) {
        if (currentSection) {
          // eslint-disable-next-line security/detect-object-injection
          agent[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = 'systemPrompt';
        currentContent = [];
      } else if (trimmedLine.startsWith('## Capabilities')) {
        if (currentSection) {
          // eslint-disable-next-line security/detect-object-injection
          agent[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = 'capabilities';
        currentContent = [];
      } else if (trimmedLine.startsWith('- ') && currentSection === 'capabilities') {
        if (!agent.capabilities) agent.capabilities = [];
        agent.capabilities.push(trimmedLine.substring(2).trim());
      } else if (trimmedLine.startsWith('**Model:**') || trimmedLine.startsWith('Model:')) {
        agent.model = trimmedLine.split(':')[1]?.trim();
      } else if (trimmedLine.startsWith('**Temperature:**') || trimmedLine.startsWith('Temperature:')) {
        agent.temperature = parseFloat(trimmedLine.split(':')[1]?.trim() || '0.7');
      } else if (!trimmedLine.startsWith('#') && trimmedLine) {
        currentContent.push(line);
      }
    }

    // Add final section
    if (currentSection && currentContent.length > 0) {
      // eslint-disable-next-line security/detect-object-injection
      agent[currentSection] = currentContent.join('\n').trim();
    }

    return agent;
  };

  const getDomainColor = (domains: string[] = []) => {
    if (domains.length === 0) return 'bg-neutral-100 text-neutral-800';

    const primaryDomain = domains[0];
    const colors = {
      'digital-health': 'bg-trust-blue/10 text-trust-blue',
      'clinical-research': 'bg-progress-teal/10 text-progress-teal',
      'market-access': 'bg-market-purple/10 text-market-purple',
      'regulatory': 'bg-clinical-green/10 text-clinical-green',
      'quality-assurance': 'bg-amber-100 text-amber-800',
      'health-economics': 'bg-rose-100 text-rose-800',
    };
    return colors[primaryDomain as keyof typeof colors] || 'bg-neutral-100 text-neutral-800';
  };

  // Filter: search + business function + department + role + tier + status
  const filteredAgents = useMemo(() => {
    console.log('[Agents Board] Filtering:', {
      searchQuery,
      selectedFunction: selectedBusinessFunction,
      selectedDepartment,
      selectedRole,
      selectedAgentLevel,
      selectedStatus,
      totalAgents: agents.length,
      sampleAgent: agents[0] ? {
        name: agents[0].display_name,
        business_function: agents[0].business_function,
        department: agents[0].department,
        role: agents[0].role
      } : null
    });

    return agents.filter((agent: any) => {
      // Search filter
      const matchesSearch = !searchQuery ||
        agent.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Business function filter - match by name, not ID
      const matchesFunction = selectedBusinessFunction === 'all' ||
        agent.business_function === selectedBusinessFunction;

      // Department filter
      const matchesDepartment = selectedDepartment === 'all' ||
        agent.department === selectedDepartment;

      // Role filter
      const matchesRole = selectedRole === 'all' ||
        agent.role === selectedRole;

      // Agent Level filter
      const matchesAgentLevel = selectedAgentLevel === 'all' ||
        agent.agent_level === selectedAgentLevel ||
        agent.agent_level_name === selectedAgentLevel ||
        agent.level === selectedAgentLevel;

      // Status filter
      const matchesStatus = selectedStatus === 'all' ||
        agent.status === selectedStatus;

      return matchesSearch && matchesFunction && matchesDepartment && matchesRole && matchesAgentLevel && matchesStatus;
    });
  }, [agents, searchQuery, selectedBusinessFunction, selectedDepartment, selectedRole, selectedAgentLevel, selectedStatus]);

  // Calculate rows for grid view (3 columns)
  const gridRows = useMemo(() => {
    const rows: Agent[][] = [];
    for (let i = 0; i < filteredAgents.length; i += COLUMNS) {
      rows.push(filteredAgents.slice(i, i + COLUMNS));
    }
    return rows;
  }, [filteredAgents]);

  // Virtual scrolling for grid view (rows of 3)
  const gridVirtualizer = useVirtualizer({
    count: gridRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CARD_HEIGHT + GAP,
    overscan: 3, // Render 3 extra rows above/below viewport
  });

  // Virtual scrolling for list view
  const listVirtualizer = useVirtualizer({
    count: filteredAgents.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => LIST_ITEM_HEIGHT + GAP / 2,
    overscan: 5, // Render 5 extra items above/below viewport
  });

  // Reset focus when filters change
  useEffect(() => {
    setFocusedIndex(-1);
    setIsKeyboardNavigating(false);
  }, [filteredAgents.length, searchQuery, selectedBusinessFunction, selectedDepartment, selectedRole]);

  // Keyboard navigation handlers
  const handleKeyboardNavigation = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (filteredAgents.length === 0) return;

    setIsKeyboardNavigating(true);

    setFocusedIndex(prevIndex => {
      let newIndex = prevIndex;
      const maxIndex = filteredAgents.length - 1;

      if (prevIndex === -1) {
        // Start from first item
        return 0;
      }

      if (viewMode === 'grid') {
        // Grid navigation: 3 columns
        const currentRow = Math.floor(prevIndex / COLUMNS);
        const currentCol = prevIndex % COLUMNS;
        const totalRows = Math.ceil(filteredAgents.length / COLUMNS);

        switch (direction) {
          case 'up':
            if (currentRow > 0) {
              newIndex = prevIndex - COLUMNS;
            }
            break;
          case 'down':
            if (currentRow < totalRows - 1) {
              const targetIndex = prevIndex + COLUMNS;
              newIndex = Math.min(targetIndex, maxIndex);
            }
            break;
          case 'left':
            if (currentCol > 0) {
              newIndex = prevIndex - 1;
            }
            break;
          case 'right':
            if (currentCol < COLUMNS - 1 && prevIndex < maxIndex) {
              newIndex = prevIndex + 1;
            }
            break;
        }
      } else {
        // List navigation: single column
        switch (direction) {
          case 'up':
            if (prevIndex > 0) {
              newIndex = prevIndex - 1;
            }
            break;
          case 'down':
            if (prevIndex < maxIndex) {
              newIndex = prevIndex + 1;
            }
            break;
        }
      }

      return newIndex;
    });
  }, [filteredAgents.length, viewMode, COLUMNS]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && isKeyboardNavigating) {
      if (viewMode === 'grid') {
        const rowIndex = Math.floor(focusedIndex / COLUMNS);
        gridVirtualizer.scrollToIndex(rowIndex, { align: 'auto' });
      } else {
        listVirtualizer.scrollToIndex(focusedIndex, { align: 'auto' });
      }
    }
  }, [focusedIndex, viewMode, gridVirtualizer, listVirtualizer, isKeyboardNavigating, COLUMNS]);

  // Handle Enter key to select focused agent
  const handleSelectFocused = useCallback(() => {
    if (focusedIndex >= 0 && focusedIndex < filteredAgents.length) {
      const agent = filteredAgents[focusedIndex];
      onAgentSelect?.(agent);
    }
  }, [focusedIndex, filteredAgents, onAgentSelect]);

  // Handle Escape to clear focus
  const handleClearFocus = useCallback(() => {
    setFocusedIndex(-1);
    setIsKeyboardNavigating(false);
  }, []);

  // Register keyboard shortcuts using react-hotkeys-hook
  useHotkeys('up', (e) => {
    e.preventDefault();
    handleKeyboardNavigation('up');
  }, { enableOnFormTags: false }, [handleKeyboardNavigation]);

  useHotkeys('down', (e) => {
    e.preventDefault();
    handleKeyboardNavigation('down');
  }, { enableOnFormTags: false }, [handleKeyboardNavigation]);

  useHotkeys('left', (e) => {
    if (viewMode === 'grid') {
      e.preventDefault();
      handleKeyboardNavigation('left');
    }
  }, { enableOnFormTags: false }, [handleKeyboardNavigation, viewMode]);

  useHotkeys('right', (e) => {
    if (viewMode === 'grid') {
      e.preventDefault();
      handleKeyboardNavigation('right');
    }
  }, { enableOnFormTags: false }, [handleKeyboardNavigation, viewMode]);

  useHotkeys('enter', (e) => {
    if (focusedIndex >= 0) {
      e.preventDefault();
      handleSelectFocused();
    }
  }, { enableOnFormTags: false }, [focusedIndex, handleSelectFocused]);

  useHotkeys('escape', () => {
    handleClearFocus();
  }, { enableOnFormTags: false }, [handleClearFocus]);

  // Handle mouse interaction to clear keyboard navigation state
  const handleMouseEnter = useCallback(() => {
    setIsKeyboardNavigating(false);
  }, []);

  return (
    <div className="space-y-6">
      {!hiddenControls && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-deep-charcoal">AI Agents</h1>
              <p className="text-medical-gray">
                Discover, manage, and create specialized AI experts for your healthcare needs
              </p>
            </div>
            {showCreateButton && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-progress-teal hover:bg-progress-teal/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Agent
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditingAgent(null);
                      setShowCreateModal(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Agent
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      if (typeof document === 'undefined') {
                        console.warn('File upload is only available in the browser environment.');
                        return;
                      }
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.json,.md,.markdown';
                      input.onchange = (e) => handleFileUpload(e as unknown as React.ChangeEvent<HTMLInputElement>);
                      input.click();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload from File
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

        </>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-medical-gray">
          {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Skeleton Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-xl border bg-card p-4 space-y-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-12 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card p-4 flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-96" />
                  </div>
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Agents Grid/List with Virtual Scrolling */}
      {!isLoading && viewMode === 'grid' ? (
        <div
          ref={parentRef}
          className="h-[calc(100vh-320px)] overflow-auto"
          style={{ contain: 'strict' }}
          onMouseMove={handleMouseEnter}
        >
          <div
            style={{
              height: `${gridVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {gridVirtualizer.getVirtualItems().map((virtualRow) => {
              const rowAgents = gridRows[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 absolute left-0 right-0"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {rowAgents.map((agent, colIndex) => {
                    const agentCanEdit = canEditAgent(agent);
                    const agentCanDelete = canDeleteAgent(agent);
                    // Calculate flat index for focus comparison
                    const flatIndex = virtualRow.index * COLUMNS + colIndex;
                    const isFocused = isKeyboardNavigating && focusedIndex === flatIndex;

                    return (
                      <div
                        key={agent.id}
                        className={cn(
                          'transition-all duration-150',
                          isFocused && 'ring-2 ring-vital-primary-500 ring-offset-2 rounded-xl'
                        )}
                      >
                        <EnhancedAgentCard
                          agent={agent as any}
                          onClick={() => onAgentSelect?.(agent)}
                          onAddToChat={onAddToChat ? () => onAddToChat(agent) : undefined}
                          onDuplicate={() => handleDuplicateAgent(agent)}
                          onBookmark={() => handleSaveToLibrary(agent.id)}
                          onEdit={agentCanEdit ? () => handleEditAgent(agent) : undefined}
                          onDelete={agentCanDelete ? () => handleDeleteAgent(agent) : undefined}
                          onCompare={comparisonContext ? () => handleCompareAgent(agent) : undefined}
                          canEdit={agentCanEdit}
                          canDelete={agentCanDelete}
                          isBookmarked={savedAgents.has(agent.id)}
                          isInComparison={isInComparison?.(agent.id) ?? false}
                          showReasoning={false}
                          showTier={true}
                          showLevelName={true}
                          size="md"
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : !isLoading ? (
        <div
          ref={parentRef}
          className="h-[calc(100vh-320px)] overflow-auto"
          style={{ contain: 'strict' }}
          onMouseMove={handleMouseEnter}
        >
          <div
            style={{
              height: `${listVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
          {listVirtualizer.getVirtualItems().map((virtualItem) => {
              const agent = filteredAgents[virtualItem.index];
              const isFocused = isKeyboardNavigating && focusedIndex === virtualItem.index;
              return (
                <Card
                  key={virtualItem.key}
                  className={cn(
                    "hover:shadow-lg transition-all cursor-pointer group hover:bg-neutral-50 absolute left-0 right-0",
                    isFocused && "ring-2 ring-vital-primary-500 ring-offset-2 bg-vital-primary-50/50"
                  )}
                  style={{
                    height: `${virtualItem.size - GAP / 2}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  onClick={() => onAgentSelect?.(agent)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onAgentSelect?.(agent);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select agent ${agent.display_name}`}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <AgentAvatar avatar={agent.avatar} name={agent.display_name || agent.name} size="list" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-deep-charcoal group-hover:text-progress-teal transition-colors">
                          {agent.display_name}
                        </h3>
                        {agent.is_custom && (
                          <Badge variant="outline" className="text-xs">
                            Custom
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-medical-gray truncate">
                        {agent.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const functionName = getFunctionName(agent.function_id) ||
                                            agent.business_function?.replace(/_/g, ' ');
                        return functionName ? (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                            {functionName.toUpperCase()}
                          </Badge>
                        ) : null;
                      })()}
                      {agent.knowledge_domains && agent.knowledge_domains.length > 0 && (
                        <Badge className={cn('text-xs', getDomainColor(agent.knowledge_domains))}>
                          {agent.knowledge_domains[0]}
                        </Badge>
                      )}
                      {savedAgents.has(agent.id) && (
                        <Heart className="h-4 w-4 fill-current text-red-500" />
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onAgentSelect?.(agent);
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {onAddToChat && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              onAddToChat(agent);
                            }}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Add to Chat
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleEditAgent(agent);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateAgent(agent);
                          }}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleSaveToLibrary(agent.id);
                          }}>
                            <Heart className={cn(
                              'h-4 w-4 mr-2',
                              savedAgents.has(agent.id) && 'fill-current text-red-500'
                            )} />
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
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Empty State */}
      {!isLoading && filteredAgents.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="h-12 w-12 text-medical-gray mx-auto mb-4" />
            <h3 className="font-semibold text-deep-charcoal mb-2">
              No agents found
            </h3>
            <p className="text-medical-gray mb-4">
              Try adjusting your search terms or filters, or create a new agent.
            </p>
            {showCreateButton && (
              <Button
                onClick={() => {
                  setEditingAgent(null);
                  setShowCreateModal(true);
                }}
                className="bg-progress-teal hover:bg-progress-teal/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Agent
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Agent Creator Modal (for creating new agents) */}
      {showCreateModal && (
        <AgentCreator
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
          }}
          onSave={() => {
            setShowCreateModal(false);
            // Reload agents from database to show the newly created agent
            loadAgents(false);
          }}
          editingAgent={null}
        />
      )}

      {/* Enhanced Agent Edit Modal (for editing existing agents) */}
      <AgentEditFormEnhanced
        agent={editingAgent as any}
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) {
            setEditingAgent(null);
          }
        }}
        onSave={handleSaveAgent as any}
      />
    </div>
  );
}
