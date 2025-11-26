#!/usr/bin/env python3
"""
Extract TASK_DEFINITIONS from TaskLibrary.tsx and generate SQL migration
"""

import re
import json

# Read the TaskLibrary.tsx file
with open('apps/vital-system/src/components/langgraph-gui/TaskLibrary.tsx', 'r') as f:
    content = f.read()

# Find the TASK_DEFINITIONS array
# Look for the pattern: export const TASK_DEFINITIONS: TaskDefinition[] = [
start_marker = 'export const TASK_DEFINITIONS: TaskDefinition[] = ['
end_marker = '];'

start_idx = content.find(start_marker)
if start_idx == -1:
    print("Could not find TASK_DEFINITIONS array")
    exit(1)

# Find the matching closing bracket
start_idx += len(start_marker)
bracket_count = 1
end_idx = start_idx

while bracket_count > 0 and end_idx < len(content):
    if content[end_idx] == '[':
        bracket_count += 1
    elif content[end_idx] == ']':
        bracket_count -= 1
    end_idx += 1

tasks_array_str = content[start_idx:end_idx-1]

# Now parse individual task objects
tasks = []
task_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'

for match in re.finditer(task_pattern, tasks_array_str):
    task_str = match.group(0)
    
    # Extract fields using regex
    id_match = re.search(r"id:\s*['\"]([^'\"]+)['\"]", task_str)
    name_match = re.search(r"name:\s*['\"]([^'\"]+)['\"]", task_str)
    desc_match = re.search(r"description:\s*['\"]([^'\"]+)['\"]", task_str)
    icon_match = re.search(r"icon:\s*['\"]([^'\"]+)['\"]", task_str)
    cat_match = re.search(r"category:\s*['\"]([^'\"]+)['\"]", task_str)
    
    # Extract config object
    config_match = re.search(r"config:\s*\{([^}]+)\}", task_str, re.DOTALL)
    
    if all([id_match, name_match, desc_match, icon_match, cat_match]):
        task = {
            'id': id_match.group(1),
            'name': name_match.group(1).replace("'", "''"),
            'description': desc_match.group(1).replace("'", "''"),
            'icon': icon_match.group(1),
            'category': cat_match.group(1)
        }
        
        # Parse config
        config = {}
        if config_match:
            config_str = config_match.group(1)
            
            # Extract model
            model_match = re.search(r"model:\s*['\"]([^'\"]+)['\"]", config_str)
            if model_match:
                config['model'] = model_match.group(1)
            
            # Extract temperature
            temp_match = re.search(r"temperature:\s*([\d.]+)", config_str)
            if temp_match:
                config['temperature'] = float(temp_match.group(1))
            
            # Extract tools array
            tools_match = re.search(r"tools:\s*\[(.*?)\]", config_str)
            if tools_match:
                tools_str = tools_match.group(1)
                config['tools'] = [t.strip().strip("'\"") for t in tools_str.split(',') if t.strip()]
            
            # Extract systemPrompt
            prompt_match = re.search(r"systemPrompt:\s*['\"]([^'\"]+)['\"]", config_str, re.DOTALL)
            if prompt_match:
                config['systemPrompt'] = prompt_match.group(1).replace("'", "''")
        
        task['config'] = config
        tasks.append(task)

print(f"✅ Extracted {len(tasks)} tasks from TaskLibrary.tsx")

# Generate SQL
sql = """-- ============================================================================
-- Migration 026: Seed Complete Node Library (ALL 148 Nodes)
-- ============================================================================
-- Generated from TaskLibrary.tsx
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

"""

for task in tasks:
    # Determine node_type based on category
    category = task['category'].lower()
    if 'control' in category or 'flow' in category:
        node_type = 'control'
    elif 'agent' in task['id'] or 'moderator' in task['id'] or 'expert' in task['id']:
        node_type = 'agent'
    else:
        node_type = 'tool'
    
    # Convert category to snake_case
    node_category = task['category'].lower().replace(' ', '_').replace('-', '_')
    
    # Build tags array
    tags = [node_category]
    if task['config'].get('tools'):
        tags.extend(task['config']['tools'])
    
    # Build config JSON
    config_json = json.dumps(task['config']).replace("'", "''")
    
    sql += f"""INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  '{task['id']}',
  '{task['name']}',
  '{task['name']}',
  '{task['description']}',
  '{node_type}',
  '{node_category}',
  '{task['icon']}',
  false,
  true,
  '{config_json}',
  ARRAY[{', '.join(f"'{t}'" for t in tags)}]
)
ON CONFLICT (node_slug) DO NOTHING;

"""

sql += """
-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- SELECT node_category, COUNT(*) as count 
-- FROM node_library 
-- WHERE is_builtin = false 
-- GROUP BY node_category 
-- ORDER BY node_category;
"""

# Write to file
output_path = 'database/migrations/026_seed_all_nodes_FULL.sql'
with open(output_path, 'w') as f:
    f.write(sql)

print(f"✅ Generated SQL migration: {output_path}")
print(f"📊 Total nodes: {len(tasks)}")
print(f"📄 File size: {len(sql) / 1024:.2f} KB")


