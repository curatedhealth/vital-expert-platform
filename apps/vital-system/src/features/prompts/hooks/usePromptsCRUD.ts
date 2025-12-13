'use client';

/**
 * usePromptsCRUD Hook - Brand Guidelines v6.0
 *
 * Manages prompt CRUD operations, batch selection, and modals
 * Extracted from /prompts/page.tsx
 *
 * @since December 2025
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Prompt } from '@/lib/forms/schemas';
import type { VitalAsset } from '@vital/ai-ui';

// Default values for new prompt creation
export const DEFAULT_PROMPT_VALUES: Partial<Prompt> = {
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
};

interface UsePromptsCRUDResult {
  // Modal state
  isModalOpen: boolean;
  editingPrompt: Partial<Prompt> | null;
  deleteConfirmOpen: boolean;
  promptToDelete: Prompt | null;
  batchDeleteConfirmOpen: boolean;

  // Loading state
  isSaving: boolean;
  error: string | null;

  // Selection state
  selectedIds: Set<string>;
  isSelectionMode: boolean;

  // Actions
  handleCreatePrompt: () => void;
  handleEditPrompt: (asset: VitalAsset) => void;
  handleSavePrompt: (data: Prompt) => Promise<void>;
  handleDeleteConfirm: (asset: VitalAsset, prompts: Prompt[]) => void;
  handleDeletePrompt: () => Promise<void>;
  handleBatchDelete: () => Promise<void>;

  // Modal controls
  closeModal: () => void;
  closeDeleteConfirm: () => void;
  closeBatchDeleteConfirm: () => void;

  // Selection controls
  toggleSelectionMode: () => void;
  toggleSelectPrompt: (id: string) => void;
  selectAllPrompts: (prompts: Prompt[]) => void;
  clearSelection: () => void;

  // Clear error
  clearError: () => void;
}

export function usePromptsCRUD(
  loadPrompts: () => Promise<void>
): UsePromptsCRUDResult {
  const router = useRouter();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Partial<Prompt> | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);
  const [batchDeleteConfirmOpen, setBatchDeleteConfirmOpen] = useState(false);

  // Loading state
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Create prompt
  const handleCreatePrompt = useCallback(() => {
    setEditingPrompt({ ...DEFAULT_PROMPT_VALUES });
    setError(null);
    setIsModalOpen(true);
  }, []);

  // Edit prompt - redirects to detail page with edit mode
  const handleEditPrompt = useCallback((asset: VitalAsset) => {
    router.push(`/prompts/${asset.id}?edit=true`);
  }, [router]);

  // Save prompt
  const handleSavePrompt = useCallback(async (data: Prompt) => {
    setIsSaving(true);
    setError(null);

    try {
      const isUpdate = !!data.id;
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch('/api/prompts-crud', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save prompt');

      await loadPrompts();
      setIsModalOpen(false);
      setEditingPrompt(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prompt');
    } finally {
      setIsSaving(false);
    }
  }, [loadPrompts]);

  // Delete confirm
  const handleDeleteConfirm = useCallback((asset: VitalAsset, prompts: Prompt[]) => {
    const prompt = prompts.find(p => p.id === asset.id);
    if (prompt) {
      setPromptToDelete(prompt);
      setDeleteConfirmOpen(true);
    }
  }, []);

  // Delete prompt
  const handleDeletePrompt = useCallback(async () => {
    if (!promptToDelete) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/prompts-crud?id=${promptToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete prompt');
      }

      await loadPrompts();
      setDeleteConfirmOpen(false);
      setPromptToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete prompt');
    } finally {
      setIsSaving(false);
    }
  }, [promptToDelete, loadPrompts]);

  // Batch delete
  const handleBatchDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;

    setIsSaving(true);
    try {
      const deletePromises = Array.from(selectedIds).map(id =>
        fetch(`/api/prompts-crud?id=${id}`, { method: 'DELETE' })
      );

      const results = await Promise.allSettled(deletePromises);
      const failures = results.filter(r => r.status === 'rejected').length;

      if (failures > 0) {
        setError(`Failed to delete ${failures} prompt(s)`);
      }

      await loadPrompts();
      setBatchDeleteConfirmOpen(false);
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete prompts');
    } finally {
      setIsSaving(false);
    }
  }, [selectedIds, loadPrompts]);

  // Modal controls
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingPrompt(null);
    setError(null);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirmOpen(false);
    setPromptToDelete(null);
  }, []);

  const closeBatchDeleteConfirm = useCallback(() => {
    setBatchDeleteConfirmOpen(false);
    setError(null);
  }, []);

  // Selection controls
  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedIds(new Set());
    }
  }, [isSelectionMode]);

  const toggleSelectPrompt = useCallback((id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }, [selectedIds]);

  const selectAllPrompts = useCallback((prompts: Prompt[]) => {
    if (selectedIds.size === prompts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(prompts.map(p => p.id || '')));
    }
  }, [selectedIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Modal state
    isModalOpen,
    editingPrompt,
    deleteConfirmOpen,
    promptToDelete,
    batchDeleteConfirmOpen,

    // Loading state
    isSaving,
    error,

    // Selection state
    selectedIds,
    isSelectionMode,

    // Actions
    handleCreatePrompt,
    handleEditPrompt,
    handleSavePrompt,
    handleDeleteConfirm,
    handleDeletePrompt,
    handleBatchDelete,

    // Modal controls
    closeModal,
    closeDeleteConfirm,
    closeBatchDeleteConfirm,

    // Selection controls
    toggleSelectionMode,
    toggleSelectPrompt,
    selectAllPrompts,
    clearSelection,

    // Clear error
    clearError,
  };
}
