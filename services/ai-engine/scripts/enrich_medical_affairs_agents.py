#!/usr/bin/env python3
"""
Medical Affairs Agent Enrichment Script
Fills in missing fields for recently created agents based on their level, role, and function.
"""

import os
import sys
from typing import Dict, List, Optional
from supabase import create_client
from datetime import datetime

# Agent Level UUIDs
AGENT_LEVELS = {
    'Master': '5e27905e-6f58-462e-93a4-6fad5388ebaf',
    'Expert': 'a6e394b0-6ca1-4cb1-8097-719523ee6782',
    'Specialist': '5a3647eb-a2bd-43f2-9c8b-6413d39ed0fb',
    'Worker': 'c6f7eec5-3fc5-4f10-b030-bce0d22480e8',
    'Tool': '45420d67-67bf-44cf-a842-44bbaf3145e7'
}

# Reverse mapping
LEVEL_NAMES = {v: k for k, v in AGENT_LEVELS.items()}

# Experience by level
EXPERIENCE_BY_LEVEL = {
    'Master': (20, 30),
    'Expert': (10, 20),
    'Specialist': (5, 10),
    'Worker': (2, 5),
    'Tool': (0, 2)
}

# Expertise by level
EXPERTISE_BY_LEVEL = {
    'Master': 'expert',
    'Expert': 'expert',
    'Specialist': 'advanced',
    'Worker': 'intermediate',
    'Tool': 'basic'
}

# Communication styles by level
COMMUNICATION_STYLES = {
    'Master': 'Strategic, visionary, and high-level with focus on organizational impact and leadership',
    'Expert': 'Authoritative, detailed, and evidence-based with deep technical knowledge',
    'Specialist': 'Focused, precise, and domain-specific with practical application expertise',
    'Worker': 'Clear, structured, and task-oriented with emphasis on execution',
    'Tool': 'Concise, direct, and API-focused with minimal elaboration'
}


class AgentEnricher:
    def __init__(self):
        self.supabase = create_client(
            os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_KEY')
        )
        
    def generate_tagline(self, agent: Dict) -> str:
        """Generate a compelling tagline based on agent role and function"""
        name = agent.get('name', '')
        role = agent.get('role_name', '')
        function = agent.get('function_name', '')
        level_id = agent.get('agent_level_id')
        level_name = LEVEL_NAMES.get(level_id, 'Specialist')
        
        # Extract key words from name
        words = name.split()
        
        # Level-specific tagline templates
        templates = {
            'Master': f"Leading {function} strategy and organizational excellence",
            'Expert': f"Deep expertise in {role} for optimal outcomes",
            'Specialist': f"Specialized support for {role} tasks",
            'Worker': f"Efficient execution of {role} operations",
            'Tool': f"Automated {role} capabilities"
        }
        
        # Use specific template or generic based on available data
        if function and role:
            return templates.get(level_name, f"Expert support for {function}")
        elif function:
            return f"{level_name}-level {function} support"
        else:
            return f"{level_name} AI agent for healthcare operations"
    
    def generate_title(self, agent: Dict) -> str:
        """Generate professional title based on role and level"""
        role = agent.get('role_name', '')
        function = agent.get('function_name', '')
        level_id = agent.get('agent_level_id')
        level_name = LEVEL_NAMES.get(level_id, 'Specialist')
        
        # Level prefixes
        prefixes = {
            'Master': 'Chief',
            'Expert': 'Senior',
            'Specialist': '',
            'Worker': 'Associate',
            'Tool': 'Automated'
        }
        
        prefix = prefixes.get(level_name, '')
        
        if role:
            return f"{prefix} {role}".strip()
        elif function:
            return f"{prefix} {function} Agent".strip()
        else:
            return f"{level_name} Medical Affairs Agent"
    
    def get_years_experience(self, agent: Dict) -> int:
        """Get appropriate years of experience based on level"""
        level_id = agent.get('agent_level_id')
        level_name = LEVEL_NAMES.get(level_id, 'Specialist')
        
        min_exp, max_exp = EXPERIENCE_BY_LEVEL.get(level_name, (5, 10))
        # Use middle of range
        return (min_exp + max_exp) // 2
    
    def get_expertise_level(self, agent: Dict) -> str:
        """Get expertise level based on agent level"""
        level_id = agent.get('agent_level_id')
        level_name = LEVEL_NAMES.get(level_id, 'Specialist')
        return EXPERTISE_BY_LEVEL.get(level_name, 'intermediate')
    
    def get_communication_style(self, agent: Dict) -> str:
        """Get communication style based on level"""
        level_id = agent.get('agent_level_id')
        level_name = LEVEL_NAMES.get(level_id, 'Specialist')
        return COMMUNICATION_STYLES.get(level_name, 'Professional and clear')
    
    def generate_avatar_description(self, agent: Dict) -> str:
        """Generate avatar description"""
        name = agent.get('name', 'Agent')
        function = agent.get('function_name', 'Medical Affairs')
        level_id = agent.get('agent_level_id')
        level_name = LEVEL_NAMES.get(level_id, 'Specialist')
        
        descriptions = {
            'Master': f"Professional avatar representing {name}, a strategic leader in {function}",
            'Expert': f"Expert professional avatar for {name}, {function} specialist",
            'Specialist': f"Professional avatar for {name}, focused on {function}",
            'Worker': f"Friendly professional avatar representing {name}",
            'Tool': f"Simple icon representing {name} automation"
        }
        
        return descriptions.get(level_name, f"Professional avatar for {name}")
    
    def enrich_agent(self, agent: Dict) -> Dict:
        """Enrich a single agent with missing fields"""
        updates = {}
        
        # Tagline
        if not agent.get('tagline'):
            updates['tagline'] = self.generate_tagline(agent)
        
        # Title
        if not agent.get('title'):
            updates['title'] = self.generate_title(agent)
        
        # Years of experience
        if not agent.get('years_of_experience'):
            updates['years_of_experience'] = self.get_years_experience(agent)
        
        # Expertise level
        if not agent.get('expertise_level'):
            updates['expertise_level'] = self.get_expertise_level(agent)
        
        # Communication style
        if not agent.get('communication_style'):
            updates['communication_style'] = self.get_communication_style(agent)
        
        # Avatar description
        if not agent.get('avatar_description'):
            updates['avatar_description'] = self.generate_avatar_description(agent)
        
        # Always update timestamp
        updates['updated_at'] = datetime.now().isoformat()
        
        return updates
    
    def enrich_all_agents(self, limit: Optional[int] = None):
        """Enrich all agents that need enrichment"""
        print("🔍 Fetching agents to enrich...")
        
        # Get all agents
        response = self.supabase.table('agents').select('''
            id, name, description, tagline, title,
            agent_level_id, expertise_level, years_of_experience,
            function_name, department_name, role_name,
            avatar_url, avatar_description, communication_style
        ''').execute()
        
        agents = response.data
        if limit:
            agents = agents[:limit]
        
        print(f"📊 Found {len(agents)} agents")
        
        # Filter agents that need enrichment
        agents_to_enrich = []
        for agent in agents:
            needs_enrichment = (
                not agent.get('tagline') or
                not agent.get('title') or
                not agent.get('years_of_experience') or
                not agent.get('expertise_level') or
                not agent.get('communication_style') or
                not agent.get('avatar_description')
            )
            if needs_enrichment:
                agents_to_enrich.append(agent)
        
        print(f"✨ {len(agents_to_enrich)} agents need enrichment")
        print()
        
        # Enrich each agent
        enriched_count = 0
        failed_count = 0
        
        for i, agent in enumerate(agents_to_enrich, 1):
            try:
                agent_id = agent['id']
                agent_name = agent['name']
                
                # Generate enrichments
                updates = self.enrich_agent(agent)
                
                if not updates:
                    continue
                
                # Update in database
                self.supabase.table('agents').update(updates).eq('id', agent_id).execute()
                
                enriched_count += 1
                
                # Progress indicator
                if i % 10 == 0:
                    print(f"  ✓ Enriched {i}/{len(agents_to_enrich)} agents...")
                
            except Exception as e:
                print(f"  ❌ Failed to enrich {agent_name}: {str(e)}")
                failed_count += 1
        
        print()
        print("=" * 70)
        print(f"✅ Successfully enriched: {enriched_count} agents")
        if failed_count > 0:
            print(f"❌ Failed: {failed_count} agents")
        print("=" * 70)
        
        return enriched_count, failed_count


def main():
    # Check environment variables
    required_vars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please set them and try again.")
        sys.exit(1)
    
    print("🚀 Medical Affairs Agent Enrichment")
    print("=" * 70)
    print()
    
    enricher = AgentEnricher()
    
    # Get limit from command line if provided
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else None
    
    if limit:
        print(f"🎯 Enriching first {limit} agents...")
    else:
        print("🎯 Enriching all agents that need it...")
    
    print()
    
    enriched, failed = enricher.enrich_all_agents(limit=limit)
    
    if failed == 0:
        print()
        print("🎉 All agents enriched successfully!")
    
    return 0 if failed == 0 else 1


if __name__ == '__main__':
    sys.exit(main())


