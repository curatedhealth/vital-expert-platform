"""
Complete Agent Orchestration Integration Example

This file demonstrates how to integrate the UnifiedAgentLoader and
AgentPoolManager services into LangGraph workflows for all Ask Expert modes.

Shows:
- Mode 1: Manual agent selection and loading
- Mode 2: Automatic agent selection
- Mode 3: Persistent agent with sub-agent spawning
- Mode 4: Automatic persistent agent

Author: LangGraph Orchestration Architect
Date: November 21, 2025
"""

import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
import structlog

# Import our agent services
from services.unified_agent_loader import UnifiedAgentLoader, AgentProfile
from services.agent_pool_manager import AgentPoolManager
from services.sub_agent_spawner import SubAgentSpawner
from services.supabase_client import get_supabase_client

logger = structlog.get_logger()


# ============================================================================
# EXAMPLE 1: MODE 1 - MANUAL AGENT SELECTION
# ============================================================================

async def example_mode1_manual_selection():
    """
    Mode 1: User manually selects agent, multi-turn conversation.

    Flow:
    1. Frontend sends selected_agent_id
    2. Backend loads agent profile from database
    3. Build SystemMessage from agent's system_prompt
    4. Load sub-agent pool for specialists
    5. Execute conversation with loaded agent
    """
    print("\n" + "="*80)
    print("EXAMPLE 1: MODE 1 - MANUAL AGENT SELECTION")
    print("="*80)

    # Simulate frontend request
    request = {
        "mode": "mode_1_interactive_manual",
        "user_id": "user_123",
        "tenant_id": "tenant_456",
        "session_id": "session_789",
        "agent_selection": {
            "selected_agent_id": "fda_510k_expert_uuid"  # User selected this
        },
        "query": "What are the testing requirements for a Class II cardiac monitor 510(k)?"
    }

    # Initialize services
    supabase = get_supabase_client()
    agent_loader = UnifiedAgentLoader(supabase)
    sub_agent_spawner = SubAgentSpawner()

    try:
        # Step 1: Load agent profile
        print("\n[1] Loading agent profile...")
        agent_profile = await agent_loader.load_agent_by_id(
            agent_id=request["agent_selection"]["selected_agent_id"],
            tenant_id=request["tenant_id"],
            user_id=request["user_id"]
        )

        print(f"✓ Loaded: {agent_profile.display_name}")
        print(f"  Domain: {agent_profile.domain_expertise}")
        print(f"  Tier: {agent_profile.tier}")
        print(f"  Capabilities: {', '.join(agent_profile.capabilities[:3])}...")

        # Step 2: Build agent persona message
        print("\n[2] Building agent persona...")
        persona_message = SystemMessage(content=agent_profile.system_prompt)
        print(f"✓ Persona message created ({len(agent_profile.system_prompt)} chars)")

        # Step 3: Load sub-agent pool
        print("\n[3] Loading sub-agent pool...")
        sub_agents = await agent_loader.load_sub_agent_pool(
            parent_agent=agent_profile,
            tenant_id=request["tenant_id"]
        )
        print(f"✓ Loaded {len(sub_agents)} sub-agents:")
        for sa in sub_agents:
            print(f"  - {sa.display_name} ({sa.domain_expertise})")

        # Step 4: Execute conversation (simplified)
        print("\n[4] Executing conversation...")
        llm = ChatOpenAI(
            model=agent_profile.model,
            temperature=agent_profile.temperature,
            max_tokens=agent_profile.max_tokens
        )

        messages = [
            persona_message,
            HumanMessage(content=request["query"])
        ]

        response = await llm.ainvoke(messages)

        print(f"✓ Response generated ({len(response.content)} chars)")
        print(f"\n--- Response Preview ---")
        print(response.content[:200] + "...")

        # Step 5: Determine if specialists needed (simplified logic)
        print("\n[5] Analyzing specialist needs...")
        needs_specialists = "testing" in request["query"].lower()

        if needs_specialists and sub_agents:
            print("✓ Spawning specialist: Testing Requirements Expert")

            # Spawn specialist
            sub_agent_id = await sub_agent_spawner.spawn_specialist(
                parent_agent_id=agent_profile.id,
                task="Identify specific testing requirements",
                specialty="Testing Requirements",
                context={
                    "query": request["query"],
                    "parent_response": response.content[:500]
                },
                model=sub_agents[0].model
            )

            print(f"✓ Spawned sub-agent: {sub_agent_id}")

            # Execute specialist (simplified)
            # In production, this would call sub_agent_spawner.execute_sub_agent()
            print("✓ Specialist execution complete")

        print("\n✅ Mode 1 workflow complete!")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        logger.error("mode1_example_failed", error=str(e))


# ============================================================================
# EXAMPLE 2: MODE 2 - AUTOMATIC AGENT SELECTION
# ============================================================================

async def example_mode2_auto_selection():
    """
    Mode 2: System automatically selects best agent based on query.

    Flow:
    1. Frontend sends query with auto_select=true
    2. Backend gets available agents for tenant
    3. Score agents for query relevance
    4. Select best agent
    5. Load agent profile and execute
    """
    print("\n" + "="*80)
    print("EXAMPLE 2: MODE 2 - AUTOMATIC AGENT SELECTION")
    print("="*80)

    # Simulate frontend request
    request = {
        "mode": "mode_2_interactive_auto",
        "user_id": "user_123",
        "tenant_id": "tenant_456",
        "session_id": "session_790",
        "agent_selection": {
            "auto_select": True,
            "preferred_domain": "regulatory"  # Optional hint
        },
        "query": "How do I determine substantial equivalence for my device?"
    }

    # Initialize services
    supabase = get_supabase_client()
    agent_loader = UnifiedAgentLoader(supabase)
    pool_manager = AgentPoolManager(supabase, agent_loader)

    try:
        # Step 1: Get available agents
        print("\n[1] Getting available agents...")
        available_agents = await pool_manager.get_available_agents(
            tenant_id=request["tenant_id"],
            domain=request["agent_selection"].get("preferred_domain")
        )

        print(f"✓ Found {len(available_agents)} available agents")
        for agent in available_agents[:3]:
            print(f"  - {agent.display_name} (Tier {agent.tier}, {agent.domain_expertise})")

        # Step 2: Score agents for query
        print("\n[2] Scoring agents for query relevance...")
        scored_agents = await pool_manager.score_agents_for_query(
            query=request["query"],
            agents=available_agents,
            min_score=0.1
        )

        print(f"✓ Scored {len(scored_agents)} agents:")
        for agent, score in scored_agents[:5]:
            print(f"  - {agent.display_name}: {score:.2f}")

        # Step 3: Select best agent
        print("\n[3] Selecting best agent...")
        best_agent, confidence = scored_agents[0]

        print(f"✓ Selected: {best_agent.display_name}")
        print(f"  Confidence: {confidence:.2f}")
        print(f"  Reasoning: High relevance to query about substantial equivalence")

        # Step 4: Execute conversation (same as Mode 1)
        print("\n[4] Executing conversation...")
        llm = ChatOpenAI(
            model=best_agent.model,
            temperature=best_agent.temperature
        )

        messages = [
            SystemMessage(content=best_agent.system_prompt),
            HumanMessage(content=request["query"])
        ]

        response = await llm.ainvoke(messages)

        print(f"✓ Response generated ({len(response.content)} chars)")
        print(f"\n--- Response Preview ---")
        print(response.content[:200] + "...")

        print("\n✅ Mode 2 workflow complete!")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        logger.error("mode2_example_failed", error=str(e))


# ============================================================================
# EXAMPLE 3: AGENT HANDOFF (Mode 2/4)
# ============================================================================

async def example_agent_handoff():
    """
    Demonstrates agent handoff when current agent determines
    a specialist is better suited for the query.

    Flow:
    1. User asks general regulatory question
    2. General agent realizes question is FDA-specific
    3. Agent hands off to FDA specialist
    4. Specialist answers question
    """
    print("\n" + "="*80)
    print("EXAMPLE 3: AGENT HANDOFF")
    print("="*80)

    # Simulate conversation state
    request = {
        "mode": "mode_2_interactive_auto",
        "user_id": "user_123",
        "tenant_id": "tenant_456",
        "session_id": "session_791",
        "current_agent_id": "general_regulatory_expert_uuid",
        "query": "What are the specific Class III PMA requirements for cardiovascular devices?"
    }

    supabase = get_supabase_client()
    agent_loader = UnifiedAgentLoader(supabase)
    pool_manager = AgentPoolManager(supabase, agent_loader)

    try:
        # Step 1: Load current agent
        print("\n[1] Loading current agent...")
        current_agent = await agent_loader.load_agent_by_id(
            agent_id=request["current_agent_id"],
            tenant_id=request["tenant_id"]
        )
        print(f"✓ Current: {current_agent.display_name} ({current_agent.domain_expertise})")

        # Step 2: Agent analyzes query and determines handoff needed
        print("\n[2] Analyzing query for handoff need...")

        # Simulate agent reasoning (in production, this would be an LLM call)
        # The agent would analyze the query and determine if it needs specialist
        handoff_needed = "PMA" in request["query"] and "cardiovascular" in request["query"]

        if handoff_needed:
            print("✓ Handoff needed: Query requires FDA PMA specialist")

            # Step 3: Find appropriate specialist
            print("\n[3] Finding specialist agent...")

            available_agents = await pool_manager.get_available_agents(
                tenant_id=request["tenant_id"],
                domain="regulatory"
            )

            # Score for PMA expertise
            scored_agents = await pool_manager.score_agents_for_query(
                query=request["query"],
                agents=available_agents
            )

            specialist, score = scored_agents[0]

            print(f"✓ Handoff to: {specialist.display_name}")
            print(f"  Relevance: {score:.2f}")

            # Step 4: Execute with specialist
            print("\n[4] Executing with specialist...")
            llm = ChatOpenAI(model=specialist.model)

            messages = [
                SystemMessage(content=specialist.system_prompt),
                SystemMessage(content=f"Handed off from {current_agent.display_name} because this query requires PMA expertise."),
                HumanMessage(content=request["query"])
            ]

            response = await llm.ainvoke(messages)

            print(f"✓ Specialist response generated")
            print(f"\n--- Response Preview ---")
            print(response.content[:200] + "...")

        print("\n✅ Agent handoff complete!")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        logger.error("handoff_example_failed", error=str(e))


# ============================================================================
# EXAMPLE 4: COMPLETE WORKFLOW WITH SUB-AGENTS
# ============================================================================

async def example_complete_workflow():
    """
    Complete workflow demonstrating:
    - Agent loading
    - RAG context retrieval
    - Agent reasoning
    - Sub-agent spawning
    - Tool execution
    - Response generation
    """
    print("\n" + "="*80)
    print("EXAMPLE 4: COMPLETE WORKFLOW WITH SUB-AGENTS")
    print("="*80)

    request = {
        "mode": "mode_1_interactive_manual",
        "user_id": "user_123",
        "tenant_id": "tenant_456",
        "agent_selection": {
            "selected_agent_id": "fda_510k_expert_uuid"
        },
        "query": "Find similar 510(k) predicates for a wearable cardiac monitoring patch and outline required testing.",
        "config": {
            "enable_rag": True,
            "enable_tools": True,
            "enable_sub_agents": True
        }
    }

    supabase = get_supabase_client()
    agent_loader = UnifiedAgentLoader(supabase)
    sub_agent_spawner = SubAgentSpawner()

    try:
        # Phase 1: Initialization
        print("\n=== PHASE 1: INITIALIZATION ===")

        print("\n[1.1] Load agent...")
        agent = await agent_loader.load_agent_by_id(
            request["agent_selection"]["selected_agent_id"],
            request["tenant_id"]
        )
        print(f"✓ Loaded: {agent.display_name}")

        print("\n[1.2] Load conversation history...")
        # In production: query ask_expert_messages table
        conversation_history = []  # Simulated
        print(f"✓ Loaded {len(conversation_history)} previous messages")

        # Phase 2: Context Enrichment
        print("\n=== PHASE 2: CONTEXT ENRICHMENT ===")

        print("\n[2.1] RAG retrieval...")
        # In production: use UnifiedRAGService
        rag_context = [
            {"content": "510(k) guidance for wearable devices...", "source": "FDA Guidance"},
            {"content": "Testing requirements for cardiac monitors...", "source": "ISO 13485"}
        ]
        print(f"✓ Retrieved {len(rag_context)} knowledge chunks")

        # Phase 3: Reasoning & Planning
        print("\n=== PHASE 3: REASONING & PLANNING ===")

        print("\n[3.1] Agent reasoning...")
        # Simplified: agent analyzes query
        needs_specialists = True  # Predicate search + testing requirements
        needs_tools = True  # FDA database search

        print(f"✓ Needs specialists: {needs_specialists}")
        print(f"✓ Needs tools: {needs_tools}")

        # Phase 4: Sub-Agent Orchestration
        if needs_specialists:
            print("\n=== PHASE 4: SUB-AGENT ORCHESTRATION ===")

            # Load sub-agents
            sub_agents = await agent_loader.load_sub_agent_pool(agent, request["tenant_id"])
            print(f"\n[4.1] Loaded {len(sub_agents)} sub-agents")

            # Spawn specialists
            print("\n[4.2] Spawning specialists...")

            specialist_1_id = await sub_agent_spawner.spawn_specialist(
                parent_agent_id=agent.id,
                task="Search FDA 510(k) database for similar predicates",
                specialty="Predicate Device Search",
                context={"query": request["query"]},
                model="gpt-4"
            )
            print(f"✓ Spawned: Predicate Search Specialist")

            specialist_2_id = await sub_agent_spawner.spawn_specialist(
                parent_agent_id=agent.id,
                task="Identify required testing for cardiac monitoring",
                specialty="Testing Requirements",
                context={"query": request["query"]},
                model="gpt-4"
            )
            print(f"✓ Spawned: Testing Requirements Specialist")

            # Execute specialists (simplified)
            print("\n[4.3] Executing specialists...")
            specialist_results = [
                {"specialty": "Predicate Search", "result": "Found 3 potential predicates..."},
                {"specialty": "Testing", "result": "Required: EMC testing, biocompatibility..."}
            ]
            print(f"✓ Collected {len(specialist_results)} specialist results")

        # Phase 5: Tool Execution
        if needs_tools:
            print("\n=== PHASE 5: TOOL EXECUTION ===")

            print("\n[5.1] Executing tools...")
            tool_results = [
                {"tool": "fda_database_search", "result": "K123456, K234567, K345678"},
                {"tool": "standards_search", "result": "IEC 60601-2-47 applicable"}
            ]
            print(f"✓ Executed {len(tool_results)} tools")

        # Phase 6: Response Generation
        print("\n=== PHASE 6: RESPONSE GENERATION ===")

        print("\n[6.1] Synthesizing response...")
        # Build comprehensive prompt with all context
        llm = ChatOpenAI(model=agent.model)

        context_summary = "\n".join([f"- {c['content']}" for c in rag_context])
        specialist_summary = "\n".join([f"- {r['specialty']}: {r['result']}" for r in specialist_results])
        tool_summary = "\n".join([f"- {t['tool']}: {t['result']}" for t in tool_results])

        messages = [
            SystemMessage(content=agent.system_prompt),
            SystemMessage(content=f"Knowledge Base Context:\n{context_summary}"),
            SystemMessage(content=f"Specialist Analysis:\n{specialist_summary}"),
            SystemMessage(content=f"Tool Results:\n{tool_summary}"),
            HumanMessage(content=request["query"])
        ]

        response = await llm.ainvoke(messages)

        print(f"✓ Response generated ({len(response.content)} chars)")
        print(f"\n--- Response Preview ---")
        print(response.content[:300] + "...")

        # Phase 7: Persistence
        print("\n=== PHASE 7: PERSISTENCE ===")

        print("\n[7.1] Saving conversation...")
        # In production: INSERT into ask_expert_messages
        print("✓ Messages saved to database")

        print("\n[7.2] Logging analytics...")
        # In production: INSERT into ask_expert_agent_executions
        print("✓ Analytics logged")

        print("\n✅ Complete workflow finished!")

        # Summary
        print("\n" + "="*80)
        print("WORKFLOW SUMMARY")
        print("="*80)
        print(f"Agent: {agent.display_name}")
        print(f"Sub-agents spawned: {len(specialist_results)}")
        print(f"Tools executed: {len(tool_results)}")
        print(f"RAG chunks: {len(rag_context)}")
        print(f"Response length: {len(response.content)} chars")
        print("="*80)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        logger.error("complete_workflow_failed", error=str(e))


# ============================================================================
# MAIN
# ============================================================================

async def main():
    """Run all examples."""
    print("\n" + "="*80)
    print("AGENT ORCHESTRATION INTEGRATION EXAMPLES")
    print("="*80)

    # Run examples
    await example_mode1_manual_selection()
    await asyncio.sleep(1)

    await example_mode2_auto_selection()
    await asyncio.sleep(1)

    await example_agent_handoff()
    await asyncio.sleep(1)

    await example_complete_workflow()

    print("\n" + "="*80)
    print("ALL EXAMPLES COMPLETE")
    print("="*80)


if __name__ == "__main__":
    asyncio.run(main())
