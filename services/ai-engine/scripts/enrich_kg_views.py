#!/usr/bin/env python3
"""
Agent KG Views Enrichment Script
Creates knowledge graph view configurations for Master and Expert level agents.
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

LEVEL_NAMES = {v: k for k, v in AGENT_LEVELS.items()}

# KG View configurations by level
# Only Master and Expert levels get KG views (graph-based reasoning)
KG_VIEW_CONFIGS = {
    'Master': {
        'max_hops': 4,
        'depth_strategy': 'entity-centric',
        'graph_limit': 200,
        'include_node_types': [
            'Drug', 'Disease', 'Clinical_Trial', 'Publication', 
            'Guideline', 'Biomarker', 'Pathway', 'Gene', 'Protein',
            'Organization', 'Indication', 'Adverse_Event'
        ],
        'include_edge_types': [
            'TREATS', 'CAUSES', 'PUBLISHED_IN', 'REFERENCES',
            'INDICATES', 'ASSOCIATED_WITH', 'REGULATES', 'INTERACTS_WITH',
            'CONDUCTED_BY', 'APPROVED_FOR', 'CONTRAINDICATES'
        ]
    },
    'Expert': {
        'max_hops': 3,
        'depth_strategy': 'breadth',
        'graph_limit': 100,
        'include_node_types': [
            'Drug', 'Disease', 'Clinical_Trial', 'Publication',
            'Guideline', 'Indication', 'Adverse_Event'
        ],
        'include_edge_types': [
            'TREATS', 'CAUSES', 'PUBLISHED_IN', 'REFERENCES',
            'INDICATES', 'ASSOCIATED_WITH', 'APPROVED_FOR'
        ]
    }
}


class KGViewEnricher:
    def __init__(self):
        self.supabase = create_client(
            os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_KEY')
        )
        self.node_types = {}
        self.edge_types = {}
        self.rag_profiles = {}
    
    def get_or_create_node_types(self):
        """Get or create node types"""
        print("🔍 Checking node types...")
        
        # Get existing node types
        response = self.supabase.table('kg_node_types').select('*').execute()
        existing_types = {nt['name']: nt for nt in response.data}
        
        print(f"   Found {len(existing_types)} existing node types")
        
        # Collect all unique node types
        all_node_types = set()
        for config in KG_VIEW_CONFIGS.values():
            all_node_types.update(config['include_node_types'])
        
        # Create missing node types
        types_to_create = []
        for type_name in all_node_types:
            if type_name not in existing_types:
                types_to_create.append({
                    'name': type_name,
                    'description': f'{type_name.replace("_", " ")} entity in knowledge graph',
                    'category': 'medical' if type_name in ['Drug', 'Disease', 'Clinical_Trial', 'Biomarker'] else 'reference',
                    'is_active': True,
                    'created_at': datetime.now().isoformat(),
                    'updated_at': datetime.now().isoformat()
                })
        
        if types_to_create:
            print(f"   Creating {len(types_to_create)} new node types...")
            result = self.supabase.table('kg_node_types').insert(types_to_create).execute()
            print(f"   ✅ Created {len(result.data)} node types")
        
        # Reload all types
        response = self.supabase.table('kg_node_types').select('*').execute()
        self.node_types = {nt['name']: nt for nt in response.data}
        
        print(f"   ✅ Total node types available: {len(self.node_types)}")
        print()
    
    def get_or_create_edge_types(self):
        """Get or create edge types"""
        print("🔍 Checking edge types...")
        
        # Get existing edge types
        response = self.supabase.table('kg_edge_types').select('*').execute()
        existing_types = {et['name']: et for et in response.data}
        
        print(f"   Found {len(existing_types)} existing edge types")
        
        # Collect all unique edge types
        all_edge_types = set()
        for config in KG_VIEW_CONFIGS.values():
            all_edge_types.update(config['include_edge_types'])
        
        # Create missing edge types
        types_to_create = []
        for type_name in all_edge_types:
            if type_name not in existing_types:
                types_to_create.append({
                    'name': type_name,
                    'description': f'{type_name.replace("_", " ")} relationship',
                    'category': 'clinical' if type_name in ['TREATS', 'CAUSES', 'INDICATES'] else 'reference',
                    'is_active': True,
                    'created_at': datetime.now().isoformat(),
                    'updated_at': datetime.now().isoformat()
                })
        
        if types_to_create:
            print(f"   Creating {len(types_to_create)} new edge types...")
            result = self.supabase.table('kg_edge_types').insert(types_to_create).execute()
            print(f"   ✅ Created {len(result.data)} edge types")
        
        # Reload all types
        response = self.supabase.table('kg_edge_types').select('*').execute()
        self.edge_types = {et['name']: et for et in response.data}
        
        print(f"   ✅ Total edge types available: {len(self.edge_types)}")
        print()
    
    def get_rag_profiles(self):
        """Get RAG profiles for linking"""
        response = self.supabase.table('rag_profiles').select('*').execute()
        self.rag_profiles = {p['name']: p for p in response.data}
        print(f"🔍 Found {len(self.rag_profiles)} RAG profiles")
        print()
    
    def _get_color_for_type(self, type_name: str) -> str:
        """Get color for node type"""
        colors = {
            'Drug': '#3B82F6',
            'Disease': '#EF4444',
            'Clinical_Trial': '#10B981',
            'Publication': '#8B5CF6',
            'Guideline': '#F59E0B',
            'Biomarker': '#EC4899',
            'Pathway': '#06B6D4',
            'Gene': '#14B8A6',
            'Protein': '#6366F1',
            'Organization': '#64748B',
            'Indication': '#F97316',
            'Adverse_Event': '#DC2626'
        }
        return colors.get(type_name, '#6B7280')
    
    def get_kg_view_for_agent(self, agent: Dict) -> Optional[Dict]:
        """Get KG view configuration for an agent"""
        level_id = agent.get('agent_level_id')
        level_name = LEVEL_NAMES.get(level_id, 'Specialist')
        
        # Only Master and Expert get KG views
        if level_name not in ['Master', 'Expert']:
            return None
        
        config = KG_VIEW_CONFIGS.get(level_name)
        if not config:
            return None
        
        # Get RAG profile ID for this level
        rag_profile_name = 'graphrag_entity' if level_name == 'Master' else 'hybrid_enhanced'
        rag_profile = self.rag_profiles.get(rag_profile_name)
        
        # Convert type names to UUIDs
        node_type_ids = [
            self.node_types[nt]['id'] 
            for nt in config['include_node_types'] 
            if nt in self.node_types
        ]
        
        edge_type_ids = [
            self.edge_types[et]['id'] 
            for et in config['include_edge_types'] 
            if et in self.edge_types
        ]
        
        return {
            'agent_id': agent['id'],
            'rag_profile_id': rag_profile['id'] if rag_profile else None,
            'include_node_types': node_type_ids,
            'include_edge_types': edge_type_ids,
            'exclude_node_types': [],
            'exclude_edge_types': [],
            'max_hops': config['max_hops'],
            'depth_strategy': config['depth_strategy'],
            'graph_limit': config['graph_limit'],
            'property_filters': {},
            'is_active': True,
            'priority': 10 if level_name == 'Master' else 5,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
    
    def enrich_all_agents(self):
        """Enrich Master and Expert agents with KG views"""
        print("🔍 Fetching all agents...")
        
        # Get all agents
        response = self.supabase.table('agents').select('''
            id, name, agent_level_id
        ''').execute()
        
        agents = response.data
        print(f"📊 Found {len(agents)} agents")
        print()
        
        # Get or create types
        self.get_or_create_node_types()
        self.get_or_create_edge_types()
        self.get_rag_profiles()
        
        # Clear existing KG views (for idempotency)
        print("🗑️  Clearing existing KG views...")
        self.supabase.table('agent_kg_views').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        print()
        
        print("✨ Generating KG view assignments...")
        print()
        
        all_views = []
        enriched_count = 0
        skipped_count = 0
        
        for i, agent in enumerate(agents, 1):
            try:
                view = self.get_kg_view_for_agent(agent)
                
                if view:
                    all_views.append(view)
                    enriched_count += 1
                else:
                    skipped_count += 1
                
                if i % 50 == 0:
                    print(f"  ✓ Processed {i}/{len(agents)} agents...")
            
            except Exception as e:
                print(f"  ❌ Failed to process {agent['name']}: {str(e)}")
                skipped_count += 1
        
        print()
        print(f"💾 Inserting {len(all_views)} KG view assignments...")
        print()
        
        # Insert in batches of 50 (smaller because of array fields)
        batch_size = 50
        inserted_count = 0
        
        for i in range(0, len(all_views), batch_size):
            batch = all_views[i:i + batch_size]
            try:
                self.supabase.table('agent_kg_views').insert(batch).execute()
                inserted_count += len(batch)
                
                if (i + batch_size) % 200 == 0:
                    print(f"  ✓ Inserted {inserted_count}/{len(all_views)} KG views...")
            
            except Exception as e:
                print(f"  ❌ Failed to insert batch: {str(e)}")
        
        print()
        print("=" * 70)
        print(f"✅ Successfully enriched {enriched_count} agents with KG views")
        print(f"⏭️  Skipped {skipped_count} agents (Specialist/Worker/Tool - no graph reasoning)")
        print(f"✅ Inserted {inserted_count} KG view assignments")
        print("=" * 70)
        
        # Summary statistics
        print()
        print("📊 SUMMARY BY AGENT LEVEL:")
        print("-" * 70)
        
        for level_name in ['Master', 'Expert']:
            level_id = AGENT_LEVELS[level_name]
            level_agents = [a for a in agents if a.get('agent_level_id') == level_id]
            config = KG_VIEW_CONFIGS[level_name]
            
            print(f"  {level_name:12s}: {len(level_agents):3d} agents")
            print(f"    Max hops: {config['max_hops']}, Strategy: {config['depth_strategy']}, Limit: {config['graph_limit']}")
            print(f"    Node types: {len(config['include_node_types'])}, Edge types: {len(config['include_edge_types'])}")
        
        print()
        return enriched_count, inserted_count


def main():
    # Check environment variables
    required_vars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        sys.exit(1)
    
    print("🚀 Agent KG Views Enrichment")
    print("=" * 70)
    print()
    
    enricher = KGViewEnricher()
    enriched, inserted = enricher.enrich_all_agents()
    
    print()
    print("🎉 KG view enrichment complete!")
    
    return 0


if __name__ == '__main__':
    sys.exit(main())

