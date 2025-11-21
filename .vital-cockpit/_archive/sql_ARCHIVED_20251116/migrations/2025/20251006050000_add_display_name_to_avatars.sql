-- Add display_name column and expand icon column for Supabase Storage URLs
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS display_name VARCHAR(150);
ALTER TABLE avatars ALTER COLUMN icon TYPE VARCHAR(255);
