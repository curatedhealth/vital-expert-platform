'use client';

/**
 * VITAL Platform - MissionConfigPanel Component (Mode 3)
 *
 * Single scrollable configuration page for Mode 3 (Expert Mode).
 * Provides full transparency and control with 5 collapsible sections:
 *
 * 1. Research Goal - Editable structured goal
 * 2. Mission Family & Template - Selection with AI recommendations
 * 3. Parameters - Execution parameters (depth, sources, scope)
 * 4. Agent Team - L2/L3/L4/L5 team configuration
 * 5. Execution Settings - Autonomy, HITL, budget, time limits
 *
 * Design System: VITAL Brand v6.0 (Purple theme for autonomous modes)
 * Phase 3 Redesign - December 13, 2025
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Target,
  Layers,
  Settings,
  Users,
  Sliders,
  ChevronDown,
  CheckCircle2,
  Circle,
  Sparkles,
  Play,
  Save,
  Clock,
  DollarSign,
  AlertTriangle,
  Info,
  BookOpen,
  BarChart3,
  FileSearch2,
  Lightbulb,
  FileText,
  Eye,
  Wrench,
  HelpCircle,
} from 'lucide-react';

import { AgentTeamSetup, type AgentTeamConfig, type AgentInfo } from './AgentTeamSetup';
import type { MissionFamily, MissionTemplate } from '../../types/mission-runners';
import { DEFAULT_MISSION_TEMPLATES } from '../../types/mission-runners';

// =============================================================================
// TYPES
// =============================================================================

export type ResearchDepth = 'quick' | 'comprehensive' | 'exhaustive';

export type SourceType =
  | 'regulatory_docs'
  | 'peer_reviewed'
  | 'case_studies'
  | 'industry_reports'
  | 'internal_data';

export interface MissionParameters {
  focusAreas: string[];
  researchDepth: ResearchDepth;
  sourceTypes: SourceType[];
  timeHorizon?: string;
  geographicScope?: string[];
  regulatoryFocus?: string[];
  maxIterations: number;
  confidenceThreshold: number;
}

export interface ExecutionSettings {
  autonomyLevel: 'guided' | 'semi_autonomous' | 'autonomous';
  hitlEnabled: boolean;
  hitlCheckpoints: string[];
  maxBudget: number;
  maxDurationMinutes: number;
  enableWebSearch: boolean;
  enableRag: boolean;
}

export interface MissionConfig {
  structuredGoal: string;
  family: MissionFamily;
  templateId?: string;
  parameters: MissionParameters;
  team: AgentTeamConfig;
  executionSettings: ExecutionSettings;
}

export interface AIRecommendations {
  suggestedFamily?: MissionFamily;
  familyConfidence?: number;
  suggestedTemplateId?: string;
  templateConfidence?: number;
  suggestedTeam?: {
    primaryAgent?: AgentInfo;
    specialists?: AgentInfo[];
    workers?: AgentInfo[];
    tools?: AgentInfo[];
  };
  suggestedParameters?: Partial<MissionParameters>;
  warnings?: string[];
}

export interface MissionConfigPanelProps {
  /** Initial prompt from user */
  initialPrompt: string;
  /** AI-generated recommendations */
  recommendations?: AIRecommendations;
  /** Available agents by level */
  availableAgents: {
    L2: AgentInfo[];
    L3: AgentInfo[];
    L4: AgentInfo[];
    L5: AgentInfo[];
  };
  /** Available mission templates */
  templates?: MissionTemplate[];
  /** Called when user launches mission */
  onLaunch: (config: MissionConfig) => void;
  /** Called when user wants to save as template */
  onSaveTemplate?: (config: MissionConfig) => void;
  /** Called when user cancels */
  onCancel?: () => void;
  /** Whether mission is being launched */
  isLaunching?: boolean;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SECTION_ICONS: Record<string, React.ReactNode> = {
  goal: <Target className="w-5 h-5" />,
  family: <Layers className="w-5 h-5" />,
  parameters: <Settings className="w-5 h-5" />,
  team: <Users className="w-5 h-5" />,
  execution: <Sliders className="w-5 h-5" />,
};

const FAMILY_ICONS: Record<MissionFamily, React.ReactNode> = {
  DEEP_RESEARCH: <BookOpen className="w-5 h-5" />,
  EVALUATION: <BarChart3 className="w-5 h-5" />,
  INVESTIGATION: <FileSearch2 className="w-5 h-5" />,
  STRATEGY: <Lightbulb className="w-5 h-5" />,
  PREPARATION: <FileText className="w-5 h-5" />,
  MONITORING: <Eye className="w-5 h-5" />,
  PROBLEM_SOLVING: <Wrench className="w-5 h-5" />,
  GENERIC: <HelpCircle className="w-5 h-5" />,
};

const FAMILY_LABELS: Record<MissionFamily, string> = {
  DEEP_RESEARCH: 'Deep Research',
  EVALUATION: 'Evaluation',
  INVESTIGATION: 'Investigation',
  STRATEGY: 'Strategy',
  PREPARATION: 'Preparation',
  MONITORING: 'Monitoring',
  PROBLEM_SOLVING: 'Problem Solving',
  GENERIC: 'Quick Query',
};

const DEPTH_OPTIONS: { value: ResearchDepth; label: string; duration: string }[] = [
  { value: 'quick', label: 'Quick Overview', duration: '15-30 min' },
  { value: 'comprehensive', label: 'Comprehensive', duration: '45-90 min' },
  { value: 'exhaustive', label: 'Exhaustive Research', duration: '2-4 hrs' },
];

const SOURCE_TYPE_OPTIONS: { value: SourceType; label: string }[] = [
  { value: 'regulatory_docs', label: 'Regulatory Documents' },
  { value: 'peer_reviewed', label: 'Peer-Reviewed Papers' },
  { value: 'case_studies', label: 'Case Studies' },
  { value: 'industry_reports', label: 'Industry Reports' },
  { value: 'internal_data', label: 'Internal Data' },
];

const AUTONOMY_OPTIONS = [
  { value: 'guided', label: 'Guided', description: 'Checkpoints at every step' },
  { value: 'semi_autonomous', label: 'Semi-Autonomous', description: 'Checkpoints at key decisions' },
  { value: 'autonomous', label: 'Autonomous', description: 'Run with minimal interruption' },
];

// Animation variants
const sectionVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
      opacity: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
      opacity: { duration: 0.2, delay: 0.1, ease: [0.4, 0, 0.2, 1] as const },
    },
  },
} as const;

// =============================================================================
// SECTION HEADER COMPONENT
// =============================================================================

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  icon: 'goal' | 'family' | 'parameters' | 'team' | 'execution';
  status: 'complete' | 'active' | 'pending';
  isExpanded: boolean;
  onToggle: () => void;
  hasRecommendation?: boolean;
  children: React.ReactNode;
}

function SectionHeader({
  title,
  subtitle,
  icon,
  status,
  isExpanded,
  onToggle,
  hasRecommendation,
  children,
}: SectionHeaderProps) {
  // Brand v6.0 Purple-centric section colors
  const sectionColors: Record<string, string> = {
    goal: 'bg-purple-50',
    family: 'bg-violet-50',
    parameters: 'bg-fuchsia-50',
    team: 'bg-green-50',
    execution: 'bg-stone-50',
  };

  return (
    <div
      className={cn(
        'group relative rounded-xl border-2 transition-all duration-200',
        isExpanded && 'border-purple-400',
        status === 'complete' && !isExpanded && 'border-green-400',
        !isExpanded && status !== 'complete' && 'border-slate-200 hover:border-purple-300'
      )}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 cursor-pointer text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Icon */}
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200',
              sectionColors[icon],
              'text-purple-600'
            )}
          >
            {SECTION_ICONS[icon]}
          </div>

          {/* Title */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              {hasRecommendation && (
                <Badge className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Suggested
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1',
              status === 'complete' && 'bg-green-100 text-green-700',
              status === 'active' && 'bg-purple-100 text-purple-700',
              status === 'pending' && 'bg-slate-100 text-slate-600'
            )}
          >
            {status === 'complete' && <CheckCircle2 className="w-3 h-3" />}
            {status === 'active' && <Circle className="w-3 h-3 fill-purple-600" />}
            {status === 'pending' && <Circle className="w-3 h-3" />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>

          {/* Chevron */}
          <ChevronDown
            className={cn(
              'w-5 h-5 text-slate-400 transition-transform duration-200',
              'group-hover:text-purple-600',
              isExpanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={sectionVariants}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MissionConfigPanel({
  initialPrompt,
  recommendations,
  availableAgents,
  templates = DEFAULT_MISSION_TEMPLATES as MissionTemplate[],
  onLaunch,
  onSaveTemplate,
  onCancel,
  isLaunching = false,
  className,
}: MissionConfigPanelProps) {
  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    goal: true,
    family: true,
    parameters: false,
    team: false,
    execution: false,
  });

  // Mission configuration state
  const [structuredGoal, setStructuredGoal] = useState(
    recommendations?.suggestedParameters?.focusAreas
      ? `Research: ${recommendations.suggestedParameters.focusAreas.join(', ')}`
      : initialPrompt
  );
  const [selectedFamily, setSelectedFamily] = useState<MissionFamily>(
    recommendations?.suggestedFamily || 'DEEP_RESEARCH'
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(
    recommendations?.suggestedTemplateId
  );
  const [parameters, setParameters] = useState<MissionParameters>({
    focusAreas: recommendations?.suggestedParameters?.focusAreas || [],
    researchDepth: recommendations?.suggestedParameters?.researchDepth || 'comprehensive',
    sourceTypes: recommendations?.suggestedParameters?.sourceTypes || ['peer_reviewed', 'regulatory_docs'],
    timeHorizon: recommendations?.suggestedParameters?.timeHorizon,
    geographicScope: recommendations?.suggestedParameters?.geographicScope || [],
    regulatoryFocus: recommendations?.suggestedParameters?.regulatoryFocus || [],
    maxIterations: recommendations?.suggestedParameters?.maxIterations || 3,
    confidenceThreshold: recommendations?.suggestedParameters?.confidenceThreshold || 0.85,
  });
  const [team, setTeam] = useState<AgentTeamConfig>({
    primaryAgent: recommendations?.suggestedTeam?.primaryAgent || null,
    specialists: recommendations?.suggestedTeam?.specialists || [],
    workers: recommendations?.suggestedTeam?.workers || [],
    tools: recommendations?.suggestedTeam?.tools || [],
  });
  const [executionSettings, setExecutionSettings] = useState<ExecutionSettings>({
    autonomyLevel: 'semi_autonomous',
    hitlEnabled: true,
    hitlCheckpoints: ['goal_validation', 'team_confirmation', 'results_review'],
    maxBudget: 10.0,
    maxDurationMinutes: 120,
    enableWebSearch: true,
    enableRag: true,
  });

  // Get templates for selected family
  const familyTemplates = useMemo(() => {
    return templates.filter((t) => t.family === selectedFamily);
  }, [templates, selectedFamily]);

  // Toggle section expansion
  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  // Calculate section status
  const getSectionStatus = useCallback(
    (section: string): 'complete' | 'active' | 'pending' => {
      switch (section) {
        case 'goal':
          return structuredGoal.trim().length > 10 ? 'complete' : 'active';
        case 'family':
          return selectedFamily ? 'complete' : 'pending';
        case 'parameters':
          return parameters.focusAreas.length > 0 ? 'complete' : 'pending';
        case 'team':
          return team.primaryAgent ? 'complete' : 'pending';
        case 'execution':
          return 'complete'; // Always has defaults
        default:
          return 'pending';
      }
    },
    [structuredGoal, selectedFamily, parameters, team]
  );

  // Handle focus area input
  const [focusAreaInput, setFocusAreaInput] = useState('');
  const handleAddFocusArea = useCallback(() => {
    if (focusAreaInput.trim() && !parameters.focusAreas.includes(focusAreaInput.trim())) {
      setParameters((prev) => ({
        ...prev,
        focusAreas: [...prev.focusAreas, focusAreaInput.trim()],
      }));
      setFocusAreaInput('');
    }
  }, [focusAreaInput, parameters.focusAreas]);

  const handleRemoveFocusArea = useCallback((area: string) => {
    setParameters((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.filter((a) => a !== area),
    }));
  }, []);

  // Handle source type toggle
  const handleToggleSourceType = useCallback((sourceType: SourceType) => {
    setParameters((prev) => ({
      ...prev,
      sourceTypes: prev.sourceTypes.includes(sourceType)
        ? prev.sourceTypes.filter((s) => s !== sourceType)
        : [...prev.sourceTypes, sourceType],
    }));
  }, []);

  // Calculate estimated cost and duration
  const estimates = useMemo(() => {
    const teamSize =
      (team.primaryAgent ? 1 : 0) +
      team.specialists.length +
      team.workers.length +
      team.tools.length;

    const depthMultiplier = {
      quick: 1,
      comprehensive: 2,
      exhaustive: 4,
    }[parameters.researchDepth];

    const estimatedDuration = 30 * depthMultiplier * Math.max(1, teamSize / 3);
    const estimatedCost = 0.15 * teamSize * depthMultiplier * parameters.maxIterations;

    return {
      duration: Math.round(estimatedDuration),
      cost: Math.round(estimatedCost * 100) / 100,
    };
  }, [team, parameters]);

  // Handle launch
  const handleLaunch = useCallback(() => {
    const config: MissionConfig = {
      structuredGoal,
      family: selectedFamily,
      templateId: selectedTemplateId,
      parameters,
      team,
      executionSettings,
    };
    onLaunch(config);
  }, [structuredGoal, selectedFamily, selectedTemplateId, parameters, team, executionSettings, onLaunch]);

  // Check if ready to launch
  const canLaunch = useMemo(() => {
    return (
      structuredGoal.trim().length > 10 &&
      selectedFamily &&
      team.primaryAgent !== null
    );
  }, [structuredGoal, selectedFamily, team]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b bg-gradient-to-r from-purple-50 to-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Configure Your Mission
            </h2>
            <p className="text-slate-600 mt-1">
              Review and customize all mission parameters before launch
            </p>
          </div>

          {/* Estimates */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span>~{estimates.duration} min</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <DollarSign className="w-4 h-4" />
              <span>~${estimates.cost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {recommendations?.warnings && recommendations.warnings.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                {recommendations.warnings.map((warning, idx) => (
                  <p key={idx}>{warning}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* Section 1: Research Goal */}
        <SectionHeader
          title="Research Goal"
          subtitle="Define what you want to accomplish"
          icon="goal"
          status={getSectionStatus('goal')}
          isExpanded={expandedSections.goal}
          onToggle={() => toggleSection('goal')}
          hasRecommendation={!!recommendations?.suggestedParameters?.focusAreas}
        >
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">
                Structured Mission Goal
              </Label>
              <Textarea
                value={structuredGoal}
                onChange={(e) => setStructuredGoal(e.target.value)}
                placeholder="Describe your research goal in detail..."
                className="mt-2 min-h-[100px]"
              />
              <p className="mt-1 text-xs text-slate-500">
                {structuredGoal.length} characters • AI-refined from your original prompt
              </p>
            </div>

            {/* Original prompt reference */}
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Original prompt:</p>
              <p className="text-sm text-slate-700 italic">"{initialPrompt}"</p>
            </div>
          </div>
        </SectionHeader>

        {/* Section 2: Mission Family & Template */}
        <SectionHeader
          title="Mission Family & Template"
          subtitle="Select the type of research mission"
          icon="family"
          status={getSectionStatus('family')}
          isExpanded={expandedSections.family}
          onToggle={() => toggleSection('family')}
          hasRecommendation={!!recommendations?.suggestedFamily}
        >
          <div className="space-y-4">
            {/* Family Selection */}
            <div>
              <Label className="text-sm font-medium text-slate-700">Mission Family</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {(Object.keys(FAMILY_LABELS) as MissionFamily[]).map((family) => (
                  <button
                    key={family}
                    onClick={() => setSelectedFamily(family)}
                    className={cn(
                      'p-3 rounded-lg border-2 text-left transition-all',
                      'hover:shadow-md',
                      selectedFamily === family
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-purple-300'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-purple-600">{FAMILY_ICONS[family]}</span>
                      {recommendations?.suggestedFamily === family && (
                        <Sparkles className="w-3 h-3 text-purple-500" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-900">{FAMILY_LABELS[family]}</p>
                  </button>
                ))}
              </div>
              {recommendations?.familyConfidence && (
                <p className="mt-2 text-xs text-slate-500">
                  AI confidence: {Math.round(recommendations.familyConfidence * 100)}%
                </p>
              )}
            </div>

            {/* Template Selection */}
            <div>
              <Label className="text-sm font-medium text-slate-700">
                Template (Optional)
              </Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a template or start from scratch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Start from scratch</SelectItem>
                  {familyTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                      {recommendations?.suggestedTemplateId === template.id && ' ✨'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SectionHeader>

        {/* Section 3: Parameters */}
        <SectionHeader
          title="Research Parameters"
          subtitle="Configure depth, sources, and scope"
          icon="parameters"
          status={getSectionStatus('parameters')}
          isExpanded={expandedSections.parameters}
          onToggle={() => toggleSection('parameters')}
        >
          <div className="space-y-6">
            {/* Focus Areas */}
            <div>
              <Label className="text-sm font-medium text-slate-700">Focus Areas</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={focusAreaInput}
                  onChange={(e) => setFocusAreaInput(e.target.value)}
                  placeholder="Add a focus area..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFocusArea()}
                />
                <Button onClick={handleAddFocusArea} variant="outline" size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {parameters.focusAreas.map((area) => (
                  <Badge
                    key={area}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => handleRemoveFocusArea(area)}
                  >
                    {area} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Research Depth */}
            <div>
              <Label className="text-sm font-medium text-slate-700">Research Depth</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {DEPTH_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setParameters((p) => ({ ...p, researchDepth: option.value }))}
                    className={cn(
                      'p-3 rounded-lg border-2 text-left transition-all',
                      parameters.researchDepth === option.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-purple-300'
                    )}
                  >
                    <p className="text-sm font-medium text-slate-900">{option.label}</p>
                    <p className="text-xs text-slate-500">{option.duration}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Source Types */}
            <div>
              <Label className="text-sm font-medium text-slate-700">Source Types</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {SOURCE_TYPE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all',
                      parameters.sourceTypes.includes(option.value)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-purple-300'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={parameters.sourceTypes.includes(option.value)}
                      onChange={() => handleToggleSourceType(option.value)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-slate-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Max Iterations & Confidence */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">
                  Max Iterations: {parameters.maxIterations}
                </Label>
                <Slider
                  value={[parameters.maxIterations]}
                  onValueChange={([value]) => setParameters((p) => ({ ...p, maxIterations: value }))}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700">
                  Confidence Threshold: {Math.round(parameters.confidenceThreshold * 100)}%
                </Label>
                <Slider
                  value={[parameters.confidenceThreshold * 100]}
                  onValueChange={([value]) =>
                    setParameters((p) => ({ ...p, confidenceThreshold: value / 100 }))
                  }
                  min={50}
                  max={99}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </SectionHeader>

        {/* Section 4: Agent Team */}
        <SectionHeader
          title="Agent Team"
          subtitle="Configure your expert team"
          icon="team"
          status={getSectionStatus('team')}
          isExpanded={expandedSections.team}
          onToggle={() => toggleSection('team')}
          hasRecommendation={!!recommendations?.suggestedTeam}
        >
          <AgentTeamSetup
            value={team}
            onChange={setTeam}
            availableAgents={availableAgents}
            recommendations={recommendations?.suggestedTeam}
            showAutoSelect
          />
        </SectionHeader>

        {/* Section 5: Execution Settings */}
        <SectionHeader
          title="Execution Settings"
          subtitle="Control autonomy and checkpoints"
          icon="execution"
          status={getSectionStatus('execution')}
          isExpanded={expandedSections.execution}
          onToggle={() => toggleSection('execution')}
        >
          <div className="space-y-6">
            {/* Autonomy Level */}
            <div>
              <Label className="text-sm font-medium text-slate-700">Autonomy Level</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {AUTONOMY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setExecutionSettings((s) => ({
                        ...s,
                        autonomyLevel: option.value as ExecutionSettings['autonomyLevel'],
                      }))
                    }
                    className={cn(
                      'p-3 rounded-lg border-2 text-left transition-all',
                      executionSettings.autonomyLevel === option.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-purple-300'
                    )}
                  >
                    <p className="text-sm font-medium text-slate-900">{option.label}</p>
                    <p className="text-xs text-slate-500">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* HITL Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-slate-900">
                  Human-in-the-Loop (HITL)
                </Label>
                <p className="text-xs text-slate-500">Require approval at key checkpoints</p>
              </div>
              <Switch
                checked={executionSettings.hitlEnabled}
                onCheckedChange={(checked) =>
                  setExecutionSettings((s) => ({ ...s, hitlEnabled: checked }))
                }
              />
            </div>

            {/* Budget & Duration Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">
                  Max Budget: ${executionSettings.maxBudget}
                </Label>
                <Slider
                  value={[executionSettings.maxBudget]}
                  onValueChange={([value]) =>
                    setExecutionSettings((s) => ({ ...s, maxBudget: value }))
                  }
                  min={1}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700">
                  Max Duration: {executionSettings.maxDurationMinutes} min
                </Label>
                <Slider
                  value={[executionSettings.maxDurationMinutes]}
                  onValueChange={([value]) =>
                    setExecutionSettings((s) => ({ ...s, maxDurationMinutes: value }))
                  }
                  min={15}
                  max={480}
                  step={15}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Additional Options */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={executionSettings.enableWebSearch}
                  onChange={(e) =>
                    setExecutionSettings((s) => ({ ...s, enableWebSearch: e.target.checked }))
                  }
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-slate-700">Enable Web Search</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={executionSettings.enableRag}
                  onChange={(e) =>
                    setExecutionSettings((s) => ({ ...s, enableRag: e.target.checked }))
                  }
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-slate-700">Enable RAG (Knowledge Base)</span>
              </label>
            </div>
          </div>
        </SectionHeader>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 p-4 border-t bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button variant="ghost" onClick={onCancel} disabled={isLaunching}>
                Cancel
              </Button>
            )}
            {onSaveTemplate && (
              <Button
                variant="outline"
                onClick={() =>
                  onSaveTemplate({
                    structuredGoal,
                    family: selectedFamily,
                    templateId: selectedTemplateId,
                    parameters,
                    team,
                    executionSettings,
                  })
                }
                disabled={isLaunching || !canLaunch}
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Template
              </Button>
            )}
          </div>

          <Button
            onClick={handleLaunch}
            disabled={!canLaunch || isLaunching}
            className={cn(
              'px-6 bg-gradient-to-r from-purple-600 to-purple-700',
              'hover:from-purple-700 hover:to-purple-800',
              'shadow-lg shadow-purple-500/25'
            )}
          >
            {isLaunching ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Launching...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Launch Mission
              </>
            )}
          </Button>
        </div>

        {!canLaunch && (
          <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Please set a goal and select a primary agent to launch
          </p>
        )}
      </div>
    </div>
  );
}

export default MissionConfigPanel;
