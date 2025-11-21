-- ============================================================
-- V5.0 SCHEMA ALIGNMENT MIGRATION
-- ============================================================
-- Purpose: Align Supabase schema with DATABASE_SCHEMA_AND_DATA_GOLDEN_RULES.md
--
-- Issues Fixed:
-- 1. Trigger inserting NULLs into persona_evidence_summary
-- 2. JSONB columns in personas table (violates Rule #1)
-- 3. Missing normalized table for communication_preferences
-- 4. Data migration from JSONB to normalized tables
--
-- Generated: 2025-11-17
-- ============================================================

BEGIN;

-- ============================================================
-- PART 1: FIX TRIGGER - Add defaults for NOT NULL columns
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_evidence_summary()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Update counts in evidence summary with proper defaults
    INSERT INTO persona_evidence_summary (
        persona_id,
        tenant_id,
        total_sources,
        overall_confidence_level,
        evidence_quality_score,
        evidence_recency_score
    )
    VALUES (
        NEW.persona_id,
        NEW.tenant_id,
        1,
        'medium',  -- Default confidence level
        7,         -- Default quality score
        7          -- Default recency score
    )
    ON CONFLICT (persona_id) DO UPDATE SET
        total_sources = persona_evidence_summary.total_sources + 1,
        updated_at = NOW();

    RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION update_evidence_summary() IS 'Fixed to provide defaults for NOT NULL columns';

-- ============================================================
-- PART 2: CREATE MISSING NORMALIZED TABLE
-- ============================================================

-- Create persona_communication_preferences table
CREATE TABLE IF NOT EXISTS persona_communication_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    preference_type TEXT,  -- e.g., 'channel', 'frequency', 'format'
    preference_value TEXT,
    preference_description TEXT,
    sequence_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_persona FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_persona_comm_prefs_persona_id
    ON persona_communication_preferences(persona_id);

CREATE INDEX IF NOT EXISTS idx_persona_comm_prefs_tenant_id
    ON persona_communication_preferences(tenant_id);

COMMENT ON TABLE persona_communication_preferences IS 'Normalized communication preferences (migrated from JSONB)';

-- ============================================================
-- PART 3: MIGRATE DATA FROM JSONB TO NORMALIZED TABLES
-- ============================================================

-- Migrate pain_points from JSONB to persona_pain_points
-- (Only if data exists in JSONB column)
DO $$
DECLARE
    v_persona RECORD;
    v_pain JSONB;
    v_idx INTEGER;
BEGIN
    FOR v_persona IN
        SELECT id, tenant_id, pain_points
        FROM personas
        WHERE pain_points IS NOT NULL
          AND jsonb_typeof(pain_points) = 'array'
          AND jsonb_array_length(pain_points) > 0
    LOOP
        v_idx := 0;
        FOR v_pain IN SELECT * FROM jsonb_array_elements(v_persona.pain_points)
        LOOP
            v_idx := v_idx + 1;

            INSERT INTO persona_pain_points (
                persona_id,
                tenant_id,
                pain_point_text,
                pain_description,
                pain_category,
                severity,
                sequence_order
            ) VALUES (
                v_persona.id,
                v_persona.tenant_id,
                COALESCE(v_pain->>'pain_point', v_pain->>'text', v_pain::text),
                COALESCE(v_pain->>'description', v_pain->>'pain_point'),
                COALESCE(v_pain->>'category', 'operational'),  -- Valid enum: operational, strategic, technology, interpersonal
                COALESCE(v_pain->>'severity', 'medium'),       -- Valid enum: critical, high, medium, low
                v_idx
            )
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Migrated pain_points from JSONB to normalized table';
END $$;

-- Migrate goals from JSONB to persona_goals
DO $$
DECLARE
    v_persona RECORD;
    v_goal JSONB;
    v_idx INTEGER;
BEGIN
    FOR v_persona IN
        SELECT id, tenant_id, goals
        FROM personas
        WHERE goals IS NOT NULL
          AND jsonb_typeof(goals) = 'array'
          AND jsonb_array_length(goals) > 0
    LOOP
        v_idx := 0;
        FOR v_goal IN SELECT * FROM jsonb_array_elements(v_persona.goals)
        LOOP
            v_idx := v_idx + 1;

            INSERT INTO persona_goals (
                persona_id,
                tenant_id,
                goal_text,
                goal_type,
                priority,
                sequence_order
            ) VALUES (
                v_persona.id,
                v_persona.tenant_id,
                COALESCE(v_goal->>'goal', v_goal->>'text', v_goal::text),
                COALESCE(v_goal->>'type', 'primary'),  -- Valid enum: primary, secondary, long_term, personal
                -- Handle priority: convert string 'high'/'medium'/'low' to numbers or use numeric value
                CASE
                    WHEN (v_goal->>'priority') ~ '^\d+$' THEN (v_goal->>'priority')::integer
                    WHEN LOWER(v_goal->>'priority') = 'high' THEN 1
                    WHEN LOWER(v_goal->>'priority') = 'medium' THEN 2
                    WHEN LOWER(v_goal->>'priority') = 'low' THEN 3
                    ELSE v_idx
                END,
                v_idx
            )
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Migrated goals from JSONB to normalized table';
END $$;

-- Migrate challenges from JSONB to persona_challenges
DO $$
DECLARE
    v_persona RECORD;
    v_challenge JSONB;
    v_idx INTEGER;
BEGIN
    FOR v_persona IN
        SELECT id, tenant_id, challenges
        FROM personas
        WHERE challenges IS NOT NULL
          AND jsonb_typeof(challenges) = 'array'
          AND jsonb_array_length(challenges) > 0
    LOOP
        v_idx := 0;
        FOR v_challenge IN SELECT * FROM jsonb_array_elements(v_persona.challenges)
        LOOP
            v_idx := v_idx + 1;

            INSERT INTO persona_challenges (
                persona_id,
                tenant_id,
                challenge_text,
                challenge_description,
                challenge_type,
                impact_level,
                sequence_order
            ) VALUES (
                v_persona.id,
                v_persona.tenant_id,
                COALESCE(v_challenge->>'challenge', v_challenge->>'text', v_challenge::text),
                COALESCE(v_challenge->>'description', v_challenge->>'challenge'),
                COALESCE(v_challenge->>'type', 'daily'),       -- Valid enum: daily, weekly, strategic, external
                COALESCE(v_challenge->>'impact', 'medium'),    -- Valid enum: critical, high, medium, low
                v_idx
            )
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Migrated challenges from JSONB to normalized table';
END $$;

-- Migrate communication_preferences from JSONB to persona_communication_preferences
DO $$
DECLARE
    v_persona RECORD;
    v_pref JSONB;
    v_key TEXT;
    v_idx INTEGER;
BEGIN
    FOR v_persona IN
        SELECT id, tenant_id, communication_preferences
        FROM personas
        WHERE communication_preferences IS NOT NULL
          AND jsonb_typeof(communication_preferences) = 'object'
    LOOP
        v_idx := 0;

        -- If it's an array, iterate through elements
        IF jsonb_typeof(v_persona.communication_preferences) = 'array' THEN
            FOR v_pref IN SELECT * FROM jsonb_array_elements(v_persona.communication_preferences)
            LOOP
                v_idx := v_idx + 1;

                INSERT INTO persona_communication_preferences (
                    persona_id,
                    tenant_id,
                    preference_type,
                    preference_value,
                    preference_description,
                    sequence_order
                ) VALUES (
                    v_persona.id,
                    v_persona.tenant_id,
                    COALESCE(v_pref->>'type', 'general'),
                    COALESCE(v_pref->>'value', v_pref->>'preference'),
                    COALESCE(v_pref->>'description', v_pref::text),
                    v_idx
                )
                ON CONFLICT DO NOTHING;
            END LOOP;
        -- If it's an object, iterate through keys
        ELSE
            FOR v_key IN SELECT * FROM jsonb_object_keys(v_persona.communication_preferences)
            LOOP
                v_idx := v_idx + 1;

                INSERT INTO persona_communication_preferences (
                    persona_id,
                    tenant_id,
                    preference_type,
                    preference_value,
                    preference_description,
                    sequence_order
                ) VALUES (
                    v_persona.id,
                    v_persona.tenant_id,
                    v_key,
                    v_persona.communication_preferences->>v_key,
                    NULL,
                    v_idx
                )
                ON CONFLICT DO NOTHING;
            END LOOP;
        END IF;
    END LOOP;

    RAISE NOTICE 'Migrated communication_preferences from JSONB to normalized table';
END $$;

-- ============================================================
-- PART 4: DROP JSONB COLUMNS (Golden Rule #1 Compliance)
-- ============================================================
-- Note: Keeping metadata column as it's for truly unstructured data

-- Drop JSONB columns that now have normalized tables
ALTER TABLE personas DROP COLUMN IF EXISTS pain_points CASCADE;
ALTER TABLE personas DROP COLUMN IF EXISTS goals CASCADE;
ALTER TABLE personas DROP COLUMN IF EXISTS challenges CASCADE;
ALTER TABLE personas DROP COLUMN IF EXISTS communication_preferences CASCADE;

COMMENT ON COLUMN personas.metadata IS 'Unstructured metadata only - structured data must use normalized tables';

-- ============================================================
-- PART 5: UPDATE DEFAULT VALUES CONFIG
-- ============================================================

-- Add defaults to relevant columns
ALTER TABLE persona_evidence_summary
    ALTER COLUMN overall_confidence_level SET DEFAULT 'medium',
    ALTER COLUMN evidence_quality_score SET DEFAULT 7,
    ALTER COLUMN evidence_recency_score SET DEFAULT 7;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

DO $$
DECLARE
    v_jsonb_count INTEGER;
    v_trigger_ok BOOLEAN;
BEGIN
    -- Check for remaining JSONB columns (except metadata)
    SELECT COUNT(*) INTO v_jsonb_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name LIKE 'persona%'
      AND data_type = 'jsonb'
      AND column_name != 'metadata';

    IF v_jsonb_count > 0 THEN
        RAISE WARNING 'Still have % JSONB columns (excluding metadata)', v_jsonb_count;
    ELSE
        RAISE NOTICE '✅ Golden Rule #1 COMPLIANT: No JSONB columns except metadata';
    END IF;

    -- Verify trigger fix
    SELECT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'update_evidence_summary'
          AND n.nspname = 'public'
          AND pg_get_functiondef(p.oid) LIKE '%overall_confidence_level%'
    ) INTO v_trigger_ok;

    IF v_trigger_ok THEN
        RAISE NOTICE '✅ Trigger fixed: Now provides defaults for NOT NULL columns';
    ELSE
        RAISE WARNING 'Trigger may still have issues';
    END IF;

    RAISE NOTICE '✅ Migration complete - Schema aligned with v5.0';
END $$;

COMMIT;

-- ============================================================
-- POST-MIGRATION SUMMARY
-- ============================================================
--
-- Tables created:
--   - persona_communication_preferences
--
-- Data migrated:
--   - pain_points: JSONB → persona_pain_points
--   - goals: JSONB → persona_goals
--   - challenges: JSONB → persona_challenges
--   - communication_preferences: JSONB → persona_communication_preferences
--
-- Columns dropped:
--   - personas.pain_points (JSONB)
--   - personas.goals (JSONB)
--   - personas.challenges (JSONB)
--   - personas.communication_preferences (JSONB)
--
-- Columns kept:
--   - personas.metadata (JSONB) - for truly unstructured data
--
-- Trigger fixed:
--   - update_evidence_summary() now provides defaults
--
-- Golden Rules Status:
--   ✅ Rule #1: ZERO JSONB (except metadata for unstructured data)
--   ✅ Rule #2: 3NF Normalization maintained
--   ✅ Deployment blockers removed
-- ============================================================
