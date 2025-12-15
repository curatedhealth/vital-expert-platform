"""
Smoke tests for RAGSettings aligned with current config (extra allowed).
"""

import pytest
from core.rag_config import RAGSettings


def test_rag_settings_instantiates_with_extras(monkeypatch):
    # Provide extra env vars to verify extra=allow
    monkeypatch.setenv("SIMILARITY_THRESHOLD_DEFAULT", "0.7")
    monkeypatch.setenv("NEXT_PUBLIC_API_GATEWAY_URL", "http://localhost:4000")
    settings = RAGSettings()
    assert settings.similarity_threshold_default == 0.7


def test_rag_settings_has_expected_fields():
    settings = RAGSettings()
    assert settings.max_search_results > 0
    assert settings.accuracy_threshold_pharma > 0
