-- Migration: Fix JTBD Mapping Table to Support Both Persona Types
-- Issue: persona_id is NOT NULL, preventing mappings for dh_personas
-- Solution: Make persona_id nullable, add constraint to ensure at least one is set

BEGIN;

-- Allow persona_id to be null so persona_dh_id can be used alone
ALTER TABLE public.jtbd_org_persona_mapping
ALTER COLUMN persona_id DROP NOT NULL;

-- Add check constraint to ensure at least one persona reference is set
ALTER TABLE public.jtbd_org_persona_mapping
ADD CONSTRAINT persona_reference_required
CHECK (persona_id IS NOT NULL OR persona_dh_id IS NOT NULL);

-- Add comment for documentation
COMMENT ON TABLE public.jtbd_org_persona_mapping IS
'Maps JTBDs to personas. Supports both org_personas (persona_id) and dh_personas (persona_dh_id). At least one must be set.';

COMMIT;
