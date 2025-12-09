'use client';

import { useState } from 'react';
import { cn } from '../lib/utils';
import {
  Wand2,
  ChevronRight,
  Settings,
  Clock,
  DollarSign,
  Sliders,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

export type MissionMode = 1 | 2 | 3 | 4;

export interface CustomMissionConfig {
  title: string;
  description: string;
  mode: MissionMode;
  budget: number;
  maxAgents: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  tags?: string[];
}

export interface VitalGenericTemplateOptionProps {
  /** Default configuration values */
  defaultConfig?: Partial<CustomMissionConfig>;
  /** Maximum budget allowed */
  maxBudget?: number;
  /** Available modes */
  availableModes?: MissionMode[];
  /** Whether to show advanced settings */
  showAdvanced?: boolean;
  /** Callback when mission created */
  onSubmit: (config: CustomMissionConfig) => void;
  /** Callback when cancelled */
  onCancel?: () => void;
  /** Custom class name */
  className?: string;
}

const modeDescriptions: Record<MissionMode, { label: string; description: string }> = {
  1: { label: 'Mode 1: Direct Expert', description: 'Single expert, immediate response' },
  2: { label: 'Mode 2: Expert Panel', description: 'Multiple experts, autonomous' },
  3: { label: 'Mode 3: Guided', description: 'Expert panel with checkpoints' },
  4: { label: 'Mode 4: Full Auto', description: 'Complex multi-step research' },
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-700' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-amber-100 text-amber-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
};

/**
 * VitalGenericTemplateOption - Custom Mission Creator
 * 
 * Fallback "Custom Mission" option for queries that don't fit standard templates.
 * Allows users to configure mission parameters manually.
 * 
 * @example
 * ```tsx
 * <VitalGenericTemplateOption
 *   defaultConfig={{ mode: 2, budget: 5 }}
 *   maxBudget={50}
 *   onSubmit={(config) => createCustomMission(config)}
 *   onCancel={() => closeModal()}
 * />
 * ```
 */
export function VitalGenericTemplateOption({
  defaultConfig,
  maxBudget = 100,
  availableModes = [1, 2, 3, 4],
  showAdvanced = true,
  onSubmit,
  onCancel,
  className,
}: VitalGenericTemplateOptionProps) {
  const [config, setConfig] = useState<CustomMissionConfig>({
    title: defaultConfig?.title || '',
    description: defaultConfig?.description || '',
    mode: defaultConfig?.mode || 2,
    budget: defaultConfig?.budget || 10,
    maxAgents: defaultConfig?.maxAgents || 5,
    priority: defaultConfig?.priority || 'normal',
    tags: defaultConfig?.tags || [],
  });

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const updateConfig = <K extends keyof CustomMissionConfig>(
    key: K,
    value: CustomMissionConfig[K]
  ) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !config.tags?.includes(tagInput.trim())) {
      updateConfig('tags', [...(config.tags || []), tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    updateConfig('tags', config.tags?.filter(t => t !== tag) || []);
  };

  const handleSubmit = () => {
    if (!config.title.trim() || !config.description.trim()) return;
    onSubmit(config);
  };

  const isValid = config.title.trim().length > 0 && config.description.trim().length > 0;

  // Estimate based on mode and budget
  const getEstimates = () => {
    const baseTime = { 1: 30, 2: 120, 3: 300, 4: 600 }[config.mode];
    const agentMultiplier = config.maxAgents / 5;
    const estimatedSeconds = baseTime * agentMultiplier;
    const minutes = Math.ceil(estimatedSeconds / 60);
    
    return {
      time: minutes < 60 ? `~${minutes} min` : `~${Math.round(minutes / 60)} hr`,
      cost: `$${(config.budget * 0.8).toFixed(2)} - $${config.budget.toFixed(2)}`,
    };
  };

  const estimates = getEstimates();

  return (
    <Card className={cn('w-full max-w-lg', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Wand2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Custom Mission</CardTitle>
            <CardDescription>
              Create a tailored mission for your specific needs
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Mission Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Drug Interaction Analysis for Patient X"
            value={config.title}
            onChange={(e) => updateConfig('title', e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe what you want to accomplish..."
            value={config.description}
            onChange={(e) => updateConfig('description', e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {/* Mode Selection */}
        <div className="space-y-2">
          <Label>Execution Mode</Label>
          <Select
            value={String(config.mode)}
            onValueChange={(v) => updateConfig('mode', Number(v) as MissionMode)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableModes.map((mode) => (
                <SelectItem key={mode} value={String(mode)}>
                  <div className="flex flex-col">
                    <span>{modeDescriptions[mode].label}</span>
                    <span className="text-xs text-muted-foreground">
                      {modeDescriptions[mode].description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Budget Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Budget Limit</Label>
            <span className="text-sm font-medium">${config.budget}</span>
          </div>
          <Slider
            value={[config.budget]}
            onValueChange={([v]) => updateConfig('budget', v)}
            max={maxBudget}
            min={1}
            step={1}
          />
          <p className="text-xs text-muted-foreground">
            Maximum cost for this mission
          </p>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label>Priority</Label>
          <div className="flex gap-2">
            {Object.entries(priorityConfig).map(([key, { label, color }]) => (
              <Button
                key={key}
                variant={config.priority === key ? 'default' : 'outline'}
                size="sm"
                className={cn(config.priority === key && color)}
                onClick={() => updateConfig('priority', key as CustomMissionConfig['priority'])}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags (optional)</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1"
            />
            <Button variant="outline" onClick={addTag}>
              Add
            </Button>
          </div>
          {config.tags && config.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {config.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            >
              <span className="flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                Advanced Settings
              </span>
              <ChevronRight className={cn(
                'h-4 w-4 transition-transform',
                showAdvancedSettings && 'rotate-90'
              )} />
            </Button>

            {showAdvancedSettings && (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Max Agents</Label>
                    <span className="text-sm font-medium">{config.maxAgents}</span>
                  </div>
                  <Slider
                    value={[config.maxAgents]}
                    onValueChange={([v]) => updateConfig('maxAgents', v)}
                    max={10}
                    min={1}
                    step={1}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estimates */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{estimates.time}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>{estimates.cost}</span>
          </div>
        </div>

        {/* Warning for high-complexity modes */}
        {config.mode >= 3 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p className="text-xs">
              Mode {config.mode} missions may take longer and require human checkpoints.
              Ensure your budget allows for extended processing.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {onCancel && (
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          className="flex-1"
          onClick={handleSubmit}
          disabled={!isValid}
        >
          Create Mission
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default VitalGenericTemplateOption;
