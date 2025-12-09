"""
Graph Relationship Builder

Analyzes conversation history and agent metadata to build graph relationships:
- Agent-Domain relationships with proficiency scores
- Agent-Capability relationships
- Agent escalation paths
- Agent collaboration patterns

Also generates embeddings for agents using OpenAI embeddings.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Tuple, Set
from datetime import datetime
import os
from collections import defaultdict, Counter

import asyncpg
from langchain_openai import OpenAIEmbeddings
import numpy as np


logger = logging.getLogger(__name__)


class GraphRelationshipBuilder:
    """
    Builds graph relationships for agents based on:
    1. Agent metadata (specialties, expertise, capabilities)
    2. Conversation history analysis
    3. Success/failure patterns
    """

    def __init__(self):
        self.db_pool: Optional[asyncpg.Pool] = None
        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-3-large",
            dimensions=1536
        )

        # Domain keywords mapping
        self.domain_keywords = {
            "medical": ["medical", "clinical", "patient", "diagnosis", "treatment", "therapeutic"],
            "medical.cardiology": ["cardiac", "heart", "cardiovascular", "coronary", "arrhythmia"],
            "medical.oncology": ["cancer", "oncology", "tumor", "chemotherapy", "radiation"],
            "medical.neurology": ["brain", "neurological", "seizure", "stroke", "cognitive"],

            "regulatory": ["regulatory", "compliance", "fda", "ema", "submission"],
            "regulatory.fda": ["fda", "510k", "pma", "ide", "premarket"],
            "regulatory.ema": ["ema", "european", "ce mark", "mdr"],

            "clinical": ["trial", "clinical research", "study", "protocol", "endpoint"],
            "clinical.trial_design": ["trial design", "randomization", "blinding", "control"],
            "clinical.biostatistics": ["statistical", "biostatistics", "analysis", "power"],

            "pharma": ["pharmaceutical", "drug", "manufacturing", "formulation"],
            "pharma.drug_development": ["drug development", "preclinical", "discovery"],
            "pharma.manufacturing": ["manufacturing", "gmp", "production", "quality control"]
        }

        # Capability keywords mapping
        self.capability_keywords = {
            "medical_diagnosis_support": ["diagnosis", "differential", "symptom", "assessment"],
            "regulatory_submission": ["submission", "510k", "pma", "application", "filing"],
            "clinical_trial_design": ["trial design", "protocol", "recruitment", "endpoints"],
            "statistical_analysis": ["statistics", "analysis", "hypothesis", "regression"],
            "literature_review": ["literature", "systematic review", "meta-analysis", "evidence"],
            "risk_assessment": ["risk", "hazard", "safety", "mitigation"],
            "quality_assurance": ["quality", "qa", "qc", "validation", "verification"],
            "evidence_synthesis": ["evidence", "synthesis", "systematic", "grade"],
            "guideline_interpretation": ["guideline", "recommendation", "standard", "protocol"],
            "data_validation": ["validation", "verify", "data quality", "accuracy"]
        }

    async def connect_db(self):
        """Connect to PostgreSQL database"""
        database_url = os.getenv("DATABASE_URL")

        self.db_pool = await asyncpg.create_pool(
            database_url,
            min_size=2,
            max_size=10,
            command_timeout=60
        )
        logger.info("Connected to PostgreSQL")

    async def close_db(self):
        """Close database connection"""
        if self.db_pool:
            await self.db_pool.close()
            logger.info("Closed PostgreSQL connection")

    async def generate_agent_embeddings(self, agent_id: str, batch_size: int = 10) -> int:
        """
        Generate embeddings for a single agent or all agents.

        Args:
            agent_id: Agent ID (or 'all' for all agents)
            batch_size: Number of agents to process in parallel

        Returns:
            Number of embeddings created
        """
        if not self.db_pool:
            await self.connect_db()

        # Fetch agents
        if agent_id == "all":
            agents = await self.db_pool.fetch("""
                SELECT id, name, description, expertise, specialties, capabilities, background
                FROM agents
                WHERE is_active = true
            """)
        else:
            agents = await self.db_pool.fetch("""
                SELECT id, name, description, expertise, specialties, capabilities, background
                FROM agents
                WHERE id = $1 AND is_active = true
            """, agent_id)

        logger.info(f"Generating embeddings for {len(agents)} agents")

        total_created = 0

        # Process in batches
        for i in range(0, len(agents), batch_size):
            batch = agents[i:i+batch_size]
            tasks = [self._generate_embeddings_for_agent(agent) for agent in batch]
            results = await asyncio.gather(*tasks)
            total_created += sum(results)

        logger.info(f"Created {total_created} embeddings")
        return total_created

    async def _generate_embeddings_for_agent(self, agent: asyncpg.Record) -> int:
        """Generate embeddings for a single agent"""
        count = 0

        # 1. Agent profile embedding (comprehensive)
        profile_text = self._build_agent_profile_text(agent)
        profile_embedding = await self.embeddings.aembed_query(profile_text)

        await self.db_pool.execute("""
            INSERT INTO agent_embeddings (agent_id, embedding, embedding_type, source_text, embedding_quality_score)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (agent_id, embedding_type)
            DO UPDATE SET
                embedding = EXCLUDED.embedding,
                source_text = EXCLUDED.source_text,
                updated_at = NOW()
        """, agent['id'], profile_embedding, 'agent_profile', profile_text[:500], 0.90)
        count += 1

        # 2. Capabilities embedding
        if agent['capabilities']:
            capabilities_text = f"Agent capabilities: {', '.join(agent['capabilities'])}"
            capabilities_embedding = await self.embeddings.aembed_query(capabilities_text)

            await self.db_pool.execute("""
                INSERT INTO agent_embeddings (agent_id, embedding, embedding_type, source_text, embedding_quality_score)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (agent_id, embedding_type)
                DO UPDATE SET
                    embedding = EXCLUDED.embedding,
                    source_text = EXCLUDED.source_text,
                    updated_at = NOW()
            """, agent['id'], capabilities_embedding, 'agent_capabilities', capabilities_text, 0.85)
            count += 1

        # 3. Specialties embedding
        if agent['specialties']:
            specialties_text = f"Agent specialties: {', '.join(agent['specialties'])}"
            specialties_embedding = await self.embeddings.aembed_query(specialties_text)

            await self.db_pool.execute("""
                INSERT INTO agent_embeddings (agent_id, embedding, embedding_type, source_text, embedding_quality_score)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (agent_id, embedding_type)
                DO UPDATE SET
                    embedding = EXCLUDED.embedding,
                    source_text = EXCLUDED.source_text,
                    updated_at = NOW()
            """, agent['id'], specialties_embedding, 'agent_specialties', specialties_text, 0.85)
            count += 1

        logger.info(f"Generated {count} embeddings for agent {agent['name']}")
        return count

    def _build_agent_profile_text(self, agent: asyncpg.Record) -> str:
        """Build comprehensive text representation of agent for embedding"""
        parts = []

        if agent['name']:
            parts.append(f"Agent: {agent['name']}")

        if agent['description']:
            parts.append(f"Description: {agent['description']}")

        if agent['background']:
            parts.append(f"Background: {agent['background']}")

        if agent['expertise']:
            parts.append(f"Expertise: {', '.join(agent['expertise'])}")

        if agent['specialties']:
            parts.append(f"Specialties: {', '.join(agent['specialties'])}")

        if agent['capabilities']:
            parts.append(f"Capabilities: {', '.join(agent['capabilities'])}")

        return " | ".join(parts)

    async def build_domain_relationships(self, agent_id: Optional[str] = None) -> int:
        """
        Build agent-domain relationships based on agent metadata and keywords.

        Args:
            agent_id: Specific agent ID (or None for all agents)

        Returns:
            Number of relationships created
        """
        if not self.db_pool:
            await self.connect_db()

        # Fetch agents
        if agent_id:
            agents = await self.db_pool.fetch("""
                SELECT id, name, description, expertise, specialties, capabilities
                FROM agents
                WHERE id = $1 AND is_active = true
            """, agent_id)
        else:
            agents = await self.db_pool.fetch("""
                SELECT id, name, description, expertise, specialties, capabilities
                FROM agents
                WHERE is_active = true
            """)

        # Fetch all domains
        domains = await self.db_pool.fetch("SELECT id, name FROM domains")
        domain_map = {d['name']: d['id'] for d in domains}

        total_created = 0

        for agent in agents:
            # Combine all agent text for analysis
            agent_text = " ".join([
                agent['description'] or "",
                " ".join(agent['expertise'] or []),
                " ".join(agent['specialties'] or []),
                " ".join(agent['capabilities'] or [])
            ]).lower()

            # Match domains based on keywords
            domain_scores = self._calculate_domain_matches(agent_text)

            # Create relationships for domains with sufficient match
            for domain_name, score in domain_scores.items():
                if domain_name in domain_map and score >= 0.30:  # 30% threshold
                    await self.db_pool.execute("""
                        INSERT INTO agent_domains (agent_id, domain_id, proficiency_score, relationship_source, confidence)
                        VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (agent_id, domain_id)
                        DO UPDATE SET
                            proficiency_score = EXCLUDED.proficiency_score,
                            confidence = EXCLUDED.confidence,
                            updated_at = NOW()
                    """, agent['id'], domain_map[domain_name], min(score, 1.0), 'inferred_from_specialties', min(score * 0.9, 0.95))
                    total_created += 1

        logger.info(f"Created {total_created} agent-domain relationships")
        return total_created

    def _calculate_domain_matches(self, agent_text: str) -> Dict[str, float]:
        """Calculate domain match scores based on keyword presence"""
        scores = {}

        for domain_name, keywords in self.domain_keywords.items():
            match_count = sum(1 for kw in keywords if kw in agent_text)
            total_keywords = len(keywords)

            if match_count > 0:
                # Score = (matches / total) with bonus for multiple matches
                base_score = match_count / total_keywords
                bonus = min(match_count * 0.1, 0.3)  # Up to 30% bonus
                scores[domain_name] = min(base_score + bonus, 1.0)

        return scores

    async def build_capability_relationships(self, agent_id: Optional[str] = None) -> int:
        """
        Build agent-capability relationships based on agent metadata.

        Args:
            agent_id: Specific agent ID (or None for all agents)

        Returns:
            Number of relationships created
        """
        if not self.db_pool:
            await self.connect_db()

        # Fetch agents
        if agent_id:
            agents = await self.db_pool.fetch("""
                SELECT id, name, description, capabilities
                FROM agents
                WHERE id = $1 AND is_active = true
            """, agent_id)
        else:
            agents = await self.db_pool.fetch("""
                SELECT id, name, description, capabilities
                FROM agents
                WHERE is_active = true
            """)

        # Fetch all capabilities
        capabilities = await self.db_pool.fetch("SELECT id, name FROM capabilities")
        capability_map = {c['name']: c['id'] for c in capabilities}

        total_created = 0

        for agent in agents:
            # Combine agent text
            agent_text = " ".join([
                agent['description'] or "",
                " ".join(agent['capabilities'] or [])
            ]).lower()

            # Match capabilities based on keywords
            capability_scores = self._calculate_capability_matches(agent_text)

            # Create relationships
            for capability_name, score in capability_scores.items():
                if capability_name in capability_map and score >= 0.40:  # 40% threshold
                    await self.db_pool.execute("""
                        INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_score, relationship_source, confidence)
                        VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (agent_id, capability_id)
                        DO UPDATE SET
                            proficiency_score = EXCLUDED.proficiency_score,
                            confidence = EXCLUDED.confidence,
                            updated_at = NOW()
                    """, agent['id'], capability_map[capability_name], min(score, 1.0), 'inferred_from_capabilities', min(score * 0.85, 0.90))
                    total_created += 1

        logger.info(f"Created {total_created} agent-capability relationships")
        return total_created

    def _calculate_capability_matches(self, agent_text: str) -> Dict[str, float]:
        """Calculate capability match scores based on keyword presence"""
        scores = {}

        for capability_name, keywords in self.capability_keywords.items():
            match_count = sum(1 for kw in keywords if kw in agent_text)
            total_keywords = len(keywords)

            if match_count > 0:
                base_score = match_count / total_keywords
                bonus = min(match_count * 0.15, 0.35)
                scores[capability_name] = min(base_score + bonus, 1.0)

        return scores

    async def build_escalation_paths(self) -> int:
        """
        Build escalation paths based on agent levels and domains.

        Logic:
        - L3 → L2 agents in same domain
        - L2 → L1 agents in same domain
        - Cross-domain escalations for multi-domain queries
        """
        if not self.db_pool:
            await self.connect_db()

        # Fetch all agents with their domains
        agents = await self.db_pool.fetch("""
            SELECT
                a.id,
                a.name,
                COALESCE((a.metadata->>'tier')::INTEGER, 2) AS agent_level,
                array_agg(DISTINCT d.name) AS domains
            FROM agents a
            LEFT JOIN agent_domains ad ON a.id = ad.agent_id
            LEFT JOIN domains d ON ad.domain_id = d.id
            WHERE a.is_active = true
            GROUP BY a.id, a.name, a.metadata
        """)

        total_created = 0

        # Build escalation paths
        for from_agent in agents:
            from_level = from_agent['agent_level']
            from_domains = set(from_agent['domains'] or [])

            # Find higher-level agents in same domains (lower number = higher level)
            for to_agent in agents:
                to_level = to_agent['agent_level']
                to_domains = set(to_agent['domains'] or [])

                # Skip if not higher level
                if to_level >= from_level:
                    continue

                # Check domain overlap
                shared_domains = from_domains & to_domains

                if shared_domains:
                    # Calculate priority based on level difference and domain overlap
                    tier_diff = from_level - to_level
                    domain_overlap = len(shared_domains) / max(len(from_domains), 1)
                    priority = int((tier_diff * 3) + (domain_overlap * 5))

                    # Create escalation path
                    await self.db_pool.execute("""
                        INSERT INTO agent_escalations (from_agent_id, to_agent_id, escalation_reason, priority, success_rate)
                        VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (from_agent_id, to_agent_id, escalation_reason)
                        DO UPDATE SET
                            priority = EXCLUDED.priority,
                            updated_at = NOW()
                    """, from_agent['id'], to_agent['id'], 'complexity_threshold_exceeded', priority, 0.80)
                    total_created += 1

        logger.info(f"Created {total_created} escalation paths")
        return total_created

    async def build_collaboration_patterns(self) -> int:
        """
        Build collaboration patterns based on complementary expertise.

        Agents collaborate well when:
        - Different specialties in same domain
        - Complementary capabilities
        - Cross-domain expertise for multi-disciplinary queries
        """
        if not self.db_pool:
            await self.connect_db()

        # Fetch agents with capabilities and domains
        agents = await self.db_pool.fetch("""
            SELECT
                a.id,
                a.name,
                array_agg(DISTINCT d.id) FILTER (WHERE d.id IS NOT NULL) AS domain_ids,
                array_agg(DISTINCT c.id) FILTER (WHERE c.id IS NOT NULL) AS capability_ids
            FROM agents a
            LEFT JOIN agent_domains ad ON a.id = ad.agent_id
            LEFT JOIN domains d ON ad.domain_id = d.id
            LEFT JOIN agent_capabilities ac ON a.id = ac.agent_id
            LEFT JOIN capabilities c ON ac.capability_id = c.id
            WHERE a.is_active = true
            GROUP BY a.id, a.name
        """)

        total_created = 0

        # Find collaboration pairs
        for i, agent1 in enumerate(agents):
            for agent2 in agents[i+1:]:  # Only create once (A-B, not A-B and B-A)
                domains1 = set(agent1['domain_ids'] or [])
                domains2 = set(agent2['domain_ids'] or [])
                caps1 = set(agent1['capability_ids'] or [])
                caps2 = set(agent2['capability_ids'] or [])

                # Calculate collaboration strength
                shared_domains = domains1 & domains2
                complementary_caps = (caps1 - caps2) | (caps2 - caps1)

                if shared_domains and complementary_caps:
                    # Strength based on shared domains and complementary capabilities
                    domain_factor = len(shared_domains) / max(len(domains1 | domains2), 1)
                    capability_factor = len(complementary_caps) / max(len(caps1 | caps2), 1)
                    strength = min((domain_factor * 0.4) + (capability_factor * 0.6), 1.0)

                    if strength >= 0.40:  # 40% threshold
                        collaboration_type = 'complementary_expertise' if capability_factor > 0.6 else 'multi_domain'

                        await self.db_pool.execute("""
                            INSERT INTO agent_collaborations (agent1_id, agent2_id, collaboration_type, strength, shared_domains, success_rate)
                            VALUES ($1, $2, $3, $4, $5, $6)
                            ON CONFLICT ON CONSTRAINT unique_collaboration
                            DO UPDATE SET
                                strength = EXCLUDED.strength,
                                shared_domains = EXCLUDED.shared_domains,
                                updated_at = NOW()
                        """, agent1['id'], agent2['id'], collaboration_type, strength, list(shared_domains), 0.75)
                        total_created += 1

        logger.info(f"Created {total_created} collaboration patterns")
        return total_created

    async def build_all_relationships(self, agent_id: Optional[str] = None):
        """Build all graph relationships for agents"""
        logger.info("Starting comprehensive graph relationship building...")

        await self.connect_db()

        try:
            # 1. Generate embeddings
            logger.info("Step 1/5: Generating embeddings...")
            embedding_count = await self.generate_agent_embeddings(agent_id or "all")

            # 2. Build domain relationships
            logger.info("Step 2/5: Building domain relationships...")
            domain_count = await self.build_domain_relationships(agent_id)

            # 3. Build capability relationships
            logger.info("Step 3/5: Building capability relationships...")
            capability_count = await self.build_capability_relationships(agent_id)

            if not agent_id:  # Only build graph relationships when processing all agents
                # 4. Build escalation paths
                logger.info("Step 4/5: Building escalation paths...")
                escalation_count = await self.build_escalation_paths()

                # 5. Build collaboration patterns
                logger.info("Step 5/5: Building collaboration patterns...")
                collaboration_count = await self.build_collaboration_patterns()
            else:
                escalation_count = 0
                collaboration_count = 0

            logger.info(f"""
Graph building complete!
- Embeddings: {embedding_count}
- Domain relationships: {domain_count}
- Capability relationships: {capability_count}
- Escalation paths: {escalation_count}
- Collaboration patterns: {collaboration_count}
Total: {embedding_count + domain_count + capability_count + escalation_count + collaboration_count}
            """)

            return {
                "embeddings": embedding_count,
                "domains": domain_count,
                "capabilities": capability_count,
                "escalations": escalation_count,
                "collaborations": collaboration_count
            }

        finally:
            await self.close_db()


# ============================================================================
# CLI Interface
# ============================================================================

async def main():
    """CLI entry point"""
    import sys

    builder = GraphRelationshipBuilder()

    if len(sys.argv) > 1:
        agent_id = sys.argv[1]
        logger.info(f"Building relationships for agent: {agent_id}")
    else:
        agent_id = None
        logger.info("Building relationships for all agents")

    results = await builder.build_all_relationships(agent_id)

    print("\n" + "="*70)
    print("Graph Relationship Building - COMPLETE")
    print("="*70)
    print(f"Embeddings created:        {results['embeddings']}")
    print(f"Domain relationships:      {results['domains']}")
    print(f"Capability relationships:  {results['capabilities']}")
    print(f"Escalation paths:          {results['escalations']}")
    print(f"Collaboration patterns:    {results['collaborations']}")
    print("="*70)


if __name__ == "__main__":
    # Set up logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    asyncio.run(main())
