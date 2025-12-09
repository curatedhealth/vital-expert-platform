import pytest
from langchain_core.messages import HumanMessage, AIMessage

from modules.expert.workflows.interactive_workflow import InteractiveWorkflowBuilder


class _DummySelector:
    async def select_team(self, goal, tenant_id=None, user_context=None, mode=None):
        return {"team": [{"id": "expert-1", "name": "Expert"}]}


class _DummyAgent:
    def __init__(self):
        self.config = type("cfg", (), {})()

    async def execute(self, task, params, context):
        return {"analysis": f"answer for {context.get('goal')}", "citations": ["c1"]}


class _DummyAgentFactory:
    async def load_agent(self, agent_id):
        return _DummyAgent()


class _DummyEnrichmentService:
    async def enrich(self, goal: str, user_context=None):
        return {
            "enriched_context": {
                "intent": "test",
                "expanded_terms": [goal],
                "recommended_tools": ["L5-PM"],
                "verified_facts": "facts",
                "citations": ["c1"],
                "tools_used": ["L5-PM"],
                "goal": goal,
            },
            "ui_updates": [],
        }


@pytest.mark.asyncio
async def test_interactive_workflow_mode2_executes_with_auto_selection():
    builder = InteractiveWorkflowBuilder(
        selector_service=_DummySelector(),
        agent_factory=_DummyAgentFactory(),
        enrichment_service=_DummyEnrichmentService(),
        timeout_seconds=1.0,
    )
    workflow = builder.build()

    initial_state = {
        "conversation_id": "conv-1",
        "tenant_id": "tenant-1",
        "user_id": "user-1",
        "mode": 2,
        "messages": [HumanMessage(content="What is the evidence?")],
    }

    result = await workflow.ainvoke(initial_state)

    assert result.get("expert_id") == "expert-1"
    assert result.get("enriched_context", {}).get("verified_facts") == "facts"
    assert any(isinstance(m, AIMessage) for m in result.get("messages", []))


def test_agent_factory_tool_translation():
    from modules.expert.services.agent_factory import AgentFactory

    translated = AgentFactory._translate_tools(
        ["pubmed", "clinicaltrials", "calculator", "openfda", "L5-WEB"]
    )
    assert translated == ["L5-PM", "L5-CT", "L5-CALC", "L5-OPENFDA", "L5-WEB"]
