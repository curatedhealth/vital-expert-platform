-- =====================================================================
-- ADD DIGITAL HEALTH ENUM VALUES - SIMPLE VERSION
-- Run this file to add the enum values
-- These commands must be run OUTSIDE of BEGIN/COMMIT blocks
-- =====================================================================

-- Add Digital Health enum values to functional_area_type
-- Note: If a value already exists, you'll get an error - that's okay, just continue

ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS 'Digital Health Strategy & Innovation';
ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS 'Digital Platforms & Solutions';
ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS 'Data Science & Analytics';
ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS 'Digital Clinical Development';
ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS 'Patient & Provider Experience';
ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS 'Regulatory, Quality & Compliance';
ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS 'Commercialization & Market Access';
ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS 'Technology & IT Infrastructure';
ALTER TYPE functional_area_type ADD VALUE IF NOT EXISTS 'Legal & IP for Digital';

-- Note: IF NOT EXISTS might not be supported in all PostgreSQL versions
-- If you get an error, the value might already exist - that's fine, continue with the next one

