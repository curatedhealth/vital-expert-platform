#!/bin/bash

cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/public/icons/png/avatars"

counter=1
for file in *.png; do
  if [ -f "$file" ]; then
    newname="avatar_$(printf '%04d' $counter).png"
    mv "$file" "$newname"
    echo "✓ Renamed: $file -> $newname"
    counter=$((counter + 1))
  fi
done

echo ""
echo "✅ Renamed $((counter - 1)) avatar files"
