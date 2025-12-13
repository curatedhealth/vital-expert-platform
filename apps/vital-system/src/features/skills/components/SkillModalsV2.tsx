/**
 * SkillModalsV2 - Create/Edit/Delete modals for Skills
 *
 * V2 version using Vital Forms Library with React Hook Form + Zod.
 */
'use client';

import React, { useEffect } from 'react';
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
  Sparkles,
  Settings,
  Tag,
  Building2,
  Users,
  Bot,
  GraduationCap,
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
  VitalSwitchField,
  VitalTagInputField,
  VitalNumberField,
  VitalSliderField,
  VitalCascadingSelectField,
  fetchFunctions,
  fetchDepartments,
  fetchRoles,
  fetchAgents,
} from '@/lib/forms';

// Import schemas
import {
  skillSchema,
  type Skill,
  SKILL_CATEGORY_OPTIONS,
  SKILL_LEVEL_OPTIONS,
  SKILL_TYPE_OPTIONS,
} from '@/lib/forms/schemas';

// =============================================================================
// Status Options
// =============================================================================

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'deprecated', label: 'Deprecated' },
  { value: 'archived', label: 'Archived' },
] as const;

// Category options with labels
const CATEGORY_OPTIONS = SKILL_CATEGORY_OPTIONS.map((cat) => ({
  value: cat,
  label: cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
}));

// Level options with labels and descriptions
const LEVEL_OPTIONS = [
  { value: 'foundational', label: 'Foundational', description: 'Basic skills anyone can learn' },
  { value: 'intermediate', label: 'Intermediate', description: 'Requires some background knowledge' },
  { value: 'advanced', label: 'Advanced', description: 'Requires significant expertise' },
  { value: 'expert', label: 'Expert', description: 'Specialized domain expert level' },
];

// Type options with labels
const TYPE_OPTIONS = SKILL_TYPE_OPTIONS.map((type) => ({
  value: type,
  label: type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
}));

// =============================================================================
// Default Values
// =============================================================================

export const DEFAULT_SKILL_VALUES: Partial<Skill> = {
  name: '',
  display_name: '',
  description: '',
  category: 'analysis',
  type: 'core',
  level: 'foundational',
  prerequisites: [],
  related_skills: [],
  tags: [],
  is_learnable: true,
  is_certifiable: false,
  status: 'active',
  is_active: true,
};

// =============================================================================
// Edit Modal Props
// =============================================================================

interface SkillEditModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  skill?: Partial<Skill> | null;
  onSave: (data: Skill) => void | Promise<void>;
  isSaving?: boolean;
  error?: string | null;
}

// =============================================================================
// Skill Edit Modal V2
// =============================================================================

export function SkillEditModalV2({
  isOpen,
  onClose,
  skill,
  onSave,
  isSaving = false,
  error,
}: SkillEditModalV2Props) {
  const form = useVitalForm(skillSchema, {
    defaultValues: DEFAULT_SKILL_VALUES,
  });

  // Reset form when skill changes or modal opens
  useEffect(() => {
    if (isOpen && skill) {
      form.reset({
        ...DEFAULT_SKILL_VALUES,
        ...skill,
        tags: skill.tags || [],
        prerequisites: skill.prerequisites || [],
        related_skills: skill.related_skills || [],
      });
    } else if (isOpen && !skill) {
      form.reset(DEFAULT_SKILL_VALUES);
    }
  }, [isOpen, skill, form]);

  // Auto-sync display_name with name
  const name = form.watch('name');
  useEffect(() => {
    const displayName = form.getValues('display_name');
    if (name && !displayName) {
      form.setValue('display_name', name);
    }
  }, [name, form]);

  const handleSubmit = async (data: Skill) => {
    await onSave(data);
  };

  const isEditing = !!skill?.id;
  const isCertifiable = form.watch('is_certifiable');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {isEditing ? 'Edit Skill' : 'Create New Skill'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the skill details below'
              : 'Define a new skill for agents and personas'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mx-6">
            <VitalFormMessage type="error" message={error} />
          </div>
        )}

        <VitalForm form={form} onSubmit={handleSubmit} className="flex-1">
          <Tabs defaultValue="basic" className="flex-1">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Basic
                </TabsTrigger>
                <TabsTrigger value="classification" className="gap-1">
                  <Tag className="h-3 w-3" />
                  Classification
                </TabsTrigger>
                <TabsTrigger value="organization" className="gap-1">
                  <Building2 className="h-3 w-3" />
                  Organization
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-1">
                  <Settings className="h-3 w-3" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[55vh] px-6 py-4">
              {/* Basic Tab */}
              <TabsContent value="basic" className="space-y-4 mt-0">
                <VitalFormGrid columns={2}>
                  <VitalInputField
                    name="name"
                    label="Name"
                    placeholder="e.g., data-analysis"
                    required
                  />
                  <VitalInputField
                    name="display_name"
                    label="Display Name"
                    placeholder="e.g., Data Analysis"
                  />
                </VitalFormGrid>

                <VitalTextareaField
                  name="description"
                  label="Description"
                  placeholder="Describe what this skill enables..."
                  rows={3}
                />

                <VitalFormGrid columns={2}>
                  <VitalSelectField
                    name="category"
                    label="Category"
                    options={CATEGORY_OPTIONS}
                    placeholder="Select category"
                    required
                  />
                  <VitalSelectField
                    name="status"
                    label="Status"
                    options={STATUS_OPTIONS}
                    placeholder="Select status"
                  />
                </VitalFormGrid>

                <VitalTagInputField
                  name="tags"
                  label="Tags"
                  placeholder="analytics, data, reporting"
                />
              </TabsContent>

              {/* Classification Tab */}
              <TabsContent value="classification" className="space-y-4 mt-0">
                <VitalFormGrid columns={2}>
                  <VitalSelectField
                    name="type"
                    label="Skill Type"
                    options={TYPE_OPTIONS}
                    placeholder="Select type"
                  />
                  <VitalSelectField
                    name="level"
                    label="Proficiency Level"
                    icon={GraduationCap}
                    options={LEVEL_OPTIONS}
                    placeholder="Select level"
                  />
                </VitalFormGrid>

                <VitalFormSection title="Related Skills">
                  <VitalTagInputField
                    name="prerequisites"
                    label="Prerequisites"
                    placeholder="basic-analytics, statistics"
                    description="Skills required before learning this one"
                  />

                  <VitalTagInputField
                    name="related_skills"
                    label="Related Skills"
                    placeholder="data-visualization, report-writing"
                    description="Skills that complement this one"
                  />
                </VitalFormSection>
              </TabsContent>

              {/* Organization Tab */}
              <TabsContent value="organization" className="space-y-4 mt-0">
                <VitalFormMessage
                  type="info"
                  message="Link this skill to organizational structure for better targeting and discoverability."
                />

                <VitalCascadingSelectField
                  name="function_id"
                  nameField="function_name"
                  label="Function"
                  icon={Building2}
                  placeholder="Select function"
                  fetchOptions={fetchFunctions}
                  resetFields={['department_id', 'department_name', 'role_id', 'role_name']}
                />

                <VitalCascadingSelectField
                  name="department_id"
                  nameField="department_name"
                  parentField="function_id"
                  label="Department"
                  icon={Users}
                  placeholder="Select department"
                  disabledPlaceholder="Select function first"
                  fetchOptions={fetchDepartments}
                  resetFields={['role_id', 'role_name']}
                />

                <VitalCascadingSelectField
                  name="role_id"
                  nameField="role_name"
                  parentField="department_id"
                  label="Role"
                  placeholder="Select role"
                  disabledPlaceholder="Select department first"
                  fetchOptions={fetchRoles}
                />

                <VitalCascadingSelectField
                  name="agent_id"
                  nameField="agent_name"
                  label="Associated Agent"
                  icon={Bot}
                  placeholder="Select agent (optional)"
                  description="Optionally link this skill to a specific AI agent"
                  fetchOptions={fetchAgents}
                />
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4 mt-0">
                <VitalFormSection title="Availability">
                  <VitalSwitchField
                    name="is_active"
                    label="Active"
                    description="Skill is available for use"
                    variant="card"
                  />
                </VitalFormSection>

                <VitalFormSection title="Learning Configuration">
                  <VitalSwitchField
                    name="is_learnable"
                    label="Learnable"
                    description="Can be acquired through training or experience"
                    variant="card"
                  />

                  <VitalSwitchField
                    name="is_certifiable"
                    label="Certifiable"
                    description="Formal certification available for this skill"
                    variant="card"
                  />

                  {isCertifiable && (
                    <VitalNumberField
                      name="estimated_learning_hours"
                      label="Estimated Learning Hours"
                      min={0}
                      max={1000}
                      showButtons
                      suffix="hours"
                      description="Approximate time to achieve proficiency"
                    />
                  )}
                </VitalFormSection>

                <VitalFormSection title="Proficiency Tracking">
                  <VitalSliderField
                    name="proficiency.confidence_score"
                    label="Confidence Score"
                    min={0}
                    max={100}
                    step={5}
                    showValue
                    valueSuffix="%"
                    description="Current confidence level in this skill"
                  />
                </VitalFormSection>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter className="px-6 py-4 border-t">
            <VitalFormActions>
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
                    {isEditing ? 'Update Skill' : 'Create Skill'}
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
// Delete Modal Props
// =============================================================================

interface SkillDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: Partial<Skill> | null;
  onConfirm: () => void;
  isDeleting?: boolean;
}

// =============================================================================
// Skill Delete Modal
// =============================================================================

export function SkillDeleteModalV2({
  isOpen,
  onClose,
  skill,
  onConfirm,
  isDeleting = false,
}: SkillDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Skill</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{skill?.name || skill?.display_name}&quot;?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
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
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Batch Delete Modal
// =============================================================================

interface SkillBatchDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function SkillBatchDeleteModal({
  isOpen,
  onClose,
  count,
  onConfirm,
  isDeleting = false,
}: SkillBatchDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {count} Skills</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {count} selected skills?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
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
                Delete {count} Skills
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SkillEditModalV2;
