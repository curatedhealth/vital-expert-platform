/**
 * JTBDModalsV2 - Create/Edit/Delete modals for Jobs-to-Be-Done
 *
 * V2 version using Vital Forms Library with React Hook Form + Zod.
 */
'use client';

import React, { useEffect } from 'react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Save,
  Loader2,
  Trash2,
  Target,
  TrendingUp,
  Settings,
  BarChart3,
} from 'lucide-react';

// Import Vital Forms Library
import {
  VitalForm,
  VitalFormGrid,
  VitalFormSection,
  VitalFormActions,
  VitalFormMessage,
  useVitalForm,
  VitalInputField,
  VitalTextareaField,
  VitalSelectField,
  VitalNumberField,
} from '@/lib/forms';

import type { JTBD } from './types';

// =============================================================================
// JTBD Schema
// =============================================================================

const jtbdSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().max(50).optional(),
  job_statement: z.string().optional(),
  description: z.string().optional(),

  // ODI Format
  when_situation: z.string().optional(),
  circumstance: z.string().optional(),
  desired_outcome: z.string().optional(),

  // Classification
  job_type: z.enum(['functional', 'emotional', 'social', 'consumption']).optional(),
  job_category: z.string().max(100).optional(),
  complexity: z.enum(['low', 'medium', 'high', 'very_high']).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'ad_hoc']).optional(),

  // Priority & Status
  status: z.enum(['active', 'planned', 'completed', 'draft']).optional(),
  strategic_priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  impact_level: z.enum(['high', 'medium', 'low']).optional(),
  compliance_sensitivity: z.enum(['high', 'medium', 'low']).optional(),

  // ODI Scores (0-10 scale)
  importance_score: z.number().min(0).max(10).optional(),
  satisfaction_score: z.number().min(0).max(10).optional(),

  // Additional
  recommended_service_layer: z.string().optional(),
  work_pattern: z.string().optional(),
  jtbd_type: z.string().optional(),
  validation_score: z.number().min(0).max(100).optional(),
});

type JTBDFormData = z.infer<typeof jtbdSchema>;

// =============================================================================
// Options
// =============================================================================

const JOB_TYPE_OPTIONS = [
  { value: 'functional', label: 'Functional - What I need to accomplish' },
  { value: 'emotional', label: 'Emotional - How I want to feel' },
  { value: 'social', label: 'Social - How I want to be perceived' },
  { value: 'consumption', label: 'Consumption - How I consume the solution' },
] as const;

const COMPLEXITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'very_high', label: 'Very High' },
] as const;

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
  { value: 'ad_hoc', label: 'Ad Hoc' },
] as const;

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'planned', label: 'Planned' },
  { value: 'completed', label: 'Completed' },
  { value: 'draft', label: 'Draft' },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const;

const IMPACT_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const;

const SERVICE_LAYER_OPTIONS = [
  { value: 'Ask Me', label: 'Ask Me (L0)' },
  { value: 'Ask Expert', label: 'Ask Expert (L1)' },
  { value: 'Ask Panel', label: 'Ask Panel (L2)' },
  { value: 'Workflow', label: 'Workflow (L3)' },
  { value: 'Solution', label: 'Solution (L4)' },
] as const;

// =============================================================================
// Default Values
// =============================================================================

export const DEFAULT_JTBD_VALUES: Partial<JTBDFormData> = {
  name: '',
  code: '',
  job_statement: '',
  description: '',
  when_situation: '',
  circumstance: '',
  desired_outcome: '',
  job_type: 'functional',
  job_category: '',
  complexity: 'medium',
  frequency: 'weekly',
  status: 'active',
  strategic_priority: 'medium',
  impact_level: 'medium',
  compliance_sensitivity: 'low',
  importance_score: 5,
  satisfaction_score: 5,
  recommended_service_layer: '',
};

// =============================================================================
// Edit Modal Props
// =============================================================================

interface JTBDEditModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  jtbd?: Partial<JTBD> | null;
  onSave: (data: JTBDFormData) => void | Promise<void>;
  isSaving?: boolean;
  error?: string | null;
}

// =============================================================================
// JTBD Edit Modal V2
// =============================================================================

export function JTBDEditModalV2({
  isOpen,
  onClose,
  jtbd,
  onSave,
  isSaving = false,
  error,
}: JTBDEditModalV2Props) {
  const form = useVitalForm(jtbdSchema, {
    defaultValues: DEFAULT_JTBD_VALUES,
  });

  const isEditMode = !!jtbd?.id;

  // Watch importance and satisfaction to show calculated opportunity
  const importanceScore = form.watch('importance_score');
  const satisfactionScore = form.watch('satisfaction_score');
  const calculatedOpportunity =
    importanceScore !== undefined && satisfactionScore !== undefined
      ? importanceScore + Math.max(0, importanceScore - satisfactionScore)
      : null;

  // Get ODI tier based on opportunity score
  const getOdiTier = (score: number | null): string => {
    if (score === null) return '—';
    if (score >= 15) return 'Extreme';
    if (score >= 12) return 'High';
    if (score >= 10) return 'Medium';
    return 'Low';
  };

  // Reset form when jtbd changes or modal opens
  useEffect(() => {
    if (isOpen && jtbd) {
      // Map jtbd data to form schema with proper type casting
      const formData: Partial<JTBDFormData> = {
        name: jtbd.job_statement || jtbd.description || '',
        code: jtbd.code,
        job_statement: jtbd.job_statement,
        description: jtbd.description,
        job_type: jtbd.job_type as JTBDFormData['job_type'],
        job_category: jtbd.job_category,
        complexity: jtbd.complexity as JTBDFormData['complexity'],
        frequency: jtbd.frequency as JTBDFormData['frequency'],
        status: jtbd.status as JTBDFormData['status'],
        strategic_priority: (jtbd as any).strategic_priority as JTBDFormData['strategic_priority'],
        impact_level: jtbd.impact_level as JTBDFormData['impact_level'],
        compliance_sensitivity: jtbd.compliance_sensitivity as JTBDFormData['compliance_sensitivity'],
        importance_score: jtbd.importance_score,
        satisfaction_score: jtbd.satisfaction_score,
        recommended_service_layer: jtbd.recommended_service_layer,
        work_pattern: jtbd.work_pattern,
        jtbd_type: jtbd.jtbd_type,
        validation_score: jtbd.validation_score,
      };
      form.reset({ ...DEFAULT_JTBD_VALUES, ...formData });
    } else if (isOpen && !jtbd) {
      form.reset(DEFAULT_JTBD_VALUES);
    }
  }, [isOpen, jtbd, form]);

  const handleSubmit = async (data: JTBDFormData) => {
    // Ensure job_statement matches name if not set
    if (!data.job_statement) {
      data.job_statement = data.name;
    }
    await onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {isEditMode ? 'Edit Job-to-Be-Done' : 'Create Job-to-Be-Done'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update JTBD details and ODI scores'
              : 'Create a new job-to-be-done with ODI scoring'}
          </DialogDescription>
        </DialogHeader>

        <VitalForm form={form} onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="mb-4 w-full justify-start">
                <TabsTrigger value="basic" className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Basic
                </TabsTrigger>
                <TabsTrigger value="odi" className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  ODI Scores
                </TabsTrigger>
                <TabsTrigger value="classification" className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  Classification
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Basic Tab */}
              <TabsContent value="basic" className="space-y-4">
                <VitalFormSection title="Job Identity" description="Core job definition">
                  <VitalFormGrid columns={2}>
                    <VitalInputField
                      name="name"
                      label="Job Name"
                      placeholder="e.g., Analyze clinical trial data"
                      required
                    />
                    <VitalInputField
                      name="code"
                      label="Code"
                      placeholder="e.g., JTBD-001"
                      description="Unique identifier (auto-generated if blank)"
                    />
                  </VitalFormGrid>

                  <VitalTextareaField
                    name="job_statement"
                    label="Job Statement"
                    placeholder="When [situation], I want to [action], so I can [outcome]"
                    rows={2}
                    description="The complete job statement in ODI format"
                  />

                  <VitalTextareaField
                    name="description"
                    label="Description"
                    placeholder="Additional context about this job"
                    rows={3}
                  />
                </VitalFormSection>

                <VitalFormSection title="ODI Format" description="When/Circumstance/Outcome structure">
                  <VitalTextareaField
                    name="when_situation"
                    label="When (Situation)"
                    placeholder="e.g., When I'm preparing for a regulatory submission..."
                    rows={2}
                  />
                  <VitalTextareaField
                    name="circumstance"
                    label="Circumstance"
                    placeholder="e.g., ...and I have limited time and complex data..."
                    rows={2}
                  />
                  <VitalTextareaField
                    name="desired_outcome"
                    label="Desired Outcome"
                    placeholder="e.g., ...so I can submit accurate documentation on time"
                    rows={2}
                  />
                </VitalFormSection>
              </TabsContent>

              {/* ODI Scores Tab */}
              <TabsContent value="odi" className="space-y-4">
                <VitalFormSection
                  title="ODI Scoring"
                  description="Importance, Satisfaction, and calculated Opportunity"
                >
                  <VitalFormGrid columns={2}>
                    <VitalNumberField
                      name="importance_score"
                      label="Importance Score (0-10)"
                      min={0}
                      max={10}
                      step={0.5}
                      description="How important is getting this job done well?"
                    />
                    <VitalNumberField
                      name="satisfaction_score"
                      label="Satisfaction Score (0-10)"
                      min={0}
                      max={10}
                      step={0.5}
                      description="How satisfied are users with current solutions?"
                    />
                  </VitalFormGrid>

                  {/* Calculated Opportunity Display */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-900">Calculated Opportunity Score</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Formula: Importance + max(0, Importance - Satisfaction)
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">
                          {calculatedOpportunity?.toFixed(1) ?? '—'}
                        </div>
                        <div className="text-sm text-blue-700">
                          ODI Tier: <span className="font-semibold">{getOdiTier(calculatedOpportunity)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-sm text-green-700">Low</div>
                      <div className="text-xs text-green-600">&lt; 10</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-sm text-yellow-700">Medium</div>
                      <div className="text-xs text-yellow-600">10 - 11.9</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-sm text-orange-700">High</div>
                      <div className="text-xs text-orange-600">12 - 14.9</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-sm text-red-700">Extreme</div>
                      <div className="text-xs text-red-600">&ge; 15</div>
                    </div>
                  </div>
                </VitalFormSection>

                <VitalFormSection title="Validation" description="Data quality metrics">
                  <VitalNumberField
                    name="validation_score"
                    label="Validation Score (0-100)"
                    min={0}
                    max={100}
                    description="How well-validated is this JTBD with real user data?"
                  />
                </VitalFormSection>
              </TabsContent>

              {/* Classification Tab */}
              <TabsContent value="classification" className="space-y-4">
                <VitalFormSection title="Job Classification" description="Type and characteristics">
                  <VitalFormGrid columns={2}>
                    <VitalSelectField
                      name="job_type"
                      label="Job Type"
                      options={JOB_TYPE_OPTIONS}
                    />
                    <VitalInputField
                      name="job_category"
                      label="Category"
                      placeholder="e.g., Data Analysis, Regulatory, Clinical"
                    />
                  </VitalFormGrid>

                  <VitalFormGrid columns={2}>
                    <VitalSelectField
                      name="complexity"
                      label="Complexity"
                      options={COMPLEXITY_OPTIONS}
                    />
                    <VitalSelectField
                      name="frequency"
                      label="Frequency"
                      options={FREQUENCY_OPTIONS}
                    />
                  </VitalFormGrid>
                </VitalFormSection>

                <VitalFormSection title="Business Context" description="Priority and impact">
                  <VitalFormGrid columns={3}>
                    <VitalSelectField
                      name="strategic_priority"
                      label="Strategic Priority"
                      options={PRIORITY_OPTIONS}
                    />
                    <VitalSelectField
                      name="impact_level"
                      label="Impact Level"
                      options={IMPACT_OPTIONS}
                    />
                    <VitalSelectField
                      name="compliance_sensitivity"
                      label="Compliance Sensitivity"
                      options={IMPACT_OPTIONS}
                    />
                  </VitalFormGrid>
                </VitalFormSection>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <VitalFormSection title="Status & Configuration" description="Lifecycle settings">
                  <VitalFormGrid columns={2}>
                    <VitalSelectField
                      name="status"
                      label="Status"
                      options={STATUS_OPTIONS}
                    />
                    <VitalSelectField
                      name="recommended_service_layer"
                      label="Recommended Service Layer"
                      options={SERVICE_LAYER_OPTIONS}
                      description="Which VITAL service layer best addresses this job"
                    />
                  </VitalFormGrid>

                  <VitalFormGrid columns={2}>
                    <VitalInputField
                      name="work_pattern"
                      label="Work Pattern"
                      placeholder="e.g., Reactive, Proactive, Scheduled"
                    />
                    <VitalInputField
                      name="jtbd_type"
                      label="JTBD Type"
                      placeholder="e.g., Core, Related, Consumption"
                    />
                  </VitalFormGrid>
                </VitalFormSection>
              </TabsContent>
            </Tabs>
          </ScrollArea>

          {error && <VitalFormMessage type="error" message={error} />}

          <DialogFooter className="mt-4 pt-4 border-t">
            <VitalFormActions align="right">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditMode ? 'Save Changes' : 'Create JTBD'}
                  </>
                )}
              </Button>
            </VitalFormActions>
          </DialogFooter>
        </VitalForm>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Delete Confirmation Modal
// =============================================================================

interface JTBDDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  jtbd: JTBD | null;
  onConfirm: () => void | Promise<void>;
  isDeleting?: boolean;
}

export function JTBDDeleteModal({
  isOpen,
  onClose,
  jtbd,
  onConfirm,
  isDeleting = false,
}: JTBDDeleteModalProps) {
  if (!jtbd) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Job-to-Be-Done
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this JTBD? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-neutral-50 border rounded-lg p-4 my-4">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-neutral-500 mt-0.5" />
            <div>
              {jtbd.code && (
                <span className="text-xs font-mono text-neutral-500 block">{jtbd.code}</span>
              )}
              <p className="font-medium">{jtbd.job_statement}</p>
              {jtbd.category && (
                <span className="text-sm text-neutral-500">{jtbd.category}</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            Deleting this JTBD will:
          </p>
          <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
            <li>Remove all job data and ODI scores</li>
            <li>Unlink from personas and workflows</li>
            <li>Remove from analytics and reports</li>
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete JTBD
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default JTBDEditModalV2;
