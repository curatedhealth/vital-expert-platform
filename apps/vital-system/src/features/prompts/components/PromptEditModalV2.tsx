/**
 * PromptEditModalV2 - Create/Edit modal using shared form system
 *
 * Demonstrates usage of the React Hook Form + Zod based form components.
 * This is the recommended pattern for entity CRUD modals.
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
  FileText,
  PenTool,
  Building2,
  Tag,
  Settings,
  Layers,
  Sparkles,
  Shield,
  Zap,
  Bot,
  Users,
  UserCircle,
} from 'lucide-react';

// Import shared form system (Vital-prefixed components)
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
  VitalCascadingSelectField,
  fetchFunctions,
  fetchDepartments,
  fetchRoles,
  fetchAgents,
} from '@/lib/forms';

// Import schemas
import {
  promptSchema,
  type Prompt,
  COMPLEXITY_OPTIONS,
  DOMAIN_OPTIONS,
  TASK_TYPE_OPTIONS,
  PATTERN_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from '@/lib/forms/schemas';

import { PRISM_SUITES } from './PromptSuiteFilter';

// =============================================================================
// Types
// =============================================================================

interface PromptEditModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  prompt?: Partial<Prompt> | null;
  onSave: (data: Prompt) => void | Promise<void>;
  isSaving?: boolean;
  error?: string | null;
}

// =============================================================================
// Suite Options
// =============================================================================

const SUITE_OPTIONS = PRISM_SUITES.map((suite) => ({
  value: suite.code,
  label: suite.name,
}));

// =============================================================================
// Component
// =============================================================================

export function PromptEditModalV2({
  isOpen,
  onClose,
  prompt,
  onSave,
  isSaving = false,
  error,
}: PromptEditModalV2Props) {
  // Initialize form with Zod schema
  const form = useVitalForm(promptSchema, {
    defaultValues: {
      name: '',
      display_name: '',
      description: '',
      prompt_starter: '',
      detailed_prompt: '',
      system_prompt: '',
      user_template: '',
      domain: undefined,
      complexity: 'basic',
      task_type: undefined,
      pattern_type: undefined,
      tags: [],
      variables: [],
      version: '1.0',
      rag_enabled: false,
      expert_validated: false,
      status: 'active',
      is_active: true,
    },
  });

  // Reset form when prompt changes or modal opens
  useEffect(() => {
    if (isOpen && prompt) {
      form.reset({
        ...form.getValues(),
        ...prompt,
        // Ensure arrays are properly initialized
        tags: prompt.tags || [],
        variables: prompt.variables || [],
        rag_context_sources: prompt.rag_context_sources || [],
      });
    } else if (isOpen && !prompt) {
      form.reset();
    }
  }, [isOpen, prompt, form]);

  // Watch for conditional rendering
  const ragEnabled = form.watch('rag_enabled');
  const expertValidated = form.watch('expert_validated');
  const selectedSuite = form.watch('suite');

  // Handle form submission
  const handleSubmit = async (data: Prompt) => {
    await onSave(data);
  };

  // Auto-sync display_name with name if empty
  const name = form.watch('name');
  useEffect(() => {
    const displayName = form.getValues('display_name');
    if (name && !displayName) {
      form.setValue('display_name', name);
    }
  }, [name, form]);

  const isEditing = !!prompt?.id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isEditing ? 'Edit Prompt' : 'Create New Prompt'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the prompt details below'
              : 'Fill in the details to create a new prompt'}
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
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic" className="gap-1">
                  <FileText className="h-3 w-3" />
                  Basic
                </TabsTrigger>
                <TabsTrigger value="content" className="gap-1">
                  <PenTool className="h-3 w-3" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="organization" className="gap-1">
                  <Building2 className="h-3 w-3" />
                  Organization
                </TabsTrigger>
                <TabsTrigger value="classification" className="gap-1">
                  <Tag className="h-3 w-3" />
                  Classification
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-1">
                  <Settings className="h-3 w-3" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[55vh] px-6 py-4">
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-0">
                <VitalFormGrid columns={2}>
                  <VitalInputField
                    name="name"
                    label="Name"
                    placeholder="e.g., Clinical Trial Protocol Review"
                    required
                  />
                  <VitalInputField
                    name="display_name"
                    label="Display Name"
                    placeholder="e.g., Protocol Review Assistant"
                  />
                </VitalFormGrid>

                <VitalTextareaField
                  name="description"
                  label="Description"
                  placeholder="Brief description of what this prompt does..."
                  rows={3}
                />

                <VitalFormGrid columns={2}>
                  <VitalSelectField
                    name="suite"
                    label="PRISM Suite"
                    icon={Layers}
                    options={SUITE_OPTIONS}
                    placeholder="Select suite"
                  />
                  <VitalCascadingSelectField
                    name="sub_suite"
                    nameField="sub_suite_name"
                    parentField="suite"
                    label="Sub-Suite"
                    icon={Layers}
                    placeholder="Select sub-suite"
                    disabledPlaceholder="Select suite first"
                    fetchOptions={async (suiteCode) => {
                      if (!suiteCode) return [];
                      const res = await fetch('/api/prism-suites');
                      if (!res.ok) return [];
                      const data = await res.json();
                      const allSubSuites = data.subSuites || [];
                      const cleanCode = suiteCode.replace('™', '').toUpperCase();
                      return allSubSuites
                        .filter((ss: { suiteCode: string }) =>
                          ss.suiteCode === cleanCode || ss.suiteCode === suiteCode
                        )
                        .map((ss: { id: string; code: string; name: string }) => ({
                          id: ss.code,
                          name: ss.name,
                        }));
                    }}
                  />
                </VitalFormGrid>

                <VitalFormGrid columns={2}>
                  <VitalInputField
                    name="version"
                    label="Version"
                    placeholder="e.g., 1.0, 2.1"
                  />
                  <VitalSelectField
                    name="status"
                    label="Status"
                    options={STATUS_OPTIONS}
                    placeholder="Select status"
                  />
                </VitalFormGrid>
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-4 mt-0">
                <VitalTextareaField
                  name="prompt_starter"
                  label="Prompt Starter"
                  icon={Sparkles}
                  placeholder="A quick-start version of the prompt for immediate use..."
                  description="A concise version users can start with immediately"
                  rows={3}
                />

                <VitalTextareaField
                  name="detailed_prompt"
                  label="Detailed Prompt"
                  icon={FileText}
                  placeholder="The full detailed prompt with complete instructions..."
                  rows={6}
                />

                <VitalTextareaField
                  name="system_prompt"
                  label="System Prompt"
                  icon={Shield}
                  placeholder="You are an expert in..."
                  rows={5}
                />

                <VitalTextareaField
                  name="user_template"
                  label="User Template"
                  icon={PenTool}
                  placeholder="USER_GOAL: {{question}}&#10;CONTEXT: {{context}}&#10;..."
                  description="Use {{variable}} syntax for dynamic values"
                  rows={4}
                />

                <VitalTagInputField
                  name="variables"
                  label="Variables"
                  placeholder="question, context, document, criteria"
                  description="Template variables that will be replaced at runtime"
                />
              </TabsContent>

              {/* Organization Tab */}
              <TabsContent value="organization" className="space-y-4 mt-0">
                <VitalFormMessage
                  type="info"
                  message="Link this prompt to organizational structure for better discoverability and targeting."
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
                  icon={UserCircle}
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
                  description="Optionally link this prompt to a specific AI agent"
                  fetchOptions={fetchAgents}
                />
              </TabsContent>

              {/* Classification Tab */}
              <TabsContent value="classification" className="space-y-4 mt-0">
                <VitalFormGrid columns={2}>
                  <VitalSelectField
                    name="domain"
                    label="Domain"
                    options={DOMAIN_OPTIONS}
                    placeholder="Select domain"
                  />
                  <VitalSelectField
                    name="complexity"
                    label="Complexity"
                    icon={Zap}
                    options={COMPLEXITY_OPTIONS}
                    placeholder="Select complexity"
                  />
                </VitalFormGrid>

                <VitalFormGrid columns={2}>
                  <VitalSelectField
                    name="task_type"
                    label="Task Type"
                    options={TASK_TYPE_OPTIONS}
                    placeholder="Select task type"
                  />
                  <VitalSelectField
                    name="pattern_type"
                    label="Pattern Type"
                    options={PATTERN_TYPE_OPTIONS}
                    placeholder="Select pattern type"
                  />
                </VitalFormGrid>

                <VitalInputField
                  name="category"
                  label="Category"
                  placeholder="e.g., Regulatory, Clinical, Research"
                />

                <VitalTagInputField
                  name="tags"
                  label="Tags"
                  placeholder="regulatory, clinical, protocol, FDA"
                  showBadges
                />
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4 mt-0">
                <VitalSwitchField
                  name="is_active"
                  label="Active"
                  description="Prompt is available for use"
                  variant="card"
                />

                <VitalSwitchField
                  name="rag_enabled"
                  label="RAG Enabled"
                  description="Enable retrieval-augmented generation for this prompt"
                  variant="card"
                />

                <VitalSwitchField
                  name="expert_validated"
                  label="Expert Validated"
                  description="Prompt has been reviewed and approved by domain experts"
                  variant="card"
                />

                {/* Validation Details (shown if expert validated) */}
                {expertValidated && (
                  <VitalFormSection title="Validation Details" className="pt-4 border-t">
                    <VitalFormGrid columns={2}>
                      <VitalInputField
                        name="validator_name"
                        label="Validator Name"
                        placeholder="Dr. Jane Smith"
                      />
                      <VitalInputField
                        name="validator_credentials"
                        label="Credentials"
                        placeholder="MD, PhD, Regulatory Affairs"
                      />
                    </VitalFormGrid>
                  </VitalFormSection>
                )}

                {/* RAG Context Sources (shown if RAG enabled) */}
                {ragEnabled && (
                  <VitalFormSection className="pt-4 border-t">
                    <VitalTagInputField
                      name="rag_context_sources"
                      label="RAG Context Sources"
                      placeholder="clinical_trials, regulatory_docs, guidelines"
                      description="Knowledge base collections to use for context retrieval"
                    />
                  </VitalFormSection>
                )}
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
                    {isEditing ? 'Update Prompt' : 'Create Prompt'}
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

export default PromptEditModalV2;
