#!/usr/bin/env python3
"""
Generate Context-Aware Prompt Starters for All Agents
Creates 4-8 starters per agent based on role, level, skills, and function.
"""

import os
import sys
from typing import Dict, List, Set
from supabase import create_client
from datetime import datetime
import random

# Agent Level UUIDs
AGENT_LEVELS = {
    '5e27905e-6f58-462e-93a4-6fad5388ebaf': 'Master',
    'a6e394b0-6ca1-4cb1-8097-719523ee6782': 'Expert',
    '5a3647eb-a2bd-43f2-9c8b-6413d39ed0fb': 'Specialist',
    'c6f7eec5-3fc5-4f10-b030-bce0d22480e8': 'Worker',
    '45420d67-67bf-44cf-a842-44bbaf3145e7': 'Tool'
}


class PromptStarterGenerator:
    def __init__(self):
        self.supabase = create_client(
            os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_KEY')
        )
        self.agents = []
        self.prompts = []
        self.agent_skills = {}
        
    def load_data(self):
        """Load agents, prompts, and skills"""
        print("🔍 Loading data from database...")
        print()
        
        # Load agents with all relevant metadata
        print("   Loading agents...")
        agents_result = self.supabase.table('agents').select('''
            id, name, slug, agent_level_id, 
            function_name, department_name, role_name,
            expertise_level, title
        ''').execute()
        self.agents = agents_result.data
        print(f"   ✅ Loaded {len(self.agents)} agents")
        
        # Load prompts library (handle pagination - fetch ALL prompts)
        print("   Loading prompts library...")
        all_prompts = []
        page_size = 1000
        offset = 0
        
        while True:
            prompts_result = self.supabase.table('prompts').select('''
                id, name, title, content, category, function,
                complexity, role_type, task_type
            ''').range(offset, offset + page_size - 1).execute()
            
            if not prompts_result.data:
                break
            
            all_prompts.extend(prompts_result.data)
            
            if len(prompts_result.data) < page_size:
                break
            
            offset += page_size
        
        self.prompts = all_prompts
        print(f"   ✅ Loaded {len(self.prompts)} prompts")
        
        # Load agent skills
        print("   Loading agent skills...")
        skills_result = self.supabase.table('agent_skills').select('''
            agent_id, skill_id, proficiency_level,
            skills(name, category)
        ''').execute()
        
        # Group skills by agent
        for record in skills_result.data:
            agent_id = record['agent_id']
            if agent_id not in self.agent_skills:
                self.agent_skills[agent_id] = []
            
            skill_info = record.get('skills')
            if skill_info:
                self.agent_skills[agent_id].append({
                    'name': skill_info.get('name'),
                    'category': skill_info.get('category'),
                    'proficiency': record.get('proficiency_level')
                })
        
        print(f"   ✅ Loaded skills for {len(self.agent_skills)} agents")
        print()
    
    def match_prompts_to_agent(self, agent: Dict) -> List[Dict]:
        """Match relevant prompts to an agent based on context"""
        agent_level_name = AGENT_LEVELS.get(agent.get('agent_level_id'), 'Specialist')
        function = agent.get('function_name', '').lower()
        department = agent.get('department_name', '').lower()
        role = agent.get('role_name', '').lower()
        expertise = agent.get('expertise_level', 'intermediate').lower()
        
        # Get agent's skills
        agent_id = agent['id']
        skills = self.agent_skills.get(agent_id, [])
        skill_categories = set(s['category'].lower() for s in skills if s.get('category'))
        
        scored_prompts = []
        
        for prompt in self.prompts:
            score = 0
            
            # Match by function
            prompt_function = (prompt.get('function') or '').lower()
            if prompt_function and prompt_function in function:
                score += 5
            
            # Match by category (align with department/function)
            prompt_category = (prompt.get('category') or '').lower()
            if prompt_category:
                if prompt_category in department or prompt_category in function:
                    score += 4
                
                # Match with skill categories
                if any(cat in prompt_category for cat in skill_categories):
                    score += 3
            
            # Match by role
            if role and role in (prompt.get('name') or '').lower():
                score += 3
            
            # Match by complexity/expertise
            prompt_complexity = (prompt.get('complexity') or '').lower()
            if prompt_complexity == expertise:
                score += 2
            elif agent_level_name == 'Master' and prompt_complexity == 'expert':
                score += 2
            elif agent_level_name == 'Expert' and prompt_complexity in ['advanced', 'expert']:
                score += 2
            elif agent_level_name == 'Specialist' and prompt_complexity in ['intermediate', 'advanced']:
                score += 2
            
            # Match by task type
            task_type = (prompt.get('task_type') or '').lower()
            if task_type:
                if task_type in role or task_type in function:
                    score += 2
            
            # Always include some general prompts
            if 'general' in prompt_category or 'overview' in (prompt.get('name') or '').lower():
                score += 1
            
            # Include ALL prompts (even with score 0) so we have a full pool
            scored_prompts.append({
                'prompt': prompt,
                'score': score
            })
        
        # Sort by score and return top matches
        scored_prompts.sort(key=lambda x: x['score'], reverse=True)
        
        # Get 4-8 prompts (varied by level)
        if agent_level_name == 'Master':
            num_starters = 8
        elif agent_level_name == 'Expert':
            num_starters = 7
        elif agent_level_name == 'Specialist':
            num_starters = 6
        elif agent_level_name == 'Worker':
            num_starters = 5
        else:  # Tool
            num_starters = 4
        
        # Get top matches
        if len(scored_prompts) >= num_starters:
            # We have enough scored prompts
            top_prompts = scored_prompts[:num_starters * 2]  # Get 2x to allow for variety
            
            if len(top_prompts) > num_starters:
                # Take top half guaranteed, randomize the rest
                guaranteed = top_prompts[:num_starters // 2]
                candidates = top_prompts[num_starters // 2:]
                selected = guaranteed + random.sample(candidates, min(num_starters - len(guaranteed), len(candidates)))
            else:
                selected = top_prompts[:num_starters]
        else:
            # Not enough scored prompts - supplement with random general prompts
            selected = scored_prompts  # Take all we have
            
            # Add general/diverse prompts to reach target
            remaining_needed = num_starters - len(selected)
            
            # Get prompts we haven't already selected
            already_selected_ids = set(p['prompt']['id'] for p in selected)
            available_prompts = [p for p in self.prompts if p['id'] not in already_selected_ids]
            
            # Add random selection to fill the gap
            if available_prompts and remaining_needed > 0:
                additional = random.sample(available_prompts, min(remaining_needed, len(available_prompts)))
                selected.extend([{'prompt': p, 'score': 0} for p in additional])
        
        return [p['prompt'] for p in selected]
    
    def generate_starter_text(self, prompt: Dict, agent: Dict, sequence: int) -> str:
        """Generate concise starter text from prompt"""
        # Use title if available, otherwise use name
        base_text = prompt.get('title') or prompt.get('name')
        
        # Truncate if too long (keep under 100 chars for good UX)
        if len(base_text) > 95:
            base_text = base_text[:92] + "..."
        
        return base_text
    
    def assign_category_and_icon(self, prompt: Dict, agent: Dict) -> tuple:
        """Assign category and icon based on prompt and agent context"""
        prompt_category = (prompt.get('category') or '').lower()
        function = (agent.get('function_name') or '').lower()
        
        # Category mapping
        if 'clinical' in prompt_category or 'medical' in prompt_category:
            category = 'Clinical'
            icon = '🏥'
        elif 'regulatory' in prompt_category or 'compliance' in prompt_category:
            category = 'Regulatory'
            icon = '📋'
        elif 'safety' in prompt_category or 'pharmacovigilance' in prompt_category:
            category = 'Safety'
            icon = '⚠️'
        elif 'market' in prompt_category or 'access' in prompt_category:
            category = 'Market Access'
            icon = '📊'
        elif 'data' in prompt_category or 'analytics' in prompt_category:
            category = 'Analytics'
            icon = '📈'
        elif 'research' in prompt_category or 'development' in prompt_category:
            category = 'R&D'
            icon = '🔬'
        elif 'operations' in prompt_category or 'process' in prompt_category:
            category = 'Operations'
            icon = '⚙️'
        elif 'communication' in prompt_category or 'education' in prompt_category:
            category = 'Communications'
            icon = '💬'
        else:
            # Fallback to function-based category
            if 'medical' in function:
                category = 'Medical'
                icon = '🩺'
            elif 'regulatory' in function:
                category = 'Regulatory'
                icon = '📋'
            else:
                category = 'General'
                icon = '💡'
        
        return category, icon
    
    def generate_all_starters(self):
        """Generate prompt starters for all agents"""
        print("=" * 80)
        print("GENERATING PROMPT STARTERS")
        print("=" * 80)
        print()
        
        all_starters = []
        agents_processed = 0
        agents_with_starters = 0
        total_starters = 0
        skipped_agents = []
        
        for agent in self.agents:
            agents_processed += 1
            agent_name = agent.get('name')
            agent_level_name = AGENT_LEVELS.get(agent.get('agent_level_id'), 'Specialist')
            
            # Match prompts to agent
            matched_prompts = self.match_prompts_to_agent(agent)
            
            if not matched_prompts or len(matched_prompts) == 0:
                # Use fallback: select diverse prompts from library
                function = agent.get('function_name', '').lower()
                department = agent.get('department_name', '').lower()
                
                # Get general/overview prompts first
                general = [p for p in self.prompts if 'general' in (p.get('category') or '').lower()]
                
                # Get department-relevant prompts
                dept_relevant = [p for p in self.prompts 
                                if department and department in (p.get('category') or '').lower()]
                
                # Get function-relevant prompts
                func_relevant = [p for p in self.prompts 
                               if function and function in (p.get('function') or '').lower()]
                
                # Combine and take first 6
                combined = (dept_relevant[:2] + func_relevant[:2] + general[:2])
                
                # If still not enough, just take first 6 from library
                if len(combined) < 4:
                    combined = self.prompts[:6]
                
                matched_prompts = combined[:6]
                
                if agents_processed % 100 == 0:
                    print(f"   ⚠️  Used fallback for {agent_name}")
            
            # Generate starters
            if matched_prompts:
                for sequence, prompt in enumerate(matched_prompts, 1):
                    starter_text = self.generate_starter_text(prompt, agent, sequence)
                    category, icon = self.assign_category_and_icon(prompt, agent)
                    
                    starter = {
                        'agent_id': agent['id'],
                        'text': starter_text,
                        'icon': icon,
                        'category': category,
                        'sequence_order': sequence,
                        'is_active': True,
                        'created_at': datetime.now().isoformat()
                    }
                    
                    all_starters.append(starter)
                    total_starters += 1
                
                agents_with_starters += 1
            else:
                # This should NEVER happen now
                skipped_agents.append(agent_name)
                if agents_processed % 10 == 0:
                    print(f"   ⚠️  SKIPPED: {agent_name} (no prompts matched)")
            
            if agents_processed % 50 == 0:
                print(f"   ✓ Processed {agents_processed}/{len(self.agents)} agents...")
        
        print()
        print(f"✅ Generated {total_starters} prompt starters for {agents_with_starters}/{agents_processed} agents")
        print(f"   Average: {total_starters / agents_with_starters if agents_with_starters > 0 else 0:.1f} starters per agent")
        
        if skipped_agents:
            print(f"\n⚠️  SKIPPED {len(skipped_agents)} agents:")
            for name in skipped_agents[:10]:
                print(f"   • {name}")
            if len(skipped_agents) > 10:
                print(f"   ... and {len(skipped_agents) - 10} more")
        
        print()
        
        return all_starters
    
    def insert_starters(self, starters: List[Dict]):
        """Insert starters into database"""
        print("=" * 80)
        print("INSERTING PROMPT STARTERS")
        print("=" * 80)
        print()
        
        # Clear existing starters
        print("🗑️  Clearing existing starters...")
        try:
            self.supabase.table('agent_prompt_starters').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
            print("   ✅ Cleared existing data")
        except Exception as e:
            print(f"   ⚠️  Could not clear: {str(e)[:80]}")
        
        print()
        print("💾 Inserting new starters...")
        
        # Insert in smaller batches to avoid Supabase limits
        batch_size = 50  # Reduced from 100 to be safer
        inserted = 0
        failed = 0
        
        for i in range(0, len(starters), batch_size):
            batch = starters[i:i+batch_size]
            try:
                result = self.supabase.table('agent_prompt_starters').insert(batch).execute()
                inserted += len(batch)
                
                if inserted % 500 == 0 or inserted == len(starters):
                    print(f"   ✓ Inserted {inserted}/{len(starters)} starters...")
            except Exception as e:
                failed += len(batch)
                print(f"   ❌ Batch {i}-{i+len(batch)} failed: {str(e)[:150]}")
                # Try inserting one by one for failed batch
                for starter in batch:
                    try:
                        self.supabase.table('agent_prompt_starters').insert([starter]).execute()
                        inserted += 1
                        failed -= 1
                    except:
                        pass
        
        if failed > 0:
            print(f"   ⚠️  Failed to insert {failed} starters")
        
        print()
        print(f"✅ Successfully inserted {inserted} prompt starters!")
        print()
    
    def verify_results(self):
        """Verify the insertion was successful"""
        print("=" * 80)
        print("VERIFICATION")
        print("=" * 80)
        print()
        
        # Count total starters with pagination
        all_starters = []
        page_size = 1000
        offset = 0
        
        while True:
            result = self.supabase.table('agent_prompt_starters').select('agent_id').range(offset, offset + page_size - 1).execute()
            if not result.data:
                break
            all_starters.extend(result.data)
            if len(result.data) < page_size:
                break
            offset += page_size
        
        total = len(all_starters)
        print(f"✅ Total prompt starters in database: {total}")
        
        # Count agents with starters
        starters_by_agent = {}
        for starter in all_starters:
            agent_id = starter['agent_id']
            starters_by_agent[agent_id] = starters_by_agent.get(agent_id, 0) + 1
        
        agents_with_starters = len(starters_by_agent)
        print(f"✅ Agents with starters: {agents_with_starters}/{len(self.agents)} ({agents_with_starters/len(self.agents)*100:.1f}%)")
        
        # Distribution
        if starters_by_agent:
            counts = list(starters_by_agent.values())
            avg = sum(counts) / len(counts)
            min_count = min(counts)
            max_count = max(counts)
            
            print(f"\n📊 Distribution:")
            print(f"   • Average: {avg:.1f} starters per agent")
            print(f"   • Min: {min_count} starters")
            print(f"   • Max: {max_count} starters")
            
            # Show breakdown
            print(f"\n📈 Breakdown:")
            for i in range(4, 9):
                count = sum(1 for c in counts if c == i)
                if count > 0:
                    pct = count / len(counts) * 100
                    print(f"   • {i} starters: {count} agents ({pct:.1f}%)")
        
        print()
    
    def run(self):
        """Main execution"""
        print()
        print("╔" + "=" * 78 + "╗")
        print("║" + " " * 20 + "PROMPT STARTER GENERATION" + " " * 33 + "║")
        print("╚" + "=" * 78 + "╝")
        print()
        
        # Load data
        self.load_data()
        
        # Generate starters
        starters = self.generate_all_starters()
        
        # Insert into database
        self.insert_starters(starters)
        
        # Verify
        self.verify_results()
        
        print("╔" + "=" * 78 + "╗")
        print("║" + " " * 25 + "GENERATION COMPLETE! ✅" + " " * 31 + "║")
        print("╚" + "=" * 78 + "╝")
        print()


def main():
    # Check environment
    required_vars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        sys.exit(1)
    
    generator = PromptStarterGenerator()
    generator.run()
    
    return 0


if __name__ == '__main__':
    sys.exit(main())

