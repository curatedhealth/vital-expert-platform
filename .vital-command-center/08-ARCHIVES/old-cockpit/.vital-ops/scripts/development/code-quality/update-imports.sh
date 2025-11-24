#!/bin/bash

# Update import paths to use @vital/* packages
# This script updates all apps to use the new monorepo packages

APPS=("digital-health-startup" "consulting" "pharma" "payers")

echo "🔄 Updating import paths to use @vital/* packages..."

for app in "${APPS[@]}"; do
  echo ""
  echo "📦 Updating app: $app"

  APP_DIR="apps/$app/src"

  if [ ! -d "$APP_DIR" ]; then
    echo "⚠️  Directory not found: $APP_DIR"
    continue
  fi

  # Update UI component imports
  echo "  - Updating UI component imports..."
  find "$APP_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
    -e "s|from '@/components/ui/|from '@vital/ui/components/|g" \
    -e "s|from '@/components/ui'|from '@vital/ui'|g" \
    {} +

  # Update utils imports
  echo "  - Updating utils imports..."
  find "$APP_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
    -e "s|from '@/lib/utils'|from '@vital/ui/lib/utils'|g" \
    {} +

  # Update Supabase client imports
  echo "  - Updating SDK imports..."
  find "$APP_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
    -e "s|from '@/lib/supabase/client'|from '@vital/sdk/client'|g" \
    -e "s|from '@/lib/supabase/server'|from '@vital/sdk'|g" \
    -e "s|from '@/lib/supabase/|from '@vital/sdk/lib/supabase/|g" \
    {} +

  # Update type imports
  echo "  - Updating type imports..."
  find "$APP_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
    -e "s|from '@/types/database|from '@vital/sdk/types/database|g" \
    -e "s|from '@/types/auth|from '@vital/sdk/types/auth|g" \
    {} +

  echo "  ✅ Completed: $app"
done

echo ""
echo "✨ All import paths updated successfully!"
echo ""
echo "Next steps:"
echo "1. Run 'pnpm build' to test the build"
echo "2. Fix any remaining import issues"
echo "3. Commit the changes"
