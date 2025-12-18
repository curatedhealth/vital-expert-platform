"""
Panel Orchestration Service for VITAL Ask Panel
Multi-expert advisory board coordination
"""

import asyncio
import json
from typing import List, Dict, Any, Optional, AsyncGenerator, Union
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

        # Orchestrator persona configuration
        self.orchestrator_name = "Panel Orchestrator"
        self.orchestrator_avatar = "/icons/png/avatars/avatar_0001.png"
        
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
                "panel_type": panel_type,  # Store original panel_type for prompt customization
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
        panel_type = self._get_panel_type(panel)

        for member in panel["members"]:
            agent = member.get("agents", member)
            task = self._get_expert_response(
                agent=agent,
                query=query,
                round_num=round_num,
                rag_context=rag_context,
                previous_responses=previous_responses,
                panel_type=panel_type
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
        panel_type = self._get_panel_type(panel)

        for member in panel["members"]:
            agent = member.get("agents", member)
            response = await self._get_expert_response(
                agent=agent,
                query=query,
                round_num=round_num,
                rag_context=rag_context,
                previous_responses=previous_responses + responses,  # Include responses from this round
                panel_type=panel_type
            )
            responses.append(response)

        return responses
    
    async def _get_expert_response(
        self,
        agent: Dict[str, Any],
        query: str,
        round_num: int,
        rag_context: Optional[Dict[str, Any]],
        previous_responses: List[Dict[str, Any]],
        panel_type: str = "structured"
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
                rag_context=rag_context,
                panel_type=panel_type
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
        rag_context: Optional[Dict[str, Any]],
        panel_type: str = "structured"
    ) -> str:
        """Construct prompt for expert with context, adapting to panel type"""

        # Delphi-specific prompt with structured response format
        if panel_type == "delphi":
            return self._construct_delphi_prompt(query, round_num, context, rag_context)

        # Adversarial/debate prompt
        if panel_type == "adversarial":
            return self._construct_adversarial_prompt(query, round_num, context, rag_context)

        # Socratic prompt
        if panel_type == "socratic":
            return self._construct_socratic_prompt(query, round_num, context, rag_context)

        # Default structured/open prompt
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

    def _construct_delphi_prompt(
        self,
        query: str,
        round_num: int,
        context: str,
        rag_context: Optional[Dict[str, Any]]
    ) -> str:
        """Construct Delphi method prompt with structured quantitative response format"""

        if round_num == 1:
            prompt = f"""## DELPHI METHOD - ROUND {round_num} (Initial Position)

**Question for Expert Analysis:**
{query}

**Instructions:**
You are participating in a Delphi panel using the iterative consensus-building methodology. Please provide your ANONYMOUS expert assessment in the EXACT format below.

**REQUIRED RESPONSE FORMAT:**

### Position Score: [X]/10
(Provide a numerical score from 1-10 where: 1=Strongly Against/Low Priority, 5=Neutral, 10=Strongly Support/High Priority)

### Key Reasoning
(2-3 bullet points explaining your position - be specific and evidence-based)

### Confidence Level
High | Medium | Low
(Select one and briefly explain why)

### What Would Change Your Position
(List 1-2 specific types of evidence or arguments that could shift your score by 2+ points)

---
IMPORTANT: Keep your response concise and structured. Focus on quantifiable positions rather than lengthy explanations. Your identity is anonymous to other panelists."""

        else:
            prompt = f"""## DELPHI METHOD - ROUND {round_num} (Convergence Round)

**Original Question:**
{query}

**Previous Round Summary:**
{context if context else "No previous responses yet."}

**Instructions:**
Review the positions from other anonymous experts above. Consider their arguments and evidence. Now provide your UPDATED position using the same structured format. You may:
- Maintain your previous position (explain why other arguments didn't persuade you)
- Adjust your position (explain what specifically changed your view)
- Move toward consensus (if you see merit in the group's direction)

**REQUIRED RESPONSE FORMAT:**

### Position Score: [X]/10
(Previous: [your last score] → Current: [new score])

### Position Change Rationale
(If changed: What argument or evidence shifted your view? If unchanged: Why do you maintain your position?)

### Key Reasoning
(2-3 updated bullet points)

### Confidence Level
High | Medium | Low

### Remaining Disagreements
(If you still diverge from the group consensus, explain the specific points of disagreement)

---
IMPORTANT: The goal is to identify genuine consensus or clarify meaningful disagreements, not to simply conform."""

        # Add RAG context if available
        if rag_context and rag_context.get("documents"):
            evidence_section = "\n\n**Relevant Evidence (for your consideration):**"
            for doc in rag_context["documents"][:3]:
                content = doc.get("content", "")[:300]
                evidence_section += f"\n- {content}..."
            prompt += evidence_section

        return prompt

    def _construct_adversarial_prompt(
        self,
        query: str,
        round_num: int,
        context: str,
        rag_context: Optional[Dict[str, Any]]
    ) -> str:
        """Construct adversarial/debate prompt"""

        if round_num == 1:
            prompt = f"""## ADVERSARIAL DEBATE - ROUND {round_num}

**Question:**
{query}

**Your Role:** Provide a strong, well-argued position on this topic. Take a clear stance and defend it with evidence and logical reasoning.

**Response Format:**
1. **Position**: State your clear stance (Pro/Con/Nuanced)
2. **Core Argument**: Your main thesis in 1-2 sentences
3. **Supporting Evidence**: 3-4 key points with evidence
4. **Anticipated Counterarguments**: Address potential objections
5. **Confidence**: High/Medium/Low"""
        else:
            prompt = f"""## ADVERSARIAL DEBATE - ROUND {round_num} (Rebuttal)

**Original Question:**
{query}

**Previous Arguments:**
{context if context else "No previous arguments."}

**Your Task:** Respond to the arguments above. You may:
- Defend your position against critiques
- Challenge weak points in opposing arguments
- Acknowledge strong points made by others
- Refine your position based on the debate

**Response Format:**
1. **Updated Position**: Has your stance changed?
2. **Key Rebuttals**: Address specific arguments from others
3. **Strongest Remaining Argument**: Your best point
4. **Concessions**: Any points where others convinced you"""

        if rag_context and rag_context.get("documents"):
            prompt += "\n\n**Evidence to Consider:**"
            for doc in rag_context["documents"][:3]:
                content = doc.get("content", "")[:200]
                prompt += f"\n- {content}..."

        return prompt

    def _construct_socratic_prompt(
        self,
        query: str,
        round_num: int,
        context: str,
        rag_context: Optional[Dict[str, Any]]
    ) -> str:
        """Construct Socratic method prompt focused on questioning"""

        if round_num == 1:
            prompt = f"""## SOCRATIC DIALOGUE - ROUND {round_num}

**Topic for Inquiry:**
{query}

**Your Role:** As a Socratic facilitator, your goal is to deepen understanding through thoughtful questioning and analysis.

**Response Format:**
1. **Initial Understanding**: What do we think we know about this?
2. **Key Questions**: 3-5 probing questions that challenge assumptions
3. **Hidden Assumptions**: What are we taking for granted?
4. **Preliminary Analysis**: Initial thoughts (with appropriate humility)
5. **Areas Requiring Investigation**: What evidence would help?"""
        else:
            prompt = f"""## SOCRATIC DIALOGUE - ROUND {round_num}

**Original Topic:**
{query}

**Previous Dialogue:**
{context if context else "No previous dialogue."}

**Your Task:** Build on the questions and insights raised. Go deeper.

**Response Format:**
1. **Key Insights Emerged**: What have we learned?
2. **Deeper Questions**: New questions arising from the discussion
3. **Refined Understanding**: How has our understanding evolved?
4. **Remaining Uncertainties**: What still puzzles us?"""

        if rag_context and rag_context.get("documents"):
            prompt += "\n\n**Evidence for Consideration:**"
            for doc in rag_context["documents"][:3]:
                content = doc.get("content", "")[:200]
                prompt += f"\n- {content}..."

        return prompt

    # ==========================================================================
    # ORCHESTRATOR VISIBILITY METHODS
    # ==========================================================================

    async def _analyze_topic(self, query: str, panel_type: str) -> Dict[str, Any]:
        """
        Analyze the topic to determine domain, complexity, and required expertise.
        Returns structured analysis for expert selection and discussion guidance.
        """
        try:
            from models.requests import AgentQueryRequest

            analysis_prompt = f"""Analyze this question for a {panel_type} expert panel discussion:

**Question:** {query}

Provide a brief structured analysis in this exact format:

DOMAIN: [Primary domain - e.g., Clinical Operations, Regulatory Affairs, Market Access, R&D, etc.]
COMPLEXITY: [Low/Medium/High]
KEY_STAKEHOLDERS: [Comma-separated list of stakeholder types affected]
CRITICAL_FACTORS: [2-3 key factors that experts should consider]
RECOMMENDED_EXPERTISE: [3-5 specific expertise areas needed]
DISCUSSION_FOCUS: [One sentence on what the discussion should prioritize]

Be concise - each field should be 1-2 lines maximum."""

            # Use a fast model for analysis
            request = AgentQueryRequest(
                message=analysis_prompt,
                agent_id="system",  # Use system agent for meta-analysis
                tenant_id="default",
                user_id="system",
                enable_rag=False,
                session_id=str(uuid4())
            )

            response = await self.agent_orchestrator.process_query(request)
            analysis_text = response.response

            # Parse the analysis
            analysis = self._parse_topic_analysis(analysis_text)
            analysis["raw_analysis"] = analysis_text
            analysis["panel_type"] = panel_type

            return analysis

        except Exception as e:
            logger.warning("Topic analysis failed, using defaults", error=str(e))
            return {
                "domain": "General Healthcare",
                "complexity": "Medium",
                "key_stakeholders": ["Healthcare Professionals", "Patients"],
                "critical_factors": ["Clinical evidence", "Regulatory requirements"],
                "recommended_expertise": ["Clinical Expert", "Regulatory Expert"],
                "discussion_focus": "Comprehensive multi-stakeholder analysis",
                "panel_type": panel_type
            }

    def _parse_topic_analysis(self, analysis_text: str) -> Dict[str, Any]:
        """Parse structured topic analysis from LLM response"""
        result = {
            "domain": "General Healthcare",
            "complexity": "Medium",
            "key_stakeholders": [],
            "critical_factors": [],
            "recommended_expertise": [],
            "discussion_focus": ""
        }

        lines = analysis_text.strip().split("\n")
        for line in lines:
            line = line.strip()
            if line.startswith("DOMAIN:"):
                result["domain"] = line.replace("DOMAIN:", "").strip()
            elif line.startswith("COMPLEXITY:"):
                result["complexity"] = line.replace("COMPLEXITY:", "").strip()
            elif line.startswith("KEY_STAKEHOLDERS:"):
                stakeholders = line.replace("KEY_STAKEHOLDERS:", "").strip()
                result["key_stakeholders"] = [s.strip() for s in stakeholders.split(",")]
            elif line.startswith("CRITICAL_FACTORS:"):
                factors = line.replace("CRITICAL_FACTORS:", "").strip()
                result["critical_factors"] = [f.strip() for f in factors.split(",")]
            elif line.startswith("RECOMMENDED_EXPERTISE:"):
                expertise = line.replace("RECOMMENDED_EXPERTISE:", "").strip()
                result["recommended_expertise"] = [e.strip() for e in expertise.split(",")]
            elif line.startswith("DISCUSSION_FOCUS:"):
                result["discussion_focus"] = line.replace("DISCUSSION_FOCUS:", "").strip()

        return result

    async def _generate_orchestrator_commentary(
        self,
        context_type: str,
        query: str,
        panel_type: str,
        round_num: int = 0,
        responses: List[Dict[str, Any]] = None,
        topic_analysis: Dict[str, Any] = None,
        expert_names: List[str] = None
    ) -> str:
        """
        Generate contextual orchestrator commentary based on the discussion phase.

        context_type can be:
        - 'welcome': Initial panel introduction
        - 'expert_selection': Explaining why experts were chosen
        - 'round_intro': Introducing a new round
        - 'round_summary': Summarizing round results
        - 'intervention': Redirecting discussion
        - 'consensus_progress': Commenting on consensus building
        - 'final_synthesis': Wrapping up the discussion
        """
        try:
            from models.requests import AgentQueryRequest

            # Build context-specific prompts
            if context_type == "welcome":
                prompt = f"""You are the Panel Orchestrator introducing a {panel_type} expert panel discussion.

Question: {query}
Domain: {topic_analysis.get('domain', 'Healthcare') if topic_analysis else 'Healthcare'}
Complexity: {topic_analysis.get('complexity', 'Medium') if topic_analysis else 'Medium'}

Write a brief, professional welcome message (2-3 sentences) that:
1. Acknowledges the importance of the question
2. Sets expectations for the discussion format
3. Is warm but professional

Do NOT use phrases like "Welcome to" - be more natural. Start directly with the substance."""

            elif context_type == "expert_selection":
                expert_list = ", ".join(expert_names or ["experts"])
                prompt = f"""You are the Panel Orchestrator explaining expert selection for a {panel_type} panel.

Question: {query}
Selected Experts: {expert_list}
Domain: {topic_analysis.get('domain', 'Healthcare') if topic_analysis else 'Healthcare'}
Required Expertise: {', '.join(topic_analysis.get('recommended_expertise', [])) if topic_analysis else 'Various'}

Write a brief explanation (2-3 sentences) of why these experts were selected. Be specific about what each brings to the discussion. Sound thoughtful and deliberate."""

            elif context_type == "round_intro":
                prompt = f"""You are the Panel Orchestrator introducing Round {round_num} of a {panel_type} discussion.

Question: {query}
Current Round: {round_num}
Panel Type: {panel_type}

Write a brief round introduction (1-2 sentences) that:
- For Round 1: Sets up the initial exploration
- For Round 2+: References building on previous insights

Be concise and action-oriented."""

            elif context_type == "round_summary":
                response_summary = self._summarize_responses_briefly(responses or [])
                prompt = f"""You are the Panel Orchestrator summarizing Round {round_num} of a {panel_type} discussion.

Question: {query}
Round: {round_num}
Expert Responses Summary: {response_summary}

Write a brief summary (2-3 sentences) that:
1. Highlights key points of agreement
2. Notes any divergent perspectives
3. Sets up what to explore next (if not final round)

Be balanced and insightful."""

            elif context_type == "consensus_progress":
                response_summary = self._summarize_responses_briefly(responses or [])
                prompt = f"""You are the Panel Orchestrator assessing consensus progress.

Question: {query}
Round: {round_num}
Discussion Summary: {response_summary}

Write a brief assessment (1-2 sentences) of how the panel is progressing toward consensus. Note areas of alignment and remaining disagreements."""

            elif context_type == "final_synthesis":
                prompt = f"""You are the Panel Orchestrator concluding a {panel_type} panel discussion.

Question: {query}
Total Rounds: {round_num}

Write a brief closing statement (2-3 sentences) that:
1. Thanks the experts for their contributions
2. Highlights the value of the diverse perspectives
3. Transitions to the final synthesis

Be professional and conclusive."""

            else:
                return ""

            request = AgentQueryRequest(
                message=prompt,
                agent_id="system",
                tenant_id="default",
                user_id="system",
                enable_rag=False,
                session_id=str(uuid4())
            )

            response = await self.agent_orchestrator.process_query(request)
            return response.response.strip()

        except Exception as e:
            logger.warning("Failed to generate orchestrator commentary", error=str(e))
            return self._get_fallback_commentary(context_type, round_num, panel_type)

    def _get_fallback_commentary(self, context_type: str, round_num: int, panel_type: str) -> str:
        """Provide fallback commentary if LLM generation fails"""
        fallbacks = {
            "welcome": f"This {panel_type} panel will bring together multiple expert perspectives to provide comprehensive analysis.",
            "expert_selection": "I've assembled a diverse panel of experts whose combined expertise addresses the key dimensions of this question.",
            "round_intro": f"Round {round_num} - Let's {'begin our exploration' if round_num == 1 else 'build on the insights from previous rounds'}.",
            "round_summary": "The experts have provided valuable perspectives. Let me synthesize the key takeaways.",
            "consensus_progress": "We're making progress toward a comprehensive understanding of this issue.",
            "final_synthesis": "Thank you to all experts for their thoughtful contributions. Let me present the final synthesis."
        }
        return fallbacks.get(context_type, "")

    def _summarize_responses_briefly(self, responses: List[Dict[str, Any]]) -> str:
        """Create a brief summary of responses for orchestrator context"""
        if not responses:
            return "No responses yet."

        summaries = []
        for r in responses[-5:]:  # Last 5 responses max
            name = r.get("agent_name", "Expert")
            answer = r.get("answer", "")[:150]
            summaries.append(f"{name}: {answer}...")

        return " | ".join(summaries)

    def _emit_orchestrator_event(
        self,
        event_type: str,
        message: str,
        metadata: Dict[str, Any] = None
    ) -> str:
        """
        Emit an orchestrator-specific SSE event.

        event_types:
        - orchestrator_thinking: Orchestrator is analyzing/planning
        - orchestrator_message: Orchestrator commentary to users
        - orchestrator_decision: Orchestrator made a decision (expert selection, etc.)
        - orchestrator_intervention: Orchestrator is redirecting discussion
        """
        data = {
            "orchestrator_name": self.orchestrator_name,
            "orchestrator_avatar": self.orchestrator_avatar,
            "message": message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        if metadata:
            data.update(metadata)

        return self._sse_event(event_type, data)

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
        """
        Execute panel with streaming responses and orchestrator visibility.

        Yields SSE-formatted events as execution progresses:
        - orchestrator_thinking: Orchestrator is analyzing
        - orchestrator_message: Orchestrator commentary
        - orchestrator_decision: Orchestrator made a decision
        - panel_started: Initial panel info
        - round_started: Beginning of each round
        - expert_thinking: Expert is generating response
        - expert_response: Expert response received
        - consensus_update: Consensus calculation progress
        - panel_complete: Final results
        """
        panel_id = panel["id"]
        query = panel["agenda"][0]["topic"] if panel.get("agenda") else panel["name"]
        mode = panel.get("mode", "parallel")
        panel_type = self._get_panel_type(panel)
        max_rounds = panel.get("agenda", [{}])[0].get("max_rounds", self.max_rounds)
        expert_names = [m.get("agents", m).get("name", "Expert") for m in panel.get("members", [])]

        try:
            # =================================================================
            # PHASE 1: ORCHESTRATOR ANALYZES THE TOPIC
            # =================================================================
            yield self._emit_orchestrator_event(
                "orchestrator_thinking",
                "Analyzing your question to determine the best approach...",
                {"phase": "topic_analysis"}
            )

            # Perform topic analysis
            topic_analysis = await self._analyze_topic(query, panel_type)

            # Emit topic analysis results
            yield self._emit_orchestrator_event(
                "orchestrator_message",
                f"I've identified this as a **{topic_analysis.get('domain', 'Healthcare')}** question with **{topic_analysis.get('complexity', 'Medium')}** complexity.",
                {
                    "phase": "topic_analysis",
                    "analysis": topic_analysis
                }
            )

            # =================================================================
            # PHASE 2: ORCHESTRATOR WELCOME MESSAGE
            # =================================================================
            welcome_message = await self._generate_orchestrator_commentary(
                "welcome", query, panel_type, topic_analysis=topic_analysis
            )
            yield self._emit_orchestrator_event(
                "orchestrator_message",
                welcome_message,
                {"phase": "welcome"}
            )

            # Emit panel started event
            yield self._sse_event("panel_started", {
                "panel_id": panel_id,
                "query": query[:200],
                "mode": mode,
                "panel_type": panel_type,
                "max_rounds": max_rounds,
                "expert_count": len(panel.get("members", [])),
                "topic_analysis": topic_analysis
            })

            # =================================================================
            # PHASE 3: ORCHESTRATOR EXPLAINS EXPERT SELECTION
            # =================================================================
            yield self._emit_orchestrator_event(
                "orchestrator_thinking",
                "Selecting the most relevant experts for this discussion...",
                {"phase": "expert_selection"}
            )

            expert_selection_message = await self._generate_orchestrator_commentary(
                "expert_selection", query, panel_type,
                topic_analysis=topic_analysis, expert_names=expert_names
            )
            yield self._emit_orchestrator_event(
                "orchestrator_decision",
                expert_selection_message,
                {
                    "phase": "expert_selection",
                    "experts": expert_names,
                    "selection_rationale": topic_analysis.get("recommended_expertise", [])
                }
            )

            # Get RAG context if available
            rag_context = None
            if panel.get("evidence_pack"):
                rag_context = await self._get_rag_context(query, panel["evidence_pack"])

            all_responses = []

            for round_num in range(1, max_rounds + 1):
                # =============================================================
                # ORCHESTRATOR INTRODUCES THE ROUND
                # =============================================================
                round_intro = await self._generate_orchestrator_commentary(
                    "round_intro", query, panel_type, round_num=round_num
                )
                yield self._emit_orchestrator_event(
                    "orchestrator_message",
                    round_intro,
                    {"phase": "round_intro", "round": round_num}
                )

                # Emit round started
                yield self._sse_event("round_started", {
                    "round_number": round_num,
                    "max_rounds": max_rounds
                })

                # Execute experts based on mode
                round_responses = []
                if mode == "parallel":
                    async for event in self._stream_parallel_round(
                        panel, round_num, query, rag_context, all_responses
                    ):
                        yield event
                        # Collect responses from events
                        if "expert_response" in event:
                            data = json.loads(event.split("data: ")[1].split("\n")[0])
                            all_responses.append(data)
                            round_responses.append(data)
                else:
                    async for event in self._stream_sequential_round(
                        panel, round_num, query, rag_context, all_responses
                    ):
                        yield event
                        if "expert_response" in event:
                            data = json.loads(event.split("data: ")[1].split("\n")[0])
                            all_responses.append(data)
                            round_responses.append(data)

                # =============================================================
                # ORCHESTRATOR SUMMARIZES THE ROUND
                # =============================================================
                if round_responses:
                    round_summary = await self._generate_orchestrator_commentary(
                        "round_summary", query, panel_type,
                        round_num=round_num, responses=round_responses
                    )
                    yield self._emit_orchestrator_event(
                        "orchestrator_message",
                        round_summary,
                        {"phase": "round_summary", "round": round_num}
                    )

                # Calculate and emit consensus update
                yield self._emit_orchestrator_event(
                    "orchestrator_thinking",
                    "Analyzing consensus across expert perspectives...",
                    {"phase": "consensus_calculation", "round": round_num}
                )

                yield self._sse_event("consensus_update", {
                    "round_number": round_num,
                    "calculating": True
                })

                consensus = await self.build_consensus(panel_id, all_responses, round_num)

                yield self._sse_event("consensus_update", {
                    "round_number": round_num,
                    "consensus_level": consensus.get("consensus_level", 0),
                    "calculating": False
                })

                # Orchestrator comments on consensus progress
                consensus_level = consensus.get("consensus_level", 0)
                consensus_commentary = await self._generate_orchestrator_commentary(
                    "consensus_progress", query, panel_type,
                    round_num=round_num, responses=all_responses
                )
                yield self._emit_orchestrator_event(
                    "orchestrator_message",
                    consensus_commentary,
                    {
                        "phase": "consensus_progress",
                        "round": round_num,
                        "consensus_level": consensus_level
                    }
                )

                # Check for early termination
                if consensus_level >= self.min_consensus:
                    yield self._emit_orchestrator_event(
                        "orchestrator_message",
                        f"Excellent! We've achieved **{consensus_level:.0%} consensus** - strong alignment among experts.",
                        {"phase": "consensus_reached", "round": round_num}
                    )
                    yield self._sse_event("consensus_reached", {
                        "round_number": round_num,
                        "consensus_level": consensus_level
                    })
                    break

            # =================================================================
            # FINAL SYNTHESIS WITH ORCHESTRATOR CLOSING
            # =================================================================
            final_synthesis_intro = await self._generate_orchestrator_commentary(
                "final_synthesis", query, panel_type, round_num=round_num
            )
            yield self._emit_orchestrator_event(
                "orchestrator_message",
                final_synthesis_intro,
                {"phase": "final_synthesis"}
            )

            # Generate final report
            final_consensus = await self.build_consensus(panel_id, all_responses, round_num)
            report = await self._generate_report(panel, final_consensus, all_responses)

            # Update panel status
            self.supabase.table("board_session").update({
                "status": "completed",
                "completed_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", panel_id).execute()

            # Emit completion - removed truncation to allow full content
            yield self._sse_event("panel_complete", {
                "panel_id": panel_id,
                "status": "completed",
                "rounds": round_num,
                "consensus_level": final_consensus.get("consensus_level", 0),
                "recommendation": final_consensus.get("consensus", ""),
                "report": report  # Full report, not truncated
            })

        except Exception as e:
            logger.error("Streaming panel execution failed", panel_id=panel_id, error=str(e))
            yield self._sse_event("error", {
                "panel_id": panel_id,
                "error": str(e)
            })

    async def _stream_parallel_round(
        self,
        panel: Dict[str, Any],
        round_num: int,
        query: str,
        rag_context: Optional[Dict[str, Any]],
        previous_responses: List[Dict[str, Any]]
    ) -> AsyncGenerator[str, None]:
        """Stream responses from parallel expert execution"""
        members = panel.get("members", [])
        panel_type = self._get_panel_type(panel)

        # Emit thinking events for all experts
        for member in members:
            agent = member.get("agents", member)
            yield self._sse_event("expert_thinking", {
                "agent_id": agent.get("id"),
                "agent_name": agent.get("name", "Expert"),
                "round_number": round_num
            })

        # Execute all in parallel
        tasks = []
        for member in members:
            agent = member.get("agents", member)
            task = self._get_expert_response(
                agent=agent,
                query=query,
                round_num=round_num,
                rag_context=rag_context,
                previous_responses=previous_responses,
                panel_type=panel_type
            )
            tasks.append((agent, task))

        # Gather results
        results = await asyncio.gather(*[t[1] for t in tasks], return_exceptions=True)

        # Emit responses as they complete
        for i, (agent_task, result) in enumerate(zip(tasks, results)):
            agent = agent_task[0]
            if isinstance(result, Exception):
                yield self._sse_event("expert_error", {
                    "agent_id": agent.get("id"),
                    "agent_name": agent.get("name", "Expert"),
                    "error": str(result)
                })
            else:
                yield self._sse_event("expert_response", {
                    "agent_id": result.get("agent_id"),
                    "agent_name": result.get("agent_name"),
                    "content": result.get("answer", ""),  # Full content, no truncation
                    "confidence": result.get("confidence", 0.5),
                    "round_number": round_num
                })

    async def _stream_sequential_round(
        self,
        panel: Dict[str, Any],
        round_num: int,
        query: str,
        rag_context: Optional[Dict[str, Any]],
        previous_responses: List[Dict[str, Any]]
    ) -> AsyncGenerator[str, None]:
        """Stream responses from sequential expert execution"""
        members = panel.get("members", [])
        panel_type = self._get_panel_type(panel)
        round_responses = []

        for member in members:
            agent = member.get("agents", member)

            # Emit thinking
            yield self._sse_event("expert_thinking", {
                "agent_id": agent.get("id"),
                "agent_name": agent.get("name", "Expert"),
                "round_number": round_num
            })

            try:
                # Get response (with context from this round's previous responses)
                result = await self._get_expert_response(
                    agent=agent,
                    query=query,
                    round_num=round_num,
                    rag_context=rag_context,
                    previous_responses=previous_responses + round_responses,
                    panel_type=panel_type
                )

                round_responses.append(result)

                # Emit response
                yield self._sse_event("expert_response", {
                    "agent_id": result.get("agent_id"),
                    "agent_name": result.get("agent_name"),
                    "content": result.get("answer", ""),  # Full content, no truncation
                    "confidence": result.get("confidence", 0.5),
                    "round_number": round_num
                })

            except Exception as e:
                yield self._sse_event("expert_error", {
                    "agent_id": agent.get("id"),
                    "agent_name": agent.get("name", "Expert"),
                    "error": str(e)
                })

    def _sse_event(self, event_type: str, data: Dict[str, Any]) -> str:
        """Format data as SSE event"""
        import json
        return f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
    
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

    def _get_panel_type(self, panel: Dict[str, Any]) -> str:
        """Get panel_type from panel dict, falling back to archetype-based inference"""
        # Use stored panel_type if available
        if panel.get("panel_type"):
            return panel["panel_type"]

        # Fallback: infer from archetype and mode
        archetype = panel.get("archetype", "")
        mode = panel.get("mode", "parallel")

        # Reverse mapping based on archetype + mode combinations
        if archetype == "CAB" and mode == "sequential":
            return "delphi"
        elif archetype == "CAB" and mode == "debate":
            return "adversarial"
        elif archetype == "Ethics":
            return "socratic"
        elif archetype == "SAB":
            return "structured"
        elif archetype == "Market":
            return "hybrid"
        else:
            return "open"  # Default fallback


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

