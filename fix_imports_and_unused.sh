#!/bin/bash

echo "Fixing import order and unused imports..."

# Fix quotes in all files first
echo "Fixing corrupted quotes..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's/&apos;/'"'"'/g' "$file"
  sed -i '' 's/&quot;/"/g' "$file"
done

# Fix console statements in production files
echo "Fixing console statements..."
find src -name "*.ts" -o -name "*.tsx" | grep -v -E "(test|spec|__tests__)" | while read file; do
  sed -i '' 's/^[[:space:]]*console\.log(/\/\/ console.log(/g' "$file"
  sed -i '' 's/^[[:space:]]*console\.error(/\/\/ console.error(/g' "$file"
  sed -i '' 's/^[[:space:]]*console\.warn(/\/\/ console.warn(/g' "$file"
  sed -i '' 's/^[[:space:]]*console\.info(/\/\/ console.info(/g' "$file"
  sed -i '' 's/^[[:space:]]*console\.debug(/\/\/ console.debug(/g' "$file"
done

echo "Basic fixes completed!"
