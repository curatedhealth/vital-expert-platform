#!/usr/bin/env python3
"""
Reclassify all 319 agents into proper 5-level hierarchy based on VITAL Enhanced spec

Current Issue: ALL agents incorrectly classified as "Tier 2 Expert Agents"
Proper Hierarchy:
- MASTER (Tier 1): Top-level orchestrators, strategic coordinators (5-10 agents)
- EXPERT (Tier 2): Domain experts with deep knowledge (120-150 agents)
- SPECIALIST (Tier 3): Narrow specialists, focused capabilities (100-120 agents)
- WORKER (Tier 4): Task executors, operational agents (40-60 agents)
- TOOL (Tier 5): Utilities, calculators, simple functions (10-20 agents)
"""

import asyncio
import json
import os
import sys
from typing import Dict, List, Tuple
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def load_capabilities_analysis() -> Dict[str, Dict]:
    """Load agent capabilities analysis"""
    with open('agent_capabilities_analysis.json', 'r') as f:
        data = json.load(f)

    # Create lookup by agent name
    lookup = {}
    for agent in data:
        lookup[agent['agent_name']] = agent

    return lookup

async def classify_agent_tier(agent_data: Dict, capabilities_data: Dict) -> Dict:
    """
    Use GPT-4 to classify agent into proper tier based on VITAL Enhanced spec

    Classification Criteria:

    MASTER (Tier 1):
    - Orchestrates multiple other agents
    - Makes high-level strategic decisions
    - Coordinates complex multi-step workflows
    - Examples: Workflow Orchestration Agent, Strategic Planning Director

    EXPERT (Tier 2):
    - Deep domain expertise
    - Complex reasoning and analysis
    - Provides strategic guidance
    - Makes judgment calls requiring expertise
    - Examples: HEOR Director, Clinical Trial Designer, Regulatory Strategy Advisor

    SPECIALIST (Tier 3):
    - Narrow, focused expertise
    - Handles specific sub-domain tasks
    - Requires specialized knowledge
    - Examples: Safety Signal Detector, Pediatric Dosing Specialist, HTA Analyst

    WORKER (Tier 4):
    - Executes operational tasks
    - Follows established procedures
    - Minimal strategic decision-making
    - Examples: Document Generator, Project Coordinator, Data Manager

    TOOL (Tier 5):
    - Simple utilities
    - Calculations, lookups, formatting
    - No complex reasoning
    - Examples: Dosing Calculator, Budget Estimator, Format Converter
    """

    agent_name = agent_data.get('name', '')
    description = agent_data.get('description', 'No description available')

    # Get capabilities if available
    cap_info = capabilities_data.get(agent_name, {})
    capabilities_list = cap_info.get('capabilities', [])
    category = cap_info.get('category', 'unknown')

    capabilities_summary = "\n".join([
        f"- {cap.get('display_name', '')}: {cap.get('description', '')}"
        for cap in capabilities_list[:5]  # Top 5 capabilities
    ])

    prompt = f"""Classify this agent into the proper tier level based on the VITAL Enhanced Agent System specification.

**Agent Name:** {agent_name}

**Description:** {description}

**Category:** {category}

**Key Capabilities:**
{capabilities_summary if capabilities_summary else "No capabilities extracted"}

---

**CLASSIFICATION CRITERIA:**

**MASTER (Tier 1)** - Top-level orchestrators:
- Coordinates multiple agents in complex workflows
- Makes high-level strategic decisions
- Manages overall system architecture
- Keywords: "orchestration", "workflow", "coordination", "strategic planning"

**EXPERT (Tier 2)** - Domain experts:
- Deep expertise in specific domain (regulatory, clinical, market access, etc.)
- Complex reasoning and analysis
- Provides strategic guidance requiring expert judgment
- Makes decisions requiring years of domain knowledge
- Keywords: "director", "advisor", "strategist", "expert", "specialist" (if deep expertise)

**SPECIALIST (Tier 3)** - Focused specialists:
- Narrow, specific expertise within a domain
- Handles well-defined sub-domain tasks
- Requires specialized knowledge but limited scope
- Keywords: "specialist" (narrow focus), "coordinator" (specific area), "analyst"

**WORKER (Tier 4)** - Task executors:
- Executes operational tasks following procedures
- Document generation, data management, project coordination
- Minimal strategic decision-making
- Keywords: "manager" (operational), "coordinator" (tasks), "generator"

**TOOL (Tier 5)** - Simple utilities:
- Calculations, lookups, simple transformations
- No complex reasoning or domain expertise
- Straightforward input-output functions
- Keywords: "calculator", "estimator", "validator", "converter"

---

Return ONLY valid JSON in this exact format:
{{
  "tier": "MASTER|EXPERT|SPECIALIST|WORKER|TOOL",
  "confidence": 0.0-1.0,
  "reasoning": "2-3 sentence explanation of why this classification",
  "key_indicators": ["indicator1", "indicator2", "indicator3"]
}}
"""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert in agent architecture classification. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=500
        )

        result_text = response.choices[0].message.content.strip()

        # Extract JSON if wrapped in markdown
        if '```json' in result_text:
            result_text = result_text.split('```json')[1].split('```')[0].strip()
        elif '```' in result_text:
            result_text = result_text.split('```')[1].split('```')[0].strip()

        result = json.loads(result_text)

        return {
            'agent_id': agent_data.get('id'),
            'agent_name': agent_name,
            'old_tier': 'EXPERT',  # All currently classified as EXPERT
            'new_tier': result['tier'],
            'confidence': result['confidence'],
            'reasoning': result['reasoning'],
            'key_indicators': result['key_indicators'],
            'category': category,
            'capabilities_count': len(capabilities_list)
        }

    except Exception as e:
        print(f"  ⚠️ Error classifying {agent_name}: {e}")
        # Default to SPECIALIST if error
        return {
            'agent_id': agent_data.get('id'),
            'agent_name': agent_name,
            'old_tier': 'EXPERT',
            'new_tier': 'SPECIALIST',
            'confidence': 0.5,
            'reasoning': f'Error during classification: {e}',
            'key_indicators': [],
            'category': category,
            'capabilities_count': len(capabilities_list)
        }

async def classify_batch(agents_batch: List[Dict], capabilities_data: Dict, batch_num: int, total_batches: int) -> List[Dict]:
    """Classify a batch of agents"""
    print(f"\n[Batch {batch_num}/{total_batches}] Classifying {len(agents_batch)} agents...")

    tasks = [classify_agent_tier(agent, capabilities_data) for agent in agents_batch]
    results = await asyncio.gather(*tasks)

    # Print summary for this batch
    tier_counts = {}
    for result in results:
        tier = result['new_tier']
        tier_counts[tier] = tier_counts.get(tier, 0) + 1
        confidence_emoji = "🟢" if result['confidence'] >= 0.8 else "🟡" if result['confidence'] >= 0.6 else "🔴"
        print(f"  {confidence_emoji} {result['agent_name']}: {result['old_tier']} → {result['new_tier']} ({result['confidence']:.2f})")

    print(f"  Batch summary: {tier_counts}")

    return results

def generate_reclassification_report(classifications: List[Dict]) -> str:
    """Generate detailed reclassification report"""

    # Count by tier
    tier_distribution = {
        'MASTER': [],
        'EXPERT': [],
        'SPECIALIST': [],
        'WORKER': [],
        'TOOL': []
    }

    for classification in classifications:
        tier = classification['new_tier']
        tier_distribution[tier].append(classification)

    # Sort each tier by confidence
    for tier in tier_distribution:
        tier_distribution[tier].sort(key=lambda x: x['confidence'], reverse=True)

    # Calculate statistics
    total = len(classifications)
    avg_confidence = sum(c['confidence'] for c in classifications) / total if total > 0 else 0

    high_confidence = len([c for c in classifications if c['confidence'] >= 0.8])
    medium_confidence = len([c for c in classifications if 0.6 <= c['confidence'] < 0.8])
    low_confidence = len([c for c in classifications if c['confidence'] < 0.6])

    report = f"""# Agent Reclassification Report

**Generated:** 2025-11-17
**Total Agents Reclassified:** {total}
**Average Confidence:** {avg_confidence:.2f}

---

## Executive Summary

### Previous Classification (INCORRECT)
- ❌ ALL {total} agents classified as "Tier 2 EXPERT Agents"
- This is fundamentally flawed as it treats simple calculators the same as strategic domain experts

### New Classification (CORRECT)
Based on VITAL Enhanced Agent System specification:

| Tier | Count | Percentage | Description |
|------|-------|------------|-------------|
| **MASTER** | {len(tier_distribution['MASTER'])} | {len(tier_distribution['MASTER'])/total*100:.1f}% | Top-level orchestrators |
| **EXPERT** | {len(tier_distribution['EXPERT'])} | {len(tier_distribution['EXPERT'])/total*100:.1f}% | Domain experts |
| **SPECIALIST** | {len(tier_distribution['SPECIALIST'])} | {len(tier_distribution['SPECIALIST'])/total*100:.1f}% | Focused specialists |
| **WORKER** | {len(tier_distribution['WORKER'])} | {len(tier_distribution['WORKER'])/total*100:.1f}% | Task executors |
| **TOOL** | {len(tier_distribution['TOOL'])} | {len(tier_distribution['TOOL'])/total*100:.1f}% | Simple utilities |

### Classification Confidence
- 🟢 **High (≥0.8):** {high_confidence} agents ({high_confidence/total*100:.1f}%)
- 🟡 **Medium (0.6-0.8):** {medium_confidence} agents ({medium_confidence/total*100:.1f}%)
- 🔴 **Low (<0.6):** {low_confidence} agents ({low_confidence/total*100:.1f}%)

---

## Impact Analysis

### Performance Optimization
Proper classification enables:
1. **Cost Optimization:** Use TOOL agents for simple tasks (100x cheaper than EXPERT)
2. **Speed Optimization:** Route simple queries to WORKER/TOOL (10x faster)
3. **Quality Optimization:** Reserve EXPERT/MASTER for complex decisions

### Example Cost Savings
- Simple dosing calculation: TOOL agent (~$0.001) vs EXPERT agent (~$0.10) = 100x savings
- Document generation: WORKER agent (~$0.01) vs EXPERT agent (~$0.10) = 10x savings
- Strategic planning: MASTER agent (appropriate) vs 5 separate EXPERT agents = better quality

---

## MASTER Agents (Tier 1) - {len(tier_distribution['MASTER'])} agents

**Purpose:** Top-level orchestrators coordinating multiple agents in complex workflows

"""

    for agent in tier_distribution['MASTER']:
        conf_emoji = "🟢" if agent['confidence'] >= 0.8 else "🟡" if agent['confidence'] >= 0.6 else "🔴"
        report += f"""
### {conf_emoji} {agent['agent_name']}
- **Confidence:** {agent['confidence']:.2f}
- **Category:** {agent['category']}
- **Reasoning:** {agent['reasoning']}
- **Key Indicators:** {', '.join(agent['key_indicators'])}
"""

    report += f"""
---

## EXPERT Agents (Tier 2) - {len(tier_distribution['EXPERT'])} agents

**Purpose:** Deep domain expertise requiring complex reasoning and strategic judgment

<details>
<summary>Click to expand {len(tier_distribution['EXPERT'])} EXPERT agents</summary>

"""

    for agent in tier_distribution['EXPERT'][:50]:  # First 50
        conf_emoji = "🟢" if agent['confidence'] >= 0.8 else "🟡" if agent['confidence'] >= 0.6 else "🔴"
        report += f"- {conf_emoji} **{agent['agent_name']}** ({agent['confidence']:.2f}) - {agent['category']}\n"

    if len(tier_distribution['EXPERT']) > 50:
        report += f"\n... and {len(tier_distribution['EXPERT']) - 50} more\n"

    report += """
</details>

---

## SPECIALIST Agents (Tier 3) - {} agents

**Purpose:** Focused specialists handling well-defined sub-domain tasks

<details>
<summary>Click to expand {} SPECIALIST agents</summary>

""".format(len(tier_distribution['SPECIALIST']), len(tier_distribution['SPECIALIST']))

    for agent in tier_distribution['SPECIALIST'][:50]:  # First 50
        conf_emoji = "🟢" if agent['confidence'] >= 0.8 else "🟡" if agent['confidence'] >= 0.6 else "🔴"
        report += f"- {conf_emoji} **{agent['agent_name']}** ({agent['confidence']:.2f}) - {agent['category']}\n"

    if len(tier_distribution['SPECIALIST']) > 50:
        report += f"\n... and {len(tier_distribution['SPECIALIST']) - 50} more\n"

    report += """
</details>

---

## WORKER Agents (Tier 4) - {} agents

**Purpose:** Operational task executors following established procedures

<details>
<summary>Click to expand {} WORKER agents</summary>

""".format(len(tier_distribution['WORKER']), len(tier_distribution['WORKER']))

    for agent in tier_distribution['WORKER']:
        conf_emoji = "🟢" if agent['confidence'] >= 0.8 else "🟡" if agent['confidence'] >= 0.6 else "🔴"
        report += f"- {conf_emoji} **{agent['agent_name']}** ({agent['confidence']:.2f}) - {agent['reasoning']}\n"

    report += """
</details>

---

## TOOL Agents (Tier 5) - {} agents

**Purpose:** Simple utilities for calculations, lookups, and transformations

""".format(len(tier_distribution['TOOL']))

    for agent in tier_distribution['TOOL']:
        conf_emoji = "🟢" if agent['confidence'] >= 0.8 else "🟡" if agent['confidence'] >= 0.6 else "🔴"
        report += f"""
### {conf_emoji} {agent['agent_name']}
- **Confidence:** {agent['confidence']:.2f}
- **Category:** {agent['category']}
- **Reasoning:** {agent['reasoning']}
"""

    report += """
---

## Next Steps

### 1. Review Low-Confidence Classifications
Manually review agents with confidence < 0.6 to ensure correct classification.

### 2. Run Reclassification Migration
```bash
python3 scripts/run_migration.py --migration 006_reclassify_agents
```

### 3. Update Agent Metadata
Ensure agent metadata reflects new tier levels in database.

### 4. Update Routing Logic
Modify agent selection logic to:
- Route simple queries to TOOL/WORKER agents
- Route complex analyses to EXPERT agents
- Use MASTER agents for multi-step orchestration

### 5. Implement Deep Agent Architecture
For EXPERT and MASTER agents, implement Deep Agent capabilities:
- Chain of Thought reasoning
- Self-Critique mechanism
- Tree of Thoughts
- Supervisor-Worker pattern

---

## Validation

To validate this reclassification:
1. ✅ MASTER agents should coordinate multiple agents
2. ✅ EXPERT agents should require deep domain knowledge
3. ✅ SPECIALIST agents should have narrow, focused scope
4. ✅ WORKER agents should execute operational tasks
5. ✅ TOOL agents should be simple utilities without complex reasoning
"""

    return report

def generate_migration_sql(classifications: List[Dict]) -> str:
    """Generate SQL migration to update agent tiers"""

    sql = """-- ============================================================================
-- Migration 006: Reclassify Agents by Proper Tier Levels
-- ============================================================================
-- Fixes critical issue: ALL agents incorrectly classified as "Tier 2 EXPERT"
-- Based on VITAL Enhanced Agent System specification
-- Generated: 2025-11-17
-- ============================================================================

BEGIN;

-- Update agent tier levels based on reclassification

"""

    # Group by tier for organization
    by_tier = {}
    for classification in classifications:
        tier = classification['new_tier']
        if tier not in by_tier:
            by_tier[tier] = []
        by_tier[tier].append(classification)

    tier_order = ['MASTER', 'EXPERT', 'SPECIALIST', 'WORKER', 'TOOL']

    for tier in tier_order:
        if tier not in by_tier:
            continue

        agents = by_tier[tier]
        sql += f"\n-- ============================================================================\n"
        sql += f"-- {tier} AGENTS ({len(agents)} agents)\n"
        sql += f"-- ============================================================================\n\n"

        for agent in agents:
            agent_name = agent['agent_name'].replace("'", "''")
            reasoning = agent['reasoning'].replace("'", "''")

            sql += f"-- {agent_name} (confidence: {agent['confidence']:.2f})\n"
            sql += f"-- Reasoning: {reasoning}\n"
            sql += f"UPDATE agents SET agent_level = '{tier}' WHERE name = '{agent_name}';\n\n"

    sql += "\nCOMMIT;\n"

    return sql

async def main():
    """Main execution"""
    print("=" * 80)
    print("AGENT RECLASSIFICATION - VITAL Enhanced 5-Level Hierarchy")
    print("=" * 80)
    print("\nCurrent Issue: ALL 319 agents incorrectly classified as 'Tier 2 EXPERT'")
    print("Target: Proper distribution across MASTER/EXPERT/SPECIALIST/WORKER/TOOL")
    print("=" * 80)
    sys.stdout.flush()

    # Load data
    print("\n[1/6] Loading agents from database...")
    sys.stdout.flush()
    from supabase import create_client
    supabase = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_ANON_KEY')
    )

    response = supabase.table('agents').select('*').execute()
    agents = response.data
    print(f"  ✅ Loaded {len(agents)} agents")
    sys.stdout.flush()

    print("\n[2/6] Loading capabilities analysis...")
    sys.stdout.flush()
    capabilities_data = load_capabilities_analysis()
    print(f"  ✅ Loaded capabilities for {len(capabilities_data)} agents")
    sys.stdout.flush()

    # Classify in batches
    print("\n[3/6] Classifying agents into proper tiers...")
    batch_size = 10
    all_classifications = []

    for i in range(0, len(agents), batch_size):
        batch = agents[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (len(agents) + batch_size - 1) // batch_size

        classifications = await classify_batch(batch, capabilities_data, batch_num, total_batches)
        all_classifications.extend(classifications)

        # Brief delay to avoid rate limits
        await asyncio.sleep(1)

    # Save classifications
    print("\n[4/6] Saving classification results...")
    with open('agent_reclassification_results.json', 'w') as f:
        json.dump(all_classifications, f, indent=2)
    print("  ✅ agent_reclassification_results.json")

    # Generate report
    print("\n[5/6] Generating reclassification report...")
    report = generate_reclassification_report(all_classifications)
    with open('AGENT_RECLASSIFICATION_REPORT.md', 'w') as f:
        f.write(report)
    print("  ✅ AGENT_RECLASSIFICATION_REPORT.md")

    # Generate SQL migration
    print("\n[6/6] Generating SQL migration...")
    sql = generate_migration_sql(all_classifications)
    with open('supabase/migrations/006_reclassify_agents.sql', 'w') as f:
        f.write(sql)
    print("  ✅ supabase/migrations/006_reclassify_agents.sql")

    # Print summary
    tier_counts = {}
    for classification in all_classifications:
        tier = classification['new_tier']
        tier_counts[tier] = tier_counts.get(tier, 0) + 1

    print("\n" + "=" * 80)
    print("✅ RECLASSIFICATION COMPLETE")
    print("=" * 80)
    print("\nFinal Distribution:")
    for tier in ['MASTER', 'EXPERT', 'SPECIALIST', 'WORKER', 'TOOL']:
        count = tier_counts.get(tier, 0)
        pct = count / len(all_classifications) * 100 if all_classifications else 0
        print(f"  {tier:12s}: {count:3d} agents ({pct:5.1f}%)")

    print("\nNext Steps:")
    print("1. Review AGENT_RECLASSIFICATION_REPORT.md")
    print("2. Validate low-confidence classifications")
    print("3. Run migration: python3 scripts/run_migration.py --migration 006")
    print("4. Update agent selection logic to use new tiers")
    print("5. Implement Deep Agent architecture for EXPERT/MASTER agents")

if __name__ == '__main__':
    asyncio.run(main())
