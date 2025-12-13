-- Normalize knowledge sources and ensure agent_knowledge.source_id has a proper FK.
-- Assumes you will load sources_rows.csv into a staging table before running this.

BEGIN;

-- 1) Prepare staging table for sources import.
CREATE TEMP TABLE IF NOT EXISTS staging_sources (
  id UUID,
  code TEXT,
  name TEXT,
  short_name TEXT,
  category_id UUID,
  region TEXT,
  country TEXT,
  city TEXT,
  logo_url TEXT,
  logo_dark_url TEXT,
  brand_color TEXT,
  website TEXT,
  about TEXT,
  stock_ticker TEXT,
  founded_year INT,
  authority_level TEXT,
  rag_priority_weight NUMERIC,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) ON COMMIT PRESERVE ROWS;

-- Example import (run manually before this script):
-- \copy staging_sources FROM '/path/to/sources_rows.csv' CSV HEADER;

-- 2) Ensure sources table exists with unique code.
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  short_name TEXT,
  category_id UUID,
  region TEXT,
  country TEXT,
  city TEXT,
  logo_url TEXT,
  logo_dark_url TEXT,
  brand_color TEXT,
  website TEXT,
  about TEXT,
  stock_ticker TEXT,
  founded_year INT,
  authority_level TEXT,
  rag_priority_weight NUMERIC,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3) Upsert sources from staging.
INSERT INTO sources (id, code, name, short_name, category_id, region, country, city, logo_url, logo_dark_url, brand_color, website, about, stock_ticker, founded_year, authority_level, rag_priority_weight, is_active, created_at, updated_at)
SELECT
  s.id,
  s.code,
  s.name,
  s.short_name,
  s.category_id,
  s.region,
  s.country,
  s.city,
  s.logo_url,
  s.logo_dark_url,
  s.brand_color,
  s.website,
  s.about,
  s.stock_ticker,
  s.founded_year,
  s.authority_level,
  s.rag_priority_weight,
  COALESCE(s.is_active, TRUE),
  COALESCE(s.created_at, NOW()),
  COALESCE(s.updated_at, NOW())
FROM staging_sources s
ON CONFLICT (id) DO UPDATE
SET code = EXCLUDED.code,
    name = EXCLUDED.name,
    short_name = EXCLUDED.short_name,
    category_id = EXCLUDED.category_id,
    region = EXCLUDED.region,
    country = EXCLUDED.country,
    city = EXCLUDED.city,
    logo_url = EXCLUDED.logo_url,
    logo_dark_url = EXCLUDED.logo_dark_url,
    brand_color = EXCLUDED.brand_color,
    website = EXCLUDED.website,
    about = EXCLUDED.about,
    stock_ticker = EXCLUDED.stock_ticker,
    founded_year = EXCLUDED.founded_year,
    authority_level = EXCLUDED.authority_level,
    rag_priority_weight = EXCLUDED.rag_priority_weight,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- 4) Ensure agent_knowledge has source_id with FK to sources.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_knowledge' AND column_name = 'source_id'
  ) THEN
    ALTER TABLE agent_knowledge
      ADD COLUMN source_id UUID;
  END IF;
END $$;

ALTER TABLE agent_knowledge
  ADD CONSTRAINT IF NOT EXISTS agent_knowledge_source_fk
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE SET NULL;

-- Optional: if you have a staging table for agent_knowledge import, ensure source_id values exist in sources before insert.
-- Otherwise, run a report of invalid source_ids:
-- SELECT COUNT(*) FROM agent_knowledge ak WHERE ak.source_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sources s WHERE s.id = ak.source_id);

COMMIT;

-- Verification:
-- SELECT COUNT(*) FROM sources;
-- SELECT COUNT(*) FROM agent_knowledge ak WHERE ak.source_id IS NOT NULL;
