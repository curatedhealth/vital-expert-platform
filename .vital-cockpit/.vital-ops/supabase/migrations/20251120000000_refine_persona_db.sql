-- Migration: Consolidate Persona Data
-- Created: 2025-11-20
-- Description: Move persona-related fields from the agents table to the personas table to create a single source of truth for persona data.

-- Add new columns to the personas table
ALTER TABLE personas
ADD COLUMN IF NOT EXISTS expert_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS organization VARCHAR(255),
ADD COLUMN IF NOT EXISTS focus_areas TEXT[],
ADD COLUMN IF NOT EXISTS key_expertise TEXT,
ADD COLUMN IF EXISTS personality_traits TEXT[],
ADD COLUMN IF EXISTS conversation_style TEXT,
ADD COLUMN IF EXISTS avg_response_time_ms INTEGER,
ADD COLUMN IF EXISTS accuracy_score DECIMAL(3,2),
ADD COLUMN IF EXISTS specialization_depth DECIMAL(3,2),
ADD COLUMN IF EXISTS avatar_emoji VARCHAR(10),
ADD COLUMN IF EXISTS tagline TEXT,
ADD COLUMN IF EXISTS bio_short TEXT,
ADD COLUMN IF EXISTS bio_long TEXT,
ADD COLUMN IF EXISTS expert_domain VARCHAR(50);
-- Migration: Consolidate Persona Data
-- Created: 2025-11-20
-- Description: Move persona-related fields from the agents table to the personas table to create a single source of truth for persona data.

-- Update the personas table with data from the agents table
UPDATE personas p
SET
    expert_level = a.expert_level,
    organization = a.organization,
    focus_areas = a.focus_areas,
    key_expertise = a.key_expertise,
    personality_traits = a.personality_traits,
    conversation_style = a.conversation_style,
    avg_response_time_ms = a.avg_response_time_ms,
    accuracy_score = a.accuracy_score,
    specialization_depth = a.specialization_depth,
    avatar_emoji = a.avatar_emoji,
    tagline = a.tagline,
    bio_short = a.bio_short,
    bio_long = a.bio_long,
    expert_domain = a.expert_domain
FROM agents a
WHERE p.id = a.persona_id;
-- Migration: Consolidate Persona Data
-- Created: 2025-11-20
-- Description: Move persona-related fields from the agents table to the personas table to create a single source of truth for persona data.

-- Remove the old columns from the agents table
ALTER TABLE agents
DROP COLUMN IF EXISTS expert_level,
DROP COLUMN IF EXISTS organization,
DROP COLUMN IF EXISTS focus_areas,
DROP COLUMN IF EXISTS key_expertise,
DROP COLUMN IF EXISTS personality_traits,
DROP COLUMN IF EXISTS conversation_style,
DROP COLUMN IF EXISTS avg_response_time_ms,
DROP COLUMN IF EXISTS accuracy_score,
DROP COLUMN IF EXISTS specialization_depth,
DROP COLUMN IF EXISTS avatar_emoji,
DROP COLUMN IF EXISTS tagline,
DROP COLUMN IF EXISTS bio_short,
DROP COLUMN IF EXISTS bio_long,
DROP COLUMN IF EXISTS expert_domain;
-- Migration: Refine personas and org_roles relationship
-- Created: 2025-11-20
-- Description: Refine the personas and org_roles relationship by using a foreign key constraint with ON UPDATE CASCADE.

-- Drop the existing trigger
DROP TRIGGER IF EXISTS trigger_update_persona_org_from_role ON personas;
-- Migration: Refine personas and org_roles relationship
-- Created: 2025-11-20
-- Description: Refine the personas and org_roles relationship by using a foreign key constraint with ON UPDATE CASCADE.

-- Add the foreign key constraint with ON UPDATE CASCADE
ALTER TABLE personas
ADD CONSTRAINT fk_personas_org_roles
FOREIGN KEY (role_id)
REFERENCES org_roles(id)
ON UPDATE CASCADE;
