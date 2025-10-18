from typing import List, Dict, Any
from langchain.vectorstores import SupabaseVectorStore
from langchain.embeddings import OpenAIEmbeddings
import asyncio

class MultiDomainRAGConnector:
    """Access all 30 VITAL knowledge domains via RAG"""
    
    # All 30 Knowledge Domains (Tier 1-3)
    KNOWLEDGE_DOMAINS = {
        # Tier 1: Core Domains (15)
        "regulatory_affairs": "Regulatory Affairs (85 agents)",
        "clinical_development": "Clinical Development (37 agents)",
        "pharmacovigilance": "Pharmacovigilance (25 agents)",
        "quality_management": "Quality Management (20 agents)",
        "medical_affairs": "Medical Affairs (15 agents)",
        "commercial_strategy": "Commercial Strategy (29 agents)",
        "drug_development": "Drug Development (39 agents)",
        "clinical_data_analytics": "Clinical Data Analytics (18 agents)",
        "manufacturing_operations": "Manufacturing Operations (17 agents)",
        "medical_devices": "Medical Devices (12 agents)",
        "digital_health": "Digital Health (34 agents)",
        "supply_chain": "Supply Chain (15 agents)",
        "legal_compliance": "Legal & Compliance (10 agents)",
        "health_economics": "Health Economics (12 agents)",
        "business_strategy": "Business Strategy (10 agents)",
        
        # Tier 2: Specialized Domains (10)
        "product_labeling": "Product Labeling (8 agents)",
        "post_market_activities": "Post-Market Activities (10 agents)",
        "companion_diagnostics": "Companion Diagnostics (6 agents)",
        "nonclinical_sciences": "Nonclinical Sciences (12 agents)",
        "patient_focus": "Patient Engagement (5 agents)",
        "risk_management": "Risk Management (8 agents)",
        "scientific_publications": "Scientific Publications (7 agents)",
        "kol_stakeholder": "KOL & Stakeholder Engagement (6 agents)",
        "evidence_generation": "Evidence Generation (5 agents)",
        "global_market_access": "Global Market Access (8 agents)",
        
        # Tier 3: Emerging Domains (5)
        "real_world_data": "Real-World Data & Evidence (8 agents)",
        "precision_medicine": "Precision Medicine (6 agents)",
        "telemedicine": "Telemedicine & Remote Care (5 agents)",
        "ai_ml_healthcare": "AI/ML in Healthcare (7 agents)",
        "value_based_care": "Value-Based Care (4 agents)"
    }
    
    def __init__(self, supabase_client, embeddings):
        self.supabase = supabase_client
        self.embeddings = embeddings
        self.domain_stores = {}
    
    async def search_by_domain(
        self, 
        query: str, 
        domains: List[str], 
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Search specific knowledge domains"""
        results = []
        
        for domain in domains:
            if domain not in self.KNOWLEDGE_DOMAINS:
                continue
            
            try:
                # Query Supabase RAG system filtered by domain
                response = await self.supabase.rpc(
                    'search_rag_knowledge',
                    {
                        'query_embedding': await self.embeddings.aembed_query(query),
                        'p_domain': domain,
                        'match_threshold': 0.7,
                        'match_count': top_k
                    }
                )
                
                if response.data:
                    # Add domain metadata to results
                    for result in response.data:
                        result['domain'] = domain
                        result['domain_name'] = self.KNOWLEDGE_DOMAINS[domain]
                    results.extend(response.data)
            except Exception as e:
                print(f"Error searching domain {domain}: {e}")
                continue
        
        return results
    
    async def search_all_domains(
        self, 
        query: str, 
        top_k_per_domain: int = 3
    ) -> Dict[str, List[Dict]]:
        """Search across all 30 domains"""
        all_results = {}
        
        # Search domains in parallel for efficiency
        tasks = []
        for domain_key in self.KNOWLEDGE_DOMAINS.keys():
            task = self.search_by_domain(query, [domain_key], top_k_per_domain)
            tasks.append((domain_key, task))
        
        # Wait for all searches to complete
        results = await asyncio.gather(*[task for _, task in tasks], return_exceptions=True)
        
        for i, (domain_key, result) in enumerate(zip(self.KNOWLEDGE_DOMAINS.keys(), results)):
            if not isinstance(result, Exception) and result:
                all_results[domain_key] = result
        
        return all_results
    
    async def get_domain_recommendations(
        self, 
        query: str, 
        max_domains: int = 5
    ) -> List[str]:
        """Get recommended domains for a query using semantic similarity"""
        try:
            # Use LLM to analyze query and recommend domains
            query_embedding = await self.embeddings.aembed_query(query)
            
            # Calculate similarity with domain descriptions
            domain_scores = []
            for domain_key, description in self.KNOWLEDGE_DOMAINS.items():
                domain_embedding = await self.embeddings.aembed_query(description)
                # Simple cosine similarity (in production, use proper vector similarity)
                similarity = self._cosine_similarity(query_embedding, domain_embedding)
                domain_scores.append((domain_key, similarity))
            
            # Sort by similarity and return top domains
            domain_scores.sort(key=lambda x: x[1], reverse=True)
            return [domain for domain, _ in domain_scores[:max_domains]]
            
        except Exception as e:
            print(f"Error getting domain recommendations: {e}")
            # Fallback to core domains
            return ["regulatory_affairs", "clinical_development", "medical_affairs"]
    
    def _cosine_similarity(self, a: List[float], b: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        import numpy as np
        a = np.array(a)
        b = np.array(b)
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
