"""
Conversation History Analyzer

Analyzes chat history to learn and improve agent relationships:
- Identify successful vs failed agent selections
- Track escalation patterns from actual conversations
- Discover collaboration opportunities
- Update relationship quality scores based on usage
- Build temporal patterns (time-of-day, query complexity)

This service runs periodically to keep the graph fresh and accurate.
"""

import asyncio
import logging
import os
from typing import Dict, List, Any, Optional, Tuple, Set
from datetime import datetime, timedelta
from collections import defaultdict, Counter
from dataclasses import dataclass
import json

import asyncpg
import numpy as np


logger = logging.getLogger(__name__)


@dataclass
class AgentUsagePattern:
    """Pattern of agent usage from conversation history"""
    agent_id: str
    agent_name: str
    total_uses: int
    successful_uses: int
    failed_uses: int
    avg_confidence: float
    avg_response_time_ms: float
    common_query_types: List[str]
    common_escalation_targets: List[str]
    common_collaboration_partners: List[str]
    success_rate: float


@dataclass
class EscalationPattern:
    """Escalation pattern discovered from conversations"""
    from_agent_id: str
    to_agent_id: str
    occurrence_count: int
    avg_confidence_before: float
    avg_confidence_after: float
    improvement_rate: float
    common_reasons: List[str]
    avg_time_to_escalate_ms: float


class ConversationHistoryAnalyzer:
    """
    Analyze conversation history to improve graph relationships
    """

    def __init__(self, database_url: Optional[str] = None):
        self.database_url = database_url or os.getenv("DATABASE_URL")
        self.db_pool: Optional[asyncpg.Pool] = None

        # Thresholds
        self.success_confidence_threshold = 0.75  # Confidence >= 0.75 = success
        self.failure_confidence_threshold = 0.50  # Confidence < 0.50 = failure
        self.minimum_sample_size = 3  # Need at least 3 occurrences to learn

    async def connect(self):
        """Connect to database"""
        if not self.db_pool:
            self.db_pool = await asyncpg.create_pool(
                self.database_url,
                min_size=2,
                max_size=10,
                command_timeout=60
            )
            logger.info("Connected to PostgreSQL")

    async def close(self):
        """Close database connection"""
        if self.db_pool:
            await self.db_pool.close()
            logger.info("Closed PostgreSQL connection")

    async def analyze_agent_usage_patterns(
        self,
        lookback_days: int = 30
    ) -> List[AgentUsagePattern]:
        """
        Analyze how agents have been used in conversations.

        Args:
            lookback_days: Number of days to look back

        Returns:
            List of agent usage patterns
        """
        if not self.db_pool:
            await self.connect()

        # Query conversation history
        cutoff_date = datetime.now() - timedelta(days=lookback_days)

        agent_stats = await self.db_pool.fetch("""
            WITH agent_messages AS (
                SELECT
                    cm.expert_id AS agent_id,
                    cm.expert_name AS agent_name,
                    cm.confidence_score,
                    cm.response_time_ms,
                    cm.content,
                    cs.mode,
                    cm.created_at
                FROM chat_messages cm
                JOIN chat_sessions cs ON cm.session_id = cs.id
                WHERE
                    cm.role = 'assistant'
                    AND cm.expert_id IS NOT NULL
                    AND cm.created_at >= $1
            )
            SELECT
                agent_id,
                agent_name,
                COUNT(*) AS total_uses,
                COUNT(*) FILTER (WHERE confidence_score >= $2) AS successful_uses,
                COUNT(*) FILTER (WHERE confidence_score < $3) AS failed_uses,
                AVG(confidence_score)::DECIMAL(4,3) AS avg_confidence,
                AVG(response_time_ms)::DECIMAL(8,2) AS avg_response_time_ms
            FROM agent_messages
            WHERE agent_id IS NOT NULL
            GROUP BY agent_id, agent_name
            HAVING COUNT(*) >= $4
            ORDER BY total_uses DESC
        """, cutoff_date, self.success_confidence_threshold,
             self.failure_confidence_threshold, self.minimum_sample_size)

        patterns = []

        for row in agent_stats:
            # Get escalation targets
            escalation_targets = await self._find_escalation_targets(
                row['agent_id'],
                cutoff_date
            )

            # Get collaboration partners
            collaboration_partners = await self._find_collaboration_partners(
                row['agent_id'],
                cutoff_date
            )

            success_rate = (
                row['successful_uses'] / row['total_uses']
                if row['total_uses'] > 0 else 0.0
            )

            patterns.append(AgentUsagePattern(
                agent_id=row['agent_id'],
                agent_name=row['agent_name'],
                total_uses=row['total_uses'],
                successful_uses=row['successful_uses'],
                failed_uses=row['failed_uses'],
                avg_confidence=float(row['avg_confidence']),
                avg_response_time_ms=float(row['avg_response_time_ms']),
                common_query_types=[],  # TODO: Extract from content analysis
                common_escalation_targets=escalation_targets,
                common_collaboration_partners=collaboration_partners,
                success_rate=success_rate
            ))

        logger.info(f"Analyzed {len(patterns)} agent usage patterns")
        return patterns

    async def _find_escalation_targets(
        self,
        agent_id: str,
        cutoff_date: datetime
    ) -> List[str]:
        """Find agents that this agent commonly escalates to"""
        # Look for conversations where this agent was followed by another agent
        targets = await self.db_pool.fetch("""
            WITH agent_sequences AS (
                SELECT
                    cm1.expert_id AS from_agent,
                    cm1.expert_name AS from_agent_name,
                    cm2.expert_id AS to_agent,
                    cm2.expert_name AS to_agent_name,
                    cm1.confidence_score AS confidence_before,
                    cm2.confidence_score AS confidence_after
                FROM chat_messages cm1
                JOIN chat_messages cm2 ON
                    cm1.session_id = cm2.session_id
                    AND cm2.created_at > cm1.created_at
                    AND cm2.role = 'assistant'
                    AND cm1.role = 'assistant'
                WHERE
                    cm1.expert_id = $1
                    AND cm1.created_at >= $2
                    AND cm1.confidence_score < $3  -- Low confidence suggests need for escalation
                    AND cm2.expert_id IS NOT NULL
                    AND cm2.expert_id != cm1.expert_id
            )
            SELECT
                to_agent_name,
                COUNT(*) AS occurrence_count
            FROM agent_sequences
            GROUP BY to_agent, to_agent_name
            HAVING COUNT(*) >= $4
            ORDER BY occurrence_count DESC
            LIMIT 5
        """, agent_id, cutoff_date, self.success_confidence_threshold,
             self.minimum_sample_size)

        return [row['to_agent_name'] for row in targets]

    async def _find_collaboration_partners(
        self,
        agent_id: str,
        cutoff_date: datetime
    ) -> List[str]:
        """Find agents that commonly work together with this agent in same session"""
        partners = await self.db_pool.fetch("""
            WITH session_agents AS (
                SELECT DISTINCT
                    cm1.session_id,
                    cm1.expert_id AS agent1,
                    cm1.expert_name AS agent1_name,
                    cm2.expert_id AS agent2,
                    cm2.expert_name AS agent2_name
                FROM chat_messages cm1
                JOIN chat_messages cm2 ON
                    cm1.session_id = cm2.session_id
                    AND cm2.expert_id IS NOT NULL
                    AND cm2.expert_id != cm1.expert_id
                WHERE
                    cm1.expert_id = $1
                    AND cm1.created_at >= $2
                    AND cm1.role = 'assistant'
                    AND cm2.role = 'assistant'
            )
            SELECT
                agent2_name,
                COUNT(DISTINCT session_id) AS session_count
            FROM session_agents
            GROUP BY agent2, agent2_name
            HAVING COUNT(DISTINCT session_id) >= $3
            ORDER BY session_count DESC
            LIMIT 5
        """, agent_id, cutoff_date, self.minimum_sample_size)

        return [row['agent2_name'] for row in partners]

    async def discover_escalation_patterns(
        self,
        lookback_days: int = 30
    ) -> List[EscalationPattern]:
        """
        Discover escalation patterns from conversation history.

        An escalation is when:
        1. Agent A responds with low confidence
        2. Agent B responds shortly after
        3. Agent B has higher confidence
        """
        if not self.db_pool:
            await self.connect()

        cutoff_date = datetime.now() - timedelta(days=lookback_days)

        escalations = await self.db_pool.fetch("""
            WITH agent_transitions AS (
                SELECT
                    cm1.expert_id AS from_agent_id,
                    a1.name AS from_agent_name,
                    cm2.expert_id AS to_agent_id,
                    a2.name AS to_agent_name,
                    cm1.confidence_score AS confidence_before,
                    cm2.confidence_score AS confidence_after,
                    EXTRACT(EPOCH FROM (cm2.created_at - cm1.created_at)) * 1000 AS time_diff_ms,
                    cm1.session_id
                FROM chat_messages cm1
                JOIN chat_messages cm2 ON
                    cm1.session_id = cm2.session_id
                    AND cm2.created_at > cm1.created_at
                    AND cm2.role = 'assistant'
                    AND cm1.role = 'assistant'
                LEFT JOIN agents a1 ON cm1.expert_id::UUID = a1.id
                LEFT JOIN agents a2 ON cm2.expert_id::UUID = a2.id
                WHERE
                    cm1.created_at >= $1
                    AND cm1.confidence_score < $2  -- Low confidence from first agent
                    AND cm2.confidence_score > cm1.confidence_score  -- Improvement
                    AND cm1.expert_id IS NOT NULL
                    AND cm2.expert_id IS NOT NULL
                    AND cm1.expert_id != cm2.expert_id
            ),
            escalation_groups AS (
                SELECT
                    from_agent_id,
                    from_agent_name,
                    to_agent_id,
                    to_agent_name,
                    COUNT(*) AS occurrence_count,
                    AVG(confidence_before)::DECIMAL(4,3) AS avg_confidence_before,
                    AVG(confidence_after)::DECIMAL(4,3) AS avg_confidence_after,
                    AVG(time_diff_ms)::DECIMAL(10,2) AS avg_time_to_escalate_ms
                FROM agent_transitions
                GROUP BY from_agent_id, from_agent_name, to_agent_id, to_agent_name
                HAVING COUNT(*) >= $3
            )
            SELECT
                from_agent_id,
                from_agent_name,
                to_agent_id,
                to_agent_name,
                occurrence_count,
                avg_confidence_before,
                avg_confidence_after,
                avg_time_to_escalate_ms,
                (avg_confidence_after - avg_confidence_before)::DECIMAL(4,3) AS improvement
            FROM escalation_groups
            WHERE avg_confidence_after > avg_confidence_before
            ORDER BY occurrence_count DESC, improvement DESC
        """, cutoff_date, self.success_confidence_threshold, self.minimum_sample_size)

        patterns = []

        for row in escalations:
            improvement_rate = float(row['improvement']) if row['improvement'] else 0.0

            patterns.append(EscalationPattern(
                from_agent_id=row['from_agent_id'],
                to_agent_id=row['to_agent_id'],
                occurrence_count=row['occurrence_count'],
                avg_confidence_before=float(row['avg_confidence_before']),
                avg_confidence_after=float(row['avg_confidence_after']),
                improvement_rate=improvement_rate,
                common_reasons=['low_confidence'],  # TODO: Extract from context
                avg_time_to_escalate_ms=float(row['avg_time_to_escalate_ms'])
            ))

        logger.info(f"Discovered {len(patterns)} escalation patterns")
        return patterns

    async def update_escalation_relationships(
        self,
        patterns: List[EscalationPattern]
    ) -> int:
        """
        Update escalation relationships in database based on discovered patterns.

        Returns:
            Number of relationships updated
        """
        if not self.db_pool:
            await self.connect()

        updated_count = 0

        for pattern in patterns:
            try:
                # Update or create escalation relationship
                await self.db_pool.execute("""
                    INSERT INTO agent_escalations (
                        from_agent_id,
                        to_agent_id,
                        escalation_reason,
                        priority,
                        usage_count,
                        success_rate,
                        metadata
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (from_agent_id, to_agent_id, escalation_reason)
                    DO UPDATE SET
                        priority = agent_escalations.priority + 1,  -- Boost priority
                        usage_count = agent_escalations.usage_count + EXCLUDED.usage_count,
                        success_rate = (
                            (agent_escalations.success_rate * agent_escalations.usage_count +
                             EXCLUDED.success_rate * EXCLUDED.usage_count) /
                            (agent_escalations.usage_count + EXCLUDED.usage_count)
                        )::DECIMAL(3,2),
                        metadata = EXCLUDED.metadata,
                        last_used_at = NOW(),
                        updated_at = NOW()
                """,
                    pattern.from_agent_id,
                    pattern.to_agent_id,
                    'learned_from_conversations',
                    5 + min(pattern.occurrence_count, 10),  # Priority based on frequency
                    pattern.occurrence_count,
                    min(pattern.improvement_rate + 0.70, 0.95),  # Success rate
                    json.dumps({
                        "avg_confidence_before": pattern.avg_confidence_before,
                        "avg_confidence_after": pattern.avg_confidence_after,
                        "avg_time_to_escalate_ms": pattern.avg_time_to_escalate_ms,
                        "learned_at": datetime.now().isoformat()
                    })
                )
                updated_count += 1

            except Exception as e:
                logger.error(f"Error updating escalation {pattern.from_agent_id} -> {pattern.to_agent_id}: {e}")

        logger.info(f"Updated {updated_count} escalation relationships")
        return updated_count

    async def update_collaboration_relationships(
        self,
        lookback_days: int = 30
    ) -> int:
        """
        Update collaboration relationships based on agents used together.

        Returns:
            Number of relationships updated
        """
        if not self.db_pool:
            await self.connect()

        cutoff_date = datetime.now() - timedelta(days=lookback_days)

        # Find agents that appear together in sessions
        collaborations = await self.db_pool.fetch("""
            WITH session_agent_pairs AS (
                SELECT DISTINCT
                    cm1.session_id,
                    LEAST(cm1.expert_id::UUID, cm2.expert_id::UUID) AS agent1_id,
                    GREATEST(cm1.expert_id::UUID, cm2.expert_id::UUID) AS agent2_id,
                    AVG(cm1.confidence_score)::DECIMAL(4,3) AS avg_confidence1,
                    AVG(cm2.confidence_score)::DECIMAL(4,3) AS avg_confidence2
                FROM chat_messages cm1
                JOIN chat_messages cm2 ON
                    cm1.session_id = cm2.session_id
                    AND cm2.expert_id IS NOT NULL
                    AND cm1.expert_id IS NOT NULL
                    AND cm2.expert_id::UUID != cm1.expert_id::UUID
                WHERE
                    cm1.created_at >= $1
                    AND cm1.role = 'assistant'
                    AND cm2.role = 'assistant'
                GROUP BY cm1.session_id, cm1.expert_id, cm2.expert_id
            )
            SELECT
                agent1_id,
                agent2_id,
                COUNT(DISTINCT session_id) AS session_count,
                AVG((avg_confidence1 + avg_confidence2) / 2)::DECIMAL(4,3) AS avg_combined_confidence
            FROM session_agent_pairs
            WHERE agent1_id < agent2_id  -- Ensure uniqueness
            GROUP BY agent1_id, agent2_id
            HAVING COUNT(DISTINCT session_id) >= $2
            ORDER BY session_count DESC
        """, cutoff_date, self.minimum_sample_size)

        updated_count = 0

        for row in collaborations:
            try:
                # Calculate collaboration strength
                strength = min(
                    (row['session_count'] / 10.0) * 0.5 +  # Frequency factor
                    float(row['avg_combined_confidence']) * 0.5,  # Quality factor
                    1.0
                )

                # Update or create collaboration relationship
                await self.db_pool.execute("""
                    INSERT INTO agent_collaborations (
                        agent1_id,
                        agent2_id,
                        collaboration_type,
                        strength,
                        collaboration_count,
                        success_rate,
                        metadata
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT ON CONSTRAINT unique_collaboration
                    DO UPDATE SET
                        strength = GREATEST(
                            agent_collaborations.strength,
                            EXCLUDED.strength
                        ),
                        collaboration_count = agent_collaborations.collaboration_count + EXCLUDED.collaboration_count,
                        success_rate = (
                            (agent_collaborations.success_rate * agent_collaborations.collaboration_count +
                             EXCLUDED.success_rate * EXCLUDED.collaboration_count) /
                            (agent_collaborations.collaboration_count + EXCLUDED.collaboration_count)
                        )::DECIMAL(3,2),
                        last_collaboration_at = NOW(),
                        updated_at = NOW()
                """,
                    row['agent1_id'],
                    row['agent2_id'],
                    'learned_from_conversations',
                    strength,
                    row['session_count'],
                    float(row['avg_combined_confidence']),
                    json.dumps({
                        "avg_combined_confidence": float(row['avg_combined_confidence']),
                        "learned_at": datetime.now().isoformat()
                    })
                )
                updated_count += 1

            except Exception as e:
                logger.error(f"Error updating collaboration: {e}")

        logger.info(f"Updated {updated_count} collaboration relationships")
        return updated_count

    async def update_domain_proficiency_from_usage(
        self,
        patterns: List[AgentUsagePattern]
    ) -> int:
        """
        Update domain proficiency scores based on actual usage success rates.

        Logic:
        - High success rate (>80%) → Boost proficiency by 5-10%
        - Low success rate (<60%) → Reduce proficiency by 5-10%
        - Medium success rate → Keep current proficiency
        """
        if not self.db_pool:
            await self.connect()

        updated_count = 0

        for pattern in patterns:
            if pattern.total_uses < self.minimum_sample_size:
                continue

            # Determine proficiency adjustment
            if pattern.success_rate >= 0.80:
                adjustment = 0.05 + (pattern.success_rate - 0.80) * 0.25  # Up to +10%
            elif pattern.success_rate < 0.60:
                adjustment = -0.05 - (0.60 - pattern.success_rate) * 0.25  # Down to -10%
            else:
                adjustment = 0.0  # No change

            if abs(adjustment) < 0.01:  # Skip tiny adjustments
                continue

            try:
                # Update all domain proficiencies for this agent
                result = await self.db_pool.execute("""
                    UPDATE agent_domains
                    SET
                        proficiency_score = GREATEST(0.30, LEAST(1.0,
                            proficiency_score + $2
                        )),
                        confidence = GREATEST(0.50, LEAST(0.99,
                            confidence + ($2 * 0.5)
                        )),
                        metadata = jsonb_set(
                            COALESCE(metadata, '{}'::jsonb),
                            '{learned_from_usage}',
                            to_jsonb(NOW())
                        ),
                        updated_at = NOW()
                    WHERE agent_id = $1::UUID
                """, pattern.agent_id, adjustment)

                if result:
                    updated_count += 1

            except Exception as e:
                logger.error(f"Error updating domain proficiency for {pattern.agent_id}: {e}")

        logger.info(f"Updated domain proficiency for {updated_count} agents")
        return updated_count

    async def run_full_analysis(
        self,
        lookback_days: int = 30
    ) -> Dict[str, Any]:
        """
        Run complete conversation history analysis and update relationships.

        Returns:
            Summary of updates performed
        """
        logger.info(f"Starting conversation history analysis (lookback: {lookback_days} days)")

        await self.connect()

        try:
            # Step 1: Analyze agent usage patterns
            logger.info("Step 1/4: Analyzing agent usage patterns...")
            usage_patterns = await self.analyze_agent_usage_patterns(lookback_days)

            # Step 2: Discover escalation patterns
            logger.info("Step 2/4: Discovering escalation patterns...")
            escalation_patterns = await self.discover_escalation_patterns(lookback_days)

            # Step 3: Update relationships
            logger.info("Step 3/4: Updating escalation relationships...")
            escalations_updated = await self.update_escalation_relationships(escalation_patterns)

            logger.info("Step 3/4: Updating collaboration relationships...")
            collaborations_updated = await self.update_collaboration_relationships(lookback_days)

            logger.info("Step 4/4: Updating domain proficiency from usage...")
            domains_updated = await self.update_domain_proficiency_from_usage(usage_patterns)

            summary = {
                "analysis_date": datetime.now().isoformat(),
                "lookback_days": lookback_days,
                "agents_analyzed": len(usage_patterns),
                "escalation_patterns_found": len(escalation_patterns),
                "escalations_updated": escalations_updated,
                "collaborations_updated": collaborations_updated,
                "domain_proficiencies_updated": domains_updated,
                "top_agents": [
                    {
                        "name": p.agent_name,
                        "total_uses": p.total_uses,
                        "success_rate": f"{p.success_rate:.1%}",
                        "avg_confidence": f"{p.avg_confidence:.3f}"
                    }
                    for p in sorted(usage_patterns, key=lambda x: x.total_uses, reverse=True)[:5]
                ],
                "top_escalations": [
                    {
                        "from_to": f"{p.from_agent_id} → {p.to_agent_id}",
                        "occurrences": p.occurrence_count,
                        "improvement": f"{p.improvement_rate:.3f}"
                    }
                    for p in sorted(escalation_patterns, key=lambda x: x.occurrence_count, reverse=True)[:5]
                ]
            }

            logger.info(f"""
Conversation history analysis complete!
- Agents analyzed: {len(usage_patterns)}
- Escalation patterns: {len(escalation_patterns)}
- Escalations updated: {escalations_updated}
- Collaborations updated: {collaborations_updated}
- Domain proficiencies updated: {domains_updated}
            """)

            return summary

        finally:
            await self.close()


# ============================================================================
# CLI Interface
# ============================================================================

async def main():
    """CLI entry point"""
    import sys

    analyzer = ConversationHistoryAnalyzer()

    # Parse lookback days from command line
    lookback_days = int(sys.argv[1]) if len(sys.argv) > 1 else 30

    print(f"\nAnalyzing conversation history (lookback: {lookback_days} days)...\n")

    summary = await analyzer.run_full_analysis(lookback_days)

    # Pretty print summary
    print("="*80)
    print("CONVERSATION HISTORY ANALYSIS - COMPLETE")
    print("="*80)
    print(f"Analysis Date:              {summary['analysis_date']}")
    print(f"Lookback Period:            {summary['lookback_days']} days")
    print(f"Agents Analyzed:            {summary['agents_analyzed']}")
    print(f"Escalation Patterns Found:  {summary['escalation_patterns_found']}")
    print(f"Escalations Updated:        {summary['escalations_updated']}")
    print(f"Collaborations Updated:     {summary['collaborations_updated']}")
    print(f"Domain Proficiencies Updated: {summary['domain_proficiencies_updated']}")
    print("="*80)

    if summary['top_agents']:
        print("\nTop 5 Most Used Agents:")
        print("-"*80)
        for agent in summary['top_agents']:
            print(f"  {agent['name']}: {agent['total_uses']} uses, "
                  f"{agent['success_rate']} success, "
                  f"avg confidence {agent['avg_confidence']}")

    if summary['top_escalations']:
        print("\nTop 5 Escalation Patterns:")
        print("-"*80)
        for esc in summary['top_escalations']:
            print(f"  {esc['from_to']}: {esc['occurrences']} times, "
                  f"+{esc['improvement']} improvement")

    print("="*80)


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    asyncio.run(main())
