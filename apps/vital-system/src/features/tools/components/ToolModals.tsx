/**
 * ToolModals - Create/Edit/Delete modals for Tools
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
  Wrench,
  Settings,
  Shield,
  Code,
  Tag,
  Building2,
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
  VitalCascadingSelectField,
  fetchFunctions,
  fetchDepartments,
  fetchRoles,
} from '@/lib/forms';

// Import schemas
import {
  toolSchema,
  type Tool,
  TOOL_CATEGORY_OPTIONS,
  TOOL_TYPE_OPTIONS,
  EXECUTION_MODE_OPTIONS,
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
const CATEGORY_OPTIONS = TOOL_CATEGORY_OPTIONS.map((cat) => ({
  value: cat,
  label: cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
}));

// Type options with labels
const TYPE_OPTIONS = TOOL_TYPE_OPTIONS.map((type) => ({
  value: type,
  label: type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
}));

// Execution mode options with labels
const EXEC_MODE_OPTIONS = EXECUTION_MODE_OPTIONS.map((mode) => ({
  value: mode,
  label: mode.charAt(0).toUpperCase() + mode.slice(1),
}));

// =============================================================================
// Default Values
// =============================================================================

export const DEFAULT_TOOL_VALUES: Partial<Tool> = {
  name: '',
  display_name: '',
  description: '',
  category: 'utility',
  type: 'function',
  execution_mode: 'sync',
  parameters: [],
  tags: [],
  allowed_agents: [],
  required_permissions: [],
  version: '1.0',
  status: 'active',
  is_active: true,
  is_public: false,
  config: {
    timeout_ms: 30000,
    retry_count: 3,
    requires_confirmation: false,
    is_dangerous: false,
  },
};

// =============================================================================
// Edit Modal Props
// =============================================================================

interface ToolEditModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  tool?: Partial<Tool> | null;
  onSave: (data: Tool) => void | Promise<void>;
  isSaving?: boolean;
  error?: string | null;
}

// =============================================================================
// Tool Edit Modal V2
// =============================================================================

export function ToolEditModalV2({
  isOpen,
  onClose,
  tool,
  onSave,
  isSaving = false,
  error,
}: ToolEditModalV2Props) {
  const form = useVitalForm(toolSchema, {
    defaultValues: DEFAULT_TOOL_VALUES,
  });

  // Reset form when tool changes or modal opens
  useEffect(() => {
    if (isOpen && tool) {
      form.reset({
        ...DEFAULT_TOOL_VALUES,
        ...tool,
        tags: tool.tags || [],
        parameters: tool.parameters || [],
        allowed_agents: tool.allowed_agents || [],
        required_permissions: tool.required_permissions || [],
      });
    } else if (isOpen && !tool) {
      form.reset(DEFAULT_TOOL_VALUES);
    }
  }, [isOpen, tool, form]);

  // Auto-sync display_name with name
  const name = form.watch('name');
  useEffect(() => {
    const displayName = form.getValues('display_name');
    if (name && !displayName) {
      form.setValue('display_name', name);
    }
  }, [name, form]);

  const handleSubmit = async (data: Tool) => {
    await onSave(data);
  };

  const isEditing = !!tool?.id;
  const requiresConfirmation = form.watch('config.requires_confirmation');
  const isDangerous = form.watch('config.is_dangerous');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {isEditing ? 'Edit Tool' : 'Create New Tool'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the tool configuration below'
              : 'Configure a new tool for AI agents to use'}
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
                  <Wrench className="h-3 w-3" />
                  Basic
                </TabsTrigger>
                <TabsTrigger value="config" className="gap-1">
                  <Settings className="h-3 w-3" />
                  Configuration
                </TabsTrigger>
                <TabsTrigger value="implementation" className="gap-1">
                  <Code className="h-3 w-3" />
                  Implementation
                </TabsTrigger>
                <TabsTrigger value="access" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Access
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
                    placeholder="e.g., web-search"
                    required
                  />
                  <VitalInputField
                    name="display_name"
                    label="Display Name"
                    placeholder="e.g., Web Search Tool"
                  />
                </VitalFormGrid>

                <VitalTextareaField
                  name="description"
                  label="Description"
                  placeholder="Describe what this tool does..."
                  rows={3}
                />

                <VitalFormGrid columns={3}>
                  <VitalSelectField
                    name="category"
                    label="Category"
                    options={CATEGORY_OPTIONS}
                    placeholder="Select category"
                    required
                  />
                  <VitalSelectField
                    name="type"
                    label="Type"
                    options={TYPE_OPTIONS}
                    placeholder="Select type"
                  />
                  <VitalSelectField
                    name="execution_mode"
                    label="Execution Mode"
                    options={EXEC_MODE_OPTIONS}
                    placeholder="Select mode"
                  />
                </VitalFormGrid>

                <VitalFormGrid columns={2}>
                  <VitalInputField
                    name="version"
                    label="Version"
                    placeholder="e.g., 1.0"
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
                  placeholder="search, api, external"
                />
              </TabsContent>

              {/* Configuration Tab */}
              <TabsContent value="config" className="space-y-4 mt-0">
                <VitalFormSection title="Execution Settings">
                  <VitalFormGrid columns={2}>
                    <VitalNumberField
                      name="config.timeout_ms"
                      label="Timeout (ms)"
                      min={0}
                      max={300000}
                      step={1000}
                      showButtons
                      suffix="ms"
                    />
                    <VitalNumberField
                      name="config.retry_count"
                      label="Retry Count"
                      min={0}
                      max={5}
                      showButtons
                    />
                  </VitalFormGrid>

                  <VitalNumberField
                    name="config.rate_limit_per_minute"
                    label="Rate Limit (per minute)"
                    min={0}
                    description="Leave empty for no limit"
                  />
                </VitalFormSection>

                <VitalFormSection title="Safety Settings">
                  <VitalSwitchField
                    name="config.requires_confirmation"
                    label="Requires Confirmation"
                    description="User must approve before execution"
                    variant="card"
                  />

                  <VitalSwitchField
                    name="config.is_dangerous"
                    label="Dangerous Operation"
                    description="Mark as potentially destructive (shows warning)"
                    variant="card"
                  />

                  {(requiresConfirmation || isDangerous) && (
                    <VitalFormMessage
                      type="warning"
                      message="This tool has safety restrictions enabled. Users will see warnings before execution."
                    />
                  )}
                </VitalFormSection>

                <VitalFormSection title="Visibility">
                  <VitalSwitchField
                    name="is_active"
                    label="Active"
                    description="Tool is available for use"
                    variant="card"
                  />
                  <VitalSwitchField
                    name="is_public"
                    label="Public"
                    description="Available to all tenants"
                    variant="card"
                  />
                </VitalFormSection>
              </TabsContent>

              {/* Implementation Tab */}
              <TabsContent value="implementation" className="space-y-4 mt-0">
                <VitalFormSection title="Handler Configuration">
                  <VitalInputField
                    name="handler_path"
                    label="Handler Path"
                    placeholder="e.g., tools.search.web_search"
                    description="Python module path to the tool handler"
                  />

                  <VitalInputField
                    name="api_endpoint"
                    label="API Endpoint"
                    placeholder="https://api.example.com/v1/search"
                    description="External API endpoint (for API type tools)"
                  />

                  <VitalTextareaField
                    name="openapi_spec"
                    label="OpenAPI Spec"
                    placeholder="Paste OpenAPI/Swagger specification..."
                    description="Optional: JSON or YAML OpenAPI specification"
                    rows={6}
                  />
                </VitalFormSection>

                <VitalFormSection title="Return Value">
                  <VitalInputField
                    name="return_type"
                    label="Return Type"
                    placeholder="e.g., SearchResults, string, object"
                  />
                </VitalFormSection>
              </TabsContent>

              {/* Access Tab */}
              <TabsContent value="access" className="space-y-4 mt-0">
                <VitalFormSection title="Organization">
                  <VitalCascadingSelectField
                    name="function_id"
                    nameField="function_name"
                    label="Function"
                    icon={Building2}
                    placeholder="Select function"
                    fetchOptions={fetchFunctions}
                    resetFields={['department_id', 'department_name']}
                  />

                  <VitalCascadingSelectField
                    name="department_id"
                    nameField="department_name"
                    parentField="function_id"
                    label="Department"
                    placeholder="Select department"
                    disabledPlaceholder="Select function first"
                    fetchOptions={fetchDepartments}
                  />
                </VitalFormSection>

                <VitalFormSection title="Permissions">
                  <VitalTagInputField
                    name="allowed_agents"
                    label="Allowed Agents"
                    placeholder="agent-1, agent-2"
                    description="Specific agent IDs that can use this tool (empty = all)"
                  />

                  <VitalTagInputField
                    name="required_permissions"
                    label="Required Permissions"
                    placeholder="tools:execute, data:read"
                    description="Permissions required to use this tool"
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
                    {isEditing ? 'Update Tool' : 'Create Tool'}
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

interface ToolDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: Partial<Tool> | null;
  onConfirm: () => void;
  isDeleting?: boolean;
}

// =============================================================================
// Tool Delete Modal
// =============================================================================

export function ToolDeleteModal({
  isOpen,
  onClose,
  tool,
  onConfirm,
  isDeleting = false,
}: ToolDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Tool</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{tool?.name || tool?.display_name}&quot;?
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

interface ToolBatchDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function ToolBatchDeleteModal({
  isOpen,
  onClose,
  count,
  onConfirm,
  isDeleting = false,
}: ToolBatchDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {count} Tools</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {count} selected tools?
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
                Delete {count} Tools
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ToolEditModalV2;
