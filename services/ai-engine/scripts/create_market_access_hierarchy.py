#!/usr/bin/env python3
"""
Market Access 5-Level Hierarchy Implementation
Creates departments, roles, remaps existing agents, and creates new agents
"""

import os
import sys
from typing import Dict, List
from supabase import create_client
from datetime import datetime
import uuid


# Agent Level UUIDs
AGENT_LEVELS = {
    'Master': '5e27905e-6f58-462e-93a4-6fad5388ebaf',
    'Expert': 'a6e394b0-6ca1-4cb1-8097-719523ee6782',
    'Specialist': '5a3647eb-a2bd-43f2-9c8b-6413d39ed0fb',
    'Worker': 'c6f7eec5-3fc5-4f10-b030-bce0d22480e8',
    'Tool': '45420d67-67bf-44cf-a842-44bbaf3145e7'
}


class MarketAccessHierarchy:
    def __init__(self):
        self.supabase = create_client(
            os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_KEY')
        )
        self.function_id = None
        self.departments = {}
        self.roles = {}
        
    def get_market_access_function(self):
        """Get or verify Market Access function"""
        print("🔍 Finding Market Access function...")
        
        result = self.supabase.table('org_functions').select('id, name').ilike('name', '%market access%').execute()
        
        if result.data:
            self.function_id = result.data[0]['id']
            print(f"✅ Found: {result.data[0]['name']} (ID: {self.function_id})")
            return True
        else:
            print("❌ Market Access function not found")
            return False
    
    def create_departments(self):
        """Create Market Access departments"""
        print("\n" + "="*80)
        print("CREATING MARKET ACCESS DEPARTMENTS")
        print("="*80)
        print()
        
        departments_data = [
            {
                'name': 'HEOR & Evidence Generation',
                'description': 'Health Economics & Outcomes Research team responsible for economic modeling, value demonstration, and evidence synthesis'
            },
            {
                'name': 'Pricing & Reimbursement',
                'description': 'Global and local pricing strategy, reimbursement optimization, and payor negotiations'
            },
            {
                'name': 'Payer Strategy & Relations',
                'description': 'Strategic payer engagement, value-based contracting, and managed care relationships'
            },
            {
                'name': 'Market Access Operations',
                'description': 'Cross-functional coordination, analytics, and operational excellence for market access'
            },
            {
                'name': 'Value & Communications',
                'description': 'Value proposition development, messaging, and market access communications'
            }
        ]
        
        for dept_data in departments_data:
            # Check if exists
            existing = self.supabase.table('org_departments').select('id, name').eq('name', dept_data['name']).execute()
            
            if existing.data:
                dept_id = existing.data[0]['id']
                print(f"⚠️  {dept_data['name']} already exists")
            else:
                # Create department
                new_dept = self.supabase.table('org_departments').insert({
                    'name': dept_data['name'],
                    'description': dept_data['description'],
                    'created_at': datetime.now().isoformat()
                }).execute()
                
                dept_id = new_dept.data[0]['id']
                print(f"✅ Created: {dept_data['name']}")
            
            self.departments[dept_data['name']] = dept_id
            
            # Link to Market Access function
            try:
                self.supabase.table('org_function_departments').insert({
                    'function_id': self.function_id,
                    'department_id': dept_id,
                    'created_at': datetime.now().isoformat()
                }).execute()
            except:
                pass  # Already linked
        
        print(f"\n✅ {len(self.departments)} departments ready")
    
    def create_roles(self):
        """Create Market Access roles with 5-level hierarchy"""
        print("\n" + "="*80)
        print("CREATING MARKET ACCESS ROLES")
        print("="*80)
        print()
        
        roles_data = [
            # LEVEL 1 - MASTER
            {'name': 'VP Market Access', 'level': 1, 'dept': 'Market Access Operations', 'agent_level': 'Master'},
            {'name': 'Global Head of Market Access', 'level': 1, 'dept': 'Market Access Operations', 'agent_level': 'Master'},
            {'name': 'Senior Director Market Access Strategy', 'level': 1, 'dept': 'Market Access Operations', 'agent_level': 'Master'},
            {'name': 'Global Payer Strategy Lead', 'level': 1, 'dept': 'Payer Strategy & Relations', 'agent_level': 'Master'},
            
            # LEVEL 2 - EXPERT  
            {'name': 'HEOR Director', 'level': 2, 'dept': 'HEOR & Evidence Generation', 'agent_level': 'Expert'},
            {'name': 'Pricing Strategy Director', 'level': 2, 'dept': 'Pricing & Reimbursement', 'agent_level': 'Expert'},
            {'name': 'Payer Strategy Director', 'level': 2, 'dept': 'Payer Strategy & Relations', 'agent_level': 'Expert'},
            {'name': 'Market Access Operations Director', 'level': 2, 'dept': 'Market Access Operations', 'agent_level': 'Expert'},
            {'name': 'Reimbursement Strategy Director', 'level': 2, 'dept': 'Pricing & Reimbursement', 'agent_level': 'Expert'},
            {'name': 'Value & Evidence Lead', 'level': 2, 'dept': 'Value & Communications', 'agent_level': 'Expert'},
            
            # LEVEL 3 - SPECIALIST
            {'name': 'Health Economics Modeler', 'level': 3, 'dept': 'HEOR & Evidence Generation', 'agent_level': 'Specialist'},
            {'name': 'Pricing Strategy Advisor', 'level': 3, 'dept': 'Pricing & Reimbursement', 'agent_level': 'Specialist'},
            {'name': 'Payer Strategy Advisor', 'level': 3, 'dept': 'Payer Strategy & Relations', 'agent_level': 'Specialist'},
            {'name': 'Value-Based Contracting Specialist', 'level': 3, 'dept': 'Payer Strategy & Relations', 'agent_level': 'Specialist'},
            {'name': 'Health Economics Specialist', 'level': 3, 'dept': 'HEOR & Evidence Generation', 'agent_level': 'Specialist'},
            {'name': 'Market Access Communications Lead', 'level': 3, 'dept': 'Value & Communications', 'agent_level': 'Specialist'},
            {'name': 'Reimbursement Strategist', 'level': 3, 'dept': 'Pricing & Reimbursement', 'agent_level': 'Specialist'},
            {'name': 'Value Dossier Developer', 'level': 3, 'dept': 'Value & Communications', 'agent_level': 'Specialist'},
            {'name': 'Reimbursement Strategy Manager', 'level': 3, 'dept': 'Pricing & Reimbursement', 'agent_level': 'Specialist'},
            
            # LEVEL 4 - WORKER
            {'name': 'HEOR Analyst', 'level': 4, 'dept': 'HEOR & Evidence Generation', 'agent_level': 'Worker'},
            {'name': 'Pricing Analyst', 'level': 4, 'dept': 'Pricing & Reimbursement', 'agent_level': 'Worker'},
            {'name': 'Market Access Data Analyst', 'level': 4, 'dept': 'Market Access Operations', 'agent_level': 'Worker'},
            {'name': 'Contract Analyst', 'level': 4, 'dept': 'Payer Strategy & Relations', 'agent_level': 'Worker'},
            {'name': 'Reimbursement Analyst', 'level': 4, 'dept': 'Pricing & Reimbursement', 'agent_level': 'Worker'},
            {'name': 'Payer Marketing Manager', 'level': 4, 'dept': 'Value & Communications', 'agent_level': 'Worker'},
            {'name': 'Value Communications Coordinator', 'level': 4, 'dept': 'Value & Communications', 'agent_level': 'Worker'},
            
            # LEVEL 5 - TOOL
            {'name': 'Pricing Calculator', 'level': 5, 'dept': 'Pricing & Reimbursement', 'agent_level': 'Tool'},
            {'name': 'Reimbursement Code Lookup', 'level': 5, 'dept': 'Pricing & Reimbursement', 'agent_level': 'Tool'},
            {'name': 'HEOR Literature Searcher', 'level': 5, 'dept': 'HEOR & Evidence Generation', 'agent_level': 'Tool'},
            {'name': 'Payer Database Query Tool', 'level': 5, 'dept': 'Payer Strategy & Relations', 'agent_level': 'Tool'},
            {'name': 'Value Message Generator', 'level': 5, 'dept': 'Value & Communications', 'agent_level': 'Tool'},
        ]
        
        created = 0
        for role_data in roles_data:
            # Get department ID
            dept_id = self.departments.get(role_data['dept'])
            if not dept_id:
                print(f"⚠️  Department not found: {role_data['dept']}")
                continue
            
            # Check if role exists
            existing = self.supabase.table('org_roles').select('id, name').eq('name', role_data['name']).execute()
            
            if existing.data:
                role_id = existing.data[0]['id']
            else:
                # Create role
                new_role = self.supabase.table('org_roles').insert({
                    'name': role_data['name'],
                    'level': role_data['level'],
                    'created_at': datetime.now().isoformat()
                }).execute()
                
                role_id = new_role.data[0]['id']
                created += 1
            
            self.roles[role_data['name']] = {
                'id': role_id,
                'dept_id': dept_id,
                'agent_level': role_data['agent_level'],
                'hierarchy_level': role_data['level']
            }
            
            # Link role to department
            try:
                self.supabase.table('org_department_roles').insert({
                    'department_id': dept_id,
                    'role_id': role_id,
                    'created_at': datetime.now().isoformat()
                }).execute()
            except:
                pass  # Already linked
        
        print(f"✅ Created {created} new roles")
        print(f"✅ Total roles configured: {len(self.roles)}")
    
    def remap_existing_agents(self):
        """Remap existing 21 Market Access agents to correct roles/departments"""
        print("\n" + "="*80)
        print("REMAPPING EXISTING MARKET ACCESS AGENTS")
        print("="*80)
        print()
        
        # Get existing agents
        result = self.supabase.table('agents').select('id, name, slug').ilike('function_name', '%market access%').execute()
        
        agents = result.data
        print(f"Found {len(agents)} existing Market Access agents")
        print()
        
        # Mapping based on agent names
        agent_role_mapping = {
            'Market Access Communications Lead': 'Market Access Communications Lead',
            'Reimbursement Analyst': 'Reimbursement Analyst',
            'Payer Marketing Manager': 'Payer Marketing Manager',
            'HEOR Director': 'HEOR Director',
            'Pricing Strategy Director': 'Pricing Strategy Director',
            'Health Economics Modeler': 'Health Economics Modeler',
            'Market Access Operations Director': 'Market Access Operations Director',
            'Pricing Strategy Advisor': 'Pricing Strategy Advisor',
            'Market Access Data Analyst': 'Market Access Data Analyst',
            'Reimbursement Strategist': 'Reimbursement Strategist',
            'Payer Strategy Advisor': 'Payer Strategy Advisor',
            'HEOR Analyst': 'HEOR Analyst',
            'Contract Analyst': 'Contract Analyst',
            'Pricing Analyst': 'Pricing Analyst',
            'Payer Strategy Director': 'Payer Strategy Director',
            'Value-Based Contracting Specialist': 'Value-Based Contracting Specialist',
            'Reimbursement Strategy Manager': 'Reimbursement Strategy Manager',
            'Global Pricing Lead': 'Global Payer Strategy Lead',
            'Health Economics Specialist': 'Health Economics Specialist',
            'Value Dossier Developer': 'Value Dossier Developer',
        }
        
        updated = 0
        for agent in agents:
            agent_name = agent['name']
            role_name = agent_role_mapping.get(agent_name)
            
            if role_name and role_name in self.roles:
                role_info = self.roles[role_name]
                
                # Update agent
                self.supabase.table('agents').update({
                    'role_id': role_info['id'],
                    'role_name': role_name,
                    'department_id': role_info['dept_id'],
                    'department_name': self._get_dept_name(role_info['dept_id']),
                    'agent_level_id': AGENT_LEVELS[role_info['agent_level']],
                    'updated_at': datetime.now().isoformat()
                }).eq('id', agent['id']).execute()
                
                updated += 1
                print(f"✅ {agent_name} → {role_name} ({role_info['agent_level']})")
            else:
                print(f"⚠️  {agent_name} - no mapping found")
        
        print()
        print(f"✅ Updated {updated}/{len(agents)} agents")
    
    def _get_dept_name(self, dept_id):
        """Helper to get department name from ID"""
        for name, id in self.departments.items():
            if id == dept_id:
                return name
        return None
    
    def create_missing_agents(self):
        """Create additional Market Access agents to complete the hierarchy"""
        print("\n" + "="*80)
        print("CREATING ADDITIONAL MARKET ACCESS AGENTS")
        print("="*80)
        print()
        
        # New agents to create (roles that don't have agents yet)
        new_agents = [
            {'role': 'VP Market Access', 'name': 'VP Market Access Strategy'},
            {'role': 'Global Head of Market Access', 'name': 'Global Head of Market Access'},
            {'role': 'Senior Director Market Access Strategy', 'name': 'Senior Director Market Access'},
            {'role': 'Value & Evidence Lead', 'name': 'Global Value & Evidence Lead'},
            {'role': 'Value Communications Coordinator', 'name': 'Market Access Communications Coordinator'},
            {'role': 'Pricing Calculator', 'name': 'Pricing Calculation Tool'},
            {'role': 'Reimbursement Code Lookup', 'name': 'Reimbursement Code Finder'},
            {'role': 'HEOR Literature Searcher', 'name': 'HEOR Evidence Finder'},
            {'role': 'Payer Database Query Tool', 'name': 'Payer Data Query Assistant'},
            {'role': 'Value Message Generator', 'name': 'Value Proposition Generator'},
        ]
        
        created = 0
        for agent_data in new_agents:
            role_name = agent_data['role']
            
            if role_name in self.roles:
                role_info = self.roles[role_name]
                dept_name = self._get_dept_name(role_info['dept_id'])
                
                # Create agent
                slug = agent_data['name'].lower().replace(' ', '-')
                
                new_agent = self.supabase.table('agents').insert({
                    'name': agent_data['name'],
                    'slug': slug,
                    'function_id': self.function_id,
                    'function_name': 'Market Access',
                    'department_id': role_info['dept_id'],
                    'department_name': dept_name,
                    'role_id': role_info['id'],
                    'role_name': role_name,
                    'agent_level_id': AGENT_LEVELS[role_info['agent_level']],
                    'status': 'active',
                    'system_prompt': f"You are a {agent_data['name']} specializing in pharmaceutical market access.",
                    'created_at': datetime.now().isoformat()
                }).execute()
                
                created += 1
                print(f"✅ Created: {agent_data['name']} ({role_info['agent_level']})")
        
        print()
        print(f"✅ Created {created} new agents")
    
    def verify_results(self):
        """Verify the complete Market Access hierarchy"""
        print("\n" + "="*80)
        print("VERIFICATION")
        print("="*80)
        print()
        
        # Count agents by level
        result = self.supabase.table('agents').select('agent_level_id').ilike('function_name', '%market access%').execute()
        
        levels = {}
        level_names = {v: k for k, v in AGENT_LEVELS.items()}
        
        for agent in result.data:
            level_id = agent['agent_level_id']
            level_name = level_names.get(level_id, 'Unknown')
            levels[level_name] = levels.get(level_name, 0) + 1
        
        print(f"📊 Total Market Access Agents: {len(result.data)}")
        print()
        print("By Level:")
        for level in ['Master', 'Expert', 'Specialist', 'Worker', 'Tool']:
            count = levels.get(level, 0)
            print(f"   • {level}: {count}")
        
        print()
        print(f"✅ Departments: {len(self.departments)}")
        print(f"✅ Roles: {len(self.roles)}")
    
    def run(self):
        """Execute complete Market Access hierarchy implementation"""
        print()
        print("╔" + "=" * 78 + "╗")
        print("║" + " " * 15 + "MARKET ACCESS 5-LEVEL HIERARCHY" + " " * 31 + "║")
        print("╚" + "=" * 78 + "╝")
        print()
        
        # Step 1: Get function
        if not self.get_market_access_function():
            print("❌ Cannot proceed without Market Access function")
            return
        
        # Step 2: Create departments
        self.create_departments()
        
        # Step 3: Create roles
        self.create_roles()
        
        # Step 4: Remap existing agents
        self.remap_existing_agents()
        
        # Step 5: Create missing agents
        self.create_missing_agents()
        
        # Step 6: Verify
        self.verify_results()
        
        print()
        print("╔" + "=" * 78 + "╗")
        print("║" + " " * 25 + "IMPLEMENTATION COMPLETE! ✅" + " " * 27 + "║")
        print("╚" + "=" * 78 + "╝")
        print()


def main():
    required_vars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        sys.exit(1)
    
    hierarchy = MarketAccessHierarchy()
    hierarchy.run()
    
    return 0


if __name__ == '__main__':
    sys.exit(main())


