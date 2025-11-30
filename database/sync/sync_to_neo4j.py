#!/usr/bin/env python3
"""
VITAL Platform - PostgreSQL to Neo4j Sync
==========================================
Syncs organization ontology from Supabase to Neo4j Knowledge Graph.

Run this script from an IP-whitelisted environment (local machine or CI/CD).

Usage:
    python3 sync_to_neo4j.py
"""

import requests
from neo4j import GraphDatabase
from datetime import datetime
from typing import Dict, List, Any
import json

# =============================================================================
# CONFIGURATION
# =============================================================================

SUPABASE_URL = "https://bomltkhixeatxuoxmolq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"

NEO4J_URI = "neo4j+s://13067bdb.databases.neo4j.io"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "kkCxQgpcanSUDv-dKzOzDPcYIhvJHRQRa4tuiNa2Mek"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
}

# =============================================================================
# SUPABASE HELPERS
# =============================================================================

def fetch_all(table: str, select: str = "*") -> List[dict]:
    """Fetch all records from a Supabase table with pagination."""
    all_records = []
    offset = 0
    batch_size = 1000

    while True:
        url = f"{SUPABASE_URL}/rest/v1/{table}?select={select}&offset={offset}&limit={batch_size}"
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 200:
            data = resp.json()
            if not data:
                break
            all_records.extend(data)
            offset += batch_size
        else:
            print(f"Error fetching {table}: {resp.text}")
            break

    return all_records

# =============================================================================
# NEO4J SYNC FUNCTIONS
# =============================================================================

def create_constraints(session):
    """Create uniqueness constraints for all node types."""
    constraints = [
        "CREATE CONSTRAINT func_id IF NOT EXISTS FOR (f:Function) REQUIRE f.id IS UNIQUE",
        "CREATE CONSTRAINT dept_id IF NOT EXISTS FOR (d:Department) REQUIRE d.id IS UNIQUE",
        "CREATE CONSTRAINT role_id IF NOT EXISTS FOR (r:Role) REQUIRE r.id IS UNIQUE",
        "CREATE CONSTRAINT persona_id IF NOT EXISTS FOR (p:Persona) REQUIRE p.id IS UNIQUE",
        "CREATE CONSTRAINT archetype_name IF NOT EXISTS FOR (a:Archetype) REQUIRE a.name IS UNIQUE",
    ]

    for constraint in constraints:
        try:
            session.run(constraint)
        except Exception as e:
            if "already exists" not in str(e).lower():
                print(f"Constraint warning: {e}")

def sync_functions(session, functions: List[dict]):
    """Sync org_functions to Neo4j Function nodes."""
    print(f"\n[1/5] Syncing {len(functions)} functions...")

    query = """
    UNWIND $functions AS f
    MERGE (func:Function {id: f.id})
    SET func.name = f.name,
        func.slug = f.slug,
        func.description = f.description,
        func.mission_statement = f.mission_statement,
        func.regulatory_sensitivity = f.regulatory_sensitivity,
        func.strategic_priority = f.strategic_priority,
        func.updated_at = datetime()
    RETURN count(func) as count
    """

    result = session.run(query, functions=functions)
    count = result.single()["count"]
    print(f"      Synced {count} Function nodes")

def sync_departments(session, departments: List[dict]):
    """Sync org_departments to Neo4j Department nodes with BELONGS_TO relationships."""
    print(f"\n[2/5] Syncing {len(departments)} departments...")

    # Create department nodes
    query = """
    UNWIND $departments AS d
    MERGE (dept:Department {id: d.id})
    SET dept.name = d.name,
        dept.slug = d.slug,
        dept.description = d.description,
        dept.operating_model = d.operating_model,
        dept.field_vs_office_mix = d.field_vs_office_mix,
        dept.updated_at = datetime()
    WITH dept, d
    MATCH (func:Function {id: d.function_id})
    MERGE (dept)-[:BELONGS_TO]->(func)
    RETURN count(dept) as count
    """

    result = session.run(query, departments=departments)
    count = result.single()["count"]
    print(f"      Synced {count} Department nodes with BELONGS_TO relationships")

def sync_roles(session, roles: List[dict]):
    """Sync org_roles to Neo4j Role nodes with relationships."""
    print(f"\n[3/5] Syncing {len(roles)} roles...")

    # Process in batches
    batch_size = 100
    total = 0

    for i in range(0, len(roles), batch_size):
        batch = roles[i:i+batch_size]

        query = """
        UNWIND $roles AS r
        MERGE (role:Role {id: r.id})
        SET role.name = r.name,
            role.slug = r.slug,
            role.description = r.description,
            role.role_type = r.role_type,
            role.role_category = r.role_category,
            role.seniority_level = r.seniority_level,
            role.leadership_level = r.leadership_level,
            role.geographic_scope = r.geographic_scope,
            role.years_experience_min = r.years_experience_min,
            role.years_experience_max = r.years_experience_max,
            role.travel_percentage_min = r.travel_percentage_min,
            role.travel_percentage_max = r.travel_percentage_max,
            role.gxp_critical = r.gxp_critical,
            role.hcp_facing = r.hcp_facing,
            role.patient_facing = r.patient_facing,
            role.safety_critical = r.safety_critical,
            role.updated_at = datetime()
        WITH role, r
        MATCH (dept:Department {id: r.department_id})
        MERGE (role)-[:IN_DEPARTMENT]->(dept)
        WITH role, r
        MATCH (func:Function {id: r.function_id})
        MERGE (role)-[:IN_FUNCTION]->(func)
        RETURN count(role) as count
        """

        result = session.run(query, roles=batch)
        total += result.single()["count"]

    print(f"      Synced {total} Role nodes with relationships")

def sync_archetypes(session):
    """Create Archetype reference nodes."""
    print(f"\n[4/5] Creating archetype reference nodes...")

    archetypes = [
        {"name": "AUTOMATOR", "ai_maturity": 4, "tech_adoption": "early_adopter",
         "description": "Tech-savvy professional seeking AI and automation tools"},
        {"name": "ORCHESTRATOR", "ai_maturity": 3, "tech_adoption": "early_majority",
         "description": "Strategic coordinator managing complex workflows"},
        {"name": "LEARNER", "ai_maturity": 2, "tech_adoption": "late_majority",
         "description": "Curious professional eager to develop new skills"},
        {"name": "SKEPTIC", "ai_maturity": 1, "tech_adoption": "laggard",
         "description": "Cautious professional prioritizing proven methods"},
    ]

    query = """
    UNWIND $archetypes AS a
    MERGE (arch:Archetype {name: a.name})
    SET arch.ai_maturity = a.ai_maturity,
        arch.tech_adoption = a.tech_adoption,
        arch.description = a.description
    RETURN count(arch) as count
    """

    result = session.run(query, archetypes=archetypes)
    print(f"      Created {result.single()['count']} Archetype nodes")

def sync_personas(session, personas: List[dict]):
    """Sync personas to Neo4j Persona nodes with relationships."""
    print(f"\n[5/5] Syncing {len(personas)} personas...")

    batch_size = 200
    total = 0

    for i in range(0, len(personas), batch_size):
        batch = personas[i:i+batch_size]

        # Serialize list fields to JSON strings for Neo4j
        for p in batch:
            for field in ['goals', 'challenges', 'motivations', 'frustrations',
                         'daily_activities', 'tools_used', 'sample_quotes']:
                if isinstance(p.get(field), list):
                    p[field] = json.dumps(p[field])

        query = """
        UNWIND $personas AS p
        MERGE (persona:Persona {id: p.id})
        SET persona.unique_id = p.unique_id,
            persona.name = p.persona_name,
            persona.persona_type = p.persona_type,
            persona.title = p.title,
            persona.description = p.description,
            persona.department = p.department,
            persona.function_area = p.function_area,
            persona.geographic_scope = p.geographic_scope,
            persona.experience_level = p.experience_level,
            persona.goals = p.goals,
            persona.challenges = p.challenges,
            persona.motivations = p.motivations,
            persona.frustrations = p.frustrations,
            persona.daily_activities = p.daily_activities,
            persona.tools_used = p.tools_used,
            persona.is_active = p.is_active,
            persona.updated_at = datetime()
        WITH persona, p
        MATCH (role:Role {id: p.source_role_id})
        MERGE (persona)-[:BASED_ON_ROLE]->(role)
        WITH persona, p
        MATCH (arch:Archetype {name: p.persona_type})
        MERGE (persona)-[:HAS_ARCHETYPE]->(arch)
        RETURN count(persona) as count
        """

        result = session.run(query, personas=batch)
        total += result.single()["count"]

        if (i + batch_size) % 1000 == 0 or i + batch_size >= len(personas):
            print(f"      Progress: {min(i + batch_size, len(personas))}/{len(personas)}")

    print(f"      Synced {total} Persona nodes with relationships")

def create_indexes(session):
    """Create indexes for common query patterns."""
    indexes = [
        "CREATE INDEX func_slug IF NOT EXISTS FOR (f:Function) ON (f.slug)",
        "CREATE INDEX dept_slug IF NOT EXISTS FOR (d:Department) ON (d.slug)",
        "CREATE INDEX role_slug IF NOT EXISTS FOR (r:Role) ON (r.slug)",
        "CREATE INDEX role_seniority IF NOT EXISTS FOR (r:Role) ON (r.seniority_level)",
        "CREATE INDEX persona_type IF NOT EXISTS FOR (p:Persona) ON (p.persona_type)",
        "CREATE INDEX persona_geo IF NOT EXISTS FOR (p:Persona) ON (p.geographic_scope)",
    ]

    print("\nCreating indexes...")
    for index in indexes:
        try:
            session.run(index)
        except Exception as e:
            if "already exists" not in str(e).lower():
                print(f"Index warning: {e}")

# =============================================================================
# MAIN
# =============================================================================

def main():
    print("=" * 60)
    print("VITAL Platform - PostgreSQL to Neo4j Sync")
    print("=" * 60)
    print(f"\nSource: {SUPABASE_URL}")
    print(f"Target: {NEO4J_URI}")
    print(f"Started: {datetime.now().isoformat()}")

    # Fetch data from Supabase
    print("\nFetching data from Supabase...")
    functions = fetch_all("org_functions")
    departments = fetch_all("org_departments")
    roles = fetch_all("org_roles")
    personas = fetch_all("personas")

    print(f"   Functions: {len(functions)}")
    print(f"   Departments: {len(departments)}")
    print(f"   Roles: {len(roles)}")
    print(f"   Personas: {len(personas)}")

    # Connect to Neo4j and sync
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

    try:
        with driver.session() as session:
            create_constraints(session)
            sync_functions(session, functions)
            sync_departments(session, departments)
            sync_roles(session, roles)
            sync_archetypes(session)
            sync_personas(session, personas)
            create_indexes(session)

            # Verify counts
            print("\n" + "=" * 60)
            print("VERIFICATION")
            print("=" * 60)

            result = session.run("""
                MATCH (n)
                RETURN labels(n)[0] as label, count(*) as count
                ORDER BY count DESC
            """)

            print("\nNode counts:")
            for record in result:
                print(f"   {record['label']}: {record['count']}")

            result = session.run("""
                MATCH ()-[r]->()
                RETURN type(r) as type, count(*) as count
                ORDER BY count DESC
            """)

            print("\nRelationship counts:")
            for record in result:
                print(f"   {record['type']}: {record['count']}")

    finally:
        driver.close()

    print(f"\nCompleted: {datetime.now().isoformat()}")

if __name__ == "__main__":
    main()
