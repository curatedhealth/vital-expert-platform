"""
Enhanced Chain-of-Thought (CoT) Graph for VITAL Expert Consultation

Implements advanced CoT reasoning with decomposition, evidence gathering,
and synthesis for complex medical queries requiring deep analysis.
"""

from typing import Dict, List, Any, Optional, TypedDict, Annotated
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.sqlite import SqliteSaver
import json
import asyncio
from datetime import datetime

from ..state import AutonomousAgentState, ReasoningStep
from ..tools.comprehensive_registry import ComprehensiveToolRegistry
from ..knowledge.rag_connector import MultiDomainRAGConnector
from ..knowledge.agent_store_connector import AgentStoreConnector
from ..streaming.reasoning_streamer import ReasoningStreamer
from ..cost.cost_tracker import CostTrackingCallback


class CoTAgentState(TypedDict):
    """State for Chain-of-Thought reasoning"""
    # Core state
    query: str
    agent_id: str
    session_id: str
    user_id: str
    
    # CoT specific
    decomposition: List[Dict[str, Any]]
    reasoning_steps: List[ReasoningStep]
    evidence: List[Dict[str, Any]]
    synthesis: Optional[str]
    
    # Execution control
    current_phase: str
    max_iterations: int
    iteration_count: int
    is_complete: bool
    error: Optional[str]
    
    # Cost tracking
    total_cost: float
    budget: float
    cost_breakdown: Dict[str, float]
    
    # Context
    context: List[Dict[str, Any]]
    tools_used: List[str]
    domains_accessed: List[str]


class EnhancedCoTGraph:
    """Enhanced Chain-of-Thought reasoning graph"""
    
    def __init__(
        self,
        llm: ChatOpenAI,
        tool_registry: ComprehensiveToolRegistry,
        rag_connector: MultiDomainRAGConnector,
        agent_store: AgentStoreConnector,
        streamer: ReasoningStreamer,
        cost_tracker: CostTrackingCallback
    ):
        self.llm = llm
        self.tool_registry = tool_registry
        self.rag_connector = rag_connector
        self.agent_store = agent_store
        self.streamer = streamer
        self.cost_tracker = cost_tracker
        
        # Build the graph
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the CoT reasoning graph"""
        workflow = StateGraph(CoTAgentState)
        
        # Add nodes
        workflow.add_node("decompose", self._decompose_query)
        workflow.add_node("reason", self._reason_through_steps)
        workflow.add_node("gather_evidence", self._gather_evidence)
        workflow.add_node("synthesize", self._synthesize_conclusion)
        workflow.add_node("validate", self._validate_response)
        
        # Add edges
        workflow.set_entry_point("decompose")
        workflow.add_edge("decompose", "reason")
        workflow.add_edge("reason", "gather_evidence")
        workflow.add_edge("gather_evidence", "synthesize")
        workflow.add_edge("synthesize", "validate")
        workflow.add_edge("validate", END)
        
        return workflow.compile()
    
    async def _decompose_query(self, state: CoTAgentState) -> CoTAgentState:
        """Decompose complex query into sub-questions"""
        try:
            await self.streamer.send_step({
                "phase": "decompose",
                "content": "Analyzing query complexity and decomposing into sub-questions...",
                "timestamp": datetime.now().isoformat(),
                "metadata": {"query": state["query"]}
            })
            
            # Get agent details for context
            agent_details = await self.agent_store.get_agent_details(state["agent_id"])
            agent_context = f"Expert: {agent_details.get('name', 'Medical Expert')}\n"
            agent_context += f"Specialization: {', '.join(agent_details.get('knowledge_domains', []))}\n"
            agent_context += f"Capabilities: {', '.join(agent_details.get('capabilities', []))}"
            
            # Decomposition prompt
            decomposition_prompt = f"""
            You are a medical AI expert specializing in query decomposition. 
            Your task is to break down complex medical queries into manageable sub-questions.
            
            {agent_context}
            
            Query to decompose: {state["query"]}
            
            Please decompose this query into 3-7 specific sub-questions that:
            1. Cover all aspects of the original query
            2. Are answerable with available medical knowledge
            3. Build upon each other logically
            4. Are specific enough to guide evidence gathering
            
            Return your response as a JSON array of objects with this structure:
            [
                {{
                    "id": "sub_question_1",
                    "question": "Specific sub-question text",
                    "priority": "high|medium|low",
                    "domain": "relevant knowledge domain",
                    "reasoning": "Why this sub-question is important"
                }}
            ]
            """
            
            messages = [
                SystemMessage(content=decomposition_prompt),
                HumanMessage(content=state["query"])
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # Parse decomposition
            try:
                decomposition_text = response.content
                if "```json" in decomposition_text:
                    decomposition_text = decomposition_text.split("```json")[1].split("```")[0]
                elif "```" in decomposition_text:
                    decomposition_text = decomposition_text.split("```")[1]
                
                decomposition = json.loads(decomposition_text.strip())
                
                await self.streamer.send_step({
                    "phase": "decompose",
                    "content": f"Successfully decomposed query into {len(decomposition)} sub-questions",
                    "timestamp": datetime.now().isoformat(),
                    "metadata": {
                        "sub_questions": [q["question"] for q in decomposition],
                        "domains": list(set([q["domain"] for q in decomposition]))
                    }
                })
                
                state["decomposition"] = decomposition
                state["current_phase"] = "reason"
                
            except json.JSONDecodeError as e:
                # Fallback decomposition
                state["decomposition"] = [{
                    "id": "main_question",
                    "question": state["query"],
                    "priority": "high",
                    "domain": "general_medicine",
                    "reasoning": "Primary question requiring analysis"
                }]
                state["current_phase"] = "reason"
                
                await self.streamer.send_step({
                    "phase": "decompose",
                    "content": "Using fallback decomposition due to parsing error",
                    "timestamp": datetime.now().isoformat(),
                    "metadata": {"error": str(e)}
                })
            
            return state
            
        except Exception as e:
            state["error"] = f"Decomposition error: {str(e)}"
            state["current_phase"] = "error"
            return state
    
    async def _reason_through_steps(self, state: CoTAgentState) -> CoTAgentState:
        """Reason through each sub-question systematically"""
        try:
            await self.streamer.send_step({
                "phase": "reason",
                "content": "Beginning systematic reasoning through sub-questions...",
                "timestamp": datetime.now().isoformat(),
                "metadata": {"sub_questions_count": len(state["decomposition"])}
            })
            
            reasoning_steps = []
            
            for i, sub_question in enumerate(state["decomposition"]):
                await self.streamer.send_step({
                    "phase": "reason",
                    "content": f"Reasoning through sub-question {i+1}/{len(state['decomposition'])}: {sub_question['question']}",
                    "timestamp": datetime.now().isoformat(),
                    "metadata": {"sub_question": sub_question}
                })
                
                # Get relevant context for this sub-question
                context = await self.rag_connector.search_domains(
                    query=sub_question["question"],
                    domains=[sub_question["domain"]] if sub_question.get("domain") else None,
                    max_results=5
                )
                
                # Reasoning prompt for this sub-question
                reasoning_prompt = f"""
                You are a medical expert analyzing this specific sub-question:
                
                Sub-question: {sub_question['question']}
                Priority: {sub_question['priority']}
                Domain: {sub_question['domain']}
                
                Available context:
                {json.dumps(context, indent=2)}
                
                Please provide a detailed analysis that includes:
                1. Key considerations and factors
                2. Relevant medical principles or guidelines
                3. Potential approaches or solutions
                4. Important caveats or limitations
                5. Confidence level in your analysis
                
                Be thorough but concise. Focus on actionable insights.
                """
                
                messages = [
                    SystemMessage(content=reasoning_prompt),
                    HumanMessage(content=sub_question["question"])
                ]
                
                response = await self.llm.ainvoke(messages)
                
                # Create reasoning step
                reasoning_step = {
                    "id": f"reasoning_{i+1}",
                    "phase": "reason",
                    "content": response.content,
                    "timestamp": datetime.now().isoformat(),
                    "metadata": {
                        "sub_question": sub_question,
                        "context_sources": len(context),
                        "confidence": self._extract_confidence(response.content)
                    }
                }
                
                reasoning_steps.append(reasoning_step)
                await self.streamer.send_step(reasoning_step)
            
            state["reasoning_steps"] = reasoning_steps
            state["current_phase"] = "gather_evidence"
            
            await self.streamer.send_step({
                "phase": "reason",
                "content": f"Completed reasoning through {len(reasoning_steps)} sub-questions",
                "timestamp": datetime.now().isoformat(),
                "metadata": {"total_steps": len(reasoning_steps)}
            })
            
            return state
            
        except Exception as e:
            state["error"] = f"Reasoning error: {str(e)}"
            state["current_phase"] = "error"
            return state
    
    async def _gather_evidence(self, state: CoTAgentState) -> CoTAgentState:
        """Gather additional evidence using tools and RAG"""
        try:
            await self.streamer.send_step({
                "phase": "gather_evidence",
                "content": "Gathering additional evidence using available tools...",
                "timestamp": datetime.now().isoformat()
            })
            
            evidence = []
            tools_used = []
            domains_accessed = set()
            
            # Gather evidence for each sub-question
            for sub_question in state["decomposition"]:
                if sub_question["priority"] == "high":
                    await self.streamer.send_step({
                        "phase": "gather_evidence",
                        "content": f"Gathering evidence for high-priority question: {sub_question['question']}",
                        "timestamp": datetime.now().isoformat()
                    })
                    
                    # Use tools to gather evidence
                    tool_evidence = await self._use_tools_for_evidence(
                        sub_question["question"], 
                        sub_question["domain"]
                    )
                    
                    if tool_evidence:
                        evidence.extend(tool_evidence)
                        tools_used.extend([e.get("tool", "unknown") for e in tool_evidence])
                    
                    # Use RAG for additional context
                    rag_evidence = await self.rag_connector.search_domains(
                        query=sub_question["question"],
                        domains=[sub_question["domain"]] if sub_question.get("domain") else None,
                        max_results=3
                    )
                    
                    if rag_evidence:
                        evidence.extend(rag_evidence)
                        domains_accessed.add(sub_question["domain"])
            
            state["evidence"] = evidence
            state["tools_used"] = list(set(tools_used))
            state["domains_accessed"] = list(domains_accessed)
            state["current_phase"] = "synthesize"
            
            await self.streamer.send_step({
                "phase": "gather_evidence",
                "content": f"Gathered {len(evidence)} pieces of evidence using {len(tools_used)} tools",
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "evidence_count": len(evidence),
                    "tools_used": tools_used,
                    "domains_accessed": list(domains_accessed)
                }
            })
            
            return state
            
        except Exception as e:
            state["error"] = f"Evidence gathering error: {str(e)}"
            state["current_phase"] = "error"
            return state
    
    async def _synthesize_conclusion(self, state: CoTAgentState) -> CoTAgentState:
        """Synthesize all reasoning and evidence into final conclusion"""
        try:
            await self.streamer.send_step({
                "phase": "synthesize",
                "content": "Synthesizing reasoning and evidence into final conclusion...",
                "timestamp": datetime.now().isoformat()
            })
            
            # Prepare synthesis context
            reasoning_summary = "\n\n".join([
                f"Sub-question {i+1}: {step['metadata']['sub_question']['question']}\n"
                f"Analysis: {step['content']}"
                for i, step in enumerate(state["reasoning_steps"])
            ])
            
            evidence_summary = "\n\n".join([
                f"Source: {e.get('source', 'Unknown')}\n"
                f"Content: {e.get('content', '')[:500]}..."
                for e in state["evidence"][:10]  # Limit to top 10 evidence pieces
            ])
            
            # Synthesis prompt
            synthesis_prompt = f"""
            You are a medical expert synthesizing a comprehensive response to a complex query.
            
            Original Query: {state["query"]}
            
            Sub-question Analysis:
            {reasoning_summary}
            
            Supporting Evidence:
            {evidence_summary}
            
            Please provide a comprehensive synthesis that:
            1. Directly addresses the original query
            2. Integrates insights from all sub-question analyses
            3. Incorporates relevant evidence
            4. Provides clear, actionable recommendations
            5. Acknowledges limitations and uncertainties
            6. Includes appropriate disclaimers for medical advice
            
            Structure your response with:
            - Executive Summary
            - Detailed Analysis
            - Key Recommendations
            - Important Considerations
            - References and Sources
            """
            
            messages = [
                SystemMessage(content=synthesis_prompt),
                HumanMessage(content=state["query"])
            ]
            
            response = await self.llm.ainvoke(messages)
            
            state["synthesis"] = response.content
            state["current_phase"] = "validate"
            
            await self.streamer.send_step({
                "phase": "synthesize",
                "content": "Successfully synthesized comprehensive conclusion",
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "synthesis_length": len(response.content),
                    "sub_questions_addressed": len(state["reasoning_steps"]),
                    "evidence_integrated": len(state["evidence"])
                }
            })
            
            return state
            
        except Exception as e:
            state["error"] = f"Synthesis error: {str(e)}"
            state["current_phase"] = "error"
            return state
    
    async def _validate_response(self, state: CoTAgentState) -> CoTAgentState:
        """Validate the final response for completeness and accuracy"""
        try:
            await self.streamer.send_step({
                "phase": "validate",
                "content": "Validating response completeness and accuracy...",
                "timestamp": datetime.now().isoformat()
            })
            
            # Validation prompt
            validation_prompt = f"""
            You are a medical expert validating a consultation response.
            
            Original Query: {state["query"]}
            
            Generated Response:
            {state["synthesis"]}
            
            Please validate that the response:
            1. Directly addresses the original query
            2. Is medically accurate and evidence-based
            3. Includes appropriate disclaimers
            4. Is comprehensive and actionable
            5. Acknowledges limitations
            
            Rate the response quality (1-10) and provide any necessary corrections.
            """
            
            messages = [
                SystemMessage(content=validation_prompt),
                HumanMessage(content=f"Query: {state['query']}\n\nResponse: {state['synthesis']}")
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # Extract validation score
            validation_score = self._extract_validation_score(response.content)
            
            if validation_score >= 7:
                state["is_complete"] = True
                state["current_phase"] = "complete"
                
                await self.streamer.send_step({
                    "phase": "validate",
                    "content": f"Response validated successfully (Score: {validation_score}/10)",
                    "timestamp": datetime.now().isoformat(),
                    "metadata": {"validation_score": validation_score}
                })
            else:
                # Response needs improvement
                state["synthesis"] = f"{state['synthesis']}\n\n[Validation Note: {response.content}]"
                state["is_complete"] = True
                state["current_phase"] = "complete"
                
                await self.streamer.send_step({
                    "phase": "validate",
                    "content": f"Response validated with improvements (Score: {validation_score}/10)",
                    "timestamp": datetime.now().isoformat(),
                    "metadata": {"validation_score": validation_score}
                })
            
            return state
            
        except Exception as e:
            state["error"] = f"Validation error: {str(e)}"
            state["current_phase"] = "error"
            return state
    
    async def _use_tools_for_evidence(
        self, 
        question: str, 
        domain: str
    ) -> List[Dict[str, Any]]:
        """Use available tools to gather evidence for a question"""
        evidence = []
        
        try:
            # Select appropriate tools for the domain
            if "regulatory" in domain.lower():
                # Use regulatory tools
                if "fda" in question.lower():
                    fda_tool = self.tool_registry.get_tool("fda_database")
                    if fda_tool:
                        result = await fda_tool.ainvoke({"query": question})
                        evidence.append({
                            "source": "FDA Database",
                            "content": result,
                            "tool": "fda_database",
                            "domain": domain
                        })
                
                if "ema" in question.lower():
                    ema_tool = self.tool_registry.get_tool("ema_database")
                    if ema_tool:
                        result = await ema_tool.ainvoke({"query": question})
                        evidence.append({
                            "source": "EMA Database",
                            "content": result,
                            "tool": "ema_database",
                            "domain": domain
                        })
            
            if "clinical" in domain.lower() or "trial" in question.lower():
                # Use clinical trial tools
                ct_tool = self.tool_registry.get_tool("clinical_trials")
                if ct_tool:
                    result = await ct_tool.ainvoke({"query": question})
                    evidence.append({
                        "source": "Clinical Trials Database",
                        "content": result,
                        "tool": "clinical_trials",
                        "domain": domain
                    })
            
            if "literature" in domain.lower() or "research" in question.lower():
                # Use literature search tools
                pubmed_tool = self.tool_registry.get_tool("pubmed_search")
                if pubmed_tool:
                    result = await pubmed_tool.ainvoke({"query": question})
                    evidence.append({
                        "source": "PubMed",
                        "content": result,
                        "tool": "pubmed_search",
                        "domain": domain
                    })
            
            # Always try web search for additional context
            web_tool = self.tool_registry.get_tool("web_search")
            if web_tool:
                result = await web_tool.ainvoke({"query": f"{question} medical research"})
                evidence.append({
                    "source": "Web Search",
                    "content": result,
                    "tool": "web_search",
                    "domain": domain
                })
        
        except Exception as e:
            print(f"Error using tools for evidence: {e}")
        
        return evidence
    
    def _extract_confidence(self, content: str) -> float:
        """Extract confidence score from response content"""
        try:
            # Look for confidence indicators in the text
            content_lower = content.lower()
            if "high confidence" in content_lower or "very confident" in content_lower:
                return 0.9
            elif "moderate confidence" in content_lower or "somewhat confident" in content_lower:
                return 0.7
            elif "low confidence" in content_lower or "uncertain" in content_lower:
                return 0.4
            else:
                return 0.6  # Default moderate confidence
        except:
            return 0.5
    
    def _extract_validation_score(self, content: str) -> int:
        """Extract validation score from response content"""
        try:
            # Look for numeric scores in the text
            import re
            scores = re.findall(r'(\d+)/10', content)
            if scores:
                return int(scores[0])
            elif "excellent" in content.lower():
                return 9
            elif "good" in content.lower():
                return 7
            elif "adequate" in content.lower():
                return 6
            else:
                return 5
        except:
            return 5
    
    async def execute(
        self, 
        query: str, 
        agent_id: str, 
        session_id: str, 
        user_id: str,
        budget: float = 50.0,
        max_iterations: int = 10
    ) -> Dict[str, Any]:
        """Execute CoT reasoning for a query"""
        try:
            # Initialize state
            initial_state = CoTAgentState(
                query=query,
                agent_id=agent_id,
                session_id=session_id,
                user_id=user_id,
                decomposition=[],
                reasoning_steps=[],
                evidence=[],
                synthesis=None,
                current_phase="decompose",
                max_iterations=max_iterations,
                iteration_count=0,
                is_complete=False,
                error=None,
                total_cost=0.0,
                budget=budget,
                cost_breakdown={},
                context=[],
                tools_used=[],
                domains_accessed=[]
            )
            
            # Execute graph
            result = await self.graph.ainvoke(initial_state)
            
            return {
                "success": result["is_complete"] and result["error"] is None,
                "response": result["synthesis"],
                "reasoning_steps": result["reasoning_steps"],
                "evidence": result["evidence"],
                "decomposition": result["decomposition"],
                "cost": result["total_cost"],
                "tools_used": result["tools_used"],
                "domains_accessed": result["domains_accessed"],
                "error": result["error"]
            }
            
        except Exception as e:
            return {
                "success": False,
                "response": None,
                "reasoning_steps": [],
                "evidence": [],
                "decomposition": [],
                "cost": 0.0,
                "tools_used": [],
                "domains_accessed": [],
                "error": str(e)
            }
