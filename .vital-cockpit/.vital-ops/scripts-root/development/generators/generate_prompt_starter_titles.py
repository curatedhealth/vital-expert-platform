#!/usr/bin/env python3
"""
Generate Short Titles for Prompt Starters
Creates concise, actionable titles (3-6 words) for all 1,276 user prompts
"""

import os
import json
import re
from dotenv import load_dotenv
from supabase import create_client, Client
from anthropic import Anthropic

load_dotenv()

# Initialize clients
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

anthropic = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

print("=" * 80)
print("GENERATING SHORT TITLES FOR PROMPT STARTERS")
print("=" * 80)

# Fetch all user prompts (prompt starters)
print("\n📖 Fetching all user prompts from database...")
result = supabase.table('prompts').select('*').eq('role_type', 'user').execute()
user_prompts = result.data

print(f"✅ Found {len(user_prompts)} user prompts to process")

# Function to generate short title using Claude
def generate_short_title(full_prompt: str, agent_name: str) -> str:
    """Generate a concise 3-6 word title for a prompt starter"""

    try:
        response = anthropic.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=100,
            temperature=0.3,
            messages=[{
                "role": "user",
                "content": f"""Generate a concise, actionable title (3-6 words) for this conversation starter.

Agent: {agent_name}
Full Prompt Starter: {full_prompt}

Requirements:
- 3-6 words maximum
- Start with action verb (e.g., "Develop", "Analyze", "Create", "Review")
- Professional and clear
- No articles (a, an, the) at the beginning
- No quotes or special characters

Examples:
"Develop Economic Model"
"Analyze Clinical Trial Data"
"Create Regulatory Strategy"

Return ONLY the title, nothing else."""
            }]
        )

        title = response.content[0].text.strip()
        # Clean up any quotes
        title = title.replace('"', '').replace("'", '')
        return title

    except Exception as e:
        print(f"  ⚠️  Error generating title: {e}")
        # Fallback: extract first few words
        words = full_prompt.split()[:4]
        return ' '.join(words) + '...'

# Process in batches to show progress
batch_size = 10
stats = {
    'processed': 0,
    'updated': 0,
    'errors': 0
}

print("\n🚀 Generating titles and updating database...\n")

for i in range(0, len(user_prompts), batch_size):
    batch = user_prompts[i:i+batch_size]

    for prompt in batch:
        prompt_id = prompt['id']
        prompt_code = prompt['prompt_code']
        agent_name = prompt['name'].replace(' - Starter #', ' ').split(' - ')[0]
        full_content = prompt['content']

        print(f"[{stats['processed']+1}/{len(user_prompts)}] {agent_name}")

        try:
            # Generate short title
            short_title = generate_short_title(full_content, agent_name)
            print(f"  ✅ Generated: \"{short_title}\"")

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

    # Small delay between batches to avoid rate limits
    if i + batch_size < len(user_prompts):
        import time
        time.sleep(1)

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
    # Extract agent name from prompt name (e.g., "HEOR Director - Starter #1")
    agent_name = prompt['name'].split(' - Starter #')[0]
    starter_num = int(prompt['name'].split(' - Starter #')[1]) if ' - Starter #' in prompt['name'] else 0

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

# Summary
print("\n" + "=" * 80)
print("✅ TITLE GENERATION COMPLETE")
print("=" * 80)
print(f"\n📊 Statistics:")
print(f"  • Prompts Processed: {stats['processed']}")
print(f"  • Titles Generated: {stats['updated']}")
print(f"  • Errors: {stats['errors']}")
print(f"  • Agents: {len(agent_starters)}")

print(f"\n📝 Next Steps:")
print(f"  1. Review generated titles in database (prompts table, title column)")
print(f"  2. Use {output_file} to update agent table with short starters")
print(f"  3. Frontend can display short titles, fetch full prompts on click")

print("\n🎯 Example Usage:")
print("""
# In your agent table, store:
agent.prompt_starters = [
  {"title": "Develop Economic Model", "prompt_id": "uuid-1"},
  {"title": "Guide Outcomes Research", "prompt_id": "uuid-2"},
  {"title": "Create Value Narrative", "prompt_id": "uuid-3"},
  {"title": "Analyze HEOR Literature", "prompt_id": "uuid-4"}
]

# When user clicks a starter:
full_prompt = supabase.table('prompts').select('content').eq('id', prompt_id).single()
# Submit full_prompt.content to conversation
""")
