#!/bin/bash

# Script to fix all remaining @vital/ui import paths
echo "🔧 Fixing import paths in all files..."

# Find all files with @vital/ui imports and fix them
find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "@vital/ui/components" | while read file; do
  echo "Fixing: $file"
  
  # Replace common import patterns
  sed -i '' 's|@vital/ui/components/avatar|@/components/ui/avatar|g' "$file"
  sed -i '' 's|@vital/ui/components/badge|@/components/ui/badge|g' "$file"
  sed -i '' 's|@vital/ui/components/button|@/components/ui/button|g' "$file"
  sed -i '' 's|@vital/ui/components/card|@/components/ui/card|g' "$file"
  sed -i '' 's|@vital/ui/components/input|@/components/ui/input|g' "$file"
  sed -i '' 's|@vital/ui/components/textarea|@/components/ui/textarea|g' "$file"
  sed -i '' 's|@vital/ui/components/tabs|@/components/ui/tabs|g' "$file"
  sed -i '' 's|@vital/ui/components/select|@/components/ui/select|g' "$file"
  sed -i '' 's|@vital/ui/components/progress|@/components/ui/progress|g' "$file"
  sed -i '' 's|@vital/ui/components/separator|@/components/ui/separator|g' "$file"
  sed -i '' 's|@vital/ui/components/avatar|@/components/ui/avatar|g' "$file"
  sed -i '' 's|@vital/ui/components/dialog|@/components/ui/dialog|g' "$file"
  sed -i '' 's|@vital/ui/components/dropdown-menu|@/components/ui/dropdown-menu|g' "$file"
  sed -i '' 's|@vital/ui/components/label|@/components/ui/label|g' "$file"
  sed -i '' 's|@vital/ui/components/popover|@/components/ui/popover|g' "$file"
  sed -i '' 's|@vital/ui/components/scroll-area|@/components/ui/scroll-area|g' "$file"
  sed -i '' 's|@vital/ui/components/sheet|@/components/ui/sheet|g' "$file"
  sed -i '' 's|@vital/ui/components/skeleton|@/components/ui/skeleton|g' "$file"
  sed -i '' 's|@vital/ui/components/slider|@/components/ui/slider|g' "$file"
  sed -i '' 's|@vital/ui/components/switch|@/components/ui/switch|g' "$file"
  sed -i '' 's|@vital/ui/components/table|@/components/ui/table|g' "$file"
  sed -i '' 's|@vital/ui/components/toast|@/components/ui/toast|g' "$file"
  sed -i '' 's|@vital/ui/components/tooltip|@/components/ui/tooltip|g' "$file"
  sed -i '' 's|@vital/ui/components/checkbox|@/components/ui/checkbox|g' "$file"
  sed -i '' 's|@vital/ui/components/radio-group|@/components/ui/radio-group|g' "$file"
  sed -i '' 's|@vital/ui/components/accordion|@/components/ui/accordion|g' "$file"
  sed -i '' 's|@vital/ui/components/alert|@/components/ui/alert|g' "$file"
  sed -i '' 's|@vital/ui/components/calendar|@/components/ui/calendar|g' "$file"
  sed -i '' 's|@vital/ui/components/collapsible|@/components/ui/collapsible|g' "$file"
  sed -i '' 's|@vital/ui/components/command|@/components/ui/command|g' "$file"
  sed -i '' 's|@vital/ui/components/context-menu|@/components/ui/context-menu|g' "$file"
  sed -i '' 's|@vital/ui/components/hover-card|@/components/ui/hover-card|g' "$file"
  sed -i '' 's|@vital/ui/components/menubar|@/components/ui/menubar|g' "$file"
  sed -i '' 's|@vital/ui/components/navigation-menu|@/components/ui/navigation-menu|g' "$file"
  sed -i '' 's|@vital/ui/components/resizable|@/components/ui/resizable|g' "$file"
  sed -i '' 's|@vital/ui/components/sonner|@/components/ui/sonner|g' "$file"
  sed -i '' 's|@vital/ui/components/toggle|@/components/ui/toggle|g' "$file"
  sed -i '' 's|@vital/ui/components/toggle-group|@/components/ui/toggle-group|g' "$file"
  
  # Fix @vital/utils imports
  sed -i '' 's|@vital/utils|@/lib/utils|g' "$file"
done

echo "✅ Import path fixes completed!"
echo "📊 Checking remaining import errors..."

# Check how many files still have @vital/ui imports
cd apps/digital-health-startup
find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "@vital/ui" | wc -l
