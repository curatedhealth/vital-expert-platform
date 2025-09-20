-- Fix tier constraint to allow tier 5 agents
-- This must be run BEFORE inserting the agent data

-- Drop the existing constraint that only allows tiers 1-4
ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_tier_check;

-- Add the new constraint that allows tiers 1-5
ALTER TABLE agents ADD CONSTRAINT agents_tier_check CHECK (tier >= 1 AND tier <= 5);