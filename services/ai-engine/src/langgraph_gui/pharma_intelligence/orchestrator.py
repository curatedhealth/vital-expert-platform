"""
ENHANCED PHARMA INTELLIGENCE ORCHESTRATOR
Multi-Agent System with Specialized Researchers and Feedback Loop

Architecture:
1. Agent Orchestrator & Planner - Develops research plan and allocates tasks
2. Domain Specialist Agents:
   - Medical Research Agent
   - Digital Health Agent  
   - Regulatory Agent
3. Aggregator Agent - Collects and synthesizes outputs
4. Copywriter Agent - Prepares final report
5. Loop-back Review - Orchestrator validates final output

Each agent has:
- Specialized system prompts
- Domain-specific tools
- RAG integration
"""

# Force pydantic v2 for langchain to avoid proxies error
import os
os.environ['LANGCHAIN_PYDANTIC_V2'] = 'true'

from typing import Annotated, Sequence, Literal, List, Dict, Optional
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
# Conditional pinecone import - only import when needed
try:
    import pinecone
    PINECONE_AVAILABLE = True
except ImportError:
    pinecone = None
    PINECONE_AVAILABLE = False
import operator
from datetime import datetime
import json

# Import components
from .agents import (
    OrchestratorAgent,
    MedicalResearchAgent,
    DigitalHealthAgent,
    RegulatoryAgent,
    AggregatorAgent,
    CopywriterAgent
)
from .tools import (
    PubMedSearchTool,
    WebSearchTool,
    ArXivSearchTool,
    ClinicalTrialsSearchTool,
    FDASearchTool,
    ScraperTool
)
from .rag import RAGManager
from .cache import QueryCache


# =============================================================================
# ENHANCED STATE DEFINITION
# =============================================================================

class ResearchPlan(TypedDict):
    """Research plan created by orchestrator"""
    query: str
    objectives: List[str]
    assigned_agents: List[str]  # ["medical", "digital_health", "regulatory"]
    success_criteria: Dict[str, str]
    estimated_time: str
    priority: str


class AgentOutput(TypedDict):
    """Output from each specialized agent"""
    agent_name: str
    domain: str
    findings: str
    sources: List[Dict]
    confidence_score: float
    timestamp: str


class WorkflowState(TypedDict):
    """Complete workflow state"""
    # Input
    user_query: str
    
    # Orchestrator outputs
    research_plan: ResearchPlan
    
    # Agent outputs
    medical_output: Optional[AgentOutput]
    digital_health_output: Optional[AgentOutput]
    regulatory_output: Optional[AgentOutput]
    
    # Aggregator output
    aggregated_research: Dict
    
    # Copywriter output
    final_report: str
    
    # Orchestrator review
    review_result: Dict
    needs_revision: bool
    revision_instructions: str
    
    # Metadata
    iteration_count: int
    max_iterations: int
    messages: Annotated[Sequence[BaseMessage], operator.add]
    error: Optional[str]


# =============================================================================
# ENHANCED ORCHESTRATOR WORKFLOW
# =============================================================================

class EnhancedPharmaIntelligenceOrchestrator:
    """
    Multi-agent orchestrator with specialized domain agents and feedback loop
    """
    
    def __init__(
        self,
        openai_api_key: str,
        pinecone_api_key: str,
        pinecone_index_name: str,
        max_iterations: int = 2,
    ):
        # Ensure pydantic v2 is used (set at module level, but ensure here too)
        os.environ['LANGCHAIN_PYDANTIC_V2'] = 'true'
        
        self.openai_api_key = openai_api_key
        self.pinecone_api_key = pinecone_api_key
        self.pinecone_index_name = pinecone_index_name
        self.max_iterations = max_iterations
        
        # Initialize LLMs - Using OpenAI only
        # Initialize with proper API key handling
        self.orchestrator_llm = ChatOpenAI(
            model="gpt-4o",
            api_key=openai_api_key,
            temperature=0
        )
        
        self.agent_llm = ChatOpenAI(
            model="gpt-4o",
            api_key=openai_api_key,
            temperature=0
        )
        
        self.copywriter_llm = ChatOpenAI(
            model="gpt-4o",
            api_key=openai_api_key,
            temperature=0.7
        )
        
        # Initialize RAG (optional - only if Pinecone key is provided)
        if pinecone_api_key and pinecone_api_key.strip():
            try:
                self.rag_manager = RAGManager(
                    pinecone_api_key=pinecone_api_key,
                    index_name=pinecone_index_name,
                    embeddings=OpenAIEmbeddings(api_key=openai_api_key)
                )
            except Exception as e:
                print(f"Warning: RAG initialization failed: {e}. Continuing without RAG.")
                self.rag_manager = None
        else:
            print("No Pinecone API key provided. Running without RAG (knowledge archiving disabled).")
            self.rag_manager = None
        
        # Initialize query cache for cost optimization
        self.query_cache = QueryCache(
            openai_api_key=openai_api_key,
            similarity_threshold=0.85  # 85% similarity for cache hit
        )
        
        # Initialize tools (shared across agents)
        self.tools = {
            'pubmed': PubMedSearchTool(),
            'web': WebSearchTool(),
            'arxiv': ArXivSearchTool(),
            'clinical_trials': ClinicalTrialsSearchTool(),
            'fda': FDASearchTool(),
            'scraper': ScraperTool()
        }
        
        # Initialize specialized agents
        self.orchestrator = OrchestratorAgent(
            llm=self.orchestrator_llm,
            rag_manager=self.rag_manager
        )
        
        self.medical_agent = MedicalResearchAgent(
            llm=self.agent_llm,
            tools={
                'pubmed': self.tools['pubmed'],
                'clinical_trials': self.tools['clinical_trials'],
                'rag': self.rag_manager,
                'scraper': self.tools['scraper']
            }
        )
        
        self.digital_health_agent = DigitalHealthAgent(
            llm=self.agent_llm,
            tools={
                'arxiv': self.tools['arxiv'],
                'web': self.tools['web'],
                'rag': self.rag_manager,
                'scraper': self.tools['scraper']
            }
        )
        
        self.regulatory_agent = RegulatoryAgent(
            llm=self.agent_llm,
            tools={
                'fda': self.tools['fda'],
                'web': self.tools['web'],
                'rag': self.rag_manager,
                'scraper': self.tools['scraper']
            }
        )
        
        self.aggregator = AggregatorAgent(
            llm=self.agent_llm,
            rag_manager=self.rag_manager
        )
        
        self.copywriter = CopywriterAgent(
            llm=self.copywriter_llm
        )
        
        # Build graph
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the enhanced multi-agent workflow"""
        workflow = StateGraph(WorkflowState)
        
        # Add nodes
        workflow.add_node("orchestrator_plan", self._orchestrator_plan_node)
        workflow.add_node("medical_research", self._medical_research_node)
        workflow.add_node("digital_health_research", self._digital_health_research_node)
        workflow.add_node("regulatory_research", self._regulatory_research_node)
        workflow.add_node("aggregate", self._aggregate_node)
        workflow.add_node("copywriter", self._copywriter_node)
        workflow.add_node("orchestrator_review", self._orchestrator_review_node)
        
        # Define flow
        workflow.set_entry_point("orchestrator_plan")
        
        # Conditional routing based on research plan
        workflow.add_conditional_edges(
            "orchestrator_plan",
            self._route_to_agents,
            {
                "medical": "medical_research",
                "digital_health": "digital_health_research",
                "regulatory": "regulatory_research",
                "aggregate": "aggregate",
            }
        )
        
        # All agents go to aggregate
        workflow.add_edge("medical_research", "aggregate")
        workflow.add_edge("digital_health_research", "aggregate")
        workflow.add_edge("regulatory_research", "aggregate")
        
        # Aggregate goes to copywriter
        workflow.add_edge("aggregate", "copywriter")
        
        # Copywriter goes to orchestrator review
        workflow.add_edge("copywriter", "orchestrator_review")
        
        # Conditional: review passes or needs revision
        workflow.add_conditional_edges(
            "orchestrator_review",
            self._check_review_result,
            {
                "approved": END,
                "revise": "copywriter",  # Loop back to copywriter
                "replan": "orchestrator_plan",  # Loop back to planning
            }
        )
        
        return workflow.compile()
    
    # =========================================================================
    # NODE IMPLEMENTATIONS
    # =========================================================================
    
    def _orchestrator_plan_node(self, state: WorkflowState) -> WorkflowState:
        """
        Agent 1: Orchestrator & Planner
        - Analyzes user query
        - Develops research plan
        - Assigns tasks to specialized agents
        """
        print("\n" + "="*80)
        print("🎯 ORCHESTRATOR & PLANNER")
        print("="*80)
        
        user_query = state["user_query"]
        iteration = state.get("iteration_count", 0)
        
        # Check if this is a revision
        if iteration > 0:
            print(f"📝 Revision iteration {iteration}")
            print(f"   Instructions: {state.get('revision_instructions', 'N/A')}")
        
        # Create research plan
        research_plan = self.orchestrator.create_research_plan(
            query=user_query,
            previous_outputs=self._get_previous_outputs(state) if iteration > 0 else None
        )
        
        # Filter agents based on enabled_agents from frontend
        enabled_agents = state.get("enabled_agents", [])
        if enabled_agents:
            original_agents = research_plan['assigned_agents'][:]
            research_plan['assigned_agents'] = [
                agent for agent in research_plan['assigned_agents'] 
                if agent in enabled_agents
            ]
            
            if len(research_plan['assigned_agents']) != len(original_agents):
                disabled_agents = [a for a in original_agents if a not in enabled_agents]
                print(f"\n⚠️  Filtered agents based on frontend configuration:")
                print(f"   Disabled: {', '.join(disabled_agents) if disabled_agents else 'None'}")
        
        print(f"\n✓ Research Plan Created:")
        print(f"  Objectives: {len(research_plan['objectives'])}")
        print(f"  Assigned Agents: {', '.join(research_plan['assigned_agents']) if research_plan['assigned_agents'] else 'None'}")
        print(f"  Priority: {research_plan['priority']}")
        
        return {
            "research_plan": research_plan,
            "messages": [AIMessage(content=f"Research plan created: {json.dumps(research_plan, indent=2)}")]
        }
    
    def _medical_research_node(self, state: WorkflowState) -> WorkflowState:
        """
        Agent 2.1: Medical Research Specialist
        - Clinical research
        - Drug mechanisms
        - Clinical trials
        """
        print("\n" + "="*80)
        print("🔬 MEDICAL RESEARCH AGENT")
        print("="*80)
        
        research_plan = state["research_plan"]
        
        # Execute medical research
        output = self.medical_agent.research(
            query=state["user_query"],
            objectives=[obj for obj in research_plan["objectives"] if "medical" in obj.lower() or "clinical" in obj.lower()],
            context=self._get_agent_context(state, "medical")
        )
        
        print(f"✓ Medical Research Complete")
        print(f"  Sources: {len(output['sources'])}")
        print(f"  Confidence: {output['confidence_score']:.2f}")
        
        return {"medical_output": output}
    
    def _digital_health_research_node(self, state: WorkflowState) -> WorkflowState:
        """
        Agent 2.2: Digital Health Specialist
        - Digital therapeutics
        - Health tech innovations
        - AI/ML in healthcare
        """
        print("\n" + "="*80)
        print("💻 DIGITAL HEALTH RESEARCH AGENT")
        print("="*80)
        
        research_plan = state["research_plan"]
        
        # Execute digital health research
        output = self.digital_health_agent.research(
            query=state["user_query"],
            objectives=[obj for obj in research_plan["objectives"] if "digital" in obj.lower() or "tech" in obj.lower()],
            context=self._get_agent_context(state, "digital_health")
        )
        
        print(f"✓ Digital Health Research Complete")
        print(f"  Sources: {len(output['sources'])}")
        print(f"  Confidence: {output['confidence_score']:.2f}")
        
        return {"digital_health_output": output}
    
    def _regulatory_research_node(self, state: WorkflowState) -> WorkflowState:
        """
        Agent 2.3: Regulatory Specialist
        - FDA regulations
        - EMA guidelines
        - Compliance requirements
        """
        print("\n" + "="*80)
        print("⚖️  REGULATORY RESEARCH AGENT")
        print("="*80)
        
        research_plan = state["research_plan"]
        
        # Execute regulatory research
        output = self.regulatory_agent.research(
            query=state["user_query"],
            objectives=[obj for obj in research_plan["objectives"] if "regulatory" in obj.lower() or "fda" in obj.lower() or "approval" in obj.lower()],
            context=self._get_agent_context(state, "regulatory")
        )
        
        print(f"✓ Regulatory Research Complete")
        print(f"  Sources: {len(output['sources'])}")
        print(f"  Confidence: {output['confidence_score']:.2f}")
        
        return {"regulatory_output": output}
    
    def _aggregate_node(self, state: WorkflowState) -> WorkflowState:
        """
        Agent 3: Aggregator
        - Collects all agent outputs
        - Synthesizes findings
        - Resolves conflicts
        - Archives in RAG
        """
        print("\n" + "="*80)
        print("🔄 AGGREGATOR AGENT")
        print("="*80)
        
        # Collect all agent outputs
        agent_outputs = []
        if state.get("medical_output"):
            agent_outputs.append(state["medical_output"])
        if state.get("digital_health_output"):
            agent_outputs.append(state["digital_health_output"])
        if state.get("regulatory_output"):
            agent_outputs.append(state["regulatory_output"])
        
        # Aggregate findings
        aggregated = self.aggregator.aggregate(
            query=state["user_query"],
            research_plan=state["research_plan"],
            agent_outputs=agent_outputs
        )
        
        print(f"✓ Aggregation Complete")
        print(f"  Total Sources: {len(aggregated.get('all_sources', []))}")
        print(f"  Key Findings: {len(aggregated.get('key_findings', []))}")
        
        # Archive in RAG (if available)
        if self.rag_manager:
            print("Archiving in RAG...")
            self.rag_manager.archive_research(
                query=state["user_query"],
                aggregated_data=aggregated
            )
            print("Archived in RAG")
        else:
            print("RAG not available - skipping archiving")
        
        return {"aggregated_research": aggregated}
    
    def _copywriter_node(self, state: WorkflowState) -> WorkflowState:
        """
        Agent 4: Copywriter
        - Prepares final report
        - Professional formatting
        - Clear communication
        """
        print("\n" + "="*80)
        print("✍️  COPYWRITER AGENT")
        print("="*80)
        
        # Check if this is a revision
        revision_instructions = state.get("revision_instructions", "")
        
        # Generate report
        report = self.copywriter.write_report(
            query=state["user_query"],
            research_plan=state["research_plan"],
            aggregated_research=state["aggregated_research"],
            revision_instructions=revision_instructions if state.get("iteration_count", 0) > 0 else None
        )
        
        print(f"✓ Report Generated")
        print(f"  Length: {len(report)} characters")
        print(f"  Sections: {report.count('##')}")
        
        return {"final_report": report}
    
    def _orchestrator_review_node(self, state: WorkflowState) -> WorkflowState:
        """
        Agent 5: Orchestrator Review (Loop-back)
        - Reviews final report
        - Validates against success criteria
        - Decides: approve, revise, or replan
        """
        print("\n" + "="*80)
        print("🔍 ORCHESTRATOR REVIEW (LOOP-BACK)")
        print("="*80)
        
        # Review the final report
        review = self.orchestrator.review_report(
            query=state["user_query"],
            research_plan=state["research_plan"],
            final_report=state["final_report"],
            iteration=state.get("iteration_count", 0)
        )
        
        print(f"\n✓ Review Complete")
        print(f"  Status: {review['status']}")
        print(f"  Quality Score: {review['quality_score']:.2f}/10")
        
        if review["needs_revision"]:
            print(f"  ⚠️  Needs Revision: {review['revision_reason']}")
            print(f"  📝 Instructions: {review['revision_instructions']}")
        else:
            print(f"  ✅ APPROVED!")
        
        # Increment iteration
        new_iteration = state.get("iteration_count", 0) + 1
        
        return {
            "review_result": review,
            "needs_revision": review["needs_revision"],
            "revision_instructions": review.get("revision_instructions", ""),
            "iteration_count": new_iteration
        }
    
    # =========================================================================
    # ROUTING LOGIC
    # =========================================================================
    
    def _route_to_agents(self, state: WorkflowState) -> str:
        """Route to next agent based on research plan"""
        research_plan = state.get("research_plan", {})
        assigned_agents = research_plan.get("assigned_agents", [])
        
        # Check which agents haven't been executed yet
        if "medical" in assigned_agents and not state.get("medical_output"):
            return "medical"
        elif "digital_health" in assigned_agents and not state.get("digital_health_output"):
            return "digital_health"
        elif "regulatory" in assigned_agents and not state.get("regulatory_output"):
            return "regulatory"
        else:
            return "aggregate"
    
    def _check_review_result(self, state: WorkflowState) -> Literal["approved", "revise", "replan"]:
        """Check if report is approved or needs revision"""
        review = state.get("review_result", {})
        iteration = state.get("iteration_count", 0)
        max_iterations = state.get("max_iterations", self.max_iterations)
        
        # Max iterations reached - force approval
        if iteration >= max_iterations:
            print(f"⚠️  Max iterations ({max_iterations}) reached. Approving report.")
            return "approved"
        
        # Check review status
        if not review.get("needs_revision", False):
            return "approved"
        
        # Determine if we need to revise or replan
        revision_type = review.get("revision_type", "minor")
        
        if revision_type == "major":
            print("🔄 Major revision needed - replanning research")
            return "replan"
        else:
            print("🔄 Minor revision needed - improving report")
            return "revise"
    
    # =========================================================================
    # HELPER METHODS
    # =========================================================================
    
    def _get_previous_outputs(self, state: WorkflowState) -> Dict:
        """Get previous outputs for revision"""
        return {
            "medical": state.get("medical_output"),
            "digital_health": state.get("digital_health_output"),
            "regulatory": state.get("regulatory_output"),
            "aggregated": state.get("aggregated_research"),
            "report": state.get("final_report"),
            "review": state.get("review_result")
        }
    
    def _get_agent_context(self, state: WorkflowState, agent_type: str) -> Dict:
        """Get relevant context for an agent"""
        return {
            "research_plan": state.get("research_plan"),
            "previous_work": self._get_previous_outputs(state),
            "iteration": state.get("iteration_count", 0)
        }
    
    # =========================================================================
    # PUBLIC INTERFACE
    # =========================================================================
    
    def research(self, user_query: str, enabled_agents: List[str] = None) -> Dict:
        """Execute complete research workflow with intelligent caching
        
        Args:
            user_query: The research query
            enabled_agents: List of enabled agent IDs (e.g., ['medical', 'digital', 'regulatory'])
                          If None or empty, all agents are enabled
        """
        print("\n" + "="*80)
        print("🚀 STARTING ENHANCED PHARMA INTELLIGENCE RESEARCH")
        print("="*80)
        print(f"Query: {user_query}")
        
        if enabled_agents:
            print(f"Enabled agents: {', '.join(enabled_agents)}")
        else:
            print("All agents enabled (default)")
        
        # Check cache first (COST OPTIMIZATION)
        print("\n🔍 Checking query cache...")
        cached_result = self.query_cache.get(user_query)
        
        if cached_result:
            cache_info = cached_result.get('_cache_info', {})
            hit_type = cache_info.get('hit_type', 'exact')
            
            if hit_type == 'exact':
                print("✅ CACHE HIT (Exact Match) - Returning cached results instantly!")
                print(f"   Previous hits: {cache_info.get('hit_count', 1)}")
            else:
                similarity = cache_info.get('similarity_score', 0)
                original_query = cache_info.get('original_query', '')
                print(f"✅ CACHE HIT (Similar: {similarity:.1%}) - Returning cached results instantly!")
                print(f"   Original query: {original_query[:80]}...")
                print(f"   Previous hits: {cache_info.get('hit_count', 1)}")
            
            # Show cache stats
            stats = self.query_cache.get_stats()
            print(f"   Cache hit rate: {stats['hit_rate']:.1%}")
            print(f"   Estimated cost saved: ${stats['estimated_cost_saved']:.2f}")
            print("="*80)
            
            return cached_result
        
        print("❌ CACHE MISS - Running full research workflow")
        print("   This will take 5-10 minutes...")
        print()
        
        # Initial state
        initial_state: WorkflowState = {
            "user_query": user_query,
            "research_plan": {},
            "medical_output": None,
            "digital_health_output": None,
            "regulatory_output": None,
            "aggregated_research": {},
            "final_report": "",
            "review_result": {},
            "needs_revision": False,
            "revision_instructions": "",
            "iteration_count": 0,
            "max_iterations": self.max_iterations,
            "messages": [HumanMessage(content=user_query)],
            "error": None,
            "enabled_agents": enabled_agents if enabled_agents else []  # List of enabled agent IDs from frontend
        }
        
        # Execute workflow
        try:
            result = self.graph.invoke(initial_state)
            
            print("\n" + "="*80)
            print("✅ RESEARCH COMPLETE")
            print("="*80)
            print(f"Total Iterations: {result['iteration_count']}")
            print(f"Final Review Score: {result['review_result'].get('quality_score', 0):.2f}/10")
            
            # Cache the result (COST OPTIMIZATION)
            # Estimate cost saved: ~$1.00 per query average
            print("\nCaching results for future queries...")
            try:
                self.query_cache.set(
                    query=user_query,
                    result=result,
                    cost_saved=1.00  # Average cost per query
                )
                print("Results cached successfully")
            except Exception as e:
                print(f"Warning: Failed to cache results: {str(e)}")
                print("Continuing without caching...")
            
            # Show updated cache stats
            stats = self.query_cache.get_stats()
            print(f"   Total cached queries: {stats['cached_queries']}")
            print(f"   Cache hit rate: {stats['hit_rate']:.1%}")
            print()
            
            return result
            
        except Exception as e:
            import traceback
            error_msg = str(e)
            traceback_str = traceback.format_exc()
            print(f"\n❌ Error: {error_msg}")
            print(f"Traceback:\n{traceback_str}")
            
            # Provide more helpful error messages
            if "api_key" in error_msg.lower() or "401" in error_msg or "invalid_api_key" in error_msg.lower():
                error_msg = "Invalid OpenAI API key. Please check your API key in Settings."
            elif "timeout" in error_msg.lower():
                error_msg = "Request timed out. Please try a more specific query."
            else:
                error_msg = f"Error: {error_msg}"
            
            return {
                "error": error_msg,
                "final_report": f"Research failed: {error_msg}"
            }


# =============================================================================
# EXAMPLE USAGE
# =============================================================================

if __name__ == "__main__":
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    # Initialize orchestrator
    orchestrator = EnhancedPharmaIntelligenceOrchestrator(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
        pinecone_api_key=os.getenv("PINECONE_API_KEY"),
        pinecone_index_name=os.getenv("PINECONE_INDEX_NAME", "pharma-intelligence"),
        max_iterations=1  # No loop-back review - faster execution
    )
    
    # Example research query
    result = orchestrator.research(
        "What are the latest FDA-approved GLP-1 receptor agonists for diabetes, "
        "their clinical trial results, digital health monitoring solutions, "
        "and regulatory pathways?"
    )
    
    # Display final report
    print("\n" + "="*80)
    print("📄 FINAL REPORT")
    print("="*80)
    print(result["final_report"])
