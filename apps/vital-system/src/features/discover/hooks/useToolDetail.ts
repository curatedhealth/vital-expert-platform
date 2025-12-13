'use client';

/**
 * useToolDetail Hook - Brand Guidelines v6.0
 *
 * Manages single tool detail fetching and CRUD operations
 * Extracted from /discover/tools/[slug]/page.tsx
 *
 * @since December 2025
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Tool } from '@/lib/services/tool-registry-service';

interface UseToolDetailResult {
  // Data state
  tool: Tool | null;
  loading: boolean;
  error: string | null;

  // Edit state
  isEditing: boolean;
  editForm: Partial<Tool>;
  saving: boolean;

  // Delete state
  showDeleteConfirm: boolean;

  // Copy state
  copied: boolean;

  // Actions
  loadTool: () => Promise<void>;
  setIsEditing: (editing: boolean) => void;
  setEditForm: (form: Partial<Tool>) => void;
  handleSave: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleCancel: () => void;
  handleCopyCode: () => void;
  setShowDeleteConfirm: (show: boolean) => void;
}

export function useToolDetail(slug: string, startInEditMode: boolean = false): UseToolDetailResult {
  const router = useRouter();

  // Data state
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [editForm, setEditForm] = useState<Partial<Tool>>({});
  const [saving, setSaving] = useState(false);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Copy state
  const [copied, setCopied] = useState(false);

  const loadTool = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tools-crud/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Tool not found');
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load tool');
        }
        return;
      }

      const data = await response.json();
      setTool(data.tool);
      setEditForm(data.tool);
    } catch (err) {
      console.error('[useToolDetail] Error loading tool:', err);
      setError('Failed to load tool');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Load tool on mount
  useEffect(() => {
    loadTool();
  }, [loadTool]);

  // Enter edit mode after tool is loaded if requested
  useEffect(() => {
    if (tool && startInEditMode && !isEditing) {
      setIsEditing(true);
    }
  }, [tool, startInEditMode, isEditing]);

  const handleSave = useCallback(async () => {
    if (!tool?.id) return;

    try {
      setSaving(true);

      const response = await fetch(`/api/tools-crud/${tool.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update tool');
      }

      const data = await response.json();
      setTool(data.tool);
      setEditForm(data.tool);
      setIsEditing(false);

      // If code changed, redirect to new URL
      if (data.tool.code !== slug) {
        router.push(`/discover/tools/${data.tool.code}`);
      }
    } catch (err: unknown) {
      console.error('[useToolDetail] Error saving tool:', err);
      alert(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  }, [tool, editForm, slug, router]);

  const handleDelete = useCallback(async () => {
    if (!tool?.id) return;

    try {
      setSaving(true);

      const response = await fetch(`/api/tools-crud/${tool.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete tool');
      }

      // Redirect to tools list
      router.push('/discover/tools');
    } catch (err: unknown) {
      console.error('[useToolDetail] Error deleting tool:', err);
      alert(`Failed to delete: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  }, [tool, router]);

  const handleCancel = useCallback(() => {
    setEditForm(tool || {});
    setIsEditing(false);
  }, [tool]);

  const handleCopyCode = useCallback(() => {
    if (tool?.code) {
      navigator.clipboard.writeText(tool.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [tool]);

  return {
    tool,
    loading,
    error,
    isEditing,
    editForm,
    saving,
    showDeleteConfirm,
    copied,
    loadTool,
    setIsEditing,
    setEditForm,
    handleSave,
    handleDelete,
    handleCancel,
    handleCopyCode,
    setShowDeleteConfirm,
  };
}
