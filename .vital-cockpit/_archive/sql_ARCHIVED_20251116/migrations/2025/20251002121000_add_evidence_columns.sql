-- ============================================================================
-- Add Evidence-Based Model Selection Columns to Agents Table
-- ============================================================================

-- Add columns for model justification and citation
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS model_justification TEXT,
ADD COLUMN IF NOT EXISTS model_citation TEXT;

-- Update existing agents with default values
UPDATE agents
SET model_justification = 'Legacy agent - model selected based on general capabilities'
WHERE model_justification IS NULL;

UPDATE agents
SET model_citation = 'No citation available for legacy agents'
WHERE model_citation IS NULL;

-- Add comments
COMMENT ON COLUMN agents.model_justification IS 'Evidence-based rationale for model selection including benchmark performance';
COMMENT ON COLUMN agents.model_citation IS 'Academic citation supporting model selection (DOI, arXiv, or source URL)';
