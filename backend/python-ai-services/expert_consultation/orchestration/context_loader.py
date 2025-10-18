"""
Context Loading (RAG Selection) for VITAL Ask Expert Service

Intelligently selects and loads relevant context from the 30 knowledge domains
based on query analysis and domain relevance scoring.
"""

from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import asyncio
import json
from datetime import datetime

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

from ..knowledge.rag_connector import MultiDomainRAGConnector


class DomainTier(Enum):
    """Knowledge domain tiers based on priority"""
    TIER_1 = "tier_1"  # Core medical/pharmaceutical domains
    TIER_2 = "tier_2"  # Supporting domains
    TIER_3 = "tier_3"  # Specialized/niche domains


@dataclass
class DomainRelevance:
    """Domain relevance scoring"""
    domain: str
    relevance_score: float  # 0-1
    tier: DomainTier
    document_count: int
    avg_similarity: float
    reasoning: str


@dataclass
class ContextChunk:
    """Individual context chunk"""
    content: str
    domain: str
    similarity_score: float
    metadata: Dict[str, Any]
    source: str


@dataclass
class ContextLoadResult:
    """Result of context loading process"""
    chunks: List[ContextChunk]
    domains_used: List[str]
    total_tokens: int
    relevance_scores: Dict[str, float]
    loading_time: float
    token_budget_used: float


class DomainSelector:
    """Selects relevant knowledge domains for queries"""
    
    def __init__(self, rag_connector: MultiDomainRAGConnector, llm: ChatOpenAI):
        self.rag_connector = rag_connector
        self.llm = llm
        self.domain_tiers = self._initialize_domain_tiers()
        self.domain_prompt = self._build_domain_prompt()
    
    def _initialize_domain_tiers(self) -> Dict[str, DomainTier]:
        """Initialize domain tier classifications"""
        return {
            # Tier 1 - Core domains
            "regulatory_affairs": DomainTier.TIER_1,
            "clinical_development": DomainTier.TIER_1,
            "medical_affairs": DomainTier.TIER_1,
            "pharmacovigilance": DomainTier.TIER_1,
            "drug_development": DomainTier.TIER_1,
            "fda_guidance": DomainTier.TIER_1,
            "ema_guidance": DomainTier.TIER_1,
            
            # Tier 2 - Supporting domains
            "biostatistics": DomainTier.TIER_2,
            "data_management": DomainTier.TIER_2,
            "quality_assurance": DomainTier.TIER_2,
            "manufacturing": DomainTier.TIER_2,
            "commercialization": DomainTier.TIER_2,
            "market_access": DomainTier.TIER_2,
            "health_economics": DomainTier.TIER_2,
            "real_world_evidence": DomainTier.TIER_2,
            
            # Tier 3 - Specialized domains
            "digital_health": DomainTier.TIER_3,
            "precision_medicine": DomainTier.TIER_3,
            "rare_diseases": DomainTier.TIER_3,
            "oncology": DomainTier.TIER_3,
            "neurology": DomainTier.TIER_3,
            "cardiology": DomainTier.TIER_3,
            "pediatrics": DomainTier.TIER_3,
            "geriatrics": DomainTier.TIER_3,
            "infectious_diseases": DomainTier.TIER_3,
            "immunology": DomainTier.TIER_3,
            "oncology_immunotherapy": DomainTier.TIER_3,
            "cell_gene_therapy": DomainTier.TIER_3,
            "biomarkers": DomainTier.TIER_3,
            "companion_diagnostics": DomainTier.TIER_3,
            "medical_devices": DomainTier.TIER_3,
            "combination_products": DomainTier.TIER_3,
            "biosimilars": DomainTier.TIER_3,
            "generic_drugs": DomainTier.TIER_3,
            "otc_products": DomainTier.TIER_3,
            "dietary_supplements": DomainTier.TIER_3,
            "cosmetics": DomainTier.TIER_3
        }
    
    def _build_domain_prompt(self) -> str:
        """Build domain selection prompt"""
        return """
You are an expert domain selector for VITAL's medical knowledge base. Analyze queries to identify the most relevant knowledge domains from our 30 specialized domains.

Available Domains (by tier):

TIER 1 (Core Medical/Pharmaceutical):
- regulatory_affairs: FDA/EMA regulations, submissions, approvals
- clinical_development: Clinical trials, study design, endpoints
- medical_affairs: Medical information, KOL engagement, publications
- pharmacovigilance: Drug safety, adverse events, risk management
- drug_development: Drug discovery, preclinical, formulation
- fda_guidance: FDA guidance documents, policies
- ema_guidance: EMA guidance documents, policies

TIER 2 (Supporting Domains):
- biostatistics: Statistical analysis, trial design
- data_management: Clinical data, databases, standards
- quality_assurance: GMP, quality systems, compliance
- manufacturing: Drug production, supply chain
- commercialization: Market launch, pricing, access
- market_access: Payer negotiations, health technology assessment
- health_economics: Cost-effectiveness, outcomes research
- real_world_evidence: Post-market studies, registries

TIER 3 (Specialized Domains):
- digital_health: Digital therapeutics, apps, wearables
- precision_medicine: Personalized medicine, biomarkers
- rare_diseases: Orphan drugs, small populations
- oncology: Cancer treatments, clinical trials
- neurology: Neurological disorders, treatments
- cardiology: Cardiovascular diseases, treatments
- pediatrics: Pediatric medicine, age-appropriate dosing
- geriatrics: Elderly care, polypharmacy
- infectious_diseases: Antibiotics, vaccines, pandemics
- immunology: Immune system, autoimmune diseases
- oncology_immunotherapy: Cancer immunotherapy
- cell_gene_therapy: Advanced therapies
- biomarkers: Diagnostic markers, companion diagnostics
- companion_diagnostics: Test development, regulatory
- medical_devices: Device development, regulations
- combination_products: Drug-device combinations
- biosimilars: Biosimilar development, regulations
- generic_drugs: Generic drug development
- otc_products: Over-the-counter medications
- dietary_supplements: Supplements, nutraceuticals
- cosmetics: Cosmetic products, regulations

Analyze this query and select the most relevant domains:

Query: {query}
Context: {context}

Respond in JSON format:
{{
    "primary_domains": ["domain1", "domain2"],
    "secondary_domains": ["domain3", "domain4"],
    "tier_1_domains": ["domain1"],
    "tier_2_domains": ["domain2"],
    "tier_3_domains": ["domain3"],
    "reasoning": "Explanation of domain selection",
    "confidence": 0.9
}}
"""
    
    async def select_domains(
        self, 
        query: str, 
        context: Dict[str, Any] = None,
        max_domains: int = 5
    ) -> List[DomainRelevance]:
        """Select most relevant domains for the query"""
        
        context = context or {}
        
        # Build prompt
        prompt = self.domain_prompt.format(
            query=query,
            context=json.dumps(context, indent=2)
        )
        
        # Get LLM domain selection
        messages = [
            SystemMessage(content="You are an expert domain selector. Always respond with valid JSON."),
            HumanMessage(content=prompt)
        ]
        
        try:
            response = await self.llm.ainvoke(messages)
            domain_data = json.loads(response.content)
            
            # Build domain relevance objects
            domains = []
            
            # Process primary domains (highest priority)
            for domain in domain_data.get("primary_domains", []):
                if domain in self.domain_tiers:
                    domains.append(DomainRelevance(
                        domain=domain,
                        relevance_score=0.9,
                        tier=self.domain_tiers[domain],
                        document_count=0,  # Will be filled by RAG search
                        avg_similarity=0.0,  # Will be filled by RAG search
                        reasoning=f"Primary domain for query: {domain_data.get('reasoning', '')}"
                    ))
            
            # Process secondary domains
            for domain in domain_data.get("secondary_domains", []):
                if domain in self.domain_tiers and len(domains) < max_domains:
                    domains.append(DomainRelevance(
                        domain=domain,
                        relevance_score=0.7,
                        tier=self.domain_tiers[domain],
                        document_count=0,
                        avg_similarity=0.0,
                        reasoning=f"Secondary domain for query: {domain_data.get('reasoning', '')}"
                    ))
            
            return domains[:max_domains]
            
        except Exception as e:
            # Fallback to keyword-based domain selection
            return await self._fallback_domain_selection(query, max_domains)
    
    async def _fallback_domain_selection(self, query: str, max_domains: int) -> List[DomainRelevance]:
        """Fallback domain selection using keyword matching"""
        query_lower = query.lower()
        
        # Keyword to domain mapping
        domain_keywords = {
            "regulatory_affairs": ["fda", "ema", "regulation", "approval", "submission"],
            "clinical_development": ["trial", "study", "clinical", "patient", "efficacy"],
            "medical_affairs": ["medical", "physician", "kol", "publication"],
            "pharmacovigilance": ["safety", "adverse", "side effect", "monitoring"],
            "drug_development": ["drug", "compound", "molecule", "formulation"],
            "oncology": ["cancer", "tumor", "oncology", "chemotherapy"],
            "cardiology": ["cardiac", "heart", "cardiovascular"],
            "neurology": ["neurological", "brain", "nervous system"]
        }
        
        domains = []
        for domain, keywords in domain_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                if domain in self.domain_tiers:
                    domains.append(DomainRelevance(
                        domain=domain,
                        relevance_score=0.6,  # Lower confidence for fallback
                        tier=self.domain_tiers[domain],
                        document_count=0,
                        avg_similarity=0.0,
                        reasoning="Fallback selection based on keyword matching"
                    ))
        
        # If no domains found, default to regulatory_affairs
        if not domains:
            domains.append(DomainRelevance(
                domain="regulatory_affairs",
                relevance_score=0.5,
                tier=DomainTier.TIER_1,
                document_count=0,
                avg_similarity=0.0,
                reasoning="Default fallback domain"
            ))
        
        return domains[:max_domains]


class RAGSelector:
    """Selects and retrieves relevant RAG content"""
    
    def __init__(self, rag_connector: MultiDomainRAGConnector):
        self.rag_connector = rag_connector
    
    async def retrieve_context(
        self,
        query: str,
        domains: List[DomainRelevance],
        max_chunks_per_domain: int = 5,
        token_budget: int = 8000
    ) -> ContextLoadResult:
        """Retrieve relevant context from selected domains"""
        
        start_time = datetime.now()
        all_chunks = []
        domains_used = []
        relevance_scores = {}
        
        # Retrieve from each domain
        for domain_relevance in domains:
            try:
                # Search domain
                results = await self.rag_connector.search_by_domain(
                    query=query,
                    domains=[domain_relevance.domain],
                    top_k=max_chunks_per_domain
                )
                
                if results:
                    domains_used.append(domain_relevance.domain)
                    relevance_scores[domain_relevance.domain] = domain_relevance.relevance_score
                    
                    # Convert to context chunks
                    for result in results:
                        chunk = ContextChunk(
                            content=result.get("content", ""),
                            domain=domain_relevance.domain,
                            similarity_score=result.get("similarity", 0.0),
                            metadata=result.get("metadata", {}),
                            source=result.get("source", "unknown")
                        )
                        all_chunks.append(chunk)
                
            except Exception as e:
                # Continue with other domains if one fails
                continue
        
        # Sort by similarity score
        all_chunks.sort(key=lambda x: x.similarity_score, reverse=True)
        
        # Apply token budget
        selected_chunks = self._apply_token_budget(all_chunks, token_budget)
        
        # Calculate metrics
        total_tokens = sum(len(chunk.content.split()) for chunk in selected_chunks)
        loading_time = (datetime.now() - start_time).total_seconds()
        token_budget_used = total_tokens / token_budget if token_budget > 0 else 0
        
        return ContextLoadResult(
            chunks=selected_chunks,
            domains_used=domains_used,
            total_tokens=total_tokens,
            relevance_scores=relevance_scores,
            loading_time=loading_time,
            token_budget_used=token_budget_used
        )
    
    def _apply_token_budget(self, chunks: List[ContextChunk], token_budget: int) -> List[ContextChunk]:
        """Apply token budget to select most relevant chunks"""
        selected = []
        current_tokens = 0
        
        for chunk in chunks:
            chunk_tokens = len(chunk.content.split())
            if current_tokens + chunk_tokens <= token_budget:
                selected.append(chunk)
                current_tokens += chunk_tokens
            else:
                # Try to fit partial chunk if it's very relevant
                if chunk.similarity_score > 0.8 and current_tokens < token_budget * 0.9:
                    # Truncate chunk to fit
                    remaining_tokens = token_budget - current_tokens
                    if remaining_tokens > 50:  # Only if meaningful content remains
                        truncated_content = " ".join(chunk.content.split()[:remaining_tokens])
                        truncated_chunk = ContextChunk(
                            content=truncated_content + "...",
                            domain=chunk.domain,
                            similarity_score=chunk.similarity_score,
                            metadata=chunk.metadata,
                            source=chunk.source
                        )
                        selected.append(truncated_chunk)
                break
        
        return selected


class ContextLoader:
    """Main context loading service"""
    
    def __init__(self, rag_connector: MultiDomainRAGConnector, llm: ChatOpenAI):
        self.domain_selector = DomainSelector(rag_connector, llm)
        self.rag_selector = RAGSelector(rag_connector)
    
    async def load_context(
        self,
        query: str,
        context: Dict[str, Any] = None,
        max_domains: int = 5,
        max_chunks_per_domain: int = 5,
        token_budget: int = 8000
    ) -> ContextLoadResult:
        """Load relevant context for a query"""
        
        # Select relevant domains
        domains = await self.domain_selector.select_domains(
            query, context, max_domains
        )
        
        # Retrieve context from domains
        result = await self.rag_selector.retrieve_context(
            query, domains, max_chunks_per_domain, token_budget
        )
        
        return result
    
    async def get_domain_summary(self, domain: str) -> Dict[str, Any]:
        """Get summary information about a domain"""
        # This would integrate with domain metadata
        return {
            "domain": domain,
            "description": f"Knowledge domain: {domain}",
            "document_count": 0,  # Would be fetched from database
            "last_updated": None,
            "tier": "tier_1"
        }
    
    def format_context_for_prompt(self, context_result: ContextLoadResult) -> str:
        """Format context for inclusion in LLM prompts"""
        if not context_result.chunks:
            return "No relevant context found."
        
        formatted_sections = []
        current_domain = None
        
        for chunk in context_result.chunks:
            if chunk.domain != current_domain:
                current_domain = chunk.domain
                formatted_sections.append(f"\n## {current_domain.replace('_', ' ').title()}\n")
            
            formatted_sections.append(f"{chunk.content}\n")
        
        return "\n".join(formatted_sections)
