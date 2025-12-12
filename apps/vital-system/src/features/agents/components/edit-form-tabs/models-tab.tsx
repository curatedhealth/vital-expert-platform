/**
 * Models Tab Component
 * Extracted from agent-edit-form-enhanced.tsx
 *
 * Handles LLM model selection and configuration:
 * - Provider filtering with badge toggle
 * - Sort by fit score, cost, reasoning, medical, coding, speed
 * - Model comparison table with fit scores
 * - Model parameters (temperature, tokens, context window)
 * - Token budget sliders
 * - Model justification and citation for evidence-based operations
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SliderGroup } from '@/components/ui/labeled-slider';
import {
  MODEL_SLIDERS,
  TOKEN_BUDGET_SLIDERS,
} from '../../types/agent.types';
import {
  Filter,
  Settings,
  Cpu,
  Brain,
  Heart,
  Zap,
  DollarSign,
  Sparkles,
  Info,
  Crown,
  ThumbsUp,
  ArrowUp,
  AlertTriangle,
  Check,
  Flame,
  Clock,
  Eye,
} from 'lucide-react';
import type { EditFormTabProps } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface LlmModelDisplay {
  value: string;
  label: string;
  cost: string;
  costValue: number;
  tier: number;
  provider: string;
  reasoning: number;
  coding: number;
  medical: number;
  speed: number;
  context: number;
  isRecommended?: boolean;
  isLatest?: boolean;
  trainingCutoff?: string;
  supportsVision?: boolean;
  supportsStreaming?: boolean;
}

export interface LlmModelWithFit extends LlmModelDisplay {
  fitScore: number;
  fitReason: string;
}

export type ModelSortBy = 'recommended' | 'cost' | 'reasoning' | 'medical' | 'coding' | 'speed';

export interface ModelsTabProps extends EditFormTabProps {
  /** Available LLM models (transformed from database or fallback) */
  llmModels: LlmModelDisplay[];
  /** Available provider names for filtering */
  modelProviders: string[];
  /** Function to calculate model fit based on agent profile */
  calculateModelFit: (
    models: LlmModelDisplay[],
    agentProfile: {
      functionId?: string;
      functionName?: string;
      knowledgeDomains?: string[];
      capabilities?: string[];
      description?: string;
    }
  ) => LlmModelWithFit[];
}

// ============================================================================
// SORT OPTIONS
// ============================================================================

const SORT_OPTIONS: Array<{ id: ModelSortBy; label: string; icon: React.ElementType }> = [
  { id: 'recommended', label: 'Recommended', icon: Sparkles },
  { id: 'cost', label: 'Cost (Low→High)', icon: DollarSign },
  { id: 'reasoning', label: 'Reasoning', icon: Brain },
  { id: 'medical', label: 'Medical', icon: Heart },
  { id: 'coding', label: 'Coding', icon: Cpu },
  { id: 'speed', label: 'Speed', icon: Zap },
];

// ============================================================================
// MODELS TAB COMPONENT
// ============================================================================

export function ModelsTab({
  formState,
  updateField,
  options,
  llmModels,
  modelProviders,
  calculateModelFit,
}: ModelsTabProps) {
  // Local state for filtering/sorting
  const [providerFilter, setProviderFilter] = React.useState<string>('All');
  const [modelSortBy, setModelSortBy] = React.useState<ModelSortBy>('recommended');

  // Slider update helper
  const updateSlider = React.useCallback(
    (key: string, value: number) => {
      updateField(key as keyof typeof formState, value);
    },
    [updateField]
  );

  // Calculate model fit scores
  const modelsWithFit = React.useMemo(() => {
    const selectedFunction = options.functions.find((f) => f.id === formState.function_id);
    return calculateModelFit(llmModels, {
      functionId: formState.function_id,
      functionName: selectedFunction?.name,
      knowledgeDomains: formState.knowledge_domains,
      capabilities: formState.capabilities,
      description: formState.description,
    });
  }, [llmModels, formState.function_id, formState.knowledge_domains, formState.capabilities, formState.description, options.functions, calculateModelFit]);

  // Selected model info for feedback banner
  const selectedModel = modelsWithFit.find((m) => m.value === formState.base_model);
  const topModel = modelsWithFit[0];
  const isOptimalChoice = selectedModel && topModel && selectedModel.value === topModel.value;
  const isGoodChoice = selectedModel && selectedModel.fitScore >= 75;
  const betterAlternatives = selectedModel
    ? modelsWithFit.filter((m) => m.fitScore > selectedModel.fitScore).slice(0, 3)
    : [];

  // Filter and sort models for table
  const filteredModels = React.useMemo(() => {
    let filtered = modelsWithFit.filter(
      (m) => providerFilter === 'All' || m.provider === providerFilter
    );

    // Apply sorting based on selected criterion
    switch (modelSortBy) {
      case 'cost':
        filtered = [...filtered].sort((a, b) => a.costValue - b.costValue);
        break;
      case 'reasoning':
        filtered = [...filtered].sort((a, b) => b.reasoning - a.reasoning);
        break;
      case 'medical':
        filtered = [...filtered].sort((a, b) => b.medical - a.medical);
        break;
      case 'coding':
        filtered = [...filtered].sort((a, b) => b.coding - a.coding);
        break;
      case 'speed':
        filtered = [...filtered].sort((a, b) => b.speed - a.speed);
        break;
      // 'recommended' is already sorted by fitScore
    }

    return filtered;
  }, [modelsWithFit, providerFilter, modelSortBy]);

  const topRecommended = modelsWithFit.slice(0, 3).map((m) => m.value);

  return (
    <div className="space-y-4">
      {/* Filter & Sort Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter & Sort Models
          </CardTitle>
          <CardDescription>AI-powered recommendations based on agent profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Provider Filter */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Provider:</Label>
            <div className="flex gap-2 flex-wrap">
              {modelProviders.map((provider) => (
                <Badge
                  key={provider}
                  variant={providerFilter === provider ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setProviderFilter(provider)}
                >
                  {provider}
                </Badge>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Sort by:</Label>
            <div className="flex gap-2 flex-wrap">
              {SORT_OPTIONS.map((sort) => (
                <Badge
                  key={sort.id}
                  variant={modelSortBy === sort.id ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer hover:bg-primary/10',
                    modelSortBy === sort.id &&
                      sort.id === 'recommended' &&
                      'bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0'
                  )}
                  onClick={() => setModelSortBy(sort.id)}
                >
                  <sort.icon className="h-3 w-3 mr-1" />
                  {sort.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Selection Feedback Banner */}
      {formState.base_model && selectedModel && (
        <Card
          className={cn(
            'border-2',
            isOptimalChoice
              ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
              : isGoodChoice
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
          )}
        >
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              {isOptimalChoice ? (
                <>
                  <div className="rounded-full bg-green-500 p-2">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4" />
                      Excellent Choice!
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                      <strong>{selectedModel.label}</strong> is the best match for this agent
                      profile with a {selectedModel.fitScore}% fit score.
                      {selectedModel.fitReason && ` ${selectedModel.fitReason}.`}
                    </p>
                  </div>
                </>
              ) : isGoodChoice ? (
                <>
                  <div className="rounded-full bg-blue-500 p-2">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4" />
                      Good Choice
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
                      <strong>{selectedModel.label}</strong> has a {selectedModel.fitScore}% fit
                      score.
                      {betterAlternatives.length > 0 && (
                        <span>
                          {' '}
                          For better performance, consider:{' '}
                          <strong>{betterAlternatives.map((m) => m.label).join(', ')}</strong>
                        </span>
                      )}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-full bg-amber-500 p-2">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                      <ArrowUp className="h-4 w-4" />
                      Consider Better Alternatives
                    </div>
                    <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                      <strong>{selectedModel.label}</strong> has a {selectedModel.fitScore}% fit
                      score which is suboptimal for this agent.
                    </p>
                    {betterAlternatives.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {betterAlternatives.map((alt) => (
                          <button
                            key={alt.value}
                            type="button"
                            onClick={() => updateField('base_model', alt.value)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-amber-900 rounded border border-amber-300 text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-800 transition-colors"
                          >
                            <Sparkles className="h-3 w-3 text-amber-600" />
                            {alt.label} ({alt.fitScore}%)
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Model Comparison
          </CardTitle>
          <CardDescription>
            {llmModels.length} models available • Click a row to select
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[200px]">Model</TableHead>
                  <TableHead className="w-[80px] text-center">Fit</TableHead>
                  <TableHead className="w-[70px] text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Brain className="h-3 w-3" />
                      <span className="sr-only sm:not-sr-only">Reason</span>
                    </div>
                  </TableHead>
                  <TableHead className="w-[70px] text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span className="sr-only sm:not-sr-only">Medical</span>
                    </div>
                  </TableHead>
                  <TableHead className="w-[70px] text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Cpu className="h-3 w-3" />
                      <span className="sr-only sm:not-sr-only">Code</span>
                    </div>
                  </TableHead>
                  <TableHead className="w-[70px] text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Zap className="h-3 w-3" />
                      <span className="sr-only sm:not-sr-only">Speed</span>
                    </div>
                  </TableHead>
                  <TableHead className="w-[80px] text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModels.slice(0, 30).map((model, index) => {
                  const isSelected = formState.base_model === model.value;
                  const isTop = index === 0 && modelSortBy === 'recommended';
                  const isRecommended = topRecommended.includes(model.value);

                  return (
                    <TableRow
                      key={model.value}
                      className={cn(
                        'cursor-pointer transition-colors',
                        isSelected && 'bg-primary/10 border-l-4 border-l-primary',
                        !isSelected && isRecommended && 'bg-violet-50 dark:bg-violet-950/20',
                        'hover:bg-muted/50'
                      )}
                      onClick={() => updateField('base_model', model.value)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span>{model.label}</span>
                              {model.isLatest && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1 py-0 h-4 bg-orange-100 text-orange-700 border-orange-300"
                                >
                                  <Flame className="h-2.5 w-2.5 mr-0.5" />
                                  New
                                </Badge>
                              )}
                              {isTop && (
                                <Badge className="text-[10px] px-1 py-0 h-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">
                                  <Crown className="h-2.5 w-2.5 mr-0.5" />
                                  Best
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <span>{model.provider}</span>
                              {model.trainingCutoff && (
                                <>
                                  <span>•</span>
                                  <Clock className="h-3 w-3" />
                                  <span>{model.trainingCutoff}</span>
                                </>
                              )}
                              {model.supportsVision && (
                                <span title="Supports Vision">
                                  <Eye className="h-3 w-3 text-blue-500" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div
                          className={cn(
                            'inline-flex items-center justify-center w-12 h-6 rounded-full text-xs font-bold',
                            model.fitScore >= 85
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : model.fitScore >= 70
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                : model.fitScore >= 50
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          )}
                        >
                          {model.fitScore}%
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <ScoreBar value={model.reasoning} color="blue" />
                      </TableCell>
                      <TableCell className="text-center">
                        <ScoreBar value={model.medical} color="green" />
                      </TableCell>
                      <TableCell className="text-center">
                        <ScoreBar value={model.coding} color="purple" />
                      </TableCell>
                      <TableCell className="text-center">
                        <ScoreBar value={model.speed} color="amber" />
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        <span
                          className={cn(
                            'font-medium',
                            model.costValue <= 0.02
                              ? 'text-green-600'
                              : model.costValue <= 0.1
                                ? 'text-blue-600'
                                : 'text-amber-600'
                          )}
                        >
                          {model.cost}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Model Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Model Parameters
          </CardTitle>
          <CardDescription>Fine-tune the model behavior for this agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SliderGroup
            title=""
            sliders={MODEL_SLIDERS}
            values={{
              temperature: formState.temperature,
              max_tokens: formState.max_tokens,
              context_window: formState.context_window,
            }}
            onChange={updateSlider}
            columns={1}
          />

          <Separator />

          <SliderGroup
            title="Token Budget"
            sliders={TOKEN_BUDGET_SLIDERS}
            values={{
              token_budget_min: formState.token_budget_min,
              token_budget_max: formState.token_budget_max,
              token_budget_recommended: formState.token_budget_recommended,
            }}
            onChange={updateSlider}
            columns={3}
          />
        </CardContent>
      </Card>

      {/* Model Evidence */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Model Justification
          </CardTitle>
          <CardDescription>
            Document why this model was selected (required for evidence-based operations)
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="model_justification">Justification</Label>
            <Textarea
              id="model_justification"
              value={formState.model_justification}
              onChange={(e) => updateField('model_justification', e.target.value)}
              placeholder="e.g., Ultra-specialist requiring highest accuracy for pharmacovigilance. GPT-4 achieves 86.7% on MedQA (USMLE)."
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="model_citation">Citation</Label>
            <Input
              id="model_citation"
              value={formState.model_citation}
              onChange={(e) => updateField('model_citation', e.target.value)}
              placeholder="e.g., OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface ScoreBarProps {
  value: number;
  color: 'blue' | 'green' | 'purple' | 'amber';
}

const SCORE_BAR_COLORS = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  amber: 'bg-amber-500',
} as const;

function ScoreBar({ value, color }: ScoreBarProps) {
  return (
    <div className="flex items-center justify-center gap-1">
      <div className="w-8 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full', SCORE_BAR_COLORS[color])}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-6">{value}</span>
    </div>
  );
}
