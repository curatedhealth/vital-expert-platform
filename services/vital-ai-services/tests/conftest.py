"""
Test configuration and fixtures for vital-ai-services tests.
"""

import pytest
import sys
from pathlib import Path

# Add src to path
src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))


@pytest.fixture(scope="session")
def test_config():
    """Test configuration."""
    return {
        "test_mode": True,
        "mock_external_services": True
    }

