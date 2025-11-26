#!/usr/bin/env python3
"""
AgentOS Capability SQL Generator
Reads capability taxonomy markdown files and generates SQL INSERT statements
"""

import re
from pathlib import Path
from typing import List, Dict, Tuple

# Mapping from our taxonomy categories to database capability_type
CAPABILITY_TYPE_MAP = {
    'Leadership': 'leadership',
    'Strategic': 'business',
    'Field Medical': 'technical',
    'Medical Writing': 'technical',
    'Medical Information': 'technical',
    'Medical Education': 'business',
    'HEOR': 'technical',
    'Clinical Operations': 'technical',
    'Compliance': 'business',
    'Governance': 'business',
    'Scientific Affairs': 'technical',
    'Operations': 'business',
    'Operational': 'business',
    'Communication': 'interpersonal',
    'Technical': 'technical',
    'Interpersonal': 'interpersonal',
    'Personal': 'interpersonal',
    # Additional mappings
    'Submissions': 'technical',
    'CMC': 'technical',
    'Labeling': 'technical',
    'Agency': 'business',
    'Intelligence': 'business',
    'Lifecycle': 'business',
    'Risk': 'business',
    'Protocol': 'technical',
    'Data': 'technical',
    'Biostatistics': 'technical',
    'Quality': 'business',
    'Safety': 'technical',
    'Writing': 'technical',
    'Specialized': 'technical',
    'Payer': 'business',
    'RWE': 'technical',
    'Pricing': 'business',
    'Policy': 'business',
    'Analytics': 'technical',
    'Brand': 'business',
    'Sales': 'business',
    'Field': 'business',
    'Marketing': 'business',
    'Process': 'technical',
    'Analytical': 'technical',
    'Scale-Up': 'technical',
    'GMP': 'technical',
    'Supply': 'business',
    'Regulatory': 'technical',
}

# Mapping from our complexity levels to maturity_level
MATURITY_MAP = {
    'basic': 'foundational',
    'intermediate': 'intermediate',
    'advanced': 'advanced',
    'expert': 'expert',
}


def parse_capability_markdown(file_path: Path, function_name: str) -> List[Dict]:
    """Parse a capability taxonomy markdown file and extract capabilities."""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    capabilities = []
    
    # Pattern to match capability entries
    # Looking for: **CAP-XX-###: Capability Name**
    # Followed by description and category
    pattern = r'\*\*([A-Z]+-[A-Z]+-\d+):\s*([^\*]+)\*\*\s*\n\s*-\s*([^\n]+)\n\s*-\s*Category:\s*([^\n]+)'
    
    matches = re.finditer(pattern, content, re.MULTILINE)
    
    for match in matches:
        cap_id = match.group(1).strip()
        name = match.group(2).strip()
        description = match.group(3).strip()
        category = match.group(4).strip()
        
        # Determine capability_type from category
        capability_type = 'business'  # default
        for key, value in CAPABILITY_TYPE_MAP.items():
            if key.lower() in category.lower():
                capability_type = value
                break
        
        # Determine maturity level (default to advanced)
        maturity_level = 'advanced'
        if 'expert' in name.lower() or 'chief' in name.lower() or 'vp' in name.lower() or 'c-suite' in name.lower():
            maturity_level = 'expert'
        elif 'basic' in name.lower() or 'foundational' in name.lower():
            maturity_level = 'foundational'
        elif 'intermediate' in name.lower():
            maturity_level = 'intermediate'
        
        # Create slug from name
        slug = name.lower()
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '-', slug)
        slug = slug.strip('-')
        
        # Create tags
        function_tag = function_name.lower().replace(' ', '-').replace('&', 'and')
        category_tag = category.lower().replace(' ', '-').replace('&', 'and')
        tags = [function_tag, category_tag]
        
        capabilities.append({
            'id': cap_id,
            'name': name,
            'slug': slug,
            'description': description,
            'category': category,
            'capability_type': capability_type,
            'maturity_level': maturity_level,
            'tags': tags,
            'function': function_name
        })
    
    return capabilities


def generate_sql_insert(capabilities: List[Dict]) -> str:
    """Generate SQL INSERT statements for capabilities."""
    
    sql_lines = [
        "-- ============================================================================",
        "-- AgentOS Complete Capabilities Seeding - AUTO-GENERATED",
        "-- File: 20251127-seed-all-330-capabilities-AUTO.sql",
        "-- ============================================================================",
        "-- Generated from capability taxonomy markdown files",
        f"-- Total capabilities: {len(capabilities)}",
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
        
        # Format tags array
        tags_str = ", ".join([f"'{tag}'" for tag in cap['tags']])
        
        # Build INSERT line
        line = f"('{name}', '{cap['slug']}', '{description}', '{cap['capability_type']}', '{cap['maturity_level']}', ARRAY[{tags_str}], true)"
        
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
        "    COUNT(DISTINCT capability_type) as types,",
        "    COUNT(DISTINCT maturity_level) as maturity_levels",
        "FROM capabilities;",
        "",
        "-- Breakdown by function",
        "SELECT",
        "    tags[1] as function_tag,",
        "    capability_type,",
        "    maturity_level,",
        "    COUNT(*) as count",
        "FROM capabilities",
        "WHERE array_length(tags, 1) >= 1",
        "GROUP BY tags[1], capability_type, maturity_level",
        "ORDER BY tags[1], capability_type, maturity_level;",
    ])
    
    return "\n".join(sql_lines)


def main():
    """Main execution function."""
    
    # Define taxonomy files
    base_path = Path("/Users/hichamnaim/.cursor/worktrees/VITAL_path/YXdjF/.claude/docs/platform/agents")
    
    taxonomy_files = [
        ("CAPABILITY_TAXONOMY.md", "Medical Affairs"),
        # ("CAPABILITY_TAXONOMY_REGULATORY.md", "Regulatory Affairs"),  # TODO: Create this file
        ("CAPABILITY_TAXONOMY_CLINICAL.md", "Clinical Development"),
        ("CAPABILITY_TAXONOMY_SAFETY.md", "Safety & Pharmacovigilance"),
        ("CAPABILITY_TAXONOMY_MARKET_ACCESS.md", "Market Access & HEOR"),
        ("CAPABILITY_TAXONOMY_COMMERCIAL.md", "Commercial Excellence"),
        ("CAPABILITY_TAXONOMY_MANUFACTURING.md", "Manufacturing & CMC"),
    ]
    
    all_capabilities = []
    
    print("🔍 Parsing capability taxonomy files...")
    
    for file_name, function_name in taxonomy_files:
        file_path = base_path / file_name
        
        if not file_path.exists():
            print(f"⚠️  File not found: {file_path}")
            continue
        
        print(f"   📄 {file_name} ({function_name})...")
        caps = parse_capability_markdown(file_path, function_name)
        all_capabilities.extend(caps)
        print(f"      ✅ Found {len(caps)} capabilities")
    
    print(f"\n📊 Total capabilities extracted: {len(all_capabilities)}")
    
    # Generate SQL
    print("\n🔨 Generating SQL INSERT statements...")
    sql_content = generate_sql_insert(all_capabilities)
    
    # Write to file
    output_file = base_path / "sql-seeds" / "20251127-seed-all-330-capabilities-AUTO.sql"
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print(f"✅ SQL file generated: {output_file}")
    print(f"📝 Total INSERT statements: {len(all_capabilities)}")
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    
    by_function = {}
    for cap in all_capabilities:
        func = cap['function']
        by_function[func] = by_function.get(func, 0) + 1
    
    for func, count in sorted(by_function.items()):
        print(f"  {func}: {count} capabilities")
    
    print("="*60)
    print(f"✅ Ready to run: {output_file.name}")
    print("="*60)


if __name__ == "__main__":
    main()

