#!/usr/bin/env python3
"""
Agent RAG Policies Enrichment Script
Assigns RAG profiles and policies to agents based on their level.
"""

import os
import sys
from typing import Dict, Optional
from supabase import create_client
from datetime import datetime
import json

# Agent Level UUIDs
AGENT_LEVELS = {
    'Master': '5e27905e-6f58-462e-93a4-6fad5388ebaf',
    'Expert': 'a6e394b0-6ca1-4cb1-8097-719523ee6782',
    'Specialist': '5a3647eb-a2bd-43f2-9c8b-6413d39ed0fb',
    'Worker': 'c6f7eec5-3fc5-4f10-b030-bce0d22480e8',
    'Tool': '45420d67-67bf-44cf-a842-44bbaf3145e7'
}

LEVEL_NAMES = {v: k for k, v in AGENT_LEVELS.items()}

# RAG Profile assignments by level
RAG_PROFILES_BY_LEVEL = {
    'Master': {
        'profile_name': 'graphrag_entity',
        'description': 'Deep graph traversal with entity-centric exploration',
        'top_k': 20,
        'similarity_threshold': 0.70,
        'fusion_weights': {'vector': 0.4, 'keyword': 0.2, 'graph': 0.4},
        'max_context_tokens': 8000,
        'include_graph_paths': True
    },
    'Expert': {
        'profile_name': 'hybrid_enhanced',
        'description': 'Balanced vector and keyword search with optional graph',
        'top_k': 15,
        'similarity_threshold': 0.75,
        'fusion_weights': {'vector': 0.6, 'keyword': 0.4, 'graph': 0.0},
        'max_context_tokens': 6000,
        'include_graph_paths': False
    },
    'Specialist': {
        'profile_name': 'semantic_standard',
        'description': 'Pure vector-based semantic search',
        'top_k': 10,
        'similarity_threshold': 0.80,
        'fusion_weights': {'vector': 1.0, 'keyword': 0.0, 'graph': 0.0},
        'max_context_tokens': 4000,
        'include_graph_paths': False
    },
    'Worker': {
        'profile_name': 'semantic_standard',
        'description': 'Basic semantic search for task execution',
        'top_k': 5,
        'similarity_threshold': 0.85,
        'fusion_weights': {'vector': 1.0, 'keyword': 0.0, 'graph': 0.0},
        'max_context_tokens': 2000,
        'include_graph_paths': False
    },
    'Tool': {
        'profile_name': None,  # Tools don't need RAG
        'description': 'No RAG - direct API execution',
        'top_k': 0,
        'similarity_threshold': 0.0,
        'fusion_weights': {},
        'max_context_tokens': 0,
        'include_graph_paths': False
    }
}


class RAGPolicyEnricher:
    def __init__(self):
        self.supabase = create_client(
            os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_KEY')
        )
        self.rag_profiles = {}
    
    def get_or_create_rag_profiles(self):
        """Get or create RAG profiles"""
        print("🔍 Checking RAG profiles...")
        
        # Get existing profiles
        response = self.supabase.table('rag_profiles').select('*').execute()
        existing_profiles = {p['name']: p for p in response.data}
        
        print(f"   Found {len(existing_profiles)} existing RAG profiles")
        
        # Create missing profiles
        profiles_to_create = []
        unique_profiles = set(
            config['profile_name'] 
            for config in RAG_PROFILES_BY_LEVEL.values() 
            if config['profile_name']
        )
        
        for profile_name in unique_profiles:
            if profile_name not in existing_profiles:
                # Find config for this profile
                config = next(
                    c for c in RAG_PROFILES_BY_LEVEL.values() 
                    if c['profile_name'] == profile_name
                )
                
                profiles_to_create.append({
                    'name': profile_name,
                    'slug': profile_name.lower().replace('_', '-'),
                    'description': config['description'],
                    'strategy_type': 'hybrid' if 'hybrid' in profile_name else 'semantic',
                    'top_k': config['top_k'],
                    'similarity_threshold': config['similarity_threshold'],
                    'rerank_enabled': True if profile_name == 'hybrid_enhanced' else False,
                    'enable_graph_traversal': True if 'graph' in profile_name else False,
                    'max_graph_hops': config['max_context_tokens'] // 2000 if 'graph' in profile_name else 0,
                    'is_active': True,
                    'version': '1.0.0',
                    'created_at': datetime.now().isoformat(),
                    'updated_at': datetime.now().isoformat()
                })
        
        if profiles_to_create:
            print(f"   Creating {len(profiles_to_create)} new RAG profiles...")
            result = self.supabase.table('rag_profiles').insert(profiles_to_create).execute()
            print(f"   ✅ Created {len(result.data)} RAG profiles")
        
        # Reload all profiles
        response = self.supabase.table('rag_profiles').select('*').execute()
        self.rag_profiles = {p['name']: p for p in response.data}
        
        print(f"   ✅ Total RAG profiles available: {len(self.rag_profiles)}")
        print()
    
    def get_rag_policy_for_agent(self, agent: Dict) -> Optional[Dict]:
        """Get RAG policy configuration for an agent"""
        level_id = agent.get('agent_level_id')
        level_name = LEVEL_NAMES.get(level_id, 'Specialist')
        
        config = RAG_PROFILES_BY_LEVEL.get(level_name, RAG_PROFILES_BY_LEVEL['Specialist'])
        
        # Skip if no profile (e.g., Tool level)
        if not config['profile_name']:
            return None
        
        # Get profile ID
        profile = self.rag_profiles.get(config['profile_name'])
        if not profile:
            print(f"   ⚠️  Profile {config['profile_name']} not found for {agent['name']}")
            return None
        
        return {
            'agent_id': agent['id'],
            'rag_profile_id': profile['id'],
            'agent_specific_top_k': config['top_k'],
            'agent_specific_threshold': config['similarity_threshold'],
            'is_default_policy': False,
            'is_active': True,
            'priority_order': 50,  # Default priority
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
    
    def enrich_all_agents(self):
        """Enrich all agents with RAG policies"""
        print("🔍 Fetching all agents...")
        
        # Get all agents
        response = self.supabase.table('agents').select('''
            id, name, agent_level_id
        ''').execute()
        
        agents = response.data
        print(f"📊 Found {len(agents)} agents")
        print()
        
        # Get or create RAG profiles
        self.get_or_create_rag_profiles()
        
        # Clear existing policies (for idempotency)
        print("🗑️  Clearing existing RAG policies...")
        self.supabase.table('agent_rag_policies').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        print()
        
        print("✨ Generating RAG policy assignments...")
        print()
        
        all_policies = []
        enriched_count = 0
        skipped_count = 0
        
        for i, agent in enumerate(agents, 1):
            try:
                policy = self.get_rag_policy_for_agent(agent)
                
                if policy:
                    all_policies.append(policy)
                    enriched_count += 1
                else:
                    skipped_count += 1
                
                if i % 50 == 0:
                    print(f"  ✓ Processed {i}/{len(agents)} agents...")
            
            except Exception as e:
                print(f"  ❌ Failed to process {agent['name']}: {str(e)}")
                skipped_count += 1
        
        print()
        print(f"💾 Inserting {len(all_policies)} RAG policy assignments...")
        print()
        
        # Insert in batches of 100
        batch_size = 100
        inserted_count = 0
        
        for i in range(0, len(all_policies), batch_size):
            batch = all_policies[i:i + batch_size]
            try:
                self.supabase.table('agent_rag_policies').insert(batch).execute()
                inserted_count += len(batch)
                
                if (i + batch_size) % 500 == 0:
                    print(f"  ✓ Inserted {inserted_count}/{len(all_policies)} policies...")
            
            except Exception as e:
                print(f"  ❌ Failed to insert batch: {str(e)}")
        
        print()
        print("=" * 70)
        print(f"✅ Successfully enriched {enriched_count} agents with RAG policies")
        print(f"⏭️  Skipped {skipped_count} agents (Tool level - no RAG needed)")
        print(f"✅ Inserted {inserted_count} RAG policy assignments")
        print("=" * 70)
        
        # Summary statistics
        print()
        print("📊 SUMMARY BY RAG PROFILE:")
        print("-" * 70)
        
        profile_counts = {}
        for policy in all_policies:
            profile_id = policy['rag_profile_id']
            profile_name = next(
                (p['name'] for p in self.rag_profiles.values() if p['id'] == profile_id),
                'Unknown'
            )
            profile_counts[profile_name] = profile_counts.get(profile_name, 0) + 1
        
        for profile_name, count in sorted(profile_counts.items()):
            print(f"  {profile_name:25s}: {count:3d} agents")
        
        print()
        return enriched_count, inserted_count


def main():
    # Check environment variables
    required_vars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        sys.exit(1)
    
    print("🚀 Agent RAG Policies Enrichment")
    print("=" * 70)
    print()
    
    enricher = RAGPolicyEnricher()
    enriched, inserted = enricher.enrich_all_agents()
    
    print()
    print("🎉 RAG policy enrichment complete!")
    
    return 0


if __name__ == '__main__':
    sys.exit(main())

