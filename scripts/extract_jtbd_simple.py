#!/usr/bin/env python3
"""
Simple JTBD Content Extractor
Paste your JTBD document content and this will extract structured data
"""

import re
import json
from datetime import datetime

# PASTE YOUR JTBD DOCUMENT CONTENT HERE (between triple quotes)
JTBD_DOCUMENT = """
### Persona: CTO/Technical Co-founder - Alex Kumar

```yaml
persona_profile:
  name: Alex Kumar
  title: Chief Technology Officer
  organization: Series B DTx Startup

jobs_to_be_done:
  JTBD-CTO-001:
    statement: "When building HIPAA-compliant infrastructure, I need security frameworks and audit tools, so I can ensure compliance and pass audits"
    frequency: Weekly
    importance: 10/10
    current_satisfaction: 4/10
    opportunity_score: 16
```
"""

def extract_jtbds_from_yaml(text):
    """Extract JTBDs from YAML-formatted content"""
    jtbds = []
    
    # Find all JTBD blocks
    jtbd_pattern = r'(JTBD-[A-Z]+-\d+):\s*\n\s*statement:\s*"([^"]+)"\s*\n\s*frequency:\s*(.+)\s*\n\s*importance:\s*(\d+)/10\s*\n\s*current_satisfaction:\s*(\d+)/10\s*\n\s*opportunity_score:\s*(\d+)'
    
    matches = re.finditer(jtbd_pattern, text, re.MULTILINE)
    
    for match in matches:
        jtbd = {
            'code': match.group(1),
            'statement': match.group(2).strip(),
            'frequency': match.group(3).strip(),
            'importance': int(match.group(4)),
            'current_satisfaction': int(match.group(5)),
            'opportunity_score': int(match.group(6))
        }
        jtbds.append(jtbd)
    
    return jtbds

def generate_sql_insert(jtbd):
    """Generate SQL INSERT statement for a JTBD"""
    # Parse code to determine industry/function
    code_parts = jtbd['code'].split('-')
    func_abbrev = code_parts[1] if len(code_parts) > 1 else 'DH'
    number = code_parts[2] if len(code_parts) > 2 else '001'
    
    # Map function abbreviations to full names
    function_map = {
        'CTO': 'Technology & Engineering',
        'CS': 'Customer Success',
        'GM': 'Growth Marketing',
        'PDL': 'Product Development',
        'CRD': 'Clinical Research',
        'QRM': 'Quality & Regulatory',
        'BDD': 'Business Development',
        'PSD': 'Patient Solutions',
        'PXD': 'Patient Experience Design',
        'PAL': 'Patient Advocacy',
        'MAD': 'Market Access',
        'CSL': 'Commercial Strategy',
        'DMM': 'Digital Marketing',
        'CDO': 'Chief Digital Officer',
        'DHPM': 'Digital Health Product',
        'DAL': 'Data & Analytics',
        'ITL': 'IT Infrastructure'
    }
    
    function_name = function_map.get(func_abbrev, 'Digital Health')
    category = function_name.lower().replace(' ', '_').replace('&', 'and')
    
    # Create standardized IDs
    unique_id = f"dh_{category}_{number}"
    jtbd_code = f"DH_{func_abbrev}_{number}"
    
    # Extract verb and goal from statement
    statement = jtbd['statement']
    verb = 'Execute'
    goal = statement
    
    if 'When' in statement and 'I need' in statement:
        parts = statement.split('I need')
        if len(parts) > 1:
            needs_goal = parts[1].split('so I can')
            if len(needs_goal) > 1:
                goal = needs_goal[1].strip()
    
    # Determine complexity
    if jtbd['importance'] >= 9 and jtbd['current_satisfaction'] <= 3:
        complexity = 'High'
    elif jtbd['importance'] >= 7 and jtbd['current_satisfaction'] <= 5:
        complexity = 'Medium'
    else:
        complexity = 'Low'
    
    # Business value
    opp = jtbd['opportunity_score']
    if opp >= 17:
        business_value = f"Critical opportunity (Score: {opp}) - High impact, breakthrough potential"
    elif opp >= 15:
        business_value = f"High value opportunity (Score: {opp}) - Significant improvement potential"
    else:
        business_value = f"Medium value opportunity (Score: {opp}) - Notable improvement"
    
    sql = f"""
INSERT INTO jtbd_library (
    id, unique_id, jtbd_code, title, verb, goal, function, category,
    description, complexity, business_value, time_to_value,
    is_active, tags, keywords
) VALUES (
    '{jtbd['code']}',
    '{unique_id}',
    '{jtbd_code}',
    '{statement[:100].replace("'", "''")}',
    '{verb}',
    '{goal.replace("'", "''")}',
    '{function_name}',
    '{category}',
    '{statement.replace("'", "''")}',
    '{complexity}',
    '{business_value.replace("'", "''")}',
    '{"6-12 months" if opp >= 17 else "3-6 months" if opp >= 15 else "1-3 months"}',
    true,
    ARRAY['digital_health', '{function_name.lower()}', 'startup'],
    ARRAY['digital', 'health', '{category}', '{jtbd["frequency"].lower()}']
) ON CONFLICT (id) DO UPDATE SET
    unique_id = EXCLUDED.unique_id,
    jtbd_code = EXCLUDED.jtbd_code,
    updated_at = now();
"""
    return sql

def main():
    print("=" * 80)
    print("JTBD EXTRACTOR - Simple Version")
    print("=" * 80)
    print()
    
    # Extract JTBDs
    jtbds = extract_jtbds_from_yaml(JTBD_DOCUMENT)
    
    print(f"✅ Found {len(jtbds)} JTBDs\n")
    
    # Generate JSON output
    json_output = {
        'metadata': {
            'extracted_at': datetime.now().isoformat(),
            'total_jtbds': len(jtbds)
        },
        'jtbds': jtbds
    }
    
    json_file = '/Users/hichamnaim/Downloads/Cursor/VITAL path/data/jtbds_extracted.json'
    with open(json_file, 'w') as f:
        json.dump(json_output, f, indent=2)
    print(f"✅ JSON saved: {json_file}\n")
    
    # Generate SQL output
    sql_statements = ["-- Digital Health JTBDs\nBEGIN;\n"]
    for jtbd in jtbds:
        sql_statements.append(generate_sql_insert(jtbd))
    sql_statements.append("\nCOMMIT;")
    
    sql_file = '/Users/hichamnaim/Downloads/Cursor/VITAL path/data/jtbds_extracted.sql'
    with open(sql_file, 'w') as f:
        f.write('\n'.join(sql_statements))
    print(f"✅ SQL saved: {sql_file}\n")
    
    # Print summary
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    for jtbd in jtbds:
        print(f"\n{jtbd['code']}")
        print(f"  Opportunity Score: {jtbd['opportunity_score']}")
        print(f"  Frequency: {jtbd['frequency']}")
        print(f"  Statement: {jtbd['statement'][:80]}...")

if __name__ == '__main__':
    main()

