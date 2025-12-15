"""
Functional RAG config tests with extra allowed.
"""

import pytest
from core.rag_config import RAGSettings


def test_rag_settings_instantiates_with_extras(monkeypatch):
    # Provide only core env overrides; extra fields should be ignored by extra=allow
    monkeypatch.setenv("SIMILARITY_THRESHOLD_DEFAULT", "0.7")
    settings = RAGSettings(_env_file=None, _env_file_encoding=None, _secrets_dir=None)
    assert settings.similarity_threshold_default == 0.7


def test_rag_settings_core_fields(monkeypatch):
    # Clear problematic env vars for this test
    for key in [
        "NEXT_PUBLIC_API_GATEWAY_URL",
        "PYTHON_AI_ENGINE_URL",
        "API_GATEWAY_URL",
        "NEXT_PUBLIC_MISSIONS_STREAM_BASE",
    ]:
        monkeypatch.delenv(key, raising=False)
    settings = RAGSettings(_env_file=None, _env_file_encoding=None, _secrets_dir=None)
    assert settings.max_search_results > 0
    assert settings.accuracy_threshold_pharma > 0
    assert settings.llm_temperature_tier1 >= 0
