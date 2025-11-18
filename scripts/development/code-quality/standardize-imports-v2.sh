#!/bin/bash

# Quick Win #2: Standardize Imports (Version 2 - Comprehensive)
# Replace all @/shared/* imports with @vital/* workspace imports
# Handle @vital/ui package exports properly

set -e

echo "🔄 Starting comprehensive import standardization..."
echo ""

APP_DIR="/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"

cd "$APP_DIR"

# Step 1: Replace @/shared/components/ui/ → @vital/ui/components/
echo "🎨 Replacing @/shared/components/ui/ → @vital/ui/components/"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  sed -i '' 's#@/shared/components/ui/#@vital/ui/components/#g' {} \;

# Step 2: Replace @/shared/components/ → @vital/ui/components/
echo "🎨 Replacing @/shared/components/ → @vital/ui/components/"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  sed -i '' 's#@/shared/components/#@vital/ui/components/#g' {} \;

# Step 3: Replace @/shared/services/ → @vital/sdk/services/
echo "🔧 Replacing @/shared/services/ → @vital/sdk/services/"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  sed -i '' 's#@/shared/services/#@vital/sdk/services/#g' {} \;

# Step 4: Replace @/shared/utils/ → @vital/utils/
echo "🛠️  Replacing @/shared/utils/ → @vital/utils/"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  sed -i '' 's#@/shared/utils/#@vital/utils/#g' {} \;

# Step 5: Replace @/shared/utils with direct import → @vital/utils
echo "🛠️  Replacing @/shared/utils (direct) → @vital/utils"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  sed -i '' "s#from '@/shared/utils'#from '@vital/utils'#g" {} \;
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  sed -i '' 's#from "@/shared/utils"#from "@vital/utils"#g' {} \;

# Step 6: Replace @/shared/types/ → @vital/types/
echo "📐 Replacing @/shared/types/ → @vital/types/"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  sed -i '' 's#@/shared/types/#@vital/types/#g' {} \;

# Step 7: Replace @/shared/config/ → @vital/config/
echo "⚙️  Replacing @/shared/config/ → @vital/config/"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  sed -i '' 's#@/shared/config/#@vital/config/#g' {} \;

# Step 8: Replace @/shared/hooks/ → @vital/sdk/hooks/
echo "🪝 Replacing @/shared/hooks/ → @vital/sdk/hooks/"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  sed -i '' 's#@/shared/hooks/#@vital/sdk/hooks/#g' {} \;

# Step 9: Replace @/shared/lib/ → @vital/sdk/lib/
echo "📚 Replacing @/shared/lib/ → @vital/sdk/lib/"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  sed -i '' 's#@/shared/lib/#@vital/sdk/lib/#g' {} \;

# Verification
echo ""
echo "📊 Verifying changes..."
REMAINING_SHARED=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "@/shared/" {} \; 2>/dev/null | wc -l | xargs)

echo "  - Files still using @/shared/: $REMAINING_SHARED"

if [ "$REMAINING_SHARED" -gt 0 ]; then
  echo ""
  echo "⚠️  Some @/shared/ imports remain:"
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "@/shared/" {} \; 2>/dev/null | head -10
  echo ""
  echo "Sample remaining imports:"
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep "@/shared/" {} \; 2>/dev/null | head -5
fi

echo ""
echo "✅ Import standardization complete!"
echo ""
echo "Summary of changes:"
echo "  - @/shared/components/ui/ → @vital/ui/components/"
echo "  - @/shared/components/ → @vital/ui/components/"
echo "  - @/shared/services/ → @vital/sdk/services/"
echo "  - @/shared/utils/ → @vital/utils/"
echo "  - @/shared/types/ → @vital/types/"
echo "  - @/shared/config/ → @vital/config/"
echo "  - @/shared/hooks/ → @vital/sdk/hooks/"
echo "  - @/shared/lib/ → @vital/sdk/lib/"
