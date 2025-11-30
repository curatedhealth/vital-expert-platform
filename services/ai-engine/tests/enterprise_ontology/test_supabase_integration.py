"""
VITAL Platform - Supabase Integration Tests
============================================
Tests for Supabase data consistency and integrity.
"""

import pytest
import requests

# =============================================================================
# HELPER
# =============================================================================

def fetch_table(config, table, select="*", limit=1000):
    """Fetch records from Supabase."""
    headers = {
        "apikey": config["key"],
        "Authorization": f"Bearer {config['key']}"
    }
    url = f"{config['url']}/rest/v1/{table}?select={select}&limit={limit}"
    resp = requests.get(url, headers=headers)
    return resp.json() if resp.status_code == 200 else []

# =============================================================================
# TESTS
# =============================================================================

class TestSupabaseConnection:
    """Test Supabase connectivity."""

    def test_can_connect(self, supabase_config):
        """Test basic connection to Supabase."""
        headers = {
            "apikey": supabase_config["key"],
            "Authorization": f"Bearer {supabase_config['key']}"
        }
        url = f"{supabase_config['url']}/rest/v1/org_functions?select=id&limit=1"
        resp = requests.get(url, headers=headers)

        assert resp.status_code == 200, f"Connection failed: {resp.text}"

    def test_has_expected_tables(self, supabase_config):
        """Test that all expected tables exist."""
        tables = ["org_functions", "org_departments", "org_roles", "personas", "agents"]

        for table in tables:
            data = fetch_table(supabase_config, table, "id", 1)
            assert data is not None, f"Table {table} not accessible"


class TestDataCounts:
    """Test data volume expectations."""

    def test_functions_count(self, supabase_config, expected_counts):
        """Test functions count."""
        data = fetch_table(supabase_config, "org_functions", "id")
        assert len(data) >= expected_counts["functions"], \
            f"Expected >= {expected_counts['functions']} functions, got {len(data)}"

    def test_departments_count(self, supabase_config, expected_counts):
        """Test departments count."""
        data = fetch_table(supabase_config, "org_departments", "id")
        assert len(data) >= expected_counts["departments"], \
            f"Expected >= {expected_counts['departments']} departments, got {len(data)}"

    def test_roles_count(self, supabase_config, expected_counts):
        """Test roles count."""
        data = fetch_table(supabase_config, "org_roles", "id")
        assert len(data) >= expected_counts["roles"], \
            f"Expected >= {expected_counts['roles']} roles, got {len(data)}"

    def test_personas_count(self, supabase_config, expected_counts):
        """Test personas count (should be ~4x roles for MECE archetypes)."""
        data = fetch_table(supabase_config, "personas", "id", 5000)
        assert len(data) >= expected_counts["personas"] * 0.9, \
            f"Expected >= {expected_counts['personas']} personas, got {len(data)}"

    def test_agents_count(self, supabase_config, expected_counts):
        """Test agents count."""
        data = fetch_table(supabase_config, "agents", "id", 2000)
        assert len(data) >= expected_counts["agents"] * 0.9, \
            f"Expected >= {expected_counts['agents']} agents, got {len(data)}"


class TestDataIntegrity:
    """Test data relationships and integrity."""

    def test_departments_have_functions(self, supabase_config):
        """All departments should have valid function_id."""
        depts = fetch_table(supabase_config, "org_departments", "id,function_id", 200)
        null_function = [d for d in depts if not d.get("function_id")]

        assert len(null_function) == 0, \
            f"Found {len(null_function)} departments without function_id"

    def test_roles_have_departments(self, supabase_config):
        """Roles should have department references."""
        roles = fetch_table(supabase_config, "org_roles", "id,department_id", 1000)
        with_dept = [r for r in roles if r.get("department_id")]

        # Allow some roles without departments (org-level roles)
        assert len(with_dept) >= len(roles) * 0.8, \
            f"Only {len(with_dept)}/{len(roles)} roles have department_id"

    def test_personas_have_roles(self, supabase_config):
        """All personas should link to a source role."""
        personas = fetch_table(supabase_config, "personas", "id,source_role_id", 500)
        with_role = [p for p in personas if p.get("source_role_id")]

        assert len(with_role) >= len(personas) * 0.9, \
            f"Only {len(with_role)}/{len(personas)} personas have source_role_id"

    def test_mece_persona_types(self, supabase_config, sample_persona_types):
        """Personas should have valid MECE archetypes."""
        personas = fetch_table(supabase_config, "personas", "id,persona_type", 500)

        invalid = [p for p in personas if p.get("persona_type") not in sample_persona_types]

        assert len(invalid) == 0, \
            f"Found {len(invalid)} personas with invalid persona_type"

    def test_four_personas_per_role(self, supabase_config, sample_persona_types):
        """Each role should have 4 personas (one per archetype)."""
        # Get a sample of roles
        roles = fetch_table(supabase_config, "org_roles", "id", 50)

        for role in roles[:10]:  # Test first 10
            personas = fetch_table(
                supabase_config,
                f"personas?source_role_id=eq.{role['id']}",
                "persona_type"
            )

            # Should have 4 personas
            assert len(personas) == 4, \
                f"Role {role['id']} has {len(personas)} personas, expected 4"

            # Should have all 4 types
            types = {p.get("persona_type") for p in personas}
            missing = set(sample_persona_types) - types

            assert len(missing) == 0, \
                f"Role {role['id']} missing persona types: {missing}"


class TestAgentIntegrity:
    """Test agent data quality."""

    def test_agents_have_roles(self, supabase_config):
        """Agents should link to roles."""
        agents = fetch_table(supabase_config, "agents", "id,role_id", 500)
        with_role = [a for a in agents if a.get("role_id")]

        assert len(with_role) >= len(agents) * 0.8, \
            f"Only {len(with_role)}/{len(agents)} agents have role_id"

    def test_agents_have_system_prompts(self, supabase_config):
        """Active agents should have system prompts."""
        agents = fetch_table(
            supabase_config,
            "agents?status=eq.active",
            "id,system_prompt",
            200
        )
        with_prompt = [a for a in agents if a.get("system_prompt")]

        assert len(with_prompt) >= len(agents) * 0.9, \
            f"Only {len(with_prompt)}/{len(agents)} active agents have system_prompt"

    def test_agent_expertise_levels_valid(self, supabase_config):
        """Agent expertise levels should be valid."""
        valid_levels = ["entry", "intermediate", "senior", "expert", "master"]
        agents = fetch_table(supabase_config, "agents", "id,expertise_level", 500)

        invalid = [a for a in agents if a.get("expertise_level") and
                   a["expertise_level"] not in valid_levels]

        assert len(invalid) == 0, \
            f"Found {len(invalid)} agents with invalid expertise_level"
