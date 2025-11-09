#!/usr/bin/env python3
"""
Phase 2: Extract ALL 750+ JTBDs from Source Documents
This script will:
1. Parse all JTBD documents (Persona Master Catalogue, JTBD Library, etc.)
2. Extract JTBD statements in format: "When X, I need Y, so I can Z"
3. Parse statements into structured fields (verb, object, outcome, goal)
4. Map JTBDs to personas and organizational hierarchy
5. Generate comprehensive import files (JSON and SQL)
"""

import re
import json
import os
from datetime import datetime, timezone
from typing import Dict, List, Any, Tuple, Optional
from pathlib import Path

# Statistics tracking
stats = {
    'total_jtbds_parsed': 0,
    'by_sector': {},
    'by_persona': {},
    'by_source': {},
    'parsing_errors': [],
    'duplicate_statements': 0
}

def parse_jtbd_statement(statement: str) -> Dict[str, str]:
    """
    Parse a JTBD statement into its components.
    Format: "When [situation], I need [solution], so I can [outcome]"
    
    Returns:
        Dict with: verb, object, outcome, goal, context
    """
    result = {
        'verb': 'manage',  # Default
        'object': '',
        'outcome': '',
        'goal': '',
        'context': ''
    }
    
    try:
        # Extract the three main parts
        when_match = re.search(r'When ([^,]+)', statement, re.IGNORECASE)
        need_match = re.search(r'I need ([^,]+)', statement, re.IGNORECASE)
        can_match = re.search(r'so I can ([^,\.]+)', statement, re.IGNORECASE)
        
        if when_match:
            result['context'] = when_match.group(1).strip()
        
        if need_match:
            need_text = need_match.group(1).strip()
            result['object'] = need_text
            
            # Extract verb (first word of the need statement)
            words = need_text.split()
            if words:
                first_word = words[0].lower()
                # Common JTBD verbs
                if first_word in ['comprehensive', 'automated', 'real-time', 'predictive', 
                                 'proactive', 'streamlined', 'integrated']:
                    # It's an adjective, look for the noun
                    if len(words) > 1:
                        result['verb'] = words[1].lower()[:20]
                    else:
                        result['verb'] = first_word[:20]
                else:
                    result['verb'] = first_word[:20]
        
        if can_match:
            outcome_text = can_match.group(1).strip()
            result['outcome'] = outcome_text
            result['goal'] = outcome_text  # Goal is the same as outcome for our purposes
        
    except Exception as e:
        stats['parsing_errors'].append(f"Error parsing statement: {str(e)}")
    
    return result

def extract_jtbds_from_json(json_file: str) -> List[Dict[str, Any]]:
    """Extract JTBDs from already parsed JSON file"""
    jtbds = []
    
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Check if it's the persona master catalogue format
        if 'jtbds' in data:
            for jtbd in data['jtbds']:
                # Parse the statement
                parsed = parse_jtbd_statement(jtbd['statement'])
                
                jtbd_record = {
                    'statement': jtbd['statement'],
                    'verb': parsed['verb'],
                    'object': parsed['object'][:100] if parsed['object'] else '',
                    'outcome': parsed['outcome'][:255] if parsed['outcome'] else '',
                    'goal': parsed['goal'][:255] if parsed['goal'] else parsed['outcome'][:255],
                    'context': parsed['context'][:255] if parsed['context'] else '',
                    'frequency': jtbd.get('frequency', 'Not specified'),
                    'importance': int(round(jtbd.get('opportunity_score', 8))),
                    'satisfaction': int(jtbd.get('current_satisfaction', 5)),
                    'persona_code': jtbd.get('persona_code'),
                    'persona_title': jtbd.get('persona_title'),
                    'persona_unique_id': jtbd.get('persona_unique_id'),
                    'sector': 'Multi-sector',  # Will be refined
                    'source': 'Persona Master Catalogue v6.0'
                }
                
                jtbds.append(jtbd_record)
                stats['total_jtbds_parsed'] += 1
                
                # Track by persona
                persona_title = jtbd.get('persona_title', 'Unknown')
                stats['by_persona'][persona_title] = stats['by_persona'].get(persona_title, 0) + 1
        
        # Also check for the enhanced format from DH JTBD library
        if 'personas' in data:
            for persona in data['personas']:
                if 'jtbds' in persona:
                    for jtbd in persona['jtbds']:
                        parsed = parse_jtbd_statement(jtbd['statement'])
                        
                        jtbd_record = {
                            'statement': jtbd['statement'],
                            'verb': parsed['verb'],
                            'object': parsed['object'][:100],
                            'outcome': parsed['outcome'][:255],
                            'goal': parsed['goal'][:255] if parsed['goal'] else parsed['outcome'][:255],
                            'context': parsed['context'][:255],
                            'frequency': jtbd.get('frequency', 'Not specified'),
                            'importance': int(round(jtbd.get('importance', 8))),
                            'satisfaction': int(jtbd.get('satisfaction', 5)),
                            'persona_code': persona.get('persona_code'),
                            'persona_title': persona.get('title'),
                            'sector': persona.get('sector', 'Multi-sector'),
                            'source': 'Digital Health JTBD Library'
                        }
                        
                        jtbds.append(jtbd_record)
                        stats['total_jtbds_parsed'] += 1
        
        source_name = Path(json_file).name
        stats['by_source'][source_name] = stats['by_source'].get(source_name, 0) + len(jtbds)
        
    except Exception as e:
        stats['parsing_errors'].append(f"Error reading {json_file}: {str(e)}")
    
    return jtbds

def extract_jtbds_from_markdown(md_file: str) -> List[Dict[str, Any]]:
    """Extract JTBDs from markdown documents"""
    jtbds = []
    
    try:
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Look for JTBD patterns in markdown
        # Pattern 1: "When..., I need..., so I can..."
        jtbd_pattern = r'["\']?(When [^"\']+I need [^"\']+so I can [^"\'\.]+)["\']?'
        matches = re.findall(jtbd_pattern, content, re.IGNORECASE | re.MULTILINE)
        
        for match in matches:
            statement = match.strip()
            parsed = parse_jtbd_statement(statement)
            
            jtbd_record = {
                'statement': statement,
                'verb': parsed['verb'],
                'object': parsed['object'][:100],
                'outcome': parsed['outcome'][:255],
                'goal': parsed['goal'][:255] if parsed['goal'] else parsed['outcome'][:255],
                'context': parsed['context'][:255],
                'frequency': 'Not specified',
                'importance': 8,  # Default
                'satisfaction': 5,  # Default
                'sector': 'Multi-sector',
                'source': Path(md_file).name
            }
            
            jtbds.append(jtbd_record)
            stats['total_jtbds_parsed'] += 1
        
        source_name = Path(md_file).name
        stats['by_source'][source_name] = stats['by_source'].get(source_name, 0) + len(matches)
        
    except Exception as e:
        stats['parsing_errors'].append(f"Error reading {md_file}: {str(e)}")
    
    return jtbds

def deduplicate_jtbds(jtbds: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Remove duplicate JTBD statements"""
    seen_statements = set()
    unique_jtbds = []
    
    for jtbd in jtbds:
        statement = jtbd['statement'].lower().strip()
        if statement not in seen_statements:
            seen_statements.add(statement)
            unique_jtbds.append(jtbd)
        else:
            stats['duplicate_statements'] += 1
    
    return unique_jtbds

def generate_jtbd_ids(jtbds: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Generate unique IDs for all JTBDs"""
    for i, jtbd in enumerate(jtbds, 1):
        jtbd['id'] = f"jtbd{i:05d}"  # jtbd00001, jtbd00002, etc.
        jtbd['unique_id'] = f"phase2_jtbd_{i:05d}"
        jtbd['jtbd_code'] = f"JTBD_{i:03d}"
    
    return jtbds

def generate_sql_insert(jtbd: Dict[str, Any]) -> str:
    """Generate SQL INSERT statement for a JTBD"""
    # Escape single quotes in strings
    def escape_sql(text):
        if text is None:
            return 'NULL'
        return f"'{str(text).replace(chr(39), chr(39)+chr(39))}'"
    
    sql = f"""
INSERT INTO jtbd_library (
    id, unique_id, jtbd_code, title, verb, "function", goal,
    description, frequency, importance, satisfaction, sector, source,
    created_at, updated_at
) VALUES (
    {escape_sql(jtbd['id'])},
    {escape_sql(jtbd['unique_id'])},
    {escape_sql(jtbd['jtbd_code'])},
    {escape_sql(jtbd['statement'][:255])},
    {escape_sql(jtbd['verb'])},
    {escape_sql(jtbd['object'])},
    {escape_sql(jtbd['goal'])},
    {escape_sql(jtbd['statement'])},
    {escape_sql(jtbd['frequency'])},
    {jtbd['importance']},
    {jtbd['satisfaction']},
    {escape_sql(jtbd['sector'])},
    {escape_sql(jtbd['source'])},
    NOW(),
    NOW()
);
"""
    return sql

def main():
    """Main execution function"""
    print("╔════════════════════════════════════════════════════════════╗")
    print("║  Phase 2: Extract ALL 750+ JTBDs                          ║")
    print("║  Comprehensive JTBD Collection & Parsing                  ║")
    print("╚════════════════════════════════════════════════════════════╝\n")
    
    all_jtbds = []
    
    # Source 1: Persona Master Catalogue JSON
    print("📖 Source 1: Persona Master Catalogue")
    pmc_json = 'data/persona_master_catalogue_20251108_204641.json'
    if os.path.exists(pmc_json):
        jtbds = extract_jtbds_from_json(pmc_json)
        all_jtbds.extend(jtbds)
        print(f"   ✅ Extracted {len(jtbds)} JTBDs from Persona Master Catalogue\n")
    else:
        print(f"   ⚠️  File not found: {pmc_json}\n")
    
    # Source 2: Digital Health JTBD Library JSON
    print("📖 Source 2: Digital Health JTBD Library")
    dh_json = 'data/dh_jtbd_library_enhanced_20251108_192510.json'
    if os.path.exists(dh_json):
        jtbds = extract_jtbds_from_json(dh_json)
        all_jtbds.extend(jtbds)
        print(f"   ✅ Extracted {len(jtbds)} JTBDs from DH JTBD Library\n")
    else:
        print(f"   ⚠️  File not found: {dh_json}\n")
    
    # Source 3: Markdown files (if any additional sources)
    print("📖 Source 3: Additional Markdown Documents")
    md_files = [
        '/Users/hichamnaim/Downloads/Private & Shared 30/Digital Health JTBD Library Complete.md',
        '/Users/hichamnaim/Downloads/Private & Shared 31/JTBD Library - Comprehensive Coverage Summary.md'
    ]
    
    for md_file in md_files:
        if os.path.exists(md_file):
            jtbds = extract_jtbds_from_markdown(md_file)
            if jtbds:
                all_jtbds.extend(jtbds)
                print(f"   ✅ Extracted {len(jtbds)} JTBDs from {Path(md_file).name}")
    
    print(f"\n{'='*70}\n")
    
    # Deduplicate
    print(f"🔍 Deduplicating JTBDs...")
    unique_jtbds = deduplicate_jtbds(all_jtbds)
    print(f"   ✅ Removed {stats['duplicate_statements']} duplicates")
    print(f"   ✅ {len(unique_jtbds)} unique JTBDs remaining\n")
    
    # Generate IDs
    print(f"🔢 Generating unique IDs...")
    final_jtbds = generate_jtbd_ids(unique_jtbds)
    print(f"   ✅ Generated IDs for {len(final_jtbds)} JTBDs\n")
    
    # Save to JSON
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_output = f"data/phase2_all_jtbds_{timestamp}.json"
    
    print(f"💾 Saving to JSON...")
    with open(json_output, 'w', encoding='utf-8') as f:
        json.dump({
            'metadata': {
                'total_count': len(final_jtbds),
                'extraction_date': datetime.now(timezone.utc).isoformat(),
                'sources': list(stats['by_source'].keys()),
                'duplicates_removed': stats['duplicate_statements']
            },
            'jtbds': final_jtbds,
            'statistics': stats
        }, f, indent=2, ensure_ascii=False)
    
    print(f"   ✅ Saved: {json_output}\n")
    
    # Generate SQL
    sql_output = f"data/phase2_all_jtbds_{timestamp}.sql"
    print(f"💾 Generating SQL INSERT statements...")
    
    with open(sql_output, 'w', encoding='utf-8') as f:
        f.write("-- Phase 2: ALL JTBDs Import Script\n")
        f.write(f"-- Generated: {datetime.now(timezone.utc).isoformat()}\n")
        f.write(f"-- Total JTBDs: {len(final_jtbds)}\n\n")
        f.write("BEGIN;\n\n")
        
        for jtbd in final_jtbds[:50]:  # First 50 for testing
            f.write(generate_sql_insert(jtbd))
            f.write("\n")
        
        f.write("\nCOMMIT;\n")
    
    print(f"   ✅ Saved: {sql_output} (first 50 for testing)\n")
    
    # Print summary
    print("=" * 70)
    print("\n╔════════════════════════════════════════════════════════════╗")
    print("║  Phase 2 Complete - Summary Statistics                    ║")
    print("╚════════════════════════════════════════════════════════════╝\n")
    
    print(f"📊 Total JTBDs Extracted:    {len(final_jtbds)}")
    print(f"📊 Duplicates Removed:       {stats['duplicate_statements']}")
    print(f"📊 Parsing Errors:           {len(stats['parsing_errors'])}")
    
    print(f"\n📊 By Source:")
    for source, count in sorted(stats['by_source'].items(), key=lambda x: x[1], reverse=True):
        print(f"   • {source}: {count} JTBDs")
    
    if stats['by_persona']:
        print(f"\n📊 Top Personas by JTBD Count:")
        for persona, count in sorted(stats['by_persona'].items(), key=lambda x: x[1], reverse=True)[:10]:
            print(f"   • {persona}: {count} JTBDs")
    
    if stats['parsing_errors']:
        print(f"\n⚠️  Parsing Errors (first 5):")
        for error in stats['parsing_errors'][:5]:
            print(f"   • {error}")
    
    print(f"\n✅ Phase 2 extraction complete!")
    print(f"📄 Output files:")
    print(f"   • JSON: {json_output}")
    print(f"   • SQL:  {sql_output}")
    print(f"\n🚀 Ready for Phase 3: Complete Org Structures\n")

if __name__ == "__main__":
    main()

