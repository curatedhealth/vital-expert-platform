import pytest


@pytest.mark.asyncio
async def test_l2_wrapper_propagates_cost_tokens(monkeypatch):
    from langgraph_workflows.modes34.wrappers import l2_wrapper, l5_tool_mapper

    class FakeL2:
        def __init__(self, *args, **kwargs): ...

        async def execute(self, task: str, params, context):
            return {
                "output": "ok",
                "tokens": 1000,
                "cost": None,
                "citations": [{"url": "http://example.com"}],
                "tools_used": [{"tool": "search"}],
                "sources": [{"url": "http://example.com"}],
            }

    async def fake_l5_exec_for_runner(runner_code, query, params):
        return l5_tool_mapper.L5ExecutionSummary()

    monkeypatch.setattr(l2_wrapper, "get_l2_class", lambda code: FakeL2)
    monkeypatch.setattr(
        l2_wrapper, "get_l5_executor", lambda: type("X", (), {"execute_for_runner": staticmethod(fake_l5_exec_for_runner), "execute_for_plan_tools": staticmethod(fake_l5_exec_for_runner)})()
    )
    res = await l2_wrapper.delegate_to_l2(expert_code="test", task="do task", context={})
    assert res["summary"] == "ok"
    assert res["tokens"] == 1000
    assert res["cost"] > 0
    assert res["sources"]
    assert res["tools_used"]


@pytest.mark.asyncio
async def test_l3_wrapper_propagates_cost_tokens(monkeypatch):
    from langgraph_workflows.modes34.wrappers import l3_wrapper, l5_tool_mapper

    class FakeL3:
        def __init__(self, *args, **kwargs): ...

        async def execute(self, task: str, params, context):
            return {
                "output": "ok3",
                "token_usage": {"total_tokens": 500},
                "citations": [],
                "tools_used": [],
                "sources": [],
            }

    async def fake_l5_exec_for_runner(runner_code, query, params):
        return l5_tool_mapper.L5ExecutionSummary()

    monkeypatch.setattr(l3_wrapper, "get_l3_class", lambda code: FakeL3)
    monkeypatch.setattr(
        l3_wrapper, "get_l5_executor", lambda: type("X", (), {"execute_for_runner": staticmethod(fake_l5_exec_for_runner), "execute_for_plan_tools": staticmethod(fake_l5_exec_for_runner)})()
    )
    res = await l3_wrapper.delegate_to_l3(specialist_code="context_specialist", task="do task", context={})
    assert res["summary"] == "ok3"
    assert res["tokens"] == 500
    assert res["cost"] > 0
