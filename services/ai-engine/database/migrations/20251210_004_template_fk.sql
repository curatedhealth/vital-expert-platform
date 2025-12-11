-- Optional: link missions to mission_templates via template_id

ALTER TABLE missions
    ADD COLUMN IF NOT EXISTS template_id UUID;

-- Add FK if mission_templates exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'mission_templates'
    ) THEN
        ALTER TABLE missions
            ADD CONSTRAINT missions_template_fk
            FOREIGN KEY (template_id) REFERENCES mission_templates(id);
    END IF;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END$$;
