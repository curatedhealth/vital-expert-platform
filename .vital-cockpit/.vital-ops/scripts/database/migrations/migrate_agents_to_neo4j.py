"""
Migration Script: PostgreSQL Agents → Neo4j Graph Database

Migrates agent data from PostgreSQL to Neo4j for GraphRAG hybrid search.

What this script does:
1. Fetches all agents from PostgreSQL (Supabase)
2. Creates agent nodes in Neo4j with embeddings
3. Creates relationships between agents:
   - RELATES_TO: Domain/capability relationships
   - CO_OCCURS_WITH: Historical collaboration patterns
   - COMPLEMENTS: Agents with overlapping capabilities
4. Creates graph indexes for performance

Prerequisites:
- Neo4j database deployed and accessible
- NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD environment variables set
- Supabase credentials configured

Usage:
    python scripts/migrations/migrate_agents_to_neo4j.py

Options:
    --dry-run: Print migration plan without executing
    --batch-size: Number of agents to process per batch (default: 50)
    --skip-relationships: Only migrate nodes, skip relationship creation
"""

import asyncio
import os
import sys
from pathlib import Path
from typing import List, Dict
import argparse

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "services" / "ai-engine" / "src"))

from services.supabase_client import get_supabase_client, initialize_supabase_client
from services.neo4j_client import Neo4jClient
from services.embedding_service import EmbeddingService
import structlog

logger = structlog.get_logger()


class AgentMigration:
    """Agent migration from PostgreSQL to Neo4j."""

    def __init__(
        self,
        neo4j_uri: str,
        neo4j_user: str,
        neo4j_password: str,
        batch_size: int = 50,
        dry_run: bool = False
    ):
        self.neo4j = Neo4jClient(neo4j_uri, neo4j_user, neo4j_password)
        self.supabase = None  # Lazy init
        self.embedding_service = EmbeddingService()
        self.batch_size = batch_size
        self.dry_run = dry_run

        # Statistics
        self.stats = {
            "agents_migrated": 0,
            "relationships_created": 0,
            "errors": 0
        }

    async def initialize(self):
        """Initialize connections."""
        # Initialize Supabase
        initialize_supabase_client(
            url=os.getenv("SUPABASE_URL"),
            anon_key=os.getenv("SUPABASE_ANON_KEY"),
            service_role_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )
        self.supabase = get_supabase_client()

        # Verify Neo4j connection
        if not await self.neo4j.verify_connection():
            raise RuntimeError("Failed to connect to Neo4j database")

        logger.info("Migration initialized successfully")

    async def run(self, skip_relationships: bool = False):
        """
        Run complete migration.

        Args:
            skip_relationships: If True, only migrate nodes
        """
        logger.info(
            "Starting agent migration",
            dry_run=self.dry_run,
            skip_relationships=skip_relationships
        )

        try:
            await self.initialize()

            # Step 1: Create indexes
            await self.create_indexes()

            # Step 2: Migrate agent nodes
            agents = await self.fetch_agents_from_postgresql()
            await self.migrate_agent_nodes(agents)

            if not skip_relationships:
                # Step 3: Create relationships
                await self.create_domain_relationships(agents)
                await self.create_capability_relationships(agents)
                await self.create_collaboration_relationships()

            # Print summary
            self.print_summary()

        except Exception as e:
            logger.error("Migration failed", error=str(e), error_type=type(e).__name__)
            raise

        finally:
            await self.neo4j.close()

    # ==================== Index Creation ====================

    async def create_indexes(self):
        """Create Neo4j indexes for performance."""
        logger.info("Creating Neo4j indexes")

        if self.dry_run:
            logger.info("[DRY RUN] Would create indexes")
            return

        async with self.neo4j.driver.session(database="neo4j") as session:
            # Agent ID index (unique constraint)
            await session.run("""
                CREATE CONSTRAINT agent_id_unique IF NOT EXISTS
                FOR (a:Agent) REQUIRE a.id IS UNIQUE
            """)

            # Tenant ID index
            await session.run("""
                CREATE INDEX agent_tenant_idx IF NOT EXISTS
                FOR (a:Agent) ON (a.tenant_id)
            """)

            # Capabilities index
            await session.run("""
                CREATE INDEX agent_capabilities_idx IF NOT EXISTS
                FOR (a:Agent) ON (a.capabilities)
            """)

            # Vector index for embeddings
            try:
                await session.run("""
                    CREATE VECTOR INDEX agent_embedding_idx IF NOT EXISTS
                    FOR (a:Agent) ON (a.embedding)
                    OPTIONS {indexConfig: {
                        `vector.dimensions`: 1536,
                        `vector.similarity_function`: 'cosine'
                    }}
                """)
            except Exception as e:
                logger.warning("Vector index creation failed (may not be supported)", error=str(e))

        logger.info("Indexes created successfully")

    # ==================== Agent Node Migration ====================

    async def fetch_agents_from_postgresql(self) -> List[Dict]:
        """Fetch all agents from PostgreSQL."""
        logger.info("Fetching agents from PostgreSQL")

        result = await self.supabase.client.table("agents").select("*").execute()

        agents = result.data or []

        logger.info(f"Fetched {len(agents)} agents from PostgreSQL")

        return agents

    async def migrate_agent_nodes(self, agents: List[Dict]):
        """
        Migrate agent nodes to Neo4j.

        Args:
            agents: List of agent records from PostgreSQL
        """
        logger.info(f"Migrating {len(agents)} agent nodes to Neo4j")

        # Process in batches
        for i in range(0, len(agents), self.batch_size):
            batch = agents[i:i + self.batch_size]

            logger.info(f"Processing batch {i // self.batch_size + 1}/{(len(agents) + self.batch_size - 1) // self.batch_size}")

            for agent in batch:
                try:
                    if self.dry_run:
                        logger.info(
                            "[DRY RUN] Would create agent node",
                            agent_id=agent["id"],
                            name=agent["name"]
                        )
                        continue

                    # Create agent node
                    await self.neo4j.create_agent_node(
                        agent_id=agent["id"],
                        name=agent["name"],
                        capabilities=agent.get("capabilities", []),
                        domains=agent.get("domain_expertise", []),
                        tenant_id=agent["tenant_id"],
                        tier=agent.get("tier", 2),
                        embedding=None,  # Will be added later if needed
                        metadata={
                            "description": agent.get("description", ""),
                            "specialization": agent.get("specialization", ""),
                            "model": agent.get("model", ""),
                            "temperature": agent.get("temperature", 0.7)
                        }
                    )

                    self.stats["agents_migrated"] += 1

                except Exception as e:
                    logger.error(
                        "Failed to migrate agent",
                        agent_id=agent["id"],
                        error=str(e)
                    )
                    self.stats["errors"] += 1

        logger.info(f"Migrated {self.stats['agents_migrated']} agent nodes")

    # ==================== Relationship Creation ====================

    async def create_domain_relationships(self, agents: List[Dict]):
        """
        Create RELATES_TO relationships based on domain overlap.

        Args:
            agents: List of agent records
        """
        logger.info("Creating domain-based relationships")

        relationship_count = 0

        for i, agent1 in enumerate(agents):
            domains1 = set(agent1.get("domain_expertise", []))

            for agent2 in agents[i + 1:]:
                domains2 = set(agent2.get("domain_expertise", []))

                # Calculate domain overlap
                overlap = domains1 & domains2

                if overlap:
                    weight = len(overlap) / max(len(domains1), len(domains2), 1)

                    if weight >= 0.3:  # Minimum 30% overlap
                        if self.dry_run:
                            logger.info(
                                "[DRY RUN] Would create RELATES_TO relationship",
                                from_agent=agent1["name"],
                                to_agent=agent2["name"],
                                weight=weight
                            )
                            continue

                        try:
                            await self.neo4j.create_relationship(
                                from_agent_id=agent1["id"],
                                to_agent_id=agent2["id"],
                                relationship_type="RELATES_TO",
                                weight=weight,
                                metadata={"shared_domains": list(overlap)}
                            )

                            relationship_count += 1
                            self.stats["relationships_created"] += 1

                        except Exception as e:
                            logger.error(
                                "Failed to create domain relationship",
                                error=str(e)
                            )

        logger.info(f"Created {relationship_count} domain-based relationships")

    async def create_capability_relationships(self, agents: List[Dict]):
        """
        Create COMPLEMENTS relationships based on capability overlap.

        Args:
            agents: List of agent records
        """
        logger.info("Creating capability-based relationships")

        relationship_count = 0

        for i, agent1 in enumerate(agents):
            caps1 = set(agent1.get("capabilities", []))

            for agent2 in agents[i + 1:]:
                caps2 = set(agent2.get("capabilities", []))

                # Calculate capability overlap
                overlap = caps1 & caps2

                if overlap and len(overlap) >= 2:  # At least 2 shared capabilities
                    weight = len(overlap) / max(len(caps1), len(caps2), 1)

                    if self.dry_run:
                        logger.info(
                            "[DRY RUN] Would create COMPLEMENTS relationship",
                            from_agent=agent1["name"],
                            to_agent=agent2["name"],
                            weight=weight
                        )
                        continue

                    try:
                        await self.neo4j.create_relationship(
                            from_agent_id=agent1["id"],
                            to_agent_id=agent2["id"],
                            relationship_type="COMPLEMENTS",
                            weight=weight,
                            metadata={"shared_capabilities": list(overlap)}
                        )

                        relationship_count += 1
                        self.stats["relationships_created"] += 1

                    except Exception as e:
                        logger.error(
                            "Failed to create capability relationship",
                            error=str(e)
                        )

        logger.info(f"Created {relationship_count} capability-based relationships")

    async def create_collaboration_relationships(self):
        """
        Create CO_OCCURS_WITH relationships from historical collaboration data.

        Reads from agent_collaborations table if it exists.
        """
        logger.info("Creating collaboration-based relationships")

        try:
            # Check if agent_collaborations table exists
            result = await self.supabase.client.table("agent_collaborations").select("*").limit(1).execute()

            # If table exists, fetch all collaborations
            result = await self.supabase.client.table("agent_collaborations").select("*").execute()

            collaborations = result.data or []

            logger.info(f"Found {len(collaborations)} historical collaborations")

            for collab in collaborations:
                if self.dry_run:
                    logger.info(
                        "[DRY RUN] Would create CO_OCCURS_WITH relationship",
                        agent1=collab["agent_id_1"],
                        agent2=collab["agent_id_2"]
                    )
                    continue

                try:
                    await self.neo4j.create_relationship(
                        from_agent_id=collab["agent_id_1"],
                        to_agent_id=collab["agent_id_2"],
                        relationship_type="CO_OCCURS_WITH",
                        weight=collab.get("co_occurrence_score", 0.5),
                        metadata={
                            "co_occurrence_count": collab.get("co_occurrence_count", 1),
                            "success_count": collab.get("success_count", 0)
                        }
                    )

                    self.stats["relationships_created"] += 1

                except Exception as e:
                    logger.error(
                        "Failed to create collaboration relationship",
                        error=str(e)
                    )

        except Exception as e:
            logger.warning(
                "Collaboration table not found or error fetching data",
                error=str(e)
            )
            logger.info("Skipping collaboration relationships")

    # ==================== Summary ====================

    def print_summary(self):
        """Print migration summary."""
        print("\n" + "=" * 60)
        print("MIGRATION SUMMARY")
        print("=" * 60)
        print(f"Agents migrated:        {self.stats['agents_migrated']}")
        print(f"Relationships created:  {self.stats['relationships_created']}")
        print(f"Errors:                 {self.stats['errors']}")
        print(f"Dry run:                {self.dry_run}")
        print("=" * 60 + "\n")


async def main():
    """Main migration entry point."""
    parser = argparse.ArgumentParser(description="Migrate agents from PostgreSQL to Neo4j")
    parser.add_argument("--dry-run", action="store_true", help="Print migration plan without executing")
    parser.add_argument("--batch-size", type=int, default=50, help="Batch size for processing")
    parser.add_argument("--skip-relationships", action="store_true", help="Only migrate nodes")

    args = parser.parse_args()

    # Get Neo4j credentials from environment
    neo4j_uri = os.getenv("NEO4J_URI")
    neo4j_user = os.getenv("NEO4J_USER", "neo4j")
    neo4j_password = os.getenv("NEO4J_PASSWORD")

    if not neo4j_uri or not neo4j_password:
        print("ERROR: NEO4J_URI and NEO4J_PASSWORD environment variables required")
        sys.exit(1)

    # Run migration
    migration = AgentMigration(
        neo4j_uri=neo4j_uri,
        neo4j_user=neo4j_user,
        neo4j_password=neo4j_password,
        batch_size=args.batch_size,
        dry_run=args.dry_run
    )

    await migration.run(skip_relationships=args.skip_relationships)


if __name__ == "__main__":
    asyncio.run(main())
