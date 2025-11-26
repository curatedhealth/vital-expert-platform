#!/usr/bin/env python3
"""
AgentOS Responsibility SQL Generator
Reads responsibility taxonomy markdown files and generates SQL INSERT statements
"""

import re
from pathlib import Path
from typing import List, Dict

# Mapping for complexity levels
COMPLEXITY_MAP = {
    'L1 MASTER': 'Critical',
    'L2 EXPERT': 'High',
    'L3 SPECIALIST': 'High',
    'L4 WORKER': 'Medium',
    'L5 TOOL': 'Low',
}

# Priority mapping
PRIORITY_MAP = {
    'L1 MASTER': 100,
    'L2 EXPERT': 90,
    'L3 SPECIALIST': 80,
    'L4 WORKER': 70,
    'L5 TOOL': 60,
}


def parse_responsibility_markdown(file_path: Path, function_name: str) -> List[Dict]:
    """Parse a responsibility taxonomy markdown file."""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    responsibilities = []
    
    # Split by responsibility entries (starts with **RESP-)
    resp_blocks = re.split(r'\n(?=\*\*RESP-)', content)
    
    for block in resp_blocks:
        if not block.strip() or not block.startswith('**RESP-'):
            continue
        
        # Extract RESP-ID and Name from first line
        first_line_match = re.match(r'\*\*(RESP-[A-Z]+-(?:ACC-)?[A-Z]*-?\d+):\s*([^\*]+)\*\*', block)
        if not first_line_match:
            continue
        
        resp_id = first_line_match.group(1).strip()
        name = first_line_match.group(2).strip()
        
        # Extract Definition
        definition_match = re.search(r'-\s*\*\*Definition\*\*:\s*([^\n]+(?:\n(?!-\s*\*\*)[^\n]+)*)', block)
        description = definition_match.group(1).strip() if definition_match else name
        description = ' '.join(description.split())  # Clean up whitespace
        
        # Extract Accountability
        accountability_match = re.search(r'-\s*\*\*Accountability\*\*:\s*([^\n]+)', block)
        accountability = accountability_match.group(1).strip() if accountability_match else 'Success metrics TBD'
        
        # Extract Level Scope
        level_match = re.search(r'-\s*\*\*Level Scope\*\*:\s*([^\n]+)', block)
        level_scope = level_match.group(1).strip() if level_match else 'L3 SPECIALIST'
        
        # Determine complexity and priority from level
        complexity_level = 'High'  # default
        priority = 80  # default
        
        for level_key, complexity in COMPLEXITY_MAP.items():
            if level_key in level_scope:
                complexity_level = complexity
                priority = PRIORITY_MAP.get(level_key, 80)
                break
        
        # Determine category from section or name
        category = 'Operations'  # default
        if 'leadership' in name.lower() or 'strategy' in name.lower() or 'vision' in name.lower():
            category = 'Leadership'
        elif 'compliance' in name.lower() or 'governance' in name.lower() or 'audit' in name.lower():
            category = 'Compliance'
        elif 'communication' in name.lower() or 'reporting' in name.lower():
            category = 'Communication'
        elif 'quality' in name.lower() or 'assurance' in name.lower():
            category = 'Quality'
        elif 'safety' in name.lower():
            category = 'Safety'
        elif 'training' in name.lower() or 'education' in name.lower():
            category = 'Education'
        elif 'budget' in name.lower() or 'financial' in name.lower():
            category = 'Financial'
        elif 'strategic' in name.lower():
            category = 'Strategic'
        
        responsibilities.append({
            'id': resp_id,
            'unique_id': resp_id,
            'name': name,
            'description': description,
            'category': category,
            'priority': priority,
            'complexity_level': complexity_level,
            'accountability_metrics': accountability,
            'function': function_name
        })
    
    return responsibilities


def generate_sql_insert(responsibilities: List[Dict]) -> str:
    """Generate SQL INSERT statements for responsibilities."""
    
    sql_lines = [
        "-- ============================================================================",
        "-- AgentOS Complete Responsibilities Seeding - AUTO-GENERATED",
        "-- File: 20251127-seed-all-responsibilities-AUTO.sql",
        "-- ============================================================================",
        f"-- Generated from responsibility taxonomy markdown files",
        f"-- Total responsibilities: {len(responsibilities)}",
        "-- Schema: unique_id, name, description, category, priority, complexity_level, is_active",
        "-- ============================================================================",
        "",
        "BEGIN;",
        "",
        "INSERT INTO org_responsibilities (",
        "    unique_id,",
        "    name,",
        "    description,",
        "    category,",
        "    priority,",
        "    complexity_level,",
        "    is_active",
        ") VALUES",
        ""
    ]
    
    for i, resp in enumerate(responsibilities):
        is_last = (i == len(responsibilities) - 1)
        
        # Escape single quotes in strings
        name = resp['name'].replace("'", "''")
        description = resp['description'].replace("'", "''")
        
        # Build INSERT line
        line = f"('{resp['unique_id']}', '{name}', '{description}', '{resp['category']}', {resp['priority']}, '{resp['complexity_level']}', true)"
        
        if not is_last:
            line += ","
        else:
            line += ";"
        
        sql_lines.append(line)
    
    sql_lines.extend([
        "",
        "COMMIT;",
        "",
        "-- ============================================================================",
        "-- VERIFICATION",
        "-- ============================================================================",
        "",
        "SELECT",
        "    '✅ RESPONSIBILITIES SEEDED!' as status,",
        "    COUNT(*) as total_responsibilities,",
        "    COUNT(DISTINCT category) as categories,",
        "    COUNT(DISTINCT complexity_level) as complexity_levels",
        "FROM org_responsibilities;",
        "",
        "-- Breakdown by function (using ID prefix)",
        "SELECT",
        "    CASE",
        "        WHEN unique_id LIKE 'RESP-MA-%' THEN 'Medical Affairs'",
        "        WHEN unique_id LIKE 'RESP-RA-%' THEN 'Regulatory Affairs'",
        "        WHEN unique_id LIKE 'RESP-CD-%' THEN 'Clinical Development'",
        "        WHEN unique_id LIKE 'RESP-SV-%' THEN 'Safety & Pharmacovigilance'",
        "        WHEN unique_id LIKE 'RESP-MA-ACC-%' THEN 'Market Access & HEOR'",
        "        WHEN unique_id LIKE 'RESP-CM-%' THEN 'Commercial Excellence'",
        "        WHEN unique_id LIKE 'RESP-MF-%' THEN 'Manufacturing & CMC'",
        "        ELSE 'Other'",
        "    END as function,",
        "    category,",
        "    complexity_level,",
        "    COUNT(*) as count",
        "FROM org_responsibilities",
        "GROUP BY ROLLUP(function, category, complexity_level)",
        "ORDER BY function, category, complexity_level;",
    ])
    
    return "\n".join(sql_lines)


def main():
    """Main execution function."""
    
    # Define taxonomy files
    base_path = Path("/Users/hichamnaim/.cursor/worktrees/VITAL_path/YXdjF/.claude/docs/platform/agents")
    
    taxonomy_files = [
        ("RESPONSIBILITY_TAXONOMY.md", "Medical Affairs"),
        ("RESPONSIBILITY_TAXONOMY_REGULATORY.md", "Regulatory Affairs"),
        ("RESPONSIBILITY_TAXONOMY_CLINICAL.md", "Clinical Development"),
        ("RESPONSIBILITY_TAXONOMY_SAFETY.md", "Safety & Pharmacovigilance"),
        ("RESPONSIBILITY_TAXONOMY_MARKET_ACCESS.md", "Market Access & HEOR"),
        ("RESPONSIBILITY_TAXONOMY_COMMERCIAL.md", "Commercial Excellence"),
        ("RESPONSIBILITY_TAXONOMY_MANUFACTURING.md", "Manufacturing & CMC"),
    ]
    
    all_responsibilities = []
    
    print("🔍 Parsing responsibility taxonomy files...")
    print()
    
    for file_name, function_name in taxonomy_files:
        file_path = base_path / file_name
        
        if not file_path.exists():
            print(f"⚠️  SKIPPED: {file_name} (not found)")
            continue
        
        print(f"📄 {file_name}")
        print(f"   Function: {function_name}")
        
        resps = parse_responsibility_markdown(file_path, function_name)
        all_responsibilities.extend(resps)
        
        print(f"   ✅ Extracted: {len(resps)} responsibilities")
        print()
    
    print("="*70)
    print(f"📊 TOTAL RESPONSIBILITIES EXTRACTED: {len(all_responsibilities)}")
    print("="*70)
    print()
    
    if len(all_responsibilities) == 0:
        print("❌ No responsibilities found. Check file format.")
        return
    
    # Generate SQL
    print("🔨 Generating SQL INSERT statements...")
    sql_content = generate_sql_insert(all_responsibilities)
    
    # Write to file
    output_file = base_path / "sql-seeds" / "20251127-seed-all-responsibilities-AUTO.sql"
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print(f"✅ SQL file generated: {output_file.name}")
    print()
    
    # Summary by function
    print("="*70)
    print("SUMMARY BY FUNCTION")
    print("="*70)
    
    by_function = {}
    by_complexity = {}
    by_category = {}
    
    for resp in all_responsibilities:
        func = resp['function']
        by_function[func] = by_function.get(func, 0) + 1
        
        comp = resp['complexity_level']
        by_complexity[comp] = by_complexity.get(comp, 0) + 1
        
        cat = resp['category']
        by_category[cat] = by_category.get(cat, 0) + 1
    
    for func, count in sorted(by_function.items()):
        print(f"  {func:<35} {count:>3} responsibilities")
    
    print()
    print("BY COMPLEXITY LEVEL:")
    for comp, count in sorted(by_complexity.items()):
        print(f"  {comp:<20} {count:>3}")
    
    print()
    print("BY CATEGORY:")
    for cat, count in sorted(by_category.items()):
        print(f"  {cat:<20} {count:>3}")
    
    print("="*70)
    print(f"✅ READY TO RUN: {output_file.name}")
    print("="*70)


if __name__ == "__main__":
    main()

