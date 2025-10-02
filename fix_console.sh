#!/bin/bash

# Fix console statements in production code (not test files)
find src -name "*.ts" -o -name "*.tsx" | grep -v -E "(test|spec|__tests__)" | while read file; do
  # Replace console.log with comments
  sed -i '' 's/console\.log(/\/\/ console.log(/g' "$file"
  sed -i '' 's/console\.error(/\/\/ console.error(/g' "$file"
  sed -i '' 's/console\.warn(/\/\/ console.warn(/g' "$file"
  sed -i '' 's/console\.info(/\/\/ console.info(/g' "$file"
  sed -i '' 's/console\.debug(/\/\/ console.debug(/g' "$file"
done

echo "Console statements fixed in production files"
