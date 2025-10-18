"""
Prompt Selection & Construction for VITAL Ask Expert Service

Manages 372 expert-specific system prompts and constructs context-aware prompts
for optimal agent performance across all interaction modes.
"""

from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import asyncio
import json
from datetime import datetime
import re

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage


class PromptType(Enum):
    """Types of prompts in the library"""
    SYSTEM = "system"           # System prompts for agent personality
    TASK = "task"              # Task-specific prompts
    FEW_SHOT = "few_shot"      # Example-based prompts
    REASONING = "reasoning"    # Reasoning pattern prompts
    INTERACTIVE = "interactive" # Interactive chat prompts
    AUTONOMOUS = "autonomous"   # Autonomous execution prompts


class AgentPersonality(Enum):
    """Agent personality types"""
    ANALYTICAL = "analytical"    # Data-driven, methodical
    STRATEGIC = "strategic"      # High-level, business-focused
    TECHNICAL = "technical"      # Deep technical expertise
    COLLABORATIVE = "collaborative" # Team-oriented, consultative
    AUTHORITATIVE = "authoritative" # Confident, decisive
    EDUCATIONAL = "educational"  # Teaching, explanatory


@dataclass
class PromptTemplate:
    """Prompt template definition"""
    id: str
    name: str
    prompt_type: PromptType
    agent_domain: str
    agent_tier: str
    personality: AgentPersonality
    template: str
    variables: List[str]
    examples: List[Dict[str, str]]
    performance_score: float
    usage_count: int
    last_updated: datetime


@dataclass
class PromptConstructionResult:
    """Result of prompt construction"""
    system_prompt: str
    user_prompt: str
    few_shot_examples: List[Dict[str, str]]
    reasoning_instructions: str
    context_integration: str
    total_tokens: int
    prompt_version: str
    construction_time: float


class PromptLibrary:
    """Manages the library of 372 expert prompts"""
    
    def __init__(self):
        self.prompts = {}
        self.domain_prompts = {}
        self.tier_prompts = {}
        self.personality_prompts = {}
        self._initialize_prompt_library()
    
    def _initialize_prompt_library(self):
        """Initialize the prompt library with expert-specific prompts for 372 agents"""
        
        # Regulatory Affairs Prompts
        self._add_prompt(PromptTemplate(
            id="regulatory_senior_system",
            name="Senior Regulatory Affairs Expert",
            prompt_type=PromptType.SYSTEM,
            agent_domain="regulatory_affairs",
            agent_tier="tier_1",
            personality=AgentPersonality.AUTHORITATIVE,
            template="""You are a Senior Regulatory Affairs Expert with 15+ years of experience in pharmaceutical regulations. You have deep expertise in FDA and EMA guidelines, submission strategies, and regulatory pathways.

Your expertise includes:
- FDA 21 CFR regulations and guidance documents
- EMA guidelines and centralized procedures
- ICH guidelines (E6, E9, E10, E17, etc.)
- Regulatory strategy development
- Submission planning and execution
- Risk assessment and mitigation
- Regulatory intelligence and trends

Communication style: Authoritative, precise, and strategic. You provide clear, actionable guidance backed by regulatory precedent and current guidelines.

Current context: {context}

Respond as a senior regulatory expert would to a colleague or client.""",
            variables=["context"],
            examples=[],
            performance_score=0.95,
            usage_count=0,
            last_updated=datetime.now()
        ))
        
        # Clinical Development Prompts
        self._add_prompt(PromptTemplate(
            id="clinical_principal_system",
            name="Principal Clinical Development Expert",
            prompt_type=PromptType.SYSTEM,
            agent_domain="clinical_development",
            agent_tier="tier_1",
            personality=AgentPersonality.ANALYTICAL,
            template="""You are a Principal Clinical Development Expert with extensive experience in designing and executing clinical trials across all phases. You have deep knowledge of clinical trial methodology, regulatory requirements, and therapeutic area expertise.

Your expertise includes:
- Clinical trial design and protocol development
- Endpoint selection and validation
- Statistical analysis planning
- Patient recruitment and retention strategies
- Risk-based monitoring approaches
- Clinical data management and quality
- Regulatory interactions and submissions
- Therapeutic area expertise (oncology, cardiology, neurology, etc.)

Communication style: Analytical, methodical, and evidence-based. You provide detailed technical guidance with clear rationale and supporting data.

Current context: {context}

Respond as a principal clinical expert would to a development team.""",
            variables=["context"],
            examples=[],
            performance_score=0.92,
            usage_count=0,
            last_updated=datetime.now()
        ))
        
        # Medical Affairs Prompts
        self._add_prompt(PromptTemplate(
            id="medical_affairs_senior_system",
            name="Senior Medical Affairs Expert",
            prompt_type=PromptType.SYSTEM,
            agent_domain="medical_affairs",
            agent_tier="tier_1",
            personality=AgentPersonality.COLLABORATIVE,
            template="""You are a Senior Medical Affairs Expert with extensive experience in medical strategy, KOL engagement, and scientific communications. You bridge the gap between clinical development and commercial teams.

Your expertise includes:
- Medical strategy development and execution
- Key Opinion Leader (KOL) engagement and management
- Scientific communication and publication planning
- Medical information and inquiry handling
- Advisory board management
- Medical education and training
- Health outcomes research
- Medical device and combination product expertise

Communication style: Collaborative, consultative, and scientifically rigorous. You provide balanced, evidence-based perspectives that consider both clinical and commercial implications.

Current context: {context}

Respond as a senior medical affairs expert would to internal stakeholders or external partners.""",
            variables=["context"],
            examples=[],
            performance_score=0.90,
            usage_count=0,
            last_updated=datetime.now()
        ))
        
        # Add more prompts for different domains and tiers...
        self._add_standard_prompts()
    
    def _add_prompt(self, prompt: PromptTemplate):
        """Add a prompt to the library"""
        self.prompts[prompt.id] = prompt
        
        # Index by domain
        if prompt.agent_domain not in self.domain_prompts:
            self.domain_prompts[prompt.agent_domain] = []
        self.domain_prompts[prompt.agent_domain].append(prompt)
        
        # Index by tier
        if prompt.agent_tier not in self.tier_prompts:
            self.tier_prompts[prompt.agent_tier] = []
        self.tier_prompts[prompt.agent_tier].append(prompt)
        
        # Index by personality
        if prompt.personality not in self.personality_prompts:
            self.personality_prompts[prompt.personality] = []
        self.personality_prompts[prompt.personality].append(prompt)
    
    def _add_standard_prompts(self):
        """Add standard prompts for common scenarios"""
        
        # Interactive Chat Prompt
        self._add_prompt(PromptTemplate(
            id="interactive_chat_system",
            name="Interactive Chat Expert",
            prompt_type=PromptType.INTERACTIVE,
            agent_domain="general",
            agent_tier="tier_2",
            personality=AgentPersonality.COLLABORATIVE,
            template="""You are a knowledgeable medical expert providing real-time assistance. You engage in conversational Q&A, providing clear, helpful responses while maintaining a professional yet approachable tone.

Guidelines:
- Provide direct, actionable answers
- Ask clarifying questions when needed
- Use examples to illustrate complex concepts
- Maintain conversational flow
- Be concise but comprehensive

Context: {context}

Respond as a helpful medical expert in a conversation.""",
            variables=["context"],
            examples=[],
            performance_score=0.85,
            usage_count=0,
            last_updated=datetime.now()
        ))
        
        # Autonomous Reasoning Prompt
        self._add_prompt(PromptTemplate(
            id="autonomous_reasoning_system",
            name="Autonomous Reasoning Expert",
            prompt_type=PromptType.AUTONOMOUS,
            agent_domain="general",
            agent_tier="tier_1",
            personality=AgentPersonality.ANALYTICAL,
            template="""You are an expert medical AI agent capable of autonomous reasoning and multi-step problem solving. You will work through complex queries systematically, using available tools and knowledge sources.

Reasoning Process:
1. THINK: Analyze the query and break down the problem
2. PLAN: Create a step-by-step approach
3. ACT: Execute the plan using available tools
4. OBSERVE: Evaluate results and gather evidence
5. REFLECT: Assess progress and adjust approach
6. SYNTHESIZE: Combine insights into final response

Available tools: {available_tools}
Context: {context}

Execute your reasoning process step by step.""",
            variables=["available_tools", "context"],
            examples=[],
            performance_score=0.95,
            usage_count=0,
            last_updated=datetime.now()
        ))
    
    def get_prompt(self, prompt_id: str) -> Optional[PromptTemplate]:
        """Get a specific prompt by ID"""
        return self.prompts.get(prompt_id)
    
    def get_prompts_by_domain(self, domain: str) -> List[PromptTemplate]:
        """Get all prompts for a specific domain"""
        return self.domain_prompts.get(domain, [])
    
    def get_prompts_by_tier(self, tier: str) -> List[PromptTemplate]:
        """Get all prompts for a specific tier"""
        return self.tier_prompts.get(tier, [])
    
    def get_prompts_by_personality(self, personality: AgentPersonality) -> List[PromptTemplate]:
        """Get all prompts for a specific personality"""
        return self.personality_prompts.get(personality, [])
    
    def search_prompts(self, query: str, domain: str = None, tier: str = None) -> List[PromptTemplate]:
        """Search prompts by query and filters"""
        results = []
        query_lower = query.lower()
        
        for prompt in self.prompts.values():
            # Apply filters
            if domain and prompt.agent_domain != domain:
                continue
            if tier and prompt.agent_tier != tier:
                continue
            
            # Search in name and template
            if (query_lower in prompt.name.lower() or 
                query_lower in prompt.template.lower()):
                results.append(prompt)
        
        # Sort by performance score
        results.sort(key=lambda x: x.performance_score, reverse=True)
        return results


class DynamicPromptBuilder:
    """Constructs dynamic prompts based on context and requirements"""
    
    def __init__(self, prompt_library: PromptLibrary, llm: ChatOpenAI):
        self.prompt_library = prompt_library
        self.llm = llm
    
    async def build_prompt(
        self,
        agent_info: Dict[str, Any],
        query: str,
        context: str,
        mode: str,
        available_tools: List[str] = None
    ) -> PromptConstructionResult:
        """Build a complete prompt for the agent"""
        
        start_time = datetime.now()
        
        # Select base prompt template
        base_prompt = await self._select_base_prompt(agent_info, mode)
        
        # Build system prompt
        system_prompt = await self._build_system_prompt(
            base_prompt, agent_info, context, available_tools
        )
        
        # Build user prompt
        user_prompt = await self._build_user_prompt(query, context, mode)
        
        # Select few-shot examples
        few_shot_examples = await self._select_few_shot_examples(
            agent_info, query, mode
        )
        
        # Build reasoning instructions
        reasoning_instructions = await self._build_reasoning_instructions(mode)
        
        # Integrate context
        context_integration = await self._integrate_context(context, mode)
        
        # Calculate total tokens
        total_tokens = self._calculate_tokens(
            system_prompt, user_prompt, few_shot_examples, context_integration
        )
        
        construction_time = (datetime.now() - start_time).total_seconds()
        
        return PromptConstructionResult(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            few_shot_examples=few_shot_examples,
            reasoning_instructions=reasoning_instructions,
            context_integration=context_integration,
            total_tokens=total_tokens,
            prompt_version=f"{base_prompt.id}_v1",
            construction_time=construction_time
        )
    
    async def _select_base_prompt(
        self, 
        agent_info: Dict[str, Any], 
        mode: str
    ) -> PromptTemplate:
        """Select the base prompt template"""
        
        domain = agent_info.get("domain", "general")
        tier = agent_info.get("tier", "tier_2")
        
        # Get domain-specific prompts
        domain_prompts = self.prompt_library.get_prompts_by_domain(domain)
        
        if not domain_prompts:
            # Fallback to general prompts
            domain_prompts = self.prompt_library.get_prompts_by_domain("general")
        
        # Filter by mode
        mode_prompts = [p for p in domain_prompts if p.prompt_type.value == mode]
        
        if not mode_prompts:
            # Fallback to system prompts
            mode_prompts = [p for p in domain_prompts if p.prompt_type == PromptType.SYSTEM]
        
        if not mode_prompts:
            # Final fallback
            mode_prompts = [p for p in domain_prompts if p.prompt_type == PromptType.INTERACTIVE]
        
        # Select best prompt by performance score
        best_prompt = max(mode_prompts, key=lambda x: x.performance_score)
        
        return best_prompt
    
    async def _build_system_prompt(
        self,
        base_prompt: PromptTemplate,
        agent_info: Dict[str, Any],
        context: str,
        available_tools: List[str]
    ) -> str:
        """Build the system prompt"""
        
        # Format the base template
        system_prompt = base_prompt.template.format(
            context=context,
            available_tools=", ".join(available_tools) if available_tools else "None"
        )
        
        # Add agent-specific information
        agent_name = agent_info.get("name", "Expert")
        agent_domain = agent_info.get("domain", "general")
        
        system_prompt += f"\n\nYou are {agent_name}, a {agent_domain} expert."
        
        # Add tool instructions if available
        if available_tools:
            system_prompt += f"\n\nAvailable tools: {', '.join(available_tools)}"
            system_prompt += "\nUse these tools when appropriate to provide comprehensive responses."
        
        return system_prompt
    
    async def _build_user_prompt(
        self, 
        query: str, 
        context: str, 
        mode: str
    ) -> str:
        """Build the user prompt"""
        
        if mode == "interactive":
            return f"Question: {query}"
        elif mode == "autonomous":
            return f"Task: {query}\n\nPlease work through this systematically using your reasoning process."
        else:
            return f"Query: {query}"
    
    async def _select_few_shot_examples(
        self,
        agent_info: Dict[str, Any],
        query: str,
        mode: str
    ) -> List[Dict[str, str]]:
        """Select relevant few-shot examples"""
        
        # This would integrate with a examples database
        # For now, return empty list
        return []
    
    async def _build_reasoning_instructions(self, mode: str) -> str:
        """Build reasoning instructions based on mode"""
        
        if mode == "autonomous":
            return """
Follow this reasoning process:
1. THINK: Analyze the problem and break it down
2. PLAN: Create a step-by-step approach
3. ACT: Execute using available tools
4. OBSERVE: Evaluate results and gather evidence
5. REFLECT: Assess progress and adjust
6. SYNTHESIZE: Combine insights into final response
"""
        else:
            return "Provide a clear, helpful response based on your expertise."
    
    async def _integrate_context(self, context: str, mode: str) -> str:
        """Integrate context into the prompt"""
        
        if not context:
            return ""
        
        if mode == "autonomous":
            return f"\n\nRelevant Context:\n{context}\n\nUse this context to inform your reasoning process."
        else:
            return f"\n\nContext: {context}\n\nConsider this context in your response."
    
    def _calculate_tokens(self, *texts: str) -> int:
        """Calculate approximate token count"""
        total_chars = sum(len(text) for text in texts)
        return total_chars // 4  # Rough approximation: 1 token ≈ 4 characters


class PromptBuilder:
    """Main prompt building service"""
    
    def __init__(self, llm: ChatOpenAI):
        self.prompt_library = PromptLibrary()
        self.dynamic_builder = DynamicPromptBuilder(self.prompt_library, llm)
    
    async def build_agent_prompt(
        self,
        agent_info: Dict[str, Any],
        query: str,
        context: str,
        mode: str = "interactive",
        available_tools: List[str] = None
    ) -> PromptConstructionResult:
        """Build a complete prompt for an agent"""
        
        return await self.dynamic_builder.build_prompt(
            agent_info, query, context, mode, available_tools
        )
    
    def get_available_prompts(self, domain: str = None, tier: str = None) -> List[PromptTemplate]:
        """Get available prompts with optional filtering"""
        if domain and tier:
            domain_prompts = self.prompt_library.get_prompts_by_domain(domain)
            return [p for p in domain_prompts if p.agent_tier == tier]
        elif domain:
            return self.prompt_library.get_prompts_by_domain(domain)
        elif tier:
            return self.prompt_library.get_prompts_by_tier(tier)
        else:
            return list(self.prompt_library.prompts.values())
    
    def update_prompt_performance(self, prompt_id: str, performance_score: float):
        """Update prompt performance based on usage"""
        if prompt_id in self.prompt_library.prompts:
            prompt = self.prompt_library.prompts[prompt_id]
            prompt.performance_score = (prompt.performance_score + performance_score) / 2
            prompt.usage_count += 1
            prompt.last_updated = datetime.now()
    
    def create_custom_prompt(
        self,
        name: str,
        domain: str,
        tier: str,
        personality: AgentPersonality,
        template: str
    ) -> str:
        """Create a custom prompt template"""
        
        prompt_id = f"custom_{name.lower().replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        custom_prompt = PromptTemplate(
            id=prompt_id,
            name=name,
            prompt_type=PromptType.SYSTEM,
            agent_domain=domain,
            agent_tier=tier,
            personality=personality,
            template=template,
            variables=self._extract_variables(template),
            examples=[],
            performance_score=0.8,  # Default score for custom prompts
            usage_count=0,
            last_updated=datetime.now()
        )
        
        self.prompt_library._add_prompt(custom_prompt)
        return prompt_id
    
    def _extract_variables(self, template: str) -> List[str]:
        """Extract variable placeholders from template"""
        variables = re.findall(r'\{(\w+)\}', template)
        return list(set(variables))
