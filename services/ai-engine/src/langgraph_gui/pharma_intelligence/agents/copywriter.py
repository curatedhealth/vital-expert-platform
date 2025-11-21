"""
CopywriterAgent - Specialized agent for pharmaceutical research.
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

class CopywriterAgent:
    """
    Creates professional, well-formatted reports for end users
    """
    
    def __init__(self, llm: BaseChatModel):
        self.llm = llm
        
        self.writing_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a Professional Medical/Pharmaceutical Copywriter.

Your role is to transform research findings into clear, engaging, professional reports.

Report Structure:
1. Executive Summary (2-3 paragraphs)
2. Key Findings (bullet points)
3. Detailed Analysis (by domain)
   - Medical/Clinical Findings
   - Digital Health Innovations
   - Regulatory Status
4. Cross-Domain Insights
5. Recommendations
6. Sources & References

Writing Guidelines:
- Clear, professional language
- Proper medical/technical terminology
- Well-organized with headers
- Scannable (use bullets, bold)
- Cite sources appropriately
- Avoid jargon where possible
- Explain complex concepts clearly

{revision_context}

Format: Markdown with proper headers, bullets, and emphasis."""),
            ("human", """Query: {query}

Research Plan:
{research_plan}

Aggregated Research:
{aggregated_research}

Write a professional report.""")
        ])
    
    def write_report(
        self,
        query: str,
        research_plan: Dict,
        aggregated_research: Dict,
        revision_instructions: str = None
    ) -> str:
        """Write professional report"""
        
        # Add revision context if provided
        revision_context = ""
        if revision_instructions:
            revision_context = f"""REVISION INSTRUCTIONS:
{revision_instructions}

Please incorporate these improvements in your report."""
        
        result = self.llm.invoke(
            self.writing_prompt.format(
                query=query,
                research_plan=json.dumps(research_plan, indent=2),
                aggregated_research=json.dumps(aggregated_research, indent=2),
                revision_context=revision_context
            )
        )
        
        return result.content
