'use client';

/**
 * useSkillsData Hook - Brand Guidelines v6.0
 *
 * Manages skills data fetching and stats calculation
 * Extracted from /discover/skills/page.tsx
 *
 * @since December 2025
 */

import { useState, useCallback, useEffect } from 'react';
import { getComplexityLevel } from '@vital/ai-ui';

// Skill type from service
export interface Skill {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  category?: string;
  implementation_type?: string;
  implementation_ref?: string;
  complexity_score?: number;
  is_active?: boolean;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface SkillStats {
  total: number;
  active: number;
  byCategory: Record<string, number>;
  byComplexity: Record<string, number>;
  builtin: number;
  custom: number;
}

const DEFAULT_STATS: SkillStats = {
  total: 0,
  active: 0,
  byCategory: {},
  byComplexity: {},
  builtin: 0,
  custom: 0,
};

interface UseSkillsDataResult {
  skills: Skill[];
  stats: SkillStats;
  loading: boolean;
  error: string | null;
  loadSkills: () => Promise<void>;
  refreshSkills: () => Promise<void>;
}

// Filter skills based on URL params
export function filterSkillsByParams(
  skills: Skill[],
  category: string | null,
  complexity: string | null,
  type: string | null
): Skill[] {
  let filtered = [...skills];

  if (category) {
    const categoryLower = category.toLowerCase();
    filtered = filtered.filter((s) => {
      const skillCategory = (s.category || '').toLowerCase();
      return skillCategory === categoryLower || skillCategory.includes(categoryLower);
    });
  }

  if (complexity) {
    const complexityLower = complexity.toLowerCase();
    filtered = filtered.filter((s) => {
      const score = s.complexity_score || 5;
      switch (complexityLower) {
        case 'basic':
          return score >= 1 && score <= 3;
        case 'intermediate':
          return score >= 4 && score <= 6;
        case 'advanced':
          return score >= 7 && score <= 8;
        case 'expert':
          return score >= 9 && score <= 10;
        default:
          return true;
      }
    });
  }

  if (type) {
    const typeLower = type.toLowerCase();
    filtered = filtered.filter((s) => {
      const implType = (s.implementation_type || '').toLowerCase();
      return implType === typeLower;
    });
  }

  return filtered;
}

export function useSkillsData(): UseSkillsDataResult {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [stats, setStats] = useState<SkillStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useSkillsData] Loading skills...');

      const response = await fetch('/api/skills?limit=10000');
      if (!response.ok) throw new Error('Failed to fetch skills');

      const result = await response.json();
      const allSkills = result.skills || [];

      console.log('[useSkillsData] Loaded', allSkills.length, 'skills');

      setSkills(allSkills);

      // Calculate stats
      const byCategory: Record<string, number> = {};
      const byComplexity: Record<string, number> = {};

      allSkills.forEach((skill: Skill) => {
        if (skill.category) {
          byCategory[skill.category] = (byCategory[skill.category] || 0) + 1;
        }
        const level = getComplexityLevel(skill.complexity_score || 5);
        byComplexity[level] = (byComplexity[level] || 0) + 1;
      });

      setStats({
        total: allSkills.length,
        active: allSkills.filter((s: Skill) => s.is_active).length,
        byCategory,
        byComplexity,
        builtin: allSkills.filter((s: Skill) => s.implementation_type === 'tool').length,
        custom: allSkills.filter(
          (s: Skill) => s.implementation_type === 'prompt' || s.implementation_type === 'workflow'
        ).length,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load skills';
      console.error('[useSkillsData] Error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Alias for semantic clarity
  const refreshSkills = loadSkills;

  // Load data on mount
  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  return {
    skills,
    stats,
    loading,
    error,
    loadSkills,
    refreshSkills,
  };
}
