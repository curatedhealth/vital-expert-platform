"""
Smart Tool Suggestion System

Uses LLM to analyze user queries and intelligently suggest appropriate tools.

Features:
- Analyzes query intent and complexity
- Suggests tools based on query needs
- Provides reasoning for suggestions
- Handles tool confirmation flow
- Tracks suggestion quality
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
import structlog
import json

from models.tool_metadata import (
    get_all_tools,
    get_tool_metadata,
    get_expensive_tools,
    ToolMetadata
)

logger = structlog.get_logger(__name__)


class ToolSuggestion(BaseModel):
    """Tool suggestion from LLM analysis"""
    tool_name: str
    confidence: float
    reasoning: str
    parameters: Dict[str, Any]


class ToolSuggestionResult(BaseModel):
    """Result of tool suggestion analysis"""
    needs_tools: bool
    suggested_tools: List[ToolSuggestion]
    overall_reasoning: str
    confidence: float
    needs_confirmation: bool
    confirmation_message: Optional[str] = None


class SmartToolSuggestionService:
    """
    Analyzes queries and suggests appropriate tools using LLM
    
    Decision flow:
    1. Analyze query with LLM
    2. Check if any tools are needed
    3. If yes, suggest specific tools with parameters
    4. Check if any suggested tools require confirmation
    5. Return suggestion with reasoning
    """
    
    def __init__(self, model: str = "gpt-4-turbo-preview", temperature: float = 0.3):
        self.llm = ChatOpenAI(model=model, temperature=temperature)
        self._build_prompts()
    
    def _build_prompts(self):
        """Build LLM prompts for tool suggestion"""
        
        # Get all available tools for context
        tools = get_all_tools()
        tool_descriptions = "\n".join([
            f"- **{tool.name}**: {tool.to_llm_description()}"
            for tool in tools
        ])
        
        self.suggestion_prompt = ChatPromptTemplate.from_messages([
            ("system", f"""You are an expert tool selection assistant for a medical/regulatory AI system.

Your task: Analyze the user's query and determine if any tools should be used, and if so, which ones.

Available Tools:
{tool_descriptions}

Guidelines:
1. **Only suggest tools when clearly beneficial** - Don't over-suggest
2. **Prefer knowledge-based answers** - Tools are for specific needs:
   - Current/real-time information → web_search
   - Peer-reviewed research → pubmed_search
   - FDA regulatory data → fda_database
   - Calculations → calculator

3. **Consider cost** - Prefer free tools when appropriate
4. **Multiple tools OK** - If genuinely needed (e.g., web + PubMed)
5. **Provide clear reasoning** - Explain why each tool is needed

Output JSON format:
{{
    "needs_tools": true/false,
    "suggested_tools": [
        {{
            "tool_name": "web_search",
            "confidence": 0.0-1.0,
            "reasoning": "why this tool",
            "parameters": {{"query": "specific search query", ...}}
        }}
    ],
    "overall_reasoning": "why these tools (or no tools) are appropriate",
    "confidence": 0.0-1.0
}}

Examples:

Query: "What is the FDA 510(k) process?"
Response: {{"needs_tools": false, "suggested_tools": [], "overall_reasoning": "This is standard knowledge about FDA processes that doesn't require real-time data", "confidence": 0.9}}

Query: "What are the latest FDA guidelines published this month?"
Response: {{"needs_tools": true, "suggested_tools": [{{"tool_name": "web_search", "confidence": 0.95, "reasoning": "Need current information from this month", "parameters": {{"query": "FDA guidelines latest updates this month", "max_results": 5}}}}], "overall_reasoning": "Query explicitly asks for latest/current information", "confidence": 0.95}}

Query: "Find recent clinical trials on CRISPR and calculate the success rate"
Response: {{"needs_tools": true, "suggested_tools": [{{"tool_name": "pubmed_search", "confidence": 0.9, "reasoning": "Need peer-reviewed clinical trial data", "parameters": {{"query": "CRISPR clinical trials", "max_results": 20}}}}, {{"tool_name": "calculator", "confidence": 0.85, "reasoning": "Need to calculate success rate from results", "parameters": {{"expression": "success_rate_calculation"}}}}], "overall_reasoning": "Requires both research data and calculation", "confidence": 0.9}}
"""),
            ("user", "Query: {query}\n\nWhat tools (if any) should be used? Respond with JSON only.")
        ])
    
    async def suggest_tools(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None
    ) -> ToolSuggestionResult:
        """
        Analyze query and suggest appropriate tools
        
        Args:
            query: User's query
            context: Optional context (agent type, previous tools used, etc.)
            
        Returns:
            ToolSuggestionResult with suggestions
        """
        
        try:
            logger.info("Analyzing query for tool suggestions", query_length=len(query))
            
            # Invoke LLM
            chain = self.suggestion_prompt | self.llm
            response = await chain.ainvoke({"query": query})
            
            # Parse response
            try:
                analysis = json.loads(response.content)
            except json.JSONDecodeError as e:
                logger.error("Failed to parse LLM response", error=str(e), response=response.content)
                # Fallback: no tools
                return ToolSuggestionResult(
                    needs_tools=False,
                    suggested_tools=[],
                    overall_reasoning="Failed to analyze query",
                    confidence=0.0,
                    needs_confirmation=False
                )
            
            # Check if tools are needed
            if not analysis.get("needs_tools", False):
                logger.info("No tools suggested for query")
                return ToolSuggestionResult(
                    needs_tools=False,
                    suggested_tools=[],
                    overall_reasoning=analysis.get("overall_reasoning", "Tools not needed"),
                    confidence=analysis.get("confidence", 0.8),
                    needs_confirmation=False
                )
            
            # Parse suggested tools
            suggested_tools = []
            for tool_data in analysis.get("suggested_tools", []):
                tool_name = tool_data.get("tool_name")
                
                # Validate tool exists
                tool_meta = get_tool_metadata(tool_name)
                if not tool_meta:
                    logger.warning("Suggested tool not found", tool_name=tool_name)
                    continue
                
                suggested_tools.append(ToolSuggestion(
                    tool_name=tool_name,
                    confidence=tool_data.get("confidence", 0.7),
                    reasoning=tool_data.get("reasoning", ""),
                    parameters=tool_data.get("parameters", {})
                ))
            
            if not suggested_tools:
                # No valid tools suggested
                return ToolSuggestionResult(
                    needs_tools=False,
                    suggested_tools=[],
                    overall_reasoning="No valid tools available for this query",
                    confidence=0.5,
                    needs_confirmation=False
                )
            
            # Check if any tools require confirmation
            expensive_tool_names = {t.name for t in get_expensive_tools()}
            needs_confirmation = any(
                t.tool_name in expensive_tool_names 
                for t in suggested_tools
            )
            
            # Build confirmation message
            confirmation_message = None
            if needs_confirmation:
                expensive_tools = [
                    t for t in suggested_tools 
                    if t.tool_name in expensive_tool_names
                ]
                
                tool_names = ", ".join([
                    get_tool_metadata(t.tool_name).display_name 
                    for t in expensive_tools
                ])
                
                confirmation_message = (
                    f"I recommend using {tool_names}. "
                    f"These tools may incur costs or take time to execute. "
                    f"Would you like to proceed?"
                )
            
            logger.info(
                "Tool suggestions generated",
                tools_count=len(suggested_tools),
                needs_confirmation=needs_confirmation
            )
            
            return ToolSuggestionResult(
                needs_tools=True,
                suggested_tools=suggested_tools,
                overall_reasoning=analysis.get("overall_reasoning", ""),
                confidence=analysis.get("confidence", 0.7),
                needs_confirmation=needs_confirmation,
                confirmation_message=confirmation_message
            )
            
        except Exception as e:
            logger.error("Tool suggestion failed", error=str(e), exc_info=True)
            # Fallback: no tools
            return ToolSuggestionResult(
                needs_tools=False,
                suggested_tools=[],
                overall_reasoning=f"Tool suggestion failed: {str(e)}",
                confidence=0.0,
                needs_confirmation=False
            )
    
    async def suggest_from_user_request(
        self,
        requested_tools: List[str],
        query: str
    ) -> ToolSuggestionResult:
        """
        Process user-requested tools (validate and prepare)
        
        User explicitly requested certain tools, so we:
        1. Validate they exist and are enabled
        2. Check if they require confirmation
        3. Prepare parameters
        """
        
        logger.info("Processing user-requested tools", tools=requested_tools)
        
        # Validate tools
        valid_tools = []
        for tool_name in requested_tools:
            tool_meta = get_tool_metadata(tool_name)
            
            if not tool_meta:
                logger.warning("Requested tool not found", tool_name=tool_name)
                continue
            
            if not tool_meta.is_enabled:
                logger.warning("Requested tool is disabled", tool_name=tool_name)
                continue
            
            if tool_meta.is_deprecated:
                logger.warning("Requested tool is deprecated", tool_name=tool_name)
                continue
            
            # Prepare parameters (simple query-based for now)
            parameters = self._prepare_tool_parameters(tool_name, query, tool_meta)
            
            valid_tools.append(ToolSuggestion(
                tool_name=tool_name,
                confidence=1.0,  # User requested, so high confidence
                reasoning=f"User explicitly requested {tool_meta.display_name}",
                parameters=parameters
            ))
        
        if not valid_tools:
            return ToolSuggestionResult(
                needs_tools=False,
                suggested_tools=[],
                overall_reasoning="No valid tools in user request",
                confidence=0.0,
                needs_confirmation=False
            )
        
        # Check confirmation
        expensive_tool_names = {t.name for t in get_expensive_tools()}
        needs_confirmation = any(
            t.tool_name in expensive_tool_names 
            for t in valid_tools
        )
        
        confirmation_message = None
        if needs_confirmation:
            expensive_tools = [
                t for t in valid_tools 
                if t.tool_name in expensive_tool_names
            ]
            
            tool_names = ", ".join([
                get_tool_metadata(t.tool_name).display_name 
                for t in expensive_tools
            ])
            
            confirmation_message = (
                f"You've requested {tool_names}. "
                f"These tools may incur costs. Proceed?"
            )
        
        return ToolSuggestionResult(
            needs_tools=True,
            suggested_tools=valid_tools,
            overall_reasoning="User-requested tools validated",
            confidence=1.0,
            needs_confirmation=needs_confirmation,
            confirmation_message=confirmation_message
        )
    
    def _prepare_tool_parameters(
        self,
        tool_name: str,
        query: str,
        tool_meta: ToolMetadata
    ) -> Dict[str, Any]:
        """
        Prepare tool parameters from query
        
        Simple parameter extraction (can be enhanced with LLM later)
        """
        
        # Default: use query as main parameter
        params = {}
        
        if tool_name == "web_search":
            params = {
                "query": query,
                "max_results": 5
            }
        
        elif tool_name == "pubmed_search":
            params = {
                "query": query,
                "max_results": 10
            }
        
        elif tool_name == "fda_database":
            params = {
                "query_type": "device_510k",  # Default
                "search_term": query,
                "limit": 10
            }
        
        elif tool_name == "calculator":
            params = {
                "expression": query
            }
        
        return params


# Convenience function
async def suggest_tools_for_query(
    query: str,
    context: Optional[Dict[str, Any]] = None
) -> ToolSuggestionResult:
    """Convenience function to get tool suggestions"""
    service = SmartToolSuggestionService()
    return await service.suggest_tools(query, context)

