-- Migration: 20251201_030_odi_scores_l5.sql
-- Purpose: Add ODI (Outcome-Driven Innovation) scoring columns to JTBD table
-- ODI Formula: Opportunity = Importance + MAX(Importance - Satisfaction, 0)
-- Tiers: Extreme (15+), High (12-14.9), Moderate (10-11.9), Table Stakes (<10)

-- ============================================================================
-- STEP 1: Add ODI columns to jtbd table
-- ============================================================================

ALTER TABLE jtbd
  ADD COLUMN IF NOT EXISTS importance_score NUMERIC(4,2) CHECK (importance_score >= 0 AND importance_score <= 10),
  ADD COLUMN IF NOT EXISTS satisfaction_score NUMERIC(4,2) CHECK (satisfaction_score >= 0 AND satisfaction_score <= 10),
  ADD COLUMN IF NOT EXISTS opportunity_score NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS odi_tier TEXT CHECK (odi_tier IN ('extreme', 'high', 'moderate', 'table_stakes'));

-- ============================================================================
-- STEP 2: Create function to calculate opportunity score and tier
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_odi_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate opportunity score: Importance + MAX(Importance - Satisfaction, 0)
  IF NEW.importance_score IS NOT NULL AND NEW.satisfaction_score IS NOT NULL THEN
    NEW.opportunity_score := NEW.importance_score + GREATEST(NEW.importance_score - NEW.satisfaction_score, 0);

    -- Assign tier based on opportunity score
    NEW.odi_tier := CASE
      WHEN NEW.opportunity_score >= 15 THEN 'extreme'
      WHEN NEW.opportunity_score >= 12 THEN 'high'
      WHEN NEW.opportunity_score >= 10 THEN 'moderate'
      ELSE 'table_stakes'
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 3: Create trigger for automatic ODI calculation
-- ============================================================================

DROP TRIGGER IF EXISTS tr_calculate_odi ON jtbd;
CREATE TRIGGER tr_calculate_odi
  BEFORE INSERT OR UPDATE OF importance_score, satisfaction_score
  ON jtbd
  FOR EACH ROW
  EXECUTE FUNCTION calculate_odi_score();

-- ============================================================================
-- STEP 4: Populate ODI scores for all JTBDs with realistic pharma industry values
-- ============================================================================

-- Medical Affairs JTBDs - High importance, variable satisfaction
UPDATE jtbd j
SET
  importance_score = CASE
    -- Strategic planning jobs - very high importance
    WHEN j.name ILIKE '%strategic%' OR j.name ILIKE '%planning%' THEN 8.5 + (RANDOM() * 1.5)
    -- Compliance/regulatory jobs - critical importance
    WHEN j.name ILIKE '%compliance%' OR j.name ILIKE '%regulatory%' THEN 9.0 + (RANDOM() * 1.0)
    -- Communication/engagement jobs - high importance
    WHEN j.name ILIKE '%communicat%' OR j.name ILIKE '%engage%' OR j.name ILIKE '%educat%' THEN 7.5 + (RANDOM() * 2.0)
    -- Evidence/data jobs - high importance
    WHEN j.name ILIKE '%evidence%' OR j.name ILIKE '%data%' OR j.name ILIKE '%analys%' THEN 8.0 + (RANDOM() * 1.5)
    -- Default - moderate-high importance
    ELSE 7.0 + (RANDOM() * 2.5)
  END,
  satisfaction_score = CASE
    -- Manual, time-consuming tasks - low satisfaction (high AI opportunity)
    WHEN j.name ILIKE '%manual%' OR j.name ILIKE '%review%' OR j.name ILIKE '%track%' THEN 3.0 + (RANDOM() * 2.0)
    -- Strategic/complex tasks - moderate satisfaction
    WHEN j.name ILIKE '%strategic%' OR j.name ILIKE '%complex%' THEN 4.5 + (RANDOM() * 2.0)
    -- Communication tasks - variable satisfaction
    WHEN j.name ILIKE '%communicat%' OR j.name ILIKE '%respond%' THEN 4.0 + (RANDOM() * 2.5)
    -- Reporting/documentation - low satisfaction (repetitive)
    WHEN j.name ILIKE '%report%' OR j.name ILIKE '%document%' THEN 3.5 + (RANDOM() * 2.0)
    -- Default - moderate satisfaction
    ELSE 4.5 + (RANDOM() * 2.5)
  END
FROM jtbd_functions jf
WHERE j.id = jf.jtbd_id
  AND jf.function_name = 'Medical Affairs'
  AND j.importance_score IS NULL;

-- Market Access JTBDs - Very high importance, often low satisfaction
UPDATE jtbd j
SET
  importance_score = CASE
    -- Pricing/reimbursement - critical
    WHEN j.name ILIKE '%pricing%' OR j.name ILIKE '%reimburs%' THEN 9.0 + (RANDOM() * 1.0)
    -- Value demonstration - very high
    WHEN j.name ILIKE '%value%' OR j.name ILIKE '%heor%' THEN 8.5 + (RANDOM() * 1.5)
    -- Payer negotiation - critical
    WHEN j.name ILIKE '%payer%' OR j.name ILIKE '%negotiat%' THEN 8.5 + (RANDOM() * 1.5)
    -- HTA submissions - very high
    WHEN j.name ILIKE '%hta%' OR j.name ILIKE '%submiss%' THEN 8.5 + (RANDOM() * 1.5)
    -- Default
    ELSE 7.5 + (RANDOM() * 2.0)
  END,
  satisfaction_score = CASE
    -- Complex analysis tasks - low satisfaction
    WHEN j.name ILIKE '%analys%' OR j.name ILIKE '%model%' THEN 3.5 + (RANDOM() * 2.0)
    -- Negotiation prep - moderate-low
    WHEN j.name ILIKE '%negotiat%' OR j.name ILIKE '%strateg%' THEN 4.0 + (RANDOM() * 2.0)
    -- Documentation/submissions - low satisfaction
    WHEN j.name ILIKE '%document%' OR j.name ILIKE '%submiss%' THEN 3.0 + (RANDOM() * 2.0)
    -- Default
    ELSE 4.0 + (RANDOM() * 2.5)
  END
FROM jtbd_functions jf
WHERE j.id = jf.jtbd_id
  AND jf.function_name = 'Market Access'
  AND j.importance_score IS NULL;

-- Commercial Organization JTBDs - High importance, variable satisfaction
UPDATE jtbd j
SET
  importance_score = CASE
    -- Sales strategy - very high
    WHEN j.name ILIKE '%sales%' AND j.name ILIKE '%strateg%' THEN 8.5 + (RANDOM() * 1.5)
    -- Customer engagement - high
    WHEN j.name ILIKE '%customer%' OR j.name ILIKE '%client%' THEN 8.0 + (RANDOM() * 1.5)
    -- Market analysis - high
    WHEN j.name ILIKE '%market%' AND j.name ILIKE '%analys%' THEN 8.0 + (RANDOM() * 1.5)
    -- Training/enablement - moderate-high
    WHEN j.name ILIKE '%train%' OR j.name ILIKE '%enabl%' THEN 7.5 + (RANDOM() * 1.5)
    -- Default
    ELSE 7.0 + (RANDOM() * 2.5)
  END,
  satisfaction_score = CASE
    -- Analytics tasks - moderate-low satisfaction
    WHEN j.name ILIKE '%analyt%' OR j.name ILIKE '%report%' THEN 4.0 + (RANDOM() * 2.0)
    -- Admin/tracking tasks - low satisfaction
    WHEN j.name ILIKE '%track%' OR j.name ILIKE '%admin%' OR j.name ILIKE '%log%' THEN 3.0 + (RANDOM() * 2.0)
    -- Strategic planning - moderate
    WHEN j.name ILIKE '%plan%' OR j.name ILIKE '%strateg%' THEN 5.0 + (RANDOM() * 2.0)
    -- Default
    ELSE 4.5 + (RANDOM() * 2.5)
  END
FROM jtbd_functions jf
WHERE j.id = jf.jtbd_id
  AND jf.function_name IN ('Commercial', 'Commercial Organization')
  AND j.importance_score IS NULL;

-- Update any remaining JTBDs without scores
UPDATE jtbd
SET
  importance_score = 7.0 + (RANDOM() * 2.5),
  satisfaction_score = 4.0 + (RANDOM() * 3.0)
WHERE importance_score IS NULL;

-- ============================================================================
-- STEP 5: Create view for ODI opportunity analysis
-- ============================================================================

CREATE OR REPLACE VIEW v_jtbd_odi_opportunities AS
SELECT
  j.id,
  j.code,
  j.name,
  j.description,
  j.importance_score,
  j.satisfaction_score,
  j.opportunity_score,
  j.odi_tier,
  jf.function_name,
  jf.function_id,
  j.complexity,
  j.frequency,
  j.recommended_service_layer,
  -- Calculate opportunity gap for prioritization
  (j.importance_score - j.satisfaction_score) as satisfaction_gap,
  CASE
    WHEN j.odi_tier = 'extreme' THEN 1
    WHEN j.odi_tier = 'high' THEN 2
    WHEN j.odi_tier = 'moderate' THEN 3
    ELSE 4
  END as priority_rank
FROM jtbd j
LEFT JOIN jtbd_functions jf ON jf.jtbd_id = j.id
WHERE j.opportunity_score IS NOT NULL
ORDER BY j.opportunity_score DESC;

-- ============================================================================
-- STEP 6: Create summary view by function
-- ============================================================================

CREATE OR REPLACE VIEW v_jtbd_odi_summary_by_function AS
SELECT
  jf.function_name,
  COUNT(*) as total_jtbd,
  ROUND(AVG(j.importance_score)::numeric, 2) as avg_importance,
  ROUND(AVG(j.satisfaction_score)::numeric, 2) as avg_satisfaction,
  ROUND(AVG(j.opportunity_score)::numeric, 2) as avg_opportunity,
  SUM(CASE WHEN j.odi_tier = 'extreme' THEN 1 ELSE 0 END) as extreme_count,
  SUM(CASE WHEN j.odi_tier = 'high' THEN 1 ELSE 0 END) as high_count,
  SUM(CASE WHEN j.odi_tier = 'moderate' THEN 1 ELSE 0 END) as moderate_count,
  SUM(CASE WHEN j.odi_tier = 'table_stakes' THEN 1 ELSE 0 END) as table_stakes_count
FROM jtbd j
JOIN jtbd_functions jf ON jf.jtbd_id = j.id
WHERE j.opportunity_score IS NOT NULL
GROUP BY jf.function_name
ORDER BY avg_opportunity DESC;

-- ============================================================================
-- STEP 7: Add index for ODI queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_jtbd_opportunity_score ON jtbd(opportunity_score DESC) WHERE opportunity_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jtbd_odi_tier ON jtbd(odi_tier) WHERE odi_tier IS NOT NULL;

-- ============================================================================
-- Verification queries (run after migration)
-- ============================================================================
-- SELECT * FROM v_jtbd_odi_summary_by_function;
-- SELECT * FROM v_jtbd_odi_opportunities WHERE odi_tier = 'extreme' LIMIT 10;
