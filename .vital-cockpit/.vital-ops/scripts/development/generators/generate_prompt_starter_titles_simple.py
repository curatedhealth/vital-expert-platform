#!/usr/bin/env python3
"""
Generate Short Titles for Prompt Starters (Simple Method)
Creates concise titles by extracting key action phrases from prompts
"""

import os
import json
import re
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

print("=" * 80)
print("GENERATING SHORT TITLES FOR PROMPT STARTERS (SIMPLE METHOD)")
print("=" * 80)

# Fetch all user prompts (prompt starters)
print("\n📖 Fetching all user prompts from database...")
result = supabase.table('prompts').select('*').eq('role_type', 'user').execute()
user_prompts = result.data

print(f"✅ Found {len(user_prompts)} user prompts to process")

def extract_smart_title(prompt_text: str, max_words: int = 5) -> str:
    """
    Extract a smart title from the prompt text
    Looks for action verbs and key nouns
    """

    # Remove common filler phrases
    text = prompt_text.strip()

    # Replace question starters
    text = re.sub(r'^(What|How|Can you|Could you|Please|I need|Help me|Assist me with)\s+', '', text, flags=re.IGNORECASE)

    # Common action verbs for titles
    action_verbs = [
        'Develop', 'Create', 'Design', 'Build', 'Analyze', 'Evaluate', 'Review',
        'Generate', 'Draft', 'Outline', 'Identify', 'Assess', 'Conduct', 'Perform',
        'Provide', 'Guide', 'Support', 'Manage', 'Optimize', 'Implement', 'Execute',
        'Plan', 'Strategy', 'Monitor', 'Track', 'Report', 'Document', 'Prepare'
    ]

    # Check if prompt starts with an action verb
    words = text.split()

    # If starts with action verb, use that structure
    for verb in action_verbs:
        if words[0].lower() == verb.lower() or (len(words) > 1 and words[0].lower() + ' ' + words[1].lower()).startswith(verb.lower()):
            # Take first N words after cleaning
            title_words = []
            for i, word in enumerate(words[:max_words + 3]):  # Get a few extra to choose from
                # Skip articles and common words
                if word.lower() not in ['a', 'an', 'the', 'to', 'for', 'of', 'in', 'on', 'at']:
                    title_words.append(word)
                    if len(title_words) >= max_words:
                        break

            title = ' '.join(title_words)
            # Clean up punctuation
            title = re.sub(r'[,;:].*$', '', title)  # Remove everything after first punctuation
            return title

    # Fallback: extract key phrase
    # Look for infinitive phrases (to + verb)
    infinitive_match = re.search(r'to\s+(\w+\s+\w+(?:\s+\w+){0,3})', text, re.IGNORECASE)
    if infinitive_match:
        phrase = infinitive_match.group(1)
        words = phrase.split()[:max_words]
        return ' '.join(words).title()

    # Last resort: take first N meaningful words
    meaningful_words = []
    for word in words[:max_words * 2]:
        if word.lower() not in ['a', 'an', 'the', 'to', 'for', 'of', 'in', 'on', 'at', 'with', 'by', 'from']:
            meaningful_words.append(word)
            if len(meaningful_words) >= max_words:
                break

    title = ' '.join(meaningful_words)
    # Remove trailing punctuation
    title = re.sub(r'[,;:.].*$', '', title)
    return title

# Process all prompts
stats = {
    'processed': 0,
    'updated': 0,
    'errors': 0
}

print("\n🚀 Generating titles and updating database...\n")

for i, prompt in enumerate(user_prompts, 1):
    prompt_id = prompt['id']
    prompt_code = prompt['prompt_code']
    agent_name = prompt['name'].split(' - Starter #')[0] if ' - Starter #' in prompt['name'] else 'Unknown'
    full_content = prompt['content']

    try:
        # Generate short title
        short_title = extract_smart_title(full_content, max_words=5)

        # Ensure it's not too long
        if len(short_title) > 60:
            words = short_title.split()[:4]
            short_title = ' '.join(words)

        print(f"[{i}/{len(user_prompts)}] {agent_name}")
        print(f"  ✅ \"{short_title}\"")

        # Update database
        update_result = supabase.table('prompts').update({
            'title': short_title,
            'description': f"Conversation starter: {short_title}"
        }).eq('id', prompt_id).execute()

        stats['updated'] += 1

    except Exception as e:
        print(f"  ❌ Error: {e}")
        stats['errors'] += 1

    stats['processed'] += 1

# Generate summary JSON for agent table
print("\n" + "=" * 80)
print("GENERATING AGENT PROMPT STARTERS MAPPING")
print("=" * 80)

# Fetch updated prompts grouped by agent
result = supabase.table('prompts').select('*').eq('role_type', 'user').order('name').execute()
updated_prompts = result.data

# Group by agent
agent_starters = {}
for prompt in updated_prompts:
    # Extract agent ID from prompt code (e.g., "USR-25d3b613-1")
    parts = prompt['prompt_code'].split('-')
    if len(parts) >= 3:
        agent_id = f"{parts[1]}"
        starter_num = int(parts[2]) if len(parts) > 2 else 0

    agent_name = prompt['name'].split(' - Starter #')[0] if ' - Starter #' in prompt['name'] else 'Unknown'

    if agent_name not in agent_starters:
        agent_starters[agent_name] = []

    agent_starters[agent_name].append({
        'starter_number': starter_num,
        'short_title': prompt['title'],
        'full_prompt': prompt['content'],
        'prompt_id': prompt['id'],
        'prompt_code': prompt['prompt_code']
    })

# Sort starters by number
for agent_name in agent_starters:
    agent_starters[agent_name].sort(key=lambda x: x['starter_number'])

# Save to JSON
output_file = 'agent_prompt_starters_mapping.json'
with open(output_file, 'w') as f:
    json.dump(agent_starters, f, indent=2)

print(f"\n✅ Saved agent-to-starters mapping to: {output_file}")

# Generate CSV for easy import to agent table
csv_output = []
csv_output.append("agent_name,starter_1_title,starter_1_id,starter_2_title,starter_2_id,starter_3_title,starter_3_id,starter_4_title,starter_4_id")

for agent_name, starters in sorted(agent_starters.items()):
    row = [agent_name]
    for i in range(1, 5):
        if i <= len(starters):
            starter = starters[i-1]
            row.append(starter['short_title'])
            row.append(starter['prompt_id'])
        else:
            row.append('')
            row.append('')
    csv_output.append(','.join([f'"{item}"' if ',' in str(item) else str(item) for item in row]))

csv_file = 'agent_prompt_starters.csv'
with open(csv_file, 'w') as f:
    f.write('\n'.join(csv_output))

print(f"✅ Saved CSV for agent table import to: {csv_file}")

# Summary
print("\n" + "=" * 80)
print("✅ TITLE GENERATION COMPLETE")
print("=" * 80)
print(f"\n📊 Statistics:")
print(f"  • Prompts Processed: {stats['processed']}")
print(f"  • Titles Generated: {stats['updated']}")
print(f"  • Errors: {stats['errors']}")
print(f"  • Agents: {len(agent_starters)}")

print(f"\n📝 Files Created:")
print(f"  • {output_file} - JSON mapping for reference")
print(f"  • {csv_file} - CSV for agent table updates")

print(f"\n🎯 Next Steps:")
print(f"  1. Review generated titles in database (prompts table, title column)")
print(f"  2. Use CSV to update agent table with short starters")
print(f"  3. Frontend displays short titles, fetches full prompts on click")

# Show sample
print(f"\n📋 Sample Agent Starters:")
sample_agents = list(agent_starters.keys())[:3]
for agent_name in sample_agents:
    print(f"\n  {agent_name}:")
    for starter in agent_starters[agent_name]:
        print(f"    {starter['starter_number']}. {starter['short_title']}")
