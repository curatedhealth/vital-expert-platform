'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Persona } from '@/components/personas/types';

interface UsePersonaDetailResult {
  persona: Persona | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/**
 * Hook for fetching and managing a single persona's details
 * Handles loading states, error handling, and slug-based fallback matching
 */
export function usePersonaDetail(slug: string | undefined): UsePersonaDetailResult {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/personas/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          // Fallback: try fetching full list and matching locally
          const listResponse = await fetch('/api/personas?limit=5000');
          if (listResponse.ok) {
            const listData = await listResponse.json();
            const all = listData.personas || [];
            const match = all.find((p: Persona) =>
              p.slug === slug ||
              p.slug?.toLowerCase() === slug.toLowerCase() ||
              (p as any).unique_id === slug ||
              (p as any).unique_id?.toLowerCase() === slug.toLowerCase() ||
              (p as any).persona_name === slug ||
              (p as any).persona_name?.toLowerCase() === slug.toLowerCase()
            );
            if (match) {
              setPersona(match);
              return;
            }
          }
          throw new Error('Persona not found');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch persona: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setPersona(data.persona);
    } catch (err) {
      console.error('Error loading persona:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load persona. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  return { persona, loading, error, reload: load };
}
