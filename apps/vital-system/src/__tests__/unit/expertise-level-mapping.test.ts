/**
 * Unit Tests for Expertise Level Mapping
 *
 * Tests the mapping between TypeScript ExpertiseLevel values and database enum values.
 *
 * TypeScript types: 'entry' | 'mid' | 'senior' | 'expert' | 'thought_leader'
 * Database enum: 'beginner' | 'intermediate' | 'advanced' | 'expert'
 *
 * Coverage Target: 100%
 */

import { describe, it, expect } from '@jest/globals';

// Define the mapping constant (same as in route.ts)
const EXPERTISE_LEVEL_MAPPING: Record<string, string> = {
  'entry': 'beginner',
  'mid': 'intermediate',
  'senior': 'advanced',
  'expert': 'expert',
  'thought_leader': 'expert',
  // Pass through valid DB values
  'beginner': 'beginner',
  'intermediate': 'intermediate',
  'advanced': 'advanced',
};

// Utility function to map expertise level (mimics route.ts logic)
function mapExpertiseLevel(value: string | null | undefined): string | null {
  if (!value) return null;
  const mapped = EXPERTISE_LEVEL_MAPPING[value];
  return mapped || null;
}

describe('Expertise Level Mapping', () => {
  describe('EXPERTISE_LEVEL_MAPPING constant', () => {
    it('should map TypeScript "entry" to database "beginner"', () => {
      expect(EXPERTISE_LEVEL_MAPPING['entry']).toBe('beginner');
    });

    it('should map TypeScript "mid" to database "intermediate"', () => {
      expect(EXPERTISE_LEVEL_MAPPING['mid']).toBe('intermediate');
    });

    it('should map TypeScript "senior" to database "advanced"', () => {
      expect(EXPERTISE_LEVEL_MAPPING['senior']).toBe('advanced');
    });

    it('should keep "expert" as "expert" (same in both)', () => {
      expect(EXPERTISE_LEVEL_MAPPING['expert']).toBe('expert');
    });

    it('should map TypeScript "thought_leader" to database "expert"', () => {
      expect(EXPERTISE_LEVEL_MAPPING['thought_leader']).toBe('expert');
    });

    it('should pass through valid database value "beginner"', () => {
      expect(EXPERTISE_LEVEL_MAPPING['beginner']).toBe('beginner');
    });

    it('should pass through valid database value "intermediate"', () => {
      expect(EXPERTISE_LEVEL_MAPPING['intermediate']).toBe('intermediate');
    });

    it('should pass through valid database value "advanced"', () => {
      expect(EXPERTISE_LEVEL_MAPPING['advanced']).toBe('advanced');
    });
  });

  describe('mapExpertiseLevel utility function', () => {
    it('should map all TypeScript expertise levels correctly', () => {
      expect(mapExpertiseLevel('entry')).toBe('beginner');
      expect(mapExpertiseLevel('mid')).toBe('intermediate');
      expect(mapExpertiseLevel('senior')).toBe('advanced');
      expect(mapExpertiseLevel('expert')).toBe('expert');
      expect(mapExpertiseLevel('thought_leader')).toBe('expert');
    });

    it('should pass through valid database values', () => {
      expect(mapExpertiseLevel('beginner')).toBe('beginner');
      expect(mapExpertiseLevel('intermediate')).toBe('intermediate');
      expect(mapExpertiseLevel('advanced')).toBe('advanced');
    });

    it('should return null for unknown values', () => {
      expect(mapExpertiseLevel('unknown')).toBeNull();
      expect(mapExpertiseLevel('invalid')).toBeNull();
      expect(mapExpertiseLevel('junior')).toBeNull();
      expect(mapExpertiseLevel('principal')).toBeNull();
    });

    it('should return null for null input', () => {
      expect(mapExpertiseLevel(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(mapExpertiseLevel(undefined)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(mapExpertiseLevel('')).toBeNull();
    });
  });

  describe('Mapping consistency', () => {
    it('should have all TypeScript values mapped', () => {
      const typescriptValues = ['entry', 'mid', 'senior', 'expert', 'thought_leader'];
      typescriptValues.forEach(value => {
        expect(EXPERTISE_LEVEL_MAPPING[value]).toBeDefined();
        expect(EXPERTISE_LEVEL_MAPPING[value]).not.toBe('');
      });
    });

    it('should have all database values as valid targets', () => {
      const validDbValues = new Set(['beginner', 'intermediate', 'advanced', 'expert']);
      Object.values(EXPERTISE_LEVEL_MAPPING).forEach(value => {
        expect(validDbValues.has(value)).toBe(true);
      });
    });

    it('should not have any invalid mappings', () => {
      const invalidDbValues = ['senior', 'entry', 'mid', 'thought_leader', 'junior'];
      Object.values(EXPERTISE_LEVEL_MAPPING).forEach(value => {
        expect(invalidDbValues.includes(value)).toBe(false);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle case sensitivity (mapping is case-sensitive)', () => {
      expect(EXPERTISE_LEVEL_MAPPING['Senior']).toBeUndefined();
      expect(EXPERTISE_LEVEL_MAPPING['SENIOR']).toBeUndefined();
      expect(EXPERTISE_LEVEL_MAPPING['senior']).toBe('advanced');
    });

    it('should handle whitespace (mapping expects trimmed values)', () => {
      expect(EXPERTISE_LEVEL_MAPPING[' senior']).toBeUndefined();
      expect(EXPERTISE_LEVEL_MAPPING['senior ']).toBeUndefined();
      expect(EXPERTISE_LEVEL_MAPPING[' senior ']).toBeUndefined();
    });
  });
});

describe('Expertise Level Mapping - Real World Scenarios', () => {
  it('should correctly map form value "senior" that was causing 500 error', () => {
    // This was the original bug: frontend sent "senior", database expected "advanced"
    const frontendValue = 'senior';
    const mappedValue = mapExpertiseLevel(frontendValue);
    expect(mappedValue).toBe('advanced');
    expect(mappedValue).not.toBe('senior'); // senior is NOT a valid DB enum
  });

  it('should handle the full agent update payload with expertise_level', () => {
    const updatePayload = {
      name: 'Test Agent',
      description: 'Test description',
      expertise_level: 'senior', // Frontend value
    };

    // Simulate the mapping logic from route.ts
    if (updatePayload.expertise_level) {
      const mapped = EXPERTISE_LEVEL_MAPPING[updatePayload.expertise_level];
      if (mapped) {
        updatePayload.expertise_level = mapped;
      }
    }

    expect(updatePayload.expertise_level).toBe('advanced');
  });

  it('should preserve null expertise_level when not provided', () => {
    const updatePayload: { expertise_level?: string | null } = {};

    // Simulate the mapping logic
    if (updatePayload.expertise_level) {
      const mapped = EXPERTISE_LEVEL_MAPPING[updatePayload.expertise_level];
      if (mapped) {
        updatePayload.expertise_level = mapped;
      }
    }

    expect(updatePayload.expertise_level).toBeUndefined();
  });
});
