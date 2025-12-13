'use client';

/**
 * useToolsCRUD Hook - Brand Guidelines v6.0
 *
 * Manages tools CRUD operations and modal state
 * Extracted from /discover/tools/page.tsx
 *
 * @since December 2025
 */

import { useState, useCallback } from 'react';
import type { Tool as ToolSchema } from '@/lib/forms/schemas';
import { Tool } from './useToolsData';

interface UseToolsCRUDResult {
  // Modal states
  isModalOpen: boolean;
  editingTool: Partial<ToolSchema> | null;
  isSaving: boolean;
  deleteConfirmOpen: boolean;
  toolToDelete: Partial<ToolSchema> | null;
  isDeleting: boolean;
  error: string | null;

  // Batch selection state
  selectedIds: Set<string>;
  isSelectionMode: boolean;
  batchDeleteConfirmOpen: boolean;

  // Actions
  handleCreateTool: (defaultValues: Partial<ToolSchema>) => void;
  handleEditTool: (tool: Tool) => void;
  handleSaveTool: (data: ToolSchema, onSuccess: () => Promise<void>) => Promise<void>;
  handleDeleteConfirm: (tool: Tool) => void;
  handleDeleteTool: (onSuccess: () => Promise<void>) => Promise<void>;
  closeModals: () => void;
  setError: (error: string | null) => void;

  // Batch actions
  toggleSelectionMode: () => void;
  exitSelectionMode: () => void;
  handleSelectAll: (toolIds: string[]) => void;
  setSelectedIds: (ids: Set<string>) => void;
  setBatchDeleteConfirmOpen: (open: boolean) => void;
  handleBatchDelete: (onSuccess: () => Promise<void>) => Promise<void>;
}

export function useToolsCRUD(): UseToolsCRUDResult {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Partial<ToolSchema> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<Partial<ToolSchema> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [batchDeleteConfirmOpen, setBatchDeleteConfirmOpen] = useState(false);

  const handleCreateTool = useCallback((defaultValues: Partial<ToolSchema>) => {
    setEditingTool({ ...defaultValues });
    setError(null);
    setIsModalOpen(true);
  }, []);

  const handleEditTool = useCallback((tool: Tool) => {
    setEditingTool(tool as unknown as Partial<ToolSchema>);
    setError(null);
    setIsModalOpen(true);
  }, []);

  const handleSaveTool = useCallback(async (data: ToolSchema, onSuccess: () => Promise<void>) => {
    setIsSaving(true);
    setError(null);

    try {
      const isUpdate = !!data.id;
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch('/api/tools-crud', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save tool');

      await onSuccess();
      setIsModalOpen(false);
      setEditingTool(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tool');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleDeleteConfirm = useCallback((tool: Tool) => {
    setToolToDelete(tool as unknown as Partial<ToolSchema>);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteTool = useCallback(async (onSuccess: () => Promise<void>) => {
    if (!toolToDelete?.id) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tools-crud?id=${toolToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete tool');
      }

      await onSuccess();
      setDeleteConfirmOpen(false);
      setToolToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tool');
    } finally {
      setIsDeleting(false);
    }
  }, [toolToDelete]);

  const closeModals = useCallback(() => {
    setIsModalOpen(false);
    setEditingTool(null);
    setDeleteConfirmOpen(false);
    setToolToDelete(null);
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

  const handleSelectAll = useCallback((toolIds: string[]) => {
    if (selectedIds.size === toolIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(toolIds));
    }
  }, [selectedIds.size]);

  const handleBatchDelete = useCallback(async (onSuccess: () => Promise<void>) => {
    if (selectedIds.size === 0) return;

    setIsDeleting(true);
    try {
      const deletePromises = Array.from(selectedIds).map((id) =>
        fetch(`/api/tools-crud?id=${id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      await onSuccess();

      setBatchDeleteConfirmOpen(false);
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tools');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedIds]);

  return {
    isModalOpen,
    editingTool,
    isSaving,
    deleteConfirmOpen,
    toolToDelete,
    isDeleting,
    error,
    selectedIds,
    isSelectionMode,
    batchDeleteConfirmOpen,
    handleCreateTool,
    handleEditTool,
    handleSaveTool,
    handleDeleteConfirm,
    handleDeleteTool,
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
