#!/usr/bin/env python3
"""
Generate SQL migration and Phase 2 plan from capabilities analysis
"""

import json
import os
from collections import defaultdict
from typing import Dict, List, Set, Tuple

def load_analysis() -> List[Dict]:
    """Load agent capabilities analysis"""
    with open('agent_capabilities_analysis.json', 'r') as f:
        return json.load(f)

def aggregate_capabilities(agents_data: List[Dict]) -> Dict[str, Dict]:
    """
    Aggregate capabilities across all agents with usage counts
    Returns: {capability_name: {metadata, agents_using: [list], count: int}}
    """
    capabilities_registry = {}

    for agent in agents_data:
        agent_name = agent['agent_name']

        for cap in agent.get('capabilities', []):
            cap_name = cap.get('name', '')
            if not cap_name:
                continue

            if cap_name not in capabilities_registry:
                capabilities_registry[cap_name] = {
                    'name': cap_name,
                    'display_name': cap.get('display_name', cap_name.replace('_', ' ').title()),
                    'description': cap.get('description', ''),
                    'category': agent.get('category', 'operational'),
                    'complexity': cap.get('complexity', 'intermediate'),
                    'agents_using': [],
                    'count': 0
                }

            capabilities_registry[cap_name]['agents_using'].append(agent_name)
            capabilities_registry[cap_name]['count'] += 1

    return capabilities_registry

def aggregate_skills(agents_data: List[Dict]) -> Dict[str, Dict]:
    """
    Aggregate skill requirements with demand count
    Returns: {skill_name: {agents_needing: [list], count: int, categories: set}}
    """
    skills_demand = {}

    for agent in agents_data:
        agent_name = agent['agent_name']
        category = agent.get('category', 'operational')

        for skill in agent.get('required_skills', []):
            if not skill:
                continue

            if skill not in skills_demand:
                skills_demand[skill] = {
                    'name': skill,
                    'agents_needing': [],
                    'count': 0,
                    'categories': set()
                }

            if agent_name not in skills_demand[skill]['agents_needing']:
                skills_demand[skill]['agents_needing'].append(agent_name)
                skills_demand[skill]['count'] += 1
                skills_demand[skill]['categories'].add(category)

    return skills_demand

def load_existing_skills() -> Set[str]:
    """Load existing skills from migrations 003 and 004"""
    existing_skills = set()

    # Skills from official Anthropic + VITAL custom (migration 003)
    migration_003_skills = [
        'creative_writing', 'narrative_writing', 'technical_writing', 'copywriting',
        'editing_proofreading', 'summarization', 'idea_generation', 'poetry',
        'web_development', 'api_development', 'code_review', 'debugging',
        'testing', 'documentation', 'refactoring', 'analysis', 'research',
        'brainstorming', 'planning', 'problem_solving', 'decision_making',
        'fda_510k_submission', 'fda_pma_submission', 'fda_de_novo_submission',
        'ema_submission', 'pmda_submission', 'ich_guideline_interpretation',
        'regulatory_pathway_selection', 'clinical_trial_design', 'statistical_analysis',
        'endpoint_selection', 'protocol_development', 'biostatistics',
        'hta_submission', 'heor_modeling', 'budget_impact_analysis',
        'comparative_effectiveness', 'pricing_strategy', 'market_access_strategy',
        'cmc_development', 'analytical_methods', 'process_validation',
        'stability_testing', 'quality_control', 'gmp_compliance',
        'competitive_intelligence', 'portfolio_management', 'strategic_planning',
        'stakeholder_engagement', 'medical_writing', 'publication_planning'
    ]

    # Skills from community (migration 004)
    migration_004_skills = [
        'ai_architecture', 'prompt_engineering', 'ai_optimization',
        'market_research', 'brand_strategy', 'campaign_planning', 'content_marketing',
        'seo_optimization', 'email_marketing', 'social_media', 'analytics_reporting',
        'competitive_analysis', 'customer_segmentation', 'ab_testing', 'conversion_optimization',
        'strategic_planning', 'business_modeling', 'financial_analysis', 'risk_assessment',
        'stakeholder_management', 'change_management', 'executive_communication',
        'product_roadmap', 'user_research', 'feature_prioritization', 'agile_methodology',
        'product_analytics', 'go_to_market', 'pricing_strategy', 'competitive_positioning',
        'system_design', 'code_architecture', 'performance_optimization', 'security_analysis',
        'api_design', 'database_design', 'devops', 'cloud_architecture',
        'test_strategy', 'test_automation', 'performance_testing', 'security_testing',
        'qa_process', 'bug_triage', 'regression_testing',
        'hypothesis_testing', 'experimental_design', 'data_collection', 'literature_review',
        'peer_review', 'grant_writing', 'research_ethics', 'scientific_communication',
        'data_privacy', 'gdpr_compliance', 'contract_review', 'regulatory_compliance',
        'legal_research', 'risk_mitigation', 'policy_development',
        'curriculum_design', 'instructional_design', 'assessment_creation', 'learning_analytics'
    ]

    existing_skills.update(migration_003_skills)
    existing_skills.update(migration_004_skills)

    return existing_skills

def identify_skill_gaps(skills_demand: Dict[str, Dict], existing_skills: Set[str]) -> Tuple[List[Dict], List[Dict]]:
    """
    Identify which skills exist vs need development
    Returns: (existing_skills_list, missing_skills_list)
    """
    existing = []
    missing = []

    for skill_name, skill_data in skills_demand.items():
        skill_info = {
            'name': skill_name,
            'count': skill_data['count'],
            'agents': skill_data['agents_needing'][:5],  # First 5 for brevity
            'categories': list(skill_data['categories'])
        }

        if skill_name.lower() in existing_skills or skill_name in existing_skills:
            existing.append(skill_info)
        else:
            missing.append(skill_info)

    # Sort by demand
    existing.sort(key=lambda x: x['count'], reverse=True)
    missing.sort(key=lambda x: x['count'], reverse=True)

    return existing, missing

def generate_sql_migration(capabilities_registry: Dict[str, Dict]) -> str:
    """Generate SQL migration for capabilities registry"""

    # Group by category
    by_category = defaultdict(list)
    for cap_name, cap_data in capabilities_registry.items():
        by_category[cap_data['category']].append((cap_name, cap_data))

    # Sort categories
    category_order = ['regulatory', 'clinical', 'market_access', 'technical_cmc',
                      'strategic', 'operational', 'analytical', 'communication']

    sql = """-- ============================================================================
-- Migration 005: Seed Agent Capabilities Registry
-- ============================================================================
-- Generated from analysis of 319 existing agents
-- Total capabilities: {}
-- Categories: {}
--
-- This migration populates the capabilities table with capabilities extracted
-- from actual agent usage patterns rather than predefined templates.
-- ============================================================================

BEGIN;

""".format(
        len(capabilities_registry),
        ', '.join(category_order)
    )

    for category in category_order:
        if category not in by_category:
            continue

        caps = by_category[category]
        caps.sort(key=lambda x: x[1]['count'], reverse=True)  # Sort by usage count

        sql += f"\n-- ============================================================================\n"
        sql += f"-- {category.upper().replace('_', ' ')} CAPABILITIES ({len(caps)} capabilities)\n"
        sql += f"-- ============================================================================\n\n"

        for cap_name, cap_data in caps:
            # Escape single quotes
            description = cap_data['description'].replace("'", "''")
            display_name = cap_data['display_name'].replace("'", "''")
            slug = cap_name.replace('_', '-')

            sql += f"-- Used by {cap_data['count']} agents: {', '.join(cap_data['agents_using'][:3])}"
            if cap_data['count'] > 3:
                sql += f", ... (+{cap_data['count'] - 3} more)"
            sql += "\n"

            sql += f"""INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('{cap_name}', '{slug}', '{display_name}', '{description}', '{category}', '{cap_data['complexity']}', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

"""

    sql += "\nCOMMIT;\n"

    return sql

def generate_phase2_plan(missing_skills: List[Dict], existing_skills: List[Dict]) -> str:
    """Generate Phase 2 skills development plan"""

    # Categorize by priority
    high_priority = [s for s in missing_skills if s['count'] >= 10]
    medium_priority = [s for s in missing_skills if 5 <= s['count'] < 10]
    low_priority = [s for s in missing_skills if s['count'] < 5]

    plan = f"""# Phase 2: Skills Development Plan

**Generated:** {json.dumps({"date": "2025-11-17"})}
**Based on:** Analysis of 319 agents
**Total Skills Required:** {len(missing_skills) + len(existing_skills)}
**Existing Skills:** {len(existing_skills)}
**Missing Skills:** {len(missing_skills)}

---

## Executive Summary

The capabilities analysis of all 319 agents revealed:

- ✅ **{len(existing_skills)} skills already available** in our library
- ❌ **{len(missing_skills)} skills need development** in Phase 2
  - 🔴 **High Priority ({len(high_priority)}):** Required by 10+ agents
  - 🟡 **Medium Priority ({len(medium_priority)}):** Required by 5-9 agents
  - 🟢 **Low Priority ({len(low_priority)}):** Required by 1-4 agents

**Development Recommendation:**
1. Focus on High Priority skills first (weeks 3-6)
2. Medium Priority skills second (weeks 7-10)
3. Low Priority skills as needed (weeks 11+)

---

## High Priority Skills (Required by 10+ Agents)

These skills are critical infrastructure needed by many agents:

| Skill Name | Agents Needing | Categories | Example Agents |
|------------|----------------|------------|----------------|
"""

    for skill in high_priority:
        categories_str = ', '.join(skill['categories'][:3])
        agents_str = ', '.join(skill['agents'][:2])
        plan += f"| `{skill['name']}` | {skill['count']} | {categories_str} | {agents_str} |\n"

    plan += f"""
**Total High Priority Skills:** {len(high_priority)}

---

## Medium Priority Skills (Required by 5-9 Agents)

These skills support important specialized capabilities:

| Skill Name | Agents Needing | Categories | Example Agents |
|------------|----------------|------------|----------------|
"""

    for skill in medium_priority:
        categories_str = ', '.join(skill['categories'][:2])
        agents_str = ', '.join(skill['agents'][:2])
        plan += f"| `{skill['name']}` | {skill['count']} | {categories_str} | {agents_str} |\n"

    plan += f"""
**Total Medium Priority Skills:** {len(medium_priority)}

---

## Low Priority Skills (Required by 1-4 Agents)

<details>
<summary>Click to expand {len(low_priority)} low priority skills</summary>

| Skill Name | Agents Needing | Categories |
|------------|----------------|------------|
"""

    for skill in low_priority:
        categories_str = ', '.join(skill['categories'][:2])
        plan += f"| `{skill['name']}` | {skill['count']} | {categories_str} |\n"

    plan += """
</details>

---

## Existing Skills (High Usage)

These skills are already available and heavily used:

| Skill Name | Agents Using | Categories |
|------------|--------------|------------|
"""

    for skill in existing_skills[:20]:  # Top 20
        categories_str = ', '.join(skill['categories'][:3])
        plan += f"| `{skill['name']}` | {skill['count']} | {categories_str} |\n"

    plan += f"""
**Total Existing Skills in Use:** {len(existing_skills)}

---

## Implementation Roadmap

### Week 3-4: Critical Infrastructure Skills

Develop the top 5 highest-demand missing skills:
"""

    for i, skill in enumerate(high_priority[:5], 1):
        plan += f"{i}. `{skill['name']}` ({skill['count']} agents)\n"

    plan += f"""
### Week 5-6: High Priority Domain Skills

Develop next {min(10, len(high_priority) - 5)} high-priority skills focusing on regulatory and clinical domains.

### Week 7-8: Medium Priority Skills

Develop medium-priority skills for specialized capabilities.

### Week 9-10: Integration & Testing

- Link skills to capabilities via `capability_skills` table
- Link agents to skills via `agent_skills` table
- Test agent performance with new skills
- Validate gold standard compliance

### Week 11+: Low Priority & Maintenance

- Develop low-priority skills as needed
- Monitor skill usage patterns
- Refine existing skills based on feedback

---

## Skill Development Guidelines

For each missing skill to develop:

1. **Research:** Understand what the skill needs to do (review agents using it)
2. **Design:** Create skill specification (inputs, outputs, behavior)
3. **Implement:** Write skill in `.claude/skills/` directory
4. **Test:** Validate with agents that require it
5. **Document:** Add to skills table via migration
6. **Link:** Create `capability_skills` records for capabilities it enables

---

## Success Metrics

Phase 2 is successful when:

- ✅ All high-priority skills developed and tested
- ✅ 80%+ of medium-priority skills developed
- ✅ Skills properly linked to capabilities
- ✅ Agents can access required skills via capability mapping
- ✅ Gold standard agents validated with full skill support

---

**Next Steps:**
1. Review this plan with stakeholders
2. Prioritize which high-priority skills to develop first
3. Assign development resources
4. Begin skill development in `.claude/skills/`
5. Update migrations to add new skills to `skills` table
"""

    return plan

def main():
    """Main execution"""
    print("=" * 80)
    print("GENERATING SQL MIGRATION AND PHASE 2 PLAN")
    print("=" * 80)

    # Load analysis
    print("\n[1/5] Loading agent capabilities analysis...")
    agents_data = load_analysis()
    print(f"  ✅ Loaded {len(agents_data)} agents")

    # Aggregate capabilities
    print("\n[2/5] Aggregating capabilities...")
    capabilities_registry = aggregate_capabilities(agents_data)
    print(f"  ✅ {len(capabilities_registry)} unique capabilities")

    # Aggregate skills demand
    print("\n[3/5] Analyzing skill requirements...")
    skills_demand = aggregate_skills(agents_data)
    print(f"  ✅ {len(skills_demand)} unique skills required")

    # Identify gaps
    print("\n[4/5] Identifying skill gaps...")
    existing_skills = load_existing_skills()
    existing_skills_list, missing_skills_list = identify_skill_gaps(skills_demand, existing_skills)
    print(f"  ✅ {len(existing_skills_list)} skills already exist")
    print(f"  ❌ {len(missing_skills_list)} skills need development")
    print(f"     - High priority (10+ agents): {len([s for s in missing_skills_list if s['count'] >= 10])}")
    print(f"     - Medium priority (5-9 agents): {len([s for s in missing_skills_list if 5 <= s['count'] < 10])}")
    print(f"     - Low priority (1-4 agents): {len([s for s in missing_skills_list if s['count'] < 5])}")

    # Generate SQL
    print("\n[5/5] Generating output files...")
    sql_migration = generate_sql_migration(capabilities_registry)
    with open('supabase/migrations/005_seed_agent_capabilities_registry.sql', 'w') as f:
        f.write(sql_migration)
    print("  ✅ supabase/migrations/005_seed_agent_capabilities_registry.sql")

    # Generate Phase 2 plan
    phase2_plan = generate_phase2_plan(missing_skills_list, existing_skills_list)
    with open('PHASE_2_SKILLS_DEVELOPMENT_PLAN.md', 'w') as f:
        f.write(phase2_plan)
    print("  ✅ PHASE_2_SKILLS_DEVELOPMENT_PLAN.md")

    print("\n" + "=" * 80)
    print("✅ GENERATION COMPLETE")
    print("=" * 80)
    print("\nNext steps:")
    print("1. Review generated SQL migration")
    print("2. Review Phase 2 skills development plan")
    print("3. Run migration: python3 scripts/run_migration.py --migration 005")
    print("4. Begin high-priority skill development")

if __name__ == '__main__':
    main()
