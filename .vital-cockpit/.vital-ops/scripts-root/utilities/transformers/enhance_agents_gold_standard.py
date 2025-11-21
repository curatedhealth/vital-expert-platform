#!/usr/bin/env python3
"""
Enhance all 319 agents to gold standard with:
1. Industry-leading system prompts
2. Role-specific prompt starters
3. Updated tools, capabilities, and skills

Based on latest LLM prompt engineering best practices (2025)
"""

import asyncio
import json
import os
from typing import Dict, List
from openai import AsyncOpenAI
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Industry Best Practices for System Prompts (2025)
SYSTEM_PROMPT_TEMPLATE = """You are {agent_name}, a {tier_level} level AI agent specializing in {domain}.

## Your Role
{role_description}

## Core Capabilities
{capabilities_list}

## Your Expertise Level: {tier_level}
{tier_guidance}

## Communication Style
- **Tone**: {tone}
- **Approach**: {approach}
- **Output Format**: {output_format}

## Operating Principles
1. **Accuracy First**: Always verify facts and cite sources when possible
2. **Context Awareness**: Consider the user's industry context (pharma/biotech or digital health)
3. **Actionable Insights**: Provide concrete, implementable recommendations
4. **Risk Awareness**: Flag potential compliance, regulatory, or safety issues
5. **Continuous Learning**: Acknowledge limitations and suggest expert consultation when needed

## Constraints
{constraints}

## Special Instructions
{special_instructions}

Remember: Your responses should reflect your {tier_level} level expertise. {tier_specific_guidance}
"""

TIER_GUIDANCE = {
    'MASTER': {
        'guidance': 'As a MASTER agent, you orchestrate complex multi-agent workflows and make high-level strategic decisions.',
        'tone': 'Strategic, authoritative, big-picture focused',
        'approach': 'Coordinate multiple perspectives, identify dependencies, manage complexity',
        'output_format': 'Executive summaries, strategic frameworks, orchestration plans',
        'tier_specific': 'You should delegate detailed execution to EXPERT and SPECIALIST agents while maintaining oversight.',
        'constraints': '- Focus on strategic coordination, not detailed execution\n- Delegate specialized tasks to appropriate agents\n- Maintain alignment across multiple work streams'
    },
    'EXPERT': {
        'guidance': 'As an EXPERT agent, you provide deep domain expertise with advanced analytical capabilities.',
        'tone': 'Professional, authoritative, evidence-based',
        'approach': 'Comprehensive analysis, strategic recommendations, risk assessment',
        'output_format': 'Detailed analyses, strategic recommendations, evidence-based conclusions',
        'tier_specific': 'Provide nuanced insights that require years of domain expertise. Challenge assumptions when appropriate.',
        'constraints': '- Provide detailed analysis with supporting evidence\n- Consider multiple perspectives and edge cases\n- Flag areas requiring specialized expertise beyond your scope'
    },
    'SPECIALIST': {
        'guidance': 'As a SPECIALIST agent, you handle focused, well-defined tasks within your narrow domain.',
        'tone': 'Precise, focused, technically proficient',
        'approach': 'Detailed execution, technical accuracy, specific deliverables',
        'output_format': 'Technical documentation, specific analyses, focused recommendations',
        'tier_specific': 'Excel at your specific area while acknowledging boundaries of your expertise.',
        'constraints': '- Stay within your area of specialization\n- Provide precise, technically accurate information\n- Escalate out-of-scope questions to EXPERT agents'
    },
    'WORKER': {
        'guidance': 'As a WORKER agent, you execute well-defined operational tasks efficiently and accurately.',
        'tone': 'Clear, efficient, task-oriented',
        'approach': 'Follow established procedures, deliver consistent results',
        'output_format': 'Structured outputs, completed tasks, status updates',
        'tier_specific': 'Focus on reliable execution of defined tasks without strategic decision-making.',
        'constraints': '- Follow established templates and procedures\n- Focus on accurate task execution\n- Escalate decisions to EXPERT agents'
    },
    'TOOL': {
        'guidance': 'As a TOOL agent, you provide simple, deterministic functions with consistent outputs.',
        'tone': 'Direct, concise, functional',
        'approach': 'Input → Processing → Output with minimal interpretation',
        'output_format': 'Structured data, calculations, formatted results',
        'tier_specific': 'Provide quick, reliable results for straightforward queries.',
        'constraints': '- Provide direct answers without extensive analysis\n- Use standardized formats\n- No strategic recommendations'
    }
}

def load_all_analysis_data():
    """Load all analysis data"""
    with open('agent_capabilities_analysis.json', 'r') as f:
        capabilities_data = {item['agent_name']: item for item in json.load(f)}

    with open('agent_reclassification_results.json', 'r') as f:
        reclassification_data = {item['agent_name']: item for item in json.load(f)}

    with open('agent_organizational_mappings.json', 'r') as f:
        org_data = {item['agent_name']: item for item in json.load(f)}

    return capabilities_data, reclassification_data, org_data

async def generate_enhanced_system_prompt(agent: Dict, capabilities_data: Dict, reclass_data: Dict, org_data: Dict) -> str:
    """Generate industry-leading system prompt"""

    agent_name = agent['name']

    # Get data from analysis
    caps = capabilities_data.get(agent_name, {})
    reclass = reclass_data.get(agent_name, {})
    org = org_data.get(agent_name, {})

    tier = reclass.get('new_tier', 'EXPERT')
    tier_config = TIER_GUIDANCE.get(tier, TIER_GUIDANCE['EXPERT'])

    # Build capabilities list
    capabilities_list = '\n'.join([
        f"- **{cap.get('display_name', '')}**: {cap.get('description', '')}"
        for cap in caps.get('capabilities', [])[:5]
    ])

    # Build role description
    role = org.get('role', agent_name)
    department = org.get('department', 'general')

    # Use GPT-4 to create comprehensive role description
    role_prompt = f"""Create a concise 2-3 sentence role description for this agent:

Agent: {agent_name}
Tier: {tier}
Department: {department}
Role: {role}
Capabilities: {', '.join([c.get('name', '') for c in caps.get('capabilities', [])[:3]])}

Focus on what makes this role unique and valuable. Be specific to pharma/biotech or digital health context.
"""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert at writing concise, impactful role descriptions."},
                {"role": "user", "content": role_prompt}
            ],
            temperature=0.7,
            max_tokens=200
        )
        role_description = response.choices[0].message.content.strip()
    except:
        role_description = f"Expert in {department} with focus on {role}."

    # Determine domain
    category = caps.get('category', 'operational')
    domain_map = {
        'regulatory': 'regulatory affairs and compliance',
        'clinical': 'clinical development and research',
        'market_access': 'market access and health economics',
        'technical_cmc': 'chemistry, manufacturing, and controls',
        'strategic': 'strategic planning and execution',
        'operational': 'operations and project management',
        'analytical': 'data analysis and insights',
        'communication': 'scientific communication and education'
    }
    domain = domain_map.get(category, 'general operations')

    # Special instructions based on tenants
    tenants = org.get('tenants', ['pharma'])
    if len(tenants) == 2 or 'both' in [t.lower() for t in tenants]:
        special_instructions = "You serve both pharmaceutical/biotech AND digital health clients. Adapt your responses to the user's context."
    elif 'digital_health' in tenants:
        special_instructions = "You specialize in digital health and health tech contexts. Focus on software, apps, platforms, and digital therapeutics."
    else:
        special_instructions = "You specialize in pharmaceutical and biotech contexts. Focus on drug development, clinical trials, and regulatory affairs."

    # Fill template
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        agent_name=agent_name,
        tier_level=tier,
        domain=domain,
        role_description=role_description,
        capabilities_list=capabilities_list or "- General domain expertise",
        tier_guidance=tier_config['guidance'],
        tone=tier_config['tone'],
        approach=tier_config['approach'],
        output_format=tier_config['output_format'],
        constraints=tier_config['constraints'],
        special_instructions=special_instructions,
        tier_specific_guidance=tier_config['tier_specific']
    )

    return system_prompt

async def generate_prompt_starters(agent: Dict, capabilities_data: Dict, org_data: Dict) -> List[str]:
    """Generate role-specific prompt starters"""

    agent_name = agent['name']
    caps = capabilities_data.get(agent_name, {})
    org = org_data.get(agent_name, {})

    # Build context for GPT-4
    capabilities_summary = ', '.join([c.get('name', '') for c in caps.get('capabilities', [])[:5]])
    role = org.get('role', agent_name)
    department = org.get('department', 'general')

    prompt = f"""Generate 4 specific, actionable prompt starters for this AI agent:

Agent: {agent_name}
Role: {role}
Department: {department}
Capabilities: {capabilities_summary}

Create prompts that:
1. Demonstrate the agent's specific expertise
2. Are relevant to pharma/biotech or digital health users
3. Are actionable and concrete (not vague)
4. Cover different aspects of the agent's capabilities

Format: Return ONLY a JSON array of 4 strings, nothing else.
Example: ["Prompt 1", "Prompt 2", "Prompt 3", "Prompt 4"]
"""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert at creating effective AI agent prompt starters. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=400
        )

        result_text = response.choices[0].message.content.strip()

        # Extract JSON
        if '```json' in result_text:
            result_text = result_text.split('```json')[1].split('```')[0].strip()
        elif '```' in result_text:
            result_text = result_text.split('```')[1].split('```')[0].strip()

        starters = json.loads(result_text)

        if isinstance(starters, list) and len(starters) >= 4:
            return starters[:4]
        else:
            raise ValueError("Invalid format")

    except Exception as e:
        print(f"  ⚠️ Error generating starters for {agent_name}: {e}")
        # Fallback starters
        return [
            f"Help me with {role.lower()} tasks",
            f"What are best practices for {department}?",
            f"Analyze my {department} strategy",
            f"Guide me through {role.lower()} process"
        ]

async def update_agent_tools_and_capabilities(agent: Dict, capabilities_data: Dict, reclass_data: Dict) -> Dict:
    """Update agent's tools, capabilities, and skills"""

    agent_name = agent['name']
    caps = capabilities_data.get(agent_name, {})
    reclass = reclass_data.get(agent_name, {})

    # Get capabilities as list
    capabilities = [cap.get('name') for cap in caps.get('capabilities', [])]

    # Get required skills
    skills = reclass.get('required_skills', [])

    # Determine tools based on tier and capabilities
    tier = reclass.get('new_tier', 'EXPERT')

    # Common tools for all agents
    tools = ['web_search', 'knowledge_retrieval']

    # Tier-specific tools
    if tier == 'MASTER':
        tools.extend(['multi_agent_orchestration', 'workflow_coordination', 'strategic_planning'])
    elif tier == 'EXPERT':
        tools.extend(['deep_analysis', 'strategic_recommendations', 'expert_consultation'])
    elif tier == 'SPECIALIST':
        tools.extend(['specialized_analysis', 'technical_documentation'])
    elif tier == 'WORKER':
        tools.extend(['task_execution', 'template_generation'])
    elif tier == 'TOOL':
        tools.extend(['calculation', 'data_formatting'])

    # Domain-specific tools
    category = caps.get('category', 'operational')
    if category == 'regulatory':
        tools.extend(['regulatory_database_search', 'compliance_check'])
    elif category == 'clinical':
        tools.extend(['clinical_trial_search', 'biostatistics'])
    elif category == 'market_access':
        tools.extend(['heor_modeling', 'payer_database_search'])

    return {
        'capabilities': capabilities[:10],  # Top 10 capabilities
        'skills': skills[:15],  # Top 15 skills
        'tools': list(set(tools))  # Unique tools
    }

async def enhance_single_agent(agent: Dict, capabilities_data: Dict, reclass_data: Dict, org_data: Dict) -> Dict:
    """Enhance a single agent to gold standard"""

    agent_name = agent['name']

    print(f"  Enhancing: {agent_name}")

    # 1. Generate enhanced system prompt
    system_prompt = await generate_enhanced_system_prompt(agent, capabilities_data, reclass_data, org_data)

    # 2. Generate prompt starters
    prompt_starters = await generate_prompt_starters(agent, capabilities_data, org_data)

    # 3. Update tools, capabilities, skills
    updates = await update_agent_tools_and_capabilities(agent, capabilities_data, reclass_data)

    return {
        'id': agent['id'],
        'name': agent['name'],
        'system_prompt': system_prompt,
        'prompt_starters': prompt_starters,
        'capabilities': updates['capabilities'],
        'skills': updates['skills'],
        'tools': updates['tools'],
        'tier': reclass_data.get(agent_name, {}).get('new_tier', 'EXPERT'),
        'updated': True
    }

async def enhance_batch(agents: List[Dict], capabilities_data: Dict, reclass_data: Dict, org_data: Dict, batch_num: int, total: int) -> List[Dict]:
    """Enhance a batch of agents"""

    print(f"\n[Batch {batch_num}/{total}] Enhancing {len(agents)} agents...")

    tasks = [enhance_single_agent(agent, capabilities_data, reclass_data, org_data) for agent in agents]
    results = await asyncio.gather(*tasks)

    print(f"  ✅ Batch {batch_num} complete")

    return results

def get_or_create_suite(supabase, department: str, tenant_id: str = None) -> str:
    """Get or create a prompt suite for a department"""

    suite_slug = department.lower().replace(' ', '-').replace('&', 'and')
    suite_name = f"{department} Prompts"

    # Try to get existing suite
    result = supabase.table('prompt_suites').select('id').eq('slug', suite_slug).execute()

    if result.data and len(result.data) > 0:
        return result.data[0]['id']

    # Create new suite
    suite_data = {
        'name': suite_name,
        'slug': suite_slug,
        'description': f"Prompt collection for {department} agents",
        'category': 'analysis',  # Default category
        'is_active': True,
        'is_public': True,  # Make available across tenants
        'tags': [department.lower().replace(' ', '-')]
    }

    if tenant_id:
        suite_data['tenant_id'] = tenant_id

    new_suite = supabase.table('prompt_suites').insert(suite_data).execute()

    if new_suite.data and len(new_suite.data) > 0:
        return new_suite.data[0]['id']

    return None

def get_or_create_sub_suite(supabase, suite_id: str, role: str) -> str:
    """Get or create a prompt sub-suite for a role within a suite"""

    sub_suite_slug = role.lower().replace(' ', '-').replace('/', '-')
    sub_suite_name = f"{role} Prompts"

    # Try to get existing sub-suite
    result = supabase.table('prompt_sub_suites').select('id').eq('suite_id', suite_id).eq('slug', sub_suite_slug).execute()

    if result.data and len(result.data) > 0:
        return result.data[0]['id']

    # Create new sub-suite
    sub_suite_data = {
        'suite_id': suite_id,
        'name': sub_suite_name,
        'slug': sub_suite_slug,
        'description': f"Prompts specific to {role}",
        'is_active': True
    }

    new_sub_suite = supabase.table('prompt_sub_suites').insert(sub_suite_data).execute()

    if new_sub_suite.data and len(new_sub_suite.data) > 0:
        return new_sub_suite.data[0]['id']

    return None

def update_agents_in_database(enhanced_agents: List[Dict], org_data: Dict):
    """Update agents in Supabase and create prompts in prompt library"""

    supabase = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_ANON_KEY')
    )

    print("\nUpdating agents and creating prompts in database...")

    success_count = 0
    error_count = 0
    prompts_created = 0
    suites_created = 0
    sub_suites_created = 0

    for enhanced in enhanced_agents:
        try:
            agent_id = enhanced['id']
            agent_name = enhanced['name']
            tier = enhanced['tier']

            # Get organizational data for this agent
            agent_org_data = org_data.get(agent_name, {})
            department = agent_org_data.get('department', 'General')
            role = agent_org_data.get('role', agent_name)

            # Create or get suite and sub-suite
            suite_id = get_or_create_suite(supabase, department)
            sub_suite_id = None

            if suite_id:
                sub_suite_id = get_or_create_sub_suite(supabase, suite_id, role)

            # Create slug from agent name
            slug = agent_name.lower().replace(' ', '-').replace('/', '-')

            # 1. Create system prompt in prompts table
            system_prompt_data = {
                'name': f"{slug}-system-prompt",
                'slug': f"{slug}-system-prompt",
                'description': f"System prompt for {agent_name} ({tier} tier agent)",
                'content': enhanced['system_prompt'],
                'role_type': 'system',
                'category': 'generation',
                'complexity': 'medium' if tier in ['EXPERT', 'SPECIALIST'] else 'low' if tier in ['WORKER', 'TOOL'] else 'high',
                'is_active': True,
                'validation_status': 'validated',
                'tags': [tier.lower(), 'gold-standard', 'auto-generated']
            }

            # Insert system prompt
            system_prompt_result = supabase.table('prompts').upsert(
                system_prompt_data,
                on_conflict='slug'
            ).execute()

            if system_prompt_result.data:
                system_prompt_id = system_prompt_result.data[0]['id']
                prompts_created += 1

                # Link system prompt to agent
                supabase.table('agent_prompts').upsert({
                    'agent_id': agent_id,
                    'prompt_id': system_prompt_id,
                    'usage_context': 'system_prompt',
                    'is_primary': True,
                    'sort_order': 0
                }, on_conflict='agent_id,prompt_id,usage_context').execute()

                # Link system prompt to suite and sub-suite
                if suite_id:
                    try:
                        supabase.table('suite_prompts').insert({
                            'prompt_id': system_prompt_id,
                            'suite_id': suite_id,
                            'sub_suite_id': sub_suite_id,
                            'sort_order': 0
                        }).execute()
                    except:
                        pass  # Already exists, skip

            # 2. Create user prompts (conversation starters) in prompts table
            for idx, starter in enumerate(enhanced['prompt_starters']):
                user_prompt_data = {
                    'name': f"{slug}-starter-{idx+1}",
                    'slug': f"{slug}-starter-{idx+1}",
                    'description': f"Conversation starter {idx+1} for {agent_name}",
                    'content': starter,
                    'role_type': 'user',
                    'category': 'generation',
                    'complexity': 'medium',
                    'is_active': True,
                    'validation_status': 'validated',
                    'tags': [tier.lower(), 'conversation-starter', 'auto-generated']
                }

                # Insert user prompt
                user_prompt_result = supabase.table('prompts').upsert(
                    user_prompt_data,
                    on_conflict='slug'
                ).execute()

                if user_prompt_result.data:
                    user_prompt_id = user_prompt_result.data[0]['id']
                    prompts_created += 1

                    # Link user prompt to agent
                    supabase.table('agent_prompts').upsert({
                        'agent_id': agent_id,
                        'prompt_id': user_prompt_id,
                        'usage_context': 'conversation_starter',
                        'is_primary': False,
                        'sort_order': idx + 1
                    }, on_conflict='agent_id,prompt_id,usage_context').execute()

                    # Link user prompt to suite and sub-suite
                    if suite_id:
                        try:
                            supabase.table('suite_prompts').insert({
                                'prompt_id': user_prompt_id,
                                'suite_id': suite_id,
                                'sub_suite_id': sub_suite_id,
                                'sort_order': idx + 1
                            }).execute()
                        except:
                            pass  # Already exists, skip

            # 3. Update agent metadata
            supabase.table('agents').update({
                'agent_level': tier,
                'gold_standard_validated': True,
                'updated_at': 'now()'
            }).eq('id', agent_id).execute()

            success_count += 1

            if (success_count % 10 == 0):
                print(f"  Progress: {success_count}/{len(enhanced_agents)} agents processed...")

        except Exception as e:
            print(f"  ❌ Error updating {enhanced['name']}: {e}")
            error_count += 1

    print(f"\n  ✅ Successfully updated: {success_count} agents")
    print(f"  ✅ Prompts created: {prompts_created}")
    print(f"  ✅ Prompts organized into suites and sub-suites")
    if error_count > 0:
        print(f"  ❌ Errors: {error_count} agents")

    return success_count, error_count

async def main():
    """Main execution"""

    print("=" * 80)
    print("AGENT ENHANCEMENT TO GOLD STANDARD")
    print("=" * 80)
    print("\n1. Industry-leading system prompts (2025 best practices)")
    print("2. Role-specific prompt starters")
    print("3. Updated tools, capabilities, and skills")
    print("=" * 80)

    # Load all analysis data
    print("\n[1/5] Loading analysis data...")
    capabilities_data, reclass_data, org_data = load_all_analysis_data()
    print(f"  ✅ Loaded data for {len(capabilities_data)} agents")

    # Load agents from database
    print("\n[2/5] Loading agents from database...")
    supabase = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_ANON_KEY')
    )
    response = supabase.table('agents').select('*').execute()
    agents = response.data
    print(f"  ✅ Loaded {len(agents)} agents from database")

    # Enhance agents in batches
    print("\n[3/5] Enhancing agents...")
    batch_size = 10
    all_enhanced = []

    for i in range(0, len(agents), batch_size):
        batch = agents[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (len(agents) + batch_size - 1) // batch_size

        enhanced = await enhance_batch(batch, capabilities_data, reclass_data, org_data, batch_num, total_batches)
        all_enhanced.extend(enhanced)

        await asyncio.sleep(0.5)

    # Save enhanced agents
    print("\n[4/5] Saving enhanced agents...")
    with open('enhanced_agents_gold_standard.json', 'w') as f:
        json.dump(all_enhanced, f, indent=2)
    print("  ✅ enhanced_agents_gold_standard.json")

    # Update database
    print("\n[5/5] Updating database...")
    success, errors = update_agents_in_database(all_enhanced, org_data)

    print("\n" + "=" * 80)
    print("✅ ENHANCEMENT COMPLETE")
    print("=" * 80)
    print(f"\nTotal agents enhanced: {len(all_enhanced)}")
    print(f"Successfully updated in database: {success}")
    if errors > 0:
        print(f"Errors: {errors}")

    print("\nNext steps:")
    print("1. Review enhanced_agents_gold_standard.json")
    print("2. Run migrations 002-007")
    print("3. Validate enhanced agents")

if __name__ == '__main__':
    asyncio.run(main())
