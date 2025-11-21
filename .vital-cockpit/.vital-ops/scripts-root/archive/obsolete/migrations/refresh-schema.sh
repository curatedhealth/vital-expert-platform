#!/bin/bash

# Load environment variables
source .env.local 2>/dev/null || true

echo "🔄 Refreshing Supabase schema cache..."
echo ""
echo "📍 Your Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""
echo "Please follow these steps:"
echo ""
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Click 'Settings' (⚙️) in the left sidebar"
echo "4. Click 'API' in the settings menu"
echo "5. Scroll to 'Schema Cache' section"
echo "6. Click 'Reload schema cache' button"
echo "7. Wait 10-30 seconds"
echo ""
echo "Alternative: Restart PostgREST service"
echo "  • Go to Project Settings → API"
echo "  • Toggle 'PostgREST' off then on"
echo ""
echo "After refreshing, run:"
echo "  node scripts/direct-import-org-data.js"
echo ""

# Try to open browser if possible
if [[ "$OSTYPE" == "darwin"* ]]; then
  read -p "Open Supabase Dashboard in browser? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    PROJECT_ID=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\///' | sed 's/\.supabase\.co.*//')
    open "https://supabase.com/dashboard/project/$PROJECT_ID/settings/api"
  fi
fi
