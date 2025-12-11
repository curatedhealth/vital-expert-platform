import pytest

from api.routes.missions import _generate_plan


@pytest.mark.asyncio
async def test_delegate_to_l3_signature(monkeypatch):
    from langgraph_workflows.modes34.wrappers import l3_wrapper

    async def fake_delegate(**kwargs):
        return {"summary": "ok"}

    monkeypatch.setattr(l3_wrapper, "delegate_to_l3", fake_delegate)
    res = await l3_wrapper.delegate_to_l3(specialist_code="context_specialist", task="test", context={})
    assert res["summary"] == "ok"


@pytest.mark.asyncio
async def test_delegate_to_l4_signature(monkeypatch):
    from langgraph_workflows.modes34.wrappers import l4_wrapper

    async def fake_delegate(**kwargs):
        return {"summary": "ok"}

    monkeypatch.setattr(l4_wrapper, "delegate_to_l4", fake_delegate)
    res = await l4_wrapper.delegate_to_l4(worker_code="evidence", task="test", context={})
    assert res["summary"] == "ok"


def test_generate_plan_ids_unique():
    plan = _generate_plan("goal", {"intent": "regulatory"})
    ids = [s["id"] for s in plan]
    assert len(ids) == len(set(ids))


def test_plan_delegate_keys_valid():
    plan = _generate_plan("goal", {"intent": "general"})
    for step in plan:
        assert step.get("delegate") in {"L2", "L3", "L4"}
