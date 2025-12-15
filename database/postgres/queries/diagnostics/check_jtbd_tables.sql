-- Check what JTBD tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%jtbd%' OR table_name LIKE '%job%';
