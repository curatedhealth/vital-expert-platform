"""
VITAL Platform - Complete Token Tracking Implementation
LangChain + LangSmith + LangGraph Integration

Supports all 4 service types:
1. 1:1 Conversations
2. Virtual Panels / Advisory Boards
3. Orchestrated Workflows (LangGraph)
4. Solution Builder (Multi-workflow)

Installation:
pip install langchain-anthropic langchain-openai langchain-core langgraph supabase python-dotenv langsmith

Environment variables (.env):
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
LANGCHAIN_API_KEY=your_langsmith_key  # Optional
LANGCHAIN_TRACING_V2=true              # Optional
"""

from langchain.callbacks.base import BaseCallbackHandler
from langchain_core.tracers import LangChainTracer
from typing import Any, Dict, List, Optional, TypedDict
from supabase import create_client, Client
from datetime import datetime
from langgraph.graph import StateGraph, END
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

# ============================================
# CORE TRACKER
# ============================================

class VITALLangChainTracker(BaseCallbackHandler):
    """
    Production-ready tracker for all VITAL services
    Integrates with LangChain, LangSmith, LangGraph
    """
    
    PRICING = {
        'anthropic': {
            'claude-sonnet-4-20250514': {'input': 0.003, 'output': 0.015},
            'claude-haiku-4-20250514': {'input': 0.001, 'output': 0.005},
        },
        'openai': {
            'gpt-4o': {'input': 0.0025, 'output': 0.01},
            'gpt-4o-mini': {'input': 0.00015, 'output': 0.0006},
        }
    }
    
    def __init__(
        self,
        # Service context
        service_type: str,
        service_id: str,
        
        # Agent context
        agent_id: str,
        agent_name: str,
        agent_tier: int,
        agent_role: Optional[str] = None,
        
        # Workflow context
        workflow_id: Optional[str] = None,
        workflow_name: Optional[str] = None,
        workflow_step: Optional[int] = None,
        workflow_step_name: Optional[str] = None,
        parent_workflow_id: Optional[str] = None,
        
        # Panel context
        panel_id: Optional[str] = None,
        panel_name: Optional[str] = None,
        panel_member_position: Optional[int] = None,
        total_panel_members: Optional[int] = None,
        
        # User context
        user_id: str,
        session_id: str,
        organization_id: Optional[str] = None,
        
        # Config
        supabase_client: Optional[Client] = None,
        budget_limits: Optional[Dict] = None,
        debug: bool = False
    ):
        # Store all context
        self.service_type = service_type
        self.service_id = service_id
        self.agent_id = agent_id
        self.agent_name = agent_name
        self.agent_tier = agent_tier
        self.agent_role = agent_role
        
        self.workflow_id = workflow_id
        self.workflow_name = workflow_name
        self.workflow_step = workflow_step
        self.workflow_step_name = workflow_step_name
        self.parent_workflow_id = parent_workflow_id
        
        self.panel_id = panel_id
        self.panel_name = panel_name
        self.panel_member_position = panel_member_position
        self.total_panel_members = total_panel_members
        
        self.user_id = user_id
        self.session_id = session_id
        self.organization_id = organization_id
        
        self.budget_limits = budget_limits or {}
        self.debug = debug
        
        # Supabase
        if supabase_client:
            self.supabase = supabase_client
        else:
            url = os.environ.get("SUPABASE_URL")
            key = os.environ.get("SUPABASE_SERVICE_KEY")
            if not url or not key:
                raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY required")
            self.supabase = create_client(url, key)
        
        # LangSmith
        self.langsmith_run_id = None
        self.langsmith_trace_id = None
        
        # Current request
        self.current_request = {
            'start_time': None,
            'provider': None,
            'model': None,
            'prompt_tokens': 0
        }
    
    def on_llm_start(self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any) -> None:
        """LLM start"""
        self.current_request['start_time'] = datetime.now()
        
        # Extract LangSmith IDs
        run_id = kwargs.get('run_id')
        if run_id:
            self.langsmith_run_id = str(run_id)
        
        parent_run_id = kwargs.get('parent_run_id')
        if parent_run_id:
            self.langsmith_trace_id = str(parent_run_id)
        
        # Detect provider
        invocation_params = kwargs.get('invocation_params', {})
        model_id = serialized.get('id', [])
        
        if 'anthropic' in str(model_id).lower():
            self.current_request['provider'] = 'anthropic'
        elif 'azure' in str(model_id).lower():
            self.current_request['provider'] = 'azure_openai'
        elif 'openai' in str(model_id).lower():
            self.current_request['provider'] = 'openai'
        else:
            self.current_request['provider'] = 'unknown'
        
        self.current_request['model'] = (
            invocation_params.get('model') or 
            invocation_params.get('model_name') or 
            'unknown'
        )
        
        self.current_request['prompt_tokens'] = sum(len(p.split()) * 1.3 for p in prompts)
        
        if self.debug:
            print(f"[VITAL] {self.service_type} - {self.agent_name} starting...")
    
    def on_llm_end(self, response: Any, **kwargs: Any) -> None:
        """LLM end"""
        end_time = datetime.now()
        latency_ms = int((end_time - self.current_request['start_time']).total_seconds() * 1000)
        
        # Extract tokens
        if hasattr(response, 'llm_output') and response.llm_output:
            token_usage = response.llm_output.get('token_usage', {})
            prompt_tokens = token_usage.get('prompt_tokens', self.current_request['prompt_tokens'])
            completion_tokens = token_usage.get('completion_tokens', 0)
        else:
            prompt_tokens = int(self.current_request['prompt_tokens'])
            completion_tokens = int(len(str(response).split()) * 1.3)
        
        # Calculate cost
        input_cost, output_cost = self._calculate_cost(
            self.current_request['provider'],
            self.current_request['model'],
            prompt_tokens,
            completion_tokens
        )
        
        total_cost = input_cost + output_cost
        
        # Budget check
        self._check_budget(total_cost)
        
        # Log
        self._log_usage(
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            input_cost=input_cost,
            output_cost=output_cost,
            latency_ms=latency_ms,
            success=True
        )
        
        if self.debug:
            print(f"[VITAL] {self.agent_name}: {prompt_tokens + completion_tokens} tokens, ${total_cost:.6f}")
    
    def on_llm_error(self, error: Exception, **kwargs: Any) -> None:
        """LLM error"""
        self._log_usage(
            prompt_tokens=int(self.current_request['prompt_tokens']),
            completion_tokens=0,
            input_cost=0,
            output_cost=0,
            latency_ms=0,
            success=False,
            error_code=type(error).__name__,
            error_message=str(error)
        )
    
    def _calculate_cost(self, provider: str, model: str, prompt_tokens: int, completion_tokens: int) -> tuple[float, float]:
        """Calculate cost"""
        if provider in self.PRICING and model in self.PRICING[provider]:
            pricing = self.PRICING[provider][model]
        else:
            pricing = {'input': 0.01, 'output': 0.03}
        
        input_cost = (prompt_tokens / 1000) * pricing['input']
        output_cost = (completion_tokens / 1000) * pricing['output']
        return (input_cost, output_cost)
    
    def _check_budget(self, cost: float) -> None:
        """Check budget"""
        try:
            spending = self._get_current_spending()
            
            if 'session' in self.budget_limits:
                if spending['session'] + cost > self.budget_limits['session']:
                    raise BudgetExceededError(f"Session budget exceeded")
            
            if 'daily' in self.budget_limits:
                if spending['daily'] + cost > self.budget_limits['daily']:
                    raise BudgetExceededError(f"Daily budget exceeded")
        except BudgetExceededError:
            raise
        except Exception as e:
            if self.debug:
                print(f"[VITAL] Budget check failed: {e}")
    
    def _get_current_spending(self) -> Dict[str, float]:
        """Get spending"""
        try:
            session_result = self.supabase.table('token_usage_logs')\
                .select('total_cost')\
                .eq('session_id', self.session_id)\
                .execute()
            
            session_total = sum(row['total_cost'] for row in session_result.data) if session_result.data else 0
            
            daily_result = self.supabase.table('token_usage_logs')\
                .select('total_cost')\
                .eq('user_id', self.user_id)\
                .gte('created_at', datetime.now().date().isoformat())\
                .execute()
            
            daily_total = sum(row['total_cost'] for row in daily_result.data) if daily_result.data else 0
            
            return {'session': session_total, 'daily': daily_total}
        except:
            return {'session': 0, 'daily': 0}
    
    def _log_usage(
        self,
        prompt_tokens: int,
        completion_tokens: int,
        input_cost: float,
        output_cost: float,
        latency_ms: int,
        success: bool,
        error_code: Optional[str] = None,
        error_message: Optional[str] = None
    ) -> None:
        """Log to Supabase"""
        try:
            log_data = {
                'id': str(uuid.uuid4()),
                'created_at': datetime.now().isoformat(),
                'service_type': self.service_type,
                'service_id': self.service_id,
                'agent_id': self.agent_id,
                'agent_name': self.agent_name,
                'agent_tier': self.agent_tier,
                'agent_role': self.agent_role,
                'workflow_id': self.workflow_id,
                'workflow_name': self.workflow_name,
                'workflow_step': self.workflow_step,
                'workflow_step_name': self.workflow_step_name,
                'parent_workflow_id': self.parent_workflow_id,
                'panel_id': self.panel_id,
                'panel_name': self.panel_name,
                'panel_member_position': self.panel_member_position,
                'total_panel_members': self.total_panel_members,
                'user_id': self.user_id,
                'session_id': self.session_id,
                'organization_id': self.organization_id,
                'langsmith_run_id': self.langsmith_run_id,
                'langsmith_trace_id': self.langsmith_trace_id,
                'provider': self.current_request['provider'],
                'model_name': self.current_request['model'],
                'prompt_tokens': prompt_tokens,
                'completion_tokens': completion_tokens,
                'input_cost': float(input_cost),
                'output_cost': float(output_cost),
                'latency_ms': latency_ms,
                'success': success,
                'error_code': error_code,
                'error_message': error_message
            }
            
            self.supabase.table('token_usage_logs').insert(log_data).execute()
        except Exception as e:
            if self.debug:
                print(f"[VITAL] Failed to log: {e}")


class BudgetExceededError(Exception):
    """Budget exceeded"""
    pass


# ============================================
# SERVICE 1: 1:1 CONVERSATIONS
# ============================================

from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage

class OneToOneConversation:
    """1:1 agent conversation service"""
    
    def __init__(self, user_id: str, session_id: str):
        self.user_id = user_id
        self.session_id = session_id
        self.service_id = f"1:1_{uuid.uuid4().hex[:8]}"
    
    def chat(self, agent_config: dict, message: str):
        """Chat with agent"""
        tracker = VITALLangChainTracker(
            service_type='1:1_conversation',
            service_id=self.service_id,
            agent_id=agent_config['id'],
            agent_name=agent_config['name'],
            agent_tier=agent_config['tier'],
            agent_role='direct_conversation',
            user_id=self.user_id,
            session_id=self.session_id,
            budget_limits={'session': 0.50, 'daily': 2.00}
        )
        
        llm = ChatAnthropic(
            model=agent_config.get('model', 'claude-sonnet-4-20250514'),
            callbacks=[tracker]
        )
        
        response = llm.invoke([HumanMessage(content=message)])
        return response.content


# ============================================
# SERVICE 2: VIRTUAL PANELS
# ============================================

class VirtualAdvisoryPanel:
    """Virtual panel / advisory board service"""
    
    def __init__(self, user_id: str, session_id: str, panel_name: str):
        self.user_id = user_id
        self.session_id = session_id
        self.panel_name = panel_name
        self.panel_id = f"panel_{uuid.uuid4().hex[:8]}"
    
    def convene(self, panel_members: List[dict], question: str) -> List[dict]:
        """Get perspectives from all panel members"""
        responses = []
        total_members = len(panel_members)
        
        for idx, member in enumerate(panel_members, 1):
            tracker = VITALLangChainTracker(
                service_type='virtual_panel',
                service_id=self.panel_id,
                agent_id=member['id'],
                agent_name=member['name'],
                agent_tier=member['tier'],
                agent_role='panel_member',
                panel_id=self.panel_id,
                panel_name=self.panel_name,
                panel_member_position=idx,
                total_panel_members=total_members,
                user_id=self.user_id,
                session_id=self.session_id,
                budget_limits={'session': 2.00}
            )
            
            if member['tier'] == 1:
                llm = ChatAnthropic(model='claude-sonnet-4-20250514', callbacks=[tracker])
            else:
                llm = ChatOpenAI(model='gpt-4o', callbacks=[tracker])
            
            prompt = f"As a {member['expertise']} expert, provide your perspective on: {question}"
            response = llm.invoke([HumanMessage(content=prompt)])
            
            responses.append({
                'member': member['name'],
                'expertise': member['expertise'],
                'response': response.content
            })
        
        return responses


# ============================================
# SERVICE 3: WORKFLOWS (LANGGRAPH)
# ============================================

class WorkflowState(TypedDict):
    """LangGraph workflow state"""
    input: str
    market_research: str
    competitive_analysis: str
    strategic_imperatives: str

class OrchestatedWorkflow:
    """Multi-agent workflow using LangGraph"""
    
    def __init__(self, user_id: str, session_id: str, workflow_name: str):
        self.user_id = user_id
        self.session_id = session_id
        self.workflow_name = workflow_name
        self.workflow_id = f"wf_{uuid.uuid4().hex[:8]}"
    
    def _create_tracker(self, agent_config: dict, step: int, step_name: str):
        """Create tracker for workflow step"""
        return VITALLangChainTracker(
            service_type='workflow',
            service_id=self.workflow_id,
            agent_id=agent_config['id'],
            agent_name=agent_config['name'],
            agent_tier=agent_config['tier'],
            agent_role='workflow_step',
            workflow_id=self.workflow_id,
            workflow_name=self.workflow_name,
            workflow_step=step,
            workflow_step_name=step_name,
            user_id=self.user_id,
            session_id=self.session_id,
            budget_limits={'session': 3.00}
        )
    
    def build_graph(self):
        """Build LangGraph workflow"""
        workflow = StateGraph(WorkflowState)
        
        def market_research_step(state):
            tracker = self._create_tracker(
                {'id': 'market_research_001', 'name': 'Market Research', 'tier': 2},
                step=1, step_name='market_research'
            )
            llm = ChatAnthropic(model='claude-haiku-4-20250514', callbacks=[tracker])
            response = llm.invoke([HumanMessage(content=f"Research: {state['input']}")])
            return {'market_research': response.content}
        
        def competitive_analysis_step(state):
            tracker = self._create_tracker(
                {'id': 'competitive_001', 'name': 'Competitive Analysis', 'tier': 1},
                step=2, step_name='competitive_analysis'
            )
            llm = ChatAnthropic(model='claude-sonnet-4-20250514', callbacks=[tracker])
            response = llm.invoke([HumanMessage(content=f"Analyze: {state['market_research']}")])
            return {'competitive_analysis': response.content}
        
        def strategic_imperatives_step(state):
            tracker = self._create_tracker(
                {'id': 'strategy_001', 'name': 'Strategic Planning', 'tier': 1},
                step=3, step_name='strategic_imperatives'
            )
            llm = ChatAnthropic(model='claude-sonnet-4-20250514', callbacks=[tracker])
            response = llm.invoke([HumanMessage(content=f"Strategy from: {state['competitive_analysis']}")])
            return {'strategic_imperatives': response.content}
        
        workflow.add_node("market_research", market_research_step)
        workflow.add_node("competitive_analysis", competitive_analysis_step)
        workflow.add_node("strategic_imperatives", strategic_imperatives_step)
        
        workflow.set_entry_point("market_research")
        workflow.add_edge("market_research", "competitive_analysis")
        workflow.add_edge("competitive_analysis", "strategic_imperatives")
        workflow.add_edge("strategic_imperatives", END)
        
        return workflow.compile()
    
    def execute(self, input_prompt: str):
        """Execute workflow"""
        graph = self.build_graph()
        result = graph.invoke({
            'input': input_prompt,
            'market_research': '',
            'competitive_analysis': '',
            'strategic_imperatives': ''
        })
        return result


# ============================================
# SERVICE 4: SOLUTION BUILDER
# ============================================

class SolutionBuilder:
    """Multi-workflow solution builder (e.g., Brand Plan)"""
    
    def __init__(self, user_id: str, session_id: str, solution_name: str):
        self.user_id = user_id
        self.session_id = session_id
        self.solution_name = solution_name
        self.solution_id = f"sol_{uuid.uuid4().hex[:8]}"
    
    def build_brand_plan(self, product_info: dict):
        """Build complete brand plan from multiple workflows"""
        
        # Workflow 1: Market Research
        wf1 = OrchestatedWorkflow(self.user_id, self.session_id, "Market Research")
        market = wf1.execute(f"Market analysis for {product_info['name']}")
        
        # Workflow 2: Strategic Planning
        wf2 = OrchestatedWorkflow(self.user_id, self.session_id, "Strategic Planning")
        strategy = wf2.execute(f"Strategy for {product_info['name']}")
        
        # Workflow 3: Tactical Execution
        wf3 = OrchestatedWorkflow(self.user_id, self.session_id, "Tactical Execution")
        tactics = wf3.execute(f"Tactics for {product_info['name']}")
        
        # Synthesis
        tracker = VITALLangChainTracker(
            service_type='solution_builder',
            service_id=self.solution_id,
            agent_id='synthesizer_001',
            agent_name='Brand Plan Synthesizer',
            agent_tier=1,
            agent_role='solution_synthesizer',
            workflow_id=self.solution_id,
            workflow_name=self.solution_name,
            workflow_step=4,
            workflow_step_name='synthesis',
            user_id=self.user_id,
            session_id=self.session_id,
            budget_limits={'session': 5.00}
        )
        
        llm = ChatAnthropic(model='claude-sonnet-4-20250514', callbacks=[tracker])
        
        synthesis = llm.invoke([HumanMessage(content=f"""
        Create comprehensive brand plan from:
        Market: {market['strategic_imperatives']}
        Strategy: {strategy['strategic_imperatives']}
        Tactics: {tactics['strategic_imperatives']}
        """)])
        
        return {
            'market_research': market,
            'strategy': strategy,
            'tactics': tactics,
            'brand_plan': synthesis.content,
            'solution_id': self.solution_id
        }


# ============================================
# USAGE EXAMPLES
# ============================================

if __name__ == "__main__":
    user_id = "550e8400-e29b-41d4-a716-446655440000"
    session_id = f"session_{uuid.uuid4().hex[:8]}"
    
    print("VITAL Token Tracking - All Services Demo\n")
    
    # 1:1 Conversation
    print("=== 1:1 Conversation ===")
    conversation = OneToOneConversation(user_id, session_id)
    agent = {
        'id': 'regulatory_001',
        'name': 'Regulatory Strategy Agent',
        'tier': 1,
        'model': 'claude-sonnet-4-20250514'
    }
    # result = conversation.chat(agent, "What's the FDA pathway?")
    # print(f"Result: {result[:100]}...\n")
    
    # Virtual Panel
    print("=== Virtual Panel ===")
    panel = VirtualAdvisoryPanel(user_id, session_id, "Launch Advisory Board")
    members = [
        {'id': 'kol_001', 'name': 'KOL Expert', 'tier': 1, 'expertise': 'Oncology'},
        {'id': 'payer_001', 'name': 'Payer Expert', 'tier': 1, 'expertise': 'Market Access'}
    ]
    # insights = panel.convene(members, "Key launch success factors?")
    # print(f"Panel convened: {len(insights)} perspectives\n")
    
    # Workflow
    print("=== Orchestrated Workflow ===")
    workflow = OrchestatedWorkflow(user_id, session_id, "Market Research Workflow")
    # result = workflow.execute("Oncology launch EU Q1 2026")
    # print(f"Workflow complete\n")
    
    # Solution Builder
    print("=== Solution Builder ===")
    builder = SolutionBuilder(user_id, session_id, "Complete Brand Plan")
    # brand_plan = builder.build_brand_plan({
    #     'name': 'OncoRx-500',
    #     'indication': 'Breast Cancer'
    # })
    # print(f"Brand plan created: {brand_plan['solution_id']}\n")
    
    print("All services ready! Uncomment examples to test.")
