"""
ReAct (Reasoning + Acting) Agent Pattern

Implements the ReAct pattern for tool-augmented reasoning.

Paper: "ReAct: Synergizing Reasoning and Acting in Language Models" (Yao et al., 2022)

Algorithm:
1. Thought: Reason about the problem
2. Action: Execute a tool/action based on reasoning
3. Observation: Observe the result of the action
4. Repeat: Continue thought-action-observation cycle until done

Format:
Thought: [reasoning about what to do next]
Action: [tool_name(args)]
Observation: [result from tool execution]
... (repeat)
Thought: [final reasoning]
Answer: [final answer to user]

Use cases:
- Tasks requiring external information lookup
- Multi-step procedures with tool execution
- Dynamic decision-making based on intermediate results
"""

from typing import List, Dict, Any, Optional, Callable, Tuple
from uuid import UUID
from dataclasses import dataclass
from enum import Enum
import json
import re
import openai

from ...graphrag.utils.logger import get_logger

logger = get_logger(__name__)


class ReActStepType(str, Enum):
    """Types of steps in ReAct trace"""
    THOUGHT = "thought"
    ACTION = "action"
    OBSERVATION = "observation"
    ANSWER = "answer"


@dataclass
class ReActStep:
    """Represents a single step in ReAct trace"""
    step_num: int
    step_type: ReActStepType
    content: str
    tool_name: Optional[str] = None
    tool_args: Optional[Dict[str, Any]] = None
    tool_result: Optional[Any] = None


@dataclass
class ReActTrace:
    """Complete ReAct execution trace"""
    steps: List[ReActStep]
    final_answer: Optional[str] = None
    is_complete: bool = False
    error: Optional[str] = None
    
    def get_trace_text(self) -> str:
        """Get formatted trace for display"""
        lines = []
        for step in self.steps:
            if step.step_type == ReActStepType.THOUGHT:
                lines.append(f"Thought {step.step_num}: {step.content}")
            elif step.step_type == ReActStepType.ACTION:
                lines.append(f"Action {step.step_num}: {step.tool_name}({step.tool_args})")
            elif step.step_type == ReActStepType.OBSERVATION:
                lines.append(f"Observation {step.step_num}: {step.content}")
            elif step.step_type == ReActStepType.ANSWER:
                lines.append(f"Answer: {step.content}")
        return "\n".join(lines)


class ReActAgent:
    """
    Implements ReAct (Reasoning + Acting) pattern.
    
    This agent interleaves reasoning (thoughts) with actions (tool calls),
    using observations from actions to inform next steps.
    """
    
    def __init__(
        self,
        agent_id: UUID,
        model: str = "gpt-4",
        system_prompt: str = "",
        tools: Dict[str, Callable] = None,
        max_iterations: int = 10,
        temperature: float = 0.7
    ):
        """
        Initialize ReAct agent.
        
        Args:
            agent_id: Agent UUID
            model: LLM model to use
            system_prompt: System prompt for the agent
            tools: Dict of tool_name -> tool_function
            max_iterations: Maximum thought-action cycles
            temperature: LLM temperature
        """
        self.agent_id = agent_id
        self.model = model
        self.system_prompt = system_prompt
        self.tools = tools or {}
        self.max_iterations = max_iterations
        self.temperature = temperature
        
        # Initialize OpenAI client
        from ...graphrag.config import get_embedding_config
        config = get_embedding_config()
        self.openai_client = openai.AsyncOpenAI(api_key=config.openai_api_key)
        
        # Trace
        self.trace = ReActTrace(steps=[])
        self.step_counter = 0
        
    async def execute(
        self,
        query: str,
        context: str = ""
    ) -> Dict[str, Any]:
        """
        Execute task using ReAct pattern.
        
        Args:
            query: Task to execute
            context: Additional context
            
        Returns:
            Dict with answer, trace, and metadata
        """
        logger.info(f"ReAct execution started for agent {self.agent_id}")
        
        self.trace = ReActTrace(steps=[])
        self.step_counter = 0
        
        # Build ReAct prompt
        react_prompt = self._build_react_prompt(query, context)
        
        # Execute thought-action-observation loop
        conversation = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": react_prompt}
        ]
        
        for iteration in range(self.max_iterations):
            try:
                # Generate next step (thought + action)
                response = await self.openai_client.chat.completions.create(
                    model=self.model,
                    messages=conversation,
                    temperature=self.temperature,
                    max_tokens=500
                )
                
                assistant_message = response.choices[0].message.content
                conversation.append({"role": "assistant", "content": assistant_message})
                
                # Parse response for thought/action/answer
                parsed = self._parse_react_response(assistant_message)
                
                if not parsed:
                    logger.warning(f"Failed to parse ReAct response at iteration {iteration}")
                    break
                    
                step_type, content, tool_name, tool_args = parsed
                
                # Add thought step
                if step_type == ReActStepType.THOUGHT:
                    self.trace.steps.append(ReActStep(
                        step_num=self.step_counter,
                        step_type=ReActStepType.THOUGHT,
                        content=content
                    ))
                    self.step_counter += 1
                    
                # Handle action
                if step_type == ReActStepType.ACTION:
                    action_step = ReActStep(
                        step_num=self.step_counter,
                        step_type=ReActStepType.ACTION,
                        content=content,
                        tool_name=tool_name,
                        tool_args=tool_args
                    )
                    self.trace.steps.append(action_step)
                    self.step_counter += 1
                    
                    # Execute tool
                    observation = await self._execute_tool(tool_name, tool_args)
                    
                    # Add observation step
                    obs_step = ReActStep(
                        step_num=self.step_counter,
                        step_type=ReActStepType.OBSERVATION,
                        content=str(observation),
                        tool_result=observation
                    )
                    self.trace.steps.append(obs_step)
                    self.step_counter += 1
                    
                    # Add observation to conversation
                    conversation.append({
                        "role": "user",
                        "content": f"Observation: {observation}"
                    })
                    
                # Handle answer (terminal)
                elif step_type == ReActStepType.ANSWER:
                    self.trace.steps.append(ReActStep(
                        step_num=self.step_counter,
                        step_type=ReActStepType.ANSWER,
                        content=content
                    ))
                    self.trace.final_answer = content
                    self.trace.is_complete = True
                    break
                    
            except Exception as e:
                logger.error(f"Error in ReAct iteration {iteration}: {e}")
                self.trace.error = str(e)
                break
                
        if not self.trace.is_complete:
            logger.warning(f"ReAct execution did not complete after {self.max_iterations} iterations")
            
        logger.info(f"ReAct execution completed: {len(self.trace.steps)} steps")
        
        return {
            "answer": self.trace.final_answer,
            "trace": self.trace.get_trace_text(),
            "steps": [self._serialize_step(s) for s in self.trace.steps],
            "is_complete": self.trace.is_complete,
            "error": self.trace.error
        }
        
    def _build_react_prompt(self, query: str, context: str) -> str:
        """Build ReAct-style prompt"""
        tools_desc = self._format_tools_description()
        
        return f"""
Solve the following task using the ReAct (Reasoning + Acting) format.

Task: {query}
Context: {context}

Available tools:
{tools_desc}

Use the following format:

Thought: [Your reasoning about what to do next]
Action: tool_name(arg1="value1", arg2="value2")
Observation: [The result will be provided here]
... (repeat Thought/Action/Observation as needed)
Thought: [Final reasoning]
Answer: [Your final answer to the task]

Important:
- Always start with a Thought
- Actions must use exact tool names from the list above
- After each Action, wait for the Observation
- When you have enough information, provide the final Answer

Begin!
"""
        
    def _format_tools_description(self) -> str:
        """Format available tools for prompt"""
        if not self.tools:
            return "No tools available (text-only reasoning)"
            
        tool_lines = []
        for tool_name, tool_func in self.tools.items():
            # Try to get docstring
            doc = tool_func.__doc__ or "No description available"
            tool_lines.append(f"- {tool_name}: {doc.strip()}")
            
        return "\n".join(tool_lines)
        
    def _parse_react_response(
        self,
        response: str
    ) -> Optional[Tuple[ReActStepType, str, Optional[str], Optional[Dict]]]:
        """
        Parse LLM response for ReAct components.
        
        Returns:
            (step_type, content, tool_name, tool_args) or None
        """
        response = response.strip()
        
        # Check for Answer (terminal)
        if response.startswith("Answer:"):
            answer_text = response.replace("Answer:", "").strip()
            return (ReActStepType.ANSWER, answer_text, None, None)
            
        # Check for Thought
        thought_match = re.search(r"Thought:?\s*(.+?)(?=\n|$)", response, re.IGNORECASE)
        if thought_match:
            thought_text = thought_match.group(1).strip()
            
        # Check for Action
        action_match = re.search(
            r"Action:?\s*(\w+)\((.*?)\)",
            response,
            re.IGNORECASE | re.DOTALL
        )
        
        if action_match:
            tool_name = action_match.group(1)
            args_str = action_match.group(2)
            
            # Parse arguments (simple key=value parsing)
            tool_args = self._parse_tool_args(args_str)
            
            return (
                ReActStepType.ACTION,
                f"{tool_name}({args_str})",
                tool_name,
                tool_args
            )
            
        # If only thought, return it
        if thought_match:
            return (ReActStepType.THOUGHT, thought_text, None, None)
            
        # Fallback: treat entire response as thought
        return (ReActStepType.THOUGHT, response, None, None)
        
    def _parse_tool_args(self, args_str: str) -> Dict[str, Any]:
        """Parse tool arguments from string"""
        args = {}
        
        if not args_str.strip():
            return args
            
        # Simple key=value parsing
        # TODO: Improve for complex nested structures
        parts = args_str.split(",")
        for part in parts:
            if "=" in part:
                key, value = part.split("=", 1)
                key = key.strip().strip('"').strip("'")
                value = value.strip().strip('"').strip("'")
                args[key] = value
                
        return args
        
    async def _execute_tool(
        self,
        tool_name: str,
        tool_args: Dict[str, Any]
    ) -> Any:
        """Execute a tool and return result"""
        if tool_name not in self.tools:
            return f"Error: Tool '{tool_name}' not found. Available tools: {list(self.tools.keys())}"
            
        try:
            tool_func = self.tools[tool_name]
            
            # Check if tool is async
            import inspect
            if inspect.iscoroutinefunction(tool_func):
                result = await tool_func(**tool_args)
            else:
                result = tool_func(**tool_args)
                
            return result
            
        except Exception as e:
            logger.error(f"Error executing tool {tool_name}: {e}")
            return f"Error executing {tool_name}: {str(e)}"
            
    def _serialize_step(self, step: ReActStep) -> Dict[str, Any]:
        """Serialize step for JSON output"""
        return {
            "step_num": step.step_num,
            "step_type": step.step_type.value,
            "content": step.content,
            "tool_name": step.tool_name,
            "tool_args": step.tool_args,
            "tool_result": str(step.tool_result) if step.tool_result else None
        }
        
    def add_tool(self, name: str, func: Callable) -> None:
        """Add a tool to the agent's toolbox"""
        self.tools[name] = func
        logger.info(f"Tool '{name}' added to ReAct agent {self.agent_id}")
        
    def remove_tool(self, name: str) -> None:
        """Remove a tool from the agent's toolbox"""
        if name in self.tools:
            del self.tools[name]
            logger.info(f"Tool '{name}' removed from ReAct agent {self.agent_id}")

