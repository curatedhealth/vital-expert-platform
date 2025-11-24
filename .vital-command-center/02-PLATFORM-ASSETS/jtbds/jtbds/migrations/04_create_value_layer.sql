-- =====================================================================
-- PHASE 2: Create Value Layer (First-Class Entity)
-- =====================================================================
-- Purpose: Create value-focused tables to capture:
-- - Value Categories (Smarter, Faster, Better, Efficient, Safer, Scalable)
-- - Value Drivers (Internal & External)
-- - JTBD → Value mappings with impact quantification

-- =====================================================================
-- Value Categories (The 6 Universal Categories)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.value_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,  -- For UI visualization
  icon TEXT,   -- Icon name for UI
  sort_order INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed standard value categories
INSERT INTO value_categories (code, name, description, color, sort_order) VALUES
  ('SMARTER', 'Smarter', 'Enhanced decision-making, insights, and intelligence', '#9333EA', 1),
  ('FASTER', 'Faster', 'Improved speed, efficiency, and time-to-value', '#3B82F6', 2),
  ('BETTER', 'Better', 'Higher quality, accuracy, and outcomes', '#10B981', 3),
  ('EFFICIENT', 'Efficient', 'Optimized resource utilization and cost-effectiveness', '#F59E0B', 4),
  ('SAFER', 'Safer', 'Reduced risk, improved compliance and safety', '#EF4444', 5),
  ('SCALABLE', 'Scalable', 'Growth capability and adaptability', '#8B5CF6', 6)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

CREATE INDEX IF NOT EXISTS idx_value_categories_code ON value_categories(code);

COMMENT ON TABLE value_categories IS 'Universal value categories for classifying value drivers and outcomes';

-- =====================================================================
-- Value Drivers (Internal & External)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.value_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  driver_type TEXT NOT NULL CHECK (driver_type IN ('internal', 'external')),
  description TEXT,
  
  -- Link to value category
  primary_category_id UUID REFERENCES value_categories(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed standard value drivers
INSERT INTO value_drivers (code, name, driver_type, description) VALUES
  -- Internal drivers
  ('OPERATIONAL_EFFICIENCY', 'Operational Efficiency', 'internal', 'Streamlined processes and reduced operational overhead'),
  ('SCIENTIFIC_QUALITY', 'Scientific Quality', 'internal', 'Enhanced scientific rigor and data quality'),
  ('COMPLIANCE', 'Regulatory Compliance', 'internal', 'Improved adherence to regulatory requirements'),
  ('COST_REDUCTION', 'Cost Reduction', 'internal', 'Decreased operational and resource costs'),
  ('EMPLOYEE_EXPERIENCE', 'Employee Experience', 'internal', 'Improved employee satisfaction and productivity'),
  ('DECISION_QUALITY', 'Decision Quality', 'internal', 'Better informed and faster decision-making'),
  ('KNOWLEDGE_MANAGEMENT', 'Knowledge Management', 'internal', 'Improved capture, sharing, and utilization of knowledge'),
  
  -- External drivers
  ('HCP_EXPERIENCE', 'HCP Experience', 'external', 'Enhanced healthcare provider engagement and satisfaction'),
  ('PATIENT_IMPACT', 'Patient Impact', 'external', 'Improved patient outcomes and access'),
  ('MARKET_ACCESS', 'Market Access', 'external', 'Faster and broader market access'),
  ('STAKEHOLDER_TRUST', 'Stakeholder Trust', 'external', 'Increased trust from regulators, payers, and patients'),
  ('COMPETITIVE_ADVANTAGE', 'Competitive Advantage', 'external', 'Differentiation and market positioning'),
  ('BRAND_REPUTATION', 'Brand Reputation', 'external', 'Enhanced brand perception and credibility')
ON CONFLICT (code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_value_drivers_code ON value_drivers(code);
CREATE INDEX IF NOT EXISTS idx_value_drivers_type ON value_drivers(driver_type);

COMMENT ON TABLE value_drivers IS 'Internal and external value drivers that JTBDs can impact';

-- =====================================================================
-- JTBD → Value Category Mapping
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.jtbd_value_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES value_categories(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,  -- Cached for performance
  
  -- Relevance/impact scoring
  relevance_score NUMERIC(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  is_primary BOOLEAN DEFAULT FALSE,
  
  -- Evidence
  rationale TEXT,
  evidence_source_id UUID,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(jtbd_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_jtbd_value_cat_jtbd ON jtbd_value_categories(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_value_cat_category ON jtbd_value_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_value_cat_name ON jtbd_value_categories(category_name);

COMMENT ON TABLE jtbd_value_categories IS 'Maps JTBDs to value categories (Smarter, Faster, etc.)';

-- =====================================================================
-- JTBD → Value Driver Mapping
-- =====================================================================
-- Drop and recreate to ensure correct schema
DROP TABLE IF EXISTS public.jtbd_value_drivers CASCADE;

CREATE TABLE public.jtbd_value_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL,
  driver_id UUID NOT NULL REFERENCES value_drivers(id) ON DELETE CASCADE,
  driver_name TEXT NOT NULL,  -- Cached for performance
  
  -- Impact quantification
  impact_strength NUMERIC(3,2) CHECK (impact_strength BETWEEN 0 AND 1),
  quantified_value NUMERIC,
  value_unit TEXT,  -- e.g., 'USD', 'hours', 'percentage'
  confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high', 'very_high')),
  
  -- Evidence
  rationale TEXT,
  evidence_source_id UUID,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(jtbd_id, driver_id)
);

CREATE INDEX IF NOT EXISTS idx_jtbd_value_drv_jtbd ON jtbd_value_drivers(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_value_drv_driver ON jtbd_value_drivers(driver_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_value_drv_name ON jtbd_value_drivers(driver_name);

COMMENT ON TABLE jtbd_value_drivers IS 'Maps JTBDs to value drivers with quantified impact';

-- =====================================================================
-- Auto-sync triggers for cached names
-- =====================================================================
CREATE OR REPLACE FUNCTION sync_jtbd_value_category_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category_id IS NOT NULL AND (NEW.category_name IS NULL OR NEW.category_name = '') THEN
    SELECT name INTO NEW.category_name
    FROM value_categories
    WHERE id = NEW.category_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_jtbd_value_category_name ON jtbd_value_categories;
CREATE TRIGGER trigger_sync_jtbd_value_category_name
  BEFORE INSERT OR UPDATE OF category_id ON jtbd_value_categories
  FOR EACH ROW
  EXECUTE FUNCTION sync_jtbd_value_category_name();

CREATE OR REPLACE FUNCTION sync_jtbd_value_driver_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.driver_id IS NOT NULL AND (NEW.driver_name IS NULL OR NEW.driver_name = '') THEN
    SELECT name INTO NEW.driver_name
    FROM value_drivers
    WHERE id = NEW.driver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_jtbd_value_driver_name ON jtbd_value_drivers;
CREATE TRIGGER trigger_sync_jtbd_value_driver_name
  BEFORE INSERT OR UPDATE OF driver_id ON jtbd_value_drivers
  FOR EACH ROW
  EXECUTE FUNCTION sync_jtbd_value_driver_name();

DO $$
BEGIN
  RAISE NOTICE '=== VALUE LAYER CREATED ===';
  RAISE NOTICE '✓ Value categories table created and seeded (6 categories)';
  RAISE NOTICE '✓ Value drivers table created and seeded (13 drivers)';
  RAISE NOTICE '✓ JTBD value mapping tables created with auto-sync triggers';
END $$;

