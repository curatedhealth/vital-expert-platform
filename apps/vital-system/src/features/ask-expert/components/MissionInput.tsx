'use client';

/**
 * MissionInput - Advanced Mission Configuration Component
 *
 * Provides a rich input experience for Mode 3 and Mode 4 autonomous research.
 * Replaces the sidebar-based mission input with an in-page component.
 *
 * Features:
 * - Research goal textarea with examples
 * - Mission template selection (always visible, 20+ templates)
 * - Advanced configuration options (collapsible)
 * - Expert display (Mode 3) or auto-selection indicator (Mode 4)
 *
 * Updated: December 12, 2025 - Added comprehensive mission templates
 */

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Target,
  Sparkles,
  Play,
  ChevronDown,
  ChevronUp,
  Settings2,
  FileSearch,
  Globe,
  Brain,
  Shield,
  Lightbulb,
  User,
  Users,
  BookOpen,
  BarChart3,
  Search,
  FileText,
  Eye,
  Zap,
  Loader2,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Import comprehensive mission templates
import { DEFAULT_MISSION_TEMPLATES, type MissionFamily } from '../types/mission-runners';

export interface MissionConfig {
  enableRag: boolean;
  enableWebSearch: boolean;
  maxIterations: number;
  hitlEnabled: boolean;
  templateId: string;
}

export interface SelectedExpert {
  id: string;
  name: string;
  level: string;
  specialty: string;
}

export interface MissionInputProps {
  /** Is this auto-select mode (Mode 4) or manual (Mode 3) */
  autoSelect: boolean;
  /** Currently selected expert (Mode 3 only - optional with mission-first flow) */
  selectedExpert?: SelectedExpert | null;
  /** Selected mission family (Mode 3 mission-first flow) */
  selectedMissionFamily?: MissionFamily | null;
  /** Callback when mission should start */
  onStartMission: (goal: string, config: MissionConfig) => void;
  /** Callback to enhance the research goal with AI */
  onEnhance?: (goal: string) => Promise<string>;
  /** Whether a mission is currently running */
  isRunning?: boolean;
  /** Custom class name */
  className?: string;
}

// Example research goals to inspire users
const EXAMPLE_GOALS = [
  'Analyze the competitive landscape for GLP-1 agonists in Type 2 diabetes',
  'Review FDA guidance on adaptive trial designs for oncology',
  'Compare real-world evidence for biosimilar adoption rates across markets',
  'Synthesize HTA submission requirements for EU5 markets',
];

// Mission family display info
const FAMILY_INFO: Record<MissionFamily, { label: string; icon: typeof BookOpen }> = {
  DEEP_RESEARCH: { label: '🔬 Deep Research', icon: Search },
  EVALUATION: { label: '⚖️ Evaluation', icon: BarChart3 },
  INVESTIGATION: { label: '🔍 Investigation', icon: Eye },
  STRATEGY: { label: '🎯 Strategy', icon: Target },
  PREPARATION: { label: '📋 Preparation', icon: FileText },
  MONITORING: { label: '📡 Monitoring', icon: Eye },
  PROBLEM_SOLVING: { label: '🧩 Problem Solving', icon: Zap },
  GENERIC: { label: '📝 General', icon: BookOpen },
};

export function MissionInput({
  autoSelect,
  selectedExpert,
  onStartMission,
  onEnhance,
  isRunning = false,
  className,
}: MissionInputProps) {
  const [goal, setGoal] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [config, setConfig] = useState<MissionConfig>({
    enableRag: true,
    enableWebSearch: true,
    maxIterations: 15,
    hitlEnabled: true,
    templateId: 'comprehensive_analysis',
  });

  // Group templates by family for organized dropdown
  // Filter to only include templates with required fields (id, name)
  const groupedTemplates = useMemo(() => {
    const groups = new Map<MissionFamily, Array<{ id: string; name: string; family: MissionFamily; description?: string; complexity?: string; estimatedDurationMin?: number; estimatedDurationMax?: number; checkpoints?: Array<{ name: string }> }>>();

    DEFAULT_MISSION_TEMPLATES.forEach((template) => {
      // Skip templates without id or name
      if (!template.id || !template.name) return;

      const family = template.family || 'GENERIC';
      if (!groups.has(family)) {
        groups.set(family, []);
      }
      groups.get(family)!.push({
        id: template.id,
        name: template.name,
        family: family,
        description: template.description,
        complexity: template.complexity,
        estimatedDurationMin: template.estimatedDurationMin,
        estimatedDurationMax: template.estimatedDurationMax,
        checkpoints: template.checkpoints?.map(c => ({ name: c.name })),
      });
    });

    return groups;
  }, []);

  // Get current template info for display
  const selectedTemplate = useMemo(() => {
    return DEFAULT_MISSION_TEMPLATES.find(t => t.id === config.templateId);
  }, [config.templateId]);

  const handleStartMission = useCallback(() => {
    if (!goal.trim()) return;
    onStartMission(goal.trim(), config);
  }, [goal, config, onStartMission]);

  const handleEnhance = useCallback(async () => {
    if (!onEnhance || !goal.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const enhanced = await onEnhance(goal);
      setGoal(enhanced);
    } finally {
      setIsEnhancing(false);
    }
  }, [onEnhance, goal, isEnhancing]);

  const canStart = goal.trim().length > 10 && (autoSelect || selectedExpert);

  // Mode-specific colors
  const modeColor = autoSelect ? 'amber' : 'emerald';
  const ModeIcon = autoSelect ? Sparkles : Target;

  return (
    <Card className={cn('border-dashed', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            autoSelect ? 'bg-amber-500/10' : 'bg-emerald-500/10'
          )}>
            <ModeIcon className={cn(
              'h-6 w-6',
              autoSelect ? 'text-amber-500' : 'text-emerald-500'
            )} />
          </div>
          <div>
            <CardTitle className="text-xl">
              {autoSelect ? 'Autonomous Research Mission' : 'Guided Research Mission'}
            </CardTitle>
            <CardDescription>
              {autoSelect
                ? 'Fusion Intelligence will assemble the optimal team for your research'
                : 'Your selected expert will lead the autonomous investigation'}
            </CardDescription>
          </div>
          <Badge variant="outline" className="ml-auto text-xs">
            Mode {autoSelect ? '4' : '3'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Expert Selection Status */}
        {!autoSelect && (
          <div className={cn(
            'p-4 rounded-lg border',
            selectedExpert
              ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
              : 'bg-muted/50 border-dashed'
          )}>
            <div className="flex items-center gap-3">
              <User className={cn(
                'h-5 w-5',
                selectedExpert ? 'text-emerald-600' : 'text-muted-foreground'
              )} />
              {selectedExpert ? (
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedExpert.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {selectedExpert.level}
                    </Badge>
                  </div>
                  {selectedExpert.specialty && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedExpert.specialty}
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Select a research lead from the sidebar to begin
                </span>
              )}
            </div>
          </div>
        )}

        {/* Auto-select indicator for Mode 4 */}
        {autoSelect && (
          <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <span className="font-medium text-amber-700 dark:text-amber-400">
                  Fusion Intelligence Team
                </span>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-0.5">
                  AI will automatically select and coordinate the optimal expert team
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Research Goal Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="research-goal" className="text-sm font-medium">
              Research Goal
            </Label>
            {onEnhance && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEnhance}
                      disabled={isRunning || !goal.trim() || isEnhancing}
                      className="h-7 gap-1.5 text-xs"
                    >
                      {isEnhancing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">Enhance with AI</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enhance your research goal with AI-powered optimization</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Textarea
            id="research-goal"
            placeholder="Describe your research objective in detail..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="min-h-[120px] resize-none"
            disabled={isRunning || isEnhancing}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{goal.length} characters</span>
            <span>Minimum 10 characters</span>
          </div>
        </div>

        {/* Example Goals */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Example goals:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_GOALS.map((example, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setGoal(example)}
                disabled={isRunning}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-full border transition-colors',
                  'hover:bg-muted hover:border-muted-foreground/30',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {example.slice(0, 50)}...
              </button>
            ))}
          </div>
        </div>

        {/* Mission Template Selection - ALWAYS VISIBLE (20+ templates grouped by family) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Mission Template</Label>
            <Badge variant="outline" className="text-xs">
              {DEFAULT_MISSION_TEMPLATES.length} templates
            </Badge>
          </div>
          <Select
            value={config.templateId}
            onValueChange={(value) => setConfig({ ...config, templateId: value })}
            disabled={isRunning}
          >
            <SelectTrigger className="h-auto min-h-[44px]">
              <SelectValue>
                {selectedTemplate ? (
                  <div className="flex flex-col items-start py-1">
                    <span className="font-medium">{selectedTemplate.name}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {selectedTemplate.description}
                    </span>
                  </div>
                ) : (
                  'Select a mission template...'
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[400px]">
              {Array.from(groupedTemplates.entries()).map(([family, templates]) => (
                <SelectGroup key={family}>
                  <SelectLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {FAMILY_INFO[family]?.label || family}
                  </SelectLabel>
                  {templates.map((template) => (
                    <SelectItem
                      key={template.id}
                      value={template.id}
                      className="py-2"
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{template.name}</span>
                          {template.complexity && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {template.complexity}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {template.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          {/* Show selected template details */}
          {selectedTemplate && (
            <div className="p-3 rounded-lg bg-muted/50 border border-dashed text-sm space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{selectedTemplate.name}</span>
                {selectedTemplate.estimatedDurationMin && selectedTemplate.estimatedDurationMax && (
                  <Badge variant="secondary" className="text-xs ml-auto">
                    ~{selectedTemplate.estimatedDurationMin}-{selectedTemplate.estimatedDurationMax} min
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedTemplate.description}
              </p>
              {selectedTemplate.checkpoints && selectedTemplate.checkpoints.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedTemplate.checkpoints.slice(0, 3).map((checkpoint, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">
                      {checkpoint.name}
                    </Badge>
                  ))}
                  {selectedTemplate.checkpoints.length > 3 && (
                    <Badge variant="outline" className="text-[10px]">
                      +{selectedTemplate.checkpoints.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Advanced Configuration (Collapsible) */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between" size="sm">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                <span>Advanced Configuration</span>
              </div>
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            {/* Feature Toggles */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <FileSearch className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="enable-rag" className="text-sm cursor-pointer">
                    Knowledge Base
                  </Label>
                </div>
                <Switch
                  id="enable-rag"
                  checked={config.enableRag}
                  onCheckedChange={(checked) => setConfig({ ...config, enableRag: checked })}
                  disabled={isRunning}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="enable-web" className="text-sm cursor-pointer">
                    Web Search
                  </Label>
                </div>
                <Switch
                  id="enable-web"
                  checked={config.enableWebSearch}
                  onCheckedChange={(checked) => setConfig({ ...config, enableWebSearch: checked })}
                  disabled={isRunning}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="enable-hitl" className="text-sm cursor-pointer">
                    HITL Checkpoints
                  </Label>
                </div>
                <Switch
                  id="enable-hitl"
                  checked={config.hitlEnabled}
                  onCheckedChange={(checked) => setConfig({ ...config, hitlEnabled: checked })}
                  disabled={isRunning}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Max Iterations</span>
                </div>
                <Badge variant="secondary">{config.maxIterations}</Badge>
              </div>
            </div>

            {/* Max Iterations Slider */}
            <div className="space-y-2 px-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Iteration Depth</span>
                <span className="font-medium">{config.maxIterations} steps</span>
              </div>
              <Slider
                value={[config.maxIterations]}
                onValueChange={([value]) => setConfig({ ...config, maxIterations: value })}
                min={5}
                max={30}
                step={5}
                disabled={isRunning}
                className="w-full"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Quick (5)</span>
                <span>Deep (30)</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Start Mission Button */}
        <Button
          onClick={handleStartMission}
          disabled={!canStart || isRunning}
          className={cn(
            'w-full h-12 text-base font-medium',
            autoSelect
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-emerald-600 hover:bg-emerald-700'
          )}
        >
          <Play className="h-5 w-5 mr-2" />
          {isRunning
            ? 'Mission in Progress...'
            : autoSelect
              ? 'Launch Autonomous Mission'
              : 'Start Guided Research'}
        </Button>

        {/* Requirements hint */}
        {!canStart && !isRunning && (
          <p className="text-xs text-center text-muted-foreground">
            {goal.trim().length <= 10
              ? 'Enter a research goal with at least 10 characters'
              : !autoSelect && !selectedExpert
                ? 'Select a research lead from the sidebar'
                : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default MissionInput;
