/**
 * PersonaModalsV2 - Create/Edit/Delete modals for Personas
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
  UserCircle,
  Building2,
  Brain,
  Zap,
  Target,
  Settings,
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
  VitalTagInputField,
  VitalCascadingSelectField,
  fetchFunctions,
  fetchDepartments,
  fetchRoles,
} from '@/lib/forms';

import type { Persona, PersonaArchetype, ServiceLayer } from './types';

// =============================================================================
// Persona Schema
// =============================================================================

const personaSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  title: z.string().max(255).optional(),
  tagline: z.string().max(500).optional(),
  one_liner: z.string().max(300).optional(),

  // MECE Archetype
  persona_type: z.enum(['AUTOMATOR', 'ORCHESTRATOR', 'LEARNER', 'SKEPTIC']).optional(),
  derived_archetype: z.enum(['AUTOMATOR', 'ORCHESTRATOR', 'LEARNER', 'SKEPTIC']).optional(),
  preferred_service_layer: z.enum(['L1_expert', 'L2_panel', 'L3_workflow', 'L4_solution']).optional(),

  // Scores (0-1 scale)
  ai_readiness_score: z.number().min(0).max(1).optional(),
  work_complexity_score: z.number().min(0).max(1).optional(),

  // Org structure
  function_id: z.string().uuid().optional().nullable(),
  department_id: z.string().uuid().optional().nullable(),
  role_id: z.string().uuid().optional().nullable(),

  // Demographics
  seniority_level: z.enum(['entry', 'mid', 'senior', 'director', 'executive']).optional(),
  years_of_experience: z.number().min(0).max(50).optional(),
  age_range: z.string().optional(),
  education_level: z.string().optional(),
  geographic_scope: z.enum(['local', 'regional', 'global']).optional(),

  // Work mix
  project_work_ratio: z.number().min(0).max(100).optional(),
  bau_work_ratio: z.number().min(0).max(100).optional(),

  // Arrays
  goals: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  motivations: z.array(z.string()).optional(),
  frustrations: z.array(z.string()).optional(),
  daily_activities: z.array(z.string()).optional(),
  tools_used: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),

  // Status
  is_active: z.boolean().optional(),
});

type PersonaFormData = z.infer<typeof personaSchema>;

// =============================================================================
// Status Options
// =============================================================================

const ARCHETYPE_OPTIONS = [
  { value: 'AUTOMATOR', label: 'Automator - High AI, Low Complexity' },
  { value: 'ORCHESTRATOR', label: 'Orchestrator - High AI, High Complexity' },
  { value: 'LEARNER', label: 'Learner - Low AI, Low Complexity' },
  { value: 'SKEPTIC', label: 'Skeptic - Low AI, High Complexity' },
] as const;

const SERVICE_LAYER_OPTIONS = [
  { value: 'L1_expert', label: 'L1 Expert - Quick answers' },
  { value: 'L2_panel', label: 'L2 Panel - Multi-expert' },
  { value: 'L3_workflow', label: 'L3 Workflow - Guided automation' },
  { value: 'L4_solution', label: 'L4 Solution - End-to-end' },
] as const;

const SENIORITY_OPTIONS = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'director', label: 'Director' },
  { value: 'executive', label: 'Executive' },
] as const;

const GEOGRAPHIC_OPTIONS = [
  { value: 'local', label: 'Local' },
  { value: 'regional', label: 'Regional' },
  { value: 'global', label: 'Global' },
] as const;

// =============================================================================
// Default Values
// =============================================================================

export const DEFAULT_PERSONA_VALUES: Partial<PersonaFormData> = {
  name: '',
  title: '',
  tagline: '',
  persona_type: undefined,
  ai_readiness_score: 0.5,
  work_complexity_score: 0.5,
  seniority_level: 'mid',
  geographic_scope: 'regional',
  project_work_ratio: 50,
  bau_work_ratio: 50,
  goals: [],
  challenges: [],
  motivations: [],
  frustrations: [],
  daily_activities: [],
  tools_used: [],
  skills: [],
  is_active: true,
};

// =============================================================================
// Edit Modal Props
// =============================================================================

interface PersonaEditModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  persona?: Partial<Persona> | null;
  onSave: (data: PersonaFormData) => void | Promise<void>;
  isSaving?: boolean;
  error?: string | null;
}

// =============================================================================
// Persona Edit Modal V2
// =============================================================================

export function PersonaEditModalV2({
  isOpen,
  onClose,
  persona,
  onSave,
  isSaving = false,
  error,
}: PersonaEditModalV2Props) {
  const form = useVitalForm(personaSchema, {
    defaultValues: DEFAULT_PERSONA_VALUES,
  });

  const isEditMode = !!persona?.id;

  // Reset form when persona changes or modal opens
  useEffect(() => {
    if (isOpen && persona) {
      // Map persona data to form schema
      const formData: Partial<PersonaFormData> = {
        name: persona.name || '',
        title: persona.title,
        tagline: persona.tagline,
        one_liner: persona.one_liner,
        persona_type: persona.persona_type as PersonaFormData['persona_type'],
        derived_archetype: persona.derived_archetype as PersonaFormData['derived_archetype'],
        preferred_service_layer: persona.preferred_service_layer as PersonaFormData['preferred_service_layer'],
        ai_readiness_score: typeof persona.ai_readiness_score === 'number' ? persona.ai_readiness_score : undefined,
        work_complexity_score: typeof persona.work_complexity_score === 'number' ? persona.work_complexity_score : undefined,
        function_id: persona.function_id,
        department_id: persona.department_id,
        role_id: persona.role_id,
        seniority_level: persona.seniority_level as PersonaFormData['seniority_level'],
        years_of_experience: typeof persona.years_of_experience === 'number' ? persona.years_of_experience : undefined,
        age_range: persona.age_range,
        education_level: persona.education_level,
        geographic_scope: persona.geographic_scope as PersonaFormData['geographic_scope'],
        project_work_ratio: persona.project_work_ratio,
        bau_work_ratio: persona.bau_work_ratio,
        goals: persona.goals || [],
        challenges: persona.challenges || [],
        motivations: persona.motivations || [],
        frustrations: persona.frustrations || [],
        daily_activities: persona.daily_activities || [],
        tools_used: persona.tools_used || [],
        skills: persona.skills || [],
        is_active: persona.is_active,
      };
      form.reset({ ...DEFAULT_PERSONA_VALUES, ...formData });
    } else if (isOpen && !persona) {
      form.reset(DEFAULT_PERSONA_VALUES);
    }
  }, [isOpen, persona, form]);

  const handleSubmit = async (data: PersonaFormData) => {
    // Auto-derive archetype from scores if not set
    if (!data.derived_archetype && data.ai_readiness_score !== undefined && data.work_complexity_score !== undefined) {
      const highAI = data.ai_readiness_score >= 0.5;
      const highComplexity = data.work_complexity_score >= 0.5;

      if (highAI && !highComplexity) data.derived_archetype = 'AUTOMATOR';
      else if (highAI && highComplexity) data.derived_archetype = 'ORCHESTRATOR';
      else if (!highAI && !highComplexity) data.derived_archetype = 'LEARNER';
      else data.derived_archetype = 'SKEPTIC';
    }

    await onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            {isEditMode ? 'Edit Persona' : 'Create Persona'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update persona details and MECE classification'
              : 'Create a new persona with archetype classification'}
          </DialogDescription>
        </DialogHeader>

        <VitalForm form={form} onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="mb-4 w-full justify-start">
                <TabsTrigger value="basic" className="flex items-center gap-1">
                  <UserCircle className="h-4 w-4" />
                  Basic
                </TabsTrigger>
                <TabsTrigger value="archetype" className="flex items-center gap-1">
                  <Brain className="h-4 w-4" />
                  Archetype
                </TabsTrigger>
                <TabsTrigger value="org" className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  Organization
                </TabsTrigger>
                <TabsTrigger value="context" className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Context
                </TabsTrigger>
              </TabsList>

              {/* Basic Tab */}
              <TabsContent value="basic" className="space-y-4">
                <VitalFormSection title="Identity" description="Basic persona information">
                  <VitalFormGrid columns={2}>
                    <VitalInputField
                      name="name"
                      label="Name"
                      placeholder="e.g., Clinical Research Manager"
                      required
                    />
                    <VitalInputField
                      name="title"
                      label="Title"
                      placeholder="e.g., Senior Manager, Clinical Operations"
                    />
                  </VitalFormGrid>

                  <VitalTextareaField
                    name="tagline"
                    label="Tagline"
                    placeholder="Brief description of this persona's role and focus"
                    rows={2}
                  />

                  <VitalInputField
                    name="one_liner"
                    label="One-liner"
                    placeholder="A single sentence describing this persona"
                  />
                </VitalFormSection>

                <VitalFormSection title="Demographics" description="Experience and background">
                  <VitalFormGrid columns={3}>
                    <VitalSelectField
                      name="seniority_level"
                      label="Seniority Level"
                      options={SENIORITY_OPTIONS}
                    />
                    <VitalNumberField
                      name="years_of_experience"
                      label="Years of Experience"
                      min={0}
                      max={50}
                    />
                    <VitalSelectField
                      name="geographic_scope"
                      label="Geographic Scope"
                      options={GEOGRAPHIC_OPTIONS}
                    />
                  </VitalFormGrid>
                </VitalFormSection>
              </TabsContent>

              {/* Archetype Tab */}
              <TabsContent value="archetype" className="space-y-4">
                <VitalFormSection
                  title="MECE Archetype"
                  description="AI readiness and work complexity determine the archetype"
                >
                  <VitalFormGrid columns={2}>
                    <VitalNumberField
                      name="ai_readiness_score"
                      label="AI Readiness Score (0-1)"
                      min={0}
                      max={1}
                      step={0.1}
                      description="0 = Low AI readiness, 1 = High AI readiness"
                    />
                    <VitalNumberField
                      name="work_complexity_score"
                      label="Work Complexity Score (0-1)"
                      min={0}
                      max={1}
                      step={0.1}
                      description="0 = Low complexity, 1 = High complexity"
                    />
                  </VitalFormGrid>

                  <VitalFormGrid columns={2}>
                    <VitalSelectField
                      name="persona_type"
                      label="Manual Archetype Override"
                      options={ARCHETYPE_OPTIONS}
                      description="Optional - will be auto-derived from scores if not set"
                    />
                    <VitalSelectField
                      name="preferred_service_layer"
                      label="Preferred Service Layer"
                      options={SERVICE_LAYER_OPTIONS}
                      description="Which VITAL service layer suits this persona"
                    />
                  </VitalFormGrid>
                </VitalFormSection>

                <VitalFormSection title="Work Mix" description="Balance of project vs BAU work">
                  <VitalFormGrid columns={2}>
                    <VitalNumberField
                      name="project_work_ratio"
                      label="Project Work %"
                      min={0}
                      max={100}
                      description="Percentage of time on projects"
                    />
                    <VitalNumberField
                      name="bau_work_ratio"
                      label="BAU Work %"
                      min={0}
                      max={100}
                      description="Percentage of time on business-as-usual"
                    />
                  </VitalFormGrid>
                </VitalFormSection>
              </TabsContent>

              {/* Organization Tab */}
              <TabsContent value="org" className="space-y-4">
                <VitalFormSection
                  title="Organizational Structure"
                  description="Link persona to function, department, and role"
                >
                  <VitalFormGrid columns={1}>
                    <VitalCascadingSelectField
                      name="function_id"
                      label="Function"
                      placeholder="Select function"
                      fetchOptions={fetchFunctions}
                    />
                    <VitalCascadingSelectField
                      name="department_id"
                      label="Department"
                      placeholder="Select department"
                      parentField="function_id"
                      fetchOptions={fetchDepartments}
                      disabledPlaceholder="Select function first"
                    />
                    <VitalCascadingSelectField
                      name="role_id"
                      label="Role"
                      placeholder="Select role"
                      parentField="department_id"
                      fetchOptions={fetchRoles}
                      disabledPlaceholder="Select department first"
                    />
                  </VitalFormGrid>
                </VitalFormSection>
              </TabsContent>

              {/* Context Tab */}
              <TabsContent value="context" className="space-y-4">
                <VitalFormSection title="Goals & Challenges" description="What drives this persona">
                  <VitalTagInputField
                    name="goals"
                    label="Goals"
                    placeholder="Add a goal and press Enter"
                    description="What this persona wants to achieve"
                  />
                  <VitalTagInputField
                    name="challenges"
                    label="Challenges"
                    placeholder="Add a challenge and press Enter"
                    description="Pain points and obstacles"
                  />
                </VitalFormSection>

                <VitalFormSection title="Motivations & Frustrations" description="Emotional drivers">
                  <VitalTagInputField
                    name="motivations"
                    label="Motivations"
                    placeholder="Add a motivation and press Enter"
                  />
                  <VitalTagInputField
                    name="frustrations"
                    label="Frustrations"
                    placeholder="Add a frustration and press Enter"
                  />
                </VitalFormSection>

                <VitalFormSection title="Professional Context" description="Day-to-day work">
                  <VitalTagInputField
                    name="daily_activities"
                    label="Daily Activities"
                    placeholder="Add an activity and press Enter"
                  />
                  <VitalTagInputField
                    name="tools_used"
                    label="Tools Used"
                    placeholder="Add a tool and press Enter"
                  />
                  <VitalTagInputField
                    name="skills"
                    label="Skills"
                    placeholder="Add a skill and press Enter"
                  />
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
                    {isEditMode ? 'Save Changes' : 'Create Persona'}
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

interface PersonaDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: Persona | null;
  onConfirm: () => void | Promise<void>;
  isDeleting?: boolean;
}

export function PersonaDeleteModal({
  isOpen,
  onClose,
  persona,
  onConfirm,
  isDeleting = false,
}: PersonaDeleteModalProps) {
  if (!persona) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Persona
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{persona.name}</strong>? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
          <p className="text-sm text-red-800">
            Deleting this persona will:
          </p>
          <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
            <li>Remove all persona data</li>
            <li>Unlink associated JTBDs ({persona.jtbds_count || 0} linked)</li>
            <li>Remove from reports and analytics</li>
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
                Delete Persona
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PersonaEditModalV2;
