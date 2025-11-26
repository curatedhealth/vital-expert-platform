#!/usr/bin/env python3
"""
Load Full Content for All Skills
Reads SKILL.md files and populates full_content field in database
"""

import os
import sys
from pathlib import Path
from typing import Dict, List
from supabase import create_client
from datetime import datetime
import re


class SkillsContentLoader:
    def __init__(self):
        self.supabase = create_client(
            os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_KEY')
        )
        self.vital_skills_dir = Path("/Users/hichamnaim/.cursor/worktrees/VITAL_path/YXdjF/.vital-command-center/skills-main")
        self.awesome_readme = Path("/Users/hichamnaim/Downloads/awesome-claude-skills-main/README.md")
        
    def load_vital_skills_content(self):
        """Load VITAL Command Center skills with full SKILL.md content"""
        print("=" * 80)
        print("LOADING VITAL COMMAND CENTER SKILLS")
        print("=" * 80)
        print()
        
        loaded = 0
        failed = []
        
        # Find all SKILL.md files
        skill_files = list(self.vital_skills_dir.rglob("SKILL.md"))
        print(f"Found {len(skill_files)} SKILL.md files")
        print()
        
        for skill_file in skill_files:
            try:
                # Read full content
                with open(skill_file, 'r', encoding='utf-8') as f:
                    full_content = f.read()
                
                # Get folder name as slug
                folder_name = skill_file.parent.name
                
                # Extract skill name from frontmatter or first heading
                skill_name = self._extract_skill_name(full_content, folder_name)
                
                # Update database
                result = self.supabase.table('skills').update({
                    'full_content': full_content,
                    'content_format': 'markdown',
                    'content_source': 'vital-command-center',
                    'file_path': str(skill_file),
                    'content_loaded_at': datetime.now().isoformat()
                }).or_(f'slug.eq.{folder_name},implementation_ref.ilike.%{folder_name}%').execute()
                
                if result.data:
                    loaded += 1
                    print(f"✅ {skill_name} ({folder_name})")
                else:
                    failed.append(f"{folder_name} - not found in database")
                    print(f"⚠️  {folder_name} - not found in database")
                    
            except Exception as e:
                failed.append(f"{folder_name} - {str(e)[:50]}")
                print(f"❌ {folder_name}: {str(e)[:80]}")
        
        print()
        print(f"✅ Loaded {loaded}/{len(skill_files)} VITAL skills")
        
        if failed:
            print(f"\n⚠️  Failed: {len(failed)} skills")
            for f in failed[:5]:
                print(f"   • {f}")
        
        print()
        return loaded
    
    def _extract_skill_name(self, content: str, fallback: str) -> str:
        """Extract skill name from frontmatter or first heading"""
        # Try frontmatter
        frontmatter_match = re.search(r'^---\s*\nname:\s*(.+?)\n', content, re.MULTILINE)
        if frontmatter_match:
            return frontmatter_match.group(1).strip()
        
        # Try first heading
        heading_match = re.search(r'^#\s+(.+?)$', content, re.MULTILINE)
        if heading_match:
            return heading_match.group(1).strip()
        
        # Fallback to folder name
        return fallback.replace('-', ' ').title()
    
    def load_awesome_claude_skills_content(self):
        """Load Awesome Claude skills with README content"""
        print("=" * 80)
        print("LOADING AWESOME CLAUDE SKILLS")
        print("=" * 80)
        print()
        
        if not self.awesome_readme.exists():
            print(f"❌ README not found: {self.awesome_readme}")
            return 0
        
        # Read README
        with open(self.awesome_readme, 'r', encoding='utf-8') as f:
            readme_content = f.read()
        
        # Parse skills from README
        skills_data = self._parse_awesome_claude_readme(readme_content)
        
        print(f"Found {len(skills_data)} skills in README")
        print()
        
        loaded = 0
        failed = []
        
        for skill_data in skills_data:
            try:
                # Update database with full description as content
                result = self.supabase.table('skills').update({
                    'full_content': skill_data['full_content'],
                    'content_format': 'markdown',
                    'content_source': 'awesome-claude',
                    'file_path': 'awesome-claude-skills-main/README.md',
                    'content_loaded_at': datetime.now().isoformat()
                }).eq('name', skill_data['name']).execute()
                
                if result.data:
                    loaded += 1
                    print(f"✅ {skill_data['name']}")
                else:
                    # Try by slug
                    result = self.supabase.table('skills').update({
                        'full_content': skill_data['full_content'],
                        'content_format': 'markdown',
                        'content_source': 'awesome-claude',
                        'file_path': 'awesome-claude-skills-main/README.md',
                        'content_loaded_at': datetime.now().isoformat()
                    }).eq('slug', skill_data['slug']).execute()
                    
                    if result.data:
                        loaded += 1
                        print(f"✅ {skill_data['name']} (via slug)")
                    else:
                        failed.append(skill_data['name'])
                        print(f"⚠️  {skill_data['name']} - not found")
                    
            except Exception as e:
                failed.append(f"{skill_data['name']} - {str(e)[:50]}")
                print(f"❌ {skill_data['name']}: {str(e)[:80]}")
        
        print()
        print(f"✅ Loaded {loaded}/{len(skills_data)} Awesome Claude skills")
        
        if failed:
            print(f"\n⚠️  Failed: {len(failed)} skills")
            for f in failed[:5]:
                print(f"   • {f}")
        
        print()
        return loaded
    
    def _parse_awesome_claude_readme(self, readme: str) -> List[Dict]:
        """Parse Awesome Claude README to extract skill data"""
        skills = []
        
        # Pattern: - [name](url) - description
        pattern = r'- \[([^\]]+)\]\([^\)]+\) - (.+?)(?:\n|$)'
        matches = re.findall(pattern, readme, re.MULTILINE)
        
        for name, description in matches:
            slug = name.lower().replace(' ', '-').replace('&', 'and')
            slug = re.sub(r'[^a-z0-9-]', '', slug)
            
            skills.append({
                'name': name,
                'slug': slug,
                'full_content': f"# {name}\n\n{description}\n\n## Description\n\n{description}"
            })
        
        return skills
    
    def verify_loading(self):
        """Verify all skills have content loaded"""
        print("=" * 80)
        print("VERIFICATION")
        print("=" * 80)
        print()
        
        # Get all skills
        result = self.supabase.table('skills').select(
            'name, slug, full_content, content_source, content_loaded_at'
        ).execute()
        
        total = len(result.data)
        with_content = sum(1 for s in result.data if s.get('full_content'))
        without_content = total - with_content
        
        print(f"Total skills: {total}")
        print(f"✅ With full content: {with_content} ({with_content/total*100:.1f}%)")
        print(f"❌ Without content: {without_content}")
        
        # Content statistics
        if with_content > 0:
            lengths = [len(s['full_content']) for s in result.data if s.get('full_content')]
            avg_length = sum(lengths) / len(lengths)
            min_length = min(lengths)
            max_length = max(lengths)
            
            print(f"\n📊 Content Statistics:")
            print(f"   • Average: {avg_length:.0f} characters")
            print(f"   • Min: {min_length:,} characters")
            print(f"   • Max: {max_length:,} characters")
        
        # By source
        vital = sum(1 for s in result.data if s.get('content_source') == 'vital-command-center')
        awesome = sum(1 for s in result.data if s.get('content_source') == 'awesome-claude')
        
        print(f"\n📁 By Source:")
        print(f"   • VITAL Command Center: {vital}")
        print(f"   • Awesome Claude: {awesome}")
        
        # Show skills without content
        if without_content > 0:
            print(f"\n⚠️  Skills without content:")
            for skill in result.data:
                if not skill.get('full_content'):
                    print(f"   • {skill['name']} ({skill['slug']})")
        
        print()
    
    def run(self):
        """Main execution"""
        print()
        print("╔" + "=" * 78 + "╗")
        print("║" + " " * 20 + "SKILLS FULL CONTENT LOADER" + " " * 32 + "║")
        print("╚" + "=" * 78 + "╝")
        print()
        
        # Load VITAL skills
        vital_loaded = self.load_vital_skills_content()
        
        # Load Awesome Claude skills
        awesome_loaded = self.load_awesome_claude_skills_content()
        
        # Verify
        self.verify_loading()
        
        print("╔" + "=" * 78 + "╗")
        print("║" + " " * 28 + "LOADING COMPLETE! ✅" + " " * 31 + "║")
        print("║" + f"  VITAL: {vital_loaded} | Awesome Claude: {awesome_loaded} | Total: {vital_loaded + awesome_loaded}".center(78) + "║")
        print("╚" + "=" * 78 + "╝")
        print()


def main():
    # Check environment
    required_vars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        sys.exit(1)
    
    loader = SkillsContentLoader()
    loader.run()
    
    return 0


if __name__ == '__main__':
    sys.exit(main())

