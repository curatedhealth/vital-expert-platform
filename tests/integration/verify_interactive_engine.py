import asyncio
import time
from unittest.mock import AsyncMock

from langchain_core.messages import HumanMessage

from modules.expert.workflows.interactive_workflow import InteractiveWorkflowBuilder
from modules.expert.services.context_enricher import ContextEnrichmentService


class _DummyAgent:
    async def execute(self, task, params, context):
        return {"analysis": "ok", "citations": ["c1"], "output": "ok"}


class _DummyAgentFactory:
    async def load_agent(self, agent_id):
        return _DummyAgent()


async def run_smoke_test():
    print("🚀 Starting Interactive Engine Smoke Test (L3/L4 Hybrid)...")

    # 1. Mock selector for Mode 2
    mock_selector = AsyncMock()
    mock_selector.select_team.return_value = {
        "team_composition": [{"id": "agent-123", "name": "Dr. L2 Expert"}]
    }

    # 2. Real enrichment service with mocked L3/L4 for speed
    enricher = ContextEnrichmentService()
    enricher.strategist.analyze_query = AsyncMock(
        return_value={
            "intent": "clinical_inquiry",
            "expanded_terms": ["Adverse Events", "Tox"],
            "recommended_tools": ["L5-PM"],
        }
    )
    enricher.evidence_worker.execute = AsyncMock(
        return_value={
            "output": "Patient shows no contraindications.",
            "facts": "Patient shows no contraindications.",
            "citations": ["[Source: PubMed-123]"],
        }
    )

    # 3. Build workflow
    builder = InteractiveWorkflowBuilder(
        selector_service=mock_selector,
        agent_factory=_DummyAgentFactory(),
        enrichment_service=enricher,
        timeout_seconds=2.5,
    )
    workflow = builder.build()

    # 4. Test Case: Mode 2 Auto-Select + Enrichment
    print("\n🧪 Executing Mode 2 Workflow...")
    initial_state = {
        "messages": [HumanMessage(content="Safety profile of Drug X?")],
        "tenant_id": "test-tenant",
        "user_id": "user-1",
        "mode": 2,
        "expert_id": None,
        "enriched_context": {},
        "ui_updates": [],
    }

    final_state = await workflow.ainvoke(initial_state)

    print(f"   - Selected Agent: {final_state.get('expert_id')}")
    assert final_state.get("expert_id") == "agent-123", "❌ Agent auto-selection failed"

    context = final_state.get("enriched_context")
    print(f"   - Context Keys: {list(context.keys())}")
    assert context.get("intent") == "clinical_inquiry", "❌ L3 Intent analysis missing"
    assert "citations" in context, "❌ L4 Citations missing"

    # 5. Latency / Timeout Test
    print("\n🧪 Test Case 2: Enrichment Timeout Safety")

    async def slow_l4(*args, **kwargs):
        await asyncio.sleep(3.0)
        return {"output": "Too slow"}

    enricher.evidence_worker.execute = slow_l4

    start = time.time()
    result = await enricher.enrich(goal="Timeout Test", user_context={})
    duration = time.time() - start

    print(f"   - Duration: {duration:.2f}s")
    print(f"   - Result: {result}")
    assert duration <= enricher.total_timeout + 0.2, "❌ Timeout not enforced"
    assert "enriched_context" in result, "❌ Missing enriched_context on timeout"
    print("✅ Timeout Safety Verified.")

    print("\n✅ SMOKE TEST PASSED: Architecture is sound.")


if __name__ == "__main__":
    asyncio.run(run_smoke_test())
