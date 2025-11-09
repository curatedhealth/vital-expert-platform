#!/usr/bin/env python3
"""
Complete Medical Affairs Library Import - All Data
- Remaining 111 JTBDs (total 120)
- 25 Use Cases
- 85 Workflows with detailed tasks
- Complete persona-JTBD mappings
"""

import json
from datetime import datetime

# Load the complete JTBD library
print("=" * 80)
print("MEDICAL AFFAIRS COMPLETE LIBRARY IMPORT")
print("=" * 80)

with open('/Users/hichamnaim/Downloads/MEDICAL_AFFAIRS_JTBD_COMPLETE.json', 'r') as f:
    data = json.load(f)

print(f"\n📊 Library Overview:")
print(f"   • Total JTBDs: {data['metadata']['total_jtbd']}")
print(f"   • Total Use Cases: {data['metadata']['total_use_cases']}")
print(f"   • Total Workflows: {data['metadata']['total_workflows']}")
print(f"   • Personas Covered: {data['metadata']['coverage']['personas']}")

# Extract all JTBDs for SQL generation
all_jtbds = []
all_workflows = []
all_use_cases = data.get('use_cases', [])

for idx, jtbd in enumerate(data['jobs_to_be_done'], 1):
    # Parse verb and goal
    statement = jtbd['jtbd_statement']
    verb = 'manage'
    goal = 'achieve outcome'
    
    try:
        if 'I want to' in statement:
            verb_part = statement.split('I want to')[1].split(',')[0].strip()
            first_word = verb_part.split()[0].lower()
            if len(first_word) > 2:
                verb = first_word[:20]
        
        if 'so I can' in statement:
            goal = statement.split('so I can')[1].strip()
            if goal.endswith('.'):
                goal = goal[:-1]
            goal = goal[:255]
    except:
        pass
    
    # Determine function from personas
    function = 'Medical Affairs'
    if 'HEOR' in jtbd.get('description', ''):
        function = 'Medical Affairs - HEOR'
    elif 'Field Medical' in jtbd.get('category', ''):
        function = 'Medical Affairs - Field Medical'
    elif 'Publications' in jtbd.get('category', ''):
        function = 'Medical Affairs - Publications'
    elif 'Medical Information' in jtbd.get('category', ''):
        function = 'Medical Affairs - Medical Information'
    elif 'Leadership' in jtbd.get('category', ''):
        function = 'Medical Affairs - Leadership'
    elif 'Operations' in jtbd.get('category', ''):
        function = 'Medical Affairs - Operations'
    elif 'Compliance' in jtbd.get('category', ''):
        function = 'Medical Affairs - Compliance'
    
    # Parse importance
    impact = jtbd.get('impact', 'High')
    importance = 10 if 'critical' in impact.lower() else 8 if 'high' in impact.lower() else 6
    
    # Parse frequency
    freq = jtbd.get('frequency', 'Ongoing')
    frequency = 'Weekly' if 'daily' in freq.lower() or 'week' in freq.lower() else \
                'Monthly' if 'month' in freq.lower() or 'quarter' in freq.lower() else \
                'Annual' if 'annual' in freq.lower() or 'year' in freq.lower() else 'Ongoing'
    
    jtbd_record = {
        'idx': idx,
        'id': f"ma{idx:05d}",
        'unique_id': f"medical_affairs_ma{idx:05d}",
        'jtbd_code': jtbd['id'],
        'title': statement[:255],
        'verb': verb,
        'goal': goal,
        'function': function,
        'description': jtbd.get('description', statement)[:500],
        'frequency': frequency,
        'importance': importance,
        'category': jtbd.get('category', 'Medical Affairs'),
        'strategic_pillar': jtbd.get('strategic_pillar', ''),
        'complexity': jtbd.get('complexity', 'Intermediate'),
        'persona_ids': jtbd.get('persona_ids', []),
        'success_criteria': jtbd.get('success_criteria', []),
        'pain_points': jtbd.get('pain_points', []),
        'workflows': jtbd.get('workflows', []),
        'use_case_ids': jtbd.get('use_case_ids', [])
    }
    
    all_jtbds.append(jtbd_record)
    
    # Extract workflows
    for wf in jtbd.get('workflows', []):
        workflow_record = {
            'workflow_id': wf['workflow_id'],
            'workflow_name': wf['workflow_name'],
            'jtbd_code': jtbd['id'],
            'duration': wf['duration'],
            'phases': wf.get('phases', [])
        }
        all_workflows.append(workflow_record)

print(f"\n✅ Extracted {len(all_jtbds)} JTBDs")
print(f"✅ Extracted {len(all_workflows)} Workflows")
print(f"✅ Extracted {len(all_use_cases)} Use Cases")

# Generate SQL for remaining JTBDs (10-120)
print(f"\n📝 Generating SQL INSERT statements...")
print(f"\n{'=' * 80}")
print("SQL INSERT STATEMENTS FOR REMAINING JTBDS (10-30):")
print(f"{'=' * 80}\n")

# Generate SQL for JTBDs 10-30 (next batch)
for jtbd in all_jtbds[9:30]:  # Already have 1-9, so start from index 9
    # Escape single quotes in strings
    title = jtbd['title'].replace("'", "''")
    goal = jtbd['goal'].replace("'", "''")
    description = jtbd['description'].replace("'", "''")
    
    sql = f"""INSERT INTO jtbd_library (id, unique_id, jtbd_code, title, verb, goal, function, description, frequency, importance, satisfaction, sector, category, source, created_at, updated_at)
VALUES ('{jtbd['id']}', '{jtbd['unique_id']}', '{jtbd['jtbd_code']}', 
 '{title}',
 '{jtbd['verb']}', '{goal}',
 '{jtbd['function']}',
 '{description}',
 '{jtbd['frequency']}', {jtbd['importance']}, 5, 'Pharma', '{jtbd['category']}', 'Medical Affairs JTBD Complete Library v3.0', NOW(), NOW())
ON CONFLICT (unique_id) DO UPDATE SET
  title = EXCLUDED.title,
  verb = EXCLUDED.verb,
  goal = EXCLUDED.goal,
  function = EXCLUDED.function,
  description = EXCLUDED.description,
  frequency = EXCLUDED.frequency,
  importance = EXCLUDED.importance,
  updated_at = NOW();
"""
    print(sql)
    print()

print(f"\n{'=' * 80}")
print(f"✅ Generated SQL for JTBDs 10-30")
print(f"💡 Continue with batches 31-60, 61-90, 91-120")
print(f"{'=' * 80}\n")

# Summary statistics
print(f"\n📊 IMPORT PLAN SUMMARY:")
print(f"   • Batch 1 (JTBD 1-9):    ✅ Already imported")
print(f"   • Batch 2 (JTBD 10-30):  📝 SQL generated above")
print(f"   • Batch 3 (JTBD 31-60):  🔄 To be generated")
print(f"   • Batch 4 (JTBD 61-90):  🔄 To be generated")
print(f"   • Batch 5 (JTBD 91-120): 🔄 To be generated")
print(f"\n   • Use Cases (25):        🔄 Ready to import")
print(f"   • Workflows (85):        🔄 Ready to extract")
print(f"   • Persona Mappings:      🔄 Ready to create")

# Save full data for reference
output_file = '/tmp/medical_affairs_full_import.json'
with open(output_file, 'w') as f:
    json.dump({
        'jtbds': all_jtbds,
        'workflows': all_workflows,
        'use_cases': all_use_cases,
        'metadata': data['metadata']
    }, f, indent=2)

print(f"\n✅ Full data saved to: {output_file}")
print(f"\n🚀 Ready to continue with complete import!")

