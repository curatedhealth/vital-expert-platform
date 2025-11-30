-- ============================================================================
-- Migration: 053 - Complete Enterprise Ontology for Medical, Access, Commercial
-- Description: KPIs, Pain Points, Outcomes, AI Suitability for all 113 JTBDs
-- Created: 2024-11-29
-- Tenant: Pharmaceuticals (c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b)
-- ============================================================================

-- This migration adds:
-- 1. JTBD-Function mappings
-- 2. JTBD KPIs (3 per JTBD = 339 KPIs)
-- 3. JTBD Pain Points (3 per JTBD = 339 pain points)
-- 4. JTBD Desired Outcomes (3 per JTBD = 339 outcomes)
-- 5. JTBD AI Suitability scores (1 per JTBD = 113 scores)

-- Run via REST API shell script for reliability
