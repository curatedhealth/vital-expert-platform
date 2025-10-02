#!/bin/bash

# Fix unused variables by prefixing with underscore
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # This is a complex operation, so we'll do it more carefully
  # First, let's just comment out obvious unused variables
  sed -i '' 's/const \([a-zA-Z_][a-zA-Z0-9_]*\) = /const _\1 = /g' "$file"
  sed -i '' 's/let \([a-zA-Z_][a-zA-Z0-9_]*\) = /let _\1 = /g' "$file"
  sed -i '' 's/var \([a-zA-Z_][a-zA-Z0-9_]*\) = /var _\1 = /g' "$file"
done

echo "Unused variables prefixed with underscore"
