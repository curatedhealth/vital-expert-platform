/**
 * ContextAssignmentTab - Tab for viewing and assigning agent context
 * 
 * Allows configuration of:
 * - Regions (FDA, EMA, PMDA, etc.)
 * - Domains (Pharmaceuticals, Devices, etc.)
 * - Therapeutic Areas (Oncology, Cardiology, etc.)
 * - Development Phases (Pre-IND, Phase I, NDA, etc.)
 * 
 * These are used for context injection when instantiating the agent.
 * 
 * Reference: AGENT_BACKEND_INTEGRATION_SPEC.md
 */

'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Globe,
  Folder,
  Activity,
  Calendar,
  Search,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Info,
  Plus,
  X,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  useAgentContext,
  type AllContextLookups,
} from '@/components/vital-ai-ui/agents/useAgentContext';
import type { Agent } from '../types/agent.types';

// ============================================================================
// TYPES
// ============================================================================

interface ContextAssignmentTabProps {
  agent: Agent;
  onContextChange?: (context: AgentContextAssignments) => void;
  currentAssignments?: AgentContextAssignments;
  isEditable?: boolean;
}

interface AgentContextAssignments {
  regionIds: string[];
  domainIds: string[];
  therapeuticAreaIds: string[];
  phaseIds: string[];
}

interface ContextItem {
  id: string;
  code: string;
  name: string;
  description?: string;
}

// ============================================================================
// CONTEXT SECTION COMPONENT
// ============================================================================

interface ContextSectionProps {
  title: string;
  icon: React.ReactNode;
  items: ContextItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  isEditable: boolean;
  defaultOpen?: boolean;
}

const ContextSection: React.FC<ContextSectionProps> = ({
  title,
  icon,
  items,
  selectedIds,
  onToggle,
  isEditable,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const [search, setSearch] = React.useState('');

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase())
  );

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="pb-2">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <CardTitle className="text-base flex items-center gap-2">
                {icon}
                {title}
                <Badge variant="secondary" className="ml-2">
                  {selectedIds.length}/{items.length}
                </Badge>
              </CardTitle>
              <Button variant="ghost" size="sm">
                {isOpen ? '−' : '+'}
              </Button>
            </div>
          </CollapsibleTrigger>

          {/* Selected items preview when collapsed */}
          {!isOpen && selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedItems.slice(0, 5).map((item) => (
                <Badge key={item.id} variant="outline" className="text-xs">
                  {item.code}
                </Badge>
              ))}
              {selectedItems.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{selectedItems.length - 5}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-2">
            {/* Search */}
            {items.length > 6 && (
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${title.toLowerCase()}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}

            {/* Items List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                
                return (
                  <div
                    key={item.id}
                    className={`
                      flex items-center gap-3 p-2 rounded-md transition-colors
                      ${isEditable ? 'cursor-pointer hover:bg-muted' : ''}
                      ${isSelected ? 'bg-primary/5' : ''}
                    `}
                    onClick={() => isEditable && onToggle(item.id)}
                  >
                    {isEditable && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggle(item.id)}
                        className="pointer-events-none"
                      />
                    )}
                    {!isEditable && isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{item.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.code}
                        </Badge>
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No items found
                </p>
              )}
            </div>

            {/* Quick actions */}
            {isEditable && items.length > 0 && (
              <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    items.forEach((item) => {
                      if (!selectedIds.includes(item.id)) {
                        onToggle(item.id);
                      }
                    });
                  }}
                  disabled={selectedIds.length === items.length}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    selectedIds.forEach((id) => onToggle(id));
                  }}
                  disabled={selectedIds.length === 0}
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ContextAssignmentTab: React.FC<ContextAssignmentTabProps> = ({
  agent,
  onContextChange,
  currentAssignments,
  isEditable = false,
}) => {
  const { regions, domains, therapeuticAreas, phases, isLoading, error, fetchLookups } =
    useAgentContext();

  // Initialize from props or empty
  const [assignments, setAssignments] = React.useState<AgentContextAssignments>(
    currentAssignments || {
      regionIds: [],
      domainIds: [],
      therapeuticAreaIds: [],
      phaseIds: [],
    }
  );

  // Handle toggle for each context type
  const handleToggle = (
    type: keyof AgentContextAssignments,
    id: string
  ) => {
    setAssignments((prev) => {
      const current = prev[type];
      const updated = current.includes(id)
        ? current.filter((i) => i !== id)
        : [...current, id];
      
      const newAssignments = { ...prev, [type]: updated };
      onContextChange?.(newAssignments);
      return newAssignments;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] gap-4">
        <p className="text-sm text-destructive">Failed to load context data</p>
        <Button variant="outline" size="sm" onClick={() => fetchLookups()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const totalAssigned =
    assignments.regionIds.length +
    assignments.domainIds.length +
    assignments.therapeuticAreaIds.length +
    assignments.phaseIds.length;

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-4">
        {/* Header Info */}
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Globe className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-green-900 dark:text-green-100">
                  Context Assignment
                </p>
                <p className="text-green-700 dark:text-green-300">
                  Configure which contexts this agent specializes in. When a user 
                  starts a session, they can select from the agent's assigned contexts
                  for personalized responses.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">
            Total context assignments:
          </span>
          <Badge variant={totalAssigned > 0 ? 'default' : 'secondary'}>
            {totalAssigned} assigned
          </Badge>
        </div>

        {/* Regions */}
        <ContextSection
          title="Regulatory Regions"
          icon={<Globe className="h-4 w-4 text-blue-500" />}
          items={regions.map((r) => ({
            id: r.id,
            code: r.code,
            name: r.name,
            description: (r as any).country,
          }))}
          selectedIds={assignments.regionIds}
          onToggle={(id) => handleToggle('regionIds', id)}
          isEditable={isEditable}
        />

        {/* Domains */}
        <ContextSection
          title="Product Domains"
          icon={<Folder className="h-4 w-4 text-purple-500" />}
          items={domains.map((d) => ({
            id: d.id,
            code: d.code,
            name: d.name,
          }))}
          selectedIds={assignments.domainIds}
          onToggle={(id) => handleToggle('domainIds', id)}
          isEditable={isEditable}
        />

        {/* Therapeutic Areas */}
        <ContextSection
          title="Therapeutic Areas"
          icon={<Activity className="h-4 w-4 text-red-500" />}
          items={therapeuticAreas.map((ta) => ({
            id: ta.id,
            code: ta.code,
            name: ta.name,
          }))}
          selectedIds={assignments.therapeuticAreaIds}
          onToggle={(id) => handleToggle('therapeuticAreaIds', id)}
          isEditable={isEditable}
          defaultOpen={false}
        />

        {/* Phases */}
        <ContextSection
          title="Development Phases"
          icon={<Calendar className="h-4 w-4 text-orange-500" />}
          items={phases
            .sort((a, b) => a.sequence_order - b.sequence_order)
            .map((p) => ({
              id: p.id,
              code: p.code,
              name: p.name,
            }))}
          selectedIds={assignments.phaseIds}
          onToggle={(id) => handleToggle('phaseIds', id)}
          isEditable={isEditable}
          defaultOpen={false}
        />

        {/* Usage hint */}
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>How context injection works:</strong>
                </p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>User selects this agent for a chat session</li>
                  <li>User chooses context (region, domain, etc.) from assigned options</li>
                  <li>Agent is instantiated with context-aware system prompt</li>
                  <li>Responses are tailored to the selected context</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

ContextAssignmentTab.displayName = 'ContextAssignmentTab';

export default ContextAssignmentTab;
