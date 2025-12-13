/**
 * RAG Modals V2 - Create/Edit/Delete modals for RAG Knowledge Bases
 *
 * V2 version using Vital Forms Library with React Hook Form + Zod.
 * Includes organizational context, therapeutic areas, and lifecycle management.
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
  Database,
  Settings,
  Shield,
  Building2,
  Brain,
  Stethoscope,
  Tags,
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
  VitalMultiSelectField,
  fetchFunctions,
  fetchDepartments,
  fetchRoles,
  fetchAgents,
} from '@/lib/forms';

// Import schemas
import {
  ragSchema,
  type Rag,
  RAG_TYPE_OPTIONS,
  EMBEDDING_MODEL_OPTIONS,
  ACCESS_LEVEL_OPTIONS,
  LIFECYCLE_STATUS_OPTIONS,
} from '@/lib/forms/schemas';

// Import healthcare domain constants
import {
  THERAPEUTIC_AREAS,
  KNOWLEDGE_DOMAINS,
  EMBEDDING_MODELS,
  ACCESS_LEVELS,
  LIFECYCLE_STATUS,
  DRUG_LIFECYCLE_PHASES,
} from '@/lib/constants/healthcare-domains';

// =============================================================================
// Options with Labels
// =============================================================================

const RAG_TYPE_OPTIONS_WITH_LABELS = [
  { value: 'global', label: 'Global', description: 'Available to all agents' },
  { value: 'agent-specific', label: 'Agent-Specific', description: 'Assigned to specific agents' },
  { value: 'tenant', label: 'Tenant', description: 'Scoped to a specific tenant' },
];

const STATUS_OPTIONS = LIFECYCLE_STATUS.map(s => ({
  value: s.value,
  label: s.label,
}));

const EMBEDDING_MODEL_OPTIONS_WITH_LABELS = EMBEDDING_MODELS.map(m => ({
  value: m.value,
  label: m.label,
  description: m.description,
}));

const ACCESS_LEVEL_OPTIONS_WITH_LABELS = ACCESS_LEVELS.map(a => ({
  value: a.value,
  label: a.label,
  description: a.description,
}));

const THERAPEUTIC_AREA_OPTIONS = THERAPEUTIC_AREAS.map(ta => ({
  value: ta.value,
  label: ta.label,
}));

const KNOWLEDGE_DOMAIN_OPTIONS = KNOWLEDGE_DOMAINS.map(kd => ({
  value: kd.value,
  label: kd.label,
}));

const LIFECYCLE_PHASE_OPTIONS = DRUG_LIFECYCLE_PHASES.map(p => ({
  value: p.value,
  label: p.label,
}));

const DATA_CLASSIFICATION_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'internal', label: 'Internal' },
  { value: 'confidential', label: 'Confidential' },
  { value: 'restricted', label: 'Restricted' },
];

// =============================================================================
// Default Values
// =============================================================================

export const DEFAULT_RAG_VALUES: Partial<Rag> = {
  name: '',
  display_name: '',
  description: '',
  purpose_description: '',
  rag_type: 'global',
  access_level: 'organization',
  status: 'draft',
  knowledge_domains: [],
  therapeutic_areas: [],
  disease_areas: [],
  tags: [],
  embedding_config: {
    model: 'text-embedding-ada-002',
    chunk_size: 1000,
    chunk_overlap: 200,
    similarity_threshold: 0.7,
  },
  compliance: {
    hipaa_compliant: true,
    contains_phi: false,
    requires_audit_trail: false,
    data_classification: 'internal',
  },
  assigned_agents: [],
  is_active: true,
  is_public: false,
  auto_index: true,
  version: '1.0',
};

// =============================================================================
// Edit Modal Props
// =============================================================================

interface RagEditModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  rag?: Partial<Rag> | null;
  onSave: (data: Rag) => void | Promise<void>;
  isSaving?: boolean;
  error?: string | null;
}

// =============================================================================
// RAG Edit Modal V2
// =============================================================================

export function RagEditModalV2({
  isOpen,
  onClose,
  rag,
  onSave,
  isSaving = false,
  error,
}: RagEditModalV2Props) {
  const form = useVitalForm(ragSchema, {
    defaultValues: DEFAULT_RAG_VALUES,
  });

  // Reset form when rag changes or modal opens
  useEffect(() => {
    if (isOpen && rag) {
      form.reset({
        ...DEFAULT_RAG_VALUES,
        ...rag,
        knowledge_domains: rag.knowledge_domains || [],
        therapeutic_areas: rag.therapeutic_areas || [],
        disease_areas: rag.disease_areas || [],
        tags: rag.tags || [],
        assigned_agents: rag.assigned_agents || [],
      });
    } else if (isOpen && !rag) {
      form.reset(DEFAULT_RAG_VALUES);
    }
  }, [isOpen, rag, form]);

  // Auto-sync display_name with name
  const name = form.watch('name');
  useEffect(() => {
    const displayName = form.getValues('display_name');
    if (name && !displayName) {
      form.setValue('display_name', name);
    }
  }, [name, form]);

  const handleSubmit = async (data: Rag) => {
    await onSave(data);
  };

  const isEditing = !!rag?.id;
  const ragType = form.watch('rag_type');
  const containsPhi = form.watch('compliance.contains_phi');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {isEditing ? 'Edit RAG Knowledge Base' : 'Create RAG Knowledge Base'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the RAG knowledge base configuration'
              : 'Configure a new RAG knowledge base for AI agents'}
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
                  <Database className="h-3 w-3" />
                  Basic
                </TabsTrigger>
                <TabsTrigger value="domains" className="gap-1">
                  <Stethoscope className="h-3 w-3" />
                  Domains
                </TabsTrigger>
                <TabsTrigger value="organization" className="gap-1">
                  <Building2 className="h-3 w-3" />
                  Organization
                </TabsTrigger>
                <TabsTrigger value="technical" className="gap-1">
                  <Settings className="h-3 w-3" />
                  Technical
                </TabsTrigger>
                <TabsTrigger value="compliance" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Compliance
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
                    placeholder="e.g., fda-regulatory-guidelines"
                    required
                  />
                  <VitalInputField
                    name="display_name"
                    label="Display Name"
                    placeholder="e.g., FDA Regulatory Guidelines"
                  />
                </VitalFormGrid>

                <VitalTextareaField
                  name="description"
                  label="Description"
                  placeholder="Describe what this RAG knowledge base contains..."
                  rows={3}
                />

                <VitalTextareaField
                  name="purpose_description"
                  label="Usage Purpose"
                  placeholder="Explain when and how this RAG should be used by agents..."
                  rows={3}
                  description="This helps agents understand when to use this knowledge base."
                />

                <VitalFormGrid columns={3}>
                  <VitalSelectField
                    name="rag_type"
                    label="RAG Type"
                    icon={Database}
                    options={RAG_TYPE_OPTIONS_WITH_LABELS}
                    placeholder="Select type"
                    required
                  />
                  <VitalSelectField
                    name="access_level"
                    label="Access Level"
                    options={ACCESS_LEVEL_OPTIONS_WITH_LABELS}
                    placeholder="Select access level"
                  />
                  <VitalSelectField
                    name="status"
                    label="Status"
                    options={STATUS_OPTIONS}
                    placeholder="Select status"
                  />
                </VitalFormGrid>

                <VitalFormGrid columns={2}>
                  <VitalInputField
                    name="version"
                    label="Version"
                    placeholder="1.0"
                  />
                  <VitalSelectField
                    name="lifecycle_phase"
                    label="Drug Lifecycle Phase"
                    options={LIFECYCLE_PHASE_OPTIONS}
                    placeholder="Select phase (optional)"
                  />
                </VitalFormGrid>

                <VitalTagInputField
                  name="tags"
                  label="Tags"
                  placeholder="regulatory, fda, guidance"
                />
              </TabsContent>

              {/* Domains Tab */}
              <TabsContent value="domains" className="space-y-4 mt-0">
                <VitalFormSection title="Knowledge Domains">
                  <VitalFormMessage
                    type="info"
                    message="Select the knowledge domains covered by this RAG. This helps with routing and relevance scoring."
                  />
                  <VitalMultiSelectField
                    name="knowledge_domains"
                    label="Knowledge Domains"
                    options={KNOWLEDGE_DOMAIN_OPTIONS}
                    placeholder="Select domains..."
                    description="Categories of knowledge contained in this RAG"
                  />
                </VitalFormSection>

                <VitalFormSection title="Therapeutic Areas">
                  <VitalMultiSelectField
                    name="therapeutic_areas"
                    label="Therapeutic Areas"
                    icon={Stethoscope}
                    options={THERAPEUTIC_AREA_OPTIONS}
                    placeholder="Select therapeutic areas..."
                    description="Medical specialties this RAG is relevant for"
                  />
                </VitalFormSection>

                <VitalFormSection title="Disease Areas">
                  <VitalTagInputField
                    name="disease_areas"
                    label="Disease Areas"
                    placeholder="nsclc, breast-cancer, heart-failure"
                    description="Specific diseases or conditions (enter as tags)"
                  />
                </VitalFormSection>
              </TabsContent>

              {/* Organization Tab */}
              <TabsContent value="organization" className="space-y-4 mt-0">
                <VitalFormMessage
                  type="info"
                  message="Link this RAG to organizational structure for better access control and discoverability."
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

                {ragType === 'agent-specific' && (
                  <VitalFormSection title="Agent Assignments">
                    <VitalFormMessage
                      type="info"
                      message="For agent-specific RAGs, assign which agents can access this knowledge base."
                    />
                    <VitalCascadingSelectField
                      name="primary_agent_id"
                      nameField="primary_agent_name"
                      label="Primary Agent"
                      icon={Brain}
                      placeholder="Select primary agent"
                      description="The main agent that uses this RAG"
                      fetchOptions={fetchAgents}
                    />
                  </VitalFormSection>
                )}
              </TabsContent>

              {/* Technical Tab */}
              <TabsContent value="technical" className="space-y-4 mt-0">
                <VitalFormSection title="Embedding Configuration">
                  <VitalSelectField
                    name="embedding_config.model"
                    label="Embedding Model"
                    options={EMBEDDING_MODEL_OPTIONS_WITH_LABELS}
                    placeholder="Select model"
                  />

                  <VitalFormGrid columns={2}>
                    <VitalNumberField
                      name="embedding_config.chunk_size"
                      label="Chunk Size (tokens)"
                      min={100}
                      max={4000}
                      step={100}
                      showButtons
                      description="Size of text chunks for embedding"
                    />
                    <VitalNumberField
                      name="embedding_config.chunk_overlap"
                      label="Chunk Overlap (tokens)"
                      min={0}
                      max={1000}
                      step={50}
                      showButtons
                      description="Overlap between chunks"
                    />
                  </VitalFormGrid>

                  <VitalSliderField
                    name="embedding_config.similarity_threshold"
                    label="Similarity Threshold"
                    min={0}
                    max={1}
                    step={0.05}
                    showValue
                    description="Minimum similarity score for retrieval"
                  />
                </VitalFormSection>

                <VitalFormSection title="Vector Database">
                  <VitalFormGrid columns={2}>
                    <VitalInputField
                      name="pinecone_index"
                      label="Pinecone Index"
                      placeholder="vital-knowledge"
                      description="Name of the Pinecone index"
                    />
                    <VitalInputField
                      name="pinecone_namespace"
                      label="Pinecone Namespace"
                      placeholder="fda-regulatory"
                      description="Namespace within the index"
                    />
                  </VitalFormGrid>
                </VitalFormSection>

                <VitalFormSection title="Indexing">
                  <VitalSwitchField
                    name="auto_index"
                    label="Auto Index"
                    description="Automatically index new documents when uploaded"
                    variant="card"
                  />
                </VitalFormSection>
              </TabsContent>

              {/* Compliance Tab */}
              <TabsContent value="compliance" className="space-y-4 mt-0">
                <VitalFormSection title="Data Classification">
                  <VitalSelectField
                    name="compliance.data_classification"
                    label="Data Classification"
                    icon={Shield}
                    options={DATA_CLASSIFICATION_OPTIONS}
                    placeholder="Select classification"
                  />
                </VitalFormSection>

                <VitalFormSection title="Healthcare Compliance">
                  <VitalSwitchField
                    name="compliance.hipaa_compliant"
                    label="HIPAA Compliant"
                    description="Data handling meets HIPAA requirements"
                    variant="card"
                  />

                  <VitalSwitchField
                    name="compliance.contains_phi"
                    label="Contains PHI"
                    description="Contains Protected Health Information"
                    variant="card"
                  />

                  {containsPhi && (
                    <VitalFormMessage
                      type="warning"
                      message="RAGs containing PHI require additional security measures and audit trails."
                    />
                  )}

                  <VitalSwitchField
                    name="compliance.requires_audit_trail"
                    label="Requires Audit Trail"
                    description="Log all access and queries to this RAG"
                    variant="card"
                  />
                </VitalFormSection>

                <VitalFormSection title="Visibility">
                  <VitalSwitchField
                    name="is_active"
                    label="Active"
                    description="RAG is available for use"
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
                    {isEditing ? 'Update RAG' : 'Create RAG'}
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

interface RagDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  rag: Partial<Rag> | null;
  onConfirm: () => void;
  isDeleting?: boolean;
}

// =============================================================================
// RAG Delete Modal
// =============================================================================

export function RagDeleteModal({
  isOpen,
  onClose,
  rag,
  onConfirm,
  isDeleting = false,
}: RagDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete RAG Knowledge Base</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{rag?.display_name || rag?.name}&quot;?
            This will remove all associated documents and embeddings.
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
                Delete RAG
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

interface RagBatchDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function RagBatchDeleteModal({
  isOpen,
  onClose,
  count,
  onConfirm,
  isDeleting = false,
}: RagBatchDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {count} RAG Knowledge Bases</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {count} selected RAG knowledge bases?
            This will remove all associated documents and embeddings.
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
                Delete {count} RAGs
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RagEditModalV2;
