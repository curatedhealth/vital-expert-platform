"""
Query Intent Classification for VITAL Ask Expert Service

Analyzes user queries to determine intent, complexity, urgency, and optimal processing mode.
Provides intelligent routing between Interactive and Autonomous modes.
"""

from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import asyncio
import json
from datetime import datetime

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage


class QueryIntent(Enum):
    """Types of query intents"""
    INFORMATIONAL = "informational"    # "What is...", "Tell me about..."
    STRATEGIC = "strategic"           # "How should we...", "What's the best approach..."
    ANALYTICAL = "analytical"         # "Analyze this data...", "Compare these options..."
    PROCEDURAL = "procedural"         # "How do I...", "What steps..."
    CREATIVE = "creative"             # "Generate ideas...", "Brainstorm..."
    URGENT = "urgent"                 # Time-sensitive queries
    CLARIFICATION = "clarification"   # "Can you explain...", "What does this mean..."


class QueryComplexity(Enum):
    """Query complexity levels"""
    SIMPLE = "simple"        # Single question, direct answer
    MODERATE = "moderate"    # Multi-part question, some analysis
    COMPLEX = "complex"      # Requires research, analysis, reasoning
    EXPERT = "expert"        # Requires deep expertise, multiple steps


class ProcessingMode(Enum):
    """Recommended processing mode"""
    INTERACTIVE = "interactive"    # Real-time Q&A
    AUTONOMOUS = "autonomous"      # Multi-step reasoning
    HYBRID = "hybrid"             # Start interactive, escalate if needed


@dataclass
class QueryAnalysisResult:
    """Result of query analysis"""
    intent: QueryIntent
    complexity: QueryComplexity
    complexity_score: float  # 0-1
    recommended_mode: ProcessingMode
    urgency_score: float  # 0-1
    domains_detected: List[str]
    keywords: List[str]
    business_context: Dict[str, Any]
    confidence: float
    reasoning: str
    requires_tools: bool
    estimated_time: int  # seconds


class IntentDetector:
    """Detects query intent using LLM analysis"""
    
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
        self.intent_prompt = self._build_intent_prompt()
    
    def _build_intent_prompt(self) -> str:
        """Build the intent detection prompt"""
        return """
You are an expert query intent classifier for VITAL's medical AI platform. Analyze user queries to determine their intent and characteristics.

Query Intent Types:
- INFORMATIONAL: "What is...", "Tell me about...", "Explain..."
- STRATEGIC: "How should we...", "What's the best approach...", "Recommend..."
- ANALYTICAL: "Analyze this...", "Compare...", "Evaluate...", "Assess..."
- PROCEDURAL: "How do I...", "What steps...", "Process for..."
- CREATIVE: "Generate ideas...", "Brainstorm...", "Design..."
- URGENT: Time-sensitive, "ASAP", "urgent", "immediately"
- CLARIFICATION: "Can you explain...", "What does this mean...", "I don't understand..."

Complexity Levels:
- SIMPLE: Single question, direct answer (0-0.3)
- MODERATE: Multi-part question, some analysis (0.3-0.6)
- COMPLEX: Requires research, analysis, reasoning (0.6-0.8)
- EXPERT: Deep expertise, multiple steps (0.8-1.0)

Processing Modes:
- INTERACTIVE: Real-time Q&A, single response
- AUTONOMOUS: Multi-step reasoning, research, analysis
- HYBRID: Start interactive, escalate if needed

Analyze this query and respond in JSON format:

Query: {query}
Context: {context}

{{
    "intent": "intent_type",
    "complexity": "complexity_level",
    "complexity_score": 0.75,
    "recommended_mode": "processing_mode",
    "urgency_score": 0.3,
    "domains_detected": ["domain1", "domain2"],
    "keywords": ["keyword1", "keyword2"],
    "business_context": {{
        "industry": "pharmaceutical",
        "phase": "development",
        "stakeholder": "regulatory"
    }},
    "confidence": 0.9,
    "reasoning": "Detailed explanation of classification",
    "requires_tools": true,
    "estimated_time": 120
}}
"""
    
    async def detect_intent(self, query: str, context: Dict[str, Any] = None) -> QueryAnalysisResult:
        """Detect intent and analyze query characteristics"""
        
        context = context or {}
        
        # Build prompt
        prompt = self.intent_prompt.format(
            query=query,
            context=json.dumps(context, indent=2)
        )
        
        # Get LLM analysis
        messages = [
            SystemMessage(content="You are an expert query classifier. Always respond with valid JSON."),
            HumanMessage(content=prompt)
        ]
        
        try:
            response = await self.llm.ainvoke(messages)
            analysis_data = json.loads(response.content)
            
            return QueryAnalysisResult(
                intent=QueryIntent(analysis_data["intent"]),
                complexity=QueryComplexity(analysis_data["complexity"]),
                complexity_score=analysis_data["complexity_score"],
                recommended_mode=ProcessingMode(analysis_data["recommended_mode"]),
                urgency_score=analysis_data["urgency_score"],
                domains_detected=analysis_data.get("domains_detected", []),
                keywords=analysis_data.get("keywords", []),
                business_context=analysis_data.get("business_context", {}),
                confidence=analysis_data.get("confidence", 0.8),
                reasoning=analysis_data.get("reasoning", ""),
                requires_tools=analysis_data.get("requires_tools", False),
                estimated_time=analysis_data.get("estimated_time", 60)
            )
            
        except Exception as e:
            # Fallback analysis
            return self._fallback_analysis(query, context)
    
    def _fallback_analysis(self, query: str, context: Dict[str, Any]) -> QueryAnalysisResult:
        """Fallback analysis using keyword matching"""
        query_lower = query.lower()
        
        # Intent detection via keywords
        if any(word in query_lower for word in ["what is", "tell me", "explain"]):
            intent = QueryIntent.INFORMATIONAL
        elif any(word in query_lower for word in ["how should", "recommend", "best approach"]):
            intent = QueryIntent.STRATEGIC
        elif any(word in query_lower for word in ["analyze", "compare", "evaluate"]):
            intent = QueryIntent.ANALYTICAL
        elif any(word in query_lower for word in ["how do", "steps", "process"]):
            intent = QueryIntent.PROCEDURAL
        elif any(word in query_lower for word in ["generate", "brainstorm", "design"]):
            intent = QueryIntent.CREATIVE
        elif any(word in query_lower for word in ["urgent", "asap", "immediately"]):
            intent = QueryIntent.URGENT
        else:
            intent = QueryIntent.INFORMATIONAL
        
        # Complexity detection
        if len(query.split()) < 10:
            complexity = QueryComplexity.SIMPLE
            complexity_score = 0.2
        elif len(query.split()) < 25:
            complexity = QueryComplexity.MODERATE
            complexity_score = 0.5
        else:
            complexity = QueryComplexity.COMPLEX
            complexity_score = 0.7
        
        # Mode recommendation
        if complexity_score > 0.6 or intent in [QueryIntent.STRATEGIC, QueryIntent.ANALYTICAL]:
            recommended_mode = ProcessingMode.AUTONOMOUS
        else:
            recommended_mode = ProcessingMode.INTERACTIVE
        
        return QueryAnalysisResult(
            intent=intent,
            complexity=complexity,
            complexity_score=complexity_score,
            recommended_mode=recommended_mode,
            urgency_score=0.3,
            domains_detected=[],
            keywords=query.split()[:5],
            business_context={},
            confidence=0.6,
            reasoning="Fallback analysis using keyword matching",
            requires_tools=complexity_score > 0.5,
            estimated_time=60
        )


class ComplexityScorer:
    """Scores query complexity using multiple factors"""
    
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
    
    async def score_complexity(self, query: str, context: Dict[str, Any] = None) -> float:
        """Score query complexity from 0-1"""
        
        # Multiple complexity factors
        factors = {
            "length": self._score_length(query),
            "technical_terms": await self._score_technical_terms(query),
            "question_count": self._score_question_count(query),
            "reasoning_indicators": self._score_reasoning_indicators(query),
            "context_dependency": self._score_context_dependency(query, context or {})
        }
        
        # Weighted average
        weights = {
            "length": 0.2,
            "technical_terms": 0.3,
            "question_count": 0.2,
            "reasoning_indicators": 0.2,
            "context_dependency": 0.1
        }
        
        complexity_score = sum(factors[factor] * weights[factor] for factor in factors)
        return min(1.0, max(0.0, complexity_score))
    
    def _score_length(self, query: str) -> float:
        """Score based on query length"""
        word_count = len(query.split())
        if word_count < 10:
            return 0.2
        elif word_count < 25:
            return 0.5
        elif word_count < 50:
            return 0.7
        else:
            return 0.9
    
    async def _score_technical_terms(self, query: str) -> float:
        """Score based on technical terminology"""
        technical_terms = [
            "regulatory", "clinical", "pharmacokinetics", "biomarker", "endpoint",
            "protocol", "adverse event", "efficacy", "safety", "FDA", "EMA",
            "ICH", "GCP", "GLP", "GMP", "submission", "approval", "indication"
        ]
        
        query_lower = query.lower()
        term_count = sum(1 for term in technical_terms if term in query_lower)
        
        return min(1.0, term_count / 5.0)  # Normalize to 0-1
    
    def _score_question_count(self, query: str) -> float:
        """Score based on number of questions"""
        question_count = query.count("?")
        if question_count == 0:
            return 0.1
        elif question_count == 1:
            return 0.3
        elif question_count <= 3:
            return 0.6
        else:
            return 0.9
    
    def _score_reasoning_indicators(self, query: str) -> float:
        """Score based on reasoning indicators"""
        reasoning_words = [
            "analyze", "compare", "evaluate", "assess", "consider", "determine",
            "strategize", "plan", "recommend", "suggest", "propose", "design"
        ]
        
        query_lower = query.lower()
        reasoning_count = sum(1 for word in reasoning_words if word in query_lower)
        
        return min(1.0, reasoning_count / 3.0)
    
    def _score_context_dependency(self, query: str, context: Dict[str, Any]) -> float:
        """Score based on context dependency"""
        if not context:
            return 0.1
        
        # Check for context-dependent terms
        context_terms = ["our", "this", "the project", "current", "existing"]
        query_lower = query.lower()
        context_count = sum(1 for term in context_terms if term in query_lower)
        
        return min(1.0, context_count / 2.0)


class QueryClassifier:
    """Main query classification service"""
    
    def __init__(self, llm: ChatOpenAI):
        self.intent_detector = IntentDetector(llm)
        self.complexity_scorer = ComplexityScorer(llm)
    
    async def classify_query(
        self, 
        query: str, 
        context: Dict[str, Any] = None
    ) -> QueryAnalysisResult:
        """Classify query and provide comprehensive analysis"""
        
        # Get intent analysis
        intent_result = await self.intent_detector.detect_intent(query, context)
        
        # Get complexity score
        complexity_score = await self.complexity_scorer.score_complexity(query, context)
        
        # Update complexity based on detailed scoring
        if complexity_score < 0.3:
            complexity = QueryComplexity.SIMPLE
        elif complexity_score < 0.6:
            complexity = QueryComplexity.MODERATE
        elif complexity_score < 0.8:
            complexity = QueryComplexity.COMPLEX
        else:
            complexity = QueryComplexity.EXPERT
        
        # Update recommended mode based on complexity
        if complexity_score > 0.6 or intent_result.intent in [QueryIntent.STRATEGIC, QueryIntent.ANALYTICAL]:
            recommended_mode = ProcessingMode.AUTONOMOUS
        elif complexity_score > 0.3:
            recommended_mode = ProcessingMode.HYBRID
        else:
            recommended_mode = ProcessingMode.INTERACTIVE
        
        # Create updated result
        return QueryAnalysisResult(
            intent=intent_result.intent,
            complexity=complexity,
            complexity_score=complexity_score,
            recommended_mode=recommended_mode,
            urgency_score=intent_result.urgency_score,
            domains_detected=intent_result.domains_detected,
            keywords=intent_result.keywords,
            business_context=intent_result.business_context,
            confidence=intent_result.confidence,
            reasoning=f"{intent_result.reasoning} Complexity score: {complexity_score:.2f}",
            requires_tools=complexity_score > 0.5 or intent_result.requires_tools,
            estimated_time=int(intent_result.estimated_time * (1 + complexity_score))
        )
    
    async def should_escalate_to_autonomous(
        self, 
        query: str, 
        context: Dict[str, Any] = None
    ) -> Tuple[bool, str]:
        """Determine if query should escalate from interactive to autonomous mode"""
        
        analysis = await self.classify_query(query, context)
        
        # Escalation criteria
        if analysis.complexity_score > 0.7:
            return True, f"High complexity ({analysis.complexity_score:.2f}) requires autonomous processing"
        
        if analysis.intent in [QueryIntent.STRATEGIC, QueryIntent.ANALYTICAL]:
            return True, f"Intent type '{analysis.intent.value}' requires autonomous processing"
        
        if analysis.requires_tools and analysis.complexity_score > 0.5:
            return True, "Query requires multiple tools and analysis"
        
        if analysis.estimated_time > 300:  # 5 minutes
            return True, f"Estimated processing time ({analysis.estimated_time}s) too long for interactive mode"
        
        return False, "Query suitable for interactive processing"
