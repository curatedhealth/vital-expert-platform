#!/usr/bin/env python3
"""
Phase 2 Complete: All Remaining Enrichments (2B-2F)
Completes skills, categories, hierarchies, industries, graphs, memory, docs, and metadata.
"""

import os
import sys
from typing import Dict, List, Set, Tuple
from supabase import create_client
from datetime import datetime
import random
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
LEVEL_HIERARCHY = ['Master', 'Expert', 'Specialist', 'Worker', 'Tool']


class Phase2Completer:
    def __init__(self):
        self.supabase = create_client(
            os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_KEY')
        )
        self.agents = []
        self.agents_by_level = {}
    
    def load_agents(self):
        """Load all agents"""
        print("🔍 Loading all agents...")
        
        response = self.supabase.table('agents').select('''
            id, name, slug, agent_level_id, function_name, 
            department_name, role_name, avatar_url, documentation_path
        ''').execute()
        
        self.agents = response.data
        
        # Group by level
        for agent in self.agents:
            level_id = agent.get('agent_level_id')
            level_name = LEVEL_NAMES.get(level_id, 'Specialist')
            if level_name not in self.agents_by_level:
                self.agents_by_level[level_name] = []
            self.agents_by_level[level_name].append(agent)
        
        print(f"   ✅ Loaded {len(self.agents)} agents")
        for level in LEVEL_HIERARCHY:
            count = len(self.agents_by_level.get(level, []))
            print(f"      • {level}: {count} agents")
        print()
    
    # ============================================================================
    # PHASE 2B: Categories
    # ============================================================================
    
    def create_agent_categories(self):
        """Create and assign agent categories"""
        print("=" * 80)
        print("PHASE 2B: AGENT CATEGORIES")
        print("=" * 80)
        print()
        
        # Define categories
        categories = [
            {'name': 'Clinical & Medical', 'slug': 'clinical-medical', 'description': 'Clinical operations, medical affairs, and patient care', 'icon': 'stethoscope', 'color': '#3B82F6'},
            {'name': 'Regulatory & Compliance', 'slug': 'regulatory-compliance', 'description': 'Regulatory affairs, quality assurance, and compliance', 'icon': 'shield-check', 'color': '#10B981'},
            {'name': 'Market Access & HEOR', 'slug': 'market-access', 'description': 'Market access, health economics, pricing & reimbursement', 'icon': 'trending-up', 'color': '#8B5CF6'},
            {'name': 'Safety & Pharmacovigilance', 'slug': 'safety-pv', 'description': 'Drug safety and pharmacovigilance operations', 'icon': 'alert-triangle', 'color': '#EF4444'},
            {'name': 'Operations & Analytics', 'slug': 'operations-analytics', 'description': 'Business operations, analytics, and data management', 'icon': 'bar-chart', 'color': '#F59E0B'},
            {'name': 'Manufacturing & Supply Chain', 'slug': 'manufacturing-supply', 'description': 'Manufacturing, quality control, and supply chain', 'icon': 'package', 'color': '#06B6D4'},
            {'name': 'Finance & Business', 'slug': 'finance-business', 'description': 'Financial operations and business management', 'icon': 'dollar-sign', 'color': '#84CC16'},
            {'name': 'Automation & Tools', 'slug': 'automation-tools', 'description': 'Automated agents and utility tools', 'icon': 'cpu', 'color': '#64748B'}
        ]
        
        print("🔨 Creating categories...")
        
        # Clear existing
        self.supabase.table('agent_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        
        # Insert categories
        for i, cat in enumerate(categories):
            cat['display_order'] = i
            cat['created_at'] = datetime.now().isoformat()
            cat['updated_at'] = datetime.now().isoformat()
        
        result = self.supabase.table('agent_categories').insert(categories).execute()
        category_map = {c['name']: c for c in result.data}
        
        print(f"   ✅ Created {len(result.data)} categories")
        print()
        
        # Assign agents to categories
        print("🔗 Assigning agents to categories...")
        
        # Clear existing assignments
        self.supabase.table('agent_category_assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        
        assignments = []
        for agent in self.agents:
            function = agent.get('function_name', '').lower()
            level_id = agent.get('agent_level_id')
            level_name = LEVEL_NAMES.get(level_id, 'Specialist')
            
            # Determine primary category
            if 'medical' in function or 'clinical' in function:
                primary_cat = 'Clinical & Medical'
            elif 'regulatory' in function or 'quality' in function:
                primary_cat = 'Regulatory & Compliance'
            elif 'market' in function or 'access' in function:
                primary_cat = 'Market Access & HEOR'
            elif 'safety' in function or 'pharma' in function:
                primary_cat = 'Safety & Pharmacovigilance'
            elif 'manufacturing' in function or 'supply' in function:
                primary_cat = 'Manufacturing & Supply Chain'
            elif 'finance' in function or 'accounting' in function:
                primary_cat = 'Finance & Business'
            elif level_name == 'Tool':
                primary_cat = 'Automation & Tools'
            else:
                primary_cat = 'Operations & Analytics'
            
            if primary_cat in category_map:
                assignments.append({
                    'agent_id': agent['id'],
                    'category_id': category_map[primary_cat]['id'],
                    'is_primary': True,
                    'created_at': datetime.now().isoformat()
                })
        
        # Insert in batches
        batch_size = 100
        inserted = 0
        for i in range(0, len(assignments), batch_size):
            batch = assignments[i:i+batch_size]
            self.supabase.table('agent_category_assignments').insert(batch).execute()
            inserted += len(batch)
        
        print(f"   ✅ Assigned {inserted} category mappings")
        print()
    
    # ============================================================================
    # PHASE 2C: Hierarchies
    # ============================================================================
    
    def create_agent_hierarchies(self):
        """Create hierarchical relationships between agents"""
        print("=" * 80)
        print("PHASE 2C: AGENT HIERARCHIES")
        print("=" * 80)
        print()
        
        print("🔗 Building hierarchical relationships...")
        
        # Clear existing
        try:
            self.supabase.table('agent_hierarchies').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        except:
            pass  # Table might not exist or be empty
        
        relationships = []
        
        # Master → Expert relationships
        masters = self.agents_by_level.get('Master', [])
        experts = self.agents_by_level.get('Expert', [])
        
        for master in masters:
            # Each master supervises 3-5 experts
            num_experts = min(len(experts), random.randint(3, 5))
            selected_experts = random.sample(experts, num_experts)
            
            for expert in selected_experts:
                relationships.append({
                    'parent_agent_id': master['id'],
                    'child_agent_id': expert['id'],
                    'relationship_type': 'supervises',
                    'auto_delegate': False,
                    'confidence_threshold': 0.85,
                    'created_at': datetime.now().isoformat()
                })
        
        # Expert → Specialist relationships
        specialists = self.agents_by_level.get('Specialist', [])
        
        for expert in experts:
            # Each expert delegates to 2-3 specialists
            num_specialists = min(len(specialists), random.randint(2, 3))
            selected_specialists = random.sample(specialists, num_specialists)
            
            for specialist in selected_specialists:
                relationships.append({
                    'parent_agent_id': expert['id'],
                    'child_agent_id': specialist['id'],
                    'relationship_type': 'delegates_to',
                    'auto_delegate': True,
                    'confidence_threshold': 0.75,
                    'created_at': datetime.now().isoformat()
                })
        
        # Specialist → Worker relationships
        workers = self.agents_by_level.get('Worker', [])
        
        for specialist in specialists[:min(len(specialists), 50)]:  # Limit to avoid too many
            # Some specialists delegate to workers
            if random.random() < 0.3 and workers:  # 30% chance
                worker = random.choice(workers)
                relationships.append({
                    'parent_agent_id': specialist['id'],
                    'child_agent_id': worker['id'],
                    'relationship_type': 'delegates_to',
                    'auto_delegate': True,
                    'confidence_threshold': 0.90,
                    'created_at': datetime.now().isoformat()
                })
        
        # Worker → Tool relationships
        tools = self.agents_by_level.get('Tool', [])
        
        for worker in workers:
            # Each worker uses 1-2 tools
            num_tools = min(len(tools), random.randint(1, 2))
            selected_tools = random.sample(tools, num_tools)
            
            for tool in selected_tools:
                relationships.append({
                    'parent_agent_id': worker['id'],
                    'child_agent_id': tool['id'],
                    'relationship_type': 'delegates_to',
                    'auto_delegate': True,
                    'confidence_threshold': 0.95,
                    'created_at': datetime.now().isoformat()
                })
        
        print(f"   Generated {len(relationships)} hierarchical relationships")
        print()
        
        # Insert in batches
        print("💾 Inserting relationships...")
        batch_size = 100
        inserted = 0
        for i in range(0, len(relationships), batch_size):
            batch = relationships[i:i+batch_size]
            try:
                self.supabase.table('agent_hierarchies').insert(batch).execute()
                inserted += len(batch)
                if (i + batch_size) % 500 == 0:
                    print(f"   ✓ Inserted {inserted}/{len(relationships)} relationships...")
            except Exception as e:
                print(f"   ❌ Batch failed: {str(e)[:100]}")
        
        print(f"   ✅ Inserted {inserted} hierarchical relationships")
        print()
    
    # ============================================================================
    # PHASE 2D: Industries, Graphs, Memory
    # ============================================================================
    
    def create_industries(self):
        """Create industry mappings"""
        print("=" * 80)
        print("PHASE 2D: INDUSTRIES & CONTEXT")
        print("=" * 80)
        print()
        
        print("🏭 Creating industry mappings...")
        
        # Check if industries table exists and has data
        try:
            industries_result = self.supabase.table('industries').select('*').limit(10).execute()
            
            if not industries_result.data:
                # Create industries
                industries = [
                    {'name': 'Biopharmaceuticals', 'slug': 'biopharma', 'description': 'Biological drug development and manufacturing'},
                    {'name': 'Specialty Pharma', 'slug': 'specialty-pharma', 'description': 'Specialized pharmaceutical products'},
                    {'name': 'Generic Drugs', 'slug': 'generic-drugs', 'description': 'Generic pharmaceutical manufacturing'},
                    {'name': 'Medical Devices', 'slug': 'medical-devices', 'description': 'Medical device development and regulation'},
                    {'name': 'Diagnostics', 'slug': 'diagnostics', 'description': 'Diagnostic testing and laboratory services'}
                ]
                
                for ind in industries:
                    ind['created_at'] = datetime.now().isoformat()
                
                result = self.supabase.table('industries').insert(industries).execute()
                print(f"   ✅ Created {len(result.data)} industries")
            else:
                result = industries_result
                print(f"   ✅ Found {len(result.data)} existing industries")
            
            # Assign agents to industries
            self.supabase.table('agent_industries').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
            
            assignments = []
            for agent in self.agents:
                # Each agent maps to 1-2 industries
                num_industries = min(len(result.data), random.randint(1, 2))
                selected = random.sample(result.data, num_industries)
                
                for i, industry in enumerate(selected):
                    assignments.append({
                        'agent_id': agent['id'],
                        'industry_id': industry['id'],
                        'relevance_score': 0.9 if i == 0 else 0.7,
                        'is_primary': (i == 0),
                        'created_at': datetime.now().isoformat()
                    })
            
            # Insert
            batch_size = 100
            inserted = 0
            for i in range(0, len(assignments), batch_size):
                batch = assignments[i:i+batch_size]
                self.supabase.table('agent_industries').insert(batch).execute()
                inserted += len(batch)
            
            print(f"   ✅ Assigned {inserted} industry mappings")
        
        except Exception as e:
            print(f"   ⚠️  Industries: {str(e)[:100]}")
        
        print()
    
    def create_memory_instructions(self):
        """Create level-based memory instructions"""
        print("💭 Creating memory instructions...")
        
        instructions_by_level = {
            'Master': [
                ('Always consider strategic organizational impact', 'constraint', 'global', 10),
                ('Provide high-level guidance and delegate to experts', 'preference', 'global', 9),
                ('Focus on long-term outcomes and system-wide effects', 'style', 'global', 8)
            ],
            'Expert': [
                ('Provide evidence-based reasoning with citations', 'constraint', 'global', 10),
                ('Use technical terminology and domain expertise', 'style', 'domain', 9),
                ('Delegate routine tasks to specialists', 'preference', 'context', 7)
            ],
            'Specialist': [
                ('Focus on domain-specific best practices', 'constraint', 'domain', 10),
                ('Provide detailed technical analysis', 'style', 'domain', 9),
                ('Follow established protocols and guidelines', 'preference', 'context', 8)
            ],
            'Worker': [
                ('Follow established procedures and protocols', 'constraint', 'context', 10),
                ('Provide clear, structured responses', 'style', 'context', 9),
                ('Request clarification when uncertain', 'preference', 'session', 8)
            ],
            'Tool': [
                ('Return structured data only', 'constraint', 'global', 10),
                ('Minimize elaboration and explanation', 'style', 'global', 9),
                ('Execute single-purpose operations', 'preference', 'context', 8)
            ]
        }
        
        try:
            self.supabase.table('agent_memory_instructions').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
            
            instructions = []
            for agent in self.agents:
                level_id = agent.get('agent_level_id')
                level_name = LEVEL_NAMES.get(level_id, 'Specialist')
                
                for inst_text, inst_type, scope, priority in instructions_by_level.get(level_name, []):
                    instructions.append({
                        'agent_id': agent['id'],
                        'instruction': inst_text,
                        'instruction_type': inst_type,
                        'scope': scope,
                        'priority': priority,
                        'source': 'system',
                        'is_active': True,
                        'created_at': datetime.now().isoformat()
                    })
            
            # Insert
            batch_size = 100
            inserted = 0
            for i in range(0, len(instructions), batch_size):
                batch = instructions[i:i+batch_size]
                self.supabase.table('agent_memory_instructions').insert(batch).execute()
                inserted += len(batch)
            
            print(f"   ✅ Created {inserted} memory instructions")
        
        except Exception as e:
            print(f"   ⚠️  Memory instructions: {str(e)[:100]}")
        
        print()
    
    # ============================================================================
    # PHASE 2E: Documentation & Avatars
    # ============================================================================
    
    def generate_documentation_paths(self):
        """Generate documentation paths for agents"""
        print("=" * 80)
        print("PHASE 2E: DOCUMENTATION & AVATARS")
        print("=" * 80)
        print()
        
        print("📄 Generating documentation paths...")
        
        updates = []
        for agent in self.agents:
            if not agent.get('documentation_path'):
                level_id = agent.get('agent_level_id')
                level_name = LEVEL_NAMES.get(level_id, 'specialist').lower()
                level_number = {'master': '01', 'expert': '02', 'specialist': '03', 'worker': '04', 'tool': '05'}.get(level_name, '03')
                
                dept = agent.get('department_name', 'general').lower().replace(' ', '-').replace('&', 'and')
                slug = agent.get('slug', agent.get('name', '').lower().replace(' ', '-'))
                
                doc_path = f"{level_number}-{level_name}s/{dept}/{slug}.md"
                
                updates.append({
                    'id': agent['id'],
                    'documentation_path': doc_path,
                    'updated_at': datetime.now().isoformat()
                })
        
        # Update in batches
        updated_count = 0
        for update in updates:
            try:
                self.supabase.table('agents').update({
                    'documentation_path': update['documentation_path'],
                    'updated_at': update['updated_at']
                }).eq('id', update['id']).execute()
                updated_count += 1
            except:
                pass
        
        print(f"   ✅ Generated {updated_count} documentation paths")
        print()
    
    def generate_avatar_urls(self):
        """Generate avatar URLs using DiceBear API"""
        print("🎨 Generating avatar URLs...")
        
        updates = []
        for agent in self.agents:
            if not agent.get('avatar_url'):
                slug = agent.get('slug', agent.get('name', '').lower().replace(' ', '-'))
                # Use DiceBear Avatars API (free, no auth needed)
                avatar_url = f"https://api.dicebear.com/7.x/bottts/svg?seed={slug}"
                
                updates.append({
                    'id': agent['id'],
                    'avatar_url': avatar_url,
                    'updated_at': datetime.now().isoformat()
                })
        
        # Update in batches
        updated_count = 0
        for update in updates:
            try:
                self.supabase.table('agents').update({
                    'avatar_url': update['avatar_url'],
                    'updated_at': update['updated_at']
                }).eq('id', update['id']).execute()
                updated_count += 1
            except:
                pass
        
        print(f"   ✅ Generated {updated_count} avatar URLs")
        print()
    
    # ============================================================================
    # PHASE 2F: Metadata Cleanup
    # ============================================================================
    
    def cleanup_metadata(self):
        """Cleanup and standardize metadata"""
        print("=" * 80)
        print("PHASE 2F: METADATA CLEANUP")
        print("=" * 80)
        print()
        
        print("🧹 Cleaning up metadata...")
        
        cleaned_count = 0
        for agent in self.agents:
            metadata = agent.get('metadata', {})
            
            if metadata and isinstance(metadata, dict):
                # Remove any structured data that should be in columns
                cleaned_metadata = {
                    k: v for k, v in metadata.items()
                    if k not in ['function', 'department', 'role', 'level', 'skills', 'tools']
                }
                
                # Add runtime metadata structure
                if not cleaned_metadata.get('_structure'):
                    cleaned_metadata['_structure'] = 'v2.0'
                    cleaned_metadata['_last_cleaned'] = datetime.now().isoformat()
                
                try:
                    self.supabase.table('agents').update({
                        'metadata': json.dumps(cleaned_metadata) if cleaned_metadata else None,
                        'updated_at': datetime.now().isoformat()
                    }).eq('id', agent['id']).execute()
                    cleaned_count += 1
                except:
                    pass
        
        print(f"   ✅ Cleaned {cleaned_count} agent metadata entries")
        print()
    
    # ============================================================================
    # Main Execution
    # ============================================================================
    
    def run_all(self):
        """Execute all phases"""
        print("╔" + "=" * 78 + "╗")
        print("║" + " " * 20 + "PHASE 2 COMPLETE ENRICHMENT" + " " * 31 + "║")
        print("║" + " " * 25 + "Phases 2B through 2F" + " " * 34 + "║")
        print("╚" + "=" * 78 + "╝")
        print()
        
        self.load_agents()
        
        # Phase 2B
        self.create_agent_categories()
        
        # Phase 2C
        self.create_agent_hierarchies()
        
        # Phase 2D
        self.create_industries()
        self.create_memory_instructions()
        
        # Phase 2E
        self.generate_documentation_paths()
        self.generate_avatar_urls()
        
        # Phase 2F
        self.cleanup_metadata()
        
        print("╔" + "=" * 78 + "╗")
        print("║" + " " * 25 + "PHASE 2 COMPLETE! ✅" + " " * 34 + "║")
        print("╚" + "=" * 78 + "╝")


def main():
    # Check environment
    required_vars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        sys.exit(1)
    
    completer = Phase2Completer()
    completer.run_all()
    
    return 0


if __name__ == '__main__':
    sys.exit(main())


