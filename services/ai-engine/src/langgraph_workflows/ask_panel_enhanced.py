"""
Enhanced Ask Panel LangGraph Workflow with Agent-to-Agent Communication
Features:
- Real-time streaming of all panel messages
- Agent-to-agent dialogue and debate
- Orchestrator messages visible to user
- Summary generation at the end
- Full transparency of the expert panel consultation process

Compatible with LangGraph 0.6.11+ and 1.0.3+
Created: 2025-12-01
"""

from typing import TypedDict, Annotated, List, Dict, Any, Optional, AsyncIterator
from enum import Enum
from langgraph.graph import StateGraph, END
import operator
import asyncio
import structlog
from datetime import datetime
from uuid import uuid4
import json

logger = structlog.get_logger()


# ============================================================================
# Enums and Constants
# ============================================================================

class MessageType(str, Enum):
    """Types of messages in the workflow"""
    ORCHESTRATOR = "orchestrator"
    AGENT = "agent"
    SYSTEM = "system"
    SUMMARY = "summary"


# ============================================================================
# State Schema
# ============================================================================

class Message(TypedDict):
    """Individual message in the panel conversation"""
    id: str
    type: MessageType
    role: str  # 'orchestrator', 'agent_name', 'system'
    content: str
    timestamp: str
    agent_id: Optional[str]
    agent_name: Optional[str]
    metadata: Optional[Dict[str, Any]]


class EnhancedPanelState(TypedDict):
    """State for enhanced Ask Panel workflow with agent communication"""
    # Input parameters
    question: str
    template_slug: str
    selected_agent_ids: List[str]
    tenant_id: str
    user_id: str
    session_id: str

    # Configuration
    enable_debate: bool  # Allow agents to challenge each other
    max_rounds: int  # Maximum rounds of discussion
    require_consensus: bool  # Whether consensus is required

    # RAG context
    retrieved_documents: Optional[List[Dict[str, Any]]]
    context: str

    # Conversation messages (accumulated with operator.add)
    messages: Annotated[List[Message], operator.add]

    # Agent responses by round
    current_round: int
    agent_responses_by_round: Annotated[List[Dict[str, Any]], operator.add]

    # Debate and consensus
    debate_topics: List[str]
    consensus_reached: bool
    consensus_level: float

    # Final output
    summary: Optional[str]
    key_insights: Optional[List[str]]
    action_items: Optional[List[str]]
    divergent_points: Optional[List[Dict[str, Any]]]

    # Metadata and control flow
    error: Optional[str]
    execution_time_ms: Optional[int]
    processing_metadata: Dict[str, Any]


# ============================================================================
# Enhanced Ask Panel Workflow Class
# ============================================================================

class EnhancedAskPanelWorkflow:
    """
    Enhanced LangGraph workflow for Ask Panel with full agent-to-agent communication.

    All messages are streamed in real-time to the frontend. The workflow can be
    parameterized by a panel-designer template (nodes/edges/metadata) and a
    high-level panel_mode string so that different panel types can share the
    same core implementation while varying structure and behaviour.
    """

    def __init__(
        self,
        supabase_client,
        agent_service,
        rag_service,
        llm_service,
        template_metadata: Optional[Dict[str, Any]] = None,
        panel_mode: Optional[str] = None,
    ):
        self.supabase = supabase_client
        self.agent_service = agent_service
        self.rag_service = rag_service
        self.llm_service = llm_service
        self.workflow = None

        # Panel-designer metadata (from template_library.content)
        self.template_metadata = template_metadata or {}
        self.panel_mode = panel_mode

    async def initialize(self):
        """Initialize the enhanced LangGraph workflow"""
        workflow = StateGraph(EnhancedPanelState)

        # Add nodes
        workflow.add_node("orchestrator_intro", self.orchestrator_intro_node)
        workflow.add_node("retrieve_knowledge", self.retrieve_knowledge_node)
        workflow.add_node("initial_panel_responses", self.initial_panel_responses_node)
        workflow.add_node("identify_debate_topics", self.identify_debate_topics_node)
        workflow.add_node("panel_debate_round", self.panel_debate_round_node)
        workflow.add_node("check_consensus", self.check_consensus_node)
        workflow.add_node("generate_summary", self.generate_summary_node)
        workflow.add_node("orchestrator_conclusion", self.orchestrator_conclusion_node)

        # Set entry point
        workflow.set_entry_point("orchestrator_intro")

        # Build the flow
        workflow.add_edge("orchestrator_intro", "retrieve_knowledge")
        workflow.add_edge("retrieve_knowledge", "initial_panel_responses")
        workflow.add_edge("initial_panel_responses", "identify_debate_topics")

        # Conditional: Check if debate is enabled and needed
        workflow.add_conditional_edges(
            "identify_debate_topics",
            self.should_debate,
            {
                "debate": "panel_debate_round",
                "skip": "generate_summary"
            }
        )

        # Debate loop
        workflow.add_edge("panel_debate_round", "check_consensus")
        workflow.add_conditional_edges(
            "check_consensus",
            self.check_if_more_rounds_needed,
            {
                "continue": "panel_debate_round",
                "done": "generate_summary"
            }
        )

        # Final steps
        workflow.add_edge("generate_summary", "orchestrator_conclusion")
        workflow.add_edge("orchestrator_conclusion", END)

        # Compile
        self.workflow = workflow.compile()
        logger.info("✅ Enhanced Ask Panel workflow initialized with agent communication")

    # ========================================================================
    # Helper: Add message to state and emit for streaming
    # ========================================================================

    def _add_message(
        self,
        state: EnhancedPanelState,
        type: MessageType,
        role: str,
        content: str,
        agent_id: Optional[str] = None,
        agent_name: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> EnhancedPanelState:
        """
        Add a message to state (will be streamed to frontend)
        """
        message: Message = {
            "id": str(uuid4()),
            "type": type,
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat(),
            "agent_id": agent_id,
            "agent_name": agent_name,
            "metadata": metadata
        }

        return {
            **state,
            "messages": [message]  # Annotated with operator.add
        }

    # ========================================================================
    # Node 1: Orchestrator Introduction
    # ========================================================================

    async def orchestrator_intro_node(self, state: EnhancedPanelState) -> EnhancedPanelState:
        """
        Orchestrator introduces the panel consultation session
        """
        try:
            logger.info("🎯 Orchestrator: Starting panel consultation")

            # Validate all agents upfront - fail fast if any are missing (when Supabase is available)
            expert_names = []
            missing_agents = []
            tenant_id = state.get("tenant_id")
            for expert_id in state["selected_agent_ids"]:
                agent = await self.agent_service.get_agent(expert_id, tenant_id=tenant_id)
                if agent:
                    expert_names.append(agent.get("display_name", agent.get("name", expert_id)))
                else:
                    # Agent not found - only fail if Supabase is available (not a fallback scenario)
                    if self.supabase.client:
                        missing_agents.append(expert_id)
                    else:
                        # Supabase unavailable, using fallback - include the fallback name
                        expert_names.append(f"Expert {expert_id[:8]} (fallback)")

            # If we have missing agents and Supabase is available, this is a configuration error
            if missing_agents and self.supabase.client:
                error_msg = (
                    f"❌ Configuration Error: The following agents were not found in the database: "
                    f"{', '.join(missing_agents)}. "
                    f"Please ensure these agents exist in the 'agents' table with the correct IDs or names."
                )
                logger.error("❌ Missing agents detected", missing_agents=missing_agents)
                state["error"] = error_msg
                
                # Add error message to stream
                state = self._add_message(
                    state,
                    MessageType.SYSTEM,
                    "system",
                    error_msg,
                    metadata={"error_type": "missing_agents", "missing_agent_ids": missing_agents}
                )
                return state

            intro_message = f"""🎯 **Expert Panel Consultation**

**Question:** {state["question"]}

**Expert Panel Members:**
{chr(10).join([f"- {name}" for name in expert_names])}

**Panel Format:** {'Multi-round discussion with debate' if state.get("enable_debate") else 'Single-round consultation'}
**Template:** {state.get("template_slug", "Custom Panel")}

Let me begin by gathering relevant knowledge from our comprehensive database...
"""

            state = self._add_message(
                state,
                MessageType.ORCHESTRATOR,
                "orchestrator",
                intro_message
            )

            # Initialize round counter
            state["current_round"] = 0
            state["consensus_reached"] = False
            state["debate_topics"] = []

            return state

        except Exception as e:
            logger.error("❌ Orchestrator intro failed", error=str(e))
            state["error"] = str(e)
            return state

    # ========================================================================
    # Node 2: Retrieve Knowledge
    # ========================================================================

    async def retrieve_knowledge_node(self, state: EnhancedPanelState) -> EnhancedPanelState:
        """
        Retrieve knowledge from RAG and inform about sources
        """
        try:
            logger.info("📚 Retrieving knowledge for panel")

            state = self._add_message(
                state,
                MessageType.ORCHESTRATOR,
                "orchestrator",
                "🔍 Searching our knowledge base for relevant information..."
            )

            # Query RAG service
            rag_results = await self.rag_service.query(
                query_text=state["question"],
                strategy="true_hybrid",
                max_results=15,
                tenant_id=state["tenant_id"]
            )

            documents = rag_results.get("sources", []) or rag_results.get("results", [])
            state["retrieved_documents"] = documents

            # Build context
            context_parts = []
            for i, doc in enumerate(documents[:10]):
                context_parts.append(f"[Source {i+1}]: {doc.get('content', '')}")

            state["context"] = "\n\n".join(context_parts)

            # Inform about sources found
            sources_message = f"""✅ **Knowledge Retrieved**

Found {len(documents)} relevant sources from our database:
{chr(10).join([f"- {doc.get('source', doc.get('title', 'Unknown source'))}" for doc in documents[:5]])}
{'- ...' if len(documents) > 5 else ''}

Now consulting with our expert panel members...
"""

            state = self._add_message(
                state,
                MessageType.ORCHESTRATOR,
                "orchestrator",
                sources_message,
                metadata={"source_count": len(documents)}
            )

            return state

        except Exception as e:
            logger.error("❌ Knowledge retrieval failed", error=str(e))
            state["error"] = str(e)
            return state

    # ========================================================================
    # Node 3: Initial Panel Responses
    # ========================================================================

    async def initial_panel_responses_node(self, state: EnhancedPanelState) -> EnhancedPanelState:
        """
        Get initial responses from all panel members in parallel
        Each expert provides their independent analysis
        """
        try:
            logger.info("🎭 Getting initial panel responses")

            state["current_round"] = 1

            state = self._add_message(
                state,
                MessageType.ORCHESTRATOR,
                "orchestrator",
                f"📊 **Round 1: Initial Panel Analysis**\n\nEach expert will now provide their independent analysis and recommendations..."
            )

            # Execute experts in parallel (limit concurrency to 5)
            semaphore = asyncio.Semaphore(5)

            async def execute_with_semaphore(expert_id):
                async with semaphore:
                    return await self._execute_panel_expert(
                        state,
                        expert_id,
                        round_number=1,
                        prompt_type="initial"
                    )

            tasks = [execute_with_semaphore(expert_id) for expert_id in state["selected_agent_ids"]]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Collect all agent messages to add at once
            agent_messages = []
            successful_responses = []
            failed_responses = []

            for i, result in enumerate(results):
                agent_id = state["selected_agent_ids"][i]

                if isinstance(result, Exception):
                    logger.error(
                        "❌ Agent execution returned exception",
                        agent_id=agent_id,
                        error=str(result),
                        error_type=type(result).__name__
                    )
                    failed_responses.append({"agent_id": agent_id, "error": str(result)})
                elif isinstance(result, dict) and result.get("success"):
                    logger.info(
                        "✅ Agent response successful",
                        agent_id=result["agent_id"],
                        agent_name=result["agent_name"],
                        response_length=len(result["response"])
                    )
                    # Create message object directly instead of calling _add_message in loop
                    agent_messages.append({
                        "id": str(uuid4()),
                        "type": MessageType.AGENT,
                        "role": result["agent_name"],
                        "content": result["response"],
                        "timestamp": datetime.utcnow().isoformat(),
                        "agent_id": result["agent_id"],
                        "agent_name": result["agent_name"],
                        "metadata": {"round": 1, "role": "panel_member"}
                    })
                    successful_responses.append(result)
                else:
                    logger.warning(
                        "⚠️ Agent execution returned unsuccessful result",
                        agent_id=agent_id,
                        result=result
                    )
                    failed_responses.append({"agent_id": agent_id, "result": result})

            logger.info(
                "📊 Panel responses summary",
                total_agents=len(state["selected_agent_ids"]),
                successful=len(successful_responses),
                failed=len(failed_responses)
            )

            # Store responses for this round and add all agent messages
            return {
                **state,
                "messages": agent_messages,  # Add all agent messages at once
                "agent_responses_by_round": [{
                    "round": 1,
                    "responses": successful_responses
                }]
            }

        except Exception as e:
            logger.error("❌ Initial panel responses failed", error=str(e))
            state["error"] = str(e)
            return state

    # ========================================================================
    # Node 4: Identify Debate Topics
    # ========================================================================

    async def identify_debate_topics_node(self, state: EnhancedPanelState) -> EnhancedPanelState:
        """
        Analyze panel responses and identify topics for debate
        """
        try:
            if not state.get("enable_debate"):
                return state

            logger.info("🔍 Identifying debate topics")

            # Get all responses from round 1
            round_1_responses = []
            if state.get("agent_responses_by_round"):
                round_1_responses = state["agent_responses_by_round"][0].get("responses", [])

            if len(round_1_responses) < 2:
                return state

            # Build analysis prompt
            responses_text = "\n\n".join([
                f"**{r['agent_name']}:**\n{r['response']}"
                for r in round_1_responses
            ])

            analysis_prompt = f"""Analyze these expert panel responses and identify key areas of disagreement or topics that would benefit from further discussion:

Question: {state["question"]}

Panel Responses:
{responses_text}

Provide a JSON array of debate topics (max 3) where panel members could have productive discussion:
[{{"topic": "...", "reason": "..."}}]
"""

            analysis = await self.llm_service.generate(
                prompt=analysis_prompt,
                model="gpt-4",
                temperature=0.3,
                max_tokens=800
            )

            # Parse topics
            try:
                topics_data = json.loads(analysis)
                topics = [t["topic"] for t in topics_data[:3]]
            except:
                topics = []

            state["debate_topics"] = topics

            if topics:
                topics_message = f"""🤔 **Panel Discussion Topics Identified**

I've identified {len(topics)} areas where our panel members could have productive discussion:

{chr(10).join([f"{i+1}. {topic}" for i, topic in enumerate(topics)])}

Let's proceed with a panel discussion round...
"""

                state = self._add_message(
                    state,
                    MessageType.ORCHESTRATOR,
                    "orchestrator",
                    topics_message
                )

            return state

        except Exception as e:
            logger.error("❌ Debate topic identification failed", error=str(e))
            return state

    # ========================================================================
    # Node 5: Panel Debate Round
    # ========================================================================

    async def panel_debate_round_node(self, state: EnhancedPanelState) -> EnhancedPanelState:
        """
        Facilitate a round of panel discussion
        Panel members can respond to each other's points
        """
        try:
            round_number = state["current_round"] + 1
            state["current_round"] = round_number

            logger.info(f"💬 Panel debate round {round_number}")

            state = self._add_message(
                state,
                MessageType.ORCHESTRATOR,
                "orchestrator",
                f"💬 **Round {round_number}: Panel Discussion**\n\nPanel members will now respond to each other's points and perspectives..."
            )

            # Get previous messages for context
            previous_panel_messages = [
                m for m in state.get("messages", [])
                if m["type"] == MessageType.AGENT
            ]

            # Execute experts in parallel with debate context
            semaphore = asyncio.Semaphore(5)

            async def execute_with_semaphore(expert_id):
                async with semaphore:
                    return await self._execute_panel_expert(
                        state,
                        expert_id,
                        round_number=round_number,
                        prompt_type="debate",
                        previous_messages=previous_panel_messages
                    )

            tasks = [execute_with_semaphore(expert_id) for expert_id in state["selected_agent_ids"]]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Collect all debate messages to add at once
            debate_messages = []
            successful_responses = []
            failed_responses = []

            for i, result in enumerate(results):
                agent_id = state["selected_agent_ids"][i]

                if isinstance(result, Exception):
                    logger.error(
                        "❌ Debate round agent execution returned exception",
                        agent_id=agent_id,
                        round=round_number,
                        error=str(result),
                        error_type=type(result).__name__
                    )
                    failed_responses.append({"agent_id": agent_id, "error": str(result)})
                elif isinstance(result, dict) and result.get("success"):
                    logger.info(
                        "✅ Debate round agent response successful",
                        agent_id=result["agent_id"],
                        agent_name=result["agent_name"],
                        round=round_number,
                        response_length=len(result["response"])
                    )
                    # Create message object directly instead of calling _add_message in loop
                    debate_messages.append({
                        "id": str(uuid4()),
                        "type": MessageType.AGENT,
                        "role": result["agent_name"],
                        "content": result["response"],
                        "timestamp": datetime.utcnow().isoformat(),
                        "agent_id": result["agent_id"],
                        "agent_name": result["agent_name"],
                        "metadata": {"round": round_number, "role": "panel_debater"}
                    })
                    successful_responses.append(result)
                else:
                    logger.warning(
                        "⚠️ Debate round agent execution returned unsuccessful result",
                        agent_id=agent_id,
                        round=round_number,
                        result=result
                    )
                    failed_responses.append({"agent_id": agent_id, "result": result})

            logger.info(
                "📊 Debate round responses summary",
                round=round_number,
                total_agents=len(state["selected_agent_ids"]),
                successful=len(successful_responses),
                failed=len(failed_responses)
            )

            # Store responses for this round and add all debate messages
            return {
                **state,
                "messages": debate_messages,  # Add all debate messages at once
                "agent_responses_by_round": [{
                    "round": round_number,
                    "responses": successful_responses
                }]
            }

        except Exception as e:
            logger.error("❌ Panel debate round failed", error=str(e))
            state["error"] = str(e)
            return state

    # ========================================================================
    # Node 6: Check Consensus
    # ========================================================================

    async def check_consensus_node(self, state: EnhancedPanelState) -> EnhancedPanelState:
        """
        Check if panel has reached consensus
        """
        try:
            logger.info("🤝 Checking panel consensus")

            # Get latest round responses
            latest_round = state["agent_responses_by_round"][-1] if state.get("agent_responses_by_round") else None
            if not latest_round:
                state["consensus_reached"] = True
                return state

            responses_text = "\n\n".join([
                f"**{r['agent_name']}:** {r['response']}"
                for r in latest_round.get("responses", [])
            ])

            consensus_prompt = f"""Analyze these panel responses and determine the level of consensus (0.0 to 1.0):

Question: {state["question"]}

Latest Panel Responses:
{responses_text}

Provide a JSON response: {{"consensus_level": 0.0-1.0, "explanation": "..."}}
"""

            analysis = await self.llm_service.generate(
                prompt=consensus_prompt,
                model="gpt-4",
                temperature=0.2,
                max_tokens=500
            )

            try:
                consensus_data = json.loads(analysis)
                consensus_level = consensus_data.get("consensus_level", 0.5)
            except:
                consensus_level = 0.5

            state["consensus_level"] = consensus_level
            state["consensus_reached"] = consensus_level >= 0.8 or state["current_round"] >= state["max_rounds"]

            if state["consensus_reached"]:
                state = self._add_message(
                    state,
                    MessageType.ORCHESTRATOR,
                    "orchestrator",
                    f"✅ **Panel Consensus Status**\n\nConsensus level: {int(consensus_level * 100)}%\n\nProceeding to generate comprehensive panel summary..."
                )

            return state

        except Exception as e:
            logger.error("❌ Consensus check failed", error=str(e))
            state["consensus_reached"] = True  # Move on anyway
            return state

    # ========================================================================
    # Node 7: Generate Summary
    # ========================================================================

    async def generate_summary_node(self, state: EnhancedPanelState) -> EnhancedPanelState:
        """
        Generate comprehensive summary of the panel consultation
        """
        try:
            logger.info("📝 Generating panel summary")

            state = self._add_message(
                state,
                MessageType.ORCHESTRATOR,
                "orchestrator",
                "📝 Synthesizing panel insights and generating comprehensive summary..."
            )

            # Collect all panel messages
            panel_messages = [
                m for m in state.get("messages", [])
                if m["type"] == MessageType.AGENT
            ]

            all_panel_responses = "\n\n".join([
                f"**{m['agent_name']}** (Round {m.get('metadata', {}).get('round', '?')}):\n{m['content']}"
                for m in panel_messages
            ])

            summary_prompt = f"""Synthesize this expert panel consultation into a comprehensive summary:

**Question:** {state["question"]}

**Panel Discussion:**
{all_panel_responses}

**Knowledge Base Context:**
{state.get("context", '')[:2000]}

Provide a structured summary with:
1. **Executive Summary** (2-3 sentences)
2. **Key Insights** (3-5 bullet points from the panel)
3. **Areas of Consensus** (what all experts agree on)
4. **Divergent Viewpoints** (if any disagreements remain)
5. **Recommended Actions** (3-5 actionable items based on panel advice)
6. **Confidence Assessment** (High/Medium/Low with justification)

Format in clear markdown.
"""

            summary = await self.llm_service.generate(
                prompt=summary_prompt,
                model="gpt-4",
                temperature=0.3,
                max_tokens=2000
            )

            state["summary"] = summary

            # Add summary as a special message
            state = self._add_message(
                state,
                MessageType.SUMMARY,
                "panel_synthesizer",
                summary,
                metadata={"consensus_level": state.get("consensus_level", 0.0)}
            )

            return state

        except Exception as e:
            logger.error("❌ Summary generation failed", error=str(e))
            state["error"] = str(e)
            return state

    # ========================================================================
    # Node 8: Orchestrator Conclusion
    # ========================================================================

    async def orchestrator_conclusion_node(self, state: EnhancedPanelState) -> EnhancedPanelState:
        """
        Orchestrator provides final conclusion
        """
        try:
            logger.info("🎯 Orchestrator conclusion")

            total_rounds = state["current_round"]
            total_panel_members = len(state["selected_agent_ids"])
            consensus = int(state.get("consensus_level", 0.0) * 100)

            conclusion = f"""🎯 **Panel Consultation Complete**

**Session Summary:**
- Total Rounds: {total_rounds}
- Panel Members: {total_panel_members}
- Consensus Level: {consensus}%
- Discussion Format: {'Multi-round panel discussion' if state.get("enable_debate") else 'Single-round consultation'}
- Template: {state.get("template_slug", "Custom Panel")}

Thank you for using our expert panel consultation service. All insights and recommendations are based on the collective expertise of our panel and relevant knowledge from our comprehensive database.
"""

            state = self._add_message(
                state,
                MessageType.ORCHESTRATOR,
                "orchestrator",
                conclusion
            )

            return state

        except Exception as e:
            logger.error("❌ Orchestrator conclusion failed", error=str(e))
            return state

    # ========================================================================
    # Helper Methods
    # ========================================================================

    async def _execute_panel_expert(
        self,
        state: EnhancedPanelState,
        expert_id: str,
        round_number: int,
        prompt_type: str,
        previous_messages: Optional[List[Message]] = None
    ) -> Dict[str, Any]:
        """Execute a single panel expert with appropriate context"""
        try:
            tenant_id = state.get("tenant_id")
            agent = await self.agent_service.get_agent(expert_id, tenant_id=tenant_id)
            if not agent:
                # This should have been caught in orchestrator_intro_node, but handle gracefully
                error_msg = (
                    f"Agent {expert_id} not found in database. "
                    f"Please ensure this agent exists in the 'agents' table."
                )
                logger.error("❌ Agent execution failed", agent_id=expert_id, reason="agent_not_found")
                raise ValueError(error_msg)

            agent_name = agent.get("display_name", agent.get("name", expert_id))

            # Build prompt based on type
            if prompt_type == "initial":
                prompt = f"""You are {agent_name}, a member of an expert panel.

{agent.get('system_prompt', '')}

**Panel Question:**
{state["question"]}

**Knowledge Base Context:**
{state.get("context", '')[:3000]}

Provide your expert analysis and recommendations as a panel member. Be thorough and cite specific evidence from the context when possible.
"""
            else:  # debate
                previous_context = "\n\n".join([
                    f"**{m['agent_name']}:** {m['content'][:500]}"
                    for m in (previous_messages or [])[-6:]  # Last 6 messages
                ])

                prompt = f"""You are {agent_name}, participating in round {round_number} of an expert panel discussion.

{agent.get('system_prompt', '')}

**Original Panel Question:**
{state["question"]}

**Previous Panel Discussion:**
{previous_context}

**Discussion Topics:**
{chr(10).join([f"- {topic}" for topic in state.get("debate_topics", [])])}

Respond to the panel discussion, addressing your colleagues' points. You may:
- Build on others' insights
- Challenge assumptions constructively with evidence
- Offer alternative perspectives backed by expertise
- Synthesize different viewpoints
- Identify areas of agreement and disagreement

Keep your response focused, constructive, and evidence-based.
"""

            response = await self.llm_service.generate(
                prompt=prompt,
                model=agent.get("model", "gpt-4"),
                temperature=agent.get("temperature", 0.7),
                max_tokens=agent.get("max_tokens", 1500)
            )

            return {
                "agent_id": expert_id,
                "agent_name": agent_name,
                "response": response,
                "success": True,
                "round": round_number
            }

        except Exception as e:
            logger.error(f"Panel expert execution failed", agent_id=expert_id, error=str(e))
            return {
                "agent_id": expert_id,
                "success": False,
                "error": str(e)
            }

    # ========================================================================
    # Conditional Edge Functions
    # ========================================================================

    def should_debate(self, state: EnhancedPanelState) -> str:
        """Determine if panel debate should occur"""
        if not state.get("enable_debate"):
            return "skip"
        if not state.get("debate_topics"):
            return "skip"
        return "debate"

    def check_if_more_rounds_needed(self, state: EnhancedPanelState) -> str:
        """Check if more debate rounds are needed"""
        if state.get("consensus_reached"):
            return "done"
        if state["current_round"] >= state["max_rounds"]:
            return "done"
        return "continue"

    # ========================================================================
    # Execution Method with Streaming
    # ========================================================================

    async def execute(
        self,
        question: str,
        template_slug: str,
        selected_agent_ids: List[str],
        tenant_id: str,
        user_id: str,
        session_id: str,
        enable_debate: bool = True,
        max_rounds: int = 3,
        require_consensus: bool = False
    ) -> AsyncIterator[Dict[str, Any]]:
        """
        Execute the workflow and stream all messages in real-time

        Yields:
            Dict with message updates that can be streamed to frontend
        """
        if not self.workflow:
            raise RuntimeError("Workflow not initialized. Call initialize() first.")

        initial_state: EnhancedPanelState = {
            "question": question,
            "template_slug": template_slug,
            "selected_agent_ids": selected_agent_ids,
            "tenant_id": tenant_id,
            "user_id": user_id,
            "session_id": session_id,
            "enable_debate": enable_debate,
            "max_rounds": max_rounds,
            "require_consensus": require_consensus,
            "retrieved_documents": None,
            "context": "",
            "messages": [],
            "current_round": 0,
            "agent_responses_by_round": [],
            "debate_topics": [],
            "consensus_reached": False,
            "consensus_level": 0.0,
            "summary": None,
            "key_insights": None,
            "action_items": None,
            "divergent_points": None,
            "error": None,
            "execution_time_ms": None,
            "processing_metadata": {
                "panel_mode": self.panel_mode,
                "template_metadata": {
                    "panel_type": self.template_metadata.get("panel_type"),
                    "mode_code": self.template_metadata.get("mode_code"),
                },
            },
        }

        logger.info("🚀 Starting Enhanced Ask Panel workflow with streaming")

        # Track how many messages we've already yielded to avoid duplicates
        messages_yielded = 0

        try:
            # Execute workflow with streaming mode
            async for event in self.workflow.astream(
                initial_state,
                stream_mode="updates"  # Get updates for each node
            ):
                # event is a dict with node name as key and updated state as value
                for node_name, node_output in event.items():
                    # Extract new messages from this node's output
                    if isinstance(node_output, dict) and "messages" in node_output:
                        all_messages = node_output.get("messages", [])

                        # Only yield NEW messages we haven't seen yet
                        new_messages = all_messages[messages_yielded:]

                        for message in new_messages:
                            if isinstance(message, dict):
                                yield {
                                    "type": "message",
                                    "node": node_name,
                                    "data": message
                                }
                                messages_yielded += 1

                                logger.info(
                                    "📤 Streamed message to UI",
                                    node=node_name,
                                    message_type=message.get("type"),
                                    agent_name=message.get("agent_name"),
                                    total_yielded=messages_yielded
                                )

            # Final completion event
            yield {
                "type": "complete",
                "data": {
                    "consensus_level": initial_state.get("consensus_level", 0.0),
                    "total_rounds": initial_state.get("current_round", 0),
                    "total_messages": len(initial_state.get("messages", [])),
                    "panel_members": len(selected_agent_ids)
                }
            }

        except asyncio.TimeoutError:
            logger.error("❌ Panel workflow timed out")
            yield {
                "type": "error",
                "error": "Panel consultation timed out"
            }
        except Exception as e:
            logger.error("❌ Panel workflow failed", error=str(e))
            yield {
                "type": "error",
                "error": str(e)
            }
