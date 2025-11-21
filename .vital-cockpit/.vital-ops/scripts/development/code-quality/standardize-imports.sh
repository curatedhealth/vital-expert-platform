#!/bin/bash

# Quick Win #2: Standardize Imports
# Replace all @/* imports with @vital/* workspace imports

set -e

echo "🔄 Starting import standardization..."
echo ""

APP_DIR="/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"

cd "$APP_DIR"

# Count files before changes
echo "📊 Analyzing current imports..."
UI_COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "@/shared/components/ui/" {} \; 2>/dev/null | wc -l | xargs)
SERVICES_COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "@/shared/services/" {} \; 2>/dev/null | wc -l | xargs)
UTILS_COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "@/shared/utils/" {} \; 2>/dev/null | wc -l | xargs)
TYPES_COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "@/shared/types/" {} \; 2>/dev/null | wc -l | xargs)
CONFIG_COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "@/shared/config/" {} \; 2>/dev/null | wc -l | xargs)

echo "  - Files with @/shared/components/ui/: $UI_COUNT"
echo "  - Files with @/shared/services/: $SERVICES_COUNT"
echo "  - Files with @/shared/utils/: $UTILS_COUNT"
echo "  - Files with @/shared/types/: $TYPES_COUNT"
echo "  - Files with @/shared/config/: $CONFIG_COUNT"
echo ""

# 1. Replace UI component imports
echo "🎨 Replacing @/shared/components/ui/ → @vital/ui/"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  perl -pi -e 's#@/shared/components/ui/#@vital/ui/#g' {} \;

# 2. Replace SDK/services imports
echo "🔧 Replacing @/shared/services/ → @vital/sdk/"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  perl -pi -e 's#@/shared/services/#@vital/sdk/services/#g' {} \;

# 3. Replace utils imports
echo "🛠️  Replacing @/shared/utils/ → @vital/utils/"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  perl -pi -e 's#@/shared/utils/#@vital/utils/#g' {} \;

# 4. Replace types imports
echo "📐 Replacing @/shared/types/ → @vital/types/"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  perl -pi -e 's#@/shared/types/#@vital/types/#g' {} \;

# 5. Replace config imports
echo "⚙️  Replacing @/shared/config/ → @vital/config/"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  perl -pi -e 's#@/shared/config/#@vital/config/#g' {} \;

# 6. Handle imports without trailing slashes (direct module imports)
echo "🔄 Handling direct imports without trailing slashes..."
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  perl -pi -e 's#@/shared/utils'"'"'#@vital/utils'"'"'#g' {} \;
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  perl -pi -e 's#@/shared/utils"#@vital/utils"#g' {} \;

# 7. Handle any remaining @/shared/hooks, @/shared/lib, @/shared/components, etc.
echo "🔄 Replacing other @/shared patterns..."
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  perl -pi -e 's#@/shared/components/#@vital/ui/#g' {} \;
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  perl -pi -e 's#@/shared/hooks/#@vital/sdk/hooks/#g' {} \;
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  perl -pi -e 's#@/shared/lib/#@vital/sdk/lib/#g' {} \;

# Count files after changes (check for remaining @/shared imports)
echo ""
echo "📊 Verifying changes..."
REMAINING_SHARED=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "@/shared/" {} \; 2>/dev/null | wc -l | xargs)

echo "  - Files still using @/shared/: $REMAINING_SHARED"

if [ "$REMAINING_SHARED" -gt 0 ]; then
  echo ""
  echo "⚠️  Some @/shared/ imports remain (may be intentional):"
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "@/shared/" {} \; 2>/dev/null | head -10
fi

echo ""
echo "✅ Import standardization complete!"
echo ""
echo "Next steps:"
echo "  1. Review changes with git diff"
echo "  2. Update tsconfig.json to remove @/* paths"
echo "  3. Run 'npm run build' to verify"
