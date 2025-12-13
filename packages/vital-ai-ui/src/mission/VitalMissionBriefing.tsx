'use client';

/**
 * VitalMissionBriefing - Mission Pre-Flight Configuration Panel
 *
 * Pre-launch configuration for Mode 3/4 autonomous missions.
 * Displays selected template, allows input configuration, and sets autonomy level.
 *
 * Features:
 * - Template summary with icon and description
 * - Dynamic input fields based on template requirements
 * - Autonomy band selector (supervised/guided/autonomous)
 * - Budget and deadline configuration
 * - Checkpoint configuration overrides
 * - Launch button with loading state
 *
 * Used by: Mode 3 (Expert Control), Mode 4 (AI Wizard)
 *
 * @example
 * ```tsx
 * <VitalMissionBriefing
 *   template={selectedTemplate}
 *   expert={selectedExpert}
 *   mode="mode3"
 *   onLaunch={(config) => handleLaunch(config)}
 *   onBack={() => goBack()}
 * />
 * ```
 */

import { useState, useCallback, useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  ArrowLeft,
  Rocket,
  Loader2,
  Clock,
  DollarSign,
  Shield,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Settings,
  User,
  FileText,
  Users,
  RefreshCw,
  Package,
  Globe,
  Database,
  FileSearch,
  BarChart3,
  ListChecks,
  Quote,
  Lightbulb,
  Table,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// =============================================================================
// TYPES
// =============================================================================

export type MissionMode = 'mode3' | 'mode4';
export type AutonomyBand = 'supervised' | 'guided' | 'autonomous';

export interface MissionInputField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'file' | 'select' | 'multiselect' | 'number' | 'date';
  required: boolean;
  placeholder?: string;
  options?: string[];
  description?: string;
  defaultValue?: string | number;
}

export interface MissionCheckpoint {
  type: 'plan' | 'tool' | 'subagent' | 'critical' | 'final';
  description: string;
  timeout?: number;
  autoApprove?: boolean;
}

export interface BriefingTemplate {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
  category?: string;
  estimatedDuration?: string;
  complexity?: 'simple' | 'moderate' | 'complex';
  requiredInputs?: MissionInputField[];
  defaultCheckpoints?: MissionCheckpoint[];
}

export interface BriefingExpert {
  id: string;
  name: string;
  level?: string;
  domain?: string;
  avatar?: string;
}

export type ArtifactOutput = 'summary' | 'report' | 'analysis' | 'citations' | 'recommendations' | 'table';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface MissionBriefingConfig {
  inputs: Record<string, unknown>;
  autonomyBand: AutonomyBand;
  checkpointOverrides?: Record<string, boolean>;
  maxBudget?: number;
  deadline?: Date;
  /** Maximum iterations/loops for research */
  maxLoops?: number;
  /** Additional team members to include */
  team?: TeamMember[];
  /** Artifact outputs to generate */
  artifacts?: ArtifactOutput[];
  /** Enable web search */
  enableWebSearch?: boolean;
  /** Enable RAG/knowledge base */
  enableRAG?: boolean;
}

export interface VitalMissionBriefingProps {
  /** Selected mission template */
  template: BriefingTemplate;
  /** Selected expert agent */
  expert?: BriefingExpert;
  /** Mode 3 (expert) or Mode 4 (wizard) */
  mode: MissionMode;
  /** Research goal text (for display) */
  researchGoal?: string;
  /** Called when user launches the mission */
  onLaunch: (config: MissionBriefingConfig) => void;
  /** Called when user clicks back */
  onBack?: () => void;
  /** Whether the mission is launching */
  isLaunching?: boolean;
  /** Available team members for selection */
  availableTeamMembers?: TeamMember[];
  /** Custom class names */
  className?: string;
}

// =============================================================================
// AUTONOMY BAND CONFIGURATION
// =============================================================================

const AUTONOMY_BANDS: {
  id: AutonomyBand;
  name: string;
  description: string;
  icon: typeof Shield;
  recommended?: boolean;
}[] = [
  {
    id: 'supervised',
    name: 'Supervised',
    description: 'Approve every step before execution',
    icon: Shield,
  },
  {
    id: 'guided',
    name: 'Guided',
    description: 'Key checkpoints only',
    icon: CheckCircle,
    recommended: true,
  },
  {
    id: 'autonomous',
    name: 'Autonomous',
    description: 'Minimal interruption',
    icon: Rocket,
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function VitalMissionBriefing({
  template,
  expert,
  mode,
  researchGoal,
  onLaunch,
  onBack,
  isLaunching = false,
  availableTeamMembers = [],
  className,
}: VitalMissionBriefingProps) {
  // Form state
  const [inputs, setInputs] = useState<Record<string, unknown>>({});
  const [autonomyBand, setAutonomyBand] = useState<AutonomyBand>('guided');
  const [checkpointOverrides, setCheckpointOverrides] = useState<Record<string, boolean>>({});
  const [maxBudget, setMaxBudget] = useState<number | undefined>();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // New configuration state
  const [maxLoops, setMaxLoops] = useState<number>(3);
  const [selectedArtifacts, setSelectedArtifacts] = useState<ArtifactOutput[]>(['summary', 'citations']);
  const [enableWebSearch, setEnableWebSearch] = useState(true);
  const [enableRAG, setEnableRAG] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<TeamMember[]>([]);

  // Theme based on mode
  const isPurple = mode === 'mode3';
  const themeColor = isPurple ? 'purple' : 'amber';

  // Check if form is valid
  const isFormValid = useMemo(() => {
    if (!template.requiredInputs) return true;
    return template.requiredInputs
      .filter((input) => input.required)
      .every((input) => {
        const value = inputs[input.id];
        return value !== undefined && value !== '' && value !== null;
      });
  }, [template.requiredInputs, inputs]);

  // Handle input change
  const handleInputChange = useCallback((fieldId: string, value: unknown) => {
    setInputs((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  // Handle checkpoint override toggle
  const handleCheckpointOverride = useCallback((checkpointType: string, autoApprove: boolean) => {
    setCheckpointOverrides((prev) => ({ ...prev, [checkpointType]: autoApprove }));
  }, []);

  // Handle artifact toggle
  const handleArtifactToggle = useCallback((artifact: ArtifactOutput) => {
    setSelectedArtifacts((prev) =>
      prev.includes(artifact)
        ? prev.filter((a) => a !== artifact)
        : [...prev, artifact]
    );
  }, []);

  // Handle team member toggle
  const handleTeamToggle = useCallback((member: TeamMember) => {
    setSelectedTeam((prev) =>
      prev.some((m) => m.id === member.id)
        ? prev.filter((m) => m.id !== member.id)
        : [...prev, member]
    );
  }, []);

  // Handle launch
  const handleLaunch = useCallback(() => {
    if (!isFormValid || isLaunching) return;
    onLaunch({
      inputs,
      autonomyBand,
      checkpointOverrides,
      maxBudget,
      maxLoops,
      team: selectedTeam.length > 0 ? selectedTeam : undefined,
      artifacts: selectedArtifacts,
      enableWebSearch,
      enableRAG,
    });
  }, [inputs, autonomyBand, checkpointOverrides, maxBudget, maxLoops, selectedTeam, selectedArtifacts, enableWebSearch, enableRAG, isFormValid, isLaunching, onLaunch]);

  // Render input field
  const renderInputField = (field: MissionInputField) => {
    const value = inputs[field.id] ?? field.defaultValue ?? '';

    return (
      <div key={field.id} className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={field.id} className="text-sm font-medium text-slate-700">
            {field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {field.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">{field.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {field.type === 'textarea' ? (
          <Textarea
            id={field.id}
            value={value as string}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={cn(
              'focus:ring-2',
              isPurple ? 'focus:ring-purple-500' : 'focus:ring-amber-500'
            )}
            rows={3}
          />
        ) : field.type === 'select' ? (
          <Select
            value={value as string}
            onValueChange={(v) => handleInputChange(field.id, v)}
          >
            <SelectTrigger className={cn(
              'focus:ring-2',
              isPurple ? 'focus:ring-purple-500' : 'focus:ring-amber-500'
            )}>
              <SelectValue placeholder={field.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={field.id}
            type={field.type === 'number' ? 'number' : 'text'}
            value={value as string}
            onChange={(e) =>
              handleInputChange(
                field.id,
                field.type === 'number' ? Number(e.target.value) : e.target.value
              )
            }
            placeholder={field.placeholder}
            className={cn(
              'focus:ring-2',
              isPurple ? 'focus:ring-purple-500' : 'focus:ring-amber-500'
            )}
          />
        )}
      </div>
    );
  };

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      {/* Back Navigation */}
      {onBack && (
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className={cn(
              'gap-1',
              isPurple ? 'text-purple-600 hover:text-purple-800' : 'text-amber-600 hover:text-amber-800'
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to templates
          </Button>
        </div>
      )}

      {/* Template Header */}
      <div
        className={cn(
          'p-6 rounded-xl border mb-6',
          isPurple
            ? 'bg-gradient-to-r from-purple-50 to-white border-purple-100'
            : 'bg-gradient-to-r from-amber-50 to-white border-amber-100'
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              isPurple ? 'bg-purple-100 text-purple-600' : 'bg-amber-100 text-amber-600'
            )}
          >
            {template.icon || <FileText className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{template.name}</h2>
            {expert && (
              <p className="text-sm text-slate-600">with {expert.name}</p>
            )}
          </div>
          {template.complexity && (
            <Badge
              variant="outline"
              className={cn(
                'ml-auto',
                template.complexity === 'simple' && 'border-green-200 text-green-700 bg-green-50',
                template.complexity === 'moderate' && 'border-amber-200 text-amber-700 bg-amber-50',
                template.complexity === 'complex' && 'border-red-200 text-red-700 bg-red-50'
              )}
            >
              {template.complexity}
            </Badge>
          )}
        </div>
        <p className="text-slate-600">{template.description}</p>

        {/* Meta info */}
        {(template.estimatedDuration || template.category) && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
            {template.estimatedDuration && (
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                {template.estimatedDuration}
              </div>
            )}
            {template.category && (
              <Badge variant="secondary" className="text-xs">
                {template.category}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Research Goal (if provided) */}
      {researchGoal && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <Label className="text-xs text-slate-500 uppercase tracking-wider">Research Goal</Label>
          <p className="text-slate-700 mt-1">{researchGoal}</p>
        </div>
      )}

      {/* Mission Inputs */}
      {template.requiredInputs && template.requiredInputs.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="font-medium text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Mission Inputs
          </h3>
          {template.requiredInputs.map(renderInputField)}
        </div>
      )}

      {/* Autonomy Band */}
      <div className="mb-6">
        <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Autonomy Level
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {AUTONOMY_BANDS.map((band) => {
            const BandIcon = band.icon;
            const isSelected = autonomyBand === band.id;
            return (
              <button
                key={band.id}
                onClick={() => setAutonomyBand(band.id)}
                className={cn(
                  'p-3 rounded-lg border-2 text-center transition-all relative',
                  isSelected
                    ? isPurple
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                {band.recommended && (
                  <span
                    className={cn(
                      'absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                      isPurple ? 'bg-purple-600 text-white' : 'bg-amber-600 text-white'
                    )}
                  >
                    Recommended
                  </span>
                )}
                <BandIcon
                  className={cn(
                    'w-5 h-5 mx-auto mb-1',
                    isSelected
                      ? isPurple
                        ? 'text-purple-600'
                        : 'text-amber-600'
                      : 'text-slate-400'
                  )}
                />
                <div className="font-medium">{band.name}</div>
                <div className="text-xs text-slate-500 mt-1">{band.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Research Loops */}
      <div className="mb-6">
        <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Research Depth
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-slate-600">Iterations:</span>
              <span className={cn(
                'text-lg font-semibold',
                isPurple ? 'text-purple-600' : 'text-amber-600'
              )}>{maxLoops}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={maxLoops}
              onChange={(e) => setMaxLoops(Number(e.target.value))}
              className={cn(
                'w-full h-2 rounded-lg appearance-none cursor-pointer',
                isPurple ? 'accent-purple-600 bg-purple-100' : 'accent-amber-600 bg-amber-100'
              )}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Quick (1)</span>
              <span>Deep (10)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="mb-6">
        <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
          <Database className="w-4 h-4" />
          Data Sources
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setEnableRAG(!enableRAG)}
            className={cn(
              'p-3 rounded-lg border-2 text-left transition-all',
              enableRAG
                ? isPurple
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-amber-500 bg-amber-50'
                : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <div className="flex items-center gap-2">
              <Database className={cn(
                'w-5 h-5',
                enableRAG
                  ? isPurple ? 'text-purple-600' : 'text-amber-600'
                  : 'text-slate-400'
              )} />
              <div>
                <p className="font-medium text-sm">Knowledge Base</p>
                <p className="text-xs text-slate-500">Internal documents</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setEnableWebSearch(!enableWebSearch)}
            className={cn(
              'p-3 rounded-lg border-2 text-left transition-all',
              enableWebSearch
                ? isPurple
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-amber-500 bg-amber-50'
                : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <div className="flex items-center gap-2">
              <Globe className={cn(
                'w-5 h-5',
                enableWebSearch
                  ? isPurple ? 'text-purple-600' : 'text-amber-600'
                  : 'text-slate-400'
              )} />
              <div>
                <p className="font-medium text-sm">Web Search</p>
                <p className="text-xs text-slate-500">External sources</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Artifact Outputs */}
      <div className="mb-6">
        <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
          <Package className="w-4 h-4" />
          Output Artifacts
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: 'summary' as ArtifactOutput, icon: FileSearch, label: 'Summary' },
            { id: 'report' as ArtifactOutput, icon: FileText, label: 'Report' },
            { id: 'analysis' as ArtifactOutput, icon: BarChart3, label: 'Analysis' },
            { id: 'citations' as ArtifactOutput, icon: Quote, label: 'Citations' },
            { id: 'recommendations' as ArtifactOutput, icon: Lightbulb, label: 'Recs' },
            { id: 'table' as ArtifactOutput, icon: Table, label: 'Table' },
          ]).map((artifact) => {
            const Icon = artifact.icon;
            const isSelected = selectedArtifacts.includes(artifact.id);
            return (
              <button
                key={artifact.id}
                onClick={() => handleArtifactToggle(artifact.id)}
                className={cn(
                  'p-2 rounded-lg border text-center transition-all',
                  isSelected
                    ? isPurple
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                )}
              >
                <Icon className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs font-medium">{artifact.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Team Selection (only show if team members are available) */}
      {availableTeamMembers.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Additional Experts
            {selectedTeam.length > 0 && (
              <Badge variant="outline" className={cn(
                isPurple ? 'border-purple-200 text-purple-700 bg-purple-50' : 'border-amber-200 text-amber-700 bg-amber-50'
              )}>
                {selectedTeam.length} selected
              </Badge>
            )}
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Add experts to collaborate on this mission
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {availableTeamMembers.map((member) => {
              const isSelected = selectedTeam.some((m) => m.id === member.id);
              return (
                <button
                  key={member.id}
                  onClick={() => handleTeamToggle(member)}
                  className={cn(
                    'p-2 rounded-lg border text-left transition-all flex items-center gap-2',
                    isSelected
                      ? isPurple
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-amber-500 bg-amber-50'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                      isSelected
                        ? isPurple ? 'bg-purple-200 text-purple-700' : 'bg-amber-200 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    )}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-slate-500 truncate">{member.role}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle className={cn(
                      'w-4 h-4 flex-shrink-0',
                      isPurple ? 'text-purple-600' : 'text-amber-600'
                    )} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Advanced Settings Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1"
        >
          <Settings className="w-4 h-4" />
          {showAdvanced ? 'Hide' : 'Show'} advanced settings
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            {/* Budget */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Max Budget (optional)
              </Label>
              <Input
                type="number"
                value={maxBudget || ''}
                onChange={(e) => setMaxBudget(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="No limit"
                className="max-w-xs"
              />
            </div>

            {/* Checkpoint Overrides */}
            {template.defaultCheckpoints && template.defaultCheckpoints.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Checkpoint Settings
                </Label>
                {template.defaultCheckpoints.map((checkpoint) => (
                  <div
                    key={checkpoint.type}
                    className="flex items-center justify-between p-2 bg-white rounded border"
                  >
                    <div>
                      <p className="text-sm font-medium capitalize">{checkpoint.type}</p>
                      <p className="text-xs text-slate-500">{checkpoint.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Auto-approve</span>
                      <Switch
                        checked={checkpointOverrides[checkpoint.type] ?? checkpoint.autoApprove ?? false}
                        onCheckedChange={(checked) =>
                          handleCheckpointOverride(checkpoint.type, checked)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Launch Button */}
      <Button
        onClick={handleLaunch}
        disabled={!isFormValid || isLaunching}
        className={cn(
          'w-full py-6 rounded-xl font-semibold text-white transition-all text-lg',
          isPurple
            ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/25'
            : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-lg shadow-amber-500/25',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isLaunching ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Launching Mission...
          </>
        ) : (
          <>
            <Rocket className="w-5 h-5 mr-2" />
            Launch Mission
          </>
        )}
      </Button>

      {/* Form validation hint */}
      {!isFormValid && (
        <p className="text-center text-sm text-amber-600 mt-3">
          Please fill in all required fields before launching
        </p>
      )}
    </div>
  );
}

export default VitalMissionBriefing;
