from typing import List, Dict, Any, Optional
import asyncio
import json
from datetime import datetime

class AgentStoreConnector:
    """Access VITAL's agent store with 372 specialized agents"""
    
    def __init__(self, supabase_client):
        self.supabase = supabase_client
    
    async def get_agents_by_domain(self, domain: str) -> List[Dict]:
        """Get all agents for a specific knowledge domain"""
        try:
            response = await self.supabase.from_('agents').select('*').contains(
                'knowledge_domains', 
                [domain]
            ).eq('status', 'active').execute()
            
            return response.data if response.data else []
        except Exception as e:
            print(f"Error getting agents by domain {domain}: {e}")
            return []
    
    async def get_expert_agents(self, domains: List[str]) -> List[Dict]:
        """Get expert agents matching multiple domains"""
        try:
            response = await self.supabase.from_('agents').select('*').overlaps(
                'knowledge_domains',
                domains
            ).eq('status', 'active').order('tier').execute()
            
            return response.data if response.data else []
        except Exception as e:
            print(f"Error getting expert agents for domains {domains}: {e}")
            return []
    
    async def get_agent_capabilities(self, agent_id: str) -> Dict:
        """Get detailed agent capabilities and system prompt"""
        try:
            response = await self.supabase.from_('agents').select(
                'id, name, display_name, description, system_prompt, '
                'capabilities, knowledge_domains, business_function'
            ).eq('id', agent_id).single().execute()
            
            return response.data
        except Exception as e:
            print(f"Error getting agent capabilities for {agent_id}: {e}")
            return {}
    
    async def get_agents_by_tier(self, tier: int) -> List[Dict]:
        """Get agents by tier (1=Core, 2=Specialized, 3=Emerging)"""
        try:
            response = await self.supabase.from_('agents').select('*').eq(
                'tier', tier
            ).eq('status', 'active').order('priority').execute()
            
            return response.data if response.data else []
        except Exception as e:
            print(f"Error getting agents by tier {tier}: {e}")
            return []
    
    async def search_agents(self, search_term: str) -> List[Dict]:
        """Search agents by name, description, or capabilities"""
        try:
            response = await self.supabase.from_('agents').select('*').or_(
                f'name.ilike.%{search_term}%,'
                f'display_name.ilike.%{search_term}%,'
                f'description.ilike.%{search_term}%,'
                f'business_function.ilike.%{search_term}%'
            ).eq('status', 'active').execute()
            
            return response.data if response.data else []
        except Exception as e:
            print(f"Error searching agents with term '{search_term}': {e}")
            return []
    
    async def get_agent_recommendations(
        self, 
        query: str, 
        max_agents: int = 5
    ) -> List[Dict]:
        """Get agent recommendations based on query similarity"""
        try:
            # Get all active agents
            all_agents = await self.supabase.from_('agents').select('*').eq(
                'status', 'active'
            ).execute()
            
            if not all_agents.data:
                return []
            
            # Simple text matching for now (in production, use semantic similarity)
            query_lower = query.lower()
            scored_agents = []
            
            for agent in all_agents.data:
                score = 0
                # Score based on name and description matches
                if query_lower in agent.get('name', '').lower():
                    score += 3
                if query_lower in agent.get('display_name', '').lower():
                    score += 2
                if query_lower in agent.get('description', '').lower():
                    score += 1
                if query_lower in agent.get('business_function', '').lower():
                    score += 1
                
                if score > 0:
                    scored_agents.append((agent, score))
            
            # Sort by score and return top agents
            scored_agents.sort(key=lambda x: x[1], reverse=True)
            return [agent for agent, _ in scored_agents[:max_agents]]
            
        except Exception as e:
            print(f"Error getting agent recommendations: {e}")
            return []
    
    async def get_all_agents(self, limit: int = 100) -> List[Dict]:
        """Get all active agents with pagination"""
        try:
            response = await self.supabase.from_('agents').select('*').eq(
                'status', 'active'
            ).order('tier').order('priority').limit(limit).execute()
            
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching all agents: {e}")
            return []
    
    async def get_agent_details(self, agent_id: str) -> Optional[Dict]:
        """Get full agent details by ID"""
        try:
            response = await self.supabase.from_('agents').select('*').eq(
                'id', agent_id
            ).single().execute()
            
            return response.data if response.data else None
        except Exception as e:
            print(f"Error fetching agent details for {agent_id}: {e}")
            return None
    
    async def get_agents_by_filters(
        self, 
        filters: Dict[str, Any]
    ) -> List[Dict]:
        """Get agents with advanced filtering"""
        try:
            query = self.supabase.from_('agents').select('*').eq('status', 'active')
            
            # Apply filters
            if filters.get('domains'):
                query = query.overlaps('knowledge_domains', filters['domains'])
            
            if filters.get('tiers'):
                query = query.in_('tier', filters['tiers'])
            
            if filters.get('business_functions'):
                query = query.in_('business_function', filters['business_functions'])
            
            if filters.get('capabilities'):
                query = query.overlaps('capabilities', filters['capabilities'])
            
            if filters.get('search'):
                search_term = filters['search']
                query = query.or_(
                    f'name.ilike.%{search_term}%,'
                    f'display_name.ilike.%{search_term}%,'
                    f'description.ilike.%{search_term}%'
                )
            
            # Order and limit
            query = query.order('tier').order('priority')
            if filters.get('limit'):
                query = query.limit(filters['limit'])
            
            response = await query.execute()
            return response.data if response.data else []
            
        except Exception as e:
            print(f"Error filtering agents: {e}")
            return []
    
    async def get_default_agent(self) -> Dict:
        """Get a default fallback agent"""
        try:
            # Try to get a tier_1 agent first
            tier1_agents = await self.get_agents_by_tier(1)
            if tier1_agents:
                return tier1_agents[0]
            
            # Fallback to any active agent
            all_agents = await self.get_all_agents(1)
            if all_agents:
                return all_agents[0]
            
            # Ultimate fallback
            return {
                'id': 'default_agent',
                'name': 'General Medical Expert',
                'display_name': 'General Medical Expert',
                'description': 'General purpose medical AI expert',
                'tier': 2,
                'capabilities': ['general_consultation'],
                'knowledge_domains': ['general_medicine'],
                'business_function': 'Medical Affairs',
                'model': 'gpt-4',
                'temperature': 0.7,
                'max_tokens': 4000
            }
        except Exception as e:
            print(f"Error getting default agent: {e}")
            return {
                'id': 'fallback_agent',
                'name': 'Fallback Expert',
                'display_name': 'Fallback Expert',
                'description': 'Fallback medical expert',
                'tier': 2,
                'capabilities': ['general_consultation'],
                'knowledge_domains': ['general_medicine'],
                'business_function': 'Medical Affairs',
                'model': 'gpt-4',
                'temperature': 0.7,
                'max_tokens': 4000
            }
    
    def _format_agent(self, agent_data: Dict) -> Dict:
        """Format agent data from database to standard format"""
        return {
            'id': agent_data.get('id'),
            'name': agent_data.get('display_name') or agent_data.get('name'),
            'display_name': agent_data.get('display_name'),
            'description': agent_data.get('description', ''),
            'tier': agent_data.get('tier', 2),
            'capabilities': agent_data.get('capabilities', []),
            'specializations': agent_data.get('specializations', []),
            'knowledge_domains': agent_data.get('knowledge_domains', []),
            'business_function': agent_data.get('business_function'),
            'department': agent_data.get('department'),
            'organizational_role': agent_data.get('organizational_role'),
            'model': agent_data.get('model', 'gpt-4'),
            'temperature': agent_data.get('temperature', 0.7),
            'max_tokens': agent_data.get('max_tokens', 4000),
            'priority': agent_data.get('priority', 0),
            'status': agent_data.get('status', 'active'),
            'avatar': agent_data.get('avatar'),
            'color': agent_data.get('color'),
            'is_custom': agent_data.get('is_custom', False),
            'rag_enabled': agent_data.get('rag_enabled', True),
            'created_at': agent_data.get('created_at'),
            'updated_at': agent_data.get('updated_at')
        }
