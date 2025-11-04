-- ============================================================================
-- Migration: Create Business Functions Table
-- ============================================================================
-- Purpose: Create the business_functions table that is referenced by other tables
-- Date: 2025-11-04
-- ============================================================================

BEGIN;

-- Create business_functions table if it doesn't exist
CREATE TABLE IF NOT EXISTS business_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  parent_function_id UUID REFERENCES business_functions(id),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_business_functions_code ON business_functions(code);
CREATE INDEX IF NOT EXISTS idx_business_functions_is_active ON business_functions(is_active);
CREATE INDEX IF NOT EXISTS idx_business_functions_parent ON business_functions(parent_function_id);

-- Insert standard healthcare/pharma business functions
INSERT INTO business_functions (name, code, description, category, sort_order)
VALUES
  -- Strategic Functions
  ('Strategic Planning', 'STRATEGIC_PLANNING', 'Long-term strategic planning and corporate development', 'Strategic', 10),
  ('Business Development', 'BUSINESS_DEV', 'New business opportunities, partnerships, and M&A', 'Strategic', 20),
  ('Portfolio Management', 'PORTFOLIO_MGMT', 'Product and pipeline portfolio management', 'Strategic', 30),
  
  -- R&D Functions
  ('Research & Development', 'R_AND_D', 'Drug discovery and development', 'R&D', 100),
  ('Clinical Development', 'CLINICAL_DEV', 'Clinical trials and studies', 'R&D', 110),
  ('Regulatory Affairs', 'REGULATORY', 'Regulatory submissions and compliance', 'R&D', 120),
  ('Medical Affairs', 'MEDICAL_AFFAIRS', 'Medical science liaison and education', 'R&D', 130),
  ('Pharmacovigilance', 'PHARMACOVIG', 'Drug safety monitoring and reporting', 'R&D', 140),
  
  -- Commercial Functions
  ('Commercial Operations', 'COMMERCIAL_OPS', 'Sales and marketing operations', 'Commercial', 200),
  ('Market Access', 'MARKET_ACCESS', 'Pricing, reimbursement, and payer relations', 'Commercial', 210),
  ('Sales', 'SALES', 'Sales force and account management', 'Commercial', 220),
  ('Marketing', 'MARKETING', 'Product marketing and brand management', 'Commercial', 230),
  
  -- Operations Functions
  ('Manufacturing', 'MANUFACTURING', 'Drug manufacturing and production', 'Operations', 300),
  ('Supply Chain', 'SUPPLY_CHAIN', 'Supply chain and logistics management', 'Operations', 310),
  ('Quality Assurance', 'QUALITY_ASSURANCE', 'Quality systems and compliance', 'Operations', 320),
  ('Quality Control', 'QUALITY_CONTROL', 'Product testing and quality verification', 'Operations', 330),
  
  -- Support Functions
  ('Finance', 'FINANCE', 'Financial planning, accounting, and reporting', 'Support', 400),
  ('Human Resources', 'HR', 'Talent management and people operations', 'Support', 410),
  ('Information Technology', 'IT', 'Technology infrastructure and systems', 'Support', 420),
  ('Legal', 'LEGAL', 'Legal affairs and intellectual property', 'Support', 430),
  ('Compliance', 'COMPLIANCE', 'Corporate compliance and ethics', 'Support', 440),
  
  -- Data & Analytics
  ('Data Science', 'DATA_SCIENCE', 'Advanced analytics and machine learning', 'Analytics', 500),
  ('Real World Evidence', 'RWE', 'Real-world data analysis and insights', 'Analytics', 510),
  ('Health Economics', 'HEOR', 'Health economics and outcomes research', 'Analytics', 520),
  ('Market Research', 'MARKET_RESEARCH', 'Market intelligence and competitive analysis', 'Analytics', 530)
ON CONFLICT (code) DO NOTHING;

-- Add comment
COMMENT ON TABLE business_functions IS 'Healthcare and pharmaceutical business functions for organizational structure';

COMMIT;

-- Verify
SELECT 
  name,
  code,
  category,
  is_active
FROM business_functions
ORDER BY category, sort_order;

