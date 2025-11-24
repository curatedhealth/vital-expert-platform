#!/usr/bin/env python3
"""
Analyze 319 Existing Agents and Generate Capabilities Registry

This script:
1. Fetches all 319 agents from Supabase
2. Analyzes their names, descriptions, and system prompts
3. Extracts capabilities using GPT-4
4. Maps capabilities to existing skills
5. Identifies skill gaps for Phase 2 development
6. Generates SQL to populate capabilities registry
"""

import os
import sys
import json
from datetime import datetime
from typing import Dict, List, Set, Tuple
from collections import defaultdict
from dotenv import load_dotenv
from supabase import create_client
from openai import AsyncOpenAI
import asyncio
import re

# Load environment
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, OPENAI_API_KEY]):
    print("❌ Missing required environment variables")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

# ============================================================================
# STEP 1: Fetch All Agents
# ============================================================================

def fetch_all_agents() -> List[Dict]:
    """Fetch all 319 agents from Supabase"""
    print("\n" + "="*80)
    print("STEP 1: Fetching All Agents from Database")
    print("="*80)

    response = supabase.table("agents").select("*").execute()
    agents = response.data

    print(f"✅ Fetched {len(agents)} agents")
    return agents

# ============================================================================
# STEP 2: Extract Capabilities Using GPT-4
# ============================================================================

async def extract_agent_capabilities(agent: Dict) -> Dict:
    """
    Use GPT-4 to analyze agent and extract:
    - Primary capabilities (what this agent can do)
    - Required skills (what skills would enable these capabilities)
    - Category (regulatory, clinical, market_access, technical_cmc, strategic, operational)
    """

    prompt = f"""Analyze this expert agent and extract its capabilities.

Agent Name: {agent['name']}
Description: {agent.get('description', 'N/A')}
Title: {agent.get('title', 'N/A')}
Role: {agent.get('role_id', 'N/A')}
System Prompt Preview: {agent.get('system_prompt', 'N/A')[:500]}

Based on this agent's focus, identify:

1. PRIMARY CAPABILITIES (2-4 specific things this agent can do)
   - Use snake_case format
   - Be specific to pharmaceutical/medical device regulatory domain
   - Examples: fda_510k_submission, clinical_endpoint_selection, hta_value_dossier

2. CATEGORY (pick ONE):
   - regulatory (FDA, EMA, PMDA, global regulatory affairs)
   - clinical (clinical trials, endpoints, safety, biostatistics)
   - market_access (HTA, HEOR, pricing, reimbursement, payer)
   - technical_cmc (CMC, manufacturing, quality, analytical)
   - strategic (portfolio, competitive intel, business development)
   - operational (project management, coordination, planning)
   - analytical (data analysis, statistics, modeling)
   - communication (writing, presentations, stakeholder management)

3. COMPLEXITY LEVEL:
   - basic (entry-level, simple tasks)
   - intermediate (requires experience)
   - advanced (requires deep expertise)
   - expert (requires mastery and orchestration)

4. REQUIRED SKILLS (2-5 Claude Code skills that would enable these capabilities)
   - Think about what tools/functions this agent would need
   - Examples: regulatory_database_search, generate_submission_template, clinical_trial_lookup

Return ONLY valid JSON with this structure:
{{
  "capabilities": [
    {{
      "name": "capability_name_snake_case",
      "display_name": "Human Readable Name",
      "description": "Brief description",
      "complexity": "basic|intermediate|advanced|expert"
    }}
  ],
  "category": "regulatory|clinical|market_access|technical_cmc|strategic|operational|analytical|communication",
  "required_skills": ["skill_name_1", "skill_name_2"]
}}"""

    try:
        response = await openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=800
        )

        result_text = response.choices[0].message.content.strip()

        # Extract JSON from markdown code blocks if present
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()

        result = json.loads(result_text)

        return {
            "agent_id": agent["id"],
            "agent_name": agent["name"],
            "capabilities": result.get("capabilities", []),
            "category": result.get("category", "operational"),
            "required_skills": result.get("required_skills", [])
        }

    except Exception as e:
        print(f"⚠️  Error analyzing {agent['name']}: {e}")
        return {
            "agent_id": agent["id"],
            "agent_name": agent["name"],
            "capabilities": [],
            "category": "operational",
            "required_skills": []
        }

async def analyze_all_agents(agents: List[Dict], batch_size: int = 5) -> List[Dict]:
    """Analyze all agents in batches"""
    print("\n" + "="*80)
    print("STEP 2: Extracting Capabilities Using GPT-4")
    print("="*80)

    all_results = []
    total = len(agents)

    for i in range(0, total, batch_size):
        batch = agents[i:i+batch_size]
        batch_num = i // batch_size + 1
        total_batches = (total + batch_size - 1) // batch_size

        print(f"\n[Batch {batch_num}/{total_batches}] Processing {len(batch)} agents...")

        tasks = [extract_agent_capabilities(agent) for agent in batch]
        results = await asyncio.gather(*tasks)

        all_results.extend(results)

        # Show progress
        for result in results:
            cap_count = len(result["capabilities"])
            skill_count = len(result["required_skills"])
            print(f"  ✅ {result['agent_name']}: {cap_count} capabilities, {skill_count} skills")

        # Rate limiting
        if i + batch_size < total:
            await asyncio.sleep(2)

    print(f"\n✅ Analyzed {len(all_results)} agents")
    return all_results

# ============================================================================
# STEP 3: Aggregate and Deduplicate Capabilities
# ============================================================================

def aggregate_capabilities(analysis_results: List[Dict]) -> Dict:
    """
    Aggregate all capabilities across agents
    Deduplicate and count frequency
    """
    print("\n" + "="*80)
    print("STEP 3: Aggregating and Deduplicating Capabilities")
    print("="*80)

    capability_registry = {}
    capability_to_agents = defaultdict(list)
    category_counts = defaultdict(int)
    skill_demand = defaultdict(int)

    for result in analysis_results:
        category_counts[result["category"]] += 1

        for cap in result["capabilities"]:
            cap_name = cap["name"]

            if cap_name not in capability_registry:
                capability_registry[cap_name] = {
                    "name": cap_name,
                    "display_name": cap.get("display_name", cap_name.replace("_", " ").title()),
                    "description": cap.get("description", ""),
                    "category": result["category"],
                    "complexity": cap.get("complexity", "intermediate"),
                    "agent_count": 0,
                    "agents": []
                }

            capability_registry[cap_name]["agent_count"] += 1
            capability_registry[cap_name]["agents"].append(result["agent_name"])
            capability_to_agents[cap_name].append(result["agent_id"])

        for skill in result["required_skills"]:
            skill_demand[skill] += 1

    print(f"\n✅ Found {len(capability_registry)} unique capabilities")
    print(f"\n📊 Category Distribution:")
    for category, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"   {category}: {count} agents")

    print(f"\n🔥 Top 10 Most Common Capabilities:")
    sorted_caps = sorted(capability_registry.items(), key=lambda x: x[1]["agent_count"], reverse=True)
    for cap_name, cap_data in sorted_caps[:10]:
        print(f"   {cap_name}: {cap_data['agent_count']} agents")

    print(f"\n🔥 Top 10 Most Demanded Skills:")
    sorted_skills = sorted(skill_demand.items(), key=lambda x: x[1], reverse=True)
    for skill_name, count in sorted_skills[:10]:
        print(f"   {skill_name}: {count} agents need it")

    return {
        "capabilities": capability_registry,
        "capability_to_agents": capability_to_agents,
        "category_counts": category_counts,
        "skill_demand": skill_demand
    }

# ============================================================================
# STEP 4: Map Capabilities to Existing Skills
# ============================================================================

def fetch_existing_skills() -> Dict[str, str]:
    """Fetch existing skills from database"""
    response = supabase.table("skills").select("skill_name, skill_slug, id").execute()
    skills = {}
    for skill in response.data:
        skills[skill["skill_slug"]] = skill["id"]
        skills[skill["skill_name"]] = skill["id"]
    return skills

def map_capabilities_to_skills(aggregated: Dict, existing_skills: Dict) -> Dict:
    """Map capabilities to existing skills and identify gaps"""
    print("\n" + "="*80)
    print("STEP 4: Mapping Capabilities to Existing Skills")
    print("="*80)

    skill_demand = aggregated["skill_demand"]

    existing_skill_names = set(existing_skills.keys())
    demanded_skill_names = set(skill_demand.keys())

    # Find matches (normalize to slug format for comparison)
    def normalize(name):
        return name.lower().replace("_", "-")

    existing_normalized = {normalize(s): s for s in existing_skill_names}
    demanded_normalized = {normalize(s): s for s in demanded_skill_names}

    matched_skills = {}
    missing_skills = {}

    for norm_skill, orig_skill in demanded_normalized.items():
        if norm_skill in existing_normalized:
            matched_skills[orig_skill] = {
                "exists": True,
                "demand_count": skill_demand[orig_skill],
                "skill_id": existing_skills.get(existing_normalized[norm_skill])
            }
        else:
            missing_skills[orig_skill] = {
                "exists": False,
                "demand_count": skill_demand[orig_skill],
                "priority": "high" if skill_demand[orig_skill] > 10 else "medium" if skill_demand[orig_skill] > 5 else "low"
            }

    print(f"\n✅ Skills Analysis:")
    print(f"   Total Skills Demanded: {len(demanded_skill_names)}")
    print(f"   ✅ Already Exist: {len(matched_skills)}")
    print(f"   ❌ Missing (Need Development): {len(missing_skills)}")

    if missing_skills:
        print(f"\n⚠️  MISSING SKILLS - Phase 2 Development Priorities:")
        sorted_missing = sorted(missing_skills.items(), key=lambda x: x[1]["demand_count"], reverse=True)
        for skill_name, data in sorted_missing[:20]:
            print(f"   [{data['priority'].upper()}] {skill_name}: needed by {data['demand_count']} agents")

    return {
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    }

# ============================================================================
# STEP 5: Generate SQL for Capabilities Registry
# ============================================================================

def generate_capabilities_sql(aggregated: Dict, output_file: str):
    """Generate SQL to populate capabilities table"""
    print("\n" + "="*80)
    print("STEP 5: Generating SQL for Capabilities Registry")
    print("="*80)

    capabilities = aggregated["capabilities"]

    sql_lines = []
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- Auto-Generated Capabilities Registry from 319 Existing Agents")
    sql_lines.append(f"-- Generated: {datetime.now().isoformat()}")
    sql_lines.append(f"-- Total Capabilities: {len(capabilities)}")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("")
    sql_lines.append("BEGIN;")
    sql_lines.append("")

    # Group by category
    by_category = defaultdict(list)
    for cap_name, cap_data in capabilities.items():
        by_category[cap_data["category"]].append((cap_name, cap_data))

    for category, caps in sorted(by_category.items()):
        sql_lines.append(f"-- {category.upper()} CAPABILITIES ({len(caps)} capabilities)")
        sql_lines.append("")

        for cap_name, cap_data in sorted(caps, key=lambda x: x[1]["agent_count"], reverse=True):
            # Escape single quotes
            display_name = cap_data["display_name"].replace("'", "''")
            description = cap_data["description"].replace("'", "''")
            cap_slug = cap_name.replace("_", "-")

            sql_lines.append(f"INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level) VALUES")
            sql_lines.append(f"('{cap_name}', '{cap_slug}', '{display_name}', '{description}', '{cap_data['category']}', '{cap_data['complexity']}')")
            sql_lines.append(f"ON CONFLICT (capability_name) DO NOTHING;")
            sql_lines.append(f"-- Used by {cap_data['agent_count']} agents: {', '.join(cap_data['agents'][:3])}{'...' if len(cap_data['agents']) > 3 else ''}")
            sql_lines.append("")

    sql_lines.append("COMMIT;")

    sql_content = "\n".join(sql_lines)

    with open(output_file, 'w') as f:
        f.write(sql_content)

    print(f"✅ Generated SQL: {output_file}")

# ============================================================================
# STEP 6: Generate Phase 2 Skills Development Plan
# ============================================================================

def generate_phase2_plan(skill_mapping: Dict, output_file: str):
    """Generate Phase 2 skills development plan"""
    print("\n" + "="*80)
    print("STEP 6: Generating Phase 2 Skills Development Plan")
    print("="*80)

    missing_skills = skill_mapping["missing_skills"]

    # Group by priority
    high_priority = []
    medium_priority = []
    low_priority = []

    for skill_name, data in missing_skills.items():
        if data["priority"] == "high":
            high_priority.append((skill_name, data["demand_count"]))
        elif data["priority"] == "medium":
            medium_priority.append((skill_name, data["demand_count"]))
        else:
            low_priority.append((skill_name, data["demand_count"]))

    # Sort by demand
    high_priority.sort(key=lambda x: x[1], reverse=True)
    medium_priority.sort(key=lambda x: x[1], reverse=True)
    low_priority.sort(key=lambda x: x[1], reverse=True)

    md_lines = []
    md_lines.append("# Phase 2 Skills Development Plan")
    md_lines.append("")
    md_lines.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    md_lines.append(f"**Based On:** Analysis of 319 existing agents")
    md_lines.append("")
    md_lines.append("---")
    md_lines.append("")
    md_lines.append("## Executive Summary")
    md_lines.append("")
    md_lines.append(f"- **Total Missing Skills:** {len(missing_skills)}")
    md_lines.append(f"- **High Priority (>10 agents need):** {len(high_priority)}")
    md_lines.append(f"- **Medium Priority (5-10 agents need):** {len(medium_priority)}")
    md_lines.append(f"- **Low Priority (<5 agents need):** {len(low_priority)}")
    md_lines.append("")
    md_lines.append("---")
    md_lines.append("")

    if high_priority:
        md_lines.append("## High Priority Skills (Develop First)")
        md_lines.append("")
        md_lines.append("| Skill Name | Agents Needing It | Recommended Category | Notes |")
        md_lines.append("|------------|-------------------|---------------------|-------|")
        for skill_name, count in high_priority:
            category = categorize_skill(skill_name)
            notes = suggest_implementation(skill_name)
            md_lines.append(f"| `{skill_name}` | {count} | {category} | {notes} |")
        md_lines.append("")

    if medium_priority:
        md_lines.append("## Medium Priority Skills")
        md_lines.append("")
        md_lines.append("| Skill Name | Agents Needing It | Recommended Category |")
        md_lines.append("|------------|-------------------|---------------------|")
        for skill_name, count in medium_priority:
            category = categorize_skill(skill_name)
            md_lines.append(f"| `{skill_name}` | {count} | {category} |")
        md_lines.append("")

    if low_priority:
        md_lines.append("## Low Priority Skills (Future Consideration)")
        md_lines.append("")
        md_lines.append("<details>")
        md_lines.append("<summary>Click to expand low priority skills</summary>")
        md_lines.append("")
        md_lines.append("| Skill Name | Agents Needing It |")
        md_lines.append("|------------|-------------------|")
        for skill_name, count in low_priority:
            md_lines.append(f"| `{skill_name}` | {count} |")
        md_lines.append("")
        md_lines.append("</details>")
        md_lines.append("")

    md_lines.append("---")
    md_lines.append("")
    md_lines.append("## Implementation Roadmap")
    md_lines.append("")
    md_lines.append("### Week 1-2: Core Infrastructure Skills")
    md_lines.append("Focus on skills needed by 15+ agents")
    md_lines.append("")
    md_lines.append("### Week 3-4: Domain-Specific Skills")
    md_lines.append("Focus on regulatory, clinical, market access specific skills")
    md_lines.append("")
    md_lines.append("### Week 5-6: Enhancement & Testing Skills")
    md_lines.append("Focus on quality, validation, and support skills")
    md_lines.append("")

    md_content = "\n".join(md_lines)

    with open(output_file, 'w') as f:
        f.write(md_content)

    print(f"✅ Generated Phase 2 Plan: {output_file}")

def categorize_skill(skill_name: str) -> str:
    """Suggest category for a skill based on name"""
    name_lower = skill_name.lower()

    if any(x in name_lower for x in ['search', 'lookup', 'database', 'query', 'retrieve']):
        return 'data_retrieval'
    elif any(x in name_lower for x in ['generate', 'create', 'build', 'template']):
        return 'generation'
    elif any(x in name_lower for x in ['analyze', 'assessment', 'evaluation']):
        return 'analysis'
    elif any(x in name_lower for x in ['validate', 'check', 'verify', 'compliance']):
        return 'validation'
    elif any(x in name_lower for x in ['plan', 'strategy', 'orchestrat']):
        return 'planning'
    else:
        return 'execution'

def suggest_implementation(skill_name: str) -> str:
    """Suggest implementation approach"""
    name_lower = skill_name.lower()

    if 'database' in name_lower or 'search' in name_lower:
        return 'API integration + caching'
    elif 'generate' in name_lower or 'template' in name_lower:
        return 'Template library + GPT-4'
    elif 'analyze' in name_lower or 'assess' in name_lower:
        return 'GPT-4 analysis + structured output'
    else:
        return 'Custom function'

# ============================================================================
# MAIN EXECUTION
# ============================================================================

async def main():
    print("\n" + "="*80)
    print("AGENT CAPABILITIES REGISTRY GENERATOR")
    print("="*80)
    print("\nThis script will:")
    print("1. Fetch all 319 agents from database")
    print("2. Extract capabilities using GPT-4")
    print("3. Aggregate and deduplicate capabilities")
    print("4. Map capabilities to existing skills")
    print("5. Generate SQL for capabilities registry")
    print("6. Generate Phase 2 skills development plan")

    # Step 1: Fetch agents
    agents = fetch_all_agents()

    # Step 2: Analyze agents (extract capabilities)
    analysis_results = await analyze_all_agents(agents, batch_size=5)

    # Save intermediate results
    with open("agent_capabilities_analysis.json", "w") as f:
        json.dump(analysis_results, f, indent=2)
    print(f"\n💾 Saved analysis results to agent_capabilities_analysis.json")

    # Step 3: Aggregate capabilities
    aggregated = aggregate_capabilities(analysis_results)

    # Step 4: Map to existing skills
    existing_skills = fetch_existing_skills()
    print(f"\n📚 Found {len(existing_skills)} existing skills in database")

    skill_mapping = map_capabilities_to_skills(aggregated, existing_skills)

    # Step 5: Generate SQL
    generate_capabilities_sql(
        aggregated,
        "supabase/migrations/005_seed_agent_capabilities_registry.sql"
    )

    # Step 6: Generate Phase 2 plan
    generate_phase2_plan(
        skill_mapping,
        "PHASE_2_SKILLS_DEVELOPMENT_PLAN.md"
    )

    print("\n" + "="*80)
    print("✅ ANALYSIS COMPLETE")
    print("="*80)
    print("\nGenerated Files:")
    print("  1. agent_capabilities_analysis.json - Raw analysis data")
    print("  2. supabase/migrations/005_seed_agent_capabilities_registry.sql - SQL to populate capabilities")
    print("  3. PHASE_2_SKILLS_DEVELOPMENT_PLAN.md - Skills development roadmap")
    print("\nNext Steps:")
    print("  1. Review the capabilities registry SQL")
    print("  2. Review Phase 2 skills development plan")
    print("  3. Run migration 005 to populate capabilities table")
    print("  4. Begin Phase 2 skill development based on priority")

if __name__ == "__main__":
    asyncio.run(main())
