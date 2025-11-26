#!/usr/bin/env python3
"""
AgentOS Capability SQL Generator - v2
Reads capability taxonomy markdown files and generates SQL INSERT statements
Handles the actual format: **CAP-XX-###: Name** followed by Definition, Level Scope, etc.
"""

import re
from pathlib import Path
from typing import List, Dict

# Mapping from our taxonomy categories to database capability_type
CAPABILITY_TYPE_MAP = {
    'leadership': 'leadership',
    'strategic': 'business',
    'field medical': 'technical',
    'medical writing': 'technical',
    'medical information': 'technical',
    'medical education': 'business',
    'heor': 'technical',
    'clinical': 'technical',
    'compliance': 'business',
    'governance': 'business',
    'scientific': 'technical',
    'operations': 'business',
    'operational': 'business',
    'communication': 'interpersonal',
    'technical': 'technical',
    'interpersonal': 'interpersonal',
    'personal': 'interpersonal',
}

# Maturity level mapping from Level Scope
LEVEL_TO_MATURITY = {
    'L1 MASTER': 'expert',
    'L2 EXPERT': 'expert',
    'L3 SPECIALIST': 'advanced',
    'L4 WORKER': 'intermediate',
    'L5 TOOL': 'foundational',
}


def parse_capability_markdown(file_path: Path, function_name: str) -> List[Dict]:
    """Parse a capability taxonomy markdown file."""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    capabilities = []
    
    # Split by capability entries (starts with **CAP-)
    capability_blocks = re.split(r'\n(?=\*\*CAP-)', content)
    
    for block in capability_blocks:
        if not block.strip() or not block.startswith('**CAP-'):
            continue
        
        # Extract CAP-ID and Name from first line
        first_line_match = re.match(r'\*\*(CAP-[A-Z]+-\d+):\s*([^\*]+)\*\*', block)
        if not first_line_match:
            continue
        
        cap_id = first_line_match.group(1).strip()
        name = first_line_match.group(2).strip()
        
        # Extract Definition
        definition_match = re.search(r'-\s*\*\*Definition\*\*:\s*([^\n]+)', block)
        description = definition_match.group(1).strip() if definition_match else name
        
        # Extract Level Scope to determine maturity
        level_match = re.search(r'-\s*\*\*Level Scope\*\*:\s*([^\n]+)', block)
        level_scope = level_match.group(1).strip() if level_match else 'L3 SPECIALIST'
        
        # Determine maturity level
        maturity_level = 'advanced'  # default
        for level_key, maturity in LEVEL_TO_MATURITY.items():
            if level_key in level_scope:
                maturity_level = maturity
                break
        
        # Extract Roles to help determine category
        roles_match = re.search(r'-\s*\*\*Roles\*\*:\s*([^\n]+)', block)
        roles = roles_match.group(1).strip() if roles_match else ''
        
        # Determine capability_type from section header or name
        capability_type = 'business'  # default
        block_lower = block.lower()
        name_lower = name.lower()
        
        for key, value in CAPABILITY_TYPE_MAP.items():
            if key in block_lower or key in name_lower:
                capability_type = value
                break
        
        # Create slug from name
        slug = name.lower()
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '-', slug)
        slug = slug.strip('-')[:100]  # Limit length
        
        # Create tags
        function_tag = function_name.lower().replace(' ', '-').replace('&', 'and')
        
        # Extract category from section header (look backwards in content)
        section_match = re.search(r'##\s+([A-Z\s&]+CAPABILITIES?[^\n]*)', block, re.IGNORECASE)
        category_tag = 'general'
        if section_match:
            category_text = section_match.group(1).lower()
            category_tag = category_text.replace('capabilities', '').replace('&', 'and').strip()
            category_tag = re.sub(r'[^\w\s-]', '', category_tag)
            category_tag = re.sub(r'[-\s]+', '-', category_tag)
        
        tags = [function_tag, category_tag] if category_tag != 'general' else [function_tag]
        
        capabilities.append({
            'id': cap_id,
            'name': name,
            'slug': slug,
            'description': description,
            'capability_type': capability_type,
            'maturity_level': maturity_level,
            'tags': tags,
            'function': function_name,
            'level_scope': level_scope
        })
    
    return capabilities


def generate_sql_insert(capabilities: List[Dict]) -> str:
    """Generate SQL INSERT statements for capabilities."""
    
    sql_lines = [
        "-- ============================================================================",
        "-- AgentOS Complete Capabilities Seeding - AUTO-GENERATED",
        "-- File: 20251127-seed-all-capabilities-AUTO.sql",
        "-- ============================================================================",
        f"-- Generated from capability taxonomy markdown files",
        f"-- Total capabilities: {len(capabilities)}",
        "-- Schema: name, slug, description, capability_type, maturity_level, tags",
        "-- ============================================================================",
        "",
        "BEGIN;",
        "",
        "INSERT INTO capabilities (",
        "    name,",
        "    slug,",
        "    description,",
        "    capability_type,",
        "    maturity_level,",
        "    tags,",
        "    is_active",
        ") VALUES",
        ""
    ]
    
    for i, cap in enumerate(capabilities):
        is_last = (i == len(capabilities) - 1)
        
        # Escape single quotes in strings
        name = cap['name'].replace("'", "''")
        description = cap['description'].replace("'", "''")
        slug = cap['slug']
        
        # Format tags array
        tags_str = "', '".join(cap['tags'])
        
        # Build INSERT line
        line = f"('{name}', '{slug}', '{description}', '{cap['capability_type']}', '{cap['maturity_level']}', ARRAY['{tags_str}'], true)"
        
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
        "    '✅ SEEDING COMPLETE!' as status,",
        "    COUNT(*) as total_capabilities,",
        "    COUNT(DISTINCT capability_type) as capability_types,",
        "    COUNT(DISTINCT maturity_level) as maturity_levels",
        "FROM capabilities;",
        "",
        "-- Breakdown by function and type",
        "SELECT",
        "    tags[1] as function,",
        "    capability_type,",
        "    maturity_level,",
        "    COUNT(*) as count",
        "FROM capabilities",
        "WHERE array_length(tags, 1) >= 1",
        "GROUP BY ROLLUP(tags[1], capability_type, maturity_level)",
        "ORDER BY tags[1], capability_type, maturity_level;",
    ])
    
    return "\n".join(sql_lines)


def main():
    """Main execution function."""
    
    # Define taxonomy files
    base_path = Path("/Users/hichamnaim/.cursor/worktrees/VITAL_path/YXdjF/.claude/docs/platform/agents")
    
    taxonomy_files = [
        ("CAPABILITY_TAXONOMY.md", "Medical Affairs"),
        ("CAPABILITY_TAXONOMY_REGULATORY.md", "Regulatory Affairs"),
        ("CAPABILITY_TAXONOMY_CLINICAL.md", "Clinical Development"),
        ("CAPABILITY_TAXONOMY_SAFETY.md", "Safety & Pharmacovigilance"),
        ("CAPABILITY_TAXONOMY_MARKET_ACCESS.md", "Market Access & HEOR"),
        ("CAPABILITY_TAXONOMY_COMMERCIAL.md", "Commercial Excellence"),
        ("CAPABILITY_TAXONOMY_MANUFACTURING.md", "Manufacturing & CMC"),
    ]
    
    all_capabilities = []
    
    print("🔍 Parsing capability taxonomy files...")
    print()
    
    for file_name, function_name in taxonomy_files:
        file_path = base_path / file_name
        
        if not file_path.exists():
            print(f"⚠️  SKIPPED: {file_name} (not found)")
            continue
        
        print(f"📄 {file_name}")
        print(f"   Function: {function_name}")
        
        caps = parse_capability_markdown(file_path, function_name)
        all_capabilities.extend(caps)
        
        print(f"   ✅ Extracted: {len(caps)} capabilities")
        print()
    
    print("="*70)
    print(f"📊 TOTAL CAPABILITIES EXTRACTED: {len(all_capabilities)}")
    print("="*70)
    print()
    
    if len(all_capabilities) == 0:
        print("❌ No capabilities found. Check file format.")
        return
    
    # Generate SQL
    print("🔨 Generating SQL INSERT statements...")
    sql_content = generate_sql_insert(all_capabilities)
    
    # Write to file
    output_file = base_path / "sql-seeds" / "20251127-seed-all-capabilities-AUTO.sql"
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
    by_maturity = {}
    by_type = {}
    
    for cap in all_capabilities:
        func = cap['function']
        by_function[func] = by_function.get(func, 0) + 1
        
        mat = cap['maturity_level']
        by_maturity[mat] = by_maturity.get(mat, 0) + 1
        
        ctype = cap['capability_type']
        by_type[ctype] = by_type.get(ctype, 0) + 1
    
    for func, count in sorted(by_function.items()):
        print(f"  {func:<35} {count:>3} capabilities")
    
    print()
    print("BY MATURITY LEVEL:")
    for mat, count in sorted(by_maturity.items()):
        print(f"  {mat:<20} {count:>3}")
    
    print()
    print("BY CAPABILITY TYPE:")
    for ctype, count in sorted(by_type.items()):
        print(f"  {ctype:<20} {count:>3}")
    
    print("="*70)
    print(f"✅ READY TO RUN: {output_file.name}")
    print("="*70)


if __name__ == "__main__":
    main()

