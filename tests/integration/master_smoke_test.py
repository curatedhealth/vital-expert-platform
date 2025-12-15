import asyncio

from modules.expert.safety.preflight_service import PreFlightService
from modules.expert.registry.mission_registry import MissionRegistry


async def run_master_audit():
    print("🔥 IGNITING MASTER AUDIT...")

    # --- TEST 1: REGISTRY MAPPING ---
    print("\n[1/2] Verifying Mission Registry...")
    registry = MissionRegistry()
    runner = registry.get_runner("understand_deep_dive")

    runner_name = runner.__class__.__name__
    print(f"   - Template 'deep_dive' -> {runner_name}")

    if runner_name == "DeepResearchRunner":
        print("✅ PASS: Registry routing correct.")
    else:
        print(f"❌ FAIL: Expected DeepResearchRunner, got {runner_name}")

    # --- TEST 2: UNIVERSAL SAFETY ---
    print("\n[2/2] Verifying Universal Safety Gate...")
    safety = PreFlightService(registry)

    unsafe_state = {
        "mode": 3,
        "template_id": "understand_deep_dive",
        "user_context": {"budget_limit": 0.50},
    }

    result = await safety.run_check(unsafe_state)

    if not result.passed:
        print("✅ PASS: Mode 3 correctly blocked by Safety Gate.")
        print(f"   - Warnings: {result.warnings}")
    else:
        print("❌ FAIL: Mode 3 bypassed safety check.")


if __name__ == "__main__":
    asyncio.run(run_master_audit())
