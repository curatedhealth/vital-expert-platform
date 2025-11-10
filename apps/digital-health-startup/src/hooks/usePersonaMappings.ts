/**
 * Persona Mapping Hooks
 * React hooks for querying persona-to-strategic-pillar and persona-to-JTBD mappings
 */

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  PersonaStrategicPillarMapping,
  PersonaJTBDMapping,
  PersonaStrategicSummary,
  PersonaJTBDSummary,
  StrategicPriority,
  PersonaWithStrategicPillars,
  PersonaWithJTBDs,
} from '@/types/persona-mappings';

// ============================================================================
// Strategic Priorities Hooks
// ============================================================================

/**
 * Fetch all strategic priorities (SP01-SP07)
 */
export function useStrategicPriorities() {
  const [data, setData] = useState<StrategicPriority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStrategicPriorities = async () => {
      try {
        const supabase = createClient();
        const { data: priorities, error } = await supabase
          .from('strategic_priorities')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (error) throw error;
        setData(priorities || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategicPriorities();
  }, []);

  return { data, loading, error };
}

// ============================================================================
// Persona Strategic Pillar Mapping Hooks
// ============================================================================

/**
 * Fetch persona-strategic pillar mappings for a specific persona
 */
export function usePersonaStrategicPillars(personaId: string | null) {
  const [data, setData] = useState<PersonaStrategicPillarMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!personaId) {
      setData([]);
      setLoading(false);
      return;
    }

    const fetchMappings = async () => {
      try {
        const supabase = createClient();
        const { data: mappings, error } = await supabase
          .from('persona_strategic_pillar_mapping')
          .select('*')
          .eq('persona_id', personaId)
          .order('pain_points_count', { ascending: false });

        if (error) throw error;
        setData(mappings || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchMappings();
  }, [personaId]);

  return { data, loading, error };
}

/**
 * Fetch persona with its strategic pillars (includes joined data)
 */
export function usePersonaWithStrategicPillars(personaUniqueId: string | null) {
  const [data, setData] = useState<PersonaWithStrategicPillars | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!personaUniqueId) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const supabase = createClient();

        // Fetch persona
        const { data: persona, error: personaError } = await supabase
          .from('personas')
          .select('id, unique_id, name')
          .eq('unique_id', personaUniqueId)
          .single();

        if (personaError) throw personaError;
        if (!persona) throw new Error('Persona not found');

        // Fetch mappings with strategic pillar details
        const { data: mappings, error: mappingsError } = await supabase
          .from('persona_strategic_pillar_mapping')
          .select(`
            strategic_pillar_id,
            pain_points_count,
            jtbd_count,
            is_primary,
            priority_score,
            strategic_priorities (
              code,
              name
            )
          `)
          .eq('persona_id', persona.id)
          .order('pain_points_count', { ascending: false });

        if (mappingsError) throw mappingsError;

        setData({
          id: persona.id,
          unique_id: persona.unique_id,
          name: persona.name,
          strategic_pillars: (mappings || []).map((m: any) => ({
            strategic_pillar_id: m.strategic_pillar_id,
            strategic_pillar_code: m.strategic_priorities?.code || '',
            strategic_pillar_name: m.strategic_priorities?.name || '',
            pain_points_count: m.pain_points_count || 0,
            jtbd_count: m.jtbd_count || 0,
            is_primary: m.is_primary || false,
            priority_score: m.priority_score,
          })),
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [personaUniqueId]);

  return { data, loading, error };
}

/**
 * Fetch persona strategic summary (uses database view)
 */
export function usePersonaStrategicSummary(personaUniqueId: string | null) {
  const [data, setData] = useState<PersonaStrategicSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!personaUniqueId) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      try {
        const supabase = createClient();
        const { data: summary, error } = await supabase
          .from('persona_strategic_summary')
          .select('*')
          .eq('persona_unique_id', personaUniqueId)
          .single();

        if (error) throw error;
        setData(summary);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [personaUniqueId]);

  return { data, loading, error };
}

// ============================================================================
// Persona JTBD Mapping Hooks
// ============================================================================

/**
 * Fetch persona-JTBD mappings for a specific persona
 */
export function usePersonaJTBDs(personaId: string | null) {
  const [data, setData] = useState<PersonaJTBDMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!personaId) {
      setData([]);
      setLoading(false);
      return;
    }

    const fetchMappings = async () => {
      try {
        const supabase = createClient();
        const { data: mappings, error } = await supabase
          .from('persona_jtbd_mapping')
          .select('*')
          .eq('persona_id', personaId)
          .order('is_primary', { ascending: false });

        if (error) throw error;
        setData(mappings || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchMappings();
  }, [personaId]);

  return { data, loading, error };
}

/**
 * Fetch persona with its JTBDs (includes joined data)
 */
export function usePersonaWithJTBDs(personaUniqueId: string | null) {
  const [data, setData] = useState<PersonaWithJTBDs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!personaUniqueId) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const supabase = createClient();

        // Fetch persona
        const { data: persona, error: personaError } = await supabase
          .from('personas')
          .select('id, unique_id, name')
          .eq('unique_id', personaUniqueId)
          .single();

        if (personaError) throw personaError;
        if (!persona) throw new Error('Persona not found');

        // Fetch mappings with JTBD details
        const { data: mappings, error: mappingsError } = await supabase
          .from('persona_jtbd_mapping')
          .select(`
            jtbd_id,
            role_type,
            is_primary,
            responsibility_level,
            impact_level,
            frequency,
            jtbd_library (
              jtbd_code,
              job_title
            )
          `)
          .eq('persona_id', persona.id)
          .order('is_primary', { ascending: false });

        if (mappingsError) throw mappingsError;

        setData({
          id: persona.id,
          unique_id: persona.unique_id,
          name: persona.name,
          jtbds: (mappings || []).map((m: any) => ({
            jtbd_id: m.jtbd_id,
            jtbd_code: m.jtbd_library?.jtbd_code || '',
            job_title: m.jtbd_library?.job_title || '',
            role_type: m.role_type,
            is_primary: m.is_primary || false,
            responsibility_level: m.responsibility_level,
            impact_level: m.impact_level,
            frequency: m.frequency,
          })),
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [personaUniqueId]);

  return { data, loading, error };
}

/**
 * Fetch persona JTBD summary (uses database view)
 */
export function usePersonaJTBDSummary(personaUniqueId: string | null) {
  const [data, setData] = useState<PersonaJTBDSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!personaUniqueId) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      try {
        const supabase = createClient();
        const { data: summary, error } = await supabase
          .from('persona_jtbd_summary')
          .select('*')
          .eq('persona_unique_id', personaUniqueId)
          .single();

        if (error) throw error;
        setData(summary);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [personaUniqueId]);

  return { data, loading, error };
}

// ============================================================================
// Combined Hook for Complete Persona Context
// ============================================================================

/**
 * Fetch complete persona context (strategic pillars + JTBDs)
 */
export function usePersonaContext(personaUniqueId: string | null) {
  const strategicPillars = usePersonaWithStrategicPillars(personaUniqueId);
  const jtbds = usePersonaWithJTBDs(personaUniqueId);

  const loading = strategicPillars.loading || jtbds.loading;
  const error = strategicPillars.error || jtbds.error;

  return {
    strategicPillars: strategicPillars.data,
    jtbds: jtbds.data,
    loading,
    error,
  };
}

// ============================================================================
// Utility Hook for Refetching
// ============================================================================

/**
 * Manual refetch hook for persona mappings
 */
export function useRefetchPersonaMappings() {
  const supabase = createClient();

  const refetchStrategicPillars = useCallback(async (personaId: string) => {
    const { data, error } = await supabase
      .from('persona_strategic_pillar_mapping')
      .select('*')
      .eq('persona_id', personaId)
      .order('pain_points_count', { ascending: false });

    if (error) throw error;
    return data;
  }, [supabase]);

  const refetchJTBDs = useCallback(async (personaId: string) => {
    const { data, error } = await supabase
      .from('persona_jtbd_mapping')
      .select('*')
      .eq('persona_id', personaId)
      .order('is_primary', { ascending: false });

    if (error) throw error;
    return data;
  }, [supabase]);

  return {
    refetchStrategicPillars,
    refetchJTBDs,
  };
}
