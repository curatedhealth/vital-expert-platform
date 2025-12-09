'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Sparkles, Zap, Brain, Clock } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description?: string;
  contextWindow: number;
  costPer1kTokens: number;
  speed: 'fast' | 'medium' | 'slow';
  capabilities: string[];
  isDefault?: boolean;
  isRecommended?: boolean;
}

interface VitalModelSelectorProps {
  models: ModelOption[];
  selectedModelId: string;
  onSelect: (modelId: string) => void;
  disabled?: boolean;
  showDetails?: boolean;
  className?: string;
}

const speedIcons = {
  fast: Zap,
  medium: Clock,
  slow: Brain,
};

const speedLabels = {
  fast: 'Fast',
  medium: 'Balanced',
  slow: 'Powerful',
};

/**
 * VitalModelSelector - Model and persona selector component
 * 
 * Allows users to select AI models with detailed information
 * about capabilities, cost, and performance.
 */
export function VitalModelSelector({
  models,
  selectedModelId,
  onSelect,
  disabled = false,
  showDetails = true,
  className
}: VitalModelSelectorProps) {
  const [open, setOpen] = useState(false);
  
  const selectedModel = models.find(m => m.id === selectedModelId);
  const SpeedIcon = selectedModel ? speedIcons[selectedModel.speed] : Zap;
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("justify-between min-w-[200px]", className)}
        >
          <div className="flex items-center gap-2">
            <SpeedIcon className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">
              {selectedModel?.name || "Select model..."}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {models.map((model) => {
                const Icon = speedIcons[model.speed];
                return (
                  <CommandItem
                    key={model.id}
                    value={model.id}
                    onSelect={() => {
                      onSelect(model.id);
                      setOpen(false);
                    }}
                    className="flex flex-col items-start gap-1 py-3"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {model.provider}
                      </span>
                      {model.isRecommended && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Recommended
                        </Badge>
                      )}
                      {model.id === selectedModelId && (
                        <Check className="h-4 w-4 ml-auto text-primary" />
                      )}
                    </div>
                    
                    {showDetails && (
                      <>
                        {model.description && (
                          <p className="text-xs text-muted-foreground pl-6">
                            {model.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 pl-6 text-xs text-muted-foreground">
                          <span>{(model.contextWindow / 1000).toFixed(0)}K context</span>
                          <span>•</span>
                          <span>${model.costPer1kTokens.toFixed(4)}/1K tokens</span>
                          <span>•</span>
                          <span>{speedLabels[model.speed]}</span>
                        </div>
                        {model.capabilities.length > 0 && (
                          <div className="flex flex-wrap gap-1 pl-6 mt-1">
                            {model.capabilities.slice(0, 3).map((cap) => (
                              <Badge 
                                key={cap} 
                                variant="outline" 
                                className="text-xs py-0"
                              >
                                {cap}
                              </Badge>
                            ))}
                            {model.capabilities.length > 3 && (
                              <Badge variant="outline" className="text-xs py-0">
                                +{model.capabilities.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default VitalModelSelector;
