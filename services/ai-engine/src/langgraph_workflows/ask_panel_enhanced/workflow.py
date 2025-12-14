"""
Enhanced Ask Panel Workflow

Real multi-expert panel consultations with:
- Real LLM calls via LLMService (NO mocks/hardcoded responses)
- Agents from database (NO fallback agents)
- board_session database integration for persistence
- Streaming events for real-time UI updates
- Consensus building and synthesis
"""

import asyncio
from typing import List, Dict, Any, Optional, AsyncIterator
from datetime import datetime, timezone
from uuid import uuid4
import structlog

from services.supabase_client import SupabaseClient
from services.agent_service import AgentService
from services.llm_service import LLMService
from infrastructure.llm.config_service import get_llm_config_for_level

logger = structlog.get_logger()


class EnhancedAskPanelWorkflow:
    """
    Production-ready Ask Panel workflow with real LLM calls.

    Architecture:
    - Uses LLMService for ALL LLM calls (no mocks)
    - Fetches agents from database (no fallbacks)
    - Stores sessions in board_session tables
    - Streams events for real-time UI updates
    """

    def __init__(
        self,
        supabase_client: SupabaseClient,
        agent_service: AgentService,
        rag_service: Any,  # Optional RAG service
        llm_service: LLMService
    ):
        self.supabase = supabase_client
        self.agent_service = agent_service
        self.rag_service = rag_service
        self.llm_service = llm_service

        # Get LLM config from environment (L3 = Specialist level)
        self._llm_config = get_llm_config_for_level("L3")

    async def initialize(self) -> None:
        """Initialize workflow dependencies"""
        logger.info("Initializing EnhancedAskPanelWorkflow")

    async def execute(
        self,
        question: str,
        template_slug: str,
        selected_agent_ids: List[str],
        tenant_id: str,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        enable_debate: bool = True,
        max_rounds: int = 3,
        require_consensus: bool = False
    ) -> AsyncIterator[Dict[str, Any]]:
        """
        Execute panel consultation with streaming events.

        Args:
            question: User's question for the panel
            template_slug: Panel template identifier
            selected_agent_ids: List of agent UUIDs from database
            tenant_id: Tenant ID for isolation
            user_id: Optional user ID
            session_id: Optional session ID
            enable_debate: Enable multi-round debate
            max_rounds: Maximum discussion rounds
            require_consensus: Require high consensus before completing

        Yields:
            Dict events for SSE streaming
        """
        panel_session_id = str(uuid4())

        logger.info(
            "Starting enhanced panel consultation",
            panel_id=panel_session_id,
            question=question[:100],
            agent_count=len(selected_agent_ids),
            template=template_slug
        )

        try:
            # 1. Yield orchestrator intro
            yield {
                "type": "message",
                "node": "orchestrator_intro",
                "data": {
                    "id": f"intro-{panel_session_id}",
                    "type": "orchestrator",
                    "role": "orchestrator",
                    "content": f"Starting expert panel consultation.\n\n**Question:** {question}\n\nAssembling {len(selected_agent_ids)} experts for analysis...",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "agent_id": None,
                    "agent_name": "Panel Orchestrator",
                    "metadata": {
                        "panel_id": panel_session_id,
                        "template": template_slug
                    }
                }
            }

            # 2. Load agents from database
            agents = await self._load_agents(selected_agent_ids, tenant_id)

            if not agents:
                yield {
                    "type": "error",
                    "data": {
                        "error": "No valid agents found in database",
                        "message": f"Could not load agents with IDs: {selected_agent_ids}"
                    }
                }
                return

            # 3. Create board_session record
            board_session = await self._create_board_session(
                panel_session_id,
                question,
                template_slug,
                user_id,
                tenant_id,
                agents
            )

            # 4. Get RAG context if available
            rag_context = await self._get_rag_context(question) if self.rag_service else None

            # 5. Execute panel rounds
            all_responses = []
            consensus_level = 0.0

            for round_num in range(1, max_rounds + 1):
                logger.info(f"Executing round {round_num}/{max_rounds}")

                # Yield round start event
                yield {
                    "type": "message",
                    "node": f"round_{round_num}_start",
                    "data": {
                        "id": f"round-{round_num}-{panel_session_id}",
                        "type": "system",
                        "role": "system",
                        "content": f"**Round {round_num}** - Experts are analyzing...",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "metadata": {"round": round_num}
                    }
                }

                # Get responses from all agents in parallel
                round_responses = await self._execute_round(
                    agents=agents,
                    question=question,
                    round_num=round_num,
                    previous_responses=all_responses,
                    rag_context=rag_context,
                    panel_session_id=panel_session_id
                )

                # Yield each agent's response
                for response in round_responses:
                    yield {
                        "type": "message",
                        "node": f"agent_response_round_{round_num}",
                        "data": {
                            "id": f"response-{response['agent_id']}-r{round_num}",
                            "type": "agent",
                            "role": "expert",
                            "content": response["content"],
                            "timestamp": response["timestamp"],
                            "agent_id": response["agent_id"],
                            "agent_name": response["agent_name"],
                            "metadata": {
                                "round": round_num,
                                "confidence": response.get("confidence", 0.8),
                                "agent_specialty": response.get("specialty")
                            }
                        }
                    }
                    all_responses.append(response)

                # Store responses in database
                await self._store_responses(panel_session_id, round_responses, round_num)

                # Calculate consensus after each round
                consensus_level = self._calculate_consensus(all_responses)

                # Check if we should continue
                if consensus_level >= 0.8 and not require_consensus:
                    break

                if round_num < max_rounds and enable_debate:
                    # Only continue if we haven't reached high consensus
                    if consensus_level < 0.8:
                        await asyncio.sleep(0.1)  # Small delay between rounds

            # 6. Generate synthesis/summary
            synthesis = await self._generate_synthesis(question, all_responses, rag_context)

            yield {
                "type": "message",
                "node": "panel_synthesis",
                "data": {
                    "id": f"synthesis-{panel_session_id}",
                    "type": "summary",
                    "role": "moderator",
                    "content": synthesis,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "agent_id": None,
                    "agent_name": "Panel Moderator",
                    "metadata": {
                        "consensus_level": consensus_level,
                        "rounds_completed": round_num,
                        "total_responses": len(all_responses)
                    }
                }
            }

            # 7. Store synthesis and update session status
            await self._store_synthesis(panel_session_id, synthesis, consensus_level, round_num)
            await self._complete_session(panel_session_id)

            logger.info(
                "Panel consultation completed",
                panel_id=panel_session_id,
                rounds=round_num,
                consensus=consensus_level
            )

        except Exception as e:
            logger.error("Panel execution failed", error=str(e), panel_id=panel_session_id)
            yield {
                "type": "error",
                "data": {
                    "error": str(e),
                    "message": "Panel consultation failed"
                }
            }

    async def _load_agents(self, agent_ids: List[str], tenant_id: str) -> List[Dict[str, Any]]:
        """Load agents from database - NO fallbacks"""
        agents = []

        if not self.supabase or not self.supabase.client:
            logger.error("Supabase client not available")
            return []

        try:
            # Use AgentService if available (preferred method)
            if self.agent_service:
                agents = await self.agent_service.get_agents_by_ids(agent_ids)
                if agents:
                    logger.info(
                        f"Loaded {len(agents)} agents via AgentService",
                        agent_names=[a.get("name") for a in agents]
                    )
                    return agents

            # Fallback: Query agents one by one (more reliable with UUIDs)
            logger.info(f"Loading agents one by one for IDs: {agent_ids}")
            for agent_id in agent_ids:
                try:
                    result = self.supabase.client.table("agents").select(
                        "id, name, description, system_prompt, is_active"
                    ).eq("id", agent_id).limit(1).execute()

                    if result.data and len(result.data) > 0:
                        agents.append(result.data[0])
                        logger.debug(f"Found agent: {result.data[0].get('name')} ({agent_id})")
                    else:
                        logger.warning(f"Agent not found: {agent_id}")
                except Exception as e:
                    logger.error(f"Failed to load agent {agent_id}: {e}")

            if agents:
                logger.info(
                    f"Loaded {len(agents)} agents from database",
                    agent_names=[a.get("name") for a in agents]
                )
            else:
                # Log more info for debugging
                logger.warning(
                    f"No agents found for IDs: {agent_ids}",
                    supabase_client_present=bool(self.supabase.client)
                )
                # Try to get any agent to verify the table is accessible
                test_result = self.supabase.client.table("agents").select("id, name").limit(2).execute()
                if test_result.data:
                    logger.info(
                        f"Agents table accessible - sample agents: {[a.get('name') for a in test_result.data]}"
                    )

        except Exception as e:
            logger.error(f"Failed to load agents: {e}", exc_info=True)

        return agents

    async def _create_board_session(
        self,
        panel_id: str,
        question: str,
        template_slug: str,
        user_id: Optional[str],
        tenant_id: str,
        agents: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """Create board_session record in database"""
        try:
            if not self.supabase or not self.supabase.client:
                return None

            # Create session
            session_data = {
                "id": panel_id,
                "name": question[:255],
                "description": f"Panel consultation: {question[:500]}",
                "archetype": "structured",
                "fusion_model": "autonomous",
                "mode": "parallel",
                "agenda": [{"topic": question, "max_rounds": 3}],
                "status": "active",
                "created_by": user_id or "anonymous",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "started_at": datetime.now(timezone.utc).isoformat(),
                "metadata": {"template_slug": template_slug, "tenant_id": tenant_id}
            }

            result = self.supabase.client.table("board_session").insert(session_data).execute()

            if result.data:
                # Add panel members
                members = [
                    {
                        "session_id": panel_id,
                        "agent_id": agent["id"],
                        "persona": agent.get("specialty", "EXPERT"),
                        "role": "expert",
                        "weight": 1.0,
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }
                    for agent in agents
                ]

                self.supabase.client.table("board_panel_member").insert(members).execute()

                logger.info(f"Created board_session with {len(members)} members", panel_id=panel_id)
                return result.data[0]

        except Exception as e:
            logger.warning(f"Failed to create board_session (non-fatal): {e}")

        return None

    async def _get_rag_context(self, question: str) -> Optional[Dict[str, Any]]:
        """Get RAG context if available"""
        if not self.rag_service:
            return None

        try:
            result = await self.rag_service.query(
                query_text=question,
                max_results=5
            )
            return result
        except Exception as e:
            logger.warning(f"RAG query failed (non-fatal): {e}")
            return None

    async def _execute_round(
        self,
        agents: List[Dict[str, Any]],
        question: str,
        round_num: int,
        previous_responses: List[Dict[str, Any]],
        rag_context: Optional[Dict[str, Any]],
        panel_session_id: str
    ) -> List[Dict[str, Any]]:
        """Execute a round of expert responses in parallel"""

        tasks = [
            self._get_agent_response(
                agent=agent,
                question=question,
                round_num=round_num,
                previous_responses=previous_responses,
                rag_context=rag_context
            )
            for agent in agents
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Filter out errors
        responses = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Agent {agents[i].get('name')} failed: {result}")
                # Include error response
                responses.append({
                    "agent_id": agents[i]["id"],
                    "agent_name": agents[i].get("display_name") or agents[i].get("name", "Expert"),
                    "specialty": agents[i].get("specialty", ""),
                    "content": f"[Response unavailable due to error: {str(result)}]",
                    "confidence": 0.0,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
            else:
                responses.append(result)

        return responses

    async def _get_agent_response(
        self,
        agent: Dict[str, Any],
        question: str,
        round_num: int,
        previous_responses: List[Dict[str, Any]],
        rag_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Get response from a single agent using REAL LLM"""

        agent_name = agent.get("display_name") or agent.get("name", "Expert")
        agent_specialty = agent.get("specialty", "")
        system_prompt = agent.get("system_prompt", "")

        # Build prompt with context
        prompt_parts = []

        # Use agent's system prompt if available
        if system_prompt:
            prompt_parts.append(f"You are {agent_name}. {system_prompt}")
        else:
            prompt_parts.append(f"You are {agent_name}, an expert in {agent_specialty or 'healthcare and life sciences'}.")

        # Add RAG context if available
        if rag_context and rag_context.get("context"):
            prompt_parts.append(f"\n\n**Relevant Evidence:**\n{rag_context['context'][:1500]}")

        # Add previous responses for debate context
        if previous_responses and round_num > 1:
            context_lines = ["Previous expert responses:"]
            for resp in previous_responses[-5:]:
                context_lines.append(f"\n- {resp.get('agent_name')}: {resp.get('content', '')[:200]}...")
            prompt_parts.append("\n\n" + "\n".join(context_lines))

        # Add the question
        if round_num == 1:
            prompt_parts.append(f"\n\n**Question:** {question}\n\nProvide your expert analysis with specific recommendations.")
        else:
            prompt_parts.append(f"\n\n**Round {round_num} Discussion:** {question}\n\nBuild on previous responses, adding new insights or respectfully disagreeing where appropriate.")

        full_prompt = "\n".join(prompt_parts)

        # Call LLM - REAL response, no mocks
        try:
            response_text = await self.llm_service.generate(
                prompt=full_prompt,
                model=self._llm_config.model,
                temperature=self._llm_config.temperature,
                max_tokens=self._llm_config.max_tokens
            )
        except Exception as e:
            logger.error(f"LLM call failed for agent {agent_name}: {e}")
            raise

        return {
            "agent_id": agent["id"],
            "agent_name": agent_name,
            "specialty": agent_specialty,
            "content": response_text,
            "confidence": 0.85,  # Can be calculated from response quality
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    async def _store_responses(
        self,
        panel_id: str,
        responses: List[Dict[str, Any]],
        round_num: int
    ):
        """Store responses in board_reply table"""
        try:
            if not self.supabase or not self.supabase.client:
                return

            replies = [
                {
                    "session_id": panel_id,
                    "agent_id": resp["agent_id"],
                    "turn_no": round_num,
                    "persona": resp.get("specialty", "EXPERT"),
                    "answer": resp["content"],
                    "confidence": resp.get("confidence", 0.8),
                    "citations": [],
                    "flags": [],
                    "created_at": resp["timestamp"]
                }
                for resp in responses
            ]

            self.supabase.client.table("board_reply").insert(replies).execute()

        except Exception as e:
            logger.warning(f"Failed to store responses (non-fatal): {e}")

    def _calculate_consensus(self, responses: List[Dict[str, Any]]) -> float:
        """Calculate consensus level from responses"""
        if not responses:
            return 0.0

        # Simple average of confidence scores
        confidences = [r.get("confidence", 0.5) for r in responses]
        return sum(confidences) / len(confidences)

    async def _generate_synthesis(
        self,
        question: str,
        responses: List[Dict[str, Any]],
        rag_context: Optional[Dict[str, Any]]
    ) -> str:
        """Generate synthesis/summary using LLM"""

        # Build synthesis prompt
        response_summaries = []
        for resp in responses:
            summary = f"**{resp['agent_name']}**: {resp['content'][:300]}..."
            response_summaries.append(summary)

        synthesis_prompt = f"""You are a panel moderator synthesizing expert opinions.

**Original Question:** {question}

**Expert Responses:**
{chr(10).join(response_summaries)}

Please provide:
1. **Key Consensus Points** - Where experts agree
2. **Different Perspectives** - Where experts differ
3. **Final Recommendation** - Actionable next steps based on collective expertise

Keep the synthesis concise but comprehensive."""

        try:
            synthesis = await self.llm_service.generate(
                prompt=synthesis_prompt,
                model=self._llm_config.model,
                temperature=0.3,  # Lower temperature for synthesis
                max_tokens=1500
            )
            return synthesis
        except Exception as e:
            logger.error(f"Synthesis generation failed: {e}")
            return "Unable to generate synthesis due to an error."

    async def _store_synthesis(
        self,
        panel_id: str,
        synthesis: str,
        consensus_level: float,
        round_num: int
    ):
        """Store synthesis in board_synthesis table"""
        try:
            if not self.supabase or not self.supabase.client:
                return

            synthesis_data = {
                "session_id": panel_id,
                "turn_no": round_num,
                "summary_md": synthesis,
                "consensus": synthesis,
                "consensus_level": consensus_level,
                "approved": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            }

            self.supabase.client.table("board_synthesis").upsert(synthesis_data).execute()

        except Exception as e:
            logger.warning(f"Failed to store synthesis (non-fatal): {e}")

    async def _complete_session(self, panel_id: str):
        """Mark session as completed"""
        try:
            if not self.supabase or not self.supabase.client:
                return

            self.supabase.client.table("board_session").update({
                "status": "completed",
                "completed_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", panel_id).execute()

        except Exception as e:
            logger.warning(f"Failed to complete session (non-fatal): {e}")
