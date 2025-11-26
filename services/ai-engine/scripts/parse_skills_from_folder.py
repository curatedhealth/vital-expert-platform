#!/usr/bin/env python3
"""
Parse skills from the skills-main folder and prepare for database insertion
Extracts skill metadata from SKILL.md files and creates seed data
"""

import os
import re
import json
from pathlib import Path
from typing import List, Dict, Any, Optional

# Skills folder path
SKILLS_FOLDER = "/Users/hichamnaim/Downloads/Cursor/VITAL path/.vital-command-center/skills-main"

print("Starting skill parsing...")
print(f"Source folder: {SKILLS_FOLDER}\n")

skills_folder = Path(SKILLS_FOLDER)
skills = []

# Get all skill folders
skill_folders = [d for d in skills_folder.iterdir() if d.is_dir() and not d.name.startswith('.')]
print(f"Found {len(skill_folders)} potential skill folders\n")

for folder in skill_folders:
    skill_md = folder / "SKILL.md"
    if not skill_md.exists():
        continue
    
    try:
        with open(skill_md, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract title
        title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        title = title_match.group(1).strip() if title_match else folder.name.replace('-', ' ').title()
        
        # Extract description
        desc_match = re.search(r'^#\s+.+\n\n(.+?)(?:\n\n|\n#)', content, re.DOTALL | re.MULTILINE)
        description = desc_match.group(1).strip() if desc_match else f"Skill for {title}"
        description = ' '.join(description.split())[:500]
        
        skills.append({
            'name': title,
            'slug': folder.name,
            'description': description,
            'folder_path': str(folder.relative_to(skills_folder))
        })
        
        print(f"✓ {title}")
    except Exception as e:
        print(f"✗ {folder.name}: {e}")

# Export to JSON
output_dir = Path("database/data/skills")
output_dir.mkdir(parents=True, exist_ok=True)

json_file = output_dir / "parsed_skills.json"
with open(json_file, 'w', encoding='utf-8') as f:
    json.dump(skills, f, indent=2, ensure_ascii=False)

print(f"\n✅ Parsed {len(skills)} skills")
print(f"   Output: {json_file}")
