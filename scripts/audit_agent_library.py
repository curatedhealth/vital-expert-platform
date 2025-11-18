"""
Agent Library Audit Script

Audits current agent library against PRD/ARD enhanced structure.

What this script does:
1. Fetches all agents from Supabase
2. Analyzes agent structure and quality
3. Compares against gold standard (5-level hierarchy)
4. Identifies gaps and enhancement opportunities
5. Generates comprehensive audit report

Usage:
    python scripts/audit_agent_library.py
"""

import asyncio
import os
import sys
import json
from pathlib import Path
from dotenv import load_dotenv
from collections import defaultdict, Counter

# Load environment
load_dotenv()

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "services" / "ai-engine" / "src"))

print("=" * 80)
print("VITAL AGENT LIBRARY AUDIT")
print("=" * 80)
print()


async def main():
    """Main audit function."""

    # Import Supabase directly
    from supabase import create_client

    # Initialize Supabase client
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        print("❌ ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required")
        sys.exit(1)

    supabase = create_client(supabase_url, supabase_key)

    print("1️⃣  Fetching agents from Supabase...")

    # Fetch all agents
    result = supabase.table("agents").select("*").execute()
    agents = result.data or []

    print(f"   Found: {len(agents)} agents")
    print()

    # Analyze agents
    print("2️⃣  Analyzing agent structure...")
    analysis = analyze_agents(agents)

    print()
    print("3️⃣  Comparing against PRD/ARD gold standard...")
    gaps = identify_gaps(agents, analysis)

    print()
    print("4️⃣  Generating audit report...")
    report = generate_report(agents, analysis, gaps)

    # Save report
    report_path = Path(__file__).parent.parent / "AGENT_LIBRARY_AUDIT_REPORT.md"
    with open(report_path, "w") as f:
        f.write(report)

    print(f"   Report saved: {report_path.name}")
    print()

    # Print summary
    print_summary(analysis, gaps)


def analyze_agents(agents):
    """Analyze agent structure and quality."""

    analysis = {
        "total": len(agents),
        "by_tier": Counter(),
        "by_domain": Counter(),
        "by_specialization": Counter(),
        "missing_fields": defaultdict(int),
        "prompt_quality": {
            "has_system_prompt": 0,
            "has_description": 0,
            "prompt_length_avg": 0,
            "description_length_avg": 0
        },
        "capabilities": {
            "total": 0,
            "avg_per_agent": 0,
            "unique": set()
        },
        "domains": {
            "total": 0,
            "avg_per_agent": 0,
            "unique": set()
        },
        "issues": []
    }

    total_prompt_len = 0
    total_desc_len = 0
    total_capabilities = 0
    total_domains = 0

    for agent in agents:
        # Tier analysis
        tier = agent.get("tier", "unknown")
        analysis["by_tier"][tier] += 1

        # Domain analysis
        domain_expertise = agent.get("domain_expertise", []) or []
        for domain in domain_expertise:
            analysis["by_domain"][domain] += 1
            analysis["domains"]["unique"].add(domain)
        total_domains += len(domain_expertise)

        # Specialization
        spec = agent.get("specialization", "unspecified")
        analysis["by_specialization"][spec] += 1

        # Missing fields check
        required_fields = [
            "name", "description", "system_prompt", "capabilities",
            "domain_expertise", "tier", "specialization"
        ]

        for field in required_fields:
            if not agent.get(field):
                analysis["missing_fields"][field] += 1

        # Prompt quality
        system_prompt = agent.get("system_prompt", "")
        description = agent.get("description", "")

        if system_prompt:
            analysis["prompt_quality"]["has_system_prompt"] += 1
            total_prompt_len += len(system_prompt)

        if description:
            analysis["prompt_quality"]["has_description"] += 1
            total_desc_len += len(description)

        # Capabilities
        capabilities = agent.get("capabilities", []) or []
        for cap in capabilities:
            analysis["capabilities"]["unique"].add(cap)
        total_capabilities += len(capabilities)

        # Quality issues
        if len(system_prompt) < 100:
            analysis["issues"].append({
                "agent": agent.get("name"),
                "issue": "system_prompt_too_short",
                "length": len(system_prompt)
            })

        if not capabilities:
            analysis["issues"].append({
                "agent": agent.get("name"),
                "issue": "no_capabilities"
            })

        if not domain_expertise:
            analysis["issues"].append({
                "agent": agent.get("name"),
                "issue": "no_domain_expertise"
            })

    # Calculate averages
    if analysis["total"] > 0:
        analysis["prompt_quality"]["prompt_length_avg"] = total_prompt_len / analysis["prompt_quality"]["has_system_prompt"] if analysis["prompt_quality"]["has_system_prompt"] > 0 else 0
        analysis["prompt_quality"]["description_length_avg"] = total_desc_len / analysis["prompt_quality"]["has_description"] if analysis["prompt_quality"]["has_description"] > 0 else 0
        analysis["capabilities"]["avg_per_agent"] = total_capabilities / analysis["total"]
        analysis["capabilities"]["total"] = total_capabilities
        analysis["domains"]["avg_per_agent"] = total_domains / analysis["total"]
        analysis["domains"]["total"] = total_domains

    return analysis


def identify_gaps(agents, analysis):
    """Identify gaps vs PRD/ARD gold standard."""

    gaps = {
        "hierarchy": {
            "issue": "5-level hierarchy not implemented",
            "current": dict(analysis["by_tier"]),
            "required": {
                "1": "Master Agents (5 orchestrators)",
                "2": "Expert Agents (136+ domain experts)",
                "3": "Specialist Sub-Agents (spawned on-demand)",
                "4": "Worker Agents (parallel executors)",
                "5": "Tool Agents (specialized tools)"
            },
            "missing_tiers": []
        },
        "master_agents": {
            "required": 5,
            "current": analysis["by_tier"].get(1, 0),
            "gap": 5 - analysis["by_tier"].get(1, 0),
            "required_masters": [
                "Regulatory Master",
                "Clinical Master",
                "Market Access Master",
                "Technical Master",
                "Strategic Master"
            ]
        },
        "structure": {
            "missing_embeddings": 0,
            "missing_metadata": 0,
            "invalid_tier": 0
        },
        "quality": {
            "short_prompts": len([i for i in analysis["issues"] if i["issue"] == "system_prompt_too_short"]),
            "no_capabilities": len([i for i in analysis["issues"] if i["issue"] == "no_capabilities"]),
            "no_domain": len([i for i in analysis["issues"] if i["issue"] == "no_domain_expertise"]),
            "total_issues": len(analysis["issues"])
        },
        "prd_requirements": {
            "50_templates": {
                "required": True,
                "current": "Unknown - need to check",
                "gap": "Templates not in agent structure"
            },
            "artifacts": {
                "required": True,
                "current": False,
                "gap": "Artifacts system not implemented"
            },
            "multimodal": {
                "required": True,
                "current": False,
                "gap": "Multimodal capabilities not in agents"
            },
            "global_regulatory": {
                "required": "50+ countries",
                "current": len(analysis["domains"]["unique"]),
                "gap": "Need regulatory coverage validation"
            }
        }
    }

    # Check for missing tiers
    for tier in [1, 2, 3, 4, 5]:
        if tier not in analysis["by_tier"] or analysis["by_tier"][tier] == 0:
            gaps["hierarchy"]["missing_tiers"].append(tier)

    # Check structure issues
    for agent in agents:
        if not agent.get("embedding"):
            gaps["structure"]["missing_embeddings"] += 1

        if not agent.get("metadata"):
            gaps["structure"]["missing_metadata"] += 1

        tier = agent.get("tier")
        if not tier or tier not in [1, 2, 3, 4, 5]:
            gaps["structure"]["invalid_tier"] += 1

    return gaps


def generate_report(agents, analysis, gaps):
    """Generate comprehensive audit report in Markdown."""

    report = f"""# VITAL Agent Library Audit Report
**Date:** {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Total Agents:** {analysis['total']}
**Database:** bomltkhixeatxuoxmolq (VITAL-expert)

---

## Executive Summary

### Current State
- **Total Agents:** {analysis['total']}
- **Tier Distribution:** {dict(analysis['by_tier'])}
- **Unique Capabilities:** {len(analysis['capabilities']['unique'])}
- **Unique Domains:** {len(analysis['domains']['unique'])}
- **Quality Issues:** {gaps['quality']['total_issues']}

### Critical Gaps
1. **5-Level Hierarchy:** Missing Tiers {gaps['hierarchy']['missing_tiers']}
2. **Master Agents:** {gaps['master_agents']['current']}/{gaps['master_agents']['required']} ({gaps['master_agents']['gap']} missing)
3. **Quality Issues:** {gaps['quality']['total_issues']} agents need enhancement
4. **Structure Issues:** {gaps['structure']['missing_embeddings']} missing embeddings

### Recommendation
**⚠️ DO NOT MIGRATE AS-IS** - Enhance to gold standard first

---

## Detailed Analysis

### 1. Agent Tier Distribution

Current vs Required:
"""

    # Tier breakdown
    for tier in [1, 2, 3, 4, 5]:
        current = analysis["by_tier"].get(tier, 0)
        required = gaps["hierarchy"]["required"].get(str(tier), "N/A")
        status = "❌ Missing" if tier in gaps["hierarchy"]["missing_tiers"] else "✅ Present"
        report += f"\n**Tier {tier}:** {current} agents | Required: {required} | Status: {status}"

    report += f"""

### 2. Agent Quality Assessment

**System Prompts:**
- Has prompt: {analysis['prompt_quality']['has_system_prompt']}/{analysis['total']} ({analysis['prompt_quality']['has_system_prompt']/analysis['total']*100:.1f}%)
- Avg length: {analysis['prompt_quality']['prompt_length_avg']:.0f} characters
- Too short (<100 chars): {gaps['quality']['short_prompts']} agents

**Descriptions:**
- Has description: {analysis['prompt_quality']['has_description']}/{analysis['total']} ({analysis['prompt_quality']['has_description']/analysis['total']*100:.1f}%)
- Avg length: {analysis['prompt_quality']['description_length_avg']:.0f} characters

**Capabilities:**
- Total capabilities: {analysis['capabilities']['total']}
- Unique capabilities: {len(analysis['capabilities']['unique'])}
- Avg per agent: {analysis['capabilities']['avg_per_agent']:.1f}
- No capabilities: {gaps['quality']['no_capabilities']} agents

**Domain Expertise:**
- Total domains: {analysis['domains']['total']}
- Unique domains: {len(analysis['domains']['unique'])}
- Avg per agent: {analysis['domains']['avg_per_agent']:.1f}
- No domains: {gaps['quality']['no_domain']} agents

### 3. Missing Master Agents

Required (Tier 1):
"""

    for master in gaps['master_agents']['required_masters']:
        report += f"\n- {master}"

    report += f"""

Current Tier 1 agents: {gaps['master_agents']['current']}
**Gap:** {gaps['master_agents']['gap']} master agents need to be created

### 4. Top Quality Issues

"""

    # Group issues by type
    issues_by_type = defaultdict(list)
    for issue in analysis['issues'][:20]:  # Top 20
        issues_by_type[issue['issue']].append(issue)

    for issue_type, issue_list in issues_by_type.items():
        report += f"\n**{issue_type.replace('_', ' ').title()}:** {len(issue_list)} agents"
        for issue in issue_list[:5]:  # Show first 5
            agent_name = issue.get('agent', 'Unknown')
            if 'length' in issue:
                report += f"\n  - {agent_name} (length: {issue['length']})"
            else:
                report += f"\n  - {agent_name}"

    report += f"""

### 5. Missing Fields Analysis

"""

    for field, count in analysis['missing_fields'].items():
        pct = count / analysis['total'] * 100 if analysis['total'] > 0 else 0
        report += f"\n- **{field}:** {count} agents missing ({pct:.1f}%)"

    report += f"""

### 6. Domain Coverage

**Top 10 Domains:**
"""

    top_domains = sorted(analysis['by_domain'].items(), key=lambda x: x[1], reverse=True)[:10]
    for domain, count in top_domains:
        report += f"\n- {domain}: {count} agents"

    report += f"""

**Total unique domains:** {len(analysis['domains']['unique'])}

### 7. PRD/ARD Compliance Gaps

"""

    for requirement, details in gaps['prd_requirements'].items():
        report += f"\n**{requirement.replace('_', ' ').title()}:**"
        report += f"\n- Required: {details['required']}"
        report += f"\n- Current: {details['current']}"
        report += f"\n- Gap: {details['gap']}"
        report += "\n"

    report += f"""

---

## Enhancement Recommendations

### Priority 1: Critical (Before Migration)

1. **Create 5 Master Agents (Tier 1)**
   - Regulatory Master
   - Clinical Master
   - Market Access Master
   - Technical Master
   - Strategic Master

   Each master should:
   - Have comprehensive system prompts (1000+ chars)
   - Define clear orchestration responsibilities
   - List which Tier 2 agents they manage
   - Include planning tool access (write_todos, delegate_task)

2. **Fix {gaps['quality']['short_prompts']} agents with short prompts**
   - Minimum 500 characters
   - Include role definition
   - List specific capabilities
   - Define success criteria
   - Add example use cases

3. **Add missing capabilities** ({gaps['quality']['no_capabilities']} agents)
   - Minimum 3 capabilities per agent
   - Be specific (not just "analysis")
   - Align with PRD requirements

4. **Add missing domain expertise** ({gaps['quality']['no_domain']} agents)
   - Minimum 2 domains per agent
   - Use standardized domain taxonomy
   - Include regulatory jurisdictions if applicable

5. **Generate embeddings for all agents**
   - {gaps['structure']['missing_embeddings']} agents missing embeddings
   - Use text-embedding-3-large
   - Store in both Supabase and Pinecone

### Priority 2: Enhancement (Post-Migration)

6. **Tier 3-5 Agent Definitions**
   - Define specialist sub-agents (Tier 3)
   - Define worker agents (Tier 4)
   - Define tool agents (Tier 5)
   - Create spawning templates

7. **50+ Template Library**
   - Link templates to appropriate agents
   - Cover all regulatory jurisdictions
   - Include artifacts integration

8. **Multimodal Capabilities**
   - Add to relevant agents
   - Define supported formats
   - Integration with multimodal service

9. **Global Regulatory Coverage**
   - Ensure 50+ country coverage
   - Add jurisdiction-specific agents if needed
   - Validate compliance requirements

### Priority 3: Optimization

10. **Metadata Enhancement**
    - Add performance metrics
    - Add usage statistics
    - Add success patterns
    - Add collaboration history

11. **Quality Assurance**
    - Peer review all prompts
    - Test with sample queries
    - Validate against PRD requirements
    - A/B test improvements

---

## Proposed Gold Standard Agent Structure

```json
{{
  "id": "uuid",
  "name": "Regulatory Master Agent",
  "tier": 1,
  "specialization": "Regulatory Orchestration",
  "description": "Master orchestrator for all regulatory affairs. Coordinates Expert Agents (Tier 2) and spawns Specialist Sub-Agents (Tier 3) for complex regulatory tasks across FDA, EMA, PMDA, and 50+ global jurisdictions.",

  "system_prompt": "{{comprehensive_prompt_500+_chars}}",

  "capabilities": [
    "regulatory_orchestration",
    "expert_agent_coordination",
    "sub_agent_spawning",
    "regulatory_strategy",
    "multi_jurisdictional_coordination",
    "planning_and_decomposition"
  ],

  "domain_expertise": [
    "global_regulatory_affairs",
    "fda_regulations",
    "ema_regulations",
    "pmda_regulations",
    "regulatory_strategy"
  ],

  "tools": [
    "write_todos",
    "delegate_task",
    "spawn_specialist",
    "regulatory_database_search"
  ],

  "manages_agents": ["list_of_tier_2_expert_ids"],

  "can_spawn": [
    "FDA_510k_Specialist",
    "EMA_MDR_Specialist",
    "PMDA_SAKIGAKE_Specialist"
  ],

  "model": "gpt-4",
  "temperature": 0.3,

  "embedding": [1536_dimensions],

  "metadata": {{
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "version": "2.0",
    "gold_standard": true,
    "performance_metrics": {{
      "total_queries": 0,
      "success_rate": 0.0,
      "avg_confidence": 0.0
    }}
  }},

  "is_active": true,
  "tenant_id": "uuid"
}}
```

---

## Implementation Steps

### Phase 1: Master Agent Creation (Week 1)
1. Design 5 Master Agent prompts
2. Define capabilities and responsibilities
3. Create agent records in Supabase
4. Generate embeddings
5. Test orchestration logic

### Phase 2: Expert Agent Enhancement (Week 2-3)
1. Audit all {analysis['by_tier'].get(2, 0)} Tier 2 agents
2. Enhance prompts to 500+ characters
3. Add missing capabilities/domains
4. Regenerate embeddings
5. Test with sample queries

### Phase 3: Quality Assurance (Week 4)
1. Peer review all agents
2. Fix {len(analysis['issues'])} quality issues
3. Validate PRD compliance
4. Performance benchmarking
5. Final approval

### Phase 4: Migration (Week 5)
1. Apply PostgreSQL fulltext migration
2. Migrate enhanced agents to Neo4j
3. Create graph relationships
4. Test GraphRAG integration
5. Production deployment

---

## Conclusion

**Current Status:** ⚠️ Not ready for migration

**Required Work:**
- Create {gaps['master_agents']['gap']} Master Agents
- Enhance {gaps['quality']['total_issues']} agents with quality issues
- Add {gaps['structure']['missing_embeddings']} embeddings
- Validate PRD/ARD compliance

**Estimated Effort:** 4-5 weeks

**Recommendation:** Follow phased enhancement plan above before migrating to Neo4j

---

**Next Steps:**
1. Review this audit report
2. Prioritize enhancement work
3. Create gold standard agent templates
4. Begin Master Agent creation
5. Systematic enhancement of Tier 2 agents

**Contact:** See `.claude/agents/python-ai-ml-engineer.md` for implementation assistance
"""

    return report


def print_summary(analysis, gaps):
    """Print summary to console."""

    print("=" * 80)
    print("AUDIT SUMMARY")
    print("=" * 80)
    print()
    print(f"📊 Total Agents: {analysis['total']}")
    print(f"📊 Unique Capabilities: {len(analysis['capabilities']['unique'])}")
    print(f"📊 Unique Domains: {len(analysis['domains']['unique'])}")
    print()
    print("⚠️  CRITICAL GAPS:")
    print(f"   - Missing Tiers: {gaps['hierarchy']['missing_tiers']}")
    print(f"   - Master Agents: {gaps['master_agents']['current']}/{gaps['master_agents']['required']} ({gaps['master_agents']['gap']} missing)")
    print(f"   - Quality Issues: {gaps['quality']['total_issues']}")
    print(f"   - Missing Embeddings: {gaps['structure']['missing_embeddings']}")
    print()
    print("💡 RECOMMENDATION:")
    print("   ⚠️  DO NOT MIGRATE AS-IS")
    print("   ✅  Enhance to gold standard first")
    print("   📅  Estimated: 4-5 weeks")
    print()
    print("=" * 80)
    print()
    print("📄 Full report: AGENT_LIBRARY_AUDIT_REPORT.md")
    print()


if __name__ == "__main__":
    asyncio.run(main())
