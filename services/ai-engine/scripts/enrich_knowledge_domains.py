#!/usr/bin/env python3
"""
Agent Knowledge Domains Enrichment Script
Maps agents to knowledge domains based on their function, role, and level.
"""

import os
import sys
from typing import Dict, List
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

# Knowledge domain mapping by function
KNOWLEDGE_DOMAINS_BY_FUNCTION = {
    'Medical Affairs': [
        'Clinical Medicine',
        'Pharmacology',
        'Evidence-Based Medicine',
        'Medical Literature Review',
        'Clinical Trial Design',
        'Medical Communications',
        'Scientific Publications',
        'Medical Education'
    ],
    'Regulatory Affairs': [
        'Regulatory Compliance',
        'FDA Guidelines',
        'EMA Regulations',
        'ICH Guidelines',
        'Quality Assurance',
        'Regulatory Submissions',
        'CMC Regulations',
        'Good Manufacturing Practice (GMP)'
    ],
    'Market Access': [
        'Health Economics',
        'Pricing & Reimbursement',
        'Health Technology Assessment (HTA)',
        'HEOR Methodologies',
        'Payer Engagement',
        'Value Communication',
        'Market Research',
        'Formulary Management'
    ],
    'Clinical Development': [
        'Clinical Trial Management',
        'Protocol Development',
        'Clinical Research',
        'Data Management',
        'Biostatistics',
        'Clinical Pharmacology',
        'Patient Recruitment',
        'Site Management'
    ],
    'Pharmacovigilance': [
        'Drug Safety',
        'Adverse Event Reporting',
        'Signal Detection',
        'Risk Management',
        'Pharmacoepidemiology',
        'Safety Surveillance',
        'Regulatory Safety Reporting',
        'Benefit-Risk Assessment'
    ],
    'Manufacturing & Supply Chain': [
        'Pharmaceutical Manufacturing',
        'Quality Control',
        'Supply Chain Management',
        'Process Engineering',
        'Quality by Design (QbD)',
        'Validation',
        'GMP Compliance',
        'Equipment Qualification'
    ],
    'Finance': [
        'Financial Analysis',
        'Accounting Principles',
        'Budgeting',
        'Cost Management',
        'Financial Reporting',
        'Healthcare Economics',
        'Business Analytics',
        'Revenue Management'
    ]
}

# Proficiency levels by agent level
PROFICIENCY_BY_LEVEL = {
    'Master': {'level': 'expert', 'score': 5},
    'Expert': {'level': 'expert', 'score': 4},
    'Specialist': {'level': 'advanced', 'score': 3},
    'Worker': {'level': 'intermediate', 'score': 2},
    'Tool': {'level': 'basic', 'score': 1}
}


class KnowledgeDomainEnricher:
    def __init__(self):
        self.supabase = create_client(
            os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_KEY')
        )
    
    def get_domains_for_agent(self, agent: Dict) -> List[Dict]:
        """Get appropriate knowledge domains for an agent"""
        function = agent.get('function_name', '')
        role = agent.get('role_name', '')
        level_id = agent.get('agent_level_id')
        level_name = LEVEL_NAMES.get(level_id, 'Specialist')
        
        # Get base domains from function
        base_domains = KNOWLEDGE_DOMAINS_BY_FUNCTION.get(function, [
            'Healthcare Operations',
            'Medical Knowledge',
            'Healthcare Analytics'
        ])
        
        # Number of domains by level
        num_domains = {
            'Master': 5,
            'Expert': 4,
            'Specialist': 3,
            'Worker': 2,
            'Tool': 1
        }
        
        # Get proficiency
        proficiency = PROFICIENCY_BY_LEVEL.get(level_name, {'level': 'intermediate', 'score': 2})
        
        # Select domains
        domains_to_assign = base_domains[:num_domains.get(level_name, 3)]
        
        # Build domain assignments
        domain_assignments = []
        for i, domain_name in enumerate(domains_to_assign):
            is_primary = (i == 0)  # First domain is primary
            
            domain_assignments.append({
                'agent_id': agent['id'],
                'domain_name': domain_name,
                'proficiency_level': proficiency['level'],
                'expertise_level': proficiency['score'],
                'is_primary_domain': is_primary,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            })
        
        return domain_assignments
    
    def enrich_all_agents(self):
        """Enrich all agents with knowledge domains"""
        print("🔍 Fetching all agents...")
        
        # Get all agents
        response = self.supabase.table('agents').select('''
            id, name, function_name, role_name, agent_level_id
        ''').execute()
        
        agents = response.data
        print(f"📊 Found {len(agents)} agents")
        print()
        
        # Clear existing domains (for idempotency)
        print("🗑️  Clearing existing knowledge domains...")
        self.supabase.table('agent_knowledge_domains').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        
        print("✨ Generating knowledge domain assignments...")
        print()
        
        all_domains = []
        enriched_count = 0
        
        for i, agent in enumerate(agents, 1):
            try:
                domains = self.get_domains_for_agent(agent)
                all_domains.extend(domains)
                enriched_count += 1
                
                if i % 50 == 0:
                    print(f"  ✓ Processed {i}/{len(agents)} agents...")
            
            except Exception as e:
                print(f"  ❌ Failed to process {agent['name']}: {str(e)}")
        
        print()
        print(f"💾 Inserting {len(all_domains)} knowledge domain assignments...")
        print()
        
        # Insert in batches of 100
        batch_size = 100
        inserted_count = 0
        
        for i in range(0, len(all_domains), batch_size):
            batch = all_domains[i:i + batch_size]
            try:
                self.supabase.table('agent_knowledge_domains').insert(batch).execute()
                inserted_count += len(batch)
                
                if (i + batch_size) % 500 == 0:
                    print(f"  ✓ Inserted {inserted_count}/{len(all_domains)} domains...")
            
            except Exception as e:
                print(f"  ❌ Failed to insert batch: {str(e)}")
        
        print()
        print("=" * 70)
        print(f"✅ Successfully enriched {enriched_count} agents")
        print(f"✅ Inserted {inserted_count} knowledge domain assignments")
        print("=" * 70)
        
        # Summary statistics
        print()
        print("📊 SUMMARY BY AGENT LEVEL:")
        print("-" * 70)
        
        for level_name, level_id in AGENT_LEVELS.items():
            level_agents = [a for a in agents if a.get('agent_level_id') == level_id]
            num_domains = {
                'Master': 5, 'Expert': 4, 'Specialist': 3, 'Worker': 2, 'Tool': 1
            }
            expected_domains = len(level_agents) * num_domains.get(level_name, 3)
            
            print(f"  {level_name:12s}: {len(level_agents):3d} agents × {num_domains.get(level_name, 3)} domains = {expected_domains:4d} assignments")
        
        print()
        return enriched_count, inserted_count


def main():
    # Check environment variables
    required_vars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        sys.exit(1)
    
    print("🚀 Agent Knowledge Domains Enrichment")
    print("=" * 70)
    print()
    
    enricher = KnowledgeDomainEnricher()
    enriched, inserted = enricher.enrich_all_agents()
    
    print()
    print("🎉 Knowledge domain enrichment complete!")
    
    return 0


if __name__ == '__main__':
    sys.exit(main())


