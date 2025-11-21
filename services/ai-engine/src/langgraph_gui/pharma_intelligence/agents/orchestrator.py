"""
OrchestratorAgent - Specialized agent for pharmaceutical research.
"""

"""
Specialized Agent Implementations
Each agent has domain-specific prompts and expertise
"""

from langchain_core.language_models import BaseChatModel
from langchain_core.prompts import ChatPromptTemplate
from typing import List, Dict
import json
from datetime import datetime

class OrchestratorAgent:
    """
    Master orchestrator that plans research and reviews outputs
    """
    
    def __init__(self, llm: BaseChatModel, rag_manager):
        self.llm = llm
        self.rag_manager = rag_manager
        
        self.planning_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are the Master Research Orchestrator for pharmaceutical intelligence.

Your role is to:
1. Analyze user queries and identify QUERY TYPE
2. Break down complex questions into clear research objectives
3. Assign tasks to specialized agents with RELEVANCE SCORES (0.0-1.0):
   - Medical Research Agent: Clinical trials, drug mechanisms, efficacy, safety
   - Digital Health Agent: Health tech innovations, digital therapeutics, AI/ML
   - Regulatory Agent: FDA/EMA approvals, compliance, regulatory pathways
4. Define success criteria and tool limits based on query type
5. Prioritize based on query intent

⚡ QUERY TYPE OPTIMIZATION:
- "news": Recent updates, latest developments, breaking news
  → Prioritize scraper, limit PubMed/Trials to 3 results
  → Focus on timeliness over exhaustive detail
- "research": Specific mechanisms, clinical data, in-depth analysis
  → Full tool suite, 10 results each
  → Comprehensive and detailed
- "regulatory": FDA approvals, compliance, pathways
  → Focus on FDA/EMA tools, web search
  → Official sources priority

⚠️ COST OPTIMIZATION: Only assign agents with relevance > 0.3
- If query is purely clinical, ONLY assign medical
- If query is purely regulatory, ONLY assign regulatory
- Only use multiple agents when query truly needs multiple perspectives

Return a JSON research plan with:
{{
    "query": "original query",
    "query_type": "news" or "research" or "regulatory",
    "objectives": ["objective 1", "objective 2", ...],
    "assigned_agents": ["medical", "digital_health", "regulatory"],
    "agent_relevance": {{
        "medical": 0.0-1.0,
        "digital_health": 0.0-1.0,
        "regulatory": 0.0-1.0
    }},
    "tool_limits": {{
        "max_pubmed": 3 or 10,
        "max_trials": 3 or 10,
        "prioritize_scraper": true or false
    }},
    "success_criteria": {{
        "medical": "what success looks like",
        "digital_health": "what success looks like",
        "regulatory": "what success looks like"
    }},
    "estimated_time": "2-3 minutes for news, 5-10 for research",
    "priority": "high/medium/low",
    "reasoning": "why this plan, query type, and tool limits"
}}

Guidelines:
- Assign medical for: clinical data, drugs, trials, mechanisms, efficacy
- Assign digital_health for: health tech, digital therapeutics, AI, innovations
- Assign regulatory for: FDA, EMA, approvals, compliance, pathways
- ONLY include agents with relevance > 0.3 to reduce costs
- Set clear, measurable success criteria"""),
            ("human", "Query: {query}\n\nCreate a research plan with agent relevance scores.")
        ])
        
        self.review_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are the Quality Reviewer for pharmaceutical intelligence reports.

Your role is to review final reports and ensure they:
1. Answer the original query completely
2. Meet all success criteria from the research plan
3. Are accurate, well-sourced, and credible
4. Are clearly written and professionally formatted
5. Contain no contradictions or gaps

⚡ ADJUST STANDARDS BY QUERY TYPE:
- NEWS queries: Prioritize timeliness and relevance
  → Score 6-10 = APPROVE (recent info more important than exhaustive detail)
  → Accept broader overviews if sources are recent
- RESEARCH queries: Prioritize accuracy and depth
  → Score 7-10 = APPROVE (need thorough analysis)
  → Require detailed mechanisms and evidence
- REGULATORY queries: Prioritize official sources
  → Score 7-10 = APPROVE (must be accurate)
  → FDA/EMA sources required

Return a JSON review with:
{{
    "status": "approved" or "needs_revision",
    "needs_revision": true/false,
    "quality_score": 0-10,
    "query_type": "news/research/regulatory",
    "revision_type": "minor" or "major" (if needs revision),
    "revision_reason": "why it needs revision",
    "revision_instructions": "specific instructions for improvement",
    "strengths": ["strength 1", ...],
    "weaknesses": ["weakness 1", ...],
    "missing_elements": ["what's missing"],
    "reasoning": "detailed explanation considering query type"
}}

Standards:
- Score 9-10: Excellent, approve immediately
- Score 7-8: Good, approve or minor revisions
- Score 6: Adequate, APPROVE for NEWS, revise for RESEARCH
- Score 5-6: Adequate, moderate revisions for RESEARCH
- Score <5: Poor, major revisions or replan

Iteration: {iteration}
Max Iterations: 2
(Be more lenient on iteration 2)"""),
            ("human", """Query: {query}

Research Plan:
{research_plan}

Final Report:
{final_report}

Review this report.""")
        ])
    
    def create_research_plan(self, query: str, previous_outputs: Dict = None) -> Dict:
        """Create research plan with task allocation and relevance-based filtering"""
        
        # If replanning, include context
        if previous_outputs:
            query_with_context = f"{query}\n\nPrevious attempt had issues. Create improved plan."
        else:
            query_with_context = query
        
        result = self.llm.invoke(
            self.planning_prompt.format(query=query_with_context)
        )
        
        # Parse JSON
        content = result.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        plan = json.loads(content)
        
        # COST OPTIMIZATION: Filter agents by relevance score
        plan = self._filter_agents_by_relevance(plan)
        
        return plan
    
    def _filter_agents_by_relevance(self, plan: Dict, threshold: float = 0.3) -> Dict:
        """
        Filter assigned agents based on relevance scores to reduce costs.
        
        Only run agents with relevance > threshold (default 0.3).
        This can reduce agent count from 3 to 1-2 on average, saving ~30-50% costs.
        
        Args:
            plan: Research plan with agent_relevance scores
            threshold: Minimum relevance score (0.0-1.0)
            
        Returns:
            Filtered plan with only relevant agents
        """
        if 'agent_relevance' not in plan:
            # If no relevance scores provided, keep all assigned agents
            return plan
        
        relevance_scores = plan['agent_relevance']
        original_agents = plan.get('assigned_agents', [])
        
        # Filter agents by relevance
        filtered_agents = [
            agent for agent in ['medical', 'digital_health', 'regulatory']
            if relevance_scores.get(agent, 0.0) > threshold
        ]
        
        # Update plan
        plan['assigned_agents'] = filtered_agents
        
        # Log filtering for transparency
        if len(filtered_agents) < len(original_agents):
            print(f"\n💰 COST OPTIMIZATION: Filtered agents based on relevance")
            for agent in ['medical', 'digital_health', 'regulatory']:
                score = relevance_scores.get(agent, 0.0)
                status = "✓ Running" if agent in filtered_agents else "✗ Skipped"
                print(f"   {agent:15s}: {score:.2f} {status}")
            print(f"   Agents reduced: {len(original_agents)} → {len(filtered_agents)}")
            print(f"   Estimated cost savings: ~${0.30 * (len(original_agents) - len(filtered_agents)):.2f}")
        
        return plan
    
    def review_report(self, query: str, research_plan: Dict, final_report: str, iteration: int) -> Dict:
        """Review final report and decide if approved"""
        
        result = self.llm.invoke(
            self.review_prompt.format(
                query=query,
                research_plan=json.dumps(research_plan, indent=2),
                final_report=final_report,
                iteration=iteration
            )
        )
        
        # Parse JSON
        content = result.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        review = json.loads(content)
        return review
