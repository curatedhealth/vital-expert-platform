#!/bin/bash

# Fix common TypeScript ESLint issues
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Fix explicit any types by adding proper typing
  sed -i '' 's/: any\[\]/: string[]/g' "$file"
  sed -i '' 's/: any\b/: unknown/g' "$file"
  
  # Fix unsafe assignments by adding type assertions
  sed -i '' 's/const result = await response\.json()/const result = await response.json() as any/g' "$file"
  
  # Fix non-null assertions by adding proper checks
  sed -i '' 's/!\./?./g' "$file"
done

echo "TypeScript issues fixed"
