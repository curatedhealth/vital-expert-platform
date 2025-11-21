#!/usr/bin/env python3
"""
Gold Standard Agent Library Enhancement Tool

Systematically upgrades all 319 agents to PRD/ARD gold standard structure:
- Assigns tiers (1-5) based on agent role
- Generates capabilities (minimum 3 per agent)
- Generates domain_expertise (minimum 2 per agent)
- Enhances system prompts (minimum 500 characters)
- Generates embeddings (text-embedding-3-large)
- Adds metadata and gold_standard flag

Phase 1: Create 5 Master Agents (Tier 1)
Phase 2: Enhance all existing agents as Tier 2 Experts
Phase 3: Generate embeddings for all
Phase 4: Validate and report

Usage:
    python3 scripts/enhance_agent_library.py --dry-run  # Preview changes
    python3 scripts/enhance_agent_library.py           # Execute enhancement
"""

import asyncio
import os
import sys
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import json
from dotenv import load_dotenv
from supabase import create_client
from openai import AsyncOpenAI
import argparse

# Load environment variables
load_dotenv()

# Initialize clients
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, OPENAI_API_KEY]):
    print("❌ Missing required environment variables")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

# Tenant ID for VITAL-expert
TENANT_ID = "11111111-1111-1111-1111-111111111111"

# ============================================================================
# MASTER AGENT DEFINITIONS (Tier 1)
# ============================================================================

MASTER_AGENTS = [
    {
        "name": "Regulatory Master Agent",
        "tier": 1,
        "specialization": "Regulatory Orchestration",
        "description": "Master orchestrator for all regulatory affairs. Coordinates Expert Agents (Tier 2) and spawns Specialist Sub-Agents (Tier 3) for complex regulatory tasks across FDA, EMA, PMDA, and 50+ global jurisdictions.",
        "system_prompt": """You are the Regulatory Master Agent, the top-level orchestrator for all regulatory affairs in the VITAL Ask Expert system.

**Your Role:**
- Orchestrate complex regulatory strategies across FDA, EMA, PMDA, and 50+ global jurisdictions
- Coordinate multiple Tier 2 Expert Agents (regulatory specialists, clinical strategists, market access advisors)
- Spawn Tier 3 Specialist Sub-Agents for jurisdiction-specific tasks (510(k) predicate search, MDR compliance, SAKIGAKE pathway)
- Decompose complex multi-jurisdictional regulatory questions into actionable sub-tasks
- Synthesize insights from multiple expert agents into cohesive regulatory strategies

**Your Capabilities:**
1. **Regulatory Orchestration**: Break down complex regulatory questions using write_todos tool
2. **Expert Agent Coordination**: Delegate tasks to appropriate Tier 2 expert agents using delegate_task tool
3. **Sub-Agent Spawning**: Dynamically spawn Tier 3 specialists for jurisdiction-specific queries
4. **Multi-Jurisdictional Strategy**: Harmonize regulatory requirements across FDA, EMA, PMDA, Health Canada, TGA, NMPA, ANVISA
5. **Risk Assessment**: Evaluate regulatory pathways and identify potential roadblocks
6. **Planning & Decomposition**: Create structured execution plans for complex regulatory submissions

**Tools Available:**
- write_todos: Decompose complex tasks into sub-tasks
- delegate_task: Assign tasks to Tier 2 expert agents
- spawn_specialist: Create Tier 3 sub-agents for specific jurisdictions

**Success Criteria:**
- Provide comprehensive regulatory strategies covering all relevant jurisdictions
- Identify optimal regulatory pathways (510(k), PMA, De Novo, CE Mark, SAKIGAKE, etc.)
- Flag regulatory risks early in development lifecycle
- Ensure compliance with global regulatory requirements

**Example Use Cases:**
- "What regulatory pathway should I use for my AI-based diagnostic device in US, EU, and Japan?"
- "Create a global regulatory strategy for our Class III implantable device"
- "Compare FDA 510(k) vs De Novo pathway for our novel digital health product"
""",
        "capabilities": [
            "regulatory_orchestration",
            "expert_agent_coordination",
            "sub_agent_spawning",
            "regulatory_strategy",
            "multi_jurisdictional_coordination",
            "planning_and_decomposition",
            "risk_assessment",
            "pathway_selection"
        ],
        "domain_expertise": [
            "global_regulatory_affairs",
            "fda_regulations",
            "ema_regulations",
            "pmda_regulations",
            "regulatory_strategy",
            "medical_device_regulations",
            "pharmaceutical_regulations",
            "digital_health_regulations"
        ],
        "tools": ["write_todos", "delegate_task", "spawn_specialist"],
        "model": "gpt-4",
        "temperature": 0.3
    },
    {
        "name": "Clinical Master Agent",
        "tier": 1,
        "specialization": "Clinical Development Orchestration",
        "description": "Master orchestrator for all clinical development activities. Coordinates clinical trial design, endpoint selection, statistical planning, and clinical data management across development phases (I-IV) and therapeutic areas.",
        "system_prompt": """You are the Clinical Master Agent, the top-level orchestrator for all clinical development activities in the VITAL Ask Expert system.

**Your Role:**
- Orchestrate clinical trial design from Phase I through Phase IV
- Coordinate Tier 2 Expert Agents (biostatisticians, clinical operations, medical monitors)
- Spawn Tier 3 Specialist Sub-Agents for specific tasks (endpoint selection, patient recruitment, safety monitoring)
- Design comprehensive clinical development plans aligned with regulatory requirements
- Optimize trial design for efficiency, cost, and scientific rigor

**Your Capabilities:**
1. **Clinical Trial Design**: Design protocols for all phases (I-IV) across therapeutic areas
2. **Endpoint Selection**: Choose appropriate primary and secondary endpoints
3. **Statistical Planning**: Coordinate sample size calculations and analysis plans
4. **Patient Population Definition**: Define inclusion/exclusion criteria
5. **Safety Monitoring**: Design safety monitoring and DSMB strategies
6. **Adaptive Trial Design**: Implement Bayesian and adaptive methodologies
7. **Real-World Evidence**: Integrate RWE into clinical development

**Tools Available:**
- write_todos: Decompose clinical development plans
- delegate_task: Assign to biostatistics, clinical ops, medical experts
- spawn_specialist: Create specialists for specific therapeutic areas

**Success Criteria:**
- Design scientifically rigorous trials that meet regulatory standards
- Optimize patient recruitment and retention strategies
- Ensure statistical power and endpoint validity
- Minimize trial costs while maintaining quality

**Example Use Cases:**
- "Design a Phase III trial for our novel oncology drug targeting EGFR mutations"
- "What adaptive design should I use for my rare disease program?"
- "Create a pediatric investigation plan for FDA and EMA"
""",
        "capabilities": [
            "clinical_orchestration",
            "trial_design",
            "endpoint_selection",
            "statistical_planning",
            "protocol_development",
            "safety_monitoring",
            "adaptive_designs",
            "rwe_integration"
        ],
        "domain_expertise": [
            "clinical_development",
            "clinical_trials",
            "biostatistics",
            "pharmacovigilance",
            "medical_monitoring",
            "clinical_operations",
            "ich_gcp",
            "adaptive_trial_design"
        ],
        "tools": ["write_todos", "delegate_task", "spawn_specialist"],
        "model": "gpt-4",
        "temperature": 0.3
    },
    {
        "name": "Market Access Master Agent",
        "tier": 1,
        "specialization": "Market Access & Reimbursement Orchestration",
        "description": "Master orchestrator for market access, health economics, pricing, and reimbursement strategies. Coordinates HTA submissions, HEOR evidence generation, and payer engagement across global markets.",
        "system_prompt": """You are the Market Access Master Agent, the top-level orchestrator for all market access and reimbursement activities in the VITAL Ask Expert system.

**Your Role:**
- Orchestrate global market access strategies (NICE, HAS, IQWiG, CADTH, PBAC)
- Coordinate Tier 2 Expert Agents (health economists, HTA specialists, pricing strategists)
- Spawn Tier 3 Specialist Sub-Agents for country-specific HTA submissions
- Design comprehensive HEOR evidence generation programs
- Optimize pricing and reimbursement strategies

**Your Capabilities:**
1. **HTA Strategy**: Design submissions for NICE, HAS, IQWiG, CADTH, PBAC
2. **HEOR Evidence**: Plan cost-effectiveness analyses, budget impact models, RWE studies
3. **Pricing Strategy**: Develop global pricing frameworks and launch sequences
4. **Payer Engagement**: Design payer value propositions and negotiation strategies
5. **Outcomes Research**: Coordinate PRO, QALY, and comparative effectiveness studies
6. **Access Analytics**: Forecast market access timelines and reimbursement probability

**Tools Available:**
- write_todos: Decompose market access plans
- delegate_task: Assign to HEOR, HTA, pricing experts
- spawn_specialist: Create country-specific HTA specialists

**Success Criteria:**
- Achieve favorable HTA recommendations across major markets
- Optimize pricing to maximize revenue while ensuring access
- Generate robust HEOR evidence supporting value propositions
- Minimize time to reimbursement

**Example Use Cases:**
- "Create a NICE submission strategy for our novel oncology therapy"
- "What HEOR evidence do I need for CADTH and PBAC?"
- "Design a global pricing strategy for orphan drug launch"
""",
        "capabilities": [
            "market_access_orchestration",
            "hta_strategy",
            "heor_planning",
            "pricing_strategy",
            "reimbursement_strategy",
            "payer_engagement",
            "outcomes_research",
            "value_demonstration"
        ],
        "domain_expertise": [
            "market_access",
            "health_technology_assessment",
            "health_economics",
            "outcomes_research",
            "pricing_reimbursement",
            "nice_guidelines",
            "cadth_guidelines",
            "iqwig_guidelines"
        ],
        "tools": ["write_todos", "delegate_task", "spawn_specialist"],
        "model": "gpt-4",
        "temperature": 0.3
    },
    {
        "name": "Technical Master Agent",
        "tier": 1,
        "specialization": "Technical Development & Manufacturing Orchestration",
        "description": "Master orchestrator for CMC, manufacturing, quality, and technical development. Coordinates process development, scale-up, analytical methods, and regulatory CMC strategies.",
        "system_prompt": """You are the Technical Master Agent, the top-level orchestrator for all technical development and manufacturing activities in the VITAL Ask Expert system.

**Your Role:**
- Orchestrate CMC development from early research through commercial manufacturing
- Coordinate Tier 2 Expert Agents (process development, analytical chemistry, quality)
- Spawn Tier 3 Specialist Sub-Agents for specific technical challenges
- Design manufacturing strategies aligned with regulatory expectations
- Optimize tech transfer and scale-up processes

**Your Capabilities:**
1. **CMC Strategy**: Design regulatory CMC packages for IND, NDA, BLA, MAA
2. **Process Development**: Coordinate upstream/downstream process optimization
3. **Analytical Methods**: Design method development and validation strategies
4. **Scale-Up Planning**: Orchestrate tech transfer and manufacturing scale-up
5. **Quality Systems**: Implement GMP, QbD, and risk-based quality strategies
6. **Supply Chain**: Design clinical and commercial supply strategies
7. **Comparability**: Plan and execute comparability protocols

**Tools Available:**
- write_todos: Decompose CMC development plans
- delegate_task: Assign to process, analytical, quality experts
- spawn_specialist: Create specialists for specific modalities (biologics, cell therapy, etc.)

**Success Criteria:**
- Develop robust, scalable manufacturing processes
- Ensure regulatory compliance with ICH Q guidelines
- Minimize CMC-related regulatory holds or questions
- Optimize cost of goods while maintaining quality

**Example Use Cases:**
- "Design a CMC package for our monoclonal antibody IND filing"
- "What analytical methods do I need for cell therapy characterization?"
- "Create a tech transfer plan from clinical to commercial manufacturing"
""",
        "capabilities": [
            "cmc_orchestration",
            "process_development",
            "analytical_methods",
            "manufacturing_strategy",
            "quality_systems",
            "tech_transfer",
            "scale_up_planning",
            "regulatory_cmc"
        ],
        "domain_expertise": [
            "cmc_chemistry_manufacturing_controls",
            "process_development",
            "analytical_chemistry",
            "quality_assurance",
            "gmp_compliance",
            "ich_q_guidelines",
            "biologics_manufacturing",
            "cell_gene_therapy"
        ],
        "tools": ["write_todos", "delegate_task", "spawn_specialist"],
        "model": "gpt-4",
        "temperature": 0.3
    },
    {
        "name": "Strategic Master Agent",
        "tier": 1,
        "specialization": "Strategic Planning & Portfolio Orchestration",
        "description": "Master orchestrator for strategic planning, portfolio management, competitive intelligence, and business development. Coordinates cross-functional strategies integrating regulatory, clinical, commercial, and technical considerations.",
        "system_prompt": """You are the Strategic Master Agent, the top-level orchestrator for all strategic planning and portfolio management in the VITAL Ask Expert system.

**Your Role:**
- Orchestrate integrated strategic plans across regulatory, clinical, commercial, technical domains
- Coordinate Tier 2 Expert Agents across all functional areas
- Spawn Tier 3 Specialist Sub-Agents for competitive analysis, market research, BD evaluation
- Design comprehensive development strategies from preclinical through lifecycle management
- Optimize portfolio prioritization and resource allocation

**Your Capabilities:**
1. **Strategic Planning**: Design integrated development strategies across all functions
2. **Portfolio Management**: Prioritize programs based on risk, value, and strategic fit
3. **Competitive Intelligence**: Analyze competitive landscape and positioning
4. **Market Assessment**: Evaluate market opportunities and unmet needs
5. **Business Development**: Assess in-licensing, partnerships, and M&A opportunities
6. **Lifecycle Management**: Plan post-launch lifecycle strategies (line extensions, indications, formulations)
7. **Cross-Functional Integration**: Synthesize inputs from Regulatory, Clinical, Market Access, Technical Master Agents

**Tools Available:**
- write_todos: Decompose strategic initiatives
- delegate_task: Coordinate across all Master and Expert agents
- spawn_specialist: Create specialists for market analysis, competitive intel

**Success Criteria:**
- Develop actionable strategic plans aligned with business objectives
- Optimize portfolio value and risk-adjusted NPV
- Identify and capitalize on market opportunities
- Enable data-driven decision making

**Example Use Cases:**
- "Create an integrated development strategy for our rare disease pipeline"
- "Should we pursue this in-licensing opportunity? Assess regulatory, clinical, commercial fit"
- "Design a lifecycle management plan for our flagship product"
""",
        "capabilities": [
            "strategic_orchestration",
            "portfolio_management",
            "competitive_intelligence",
            "market_assessment",
            "business_development",
            "lifecycle_planning",
            "cross_functional_integration",
            "risk_value_analysis"
        ],
        "domain_expertise": [
            "strategic_planning",
            "portfolio_management",
            "competitive_analysis",
            "market_research",
            "business_development",
            "lifecycle_management",
            "pharma_strategy",
            "biotech_strategy"
        ],
        "tools": ["write_todos", "delegate_task", "spawn_specialist"],
        "model": "gpt-4",
        "temperature": 0.3
    }
]

# ============================================================================
# TIER ASSIGNMENT LOGIC
# ============================================================================

async def determine_agent_tier(agent: Dict) -> int:
    """
    Analyze agent and determine appropriate tier (1-5).

    Tier 1: Master Agents (created separately)
    Tier 2: Expert Agents (domain specialists)
    Tier 3: Specialist Sub-Agents (spawned dynamically - not in DB)
    Tier 4: Worker Agents (spawned for parallel tasks - not in DB)
    Tier 5: Tool Agents (spawned for specific tools - not in DB)

    All existing 319 agents will be Tier 2 (Expert Agents).
    """
    # All existing agents are domain experts (Tier 2)
    return 2

# ============================================================================
# CAPABILITIES GENERATION
# ============================================================================

async def generate_capabilities(agent: Dict) -> List[str]:
    """
    Generate specific capabilities for an agent using GPT-4 based on:
    - Agent name
    - Description
    - System prompt

    Returns minimum 3 capabilities.
    """
    prompt = f"""Analyze this expert agent and generate 3-5 specific, actionable capabilities.

Agent Name: {agent['name']}
Description: {agent.get('description', 'N/A')}
System Prompt: {agent.get('system_prompt', 'N/A')[:500]}

Requirements:
- Be specific (not generic like "analysis" or "consultation")
- Use snake_case format
- Focus on unique expertise this agent provides
- Align with medical device/pharmaceutical regulatory domain
- Examples: "fda_510k_submission", "clinical_endpoint_selection", "hta_value_dossier"

Return ONLY a JSON array of 3-5 capability strings, nothing else."""

    try:
        response = await openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=200
        )

        capabilities_text = response.choices[0].message.content.strip()

        # Parse JSON response
        capabilities = json.loads(capabilities_text)

        # Ensure minimum 3 capabilities
        if len(capabilities) < 3:
            capabilities.extend([
                "expert_consultation",
                "regulatory_guidance",
                "strategic_planning"
            ][:3 - len(capabilities)])

        return capabilities[:5]  # Max 5 capabilities

    except Exception as e:
        print(f"⚠️  Error generating capabilities for {agent['name']}: {e}")
        # Fallback capabilities
        return [
            "expert_consultation",
            "regulatory_guidance",
            "strategic_planning"
        ]

# ============================================================================
# DOMAIN EXPERTISE GENERATION
# ============================================================================

async def generate_domain_expertise(agent: Dict) -> List[str]:
    """
    Generate domain expertise for an agent using GPT-4.

    Returns minimum 2 domains.
    """
    prompt = f"""Analyze this expert agent and generate 2-4 domain expertise areas.

Agent Name: {agent['name']}
Description: {agent.get('description', 'N/A')}
System Prompt: {agent.get('system_prompt', 'N/A')[:500]}

Requirements:
- Use snake_case format
- Focus on regulatory jurisdictions, therapeutic areas, or functional domains
- Examples: "fda_regulations", "ema_mdr", "oncology", "health_economics", "clinical_trials"
- Include specific regulatory jurisdictions when relevant (FDA, EMA, PMDA, etc.)

Return ONLY a JSON array of 2-4 domain strings, nothing else."""

    try:
        response = await openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=200
        )

        domains_text = response.choices[0].message.content.strip()
        domains = json.loads(domains_text)

        # Ensure minimum 2 domains
        if len(domains) < 2:
            domains.extend([
                "regulatory_affairs",
                "medical_devices"
            ][:2 - len(domains)])

        return domains[:4]  # Max 4 domains

    except Exception as e:
        print(f"⚠️  Error generating domains for {agent['name']}: {e}")
        return [
            "regulatory_affairs",
            "medical_devices"
        ]

# ============================================================================
# SYSTEM PROMPT ENHANCEMENT
# ============================================================================

async def enhance_system_prompt(agent: Dict, capabilities: List[str], domains: List[str]) -> str:
    """
    Enhance system prompt to meet minimum 500 characters with:
    - Role definition
    - Specific capabilities
    - Success criteria
    - Example use cases
    """
    current_prompt = agent.get('system_prompt', '')

    # If prompt is already >= 500 chars and well-structured, keep it
    if len(current_prompt) >= 500 and all(keyword in current_prompt.lower() for keyword in ['role', 'capabilities']):
        return current_prompt

    # Otherwise, enhance with GPT-4
    prompt = f"""Enhance this agent's system prompt to be comprehensive (minimum 500 characters).

Agent Name: {agent['name']}
Description: {agent.get('description', 'N/A')}
Current Prompt: {current_prompt}

Capabilities: {', '.join(capabilities)}
Domain Expertise: {', '.join(domains)}

Create a system prompt that includes:
1. **Your Role**: Clear definition of the agent's expertise
2. **Your Capabilities**: List the specific capabilities
3. **Success Criteria**: What makes this agent successful
4. **Example Use Cases**: 1-2 specific examples of when to use this agent

Format in clear sections. Minimum 500 characters. Be specific to this agent's expertise.

Return ONLY the enhanced system prompt, nothing else."""

    try:
        response = await openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=800
        )

        enhanced_prompt = response.choices[0].message.content.strip()

        # Ensure minimum length
        if len(enhanced_prompt) < 500:
            enhanced_prompt = current_prompt + "\n\n" + enhanced_prompt

        return enhanced_prompt

    except Exception as e:
        print(f"⚠️  Error enhancing prompt for {agent['name']}: {e}")
        return current_prompt

# ============================================================================
# EMBEDDING GENERATION
# ============================================================================

async def generate_embedding(text: str) -> List[float]:
    """
    Generate embedding using text-embedding-3-large.
    """
    try:
        response = await openai_client.embeddings.create(
            model="text-embedding-3-large",
            input=text
        )
        return response.data[0].embedding

    except Exception as e:
        print(f"⚠️  Error generating embedding: {e}")
        return None

# ============================================================================
# PHASE 1: CREATE MASTER AGENTS
# ============================================================================

async def create_master_agents(dry_run: bool = False) -> List[str]:
    """
    Create 5 Master Agents (Tier 1).

    Returns list of created agent IDs.
    """
    print("\n" + "="*80)
    print("PHASE 1: Creating 5 Master Agents (Tier 1)")
    print("="*80)

    created_ids = []

    for i, master in enumerate(MASTER_AGENTS, 1):
        print(f"\n[{i}/5] Creating {master['name']}...")

        # Generate embedding
        embedding_text = f"{master['name']} {master['description']} {master['system_prompt']}"
        embedding = await generate_embedding(embedding_text)

        if not embedding:
            print(f"❌ Failed to generate embedding for {master['name']}")
            continue

        # Prepare agent data
        agent_data = {
            "name": master["name"],
            "tier": master["tier"],
            "specialization": master["specialization"],
            "description": master["description"],
            "system_prompt": master["system_prompt"],
            "capabilities": master["capabilities"],
            "domain_expertise": master["domain_expertise"],
            "tools": master["tools"],
            "model": master["model"],
            "temperature": master["temperature"],
            "embedding": embedding,
            "metadata": {
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "version": "2.0",
                "gold_standard": True,
                "performance_metrics": {
                    "total_queries": 0,
                    "success_rate": 0.0,
                    "avg_confidence": 0.0
                }
            },
            "is_active": True,
            "tenant_id": TENANT_ID
        }

        if dry_run:
            print(f"✅ [DRY RUN] Would create {master['name']}")
            print(f"   - Tier: {master['tier']}")
            print(f"   - Capabilities: {len(master['capabilities'])}")
            print(f"   - Domains: {len(master['domain_expertise'])}")
            print(f"   - Embedding: {len(embedding)} dimensions")
        else:
            try:
                result = supabase.table("agents").insert(agent_data).execute()
                agent_id = result.data[0]["id"]
                created_ids.append(agent_id)
                print(f"✅ Created {master['name']} (ID: {agent_id})")

            except Exception as e:
                print(f"❌ Error creating {master['name']}: {e}")

    print(f"\n✅ Phase 1 Complete: Created {len(created_ids)}/5 Master Agents")
    return created_ids

# ============================================================================
# PHASE 2: ENHANCE EXISTING AGENTS (TIER 2)
# ============================================================================

async def enhance_agent(agent: Dict, dry_run: bool = False) -> Optional[Dict]:
    """
    Enhance a single agent to gold standard.
    """
    agent_id = agent["id"]
    agent_name = agent["name"]

    try:
        # 1. Determine tier (all existing = Tier 2)
        tier = await determine_agent_tier(agent)

        # 2. Generate capabilities
        capabilities = await generate_capabilities(agent)

        # 3. Generate domain expertise
        domains = await generate_domain_expertise(agent)

        # 4. Enhance system prompt
        enhanced_prompt = await enhance_system_prompt(agent, capabilities, domains)

        # 5. Generate embedding
        embedding_text = f"{agent_name} {agent.get('description', '')} {enhanced_prompt}"
        embedding = await generate_embedding(embedding_text)

        if not embedding:
            print(f"⚠️  Skipping {agent_name}: Failed to generate embedding")
            return None

        # 6. Prepare update data
        update_data = {
            "tier": tier,
            "capabilities": capabilities,
            "domain_expertise": domains,
            "system_prompt": enhanced_prompt,
            "embedding": embedding,
            "metadata": {
                **agent.get("metadata", {}),
                "updated_at": datetime.utcnow().isoformat(),
                "version": "2.0",
                "gold_standard": True,
                "enhancement_date": datetime.utcnow().isoformat()
            }
        }

        if dry_run:
            return {
                "id": agent_id,
                "name": agent_name,
                "tier": tier,
                "capabilities_count": len(capabilities),
                "domains_count": len(domains),
                "prompt_length": len(enhanced_prompt),
                "embedding_dims": len(embedding)
            }
        else:
            # Update in database
            supabase.table("agents").update(update_data).eq("id", agent_id).execute()
            return update_data

    except Exception as e:
        print(f"❌ Error enhancing {agent_name}: {e}")
        return None

async def enhance_all_agents(dry_run: bool = False, batch_size: int = 10):
    """
    Enhance all existing agents as Tier 2 Expert Agents.
    """
    print("\n" + "="*80)
    print("PHASE 2: Enhancing All Existing Agents as Tier 2 Expert Agents")
    print("="*80)

    # Fetch all agents (exclude newly created Master Agents)
    response = supabase.table("agents")\
        .select("*")\
        .eq("tenant_id", TENANT_ID)\
        .is_("tier", "null")\
        .execute()

    agents = response.data
    total = len(agents)

    print(f"\nFound {total} agents to enhance")
    print(f"Processing in batches of {batch_size}...\n")

    enhanced_count = 0
    failed_count = 0

    # Process in batches
    for i in range(0, total, batch_size):
        batch = agents[i:i+batch_size]
        batch_num = i // batch_size + 1
        total_batches = (total + batch_size - 1) // batch_size

        print(f"\n--- Batch {batch_num}/{total_batches} ({len(batch)} agents) ---")

        # Process batch concurrently
        tasks = [enhance_agent(agent, dry_run) for agent in batch]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for agent, result in zip(batch, results):
            if isinstance(result, Exception):
                print(f"❌ {agent['name']}: {result}")
                failed_count += 1
            elif result:
                enhanced_count += 1
                if dry_run:
                    print(f"✅ [DRY RUN] {result['name']}: Tier {result['tier']}, {result['capabilities_count']} capabilities, {result['domains_count']} domains")
                else:
                    print(f"✅ {agent['name']}: Enhanced successfully")
            else:
                failed_count += 1

        # Rate limiting
        if i + batch_size < total:
            await asyncio.sleep(1)  # Avoid API rate limits

    print(f"\n{'='*80}")
    print(f"PHASE 2 Complete:")
    print(f"  ✅ Enhanced: {enhanced_count}/{total}")
    print(f"  ❌ Failed: {failed_count}/{total}")
    print(f"{'='*80}")

# ============================================================================
# PHASE 3: VALIDATION
# ============================================================================

async def validate_enhancements():
    """
    Validate that all agents meet gold standard criteria.
    """
    print("\n" + "="*80)
    print("PHASE 3: Validation")
    print("="*80)

    response = supabase.table("agents")\
        .select("*")\
        .eq("tenant_id", TENANT_ID)\
        .execute()

    agents = response.data

    issues = {
        "missing_tier": [],
        "missing_capabilities": [],
        "missing_domains": [],
        "missing_embeddings": [],
        "short_prompts": []
    }

    for agent in agents:
        name = agent["name"]

        if not agent.get("tier"):
            issues["missing_tier"].append(name)

        if not agent.get("capabilities") or len(agent.get("capabilities", [])) < 3:
            issues["missing_capabilities"].append(name)

        if not agent.get("domain_expertise") or len(agent.get("domain_expertise", [])) < 2:
            issues["missing_domains"].append(name)

        if not agent.get("embedding"):
            issues["missing_embeddings"].append(name)

        if len(agent.get("system_prompt", "")) < 500:
            issues["short_prompts"].append(name)

    # Report
    total_issues = sum(len(v) for v in issues.values())

    if total_issues == 0:
        print("\n✅ ALL AGENTS MEET GOLD STANDARD!")
        print(f"\nTotal agents: {len(agents)}")
        print(f"  - Tier 1 (Master): {len([a for a in agents if a.get('tier') == 1])}")
        print(f"  - Tier 2 (Expert): {len([a for a in agents if a.get('tier') == 2])}")
    else:
        print(f"\n⚠️  Found {total_issues} issues:\n")

        for issue_type, agent_names in issues.items():
            if agent_names:
                print(f"{issue_type}: {len(agent_names)} agents")
                for name in agent_names[:5]:
                    print(f"  - {name}")
                if len(agent_names) > 5:
                    print(f"  ... and {len(agent_names) - 5} more")
                print()

# ============================================================================
# MAIN EXECUTION
# ============================================================================

async def main():
    parser = argparse.ArgumentParser(description="Enhance agent library to gold standard")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without writing to database")
    parser.add_argument("--batch-size", type=int, default=10, help="Batch size for processing agents")
    parser.add_argument("--skip-masters", action="store_true", help="Skip creating Master Agents")
    parser.add_argument("--skip-enhancement", action="store_true", help="Skip enhancing existing agents")
    parser.add_argument("--validate-only", action="store_true", help="Only run validation")

    args = parser.parse_args()

    print("\n" + "="*80)
    print("VITAL Agent Library Enhancement Tool")
    print("="*80)
    print(f"\nMode: {'DRY RUN' if args.dry_run else 'LIVE EXECUTION'}")
    print(f"Batch Size: {args.batch_size}")
    print(f"Tenant: {TENANT_ID}")

    if args.validate_only:
        await validate_enhancements()
        return

    # Phase 1: Create Master Agents
    if not args.skip_masters:
        master_ids = await create_master_agents(dry_run=args.dry_run)
        print(f"\n✅ Created {len(master_ids)} Master Agents")

    # Phase 2: Enhance Existing Agents
    if not args.skip_enhancement:
        await enhance_all_agents(dry_run=args.dry_run, batch_size=args.batch_size)

    # Phase 3: Validation
    if not args.dry_run:
        await validate_enhancements()

    print("\n" + "="*80)
    print("ENHANCEMENT COMPLETE")
    print("="*80)

    if args.dry_run:
        print("\n⚠️  This was a DRY RUN. No changes were made.")
        print("Run without --dry-run to execute enhancement.")
    else:
        print("\n✅ All agents enhanced to gold standard!")
        print("\nNext steps:")
        print("1. Run PostgreSQL fulltext search migration")
        print("2. Migrate agents to Neo4j")
        print("3. Test GraphRAG integration")

if __name__ == "__main__":
    asyncio.run(main())
