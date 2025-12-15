-- Quick check to see if user_panels table exists
-- Run this in Supabase SQL Editor to verify

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_panels'
    ) 
    THEN '✅ user_panels table EXISTS'
    ELSE '❌ user_panels table DOES NOT EXIST - Run scripts/create-user-panels-table.sql'
  END AS table_status;

-- Also check panels table
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'panels'
    ) 
    THEN '✅ panels table EXISTS'
    ELSE '❌ panels table DOES NOT EXIST'
  END AS panels_status;

