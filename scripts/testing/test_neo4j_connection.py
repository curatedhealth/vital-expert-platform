"""
Test Neo4j AuraDB Connection

Quick script to verify Neo4j connection is working.

Usage:
    python scripts/test_neo4j_connection.py
"""

import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "services" / "ai-engine" / "src"))

from services.neo4j_client import Neo4jClient
import structlog

logger = structlog.get_logger()


async def test_connection():
    """Test Neo4j connection and basic operations."""

    # Get credentials from environment
    uri = os.getenv("NEO4J_URI")
    user = os.getenv("NEO4J_USER")
    password = os.getenv("NEO4J_PASSWORD")

    if not uri or not user or not password:
        print("❌ ERROR: Neo4j credentials not found in environment")
        print("Required: NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD")
        return False

    print("=" * 60)
    print("NEO4J CONNECTION TEST")
    print("=" * 60)
    print(f"URI: {uri}")
    print(f"User: {user}")
    print(f"Database: {os.getenv('NEO4J_DATABASE', 'neo4j')}")
    print("=" * 60)
    print()

    try:
        # Initialize client
        print("1️⃣  Initializing Neo4j client...")
        client = Neo4jClient(uri, user, password)

        # Test connection
        print("2️⃣  Testing connection...")
        connected = await client.verify_connection()

        if not connected:
            print("❌ Connection verification failed")
            return False

        print("✅ Connection successful!")
        print()

        # Get database statistics
        print("3️⃣  Fetching database statistics...")
        stats = await client.get_statistics()

        print("📊 Database Statistics:")
        print(f"   Total agents: {stats.get('total_agents', 0)}")
        print(f"   Active agents: {stats.get('active_agents', 0)}")
        print(f"   Total relationships: {stats.get('total_relationships', 0)}")
        print(f"   Master agents (Tier 1): {stats.get('master_agents', 0)}")
        print(f"   Expert agents (Tier 2): {stats.get('expert_agents', 0)}")
        print(f"   Specialist agents (Tier 3): {stats.get('specialist_agents', 0)}")
        print()

        # Test creating a sample agent node
        print("4️⃣  Testing agent node creation...")

        test_agent_id = "test-agent-" + str(asyncio.get_event_loop().time())

        await client.create_agent_node(
            agent_id=test_agent_id,
            name="Test Agent",
            capabilities=["testing", "verification"],
            domains=["quality_assurance"],
            tenant_id="00000000-0000-0000-0000-000000000000",
            tier=2
        )

        print(f"✅ Created test agent: {test_agent_id}")

        # Verify it was created
        print("5️⃣  Verifying test agent...")
        agent = await client.get_agent_node(test_agent_id)

        if agent:
            print(f"✅ Test agent verified: {agent.get('name')}")
        else:
            print("❌ Test agent not found")
            return False

        # Clean up test agent
        print("6️⃣  Cleaning up test agent...")
        await client.deactivate_agent(test_agent_id)
        print("✅ Test agent deactivated")
        print()

        # Close connection
        await client.close()

        print("=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print()
        print("Next steps:")
        print("1. Run PostgreSQL migration: supabase/migrations/001_add_fulltext_search.sql")
        print("2. Run agent migration: python scripts/migrations/migrate_agents_to_neo4j.py")
        print()

        return True

    except Exception as e:
        print()
        print("=" * 60)
        print("❌ TEST FAILED")
        print("=" * 60)
        print(f"Error: {str(e)}")
        print(f"Type: {type(e).__name__}")
        print()

        import traceback
        print("Traceback:")
        traceback.print_exc()

        return False


if __name__ == "__main__":
    result = asyncio.run(test_connection())
    sys.exit(0 if result else 1)
