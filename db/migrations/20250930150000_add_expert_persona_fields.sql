-- Add Expert Persona Fields to Agents Table
-- This migration extends the agents table to support rich expert profiles for Manual Expert Selection Mode

-- Add new columns for expert persona
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS expert_level VARCHAR(50),  -- 'c_level', 'senior', 'lead', 'specialist'
ADD COLUMN IF NOT EXISTS organization VARCHAR(255),  -- Organization/company
ADD COLUMN IF NOT EXISTS focus_areas TEXT[],  -- Array of focus areas
ADD COLUMN IF NOT EXISTS key_expertise TEXT,  -- Key expertise summary
ADD COLUMN IF NOT EXISTS personality_traits TEXT[],  -- Array of personality traits
ADD COLUMN IF NOT EXISTS conversation_style TEXT,  -- Conversation style description
ADD COLUMN IF NOT EXISTS avg_response_time_ms INTEGER DEFAULT 2000,  -- Average response time
ADD COLUMN IF NOT EXISTS accuracy_score DECIMAL(3,2) DEFAULT 0.90,  -- Accuracy score (0-1)
ADD COLUMN IF NOT EXISTS specialization_depth DECIMAL(3,2) DEFAULT 0.85,  -- Specialization depth (0-1)
ADD COLUMN IF NOT EXISTS avatar_emoji VARCHAR(10),  -- Emoji avatar
ADD COLUMN IF NOT EXISTS tagline TEXT,  -- Short tagline
ADD COLUMN IF NOT EXISTS bio_short TEXT,  -- Short bio
ADD COLUMN IF NOT EXISTS bio_long TEXT,  -- Long bio
ADD COLUMN IF NOT EXISTS expert_domain VARCHAR(50);  -- Expert domain category

-- Create index on expert_domain for filtering
CREATE INDEX IF NOT EXISTS idx_agents_expert_domain ON agents(expert_domain);

-- Create index on expert_level for filtering
CREATE INDEX IF NOT EXISTS idx_agents_expert_level ON agents(expert_level);

-- Add comment explaining the new fields
COMMENT ON COLUMN agents.expert_level IS 'Expert seniority level: c_level, senior, lead, specialist';
COMMENT ON COLUMN agents.expert_domain IS 'Expert domain: design_ux, healthcare_clinical, technology, business_strategy, global_regulatory, patient_advocacy';
COMMENT ON COLUMN agents.focus_areas IS 'Array of specific focus areas for this expert';
COMMENT ON COLUMN agents.personality_traits IS 'Array of personality traits that define expert''s character';
COMMENT ON COLUMN agents.conversation_style IS 'Description of how the expert communicates';
COMMENT ON COLUMN agents.specialization_depth IS 'Measure of how specialized this expert is (0-1)';