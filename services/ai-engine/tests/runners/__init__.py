"""
Mission Runner Library Tests

Test suite covering:
- BaseRunner (base.py): Abstract class, quality gates, LangGraph integration
- RunnerRegistry (registry.py): Singleton, registration, filtering
- TaskAssembler (assembler.py): Stage-to-runner mapping, TASK formula
- RunnerExecutor (executor.py): Database bridge, SSE streaming
- Core Cognitive Runners (12): decompose, investigate, critique, validate, synthesize, recommend
- Pharma Domain Runners (12): market_access, medical_affairs, foresight, brand_strategy, digital_health, design_thinking

Target: 80%+ coverage for production hardening

Test Files:
- test_base_runner.py: Enums, dataclasses, BaseRunner abstract class
- test_registry.py: Singleton pattern, registration, filtering
- test_assembler.py: TASK = PERSONA + SKILL + KNOWLEDGE + CONTEXT
- test_executor.py: Stage/code mapping, step execution, plan streaming
- test_pharma_runners.py: All 12 pharmaceutical domain runners

Run tests:
    cd services/ai-engine
    source .venv/bin/activate
    PYTHONPATH="$PWD/src:$PYTHONPATH" python -m pytest tests/runners/ -v
"""
