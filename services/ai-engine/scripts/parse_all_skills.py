#!/usr/bin/env python3
"""
Parse ALL skills from the .vital-command-center/skills-main folder
Extracts skill metadata from ALL SKILL.md files across all categories
"""

import os
import re
import json
from pathlib import Path
from typing import List, Dict, Any, Optional

# Skills folder path
SKILLS_FOLDER = Path("/Users/hichamnaim/Downloads/Cursor/VITAL path/.vital-command-center/skills-main")

print("=" * 80)
print("COMPREHENSIVE SKILLS EXTRACTION - ALL CATEGORIES")
print("=" * 80)
print(f"Source folder: {SKILLS_FOLDER}\n")

if not SKILLS_FOLDER.exists():
    print(f"❌ ERROR: Skills folder not found at {SKILLS_FOLDER}")
    exit(1)

skills = []
categories = {}

def extract_skill_metadata(skill_md_path: Path, folder: Path) -> Optional[Dict[str, Any]]:
    """Extract metadata from a SKILL.md file"""
    try:
        with open(skill_md_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract title (first H1 heading)
        title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        title = title_match.group(1).strip() if title_match else folder.name.replace('-', ' ').title()
        
        # Clean up title (remove emoji, extra spaces)
        title = re.sub(r'[📄🛠📊🔬✍️📘🎬🤝🛡🔧🎨💼🏢🎯📈]', '', title).strip()
        
        # Extract description (text after title before next heading or end)
        desc_match = re.search(r'^#\s+.+?\n\n(.+?)(?:\n\n#|$)', content, re.DOTALL | re.MULTILINE)
        description = desc_match.group(1).strip() if desc_match else f"Skill for {title}"
        
        # Clean and truncate description
        description = ' '.join(description.split())[:500]
        
        # Detect category from folder structure
        relative_path = folder.relative_to(SKILLS_FOLDER)
        parent_folder = str(relative_path.parent) if str(relative_path.parent) != '.' else 'General'
        
        # Map folder names to friendly categories
        category_map = {
            'document-skills': 'Document Processing',
            'docx': 'Document Processing',
            'pdf': 'Document Processing',
            'pptx': 'Document Processing',
            'xlsx': 'Document Processing',
            'algorithmic-art': 'Creative & Design',
            'brand-guidelines': 'Creative & Design',
            'canvas-design': 'Creative & Design',
            'frontend-design': 'Creative & Design',
            'theme-factory': 'Creative & Design',
            'slack-gif-creator': 'Creative & Design',
            'internal-comms': 'Communication & Writing',
            'mcp-builder': 'Development & Code',
            'skill-creator': 'Development & Code',
            'web-artifacts-builder': 'Development & Code',
            'webapp-testing': 'Development & Code',
            'template-skill': 'Development & Code',
            'General': 'General Utilities'
        }
        
        category = category_map.get(parent_folder, category_map.get(folder.name, 'General Utilities'))
        
        # Detect implementation type from content
        implementation_type = 'prompt'  # Default
        if 'import ' in content or 'def ' in content or 'class ' in content:
            implementation_type = 'tool'
        elif 'workflow' in content.lower() or 'step' in content.lower():
            implementation_type = 'workflow'
        
        # Detect complexity from content length and structure
        complexity_level = 5  # Default medium
        if len(content) < 500:
            complexity_level = 3
        elif len(content) > 2000:
            complexity_level = 7
        if 'advanced' in content.lower() or 'complex' in content.lower():
            complexity_level = min(complexity_level + 2, 10)
        
        return {
            'name': title,
            'slug': folder.name,
            'description': description,
            'category': category,
            'folder_path': str(relative_path),
            'implementation_type': implementation_type,
            'complexity_level': complexity_level,
            'source': 'vital-command-center'
        }
    
    except Exception as e:
        print(f"  ✗ Error parsing {folder.name}: {e}")
        return None

# Recursively find all SKILL.md files
print("Scanning for SKILL.md files...\n")
skill_files = list(SKILLS_FOLDER.rglob("SKILL.md"))
print(f"Found {len(skill_files)} SKILL.md files\n")

# Parse each skill
for skill_md in sorted(skill_files):
    folder = skill_md.parent
    skill_data = extract_skill_metadata(skill_md, folder)
    
    if skill_data:
        skills.append(skill_data)
        
        # Track category counts
        category = skill_data['category']
        if category not in categories:
            categories[category] = 0
        categories[category] += 1
        
        print(f"✓ {skill_data['name']:<50} [{skill_data['category']}]")

# Export to JSON
output_dir = Path("database/data/skills")
output_dir.mkdir(parents=True, exist_ok=True)

json_file = output_dir / "all_vital_skills.json"
with open(json_file, 'w', encoding='utf-8') as f:
    json.dump(skills, f, indent=2, ensure_ascii=False)

# Generate SQL seed script
sql_file = output_dir / "seed_all_vital_skills.sql"
with open(sql_file, 'w', encoding='utf-8') as f:
    f.write("""-- Seed All VITAL Skills
-- Source: .vital-command-center/skills-main
-- Generated by: parse_all_skills.py

""")
    
    for skill in skills:
        # Escape single quotes for SQL
        name = skill['name'].replace("'", "''")
        desc = skill['description'].replace("'", "''")
        category = skill['category'].replace("'", "''")
        slug = skill['slug'].replace("'", "''")
        folder_path = skill['folder_path'].replace("'", "''")
        impl_type = skill['implementation_type']
        complexity = skill['complexity_level']
        
        f.write(f"""
-- {name}
INSERT INTO skills (
    name, 
    description, 
    implementation_type, 
    implementation_ref, 
    category,
    complexity_level,
    is_active,
    metadata
) VALUES (
    '{name}',
    '{desc}',
    '{impl_type}',
    'skills-main/{folder_path}',
    '{category}',
    {complexity},
    true,
    '{{"source": "vital-command-center", "slug": "{slug}", "folder_path": "{folder_path}"}}'::jsonb
) ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    implementation_ref = EXCLUDED.implementation_ref,
    category = EXCLUDED.category,
    complexity_level = EXCLUDED.complexity_level,
    metadata = EXCLUDED.metadata;
""")

# Summary
print("\n" + "=" * 80)
print(f"✅ EXTRACTION COMPLETE: {len(skills)} SKILLS PARSED")
print("=" * 80)
print(f"\nJSON Output: {json_file}")
print(f"SQL Output:  {sql_file}")

print(f"\n📊 SKILLS BY CATEGORY:")
print("-" * 80)
for category, count in sorted(categories.items(), key=lambda x: -x[1]):
    percentage = (count / len(skills)) * 100
    bar = '█' * int(percentage / 2)
    print(f"  {category:<30} {count:>3} skills  {percentage:>5.1f}%  {bar}")

print("\n" + "=" * 80)
print(f"TOTAL SKILLS: {len(skills)}")
print("=" * 80)


