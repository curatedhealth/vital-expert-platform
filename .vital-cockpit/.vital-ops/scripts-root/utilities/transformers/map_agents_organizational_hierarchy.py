#!/usr/bin/env python3
"""
Map all agents to organizational hierarchy and update names with tier classification

Organizational Structure:
- DEPARTMENTS → FUNCTIONS → ROLES → AGENTS
- PERSONAS → ROLES → AGENTS

Updates:
- Agent names include tier prefix (Expert, Specialist, Master, Worker, Tool)
- All agents mapped to proper organizational units
"""

import asyncio
import json
import os
from typing import Dict, List, Set
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Pharmaceutical/Biotech Department Structure
DEPARTMENTS = {
    'medical_affairs': {
        'display_name': 'Medical Affairs',
        'description': 'Medical strategy, scientific communication, and evidence generation',
        'functions': [
            'medical_science_liaison', 'medical_information', 'medical_education',
            'publication_planning', 'evidence_generation', 'medical_review'
        ]
    },
    'regulatory_affairs': {
        'display_name': 'Regulatory Affairs',
        'description': 'Regulatory strategy, submissions, and compliance',
        'functions': [
            'regulatory_strategy', 'regulatory_submissions', 'regulatory_compliance',
            'regulatory_intelligence', 'regulatory_operations'
        ]
    },
    'clinical_development': {
        'display_name': 'Clinical Development',
        'description': 'Clinical trial design, execution, and data management',
        'functions': [
            'clinical_operations', 'clinical_data_management', 'biometrics',
            'pharmacovigilance', 'medical_monitoring'
        ]
    },
    'market_access': {
        'display_name': 'Market Access & HEOR',
        'description': 'Health economics, outcomes research, payer strategy',
        'functions': [
            'heor', 'payer_strategy', 'pricing_reimbursement',
            'patient_access', 'policy_advocacy'
        ]
    },
    'manufacturing_cmc': {
        'display_name': 'Manufacturing & CMC',
        'description': 'Chemistry, manufacturing, controls, and quality',
        'functions': [
            'process_development', 'analytical_development', 'quality_assurance',
            'quality_control', 'manufacturing_operations', 'supply_chain'
        ]
    },
    'commercial': {
        'display_name': 'Commercial',
        'description': 'Marketing, sales, and brand management',
        'functions': [
            'brand_management', 'marketing_strategy', 'sales_operations',
            'market_research', 'customer_insights'
        ]
    },
    'research_development': {
        'display_name': 'Research & Development',
        'description': 'Drug discovery and translational research',
        'functions': [
            'drug_discovery', 'translational_medicine', 'biomarker_development',
            'preclinical_development', 'bioinformatics'
        ]
    },
    'operations': {
        'display_name': 'Operations & Project Management',
        'description': 'Project management, workflow orchestration, coordination',
        'functions': [
            'project_management', 'workflow_orchestration', 'data_operations',
            'technology_infrastructure'
        ]
    }
}

# Common Personas in Pharma/Biotech
PERSONAS = [
    {'name': 'Executive Leader', 'description': 'VP/SVP/Director level strategic decision maker'},
    {'name': 'Functional Manager', 'description': 'Manager of specific function or team'},
    {'name': 'Senior Expert', 'description': 'Deep domain expert with 10+ years experience'},
    {'name': 'Specialist', 'description': 'Focused specialist in narrow domain'},
    {'name': 'Analyst', 'description': 'Data analyst or research analyst'},
    {'name': 'Coordinator', 'description': 'Operational coordinator'},
    {'name': 'Strategist', 'description': 'Strategic planner or advisor'},
]

# Tenant Types
TENANTS = {
    'pharma': {
        'display_name': 'Pharmaceutical/Biotech',
        'description': 'Traditional pharmaceutical and biotech companies',
        'keywords': ['regulatory', 'fda', 'ema', 'clinical trial', 'drug', 'pharmaceutical', 'biotech', 'nda', 'bla', 'ind']
    },
    'digital_health': {
        'display_name': 'Digital Health',
        'description': 'Digital health startups and health tech companies',
        'keywords': ['digital', 'app', 'software', 'saas', 'platform', 'tech', 'startup', 'innovation']
    },
    'tenant_agnostic': {
        'display_name': 'Multi-Tenant (Universal)',
        'description': 'Applicable to both pharma and digital health',
        'keywords': ['general', 'operations', 'workflow', 'project', 'data', 'analytics', 'communication']
    }
}

def load_reclassification_results() -> Dict[str, Dict]:
    """Load agent reclassification results"""
    with open('agent_reclassification_results.json', 'r') as f:
        data = json.load(f)

    # Create lookup by agent name
    lookup = {}
    for agent in data:
        lookup[agent['agent_name']] = agent

    return lookup

async def map_agent_organization(agent_data: Dict, reclassification: Dict) -> Dict:
    """
    Map agent to organizational hierarchy using GPT-4

    Returns:
        department: str
        function: str
        role: str (specific job role)
        persona: str (persona type)
        tenants: list (pharma, digital_health, or both)
        updated_name: str (with tier prefix)
    """

    agent_name = agent_data['agent_name']
    tier = reclassification.get('new_tier', 'EXPERT')
    category = reclassification.get('category', 'unknown')

    # Get capabilities summary
    capabilities = reclassification.get('capabilities_count', 0)

    prompt = f"""Map this agent to proper organizational hierarchy, tenants, and update name.

**Agent Name:** {agent_name}
**Tier:** {tier}
**Category:** {category}
**Capabilities:** {capabilities}

---

**TASK 1: Map to Department & Function**

Based on the agent name and category, identify the best fit:

**DEPARTMENTS:**
- medical_affairs: Medical strategy, MSL, medical education
- regulatory_affairs: Regulatory submissions, compliance
- clinical_development: Clinical trials, data management, safety
- market_access: HEOR, payer strategy, pricing, patient access
- manufacturing_cmc: CMC, quality, manufacturing
- commercial: Brand, marketing, sales
- research_development: Drug discovery, translational medicine
- operations: Project management, orchestration

**TASK 2: Identify Specific Role**
What is the specific job role? (e.g., "Medical Science Liaison", "HEOR Director", "Clinical Data Manager")

**TASK 3: Map to Persona**
Which persona type?
- Executive Leader (VP/Director strategic)
- Functional Manager (Manager of team)
- Senior Expert (Deep expert 10+ years)
- Specialist (Narrow focused)
- Analyst (Data/research analyst)
- Coordinator (Operational)
- Strategist (Strategic advisor)

**TASK 4: Identify Applicable Tenants**
Determine which tenant types this agent applies to:
- **pharma**: Pharmaceutical/biotech specific (FDA, EMA, clinical trials, drug development, regulatory)
- **digital_health**: Digital health specific (apps, software, platforms, health tech)
- **both**: Applies to BOTH pharma AND digital health (general operations, analytics, workflow, project management)

Examples:
- "FDA Regulatory Strategist" → ["pharma"]
- "Digital Marketing Strategist" → ["digital_health"]
- "Workflow Orchestration Agent" → ["pharma", "digital_health"]
- "Project Coordination Agent" → ["pharma", "digital_health"]
- "Clinical Trial Designer" → ["pharma"]
- "Data Analytics Manager" → ["pharma", "digital_health"]

**TASK 5: Update Agent Name**
Add tier prefix following this format:
- MASTER → "Master - [name]"
- EXPERT → "Expert - [name]"
- SPECIALIST → "Specialist - [name]"
- WORKER → "Worker - [name]"
- TOOL → "Tool - [name]"

Return ONLY valid JSON in this exact format:
{{
  "department": "department_key",
  "function": "function_name",
  "role": "Specific Job Role",
  "persona": "Persona Type",
  "tenants": ["pharma"] or ["digital_health"] or ["pharma", "digital_health"],
  "updated_name": "{tier} - {agent_name}",
  "reasoning": "1-2 sentence explanation"
}}
"""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert in pharmaceutical organizational structure. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=400
        )

        result_text = response.choices[0].message.content.strip()

        # Extract JSON
        if '```json' in result_text:
            result_text = result_text.split('```json')[1].split('```')[0].strip()
        elif '```' in result_text:
            result_text = result_text.split('```')[1].split('```')[0].strip()

        result = json.loads(result_text)

        tenants = result.get('tenants', ['pharma'])
        # Ensure tenants is a list
        if not isinstance(tenants, list):
            tenants = [tenants]

        return {
            'agent_id': agent_data.get('agent_id'),
            'agent_name': agent_name,
            'tier': tier,
            'department': result.get('department', 'operations'),
            'function': result.get('function', 'general'),
            'role': result.get('role', agent_name),
            'persona': result.get('persona', 'Specialist'),
            'tenants': tenants,
            'updated_name': result.get('updated_name', f"{tier.capitalize()} - {agent_name}"),
            'reasoning': result.get('reasoning', '')
        }

    except Exception as e:
        print(f"  ⚠️ Error mapping {agent_name}: {e}")
        # Default mapping - assume pharma for safety
        return {
            'agent_id': agent_data.get('agent_id'),
            'agent_name': agent_name,
            'tier': tier,
            'department': 'operations',
            'function': 'general',
            'role': agent_name,
            'persona': 'Specialist',
            'tenants': ['pharma'],
            'updated_name': f"{tier.capitalize()} - {agent_name}",
            'reasoning': f'Error: {e}'
        }

async def process_batch(agents: List[Dict], reclassification_lookup: Dict, batch_num: int, total: int) -> List[Dict]:
    """Process batch of agents"""
    print(f"\n[Batch {batch_num}/{total}] Mapping {len(agents)} agents...")

    tasks = []
    for agent in agents:
        reclass = reclassification_lookup.get(agent['agent_name'], {})
        tasks.append(map_agent_organization(agent, reclass))

    results = await asyncio.gather(*tasks)

    # Summary
    dept_counts = {}
    for result in results:
        dept = result['department']
        dept_counts[dept] = dept_counts.get(dept, 0) + 1

    print(f"  Department distribution: {dept_counts}")

    return results

def generate_org_tables_migration(mappings: List[Dict]) -> str:
    """Generate SQL migration for organizational tables"""

    sql = """-- ============================================================================
-- Migration 007: Organizational Hierarchy & Tenant Mapping
-- ============================================================================
-- Creates organizational structure tables and maps all agents
-- Structure: TENANTS → AGENTS
--            DEPARTMENTS → FUNCTIONS → ROLES → AGENTS
--            PERSONAS → ROLES → AGENTS
-- ============================================================================

BEGIN;

-- ============================================================================
-- TENANT TABLES
-- ============================================================================

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_key TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Agent-Tenant mapping (M:M)
CREATE TABLE IF NOT EXISTS agent_tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_agent_tenant UNIQUE(agent_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_tenants_agent ON agent_tenants(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tenants_tenant ON agent_tenants(tenant_id);

-- ============================================================================
-- SEED TENANTS
-- ============================================================================

INSERT INTO tenants (tenant_key, display_name, description) VALUES
('pharma', 'Pharmaceutical/Biotech', 'Traditional pharmaceutical and biotech companies')
ON CONFLICT (tenant_key) DO NOTHING;

INSERT INTO tenants (tenant_key, display_name, description) VALUES
('digital_health', 'Digital Health', 'Digital health startups and health tech companies')
ON CONFLICT (tenant_key) DO NOTHING;

-- ============================================================================
-- ORGANIZATIONAL TABLES
-- ============================================================================

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_key TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Functions table (sub-units within departments)
CREATE TABLE IF NOT EXISTS functions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    function_key TEXT NOT NULL UNIQUE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Roles table (specific job roles)
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_key TEXT NOT NULL UNIQUE,
    function_id UUID NOT NULL REFERENCES functions(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    description TEXT,
    seniority_level TEXT CHECK (seniority_level IN ('entry', 'mid', 'senior', 'lead', 'director', 'vp', 'executive')),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Personas table (user personas)
CREATE TABLE IF NOT EXISTS personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_key TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Agent-Role mapping (M:M)
CREATE TABLE IF NOT EXISTS agent_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_agent_role UNIQUE(agent_id, role_id)
);

-- Persona-Role mapping (M:M)
CREATE TABLE IF NOT EXISTS persona_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    relevance_score DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_persona_role UNIQUE(persona_id, role_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_functions_department ON functions(department_id);
CREATE INDEX IF NOT EXISTS idx_roles_function ON roles(function_id);
CREATE INDEX IF NOT EXISTS idx_agent_roles_agent ON agent_roles(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_roles_role ON agent_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_persona_roles_persona ON persona_roles(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_roles_role ON persona_roles(role_id);

-- ============================================================================
-- SEED DEPARTMENTS
-- ============================================================================

"""

    # Insert departments
    for dept_key, dept_data in DEPARTMENTS.items():
        sql += f"""INSERT INTO departments (department_key, display_name, description) VALUES
('{dept_key}', '{dept_data['display_name']}', '{dept_data['description']}')
ON CONFLICT (department_key) DO NOTHING;

"""

    sql += """-- ============================================================================
-- SEED PERSONAS
-- ============================================================================

"""

    # Insert personas
    for persona in PERSONAS:
        persona_key = persona['name'].lower().replace(' ', '_')
        sql += f"""INSERT INTO personas (persona_key, display_name, description) VALUES
('{persona_key}', '{persona['name']}', '{persona['description']}')
ON CONFLICT (persona_key) DO NOTHING;

"""

    # Group mappings by department
    by_department = {}
    for mapping in mappings:
        dept = mapping['department']
        if dept not in by_department:
            by_department[dept] = []
        by_department[dept].append(mapping)

    sql += """-- ============================================================================
-- SEED FUNCTIONS (BY DEPARTMENT)
-- ============================================================================

"""

    # Collect all unique functions
    all_functions = {}
    for mapping in mappings:
        dept = mapping['department']
        func = mapping['function']
        if func not in all_functions:
            all_functions[func] = {
                'department': dept,
                'display_name': func.replace('_', ' ').title()
            }

    for func_key, func_data in all_functions.items():
        dept_key = func_data['department']
        display_name = func_data['display_name']
        sql += f"""INSERT INTO functions (function_key, department_id, display_name)
SELECT '{func_key}', id, '{display_name}'
FROM departments WHERE department_key = '{dept_key}'
ON CONFLICT (function_key) DO NOTHING;

"""

    sql += """-- ============================================================================
-- SEED ROLES
-- ============================================================================

"""

    # Collect all unique roles
    all_roles = {}
    for mapping in mappings:
        role = mapping['role']
        func = mapping['function']
        if role not in all_roles:
            role_key = role.lower().replace(' ', '_').replace('-', '_')
            seniority = 'senior'  # Default
            if 'director' in role.lower() or 'vp' in role.lower():
                seniority = 'director'
            elif 'manager' in role.lower() or 'lead' in role.lower():
                seniority = 'lead'
            elif 'analyst' in role.lower() or 'coordinator' in role.lower():
                seniority = 'mid'

            all_roles[role] = {
                'role_key': role_key,
                'function': func,
                'seniority': seniority
            }

    for role, role_data in all_roles.items():
        role_key = role_data['role_key']
        func_key = role_data['function']
        seniority = role_data['seniority']
        role_escaped = role.replace("'", "''")

        sql += f"""INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT '{role_key}', id, '{role_escaped}', '{seniority}'
FROM functions WHERE function_key = '{func_key}'
ON CONFLICT (role_key) DO NOTHING;

"""

    sql += """-- ============================================================================
-- UPDATE AGENT NAMES WITH TIER PREFIX
-- ============================================================================

"""

    # Update agent names
    for mapping in mappings:
        old_name = mapping['agent_name'].replace("'", "''")
        new_name = mapping['updated_name'].replace("'", "''")

        sql += f"""UPDATE agents SET name = '{new_name}' WHERE name = '{old_name}';
"""

    sql += """
-- ============================================================================
-- MAP AGENTS TO ROLES
-- ============================================================================

"""

    # Map agents to roles
    for mapping in mappings:
        agent_name = mapping['updated_name'].replace("'", "''")
        role = mapping['role'].replace("'", "''")
        role_key = role.lower().replace(' ', '_').replace('-', '_')

        sql += f"""INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = '{agent_name}' AND r.role_key = '{role_key}'
ON CONFLICT (agent_id, role_id) DO NOTHING;

"""

    sql += """-- ============================================================================
-- MAP AGENTS TO TENANTS
-- ============================================================================

"""

    # Map agents to tenants
    for mapping in mappings:
        agent_name = mapping['updated_name'].replace("'", "''")
        tenants = mapping.get('tenants', ['pharma'])

        for tenant_key in tenants:
            # Map pharma/digital_health directly, no tenant_agnostic in DB
            if tenant_key in ['pharma', 'digital_health']:
                sql += f"""INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = '{agent_name}' AND t.tenant_key = '{tenant_key}'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

"""

    sql += "\nCOMMIT;\n"

    return sql

def generate_mapping_report(mappings: List[Dict]) -> str:
    """Generate organizational mapping report"""

    # Count by department
    by_dept = {}
    by_persona = {}
    by_tier = {}
    by_tenant = {'pharma': 0, 'digital_health': 0, 'both': 0}

    for mapping in mappings:
        dept = DEPARTMENTS.get(mapping['department'], {}).get('display_name', mapping['department'])
        persona = mapping['persona']
        tier = mapping['tier']
        tenants = mapping.get('tenants', ['pharma'])

        by_dept[dept] = by_dept.get(dept, 0) + 1
        by_persona[persona] = by_persona.get(persona, 0) + 1
        by_tier[tier] = by_tier.get(tier, 0) + 1

        # Count tenant distribution
        if len(tenants) == 2 or 'both' in [t.lower() for t in tenants]:
            by_tenant['both'] += 1
        elif 'pharma' in tenants:
            by_tenant['pharma'] += 1
        elif 'digital_health' in tenants:
            by_tenant['digital_health'] += 1

    report = f"""# Agent Organizational Mapping Report

**Generated:** 2025-11-17
**Total Agents Mapped:** {len(mappings)}

---

## Distribution by Department

| Department | Agents | Percentage |
|------------|--------|------------|
"""

    for dept in sorted(by_dept.keys()):
        count = by_dept[dept]
        pct = count / len(mappings) * 100
        report += f"| {dept} | {count} | {pct:.1f}% |\n"

    report += f"""
---

## Distribution by Persona

| Persona | Agents | Percentage |
|---------|--------|------------|
"""

    for persona in sorted(by_persona.keys(), key=lambda x: by_persona[x], reverse=True):
        count = by_persona[persona]
        pct = count / len(mappings) * 100
        report += f"| {persona} | {count} | {pct:.1f}% |\n"

    report += f"""
---

## Distribution by Tier

| Tier | Agents | Percentage |
|------|--------|------------|
"""

    tier_order = ['MASTER', 'EXPERT', 'SPECIALIST', 'WORKER', 'TOOL']
    for tier in tier_order:
        count = by_tier.get(tier, 0)
        if count > 0:
            pct = count / len(mappings) * 100
            report += f"| {tier} | {count} | {pct:.1f}% |\n"

    report += f"""
---

## Distribution by Tenant

| Tenant | Agents | Percentage | Description |
|--------|--------|------------|-------------|
| Pharma Only | {by_tenant['pharma']} | {by_tenant['pharma']/len(mappings)*100:.1f}% | Pharmaceutical/biotech specific |
| Digital Health Only | {by_tenant['digital_health']} | {by_tenant['digital_health']/len(mappings)*100:.1f}% | Digital health specific |
| Multi-Tenant (Both) | {by_tenant['both']} | {by_tenant['both']/len(mappings)*100:.1f}% | Works for both pharma and digital health |

**Total:** {len(mappings)} agents

---

## Organizational Hierarchy

```
TENANTS (pharma, digital_health)
    └── AGENTS (M:M relationship)

DEPARTMENTS
    └── FUNCTIONS
            └── ROLES
                    └── AGENTS (M:M relationship)

PERSONAS → ROLES → AGENTS (M:M relationship)
```

**Key Points:**
- Agents can belong to multiple tenants (e.g., "Workflow Orchestration" works for both pharma and digital health)
- Agents can have multiple roles (though typically one primary role)
- Tenants enable filtering agents based on customer type

---

## Sample Mappings

<details>
<summary>Click to expand sample mappings by department</summary>

"""

    # Show samples from each department
    by_dept_samples = {}
    for mapping in mappings:
        dept = mapping['department']
        if dept not in by_dept_samples:
            by_dept_samples[dept] = []
        if len(by_dept_samples[dept]) < 5:  # First 5 per department
            by_dept_samples[dept].append(mapping)

    for dept_key in sorted(by_dept_samples.keys()):
        dept_name = DEPARTMENTS.get(dept_key, {}).get('display_name', dept_key)
        report += f"\n### {dept_name}\n\n"

        for mapping in by_dept_samples[dept_key]:
            tenants = mapping.get('tenants', ['pharma'])
            tenant_str = ', '.join(tenants) if len(tenants) <= 2 else 'both'

            report += f"- **{mapping['updated_name']}**\n"
            report += f"  - Role: {mapping['role']}\n"
            report += f"  - Function: {mapping['function']}\n"
            report += f"  - Persona: {mapping['persona']}\n"
            report += f"  - Tier: {mapping['tier']}\n"
            report += f"  - Tenants: {tenant_str}\n\n"

    report += """
</details>

---

## Next Steps

1. ✅ Review organizational mappings
2. ✅ Validate agent name updates
3. Run migration: `python3 scripts/run_migration.py --migration 007`
4. Verify all agents mapped correctly
5. Update frontend to use organizational filters
"""

    return report

async def main():
    """Main execution"""
    print("=" * 80)
    print("AGENT ORGANIZATIONAL MAPPING & NAME UPDATE")
    print("=" * 80)

    # Load data
    print("\n[1/5] Loading reclassification results...")
    reclassification_lookup = load_reclassification_results()
    print(f"  ✅ Loaded {len(reclassification_lookup)} agents")

    print("\n[2/5] Loading agents from agent_reclassification_results.json...")
    # Use reclassification results as source
    agents = list(reclassification_lookup.values())
    print(f"  ✅ {len(agents)} agents to map")

    # Process in batches
    print("\n[3/5] Mapping agents to organizational hierarchy...")
    batch_size = 20
    all_mappings = []

    for i in range(0, len(agents), batch_size):
        batch = agents[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (len(agents) + batch_size - 1) // batch_size

        mappings = await process_batch(batch, reclassification_lookup, batch_num, total_batches)
        all_mappings.extend(mappings)

        await asyncio.sleep(0.5)  # Brief delay

    # Save results
    print("\n[4/5] Generating output files...")
    with open('agent_organizational_mappings.json', 'w') as f:
        json.dump(all_mappings, f, indent=2)
    print("  ✅ agent_organizational_mappings.json")

    # Generate migration
    migration_sql = generate_org_tables_migration(all_mappings)
    with open('supabase/migrations/007_organizational_hierarchy.sql', 'w') as f:
        f.write(migration_sql)
    print("  ✅ supabase/migrations/007_organizational_hierarchy.sql")

    # Generate report
    report = generate_mapping_report(all_mappings)
    with open('AGENT_ORGANIZATIONAL_MAPPING_REPORT.md', 'w') as f:
        f.write(report)
    print("  ✅ AGENT_ORGANIZATIONAL_MAPPING_REPORT.md")

    # Summary
    print("\n[5/5] Summary...")
    dept_counts = {}
    for mapping in all_mappings:
        dept = mapping['department']
        dept_counts[dept] = dept_counts.get(dept, 0) + 1

    print(f"\n  Total agents mapped: {len(all_mappings)}")
    print(f"\n  By Department:")
    for dept_key in sorted(dept_counts.keys(), key=lambda x: dept_counts[x], reverse=True):
        dept_name = DEPARTMENTS.get(dept_key, {}).get('display_name', dept_key)
        print(f"    {dept_name}: {dept_counts[dept_key]}")

    print("\n" + "=" * 80)
    print("✅ ORGANIZATIONAL MAPPING COMPLETE")
    print("=" * 80)
    print("\nNext Steps:")
    print("1. Review AGENT_ORGANIZATIONAL_MAPPING_REPORT.md")
    print("2. Verify agent name updates look correct")
    print("3. Run migrations 002-007 in sequence")

if __name__ == '__main__':
    asyncio.run(main())
