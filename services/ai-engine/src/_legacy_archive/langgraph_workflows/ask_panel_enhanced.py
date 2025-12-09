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
import re

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
    
    # Network pattern tracking
    current_expert_index: int  # Which expert is currently speaking
    experts_spoken_this_round: List[int]  # Track which experts have spoken in current round
    next_expert_to_speak: Optional[str]  # Expert ID that should speak next (moderator decision)

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
        """Initialize the enhanced LangGraph workflow with network pattern for debate"""
        workflow = StateGraph(EnhancedPanelState)

        # Add core nodes
        workflow.add_node("orchestrator_intro", self.orchestrator_intro_node)
        workflow.add_node("retrieve_knowledge", self.retrieve_knowledge_node)
        workflow.add_node("initial_panel_responses", self.initial_panel_responses_node)
        workflow.add_node("identify_debate_topics", self.identify_debate_topics_node)
        
        # Network pattern nodes for debate
        workflow.add_node("moderator_routing", self.moderator_routing_node)
        workflow.add_node("expert_debate_response", self.expert_debate_response_node)
        
        # Legacy sequential debate node (kept for backward compatibility)
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
                "debate": "moderator_routing",  # Start with moderator routing for network pattern
                "skip": "check_consensus_after_initial"
            }
        )
        
        # Add consensus check after initial responses (when debate is skipped)
        workflow.add_node("check_consensus_after_initial", self.check_consensus_node)
        workflow.add_edge("check_consensus_after_initial", "generate_summary")

        # Network pattern: Moderator routes to expert, expert responds, then back to moderator
        workflow.add_conditional_edges(
            "moderator_routing",
            self.route_to_expert_or_consensus,
            {
                "expert": "expert_debate_response",
                "check_consensus": "check_consensus"
            }
        )
        
        # Expert responds, then routes back to moderator or consensus check
        workflow.add_conditional_edges(
            "expert_debate_response",
            self.route_after_expert_response,
            {
                "moderator_routing": "moderator_routing",
                "check_consensus": "check_consensus"
            }
        )

        # Consensus check after network debate
        workflow.add_conditional_edges(
            "check_consensus",
            self.check_if_more_rounds_needed,
            {
                "continue": "moderator_routing",  # Continue network debate
                "done": "generate_summary"
            }
        )

        # Final steps
        workflow.add_edge("generate_summary", "orchestrator_conclusion")
        workflow.add_edge("orchestrator_conclusion", END)

        # Compile
        self.workflow = workflow.compile()
        logger.info("✅ Enhanced Ask Panel workflow initialized with network pattern for agent communication")

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
            state["consensus_level"] = 0.0  # Initialize consensus level
            state["debate_topics"] = []
            # Initialize network pattern tracking
            state["current_expert_index"] = 0
            state["experts_spoken_this_round"] = []
            state["next_expert_to_speak"] = None

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

            # Track successful and failed responses
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
                    # Add message using _add_message to ensure proper tracking
                    state = self._add_message(
                        state,
                        MessageType.AGENT,
                        result["agent_name"],
                        result["response"],
                        agent_id=result["agent_id"],
                        agent_name=result["agent_name"],
                        metadata={"round": 1, "role": "panel_member"}
                    )
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

            # Store responses for this round
            # Messages have already been added via _add_message above
            return {
                **state,
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
                model="gpt-4o-mini",
                temperature=0.3,
                max_tokens=800
            )

            # Parse topics - be more robust with JSON parsing
            topics = []
            try:
                # Try to extract JSON from the response (might have markdown code blocks)
                analysis_clean = analysis.strip()
                if "```json" in analysis_clean:
                    # Extract JSON from code block
                    start = analysis_clean.find("```json") + 7
                    end = analysis_clean.find("```", start)
                    if end > start:
                        analysis_clean = analysis_clean[start:end].strip()
                elif "```" in analysis_clean:
                    # Extract from generic code block
                    start = analysis_clean.find("```") + 3
                    end = analysis_clean.find("```", start)
                    if end > start:
                        analysis_clean = analysis_clean[start:end].strip()
                
                topics_data = json.loads(analysis_clean)
                if isinstance(topics_data, list):
                    topics = [t.get("topic", t) if isinstance(t, dict) else str(t) for t in topics_data[:3]]
                elif isinstance(topics_data, dict) and "topics" in topics_data:
                    topics = topics_data["topics"][:3]
                
                logger.info(f"✅ Parsed {len(topics)} debate topics: {topics}")
            except json.JSONDecodeError as e:
                logger.warning(f"⚠️ Failed to parse JSON from debate topic analysis: {e}")
                logger.warning(f"⚠️ Raw analysis response: {analysis[:500]}")
                # Fallback: try to extract topics from text using regex or simple parsing
                # Look for patterns like "1. Topic" or "- Topic" or "topic: ..."
                topic_patterns = re.findall(r'(?:^\d+\.\s*|^-\s*|topic["\']?\s*:\s*["\']?)([^\n]+)', analysis, re.MULTILINE | re.IGNORECASE)
                if topic_patterns:
                    topics = [t.strip().strip('"\'') for t in topic_patterns[:3] if t.strip()]
                    logger.info(f"✅ Extracted {len(topics)} topics using fallback parsing: {topics}")
                else:
                    topics = []
            except Exception as e:
                logger.error(f"❌ Error parsing debate topics: {e}", exc_info=True)
                topics = []

            state["debate_topics"] = topics

            # Always proceed with debate if enabled, even if no topics identified
            # The should_debate function will handle empty topics
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
            else:
                # Even if no topics identified, add a message that debate will proceed
                logger.info("💬 No specific topics identified, but proceeding with general panel discussion")
                state = self._add_message(
                    state,
                    MessageType.ORCHESTRATOR,
                    "orchestrator",
                    "💬 **Panel Discussion**\n\nPanel members will now respond to each other's perspectives and engage in discussion..."
                )

            return state

        except Exception as e:
            logger.error("❌ Debate topic identification failed", error=str(e), exc_info=True)
            # Even if topic identification fails, set empty list so workflow continues
            state["debate_topics"] = []
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
                f"💬 **Round {round_number}: Panel Discussion**\n\nAs the moderator, I'll now give each panel member the opportunity to respond to their colleagues' perspectives. Let's hear from each expert in turn..."
            )

            # Get previous messages for context
            previous_panel_messages = [
                m for m in state.get("messages", [])
                if m["type"] == MessageType.AGENT
            ]

            # Execute experts SEQUENTIALLY with moderator messages between each
            # This creates the "moderator giving word" effect the user expects
            debate_messages = []
            successful_responses = []
            failed_responses = []

            for i, expert_id in enumerate(state["selected_agent_ids"]):
                # Get agent name for moderator message
                try:
                    tenant_id = state.get("tenant_id")
                    agent = await self.agent_service.get_agent(expert_id, tenant_id=tenant_id)
                    agent_name = agent.get("display_name", agent.get("name", expert_id)) if agent else f"Expert {i+1}"
                except:
                    agent_name = f"Expert {i+1}"
                
                # Moderator gives word to this expert
                state = self._add_message(
                    state,
                    MessageType.ORCHESTRATOR,
                    "orchestrator",
                    f"🎤 **Moderator:** {agent_name}, please share your thoughts on your colleagues' perspectives..."
                )
                
                # Execute this expert with all previous messages (including previous debate responses)
                try:
                    result = await self._execute_panel_expert(
                        state,
                        expert_id,
                        round_number=round_number,
                        prompt_type="debate",
                        previous_messages=previous_panel_messages + debate_messages  # Include previous debate responses
                    )
                    
                    if isinstance(result, dict) and result.get("success"):
                        # Create message object
                        expert_message = {
                        "id": str(uuid4()),
                        "type": MessageType.AGENT,
                        "role": result["agent_name"],
                        "content": result["response"],
                        "timestamp": datetime.utcnow().isoformat(),
                        "agent_id": result["agent_id"],
                        "agent_name": result["agent_name"],
                        "metadata": {"round": round_number, "role": "panel_debater"}
                        }
                        debate_messages.append(expert_message)
                    successful_responses.append(result)
                        
                        logger.info(
                            "✅ Debate round agent response successful",
                            agent_id=result["agent_id"],
                            agent_name=result["agent_name"],
                            round=round_number,
                            response_length=len(result["response"])
                        )
                else:
                        failed_responses.append({"agent_id": expert_id, "result": result})
                except Exception as e:
                    logger.error(
                        "❌ Debate round agent execution returned exception",
                        agent_id=expert_id,
                        round=round_number,
                        error=str(e),
                        error_type=type(e).__name__
                    )
                    failed_responses.append({"agent_id": expert_id, "error": str(e)})
            

            logger.info(
                "📊 Debate round responses summary",
                round=round_number,
                total_agents=len(state["selected_agent_ids"]),
                successful=len(successful_responses),
                failed=len(failed_responses),
                debate_messages_count=len(debate_messages)
            )

            # Store responses for this round and add all debate messages
            # Note: Moderator messages were already added via _add_message (which uses operator.add)
            # So they're already in state["messages"]. We just need to add the debate_messages.
            # With operator.add, returning "messages": debate_messages will add them to existing messages.
            return {
                **state,
                "messages": debate_messages,  # operator.add will append these to existing messages
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
    # Network Pattern Nodes: Moderator Routing and Expert Response
    # ========================================================================

    async def moderator_routing_node(self, state: EnhancedPanelState) -> EnhancedPanelState:
        """
        Moderator decides which expert should speak next in the network pattern.
        This allows dynamic routing based on conversation flow.
        """
        try:
            # Initialize round tracking if needed
            if state.get("current_round", 0) == 0:
                state["current_round"] = 1
                state["experts_spoken_this_round"] = []
                state["current_expert_index"] = 0
            
            round_number = state["current_round"]
            experts_spoken = state.get("experts_spoken_this_round", [])
            all_expert_ids = state["selected_agent_ids"]
            
            # Determine which expert should speak next
            # Strategy: Round-robin, but moderator can decide based on conversation
            next_expert_index = None
            next_expert_id = None
            
            # If we have a moderator decision from previous round, use it
            if state.get("next_expert_to_speak"):
                next_expert_id = state["next_expert_to_speak"]
                try:
                    next_expert_index = all_expert_ids.index(next_expert_id)
                except ValueError:
                    next_expert_id = None
            
            # Otherwise, find next expert who hasn't spoken this round
            if next_expert_index is None:
                for i in range(len(all_expert_ids)):
                    if i not in experts_spoken:
                        next_expert_index = i
                        next_expert_id = all_expert_ids[i]
                        break
            
            # If all experts have spoken, start new round or check consensus
            if next_expert_index is None:
                logger.info(f"💬 All experts have spoken in round {round_number}")
                # Clear spoken list for potential next round
                state["experts_spoken_this_round"] = []
                state["next_expert_to_speak"] = None
                return state
            
            # Get expert info
            tenant_id = state.get("tenant_id")
            try:
                agent = await self.agent_service.get_agent(next_expert_id, tenant_id=tenant_id)
                agent_name = agent.get("display_name", agent.get("name", next_expert_id)) if agent else f"Expert {next_expert_index + 1}"
            except:
                agent_name = f"Expert {next_expert_index + 1}"
            
            # Moderator gives word to this expert
            # Check if this is the first expert in this round
            if len(experts_spoken) == 0:
                state = self._add_message(
                    state,
                    MessageType.ORCHESTRATOR,
                    "moderator",  # Use "moderator" as role
                    f"💬 **Round {round_number}: Panel Discussion**\n\nAs the moderator, I'll facilitate a dynamic discussion where experts can respond to each other. Let's begin...",
                    agent_name="Moderator",  # Set agent_name so it shows in UI
                    metadata={"role": "moderator", "round": round_number}
                )
            
            # Get context of who has spoken and what they said
            previous_speakers = []
            for idx in experts_spoken:
                if idx < len(all_expert_ids):
                    try:
                        prev_agent = await self.agent_service.get_agent(all_expert_ids[idx], tenant_id=tenant_id)
                        prev_name = prev_agent.get("display_name", prev_agent.get("name", all_expert_ids[idx])) if prev_agent else f"Expert {idx + 1}"
                        previous_speakers.append(prev_name)
                    except:
                        previous_speakers.append(f"Expert {idx + 1}")
            
            context_msg = ""
            if previous_speakers:
                context_msg = f"\n\nSo far in this round, {', '.join(previous_speakers)} have shared their perspectives."
            
            # Add moderator message as visible message with clear moderator label
            state = self._add_message(
                state,
                MessageType.ORCHESTRATOR,
                "moderator",  # Use "moderator" as role so it shows up clearly
                f"🎤 **Moderator:** {agent_name}, please share your thoughts on your colleagues' perspectives.{context_msg}",
                agent_name="Moderator",  # Set agent_name so it shows in UI
                metadata={"role": "moderator", "round": round_number, "target_expert": agent_name}
            )
            
            # Update state for expert response
            state["current_expert_index"] = next_expert_index
            state["next_expert_to_speak"] = next_expert_id
            
            logger.info(
                f"🎤 Moderator routing to expert {next_expert_index + 1}/{len(all_expert_ids)}: {agent_name}",
                expert_id=next_expert_id,
                round=round_number
            )
            
            return state
            
        except Exception as e:
            logger.error("❌ Moderator routing failed", error=str(e), exc_info=True)
            state["error"] = str(e)
            return state

    async def expert_debate_response_node(self, state: EnhancedPanelState) -> EnhancedPanelState:
        """
        Single expert responds in the network pattern.
        Expert can reference and respond to specific colleagues.
        """
        try:
            round_number = state.get("current_round", 1)
            expert_id = state.get("next_expert_to_speak")
            expert_index = state.get("current_expert_index", 0)
            
            if not expert_id:
                logger.error("❌ No expert ID set for debate response")
                # Mark as spoken to avoid infinite loop
                experts_spoken = state.get("experts_spoken_this_round", [])
                if expert_index not in experts_spoken:
                    experts_spoken.append(expert_index)
                state["experts_spoken_this_round"] = experts_spoken
                state["next_expert_to_speak"] = None
                return state
            
            logger.info(
                f"🎯 Executing expert {expert_index + 1} in debate round {round_number}",
                expert_id=expert_id,
                expert_index=expert_index
            )
            
            # Get previous messages for context
            previous_panel_messages = [
                m for m in state.get("messages", [])
                if m["type"] == MessageType.AGENT
            ]
            
            # Execute this expert
            try:
                result = await self._execute_panel_expert(
                    state,
                    expert_id,
                    round_number=round_number,
                    prompt_type="debate",
                    previous_messages=previous_panel_messages
                )
                
                if isinstance(result, dict) and result.get("success"):
                    # Create message object
                    expert_message = {
                        "id": str(uuid4()),
                        "type": MessageType.AGENT,
                        "role": result["agent_name"],
                        "content": result["response"],
                        "timestamp": datetime.utcnow().isoformat(),
                        "agent_id": result["agent_id"],
                        "agent_name": result["agent_name"],
                        "metadata": {"round": round_number, "role": "panel_debater", "network_pattern": True}
                    }
                    
                    # Add message to state
                    state = self._add_message(
                        state,
                        MessageType.AGENT,
                        result["agent_name"],
                        result["response"],
                        agent_id=result["agent_id"],
                        agent_name=result["agent_name"],
                        metadata=expert_message["metadata"]
                    )
                    
                    # Mark this expert as having spoken
                    experts_spoken = state.get("experts_spoken_this_round", [])
                    if expert_index not in experts_spoken:
                        experts_spoken.append(expert_index)
                    state["experts_spoken_this_round"] = experts_spoken
                    
                    # Clear next expert (moderator will decide)
                    state["next_expert_to_speak"] = None
                    
                    logger.info(
                        "✅ Expert debate response successful (network pattern)",
                        agent_id=result["agent_id"],
                        agent_name=result["agent_name"],
                        round=round_number,
                        experts_spoken_count=len(experts_spoken)
                    )
                else:
                    error_msg = result.get("error", "Unknown error") if isinstance(result, dict) else str(result)
                    logger.error(f"❌ Expert execution failed: {error_msg}")
                    
                    # Add error message to state
                    state = self._add_message(
                        state,
                        MessageType.ORCHESTRATOR,
                        "system",
                        f"⚠️ Expert {expert_index + 1} was unable to respond: {error_msg}",
                        metadata={"error": True, "expert_index": expert_index}
                    )
                    
                    # Still mark as spoken to avoid infinite loop
                    experts_spoken = state.get("experts_spoken_this_round", [])
                    if expert_index not in experts_spoken:
                        experts_spoken.append(expert_index)
                    state["experts_spoken_this_round"] = experts_spoken
                    state["next_expert_to_speak"] = None
                    
            except Exception as e:
                import traceback
                error_details = traceback.format_exc()
                logger.error(
                    "❌ Expert debate response failed",
                    expert_id=expert_id,
                    round=round_number,
                    error=str(e),
                    error_type=type(e).__name__,
                    traceback=error_details
                )
                
                # Add error message to state
                state = self._add_message(
                    state,
                    MessageType.ORCHESTRATOR,
                    "system",
                    f"⚠️ Expert {expert_index + 1} encountered an error: {str(e)}",
                    metadata={"error": True, "expert_index": expert_index}
                )
                
                # Mark as spoken to avoid infinite loop
                experts_spoken = state.get("experts_spoken_this_round", [])
                if expert_index not in experts_spoken:
                    experts_spoken.append(expert_index)
                state["experts_spoken_this_round"] = experts_spoken
                state["next_expert_to_speak"] = None
            
            return state
            
        except Exception as e:
            logger.error("❌ Expert debate response node failed", error=str(e), exc_info=True)
            state["error"] = str(e)
            return state

    def route_to_expert_or_consensus(self, state: EnhancedPanelState) -> str:
        """
        Route after moderator decides: to expert or check consensus
        """
        experts_spoken = state.get("experts_spoken_this_round", [])
        all_experts_count = len(state.get("selected_agent_ids", []))
        
        # If all experts have spoken this round, check consensus
        if len(experts_spoken) >= all_experts_count:
            logger.info("💬 All experts have spoken, routing to consensus check")
            return "check_consensus"
        
        # Otherwise, route to expert
        return "expert"

    def route_after_expert_response(self, state: EnhancedPanelState) -> str:
        """
        Route after expert responds: continue debate or check consensus
        """
        experts_spoken = state.get("experts_spoken_this_round", [])
        all_experts_count = len(state.get("selected_agent_ids", []))
        current_round = state.get("current_round", 1)
        max_rounds = state.get("max_rounds", 2)  # Default to 2 rounds to prevent long execution
        
        logger.info(
            f"🔄 Routing after expert response",
            round=current_round,
            max_rounds=max_rounds,
            experts_spoken=len(experts_spoken),
            total_experts=all_experts_count
        )
        
        # Safety check: if we've been in the same round for too long, move to consensus
        if len(experts_spoken) >= all_experts_count * 2:  # Safety: if we've spoken twice as many times as experts
            logger.warning("⚠️ Safety check: Too many expert responses, forcing consensus check")
            return "check_consensus"
        
        # If all experts have spoken this round
        if len(experts_spoken) >= all_experts_count:
            # Check if we should continue to next round
            if current_round < max_rounds:
                # Start next round
                state["current_round"] = current_round + 1
                state["experts_spoken_this_round"] = []
                logger.info(f"💬 Starting round {current_round + 1}/{max_rounds}")
                return "moderator_routing"  # Continue debate with new round
            else:
                logger.info("💬 Max rounds reached, checking consensus")
                return "check_consensus"
        
        # Continue with more experts in this round - route back to moderator
        return "moderator_routing"

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
            if not latest_round or not latest_round.get("responses"):
                # No responses available, set default consensus
                state["consensus_level"] = 0.5  # Default to medium consensus if no responses
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
                model="gpt-4o-mini",
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
            # Set default consensus level if calculation failed
            if state.get("consensus_level") is None or state.get("consensus_level") == 0.0:
                state["consensus_level"] = 0.5  # Default to medium consensus on error
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
                model="gpt-4o-mini",
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
            logger.error("❌ Summary generation failed", error=str(e), exc_info=True)
            # Generate a fallback summary even if LLM call fails
            fallback_summary = f"""## Panel Consultation Summary

**Question:** {state["question"]}

**Panel Members:** {len(state["selected_agent_ids"])} experts

**Key Points:**
- Multiple expert perspectives were gathered
- See individual expert responses above for detailed insights

**Note:** Automated summary generation encountered an issue. Please review individual expert responses above.
"""
            state["summary"] = fallback_summary
            state = self._add_message(
                state,
                MessageType.SUMMARY,
                "panel_synthesizer",
                fallback_summary,
                metadata={"consensus_level": state.get("consensus_level", 0.0), "fallback": True}
            )
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
{state.get("context", '')[:2000]}

**Your Task:**
Provide your expert analysis and recommendations as a panel member. Be thorough and cite specific evidence from the context when possible.

**Important:** Give a unique perspective. Don't just use a generic structure like "Preparation Stage, During Discussion, Post-Discussion" unless that's truly the best way to organize YOUR specific expertise. Focus on what makes YOUR perspective valuable and different.
"""
            else:  # debate
                # Include recent context but limit to avoid token limits
                # Use last 3-4 messages per expert to keep context manageable
                recent_messages = []
                seen_agents = set()
                agent_message_count = {}
                
                # Get messages in reverse order (most recent first)
                for m in reversed(previous_messages or []):
                    agent_name = m.get('agent_name', 'Unknown')
                    if agent_name not in seen_agents:
                        seen_agents.add(agent_name)
                        agent_message_count[agent_name] = 0
                    
                    # Limit to 2 most recent messages per agent
                    if agent_message_count.get(agent_name, 0) < 2:
                        # Truncate long messages to max 2000 chars
                        content = m.get('content', '')
                        if len(content) > 2000:
                            content = content[:2000] + "... [truncated]"
                        recent_messages.append({
                            'agent_name': agent_name,
                            'content': content,
                            'round': m.get('metadata', {}).get('round', '?')
                        })
                        agent_message_count[agent_name] = agent_message_count.get(agent_name, 0) + 1
                
                # Reverse back to chronological order
                recent_messages.reverse()
                
                previous_context = "\n\n".join([
                    f"**{m['agent_name']}** (Round {m['round']}):\n{m['content']}"
                    for m in recent_messages
                ])
                
                # If context is still too long, truncate further
                if len(previous_context) > 8000:
                    previous_context = previous_context[:8000] + "\n\n[Additional context truncated to manage token limits]"

                # Get list of other expert names for reference
                other_experts = [
                    m.get('agent_name') for m in (previous_messages or [])
                    if m.get('agent_name') and m.get('agent_name') != agent_name
                ]
                unique_experts = list(dict.fromkeys(other_experts))  # Remove duplicates, preserve order

                # Build a more explicit prompt with examples
                example_engagement = ""
                if unique_experts:
                    example_engagement = f"""
**EXAMPLE OF GOOD ENGAGEMENT:**
"While {unique_experts[0]} emphasized the importance of real-time analytics, I'd like to add that {unique_experts[1] if len(unique_experts) > 1 else 'another colleague'}'s point about predictive modeling is crucial. However, I see a potential limitation: [specific point]. Based on my experience, [your unique insight]."

**EXAMPLE OF BAD RESPONSE (DO NOT DO THIS):**
"Integrating advanced analytics can improve decision-making through: 1. Data-Driven Insights 2. Predictive Modeling 3. Cost Management..."
(This is just repeating the same structure - DON'T DO THIS!)
"""

                prompt = f"""You are {agent_name}, participating in round {round_number} of an expert panel DEBATE.

{agent.get('system_prompt', '')}

**🚨 CRITICAL INSTRUCTION: This is a DEBATE round. Your colleagues have ALREADY given their initial responses. Your job is to ENGAGE with their SPECIFIC points, NOT repeat the same generic answer structure.**

**Original Panel Question:**
{state["question"]}

**Your Colleagues' Responses (READ THESE CAREFULLY - YOU MUST REFERENCE THEM):**
{previous_context}

**Discussion Topics Identified:**
{chr(10).join([f"- {topic}" for topic in state.get("debate_topics", [])]) if state.get("debate_topics") else "- General discussion"}

{example_engagement}

**MANDATORY REQUIREMENTS - YOU MUST:**
1. **Start by referencing a specific colleague by name** - Use phrases like:
   - "I agree with {unique_experts[0] if unique_experts else '[Colleague Name]'}'s point about..."
   - "While {unique_experts[0] if unique_experts else '[Colleague Name]'} mentioned X, I think..."
   - "Building on {unique_experts[0] if unique_experts else '[Colleague Name]'}'s insight..."

2. **Quote or paraphrase a SPECIFIC point** from their response - don't just give your own generic answer

3. **Then either:**
   - **AGREE** and add NEW evidence, deeper analysis, or a different angle
   - **DISAGREE** and explain WHY with specific evidence
   - **SYNTHESIZE** multiple viewpoints into a NEW insight that combines perspectives

4. **Be specific and concrete** - reference actual points they made, not generic concepts

**ABSOLUTELY FORBIDDEN:**
❌ Starting with "Integrating X can improve Y through: 1. Point A 2. Point B 3. Point C" (this is the generic structure - FORBIDDEN)
❌ Ignoring what your colleagues said
❌ Repeating the same answer structure
❌ Giving a standalone answer without engaging with others

**Your Response (MUST start by referencing a colleague):**"""

            # For debate rounds, increase temperature slightly to encourage more diverse, creative responses
            base_temperature = agent.get("temperature", 0.7)
            debate_temperature = base_temperature + 0.2 if prompt_type == "debate" else base_temperature
            debate_temperature = min(debate_temperature, 1.0)  # Cap at 1.0

            response = await self.llm_service.generate(
                prompt=prompt,
                model=agent.get("model", "gpt-4"),
                temperature=debate_temperature,
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
        enable_debate = state.get("enable_debate", False)
        logger.info(
            "🔍 Checking if debate should occur",
            enable_debate=enable_debate,
            debate_topics=state.get("debate_topics", [])
        )
        
        if not enable_debate:
            logger.info("💬 Debate skipped: enable_debate is False")
            return "skip"
        
        debate_topics = state.get("debate_topics", [])
        if not debate_topics or len(debate_topics) == 0:
            # Even if no topics identified, proceed with debate if enabled
            # This allows panel members to discuss and respond to each other
            logger.info("💬 No debate topics identified, but proceeding with debate since enable_debate=True")
            # Set a default topic to ensure debate happens
            state["debate_topics"] = ["Panel Discussion: Experts will respond to each other's perspectives"]
            logger.info("✅ Debate WILL proceed - routing to panel_debate_round")
            return "debate"
        
        logger.info(f"💬 Debate enabled with {len(debate_topics)} topics: {debate_topics}")
        logger.info("✅ Debate WILL proceed - routing to panel_debate_round")
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
            # Network pattern tracking
            "current_expert_index": 0,
            "experts_spoken_this_round": [],
            "next_expert_to_speak": None,
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
        accumulated_state = initial_state.copy()

        # Temporarily disable LangSmith if enabled to avoid large payload errors (200MB limit)
        import os
        langsmith_enabled = os.getenv("LANGCHAIN_TRACING_V2", "false").lower() == "true"
        original_tracing = os.environ.get("LANGCHAIN_TRACING_V2")
        original_api_key = os.environ.get("LANGCHAIN_API_KEY")

        try:
            # Completely disable LangSmith for large panel workflows to avoid size limit errors
            if langsmith_enabled or original_api_key:
                os.environ["LANGCHAIN_TRACING_V2"] = "false"
                if "LANGCHAIN_API_KEY" in os.environ:
                    del os.environ["LANGCHAIN_API_KEY"]
                logger.info("🔇 LangSmith completely disabled for panel workflow to avoid size limit errors")
            
            # Execute workflow with streaming mode - use "updates" to get node names
            # Set recursion limit to prevent infinite loops (default is 25)
            # Reduced to 30 to prevent very long executions (2 rounds * 2 experts * ~7 nodes per round)
            config = {
                "recursion_limit": 30,  # Reasonable limit for 2 rounds with 2-3 experts
            }
            
            async for event in self.workflow.astream(
                initial_state,
                stream_mode="updates",  # Get updates for each node with node names
                config=config
            ):
                # event is a dict with node name as key and updated state as value
                for node_name, node_output in event.items():
                    # Merge updates into accumulated state
                    if isinstance(node_output, dict):
                        # Update accumulated state with new values
                        for key, value in node_output.items():
                            if key == "messages":
                                # Messages are accumulated with operator.add, so merge lists
                                existing_messages = accumulated_state.get("messages", [])
                                new_messages = value if isinstance(value, list) else []
                                # Only add truly new messages (by ID)
                                existing_ids = {m.get("id") for m in existing_messages if isinstance(m, dict)}
                                for msg in new_messages:
                                    if isinstance(msg, dict) and msg.get("id") not in existing_ids:
                                        existing_messages.append(msg)
                                accumulated_state["messages"] = existing_messages
                            else:
                                accumulated_state[key] = value
                    
                    # Extract new messages from this node's output
                    if isinstance(node_output, dict) and "messages" in node_output:
                        all_messages = accumulated_state.get("messages", [])

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

            # Final completion event with accumulated final state
            yield {
                "type": "complete",
                "data": {
                    "consensus_level": accumulated_state.get("consensus_level", 0.0),
                    "total_rounds": accumulated_state.get("current_round", 0),
                    "total_messages": len(accumulated_state.get("messages", [])),
                    "panel_members": len(selected_agent_ids),
                    "summary_generated": bool(accumulated_state.get("summary")),
                    "debate_topics_count": len(accumulated_state.get("debate_topics", []))
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
        finally:
            # Always restore LangSmith settings if they were changed
            if original_tracing is not None:
                os.environ["LANGCHAIN_TRACING_V2"] = original_tracing
            elif langsmith_enabled and "LANGCHAIN_TRACING_V2" in os.environ:
                # Only delete if we disabled it (it was enabled before)
                del os.environ["LANGCHAIN_TRACING_V2"]
            
            if original_api_key is not None:
                os.environ["LANGCHAIN_API_KEY"] = original_api_key
