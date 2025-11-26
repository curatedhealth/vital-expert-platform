#!/usr/bin/env python3
"""
Phase 2B: Complete Agent Skills Assignment
Assigns skills to all 324 remaining agents based on their level, function, and role.
"""

import os
import sys
from typing import Dict, List
from supabase import create_client
from datetime import datetime
import random

# Agent Level UUIDs
AGENT_LEVELS = {
    'Master': '5e27905e-6f58-462e-93a4-6fad5388ebaf',
    'Expert': 'a6e394b0-6ca1-4cb1-8097-719523ee6782',
    'Specialist': '5a3647eb-a2bd-43f2-9c8b-6413d39ed0fb',
    'Worker': 'c6f7eec5-3fc5-4f10-b030-bce0d22480e8',
    'Tool': '45420d67-67bf-44cf-a842-44bbaf3145e7'
}

LEVEL_NAMES = {v: k for k, v in AGENT_LEVELS.items()}

# Number of skills by level
SKILLS_BY_LEVEL = {
    'Master': (15, 25),      # 15-25 skills
    'Expert': (10, 18),      # 10-18 skills
    'Specialist': (6, 12),   # 6-12 skills
    'Worker': (3, 8),        # 3-8 skills
    'Tool': (1, 3)           # 1-3 skills
}

# Proficiency by level
PROFICIENCY_BY_LEVEL = {
    'Master': 'expert',
    'Expert': 'advanced',
    'Specialist': 'intermediate',
    'Worker': 'basic',      # Changed from 'beginner' to 'basic'
    'Tool': 'basic'          # Changed from 'beginner' to 'basic'
}


class SkillsAssigner:
    def __init__(self):
        self.supabase = create_client(
            os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_KEY')
        )
        self.all_skills = []
        self.skills_by_category = {}
    
    def load_skills(self):
        """Load all available skills"""
        print("🔍 Loading available skills...")
        
        response = self.supabase.table('skills').select('*').execute()
        self.all_skills = response.data
        
        # Group by category
        for skill in self.all_skills:
            category = skill.get('category', 'General')
            if category not in self.skills_by_category:
                self.skills_by_category[category] = []
            self.skills_by_category[category].append(skill)
        
        print(f"   ✅ Loaded {len(self.all_skills)} skills across {len(self.skills_by_category)} categories")
        for category, skills in self.skills_by_category.items():
            print(f"      • {category}: {len(skills)} skills")
        print()
    
    def get_relevant_skills(self, agent: Dict) -> List[Dict]:
        """Get relevant skills for an agent based on function, role, and level"""
        function = agent.get('function_name', '')
        role = agent.get('role_name', '')
        level_id = agent.get('agent_level_id')
        level_name = LEVEL_NAMES.get(level_id, 'Specialist')
        
        # Get skill count range
        min_skills, max_skills = SKILLS_BY_LEVEL.get(level_name, (6, 12))
        num_skills = random.randint(min_skills, max_skills)
        
        # Get proficiency
        proficiency = PROFICIENCY_BY_LEVEL.get(level_name, 'intermediate')
        
        # Select relevant skills
        relevant_skills = []
        
        # Priority 1: Function-specific skills
        function_keywords = [function.lower()] if function else []
        
        # Priority 2: Role-specific skills
        role_keywords = role.lower().split() if role else []
        
        # Priority 3: General skills
        all_keywords = function_keywords + role_keywords
        
        # Score and select skills
        scored_skills = []
        for skill in self.all_skills:
            score = 0
            skill_name = skill.get('name', '').lower()
            skill_desc = skill.get('description', '').lower()
            skill_category = skill.get('category', '').lower()
            
            # Match by keywords
            for keyword in all_keywords:
                if keyword in skill_name:
                    score += 10
                if keyword in skill_desc:
                    score += 5
                if keyword in skill_category:
                    score += 3
            
            # Boost by complexity match
            skill_complexity = skill.get('complexity_level', 'intermediate')
            if skill_complexity == proficiency:
                score += 5
            
            if score > 0:
                scored_skills.append((score, skill))
        
        # Sort by score and select top N
        scored_skills.sort(reverse=True, key=lambda x: x[0])
        selected_skills = [s[1] for s in scored_skills[:num_skills]]
        
        # Fill remaining with random skills if needed
        if len(selected_skills) < num_skills:
            remaining = num_skills - len(selected_skills)
            available = [s for s in self.all_skills if s not in selected_skills]
            selected_skills.extend(random.sample(available, min(remaining, len(available))))
        
        # Build assignments
        assignments = []
        for i, skill in enumerate(selected_skills):
            assignments.append({
                'agent_id': agent['id'],
                'skill_id': skill['id'],
                'proficiency_level': proficiency,
                'proficiency_score': self._get_proficiency_score(proficiency),
                'is_enabled': True,
                'execution_priority': i + 1,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            })
        
        return assignments
    
    def _get_proficiency_score(self, proficiency: str) -> float:
        """Convert proficiency level to score (0-1 range)"""
        scores = {
            'basic': 0.25,
            'intermediate': 0.50,
            'advanced': 0.75,
            'expert': 1.0
        }
        return scores.get(proficiency, 0.50)
    
    def assign_skills_to_agents(self):
        """Assign skills to all agents without skills"""
        print("🔍 Finding agents without skills...")
        
        # Get all agents
        all_agents = self.supabase.table('agents').select('''
            id, name, agent_level_id, function_name, role_name
        ''').execute()
        
        # Get agents with skills
        existing_skills = self.supabase.table('agent_skills').select('agent_id').execute()
        agents_with_skills = set(r['agent_id'] for r in existing_skills.data)
        
        # Filter agents without skills
        agents_needing_skills = [
            a for a in all_agents.data 
            if a['id'] not in agents_with_skills
        ]
        
        print(f"   📊 Total agents: {len(all_agents.data)}")
        print(f"   ✅ Agents with skills: {len(agents_with_skills)}")
        print(f"   ⚠️  Agents needing skills: {len(agents_needing_skills)}")
        print()
        
        if not agents_needing_skills:
            print("✅ All agents already have skills assigned!")
            return 0, 0
        
        print("✨ Generating skill assignments...")
        print()
        
        all_assignments = []
        enriched_count = 0
        
        for i, agent in enumerate(agents_needing_skills, 1):
            try:
                assignments = self.get_relevant_skills(agent)
                all_assignments.extend(assignments)
                enriched_count += 1
                
                if i % 50 == 0:
                    print(f"  ✓ Processed {i}/{len(agents_needing_skills)} agents...")
            
            except Exception as e:
                print(f"  ❌ Failed to process {agent['name']}: {str(e)}")
        
        print()
        print(f"💾 Inserting {len(all_assignments)} skill assignments...")
        print()
        
        # Insert in batches
        batch_size = 100
        inserted_count = 0
        
        for i in range(0, len(all_assignments), batch_size):
            batch = all_assignments[i:i + batch_size]
            try:
                self.supabase.table('agent_skills').insert(batch).execute()
                inserted_count += len(batch)
                
                if (i + batch_size) % 500 == 0:
                    print(f"  ✓ Inserted {inserted_count}/{len(all_assignments)} assignments...")
            
            except Exception as e:
                print(f"  ❌ Failed to insert batch: {str(e)}")
        
        print()
        print("=" * 70)
        print(f"✅ Successfully assigned skills to {enriched_count} agents")
        print(f"✅ Inserted {inserted_count} skill assignments")
        print("=" * 70)
        
        return enriched_count, inserted_count


def main():
    # Check environment variables
    required_vars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        sys.exit(1)
    
    print("🚀 Phase 2B: Complete Agent Skills Assignment")
    print("=" * 70)
    print()
    
    assigner = SkillsAssigner()
    assigner.load_skills()
    
    enriched, inserted = assigner.assign_skills_to_agents()
    
    print()
    print("🎉 Skills assignment complete!")
    
    return 0


if __name__ == '__main__':
    sys.exit(main())

