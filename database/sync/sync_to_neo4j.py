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
        # Organizational nodes
        "CREATE CONSTRAINT func_id IF NOT EXISTS FOR (f:Function) REQUIRE f.id IS UNIQUE",
        "CREATE CONSTRAINT dept_id IF NOT EXISTS FOR (d:Department) REQUIRE d.id IS UNIQUE",
        "CREATE CONSTRAINT role_id IF NOT EXISTS FOR (r:Role) REQUIRE r.id IS UNIQUE",
        "CREATE CONSTRAINT persona_id IF NOT EXISTS FOR (p:Persona) REQUIRE p.id IS UNIQUE",
        "CREATE CONSTRAINT archetype_name IF NOT EXISTS FOR (a:Archetype) REQUIRE a.name IS UNIQUE",
        # JTBD nodes
        "CREATE CONSTRAINT jtbd_id IF NOT EXISTS FOR (j:JTBD) REQUIRE j.id IS UNIQUE",
        "CREATE CONSTRAINT jtbd_code IF NOT EXISTS FOR (j:JTBD) REQUIRE j.code IS UNIQUE",
        # Value nodes
        "CREATE CONSTRAINT value_cat_id IF NOT EXISTS FOR (vc:ValueCategory) REQUIRE vc.id IS UNIQUE",
        "CREATE CONSTRAINT value_driver_id IF NOT EXISTS FOR (vd:ValueDriver) REQUIRE vd.id IS UNIQUE",
        # Workflow nodes
        "CREATE CONSTRAINT workflow_id IF NOT EXISTS FOR (w:Workflow) REQUIRE w.id IS UNIQUE",
        "CREATE CONSTRAINT stage_id IF NOT EXISTS FOR (s:WorkflowStage) REQUIRE s.id IS UNIQUE",
        # Agent nodes
        "CREATE CONSTRAINT agent_id IF NOT EXISTS FOR (a:Agent) REQUIRE a.id IS UNIQUE",
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

def sync_jtbds(session, jtbds: List[dict]):
    """Sync jtbd table to Neo4j JTBD nodes."""
    print(f"\n[6/11] Syncing {len(jtbds)} JTBDs...")

    batch_size = 100
    total = 0

    for i in range(0, len(jtbds), batch_size):
        batch = jtbds[i:i+batch_size]

        query = """
        UNWIND $jtbds AS j
        MERGE (jtbd:JTBD {id: j.id})
        SET jtbd.code = j.code,
            jtbd.name = j.name,
            jtbd.job_statement = j.job_statement,
            jtbd.job_category = j.job_category,
            jtbd.complexity = j.complexity,
            jtbd.frequency = j.frequency,
            jtbd.strategic_priority = j.strategic_priority,
            jtbd.odi_tier = j.odi_tier,
            jtbd.importance_score = j.importance_score,
            jtbd.satisfaction_score = j.satisfaction_score,
            jtbd.opportunity_score = j.opportunity_score,
            jtbd.updated_at = datetime()
        RETURN count(jtbd) as count
        """

        result = session.run(query, jtbds=batch)
        total += result.single()["count"]

    print(f"      Synced {total} JTBD nodes")


def sync_jtbd_roles(session, jtbd_roles: List[dict]):
    """Sync jtbd_roles junction to create PERFORMS relationships."""
    print(f"\n[7/11] Syncing {len(jtbd_roles)} JTBD-Role relationships...")

    batch_size = 200
    total = 0

    for i in range(0, len(jtbd_roles), batch_size):
        batch = jtbd_roles[i:i+batch_size]

        query = """
        UNWIND $rels AS rel
        MATCH (r:Role {id: rel.role_id})
        MATCH (j:JTBD {id: rel.jtbd_id})
        MERGE (r)-[p:PERFORMS]->(j)
        SET p.relevance_score = rel.relevance_score,
            p.is_primary = rel.is_primary,
            p.updated_at = datetime()
        RETURN count(p) as count
        """

        result = session.run(query, rels=batch)
        total += result.single()["count"]

    print(f"      Created {total} PERFORMS relationships")


def sync_value_categories(session, categories: List[dict]):
    """Sync value_categories to Neo4j ValueCategory nodes."""
    print(f"\n[8/11] Syncing {len(categories)} Value Categories...")

    query = """
    UNWIND $categories AS c
    MERGE (vc:ValueCategory {id: c.id})
    SET vc.code = c.code,
        vc.name = c.name,
        vc.description = c.description,
        vc.color = c.color,
        vc.sort_order = c.sort_order,
        vc.updated_at = datetime()
    RETURN count(vc) as count
    """

    result = session.run(query, categories=categories)
    print(f"      Synced {result.single()['count']} ValueCategory nodes")


def sync_value_drivers(session, drivers: List[dict]):
    """Sync value_drivers to Neo4j ValueDriver nodes with category relationships."""
    print(f"\n[9/11] Syncing {len(drivers)} Value Drivers...")

    query = """
    UNWIND $drivers AS d
    MERGE (vd:ValueDriver {id: d.id})
    SET vd.code = d.code,
        vd.name = d.name,
        vd.value_category = d.value_category,
        vd.description = d.description,
        vd.impact_weight = d.impact_weight,
        vd.level = d.level,
        vd.is_active = d.is_active,
        vd.updated_at = datetime()
    WITH vd, d
    WHERE d.primary_category_id IS NOT NULL
    MATCH (vc:ValueCategory {id: d.primary_category_id})
    MERGE (vd)-[:BELONGS_TO_CATEGORY]->(vc)
    RETURN count(vd) as count
    """

    result = session.run(query, drivers=drivers)
    print(f"      Synced {result.single()['count']} ValueDriver nodes")


def sync_jtbd_value_categories(session, jtbd_vc: List[dict]):
    """Sync jtbd_value_categories junction to create DELIVERS_VALUE relationships."""
    print(f"\n[10/11] Syncing {len(jtbd_vc)} JTBD-ValueCategory relationships...")

    batch_size = 200
    total = 0

    for i in range(0, len(jtbd_vc), batch_size):
        batch = jtbd_vc[i:i+batch_size]

        query = """
        UNWIND $rels AS rel
        MATCH (j:JTBD {id: rel.jtbd_id})
        MATCH (vc:ValueCategory {id: rel.category_id})
        MERGE (j)-[dv:DELIVERS_VALUE]->(vc)
        SET dv.relevance_score = rel.relevance_score,
            dv.updated_at = datetime()
        RETURN count(dv) as count
        """

        result = session.run(query, rels=batch)
        total += result.single()["count"]

    print(f"      Created {total} DELIVERS_VALUE relationships")


def sync_jtbd_value_drivers(session, jtbd_vd: List[dict]):
    """Sync jtbd_value_drivers junction to create DRIVES relationships."""
    print(f"\n[11/11] Syncing {len(jtbd_vd)} JTBD-ValueDriver relationships...")

    batch_size = 200
    total = 0

    for i in range(0, len(jtbd_vd), batch_size):
        batch = jtbd_vd[i:i+batch_size]

        query = """
        UNWIND $rels AS rel
        MATCH (j:JTBD {id: rel.jtbd_id})
        MATCH (vd:ValueDriver {id: rel.driver_id})
        MERGE (j)-[dr:DRIVES]->(vd)
        SET dr.impact_score = rel.impact_score,
            dr.updated_at = datetime()
        RETURN count(dr) as count
        """

        result = session.run(query, rels=batch)
        total += result.single()["count"]

    print(f"      Created {total} DRIVES relationships")


def sync_jtbd_ai_suitability(session, jtbd_ai: List[dict]):
    """Sync jtbd_ai_suitability to add AI scores to JTBD nodes."""
    print(f"\n[EXTRA] Updating {len(jtbd_ai)} JTBDs with AI suitability scores...")

    batch_size = 100
    total = 0

    for i in range(0, len(jtbd_ai), batch_size):
        batch = jtbd_ai[i:i+batch_size]

        query = """
        UNWIND $scores AS s
        MATCH (j:JTBD {id: s.jtbd_id})
        SET j.rag_score = s.rag_score,
            j.summary_score = s.summary_score,
            j.generation_score = s.generation_score,
            j.classification_score = s.classification_score,
            j.reasoning_score = s.reasoning_score,
            j.automation_score = s.automation_score,
            j.overall_ai_readiness = s.overall_ai_readiness,
            j.intervention_type = s.intervention_type_name,
            j.ai_updated_at = datetime()
        RETURN count(j) as count
        """

        result = session.run(query, scores=batch)
        total += result.single()["count"]

    print(f"      Updated {total} JTBD nodes with AI scores")


def sync_workflows(session, workflows: List[dict]):
    """Sync workflow_templates to Neo4j Workflow nodes."""
    print(f"\n[EXTRA] Syncing {len(workflows)} Workflows...")

    query = """
    UNWIND $workflows AS w
    MERGE (wf:Workflow {id: w.id})
    SET wf.name = w.name,
        wf.description = w.description,
        wf.total_stages = w.total_stages,
        wf.estimated_duration_hours = w.estimated_duration_hours,
        wf.updated_at = datetime()
    WITH wf, w
    WHERE w.jtbd_id IS NOT NULL
    MATCH (j:JTBD {id: w.jtbd_id})
    MERGE (j)-[:TRIGGERS]->(wf)
    RETURN count(wf) as count
    """

    result = session.run(query, workflows=workflows)
    print(f"      Synced {result.single()['count']} Workflow nodes")


def sync_agents(session, agents: List[dict]):
    """Sync agents to Neo4j Agent nodes."""
    print(f"\n[EXTRA] Syncing {len(agents)} Agents...")

    batch_size = 100
    total = 0

    for i in range(0, len(agents), batch_size):
        batch = agents[i:i+batch_size]

        # Serialize list fields
        for a in batch:
            for field in ['capabilities', 'knowledge_domains', 'tools']:
                if isinstance(a.get(field), list):
                    a[field] = json.dumps(a[field])

        query = """
        UNWIND $agents AS a
        MERGE (agent:Agent {id: a.id})
        SET agent.name = a.name,
            agent.display_name = a.display_name,
            agent.description = a.description,
            agent.tier = a.tier,
            agent.status = a.status,
            agent.specialty = a.specialty,
            agent.avatar = a.avatar,
            agent.capabilities = a.capabilities,
            agent.knowledge_domains = a.knowledge_domains,
            agent.model = a.model,
            agent.updated_at = datetime()
        RETURN count(agent) as count
        """

        result = session.run(query, agents=batch)
        total += result.single()["count"]

    print(f"      Synced {total} Agent nodes")


def sync_agent_relationships(session):
    """Create agent collaboration relationships based on knowledge domain overlap."""
    print(f"\n[EXTRA] Creating Agent collaboration relationships...")

    # Find agents with overlapping knowledge domains and create COLLABORATES_WITH
    query = """
    MATCH (a1:Agent), (a2:Agent)
    WHERE a1.id < a2.id
      AND a1.knowledge_domains IS NOT NULL
      AND a2.knowledge_domains IS NOT NULL
    WITH a1, a2,
         apoc.convert.fromJsonList(a1.knowledge_domains) AS domains1,
         apoc.convert.fromJsonList(a2.knowledge_domains) AS domains2
    WITH a1, a2, [d IN domains1 WHERE d IN domains2] AS overlap
    WHERE size(overlap) > 0
    MERGE (a1)-[c:COLLABORATES_WITH]-(a2)
    SET c.shared_domains = overlap,
        c.overlap_count = size(overlap)
    RETURN count(c) as count
    """

    try:
        result = session.run(query)
        print(f"      Created {result.single()['count']} COLLABORATES_WITH relationships")
    except Exception as e:
        print(f"      Skipping COLLABORATES_WITH (requires APOC): {e}")


def create_indexes(session):
    """Create indexes for common query patterns."""
    indexes = [
        # Organizational indexes
        "CREATE INDEX func_slug IF NOT EXISTS FOR (f:Function) ON (f.slug)",
        "CREATE INDEX dept_slug IF NOT EXISTS FOR (d:Department) ON (d.slug)",
        "CREATE INDEX role_slug IF NOT EXISTS FOR (r:Role) ON (r.slug)",
        "CREATE INDEX role_seniority IF NOT EXISTS FOR (r:Role) ON (r.seniority_level)",
        "CREATE INDEX persona_type IF NOT EXISTS FOR (p:Persona) ON (p.persona_type)",
        "CREATE INDEX persona_geo IF NOT EXISTS FOR (p:Persona) ON (p.geographic_scope)",
        # JTBD indexes
        "CREATE INDEX jtbd_code IF NOT EXISTS FOR (j:JTBD) ON (j.code)",
        "CREATE INDEX jtbd_category IF NOT EXISTS FOR (j:JTBD) ON (j.job_category)",
        "CREATE INDEX jtbd_complexity IF NOT EXISTS FOR (j:JTBD) ON (j.complexity)",
        "CREATE INDEX jtbd_odi IF NOT EXISTS FOR (j:JTBD) ON (j.odi_tier)",
        "CREATE INDEX jtbd_opportunity IF NOT EXISTS FOR (j:JTBD) ON (j.opportunity_score)",
        "CREATE INDEX jtbd_automation IF NOT EXISTS FOR (j:JTBD) ON (j.automation_score)",
        # Value indexes
        "CREATE INDEX vc_code IF NOT EXISTS FOR (vc:ValueCategory) ON (vc.code)",
        "CREATE INDEX vd_code IF NOT EXISTS FOR (vd:ValueDriver) ON (vd.code)",
        # Agent indexes
        "CREATE INDEX agent_tier IF NOT EXISTS FOR (a:Agent) ON (a.tier)",
        "CREATE INDEX agent_status IF NOT EXISTS FOR (a:Agent) ON (a.status)",
        "CREATE INDEX agent_specialty IF NOT EXISTS FOR (a:Agent) ON (a.specialty)",
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
    print("VITAL Platform - Full Ontology Sync to Neo4j")
    print("=" * 60)
    print(f"\nSource: {SUPABASE_URL}")
    print(f"Target: {NEO4J_URI}")
    print(f"Started: {datetime.now().isoformat()}")

    # Fetch data from Supabase
    print("\nFetching data from Supabase...")

    # Organizational structure
    functions = fetch_all("org_functions")
    departments = fetch_all("org_departments")
    roles = fetch_all("org_roles")
    personas = fetch_all("personas")

    # JTBDs and relationships
    jtbds = fetch_all("jtbd")
    jtbd_roles = fetch_all("jtbd_roles")
    jtbd_ai = fetch_all("jtbd_ai_suitability")

    # Value framework
    value_categories = fetch_all("value_categories")
    value_drivers = fetch_all("value_drivers")
    jtbd_value_categories = fetch_all("jtbd_value_categories")
    jtbd_value_drivers = fetch_all("jtbd_value_drivers")

    # Workflows and Agents
    workflows = fetch_all("workflow_templates")
    agents = fetch_all("agents")

    print("\n   ORGANIZATIONAL STRUCTURE:")
    print(f"      Functions: {len(functions)}")
    print(f"      Departments: {len(departments)}")
    print(f"      Roles: {len(roles)}")
    print(f"      Personas: {len(personas)}")
    print("\n   JTBD LAYER:")
    print(f"      JTBDs: {len(jtbds)}")
    print(f"      JTBD-Role mappings: {len(jtbd_roles)}")
    print(f"      JTBD AI suitability: {len(jtbd_ai)}")
    print("\n   VALUE LAYER:")
    print(f"      Value Categories: {len(value_categories)}")
    print(f"      Value Drivers: {len(value_drivers)}")
    print(f"      JTBD-ValueCategory: {len(jtbd_value_categories)}")
    print(f"      JTBD-ValueDriver: {len(jtbd_value_drivers)}")
    print("\n   WORKFLOWS & AGENTS:")
    print(f"      Workflows: {len(workflows)}")
    print(f"      Agents: {len(agents)}")

    # Connect to Neo4j and sync
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

    try:
        with driver.session() as session:
            # Create constraints first
            create_constraints(session)

            # Sync organizational structure (original)
            sync_functions(session, functions)
            sync_departments(session, departments)
            sync_roles(session, roles)
            sync_archetypes(session)
            sync_personas(session, personas)

            # Sync JTBD layer (new)
            sync_jtbds(session, jtbds)
            sync_jtbd_roles(session, jtbd_roles)

            # Sync Value framework (new)
            sync_value_categories(session, value_categories)
            sync_value_drivers(session, value_drivers)
            sync_jtbd_value_categories(session, jtbd_value_categories)
            sync_jtbd_value_drivers(session, jtbd_value_drivers)

            # Update JTBDs with AI scores (new)
            if jtbd_ai:
                sync_jtbd_ai_suitability(session, jtbd_ai)

            # Sync Workflows (new)
            if workflows:
                sync_workflows(session, workflows)

            # Sync Agents (new)
            if agents:
                sync_agents(session, agents)
                sync_agent_relationships(session)

            # Create all indexes
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

            # Summary
            result = session.run("MATCH (n) RETURN count(n) as nodes")
            total_nodes = result.single()["nodes"]
            result = session.run("MATCH ()-[r]->() RETURN count(r) as rels")
            total_rels = result.single()["rels"]

            print(f"\n   TOTAL: {total_nodes} nodes, {total_rels} relationships")

    finally:
        driver.close()

    print(f"\nCompleted: {datetime.now().isoformat()}")

if __name__ == "__main__":
    main()
