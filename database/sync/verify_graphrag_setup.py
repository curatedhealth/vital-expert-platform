#!/usr/bin/env python3
"""
GraphRAG Infrastructure Verification Script

Verifies that Neo4j, Pinecone, and Supabase are properly connected
and data is synchronized across all three databases.

Usage:
    cd services/ai-engine
    python ../../database/sync/verify_graphrag_setup.py
"""

import os
import sys
import asyncio
from datetime import datetime
from pathlib import Path

# Load environment variables
from dotenv import load_dotenv

# Load from services/ai-engine/.env
env_path = Path(__file__).parent.parent.parent / 'services' / 'ai-engine' / '.env'
if env_path.exists():
    load_dotenv(env_path)
    print(f"Loaded: {env_path}")
else:
    load_dotenv()

# Results tracking
results = {
    "supabase": {"status": "unknown", "details": {}},
    "neo4j": {"status": "unknown", "details": {}},
    "pinecone": {"status": "unknown", "details": {}},
    "sync_status": {"status": "unknown", "details": {}}
}


def print_header(title: str):
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")


def print_result(label: str, value: str, status: str = "info"):
    icons = {"pass": "✅", "fail": "❌", "warn": "⚠️", "info": "📊"}
    print(f"   {icons.get(status, '•')} {label}: {value}")


# =============================================================================
# SUPABASE VERIFICATION
# =============================================================================

def verify_supabase():
    """Verify Supabase connection and count records."""
    print_header("1. SUPABASE (PostgreSQL)")

    try:
        from supabase import create_client

        url = os.getenv('SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('NEW_SUPABASE_SERVICE_KEY')

        if not url or not key:
            print_result("Connection", "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY", "fail")
            results["supabase"]["status"] = "error"
            return

        print_result("URL", url, "info")

        client = create_client(url, key)

        # Count agents
        agents = client.table('agents').select('id', count='exact').execute()
        agent_count = agents.count or 0
        print_result("Agents count", str(agent_count), "pass" if agent_count > 0 else "warn")

        # Count active agents
        active_agents = client.table('agents').select('id', count='exact').eq('is_active', True).execute()
        active_count = active_agents.count or 0
        print_result("Active agents", str(active_count), "pass" if active_count > 0 else "warn")

        # Count roles
        roles = client.table('org_roles').select('id', count='exact').execute()
        role_count = roles.count or 0
        print_result("Roles count", str(role_count), "pass" if role_count > 0 else "warn")

        # Count personas
        personas = client.table('personas').select('id', count='exact').execute()
        persona_count = personas.count or 0
        print_result("Personas count", str(persona_count), "pass" if persona_count > 0 else "warn")

        # Count JTBDs
        jtbds = client.table('jtbd').select('id', count='exact').execute()
        jtbd_count = jtbds.count or 0
        print_result("JTBDs count", str(jtbd_count), "pass" if jtbd_count > 0 else "warn")

        results["supabase"]["status"] = "connected"
        results["supabase"]["details"] = {
            "agents": agent_count,
            "active_agents": active_count,
            "roles": role_count,
            "personas": persona_count,
            "jtbds": jtbd_count
        }

        print_result("Connection", "SUCCESS", "pass")

    except ImportError:
        print_result("Connection", "supabase package not installed", "fail")
        results["supabase"]["status"] = "not_installed"
    except Exception as e:
        print_result("Connection", f"ERROR: {str(e)[:100]}", "fail")
        results["supabase"]["status"] = "error"
        results["supabase"]["details"]["error"] = str(e)


# =============================================================================
# NEO4J VERIFICATION
# =============================================================================

async def verify_neo4j():
    """Verify Neo4j connection and count nodes."""
    print_header("2. NEO4J (Graph Database)")

    try:
        from neo4j import AsyncGraphDatabase

        uri = os.getenv('NEO4J_URI')
        user = os.getenv('NEO4J_USER', 'neo4j')
        password = os.getenv('NEO4J_PASSWORD')

        if not uri or not password:
            print_result("Connection", "Missing NEO4J_URI or NEO4J_PASSWORD", "fail")
            results["neo4j"]["status"] = "not_configured"
            return

        print_result("URI", uri, "info")

        driver = AsyncGraphDatabase.driver(
            uri,
            auth=(user, password),
            max_connection_pool_size=5
        )

        # Verify connectivity
        await driver.verify_connectivity()
        print_result("Connection", "SUCCESS", "pass")

        async with driver.session(database="neo4j") as session:
            # Count total nodes
            result = await session.run("MATCH (n) RETURN count(n) as count")
            record = await result.single()
            total_nodes = record["count"] if record else 0
            print_result("Total nodes", str(total_nodes), "pass" if total_nodes > 0 else "warn")

            # Count Agent nodes
            result = await session.run("MATCH (a:Agent) RETURN count(a) as count")
            record = await result.single()
            agent_nodes = record["count"] if record else 0
            print_result("Agent nodes", str(agent_nodes), "pass" if agent_nodes > 0 else "warn")

            # Count Role nodes
            result = await session.run("MATCH (r:Role) RETURN count(r) as count")
            record = await result.single()
            role_nodes = record["count"] if record else 0
            print_result("Role nodes", str(role_nodes), "info")

            # Count Persona nodes
            result = await session.run("MATCH (p:Persona) RETURN count(p) as count")
            record = await result.single()
            persona_nodes = record["count"] if record else 0
            print_result("Persona nodes", str(persona_nodes), "info")

            # Count JTBD nodes
            result = await session.run("MATCH (j:JTBD) RETURN count(j) as count")
            record = await result.single()
            jtbd_nodes = record["count"] if record else 0
            print_result("JTBD nodes", str(jtbd_nodes), "info")

            # Count relationships
            result = await session.run("MATCH ()-[r]->() RETURN count(r) as count")
            record = await result.single()
            total_rels = record["count"] if record else 0
            print_result("Total relationships", str(total_rels), "pass" if total_rels > 0 else "warn")

            # Get relationship types
            result = await session.run("""
                MATCH ()-[r]->()
                RETURN type(r) as type, count(*) as count
                ORDER BY count DESC
                LIMIT 5
            """)
            print("\n   Top relationship types:")
            async for record in result:
                print(f"      - {record['type']}: {record['count']}")

        await driver.close()

        results["neo4j"]["status"] = "connected"
        results["neo4j"]["details"] = {
            "total_nodes": total_nodes,
            "agent_nodes": agent_nodes,
            "role_nodes": role_nodes,
            "persona_nodes": persona_nodes,
            "jtbd_nodes": jtbd_nodes,
            "total_relationships": total_rels
        }

    except ImportError:
        print_result("Connection", "neo4j package not installed", "fail")
        results["neo4j"]["status"] = "not_installed"
    except Exception as e:
        print_result("Connection", f"ERROR: {str(e)[:100]}", "fail")
        results["neo4j"]["status"] = "error"
        results["neo4j"]["details"]["error"] = str(e)


# =============================================================================
# PINECONE VERIFICATION
# =============================================================================

def verify_pinecone():
    """Verify Pinecone connection and count vectors."""
    print_header("3. PINECONE (Vector Database)")

    try:
        from pinecone import Pinecone

        api_key = os.getenv('PINECONE_API_KEY')
        index_name = os.getenv('PINECONE_INDEX_NAME', 'vital-knowledge')

        if not api_key:
            print_result("Connection", "Missing PINECONE_API_KEY", "fail")
            results["pinecone"]["status"] = "not_configured"
            return

        print_result("Index", index_name, "info")

        pc = Pinecone(api_key=api_key)

        # List available indexes
        indexes = pc.list_indexes()
        index_names = [idx.name for idx in indexes]
        print_result("Available indexes", ", ".join(index_names), "info")

        if index_name not in index_names:
            print_result("Target index", f"'{index_name}' NOT FOUND", "fail")
            results["pinecone"]["status"] = "index_not_found"
            return

        # Connect to index
        index = pc.Index(index_name)

        # Get index stats
        stats = index.describe_index_stats()

        total_vectors = stats.total_vector_count
        dimension = stats.dimension
        namespaces = stats.namespaces or {}

        print_result("Connection", "SUCCESS", "pass")
        print_result("Total vectors", str(total_vectors), "pass" if total_vectors > 0 else "warn")
        print_result("Dimensions", str(dimension), "info")
        print_result("Namespaces", str(len(namespaces)), "info")

        # Show namespace details
        if namespaces:
            print("\n   Namespace breakdown:")
            sorted_ns = sorted(namespaces.items(), key=lambda x: x[1].vector_count, reverse=True)
            for ns_name, ns_data in sorted_ns[:10]:
                print(f"      - {ns_name}: {ns_data.vector_count} vectors")

        results["pinecone"]["status"] = "connected"
        results["pinecone"]["details"] = {
            "total_vectors": total_vectors,
            "dimensions": dimension,
            "namespaces": len(namespaces),
            "namespace_breakdown": {k: v.vector_count for k, v in namespaces.items()}
        }

    except ImportError:
        print_result("Connection", "pinecone package not installed", "fail")
        results["pinecone"]["status"] = "not_installed"
    except Exception as e:
        print_result("Connection", f"ERROR: {str(e)[:100]}", "fail")
        results["pinecone"]["status"] = "error"
        results["pinecone"]["details"]["error"] = str(e)


# =============================================================================
# SYNC VERIFICATION
# =============================================================================

def verify_sync():
    """Verify data is synchronized across all three databases."""
    print_header("4. DATA SYNC VERIFICATION")

    supabase_agents = results["supabase"]["details"].get("agents", 0)
    neo4j_agents = results["neo4j"]["details"].get("agent_nodes", 0)

    # Get agent vectors from Pinecone namespaces
    pinecone_agents = 0
    ns_breakdown = results["pinecone"]["details"].get("namespace_breakdown", {})
    for ns_name in ['agents', 'ont-agents', 'global']:
        pinecone_agents += ns_breakdown.get(ns_name, 0)

    print_result("Supabase agents", str(supabase_agents), "info")
    print_result("Neo4j agent nodes", str(neo4j_agents), "info")
    print_result("Pinecone agent vectors", str(pinecone_agents), "info")

    # Calculate sync percentages
    if supabase_agents > 0:
        neo4j_sync_pct = round((neo4j_agents / supabase_agents) * 100, 1)
        pinecone_sync_pct = round((pinecone_agents / supabase_agents) * 100, 1)

        neo4j_status = "pass" if neo4j_sync_pct >= 80 else ("warn" if neo4j_sync_pct >= 50 else "fail")
        pinecone_status = "pass" if pinecone_sync_pct >= 80 else ("warn" if pinecone_sync_pct >= 50 else "fail")

        print_result("Neo4j sync %", f"{neo4j_sync_pct}%", neo4j_status)
        print_result("Pinecone sync %", f"{pinecone_sync_pct}%", pinecone_status)

        results["sync_status"]["details"] = {
            "supabase_agents": supabase_agents,
            "neo4j_agents": neo4j_agents,
            "pinecone_agents": pinecone_agents,
            "neo4j_sync_pct": neo4j_sync_pct,
            "pinecone_sync_pct": pinecone_sync_pct
        }

        if neo4j_sync_pct >= 80 and pinecone_sync_pct >= 80:
            results["sync_status"]["status"] = "synced"
            print_result("Overall sync", "SYNCED", "pass")
        elif neo4j_sync_pct >= 50 or pinecone_sync_pct >= 50:
            results["sync_status"]["status"] = "partial"
            print_result("Overall sync", "PARTIAL - Needs re-sync", "warn")
        else:
            results["sync_status"]["status"] = "not_synced"
            print_result("Overall sync", "NOT SYNCED - Run sync scripts", "fail")
    else:
        results["sync_status"]["status"] = "no_data"
        print_result("Overall sync", "No data in Supabase to sync", "warn")


# =============================================================================
# MAIN
# =============================================================================

async def main():
    print("\n" + "="*60)
    print(" GRAPHRAG INFRASTRUCTURE VERIFICATION")
    print(" " + datetime.now().isoformat())
    print("="*60)

    # Run verifications
    verify_supabase()
    await verify_neo4j()
    verify_pinecone()
    verify_sync()

    # Summary
    print_header("SUMMARY")

    for component, data in results.items():
        status = data["status"]
        if status == "connected" or status == "synced":
            icon = "✅"
        elif status == "partial" or status == "warn":
            icon = "⚠️"
        else:
            icon = "❌"
        print(f"   {icon} {component.upper()}: {status}")

    # Recommendations
    print_header("RECOMMENDATIONS")

    if results["neo4j"]["status"] != "connected":
        print("   🔧 Run: python database/sync/sync_to_neo4j.py")

    if results["pinecone"]["status"] != "connected":
        print("   🔧 Check Pinecone API key and index configuration")

    if results["sync_status"]["status"] in ["partial", "not_synced"]:
        print("   🔧 Run: python database/sync/sync_agents_to_pinecone_neo4j.py")

    if all(r["status"] in ["connected", "synced"] for r in results.values()):
        print("   ✅ All systems operational!")

    print("\n")


if __name__ == "__main__":
    asyncio.run(main())
