#!/bin/bash

echo "📄 VITAL Expert Database Migration Content"
echo "=========================================="
echo ""
echo "Copy the content below and paste it into your Supabase SQL Editor:"
echo "https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/sql"
echo ""
echo "=========================================="
echo ""

cat supabase/migrations/20251007222509_complete_vital_schema.sql

echo ""
echo "=========================================="
echo ""
echo "After running the above migration, also run this to seed the agents:"
echo ""

cat restore-all-agents.sql
