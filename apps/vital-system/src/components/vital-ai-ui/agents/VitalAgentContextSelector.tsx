'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Globe,
  Folder,
  Activity,
  Calendar,
  ChevronDown,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';

/**
 * Context types matching backend API
 */
export interface ContextRegion {
  id: string;
  code: string;
  name: string;
  country?: string;
}

export interface ContextDomain {
  id: string;
  code: string;
  name: string;
}

export interface ContextTherapeuticArea {
  id: string;
  code: string;
  name: string;
}

export interface ContextPhase {
  id: string;
  code: string;
  name: string;
  sequence_order: number;
}

export interface SelectedContext {
  regionId?: string;
  domainId?: string;
  therapeuticAreaId?: string;
  phaseId?: string;
}

interface ContextOption {
  id: string;
  code: string;
  name: string;
}

interface ContextSelectorProps {
  type: 'region' | 'domain' | 'therapeutic-area' | 'phase';
  options: ContextOption[];
  selectedId?: string;
  onSelect: (id: string | undefined) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

const contextIcons = {
  region: Globe,
  domain: Folder,
  'therapeutic-area': Activity,
  phase: Calendar,
};

const contextLabels = {
  region: 'Region',
  domain: 'Domain',
  'therapeutic-area': 'Therapeutic Area',
  phase: 'Phase',
};

/**
 * Single context selector dropdown
 */
function ContextSelector({
  type,
  options,
  selectedId,
  onSelect,
  isLoading = false,
  placeholder,
  className,
}: ContextSelectorProps) {
  const [open, setOpen] = useState(false);
  const Icon = contextIcons[type];
  const label = contextLabels[type];
  const selectedOption = options.find((o) => o.id === selectedId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between', className)}
          disabled={isLoading}
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : selectedOption ? (
              <span className="truncate">{selectedOption.name}</span>
            ) : (
              <span className="text-muted-foreground">
                {placeholder || `Select ${label}`}
              </span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
            <CommandGroup>
              {selectedId && (
                <CommandItem
                  onSelect={() => {
                    onSelect(undefined);
                    setOpen(false);
                  }}
                  className="text-muted-foreground"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear selection
                </CommandItem>
              )}
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.name}
                  onSelect={() => {
                    onSelect(option.id);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Checkbox
                      checked={selectedId === option.id}
                      className="pointer-events-none"
                    />
                    <span className="flex-1 truncate">{option.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {option.code}
                    </Badge>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface VitalAgentContextSelectorProps {
  regions?: ContextRegion[];
  domains?: ContextDomain[];
  therapeuticAreas?: ContextTherapeuticArea[];
  phases?: ContextPhase[];
  selectedContext: SelectedContext;
  onContextChange: (context: SelectedContext) => void;
  isLoading?: boolean;
  layout?: 'horizontal' | 'vertical' | 'grid';
  showLabels?: boolean;
  className?: string;
}

/**
 * VitalAgentContextSelector - Context selection for agent instantiation
 * 
 * Allows user to select:
 * - Regulatory Region (FDA, EMA, PMDA, etc.)
 * - Product Domain (Pharmaceuticals, Devices, etc.)
 * - Therapeutic Area (Oncology, Cardiology, etc.)
 * - Development Phase (Pre-IND, Phase I, NDA, etc.)
 * 
 * These selections are passed to POST /api/agents/sessions/instantiate
 * for context injection into the agent's system prompt.
 * 
 * Reference: AGENT_BACKEND_INTEGRATION_SPEC.md
 */
export function VitalAgentContextSelector({
  regions = [],
  domains = [],
  therapeuticAreas = [],
  phases = [],
  selectedContext,
  onContextChange,
  isLoading = false,
  layout = 'horizontal',
  showLabels = true,
  className,
}: VitalAgentContextSelectorProps) {
  const handleRegionChange = (id: string | undefined) => {
    onContextChange({ ...selectedContext, regionId: id });
  };

  const handleDomainChange = (id: string | undefined) => {
    onContextChange({ ...selectedContext, domainId: id });
  };

  const handleTAChange = (id: string | undefined) => {
    onContextChange({ ...selectedContext, therapeuticAreaId: id });
  };

  const handlePhaseChange = (id: string | undefined) => {
    onContextChange({ ...selectedContext, phaseId: id });
  };

  const clearAll = () => {
    onContextChange({});
  };

  const hasAnySelection =
    selectedContext.regionId ||
    selectedContext.domainId ||
    selectedContext.therapeuticAreaId ||
    selectedContext.phaseId;

  const containerClass = cn(
    layout === 'horizontal' && 'flex flex-wrap items-center gap-2',
    layout === 'vertical' && 'flex flex-col gap-2',
    layout === 'grid' && 'grid grid-cols-2 gap-2',
    className
  );

  return (
    <div className={containerClass}>
      {showLabels && layout !== 'horizontal' && (
        <div className="flex items-center justify-between col-span-2 mb-1">
          <span className="text-sm font-medium">Session Context</span>
          {hasAnySelection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-6 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear all
            </Button>
          )}
        </div>
      )}

      <ContextSelector
        type="region"
        options={regions}
        selectedId={selectedContext.regionId}
        onSelect={handleRegionChange}
        isLoading={isLoading}
        className={layout === 'horizontal' ? 'w-[180px]' : 'w-full'}
      />

      <ContextSelector
        type="domain"
        options={domains}
        selectedId={selectedContext.domainId}
        onSelect={handleDomainChange}
        isLoading={isLoading}
        className={layout === 'horizontal' ? 'w-[180px]' : 'w-full'}
      />

      <ContextSelector
        type="therapeutic-area"
        options={therapeuticAreas}
        selectedId={selectedContext.therapeuticAreaId}
        onSelect={handleTAChange}
        isLoading={isLoading}
        className={layout === 'horizontal' ? 'w-[200px]' : 'w-full'}
      />

      <ContextSelector
        type="phase"
        options={phases.sort((a, b) => a.sequence_order - b.sequence_order)}
        selectedId={selectedContext.phaseId}
        onSelect={handlePhaseChange}
        isLoading={isLoading}
        className={layout === 'horizontal' ? 'w-[160px]' : 'w-full'}
      />

      {layout === 'horizontal' && hasAnySelection && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="h-9"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * Compact version for use in chat header
 */
export function VitalAgentContextDisplay({
  selectedContext,
  regions = [],
  domains = [],
  therapeuticAreas = [],
  phases = [],
  onEdit,
  className,
}: {
  selectedContext: SelectedContext;
  regions?: ContextRegion[];
  domains?: ContextDomain[];
  therapeuticAreas?: ContextTherapeuticArea[];
  phases?: ContextPhase[];
  onEdit?: () => void;
  className?: string;
}) {
  const region = regions.find((r) => r.id === selectedContext.regionId);
  const domain = domains.find((d) => d.id === selectedContext.domainId);
  const ta = therapeuticAreas.find(
    (t) => t.id === selectedContext.therapeuticAreaId
  );
  const phase = phases.find((p) => p.id === selectedContext.phaseId);

  const hasContext = region || domain || ta || phase;

  if (!hasContext) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1.5 text-xs',
        className
      )}
    >
      {region && (
        <Badge variant="outline" className="gap-1 py-0">
          <Globe className="h-3 w-3" />
          {region.code}
        </Badge>
      )}
      {domain && (
        <Badge variant="outline" className="gap-1 py-0">
          <Folder className="h-3 w-3" />
          {domain.code}
        </Badge>
      )}
      {ta && (
        <Badge variant="outline" className="gap-1 py-0">
          <Activity className="h-3 w-3" />
          {ta.code}
        </Badge>
      )}
      {phase && (
        <Badge variant="outline" className="gap-1 py-0">
          <Calendar className="h-3 w-3" />
          {phase.code}
        </Badge>
      )}
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-5 px-1 text-xs"
        >
          Edit
        </Button>
      )}
    </div>
  );
}

export default VitalAgentContextSelector;
