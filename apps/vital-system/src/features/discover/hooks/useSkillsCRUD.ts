'use client';

/**
 * useSkillsCRUD Hook - Brand Guidelines v6.0
 *
 * Manages skills CRUD operations and modal state
 * Extracted from /discover/skills/page.tsx
 *
 * @since December 2025
 */

import { useState, useCallback } from 'react';
import type { Skill as SkillSchema } from '@/lib/forms/schemas';
import { Skill } from './useSkillsData';

interface UseSkillsCRUDResult {
  // Modal states
  isModalOpen: boolean;
  editingSkill: Partial<SkillSchema> | null;
  isSaving: boolean;
  deleteConfirmOpen: boolean;
  skillToDelete: Partial<SkillSchema> | null;
  isDeleting: boolean;
  error: string | null;

  // Batch selection state
  selectedIds: Set<string>;
  isSelectionMode: boolean;
  batchDeleteConfirmOpen: boolean;

  // Actions
  handleCreateSkill: (defaultValues: Partial<SkillSchema>) => void;
  handleEditSkill: (skill: Skill) => void;
  handleSaveSkill: (data: SkillSchema, onSuccess: () => Promise<void>) => Promise<void>;
  handleDeleteConfirm: (skill: Skill) => void;
  handleDeleteSkill: (onSuccess: () => Promise<void>) => Promise<void>;
  closeModals: () => void;
  setError: (error: string | null) => void;

  // Batch actions
  toggleSelectionMode: () => void;
  exitSelectionMode: () => void;
  handleSelectAll: (skillIds: string[]) => void;
  setSelectedIds: (ids: Set<string>) => void;
  setBatchDeleteConfirmOpen: (open: boolean) => void;
  handleBatchDelete: (onSuccess: () => Promise<void>) => Promise<void>;
}

export function useSkillsCRUD(): UseSkillsCRUDResult {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Partial<SkillSchema> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<Partial<SkillSchema> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [batchDeleteConfirmOpen, setBatchDeleteConfirmOpen] = useState(false);

  const handleCreateSkill = useCallback((defaultValues: Partial<SkillSchema>) => {
    setEditingSkill({ ...defaultValues });
    setError(null);
    setIsModalOpen(true);
  }, []);

  const handleEditSkill = useCallback((skill: Skill) => {
    setEditingSkill(skill as unknown as Partial<SkillSchema>);
    setError(null);
    setIsModalOpen(true);
  }, []);

  const handleSaveSkill = useCallback(
    async (data: SkillSchema, onSuccess: () => Promise<void>) => {
      setIsSaving(true);
      setError(null);

      try {
        const isUpdate = !!data.id;
        const url = isUpdate ? `/api/skills/${data.id}` : '/api/skills';
        const method = isUpdate ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to save skill');

        await onSuccess();
        setIsModalOpen(false);
        setEditingSkill(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save skill');
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const handleDeleteConfirm = useCallback((skill: Skill) => {
    setSkillToDelete(skill as unknown as Partial<SkillSchema>);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteSkill = useCallback(
    async (onSuccess: () => Promise<void>) => {
      if (!skillToDelete?.id) return;

      setIsDeleting(true);
      try {
        const response = await fetch(`/api/skills/${skillToDelete.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete skill');
        }

        await onSuccess();
        setDeleteConfirmOpen(false);
        setSkillToDelete(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete skill');
      } finally {
        setIsDeleting(false);
      }
    },
    [skillToDelete]
  );

  const closeModals = useCallback(() => {
    setIsModalOpen(false);
    setEditingSkill(null);
    setDeleteConfirmOpen(false);
    setSkillToDelete(null);
    setError(null);
  }, []);

  // Batch selection handlers
  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => !prev);
    if (isSelectionMode) {
      setSelectedIds(new Set());
    }
  }, [isSelectionMode]);

  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleSelectAll = useCallback(
    (skillIds: string[]) => {
      if (selectedIds.size === skillIds.length) {
        setSelectedIds(new Set());
      } else {
        setSelectedIds(new Set(skillIds));
      }
    },
    [selectedIds.size]
  );

  const handleBatchDelete = useCallback(
    async (onSuccess: () => Promise<void>) => {
      if (selectedIds.size === 0) return;

      setIsDeleting(true);
      try {
        const deletePromises = Array.from(selectedIds).map((id) =>
          fetch(`/api/skills/${id}`, { method: 'DELETE' })
        );

        await Promise.all(deletePromises);
        await onSuccess();

        setBatchDeleteConfirmOpen(false);
        setSelectedIds(new Set());
        setIsSelectionMode(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete skills');
      } finally {
        setIsDeleting(false);
      }
    },
    [selectedIds]
  );

  return {
    isModalOpen,
    editingSkill,
    isSaving,
    deleteConfirmOpen,
    skillToDelete,
    isDeleting,
    error,
    selectedIds,
    isSelectionMode,
    batchDeleteConfirmOpen,
    handleCreateSkill,
    handleEditSkill,
    handleSaveSkill,
    handleDeleteConfirm,
    handleDeleteSkill,
    closeModals,
    setError,
    toggleSelectionMode,
    exitSelectionMode,
    handleSelectAll,
    setSelectedIds,
    setBatchDeleteConfirmOpen,
    handleBatchDelete,
  };
}
