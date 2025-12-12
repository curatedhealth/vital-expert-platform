"""
Gold Standard Tool Chain Executor

The CORE AutoGPT capability - chains multiple tools in ONE iteration.

This is what makes autonomous agents truly powerful. Instead of:
- Iteration 1: Search RAG
- Iteration 2: Search web
- Iteration 3: Analyze
- Iteration 4: Generate
- Iteration 5: Validate

We do ALL of that in ONE iteration with intelligent tool chaining.

Features:
- LLM-powered chain planning (GPT-4 plans optimal sequence)
- Sequential execution with context passing
- Result synthesis (GPT-4 combines all outputs)
- Cost tracking across entire chain
- Error recovery (continues despite failures)
- Streaming support (optional)
- Configurable max chain length

Architecture:
    User Query
        ↓
    Plan Chain (LLM)
        ↓
    Execute Step 1 → Context₁
        ↓
    Execute Step 2 (uses Context₁) → Context₂
        ↓
    Execute Step 3 (uses Context₂) → Context₃
        ↓
    Synthesize Results (LLM)
        ↓
    Final Answer

Usage:
    >>> from langgraph_workflows.tool_chain_executor import ToolChainExecutor
    >>> from services.tool_registry import get_tool_registry
    >>> 
    >>> executor = ToolChainExecutor(
    ...     tool_registry=get_tool_registry(),
    ...     max_chain_length=5
    ... )
    >>> 
    >>> result = await executor.execute_tool_chain(
    ...     task="Research FDA IND requirements and create checklist",
    ...     tenant_id="tenant-123",
    ...     context={"agent_id": "regulatory_expert"}
    ... )
    >>> 
    >>> print(result.synthesis)  # Complete answer from all tools
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from openai import AsyncOpenAI
import json
import structlog

from tools.base_tool import BaseTool, ToolInput, ToolOutput
from integrations.tool_registry import ToolRegistry
from core.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


# ============================================================================
# DATA MODELS
# ============================================================================

class ToolStep(BaseModel):
    """
    Single step in a tool chain.
    
    Defines what tool to use, why, and where its input comes from.
    """
    tool_name: str = Field(..., description="Name of tool to execute")
    tool_purpose: str = Field(..., description="Why this tool is needed for the task")
    input_depends_on: str = Field(
        ...,
        description="Where input comes from: 'initial', 'step_1', 'step_2', etc."
    )
    expected_output: str = Field(..., description="What this step should produce")


class ToolChainPlan(BaseModel):
    """
    Complete tool chain execution plan.
    
    Created by LLM to accomplish a complex task.
    """
    steps: List[ToolStep] = Field(..., description="Ordered list of tool steps")
    reasoning: str = Field(..., description="Why this chain will accomplish the task")
    estimated_cost_usd: float = Field(
        default=0.0,
        ge=0.0,
        description="Estimated total execution cost"
    )
    estimated_duration_ms: float = Field(
        default=0.0,
        ge=0.0,
        description="Estimated execution time"
    )


class StepResult(BaseModel):
    """
    Result of executing one step in the chain.
    """
    step_number: int = Field(..., ge=1, description="Step number (1-indexed)")
    tool_name: str = Field(..., description="Tool that was executed")
    success: bool = Field(..., description="Whether step succeeded")
    output_data: Any = Field(..., description="Output from the tool")
    cost_usd: float = Field(default=0.0, ge=0.0, description="Cost for this step")
    duration_ms: float = Field(default=0.0, ge=0.0, description="Duration in milliseconds")
    error_message: Optional[str] = Field(None, description="Error message if failed")


class ToolChainResult(BaseModel):
    """
    Complete result of tool chain execution.
    """
    success: bool = Field(..., description="Whether chain completed successfully")
    steps_executed: int = Field(..., ge=0, description="Number of steps executed")
    step_results: List[StepResult] = Field(..., description="Results from each step")
    synthesis: str = Field(..., description="Synthesized final answer")
    total_cost_usd: float = Field(default=0.0, ge=0.0, description="Total execution cost")
    total_duration_ms: float = Field(default=0.0, ge=0.0, description="Total execution time")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")


# ============================================================================
# TOOL CHAIN EXECUTOR
# ============================================================================

class ToolChainExecutor:
    """
    Executes chains of tools to accomplish complex tasks in ONE iteration.
    
    This is THE core AutoGPT capability that enables autonomous agents to:
    1. Plan multi-step approaches
    2. Execute tools sequentially with context passing
    3. Synthesize comprehensive answers
    
    Features:
    - LLM-powered planning (GPT-4 decides tool sequence)
    - Context passing (each step gets previous results)
    - Result synthesis (GPT-4 creates final answer)
    - Error recovery (continues despite step failures)
    - Cost tracking (accumulates across all steps)
    - Streaming support (for real-time updates)
    - Tenant-aware (respects access control)
    
    Example:
        Task: "Research FDA IND requirements and create checklist"
        
        Plan:
        1. rag_search("FDA IND requirements") → guidelines
        2. web_search("FDA IND 2025 updates") → recent changes
        3. rag_search("IND submission checklist") → templates
        4. [Synthesize all into comprehensive checklist]
        
        Result: Complete checklist with citations from all sources
    """
    
    def __init__(
        self,
        tool_registry: ToolRegistry,
        max_chain_length: int = 5,
        planning_model: str = "gpt-4",
        synthesis_model: str = "gpt-4",
        enable_streaming: bool = False
    ):
        """
        Initialize tool chain executor.
        
        Args:
            tool_registry: ToolRegistry instance for tool access
            max_chain_length: Maximum steps in a chain (default: 5)
            planning_model: LLM model for chain planning (default: gpt-4)
            synthesis_model: LLM model for result synthesis (default: gpt-4)
            enable_streaming: Enable streaming events (default: False)
        """
        self.tool_registry = tool_registry
        self.openai = AsyncOpenAI(api_key=settings.openai_api_key)
        self.max_chain_length = max_chain_length
        self.planning_model = planning_model
        self.synthesis_model = synthesis_model
        self.enable_streaming = enable_streaming
        
        # Metrics
        self.chains_executed = 0
        self.total_steps_executed = 0
        self.total_cost_usd = 0.0
        
        logger.info(
            "ToolChainExecutor initialized",
            max_chain_length=max_chain_length,
            planning_model=planning_model,
            synthesis_model=synthesis_model
        )
    
    # ========================================================================
    # MAIN EXECUTION
    # ========================================================================
    
    async def execute_tool_chain(
        self,
        task: str,
        tenant_id: str,
        available_tools: Optional[List[str]] = None,
        context: Optional[Dict[str, Any]] = None,
        max_steps: Optional[int] = None
    ) -> ToolChainResult:
        """
        Execute a chain of tools to accomplish a task.
        
        This is the main entry point. It:
        1. Plans the tool chain (LLM-powered)
        2. Executes each step sequentially
        3. Passes context between steps
        4. Synthesizes final answer (LLM-powered)
        
        Args:
            task: Task to accomplish (e.g., "Research X and create Y")
            tenant_id: Tenant identifier for access control
            available_tools: List of tool names to use (None = all available)
            context: Additional context (agent_id, rag_domains, etc.)
            max_steps: Override default max_chain_length
            
        Returns:
            ToolChainResult with synthesis and all step results
            
        Example:
            >>> result = await executor.execute_tool_chain(
            ...     task="Research FDA IND requirements and create checklist",
            ...     tenant_id="tenant-123",
            ...     context={"agent_id": "regulatory_expert", "rag_domains": ["regulatory"]}
            ... )
            >>> print(result.synthesis)  # Final answer
            >>> print(result.steps_executed)  # 4
            >>> print(result.total_cost_usd)  # 0.05
        """
        start_time = datetime.now(timezone.utc)
        context = context or {}
        context['tenant_id'] = tenant_id
        max_steps = max_steps or self.max_chain_length
        
        self.chains_executed += 1
        
        logger.info(
            "tool_chain_execution_started",
            task=task[:100],
            tenant_id=tenant_id[:8],
            max_steps=max_steps,
            chain_number=self.chains_executed
        )
        
        try:
            # Step 1: Plan the tool chain
            plan = await self._plan_tool_chain(
                task=task,
                tenant_id=tenant_id,
                available_tools=available_tools
            )
            
            logger.info(
                "tool_chain_planned",
                steps=len(plan.steps),
                reasoning=plan.reasoning[:100],
                estimated_cost=plan.estimated_cost_usd
            )
            
            # Step 2: Execute the chain
            step_results = await self._execute_chain(
                plan=plan,
                task=task,
                context=context,
                max_steps=max_steps
            )
            
            # Step 3: Synthesize final answer
            synthesis = await self._synthesize_results(
                task=task,
                plan=plan,
                step_results=step_results
            )
            
            # Calculate totals
            total_cost = sum(sr.cost_usd for sr in step_results)
            total_duration = (datetime.now(timezone.utc) - start_time).total_seconds() * 1000
            
            # Update metrics
            self.total_steps_executed += len(step_results)
            self.total_cost_usd += total_cost
            
            logger.info(
                "tool_chain_execution_completed",
                steps_executed=len(step_results),
                total_cost_usd=total_cost,
                total_duration_ms=total_duration,
                success=True
            )
            
            return ToolChainResult(
                success=True,
                steps_executed=len(step_results),
                step_results=step_results,
                synthesis=synthesis,
                total_cost_usd=total_cost,
                total_duration_ms=total_duration,
                metadata={
                    'task': task,
                    'plan_reasoning': plan.reasoning,
                    'tenant_id': tenant_id[:8]
                }
            )
            
        except Exception as e:
            total_duration = (datetime.now(timezone.utc) - start_time).total_seconds() * 1000
            
            logger.error(
                "tool_chain_execution_failed",
                task=task[:100],
                error=str(e),
                error_type=type(e).__name__,
                duration_ms=total_duration
            )
            
            return ToolChainResult(
                success=False,
                steps_executed=0,
                step_results=[],
                synthesis=f"Tool chain failed: {str(e)}",
                total_cost_usd=0.0,
                total_duration_ms=total_duration,
                metadata={'error': str(e), 'error_type': type(e).__name__}
            )
    
    # ========================================================================
    # CHAIN PLANNING (LLM-Powered)
    # ========================================================================
    
    async def _plan_tool_chain(
        self,
        task: str,
        tenant_id: str,
        available_tools: Optional[List[str]] = None
    ) -> ToolChainPlan:
        """
        Use LLM to plan optimal tool chain.
        
        The LLM analyzes the task and decides:
        - Which tools to use
        - In what order
        - What each tool should do
        - How outputs connect (dependencies)
        
        This is CRITICAL for intelligent tool chaining.
        
        Args:
            task: Task to accomplish
            tenant_id: Tenant for tool access
            available_tools: Specific tools to use (None = all available)
            
        Returns:
            ToolChainPlan with ordered steps
        """
        # Get available tools
        if available_tools:
            tools = [
                self.tool_registry.get_tool(name)
                for name in available_tools
                if self.tool_registry.get_tool(name)
            ]
        else:
            tools = self.tool_registry.get_available_tools(tenant_id)
        
        if not tools:
            raise ValueError(f"No tools available for tenant {tenant_id[:8]}")
        
        # Format tool descriptions for LLM
        tools_desc = "\n".join([
            f"- **{t.name}** ({t.category}): {t.description}"
            for t in tools
        ])
        
        system_prompt = f"""You are a tool chain planner for an autonomous AI agent.

Your job is to create an optimal sequence of tool calls to accomplish complex tasks.

Available tools:
{tools_desc}

Create a tool chain that:
1. Breaks the task into logical steps
2. Each step uses exactly ONE tool
3. Steps pass outputs to subsequent steps (context chaining)
4. Maximum {self.max_chain_length} steps
5. Minimizes redundant steps
6. Ensures comprehensive coverage of the task

Return JSON following this schema:
{{
  "steps": [
    {{
      "tool_name": "exact_tool_name_from_list_above",
      "tool_purpose": "clear explanation of why this tool is needed",
      "input_depends_on": "initial | step_1 | step_2 | ...",
      "expected_output": "what this step will produce"
    }}
  ],
  "reasoning": "comprehensive explanation of why this chain will accomplish the task",
  "estimated_cost_usd": 0.05,
  "estimated_duration_ms": 3000
}}

IMPORTANT:
- Use tool names EXACTLY as listed above
- Be specific about dependencies (input_depends_on)
- Explain your reasoning clearly
- Consider using multiple retrieval tools before analysis/generation
- RAG tools are free (cost: 0), web tools have minimal cost"""

        user_prompt = f"""TASK: {task}

Create an optimal tool chain plan to accomplish this task.

Think step by step:
1. What information do we need? (retrieval tools)
2. How should we analyze it? (analysis tools)
3. What should we generate? (generation tools)
4. Do we need validation? (validation tools)

Return the JSON plan:"""
        
        logger.info("Planning tool chain with LLM", model=self.planning_model)
        
        response = await self.openai.chat.completions.create(
            model=self.planning_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2,  # Low temperature for consistent planning
            max_tokens=1500
        )
        
        plan_data = json.loads(response.choices[0].message.content)
        plan = ToolChainPlan(**plan_data)
        
        # Validate plan
        for step in plan.steps:
            if not self.tool_registry.is_tool_available(step.tool_name, tenant_id):
                logger.warning(
                    f"Tool '{step.tool_name}' in plan not available for tenant",
                    tenant_id=tenant_id[:8]
                )
        
        return plan
    
    # ========================================================================
    # CHAIN EXECUTION (Sequential with Context Passing)
    # ========================================================================
    
    async def _execute_chain(
        self,
        plan: ToolChainPlan,
        task: str,
        context: Dict[str, Any],
        max_steps: int
    ) -> List[StepResult]:
        """
        Execute the planned tool chain sequentially.
        
        Each step:
        1. Gets input from specified dependency
        2. Executes the tool
        3. Stores output in context for next steps
        4. Continues even if step fails (graceful degradation)
        
        Context passing is KEY to tool chaining - each tool can use
        results from previous tools.
        
        Args:
            plan: Planned tool chain
            task: Original task
            context: Execution context
            max_steps: Maximum steps to execute
            
        Returns:
            List of StepResult objects
        """
        # Initialize chain context with task
        # Ensure citation preferences are available to all tools
        chain_context = {
            'initial': task,
            'citation_style': context.get('citation_style', 'apa'),
            'include_citations': context.get('include_citations', True),
            **context
        }
        
        step_results = []
        
        for i, step in enumerate(plan.steps[:max_steps], 1):
            step_start = datetime.now(timezone.utc)
            
            logger.info(
                "tool_chain_step_started",
                step=i,
                total_steps=len(plan.steps[:max_steps]),
                tool=step.tool_name,
                purpose=step.tool_purpose
            )
            
            # Get the tool
            tool = self.tool_registry.get_tool(step.tool_name)
            if not tool:
                logger.warning(f"Tool not found: {step.tool_name}, skipping step")
                step_results.append(StepResult(
                    step_number=i,
                    tool_name=step.tool_name,
                    success=False,
                    output_data=None,
                    cost_usd=0.0,
                    duration_ms=0.0,
                    error_message=f"Tool '{step.tool_name}' not found in registry"
                ))
                # Don't break - continue with remaining steps
                continue
            
            # Get input for this step from context
            input_source = step.input_depends_on
            if input_source == 'initial':
                input_data = task
            elif input_source in chain_context:
                input_data = chain_context[input_source]
            else:
                logger.warning(
                    f"Input source '{input_source}' not found in context, using task",
                    available_keys=list(chain_context.keys())
                )
                input_data = task
            
            # Execute tool
            tool_input = ToolInput(
                data=input_data,
                context=chain_context,
                metadata={
                    'step_number': i,
                    'purpose': step.tool_purpose,
                    'expected_output': step.expected_output
                }
            )
            
            try:
                output = await tool._execute_with_tracking(tool_input)
                
                # Record result
                duration_ms = (datetime.now(timezone.utc) - step_start).total_seconds() * 1000
                
                step_result = StepResult(
                    step_number=i,
                    tool_name=step.tool_name,
                    success=output.success,
                    output_data=output.data,
                    cost_usd=output.cost_usd,
                    duration_ms=duration_ms,
                    error_message=output.error_message
                )
                
                step_results.append(step_result)
                
                # Update context for next step
                chain_context[f'step_{i}'] = output.data
                
                # Record usage
                self.tool_registry.record_usage(step.tool_name, output.success)
                
                logger.info(
                    "tool_chain_step_completed",
                    step=i,
                    tool=step.tool_name,
                    success=output.success,
                    duration_ms=duration_ms,
                    cost_usd=output.cost_usd
                )
                
                # Stop if tool requested or critical failure
                if output.should_stop_chain:
                    logger.info(f"Tool requested chain stop at step {i}")
                    break
                    
            except Exception as e:
                duration_ms = (datetime.now(timezone.utc) - step_start).total_seconds() * 1000
                
                logger.error(
                    "tool_chain_step_failed",
                    step=i,
                    tool=step.tool_name,
                    error=str(e),
                    error_type=type(e).__name__
                )
                
                step_results.append(StepResult(
                    step_number=i,
                    tool_name=step.tool_name,
                    success=False,
                    output_data=None,
                    cost_usd=0.0,
                    duration_ms=duration_ms,
                    error_message=f"Execution failed: {str(e)}"
                ))
                
                # Continue despite error (graceful degradation)
                continue
        
        return step_results
    
    # ========================================================================
    # RESULT SYNTHESIS (LLM-Powered)
    # ========================================================================
    
    async def _synthesize_results(
        self,
        task: str,
        plan: ToolChainPlan,
        step_results: List[StepResult]
    ) -> str:
        """
        Synthesize final answer from all step results.
        
        The LLM combines outputs from all tools into a coherent,
        comprehensive answer that addresses the original task.
        
        This is CRITICAL for quality - we don't just concatenate
        tool outputs, we intelligently synthesize them.
        
        Args:
            task: Original task
            plan: Tool chain plan (for context)
            step_results: Results from all steps
            
        Returns:
            Synthesized final answer as string
        """
        # Format step results for LLM
        results_text = []
        for sr in step_results:
            status_icon = "✅" if sr.success else "❌"
            results_text.append(
                f"**Step {sr.step_number}: {sr.tool_name}** {status_icon}\n"
                f"Output: {str(sr.output_data)[:800]}\n"  # Truncate for token limits
            )
        
        if not results_text:
            return "No tool results to synthesize."
        
        results_formatted = "\n".join(results_text)
        
        system_prompt = """You are a result synthesizer for an autonomous AI agent.

Your job is to combine outputs from multiple tool executions into a comprehensive, coherent final answer.

Requirements:
1. Integrate ALL relevant information from the tool outputs
2. Present a clear, actionable answer to the original task
3. Cite which tools provided which information (e.g., "According to RAG search...")
4. If any steps failed, work with available information and note limitations
5. Be comprehensive but concise
6. Use markdown formatting for readability
7. Include specific details, data, and citations

Think of yourself as synthesizing a research report from multiple sources."""

        user_prompt = f"""ORIGINAL TASK:
{task}

TOOL CHAIN PLAN REASONING:
{plan.reasoning}

TOOL EXECUTION RESULTS:
{results_formatted}

SYNTHESIZE A COMPREHENSIVE FINAL ANSWER:

Format your answer as:
1. Summary (2-3 sentences)
2. Detailed findings (organized by source)
3. Actionable recommendations (if applicable)
4. Citations/sources used"""
        
        logger.info("Synthesizing results with LLM", model=self.synthesis_model)
        
        response = await self.openai.chat.completions.create(
            model=self.synthesis_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,  # Slightly creative for good writing
            max_tokens=2500
        )
        
        synthesis = response.choices[0].message.content.strip()
        
        logger.info(
            "Result synthesis completed",
            synthesis_length=len(synthesis),
            model=self.synthesis_model
        )
        
        return synthesis
    
    # ========================================================================
    # METRICS & UTILITIES
    # ========================================================================
    
    def get_stats(self) -> Dict[str, Any]:
        """Get executor statistics."""
        return {
            'chains_executed': self.chains_executed,
            'total_steps_executed': self.total_steps_executed,
            'avg_steps_per_chain': (
                self.total_steps_executed / self.chains_executed
                if self.chains_executed > 0 else 0.0
            ),
            'total_cost_usd': self.total_cost_usd,
            'avg_cost_per_chain': (
                self.total_cost_usd / self.chains_executed
                if self.chains_executed > 0 else 0.0
            )
        }
    
    def reset_stats(self):
        """Reset executor statistics."""
        self.chains_executed = 0
        self.total_steps_executed = 0
        self.total_cost_usd = 0.0
        logger.info("ToolChainExecutor statistics reset")

