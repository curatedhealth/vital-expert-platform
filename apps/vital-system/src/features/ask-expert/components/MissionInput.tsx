'use client';

/**
 * MissionInput - Advanced Mission Configuration Component
 *
 * Provides a rich input experience for Mode 3 and Mode 4 autonomous research.
 * Replaces the sidebar-based mission input with an in-page component.
 *
 * Features:
 * - Research goal textarea with examples
 * - Advanced configuration options (collapsible)
 * - Expert display (Mode 3) or auto-selection indicator (Mode 4)
 * - Mission templates quick-select
 */

import { useState, useCallback } from 'react';
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
} from 'lucide-react';

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
  /** Currently selected expert (Mode 3 only) */
  selectedExpert?: SelectedExpert | null;
  /** Callback when mission should start */
  onStartMission: (goal: string, config: MissionConfig) => void;
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

// Mission templates
const MISSION_TEMPLATES = [
  { id: 'deep-research', name: 'Deep Research', description: 'Comprehensive multi-source analysis' },
  { id: 'competitive-intel', name: 'Competitive Intelligence', description: 'Market and competitor analysis' },
  { id: 'regulatory-review', name: 'Regulatory Review', description: 'Compliance and guidance analysis' },
  { id: 'literature-review', name: 'Literature Review', description: 'Systematic evidence synthesis' },
];

export function MissionInput({
  autoSelect,
  selectedExpert,
  onStartMission,
  isRunning = false,
  className,
}: MissionInputProps) {
  const [goal, setGoal] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [config, setConfig] = useState<MissionConfig>({
    enableRag: true,
    enableWebSearch: true,
    maxIterations: 15,
    hitlEnabled: true,
    templateId: 'deep-research',
  });

  const handleStartMission = useCallback(() => {
    if (!goal.trim()) return;
    onStartMission(goal.trim(), config);
  }, [goal, config, onStartMission]);

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
          <Label htmlFor="research-goal" className="text-sm font-medium">
            Research Goal
          </Label>
          <Textarea
            id="research-goal"
            placeholder="Describe your research objective in detail..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="min-h-[120px] resize-none"
            disabled={isRunning}
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
            {/* Mission Template */}
            <div className="space-y-2">
              <Label className="text-sm">Mission Template</Label>
              <Select
                value={config.templateId}
                onValueChange={(value) => setConfig({ ...config, templateId: value })}
                disabled={isRunning}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MISSION_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex flex-col">
                        <span>{template.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {template.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
