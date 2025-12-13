'use client';

/**
 * VITAL Platform - MissionBriefing Component
 *
 * Pre-flight configuration for autonomous missions.
 * Collects required inputs, sets autonomy level, and previews mission plan.
 *
 * Features:
 * - Dynamic input fields based on template
 * - Autonomy band selector (supervised/guided/autonomous)
 * - Checkpoint configuration
 * - Mission plan preview with steps
 * - Launch confirmation
 *
 * Design System: VITAL Brand v6.0 (Purple theme)
 * Phase 3 Implementation - December 11, 2025
 */

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  Clock,
  Shield,
  ShieldCheck,
  ShieldOff,
  Rocket,
  AlertCircle,
  CheckCircle2,
  Zap,
  Eye,
  Settings2,
  FileText,
} from 'lucide-react';

import type { Expert } from '../interactive/ExpertPicker';
import type { MissionTemplate, MissionConfig, InputField, Checkpoint, CheckpointType, MissionTask } from '../../types/mission-runners';

// Helper to get field key (use `name` from canonical schema)
function getFieldKey(field: InputField): string {
  return field.name;
}

// =============================================================================
// TYPES
// =============================================================================

export interface MissionBriefingProps {
  /** Selected mission template */
  template: MissionTemplate;
  /** Selected expert */
  expert: Expert;
  /** Called when mission is launched */
  onLaunch: (config: MissionConfig) => void;
  /** Called when back is clicked */
  onBack: () => void;
  /** Custom class names */
  className?: string;
}

type AutonomyBand = 'supervised' | 'guided' | 'autonomous';

// =============================================================================
// CONSTANTS
// =============================================================================

const AUTONOMY_BANDS: Record<AutonomyBand, {
  label: string;
  description: string;
  icon: typeof Shield;
  color: string;
  bgColor: string;
  checkpointBehavior: string;
}> = {
  supervised: {
    label: 'Supervised',
    description: 'Approve every major step before proceeding',
    icon: Shield,
    color: 'text-violet-700',
    bgColor: 'bg-violet-50 border-violet-200',
    checkpointBehavior: 'All checkpoints require approval',
  },
  guided: {
    label: 'Guided',
    description: 'Only pause at critical decision points',
    icon: ShieldCheck,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    checkpointBehavior: 'Only critical/final checkpoints',
  },
  autonomous: {
    label: 'Autonomous',
    description: 'Run with minimal interruption, review at end',
    icon: ShieldOff,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    checkpointBehavior: 'Final checkpoint only',
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function MissionBriefing({
  template,
  expert,
  onLaunch,
  onBack,
  className,
}: MissionBriefingProps) {
  // =========================================================================
  // STATE
  // =========================================================================

  const [inputs, setInputs] = useState<Record<string, unknown>>({});
  const [autonomyBand, setAutonomyBand] = useState<AutonomyBand>('guided');
  const [checkpointOverrides, setCheckpointOverrides] = useState<Record<string, boolean>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // =========================================================================
  // VALIDATION
  // =========================================================================

  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    template.requiredInputs.forEach((input) => {
      const fieldKey = getFieldKey(input);
      if (input.required) {
        const value = inputs[fieldKey];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors[fieldKey] = `${input.name} is required`;
        }
      }
    });

    return errors;
  }, [inputs, template.requiredInputs]);

  const isValid = Object.keys(validationErrors).length === 0;

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleInputChange = useCallback((fieldId: string, value: unknown) => {
    setInputs((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const handleCheckpointToggle = useCallback((checkpointType: string, enabled: boolean) => {
    setCheckpointOverrides((prev) => ({ ...prev, [checkpointType]: enabled }));
  }, []);

  const handleLaunch = useCallback(() => {
    if (!isValid) {
      setIsValidating(true);
      return;
    }

    const config: MissionConfig = {
      inputs,
      autonomyBand,
      checkpointOverrides: Object.keys(checkpointOverrides).length > 0 ? checkpointOverrides : undefined,
    };

    onLaunch(config);
  }, [isValid, inputs, autonomyBand, checkpointOverrides, onLaunch]);

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-white">
        <button
          onClick={onBack}
          className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to templates
        </button>

        <div className="flex items-center gap-4">
          <span className="text-4xl">🎯</span>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {template.name}
            </h2>
            <p className="text-slate-600 mt-1">
              with {expert.name}
            </p>
          </div>
        </div>

        {/* Mission Summary */}
        <div className="flex items-center gap-4 mt-4">
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            {template.estimatedDurationMin}-{template.estimatedDurationMax} min
          </Badge>
          <Badge variant="outline" className="gap-1">
            <FileText className="w-3 h-3" />
            {template.tasks.length} tasks
          </Badge>
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            {template.checkpoints.length} checkpoints
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-8">
          {/* Mission Inputs */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Mission Inputs
            </h3>

            <div className="space-y-4">
              {template.requiredInputs.map((field) => {
                const fieldKey = getFieldKey(field);
                return (
                  <InputFieldComponent
                    key={fieldKey}
                    field={field}
                    value={inputs[fieldKey]}
                    onChange={(value) => handleInputChange(fieldKey, value)}
                    error={isValidating ? validationErrors[fieldKey] : undefined}
                  />
                );
              })}
            </div>
          </section>

          {/* Autonomy Level */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Autonomy Level
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(Object.keys(AUTONOMY_BANDS) as AutonomyBand[]).map((band) => {
                const config = AUTONOMY_BANDS[band];
                const Icon = config.icon;
                const isSelected = autonomyBand === band;

                return (
                  <button
                    key={band}
                    onClick={() => setAutonomyBand(band)}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all',
                      isSelected
                        ? `${config.bgColor} border-current ${config.color}`
                        : 'border-slate-200 hover:border-purple-200 bg-white'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={cn('w-5 h-5', isSelected ? config.color : 'text-slate-400')} />
                      <span className={cn('font-semibold', isSelected ? config.color : 'text-slate-900')}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{config.description}</p>
                    <p className="text-xs text-slate-500 mt-2">{config.checkpointBehavior}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Mission Plan Preview */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              Mission Plan
            </h3>

            <div className="bg-slate-50 rounded-xl p-4">
              <div className="space-y-3">
                {template.tasks.map((task: MissionTask, index: number) => (
                  <div key={task.id} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-medium shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">{task.name}</span>
                        <span className="text-xs text-slate-500">{task.estimatedMinutes} min</span>
                      </div>
                      <p className="text-sm text-slate-600">{task.description}</p>
                      {task.tools && task.tools.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span className="text-xs text-slate-500">
                            Tools: {task.tools.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkpoints */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700">Checkpoints</span>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  >
                    <Settings2 className="w-3 h-3" />
                    {showAdvanced ? 'Hide' : 'Customize'}
                  </button>
                </div>

                <div className="space-y-2">
                  {template.checkpoints.map((checkpoint: Checkpoint, index: number) => {
                    const isEnabled = checkpointOverrides[checkpoint.type] ?? getDefaultCheckpointEnabled(checkpoint.type, autonomyBand);

                    return (
                      <div key={checkpoint.id || index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckpointBadge type={checkpoint.type} />
                          <span className="text-sm text-slate-600">{checkpoint.description || checkpoint.name}</span>
                        </div>
                        {showAdvanced ? (
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => handleCheckpointToggle(checkpoint.type, checked)}
                          />
                        ) : (
                          <span className={cn(
                            'text-xs',
                            isEnabled ? 'text-green-600' : 'text-slate-400'
                          )}>
                            {isEnabled ? 'Active' : 'Skipped'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t bg-white">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleLaunch}
            disabled={isValidating && !isValid}
            className={cn(
              'flex-1 gap-2',
              'bg-gradient-to-r from-purple-600 to-purple-700',
              'hover:from-purple-700 hover:to-purple-800',
              'shadow-lg shadow-purple-500/25'
            )}
          >
            <Rocket className="w-4 h-4" />
            Launch Mission
          </Button>
        </div>

        {isValidating && !isValid && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-red-600 mt-3"
          >
            Please fill in all required fields
          </motion.p>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface InputFieldProps {
  field: InputField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

function InputFieldRenderer({ field, value, onChange, error }: InputFieldProps) {
  const handleChange = (newValue: string | string[]) => {
    onChange(newValue);
  };

  // Use field.name as the key (canonical schema)
  const fieldKey = getFieldKey(field);

  return (
    <div>
      <Label htmlFor={fieldKey} className="flex items-center gap-1">
        {field.name}
        {field.required && <span className="text-red-500">*</span>}
      </Label>

      {field.description && (
        <p className="text-xs text-slate-500 mt-0.5 mb-1.5">{field.description}</p>
      )}

      {field.type === 'textarea' ? (
        <Textarea
          id={fieldKey}
          value={(value as string) || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          className={cn(error && 'border-red-500')}
          rows={3}
        />
      ) : field.type === 'select' ? (
        <Select
          value={(value as string) || ''}
          onValueChange={handleChange}
        >
          <SelectTrigger className={cn(error && 'border-red-500')}>
            <SelectValue placeholder={field.placeholder || 'Select...'} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === 'multiselect' ? (
        <div className="flex flex-wrap gap-2">
          {field.options?.map((option) => {
            const isSelected = Array.isArray(value) && value.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  const currentValues = Array.isArray(value) ? value : [];
                  const newValues = isSelected
                    ? currentValues.filter((v) => v !== option)
                    : [...currentValues, option];
                  handleChange(newValues);
                }}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-all',
                  isSelected
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : (
        <Input
          id={fieldKey}
          type="text"
          value={(value as string) || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          className={cn(error && 'border-red-500')}
        />
      )}

      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

interface CheckpointBadgeProps {
  type: CheckpointType;
}

function CheckpointBadge({ type }: CheckpointBadgeProps) {
  // Map canonical CheckpointType values to display configs (Brand v6.0 Purple-centric)
  const configs: Record<CheckpointType, { label: string; color: string; bgColor: string }> = {
    plan_approval: { label: 'Plan', color: 'text-purple-700', bgColor: 'bg-purple-100' },
    tool_approval: { label: 'Tool', color: 'text-violet-700', bgColor: 'bg-violet-100' },
    sub_agent_approval: { label: 'Sub-agent', color: 'text-fuchsia-700', bgColor: 'bg-fuchsia-100' },
    critical_decision: { label: 'Critical', color: 'text-red-700', bgColor: 'bg-red-100' },
    final_review: { label: 'Final', color: 'text-green-700', bgColor: 'bg-green-100' },
  };

  const config = configs[type] || { label: type, color: 'text-slate-700', bgColor: 'bg-slate-100' };

  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', config.bgColor, config.color)}>
      {config.label}
    </span>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getDefaultCheckpointEnabled(checkpointType: CheckpointType, autonomyBand: AutonomyBand): boolean {
  switch (autonomyBand) {
    case 'supervised':
      return true; // All checkpoints enabled
    case 'guided':
      // Only critical and final review checkpoints enabled in guided mode
      return checkpointType === 'critical_decision' || checkpointType === 'final_review';
    case 'autonomous':
      // Only final review checkpoint enabled in autonomous mode
      return checkpointType === 'final_review';
  }
}

export default MissionBriefing;
