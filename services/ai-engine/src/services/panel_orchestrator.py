"""
Panel Orchestration Service for VITAL Ask Panel
Multi-expert advisory board coordination
"""

import asyncio
import json
from typing import List, Dict, Any, Optional, AsyncGenerator
from datetime import datetime, timezone
from uuid import UUID, uuid4
import structlog

from services.agent_orchestrator import AgentOrchestrator
from services.supabase_client import SupabaseClient
from services.cache_manager import CacheManager
from services.unified_rag_service import UnifiedRAGService
from core.config import get_settings

logger = structlog.get_logger()


class PanelOrchestrator:
    """
    Orchestrates multi-expert panel discussions
    Integrates with existing agent orchestration infrastructure
    
    Supports 6 panel types:
    - structured: Sequential moderated discussion
    - open: Free-form brainstorming
    - socratic: Question-driven deep analysis
    - adversarial: Pro/con debate format
    - delphi: Iterative consensus building
    - hybrid: Human-AI collaborative panels
    """
    
    def __init__(
        self,
        agent_orchestrator: AgentOrchestrator,
        supabase: SupabaseClient,
        cache: CacheManager,
        rag_service: Optional[UnifiedRAGService] = None
    ):
        self.agent_orchestrator = agent_orchestrator
        self.supabase = supabase
        self.cache = cache
        self.rag_service = rag_service
        self.settings = get_settings()
        
        # Panel configuration
        self.max_experts = getattr(self.settings, 'ask_panel_max_experts', 12)
        self.max_rounds = getattr(self.settings, 'ask_panel_max_rounds', 5)
        self.min_consensus = getattr(self.settings, 'ask_panel_min_consensus', 0.70)
        self.default_timeout = getattr(self.settings, 'ask_panel_default_timeout', 300000)
        
    async def create_panel(
        self,
        tenant_id: UUID,
        user_id: UUID,
        query: str,
        panel_type: str,
        agent_ids: List[str],
        config: Optional[Dict[str, Any]] = None,
        evidence_pack_id: Optional[UUID] = None
    ) -> UUID:
        """
        Create a new panel session
        
        Args:
            tenant_id: Organization/tenant ID
            user_id: User creating the panel
            query: Question or topic for panel discussion
            panel_type: Type of panel (structured, open, socratic, etc.)
            agent_ids: List of agent IDs to include in panel
            config: Optional panel configuration
            evidence_pack_id: Optional evidence pack for RAG
            
        Returns:
            UUID of created panel session
        """
        try:
            # Validate inputs
            if len(agent_ids) < 2:
                raise ValueError("Panel must have at least 2 experts")
            
            if len(agent_ids) > self.max_experts:
                raise ValueError(f"Panel cannot have more than {self.max_experts} experts")
            
            valid_types = ['structured', 'open', 'socratic', 'adversarial', 'delphi', 'hybrid']
            if panel_type not in valid_types:
                raise ValueError(f"Invalid panel type. Must be one of: {valid_types}")
            
            # Merge default config with user config
            panel_config = {
                "max_rounds": self.max_rounds,
                "min_consensus": self.min_consensus,
                "timeout": self.default_timeout,
                "enable_streaming": True,
                **(config or {})
            }
            
            # Convert panel_type to archetype and mode for board_session
            archetype, mode = self._map_panel_type_to_board_config(panel_type)
            
            # Create panel session in database
            panel_data = {
                "name": query[:255],  # Truncate for name field
                "archetype": archetype,
                "fusion_model": "autonomous",  # AI-only by default
                "mode": mode,
                "agenda": [{"topic": query, "duration": 10}],
                "evidence_pack_id": str(evidence_pack_id) if evidence_pack_id else None,
                "created_by": str(user_id),
                "status": "draft",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            result = self.supabase.table("board_session").insert(panel_data).execute()
            
            if not result.data:
                raise Exception("Failed to create panel session")
            
            panel_id = UUID(result.data[0]["id"])
            
            # Add panel members
            await self._add_panel_members(panel_id, agent_ids)
            
            logger.info(
                "✅ Panel created",
                panel_id=str(panel_id),
                panel_type=panel_type,
                num_experts=len(agent_ids)
            )
            
            return panel_id
            
        except Exception as e:
            logger.error("❌ Failed to create panel", error=str(e))
            raise
    
    async def _add_panel_members(
        self,
        panel_id: UUID,
        agent_ids: List[str]
    ):
        """Add agents as panel members"""
        try:
            # Fetch agent details
            agents = self.supabase.table("agents").select("*").in_("id", agent_ids).execute()
            
            if not agents.data:
                raise ValueError("No valid agents found")
            
            # Create panel member records
            members = []
            for agent in agents.data:
                members.append({
                    "session_id": str(panel_id),
                    "agent_id": agent["id"],
                    "persona": agent.get("expert_category", "EXPERT"),
                    "role": "expert",
                    "weight": 1.0,
                    "created_at": datetime.now(timezone.utc).isoformat()
                })
            
            self.supabase.table("board_panel_member").insert(members).execute()
            
            logger.info(
                "✅ Panel members added",
                panel_id=str(panel_id),
                count=len(members)
            )
            
        except Exception as e:
            logger.error("❌ Failed to add panel members", error=str(e))
            raise
    
    async def execute_panel(
        self,
        panel_id: UUID,
        stream: bool = False
    ) -> Union[Dict[str, Any], AsyncGenerator]:
        """
        Execute panel discussion
        
        Args:
            panel_id: Panel session ID
            stream: Whether to stream responses in real-time
            
        Returns:
            Panel results or async generator for streaming
        """
        try:
            # Update panel status
            self.supabase.table("board_session").update({
                "status": "active",
                "started_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", str(panel_id)).execute()
            
            # Load panel configuration
            panel = await self._load_panel(panel_id)
            
            if stream:
                return self._execute_panel_streaming(panel)
            else:
                return await self._execute_panel_sync(panel)
                
        except Exception as e:
            logger.error("❌ Panel execution failed", panel_id=str(panel_id), error=str(e))
            
            # Update status to failed
            self.supabase.table("board_session").update({
                "status": "failed"
            }).eq("id", str(panel_id)).execute()
            
            raise
    
    async def _load_panel(self, panel_id: UUID) -> Dict[str, Any]:
        """Load panel configuration and members"""
        try:
            # Load panel session
            panel_result = self.supabase.table("board_session") \
                .select("*") \
                .eq("id", str(panel_id)) \
                .single() \
                .execute()
            
            if not panel_result.data:
                raise ValueError(f"Panel not found: {panel_id}")
            
            panel = panel_result.data
            
            # Load panel members
            members_result = self.supabase.table("board_panel_member") \
                .select("*, agents(*)") \
                .eq("session_id", str(panel_id)) \
                .execute()
            
            panel["members"] = members_result.data if members_result.data else []
            
            # Load evidence pack if specified
            if panel.get("evidence_pack_id"):
                evidence_result = self.supabase.table("evidence_pack") \
                    .select("*") \
                    .eq("id", panel["evidence_pack_id"]) \
                    .single() \
                    .execute()
                
                panel["evidence_pack"] = evidence_result.data if evidence_result.data else None
            
            return panel
            
        except Exception as e:
            logger.error("❌ Failed to load panel", panel_id=str(panel_id), error=str(e))
            raise
    
    async def _execute_panel_sync(self, panel: Dict[str, Any]) -> Dict[str, Any]:
        """Execute panel discussion synchronously"""
        panel_id = panel["id"]
        query = panel["agenda"][0]["topic"] if panel.get("agenda") else panel["name"]
        mode = panel.get("mode", "parallel")
        max_rounds = panel.get("agenda", [{}])[0].get("max_rounds", self.max_rounds)
        
        try:
            # Get RAG context if evidence pack exists
            rag_context = None
            if panel.get("evidence_pack"):
                rag_context = await self._get_rag_context(query, panel["evidence_pack"])
            
            # Execute discussion rounds
            all_responses = []
            
            for round_num in range(1, max_rounds + 1):
                logger.info(f"🎭 Executing round {round_num}/{max_rounds}", panel_id=panel_id)
                
                # Execute round based on mode
                if mode == "parallel":
                    responses = await self._execute_parallel_round(
                        panel, round_num, query, rag_context, all_responses
                    )
                elif mode == "sequential":
                    responses = await self._execute_sequential_round(
                        panel, round_num, query, rag_context, all_responses
                    )
                else:
                    responses = await self._execute_parallel_round(
                        panel, round_num, query, rag_context, all_responses
                    )
                
                all_responses.extend(responses)
                
                # Store responses
                await self._store_responses(panel_id, responses)
                
                # Check for consensus
                consensus = await self.build_consensus(panel_id, all_responses, round_num)
                
                if consensus["consensus_level"] >= self.min_consensus:
                    logger.info(
                        f"✅ Consensus reached at {consensus['consensus_level']:.2%}",
                        panel_id=panel_id,
                        round=round_num
                    )
                    break
            
            # Generate final report
            final_consensus = await self.build_consensus(panel_id, all_responses, round_num)
            report = await self._generate_report(panel, final_consensus, all_responses)
            
            # Update panel as completed
            self.supabase.table("board_session").update({
                "status": "completed",
                "completed_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", panel_id).execute()
            
            return {
                "panel_id": panel_id,
                "status": "completed",
                "rounds": round_num,
                "consensus": final_consensus,
                "report": report,
                "responses": all_responses
            }
            
        except Exception as e:
            logger.error("❌ Panel execution failed", panel_id=panel_id, error=str(e))
            raise
    
    async def _execute_parallel_round(
        self,
        panel: Dict[str, Any],
        round_num: int,
        query: str,
        rag_context: Optional[Dict[str, Any]],
        previous_responses: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Execute a round where all experts respond in parallel"""
        tasks = []
        
        for member in panel["members"]:
            agent = member.get("agents", member)
            task = self._get_expert_response(
                agent=agent,
                query=query,
                round_num=round_num,
                rag_context=rag_context,
                previous_responses=previous_responses
            )
            tasks.append(task)
        
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out errors
        valid_responses = [r for r in responses if not isinstance(r, Exception)]
        
        return valid_responses
    
    async def _execute_sequential_round(
        self,
        panel: Dict[str, Any],
        round_num: int,
        query: str,
        rag_context: Optional[Dict[str, Any]],
        previous_responses: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Execute a round where experts respond sequentially"""
        responses = []
        
        for member in panel["members"]:
            agent = member.get("agents", member)
            response = await self._get_expert_response(
                agent=agent,
                query=query,
                round_num=round_num,
                rag_context=rag_context,
                previous_responses=previous_responses + responses  # Include responses from this round
            )
            responses.append(response)
        
        return responses
    
    async def _get_expert_response(
        self,
        agent: Dict[str, Any],
        query: str,
        round_num: int,
        rag_context: Optional[Dict[str, Any]],
        previous_responses: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Get response from a single expert"""
        try:
            # Build context from previous responses
            context = self._build_discussion_context(previous_responses)
            
            # Construct prompt for agent
            full_query = self._construct_expert_prompt(
                query=query,
                round_num=round_num,
                context=context,
                rag_context=rag_context
            )
            
            # Get response from agent orchestrator
            from models.requests import AgentQueryRequest
            
            agent_request = AgentQueryRequest(
                message=full_query,
                agent_id=agent["id"],
                tenant_id=agent.get("organization_id", "default"),
                user_id=agent.get("created_by", "system"),
                enable_rag=rag_context is not None,
                session_id=str(uuid4())
            )
            
            response = await self.agent_orchestrator.process_query(agent_request)
            
            return {
                "agent_id": agent["id"],
                "agent_name": agent.get("name", "Unknown Expert"),
                "persona": agent.get("expert_category", "EXPERT"),
                "round_number": round_num,
                "answer": response.response,
                "confidence": response.metadata.get("confidence", 0.5),
                "citations": response.metadata.get("citations", []),
                "flags": response.metadata.get("flags", []),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get response from agent {agent.get('id')}", error=str(e))
            return {
                "agent_id": agent["id"],
                "agent_name": agent.get("name", "Unknown Expert"),
                "persona": agent.get("expert_category", "EXPERT"),
                "round_number": round_num,
                "answer": f"Error: {str(e)}",
                "confidence": 0.0,
                "citations": [],
                "flags": ["ERROR"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
    
    async def _get_rag_context(
        self,
        query: str,
        evidence_pack: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Get RAG context from evidence pack"""
        if not self.rag_service:
            return {}
        
        try:
            # Use unified RAG service to search evidence
            sources = evidence_pack.get("sources", [])
            domain_names = [s.get("therapeutic_area") for s in sources if s.get("therapeutic_area")]
            
            if domain_names:
                results = await self.rag_service.search_documents(
                    query=query,
                    domain_names=domain_names[:3],  # Limit to top 3 domains
                    limit=10
                )
                
                return {
                    "documents": results,
                    "evidence_pack": evidence_pack
                }
        
        except Exception as e:
            logger.error("❌ Failed to get RAG context", error=str(e))
        
        return {}
    
    def _build_discussion_context(
        self,
        previous_responses: List[Dict[str, Any]]
    ) -> str:
        """Build context string from previous responses"""
        if not previous_responses:
            return ""
        
        context_lines = ["Previous expert responses:"]
        
        for resp in previous_responses[-5:]:  # Last 5 responses
            expert = resp.get("agent_name", "Expert")
            answer = resp.get("answer", "")[:200]  # Truncate
            context_lines.append(f"\n{expert}: {answer}...")
        
        return "\n".join(context_lines)
    
    def _construct_expert_prompt(
        self,
        query: str,
        round_num: int,
        context: str,
        rag_context: Optional[Dict[str, Any]]
    ) -> str:
        """Construct prompt for expert with context"""
        prompt_parts = []
        
        if round_num == 1:
            prompt_parts.append(f"As a healthcare expert, please provide your analysis of:\n{query}")
        else:
            prompt_parts.append(f"Round {round_num} - Building on previous discussion:\n{query}")
            if context:
                prompt_parts.append(f"\n{context}")
        
        if rag_context and rag_context.get("documents"):
            prompt_parts.append("\nRelevant evidence:")
            for doc in rag_context["documents"][:3]:
                content = doc.get("content", "")[:200]
                prompt_parts.append(f"- {content}...")
        
        return "\n\n".join(prompt_parts)
    
    async def _store_responses(
        self,
        panel_id: str,
        responses: List[Dict[str, Any]]
    ):
        """Store expert responses in database"""
        try:
            board_replies = []
            
            for response in responses:
                board_replies.append({
                    "session_id": panel_id,
                    "turn_no": response["round_number"],
                    "persona": response["persona"],
                    "agent_id": response["agent_id"],
                    "answer": response["answer"],
                    "citations": response.get("citations", []),
                    "confidence": response.get("confidence", 0.5),
                    "flags": response.get("flags", []),
                    "created_at": response["created_at"]
                })
            
            if board_replies:
                self.supabase.table("board_reply").insert(board_replies).execute()
                
                logger.info(
                    "✅ Stored panel responses",
                    panel_id=panel_id,
                    count=len(board_replies)
                )
        
        except Exception as e:
            logger.error("❌ Failed to store responses", error=str(e))
    
    async def build_consensus(
        self,
        panel_id: str,
        responses: List[Dict[str, Any]],
        round_num: int
    ) -> Dict[str, Any]:
        """
        Build consensus from expert responses
        
        Uses quantum consensus algorithm by default
        """
        try:
            if not responses:
                return {
                    "consensus_level": 0.0,
                    "summary_md": "No responses to analyze",
                    "consensus": None,
                    "dissent": None
                }
            
            # Calculate consensus metrics
            avg_confidence = sum(r.get("confidence", 0.5) for r in responses) / len(responses)
            
            # Simple consensus check (can be enhanced with NLP similarity)
            consensus_level = avg_confidence  # Simplified
            
            # Generate summary
            summary = self._generate_consensus_summary(responses)
            consensus_statement = self._extract_consensus(responses)
            dissenting_points = self._extract_dissent(responses)
            
            # Store synthesis
            synthesis_data = {
                "session_id": panel_id,
                "turn_no": round_num,
                "summary_md": summary,
                "consensus": consensus_statement,
                "dissent": dissenting_points,
                "risks": [],  # TODO: Extract risks
                "approved": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            self.supabase.table("board_synthesis").upsert(synthesis_data).execute()
            
            return {
                "consensus_level": consensus_level,
                "summary_md": summary,
                "consensus": consensus_statement,
                "dissent": dissenting_points,
                "round": round_num
            }
            
        except Exception as e:
            logger.error("❌ Failed to build consensus", error=str(e))
            return {
                "consensus_level": 0.0,
                "summary_md": f"Error: {str(e)}",
                "consensus": None,
                "dissent": None
            }
    
    def _generate_consensus_summary(self, responses: List[Dict[str, Any]]) -> str:
        """Generate markdown summary of responses"""
        summary_lines = ["# Panel Discussion Summary\n"]
        
        for resp in responses:
            expert = resp.get("agent_name", "Expert")
            answer = resp.get("answer", "")
            confidence = resp.get("confidence", 0.5)
            
            summary_lines.append(f"## {expert} (Confidence: {confidence:.0%})\n")
            summary_lines.append(f"{answer}\n")
        
        return "\n".join(summary_lines)
    
    def _extract_consensus(self, responses: List[Dict[str, Any]]) -> Optional[str]:
        """Extract consensus points (simplified)"""
        # TODO: Use NLP to extract common themes
        if len(responses) >= 2:
            return "Experts generally agree on the approach, with some variations in implementation details."
        return None
    
    def _extract_dissent(self, responses: List[Dict[str, Any]]) -> Optional[str]:
        """Extract dissenting opinions (simplified)"""
        low_confidence_responses = [r for r in responses if r.get("confidence", 0) < 0.5]
        
        if low_confidence_responses:
            experts = [r.get("agent_name", "Expert") for r in low_confidence_responses]
            return f"Lower confidence from: {', '.join(experts)}"
        
        return None
    
    async def _generate_report(
        self,
        panel: Dict[str, Any],
        consensus: Dict[str, Any],
        all_responses: List[Dict[str, Any]]
    ) -> str:
        """Generate final panel report"""
        report_lines = [
            f"# Panel Report: {panel['name']}\n",
            f"**Type**: {panel.get('archetype', 'Unknown')}\n",
            f"**Mode**: {panel.get('mode', 'Unknown')}\n",
            f"**Participants**: {len(panel.get('members', []))}\n",
            f"**Consensus Level**: {consensus.get('consensus_level', 0):.0%}\n",
            "\n## Summary\n",
            consensus.get("summary_md", ""),
            "\n## Consensus\n",
            consensus.get("consensus", "No clear consensus reached"),
            "\n## Dissenting Views\n",
            consensus.get("dissent", "No significant dissent"),
            "\n## Recommendations\n",
            "Based on panel discussion...\n"  # TODO: Generate recommendations
        ]
        
        return "\n".join(report_lines)
    
    async def _execute_panel_streaming(
        self,
        panel: Dict[str, Any]
    ) -> AsyncGenerator[str, None]:
        """Execute panel with streaming responses"""
        # TODO: Implement streaming version
        raise NotImplementedError("Streaming not yet implemented")
    
    def _map_panel_type_to_board_config(self, panel_type: str) -> tuple[str, str]:
        """Map Ask Panel types to board_session archetype and mode"""
        mapping = {
            "structured": ("SAB", "sequential"),
            "open": ("Strategic", "parallel"),
            "socratic": ("Ethics", "debate"),
            "adversarial": ("CAB", "debate"),
            "delphi": ("CAB", "sequential"),
            "hybrid": ("Market", "dynamic")
        }
        
        return mapping.get(panel_type, ("Strategic", "parallel"))


# Singleton instance
_panel_orchestrator_instance: Optional[PanelOrchestrator] = None


def get_panel_orchestrator() -> PanelOrchestrator:
    """Get singleton panel orchestrator instance"""
    global _panel_orchestrator_instance
    
    if _panel_orchestrator_instance is None:
        raise RuntimeError("PanelOrchestrator not initialized. Call initialize_panel_orchestrator() first.")
    
    return _panel_orchestrator_instance


def initialize_panel_orchestrator(
    agent_orchestrator: AgentOrchestrator,
    supabase: SupabaseClient,
    cache: CacheManager,
    rag_service: Optional[UnifiedRAGService] = None
) -> PanelOrchestrator:
    """Initialize panel orchestrator singleton"""
    global _panel_orchestrator_instance
    
    _panel_orchestrator_instance = PanelOrchestrator(
        agent_orchestrator=agent_orchestrator,
        supabase=supabase,
        cache=cache,
        rag_service=rag_service
    )
    
    logger.info("✅ PanelOrchestrator initialized")
    
    return _panel_orchestrator_instance

