#!/usr/bin/env python3
"""
Parse Awesome Claude Skills from README.md
Extracts all skills with their categories, descriptions, and GitHub URLs
"""

import json
import re
from pathlib import Path
from typing import List, Dict, Any

# Awesome Claude Skills README content
SKILLS_DATA = """
## 📄 Document Skills  
- [docx](https://github.com/anthropics/skills/tree/main/document-skills/docx) - Create, edit, analyze Word docs with tracked changes, comments, formatting.  
- [pdf](https://github.com/anthropics/skills/tree/main/document-skills/pdf) - Extract text, tables, metadata, merge & annotate PDFs.  
- [pptx](https://github.com/anthropics/skills/tree/main/document-skills/pptx) - Read, generate, and adjust slides, layouts, templates.  
- [xlsx](https://github.com/anthropics/skills/tree/main/document-skills/xlsx) - Spreadsheet manipulation: formulas, charts, data transformations.  

## 🛠 Development & Code Tools
- [artifacts-builder](https://github.com/anthropics/skills/tree/main/artifacts-builder) - Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui).
- [test-driven-development](https://github.com/obra/superpowers/tree/main/skills/test-driven-development) - Use when implementing any feature or bugfix, before writing implementation code
- [using-git-worktrees](https://github.com/obra/superpowers/blob/main/skills/using-git-worktrees/) - Creates isolated git worktrees with smart directory selection and safety verification.
- [finishing-a-development-branch](https://github.com/obra/superpowers/tree/main/skills/finishing-a-development-branch) - Guides completion of development work by presenting clear options and handling chosen workflow.
- [pypict-claude-skill](https://github.com/omkamal/pypict-claude-skill) - Design comprehensive test cases using PICT (Pairwise Independent Combinatorial Testing) for requirements or code, generating optimized test suites with pairwise coverage.
- [aws-skills](https://github.com/zxkane/aws-skills) - AWS development with CDK best practices, cost optimization MCP servers, and serverless/event-driven architecture patterns.
- [move-code-quality-skill](https://github.com/1NickPappas/move-code-quality-skill) - Analyzes Move language packages against the official Move Book Code Quality Checklist for Move 2024 Edition compliance and best practices.
- [claude-code-terminal-title](https://github.com/bluzername/claude-code-terminal-title) - Gives each Claud Code terminal window a dynamic title that describes the work being done so you don't lose track of what terminal window is doing what.

## 📊 Data & Analysis  
- [root-cause-tracing](https://github.com/obra/superpowers/tree/main/skills/root-cause-tracing) - Use when errors occur deep in execution and you need to trace back to find the original trigger 
- [csv-data-summarizer-claude-skill](https://github.com/coffeefuelbump/csv-data-summarizer-claude-skill) - Automatically analyzes CSVs: columns, distributions, missing data, correlations.

## 🔬 Scientific & Research Tools
- [scientific-databases](https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-databases) - Access to 26 scientific databases including PubMed, PubChem, UniProt, ChEMBL, and AlphaFold DB.
- [scientific-integrations](https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-integrations) - Platform integrations for lab automation and workflow management (Benchling, DNAnexus, Opentrons, and more).
- [scientific-packages](https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-packages) - 58 specialized Python packages for bioinformatics, cheminformatics, machine learning, and data analysis.
- [scientific-thinking](https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-thinking) - Analysis tools and document processing for scientific writing, visualization, and methodology.

## ✍️ Writing & Research  
- [article-extractor](https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/article-extractor) - Extract full article text and metadata from web pages.
- [content-research-writer](https://github.com/ComposioHQ/awesome-claude-skills/tree/master/content-research-writer) - Assists in writing high-quality content by conducting research, adding citations, improving hooks, iterating on outlines, and providing real-time feedback on each section
- [internal-comms](https://github.com/anthropics/skills/tree/main/internal-comms) - Create internal communications	(status reports, leadership updates, etc)
- [brainstorming](https://github.com/obra/superpowers/tree/main/skills/brainstorming) - Transform rough ideas into fully-formed designs through structured questioning and alternative exploration.
- [family-history-research](https://github.com/emaynard/claude-family-history-research-skill) - Provides assistance with planning family history and genealogy research projects.

## 📘 Learning & Knowledge  
- [tapestry](https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/tapestry) - Interlink and summarize related documents into knowledge networks.  
- [ship-learn-next](https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/ship-learn-next) - Skill to help iterate on what to build or learn next, based on feedback loops.

## 🎬 Media & Content  
- [youtube-transcript](https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/youtube-transcript) - Fetch transcripts from YouTube videos and prepare summaries.  
- [video-downloader](https://github.com/ComposioHQ/awesome-claude-skills/tree/master/video-downloader) - Downloads videos from YouTube and other platforms for offline viewing, editing, or archival.
- [image-enhancer](https://github.com/ComposioHQ/awesome-claude-skills/tree/master/image-enhancer) - Improves the quality of images, especially screenshots.
- [claude-epub-skill](https://github.com/smerchek/claude-epub-skill) - Parse and analyze EPUB ebook contents for querying or summarizing.

## 🤝 Collaboration & Project Management  
- [git-pushing](https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/git-pushing) - Automate git operations and repository interactions.  
- [review-implementing](https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/review-implementing) - Evaluate code implementation plans and align with specs.  
- [test-fixing](https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/test-fixing) - Detect failing tests and propose patches or fixes.
- [meeting-insights-analyzer](https://github.com/ComposioHQ/awesome-claude-skills/blob/master/meeting-insights-analyzer/) - Transforms your meeting transcripts into actionable insights about your communication patterns
- [linear-cli-skill](https://github.com/Valian/linear-cli-skill) - A skill teaching claude how to use linear-CLI (provided alongside the skill), meant to replace linear MCP.

## 🛡 Security & Web Testing  
- [ffuf_claude_skill](https://github.com/jthack/ffuf_claude_skill) - Integrate Claude with FFUF (fuzzing) and analyze results for vulnerabilities.
- [defense-in-depth](https://github.com/obra/superpowers/blob/main/skills/defense-in-depth) - Implement multi-layered testing and security best practices.
- [webapp-testing](https://github.com/anthropics/skills/tree/main/webapp-testing) - Toolkit for interacting with and testing local web applications using Playwright.
- [systematic-debugging](https://github.com/obra/superpowers/blob/main/skills/systematic-debugging) - Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes

## 🔧 Utility & Automation  
- [file-organizer](https://github.com/ComposioHQ/awesome-claude-skills/tree/master/file-organizer) - Intelligently organizes your files and folders across your computer.
- [invoice-organizer](https://github.com/ComposioHQ/awesome-claude-skills/blob/master/invoice-organizer/SKILL.md) - Automatically organizes invoices and receipts for tax preparation
- [skill-creator](https://github.com/anthropics/skills/tree/main/skill-creator) - Template / helper to build new Claude skills.  
- [template-skill](https://github.com/anthropics/skills/tree/main/template-skill) - Minimal skeleton for a new skill project structure.  
"""

# Parse the data
skills = []
current_category = None

for line in SKILLS_DATA.split('\n'):
    line = line.strip()
    
    # Detect category headers
    if line.startswith('##'):
        current_category = re.sub(r'^##\s+[📄🛠📊🔬✍️📘🎬🤝🛡🔧]\s+', '', line).strip()
        continue
    
    # Parse skill entries
    match = re.match(r'^-\s+\[([^\]]+)\]\(([^\)]+)\)\s+-\s+(.+)$', line)
    if match and current_category:
        skill_name = match.group(1)
        github_url = match.group(2)
        description = match.group(3).strip()
        
        # Clean up skill name (convert slug to title)
        display_name = skill_name.replace('-', ' ').title()
        
        skills.append({
            'name': display_name,
            'slug': skill_name,
            'description': description,
            'category': current_category,
            'github_url': github_url,
            'implementation_type': 'tool',  # Most are tool-based
            'source': 'awesome-claude-skills'
        })
        
        print(f"✓ {display_name} ({current_category})")

# Generate SQL seed file
output_dir = Path("database/data/skills")
output_dir.mkdir(parents=True, exist_ok=True)

# Export to JSON
json_file = output_dir / "awesome_claude_skills.json"
with open(json_file, 'w', encoding='utf-8') as f:
    json.dump(skills, f, indent=2, ensure_ascii=False)

# Generate SQL seed script
sql_file = output_dir / "seed_awesome_claude_skills.sql"
with open(sql_file, 'w', encoding='utf-8') as f:
    f.write("""-- Seed Awesome Claude Skills
-- Source: https://github.com/anthropics/awesome-claude-skills
-- Generated by: parse_awesome_claude_skills.py

""")
    
    for skill in skills:
        # Escape single quotes for SQL
        name = skill['name'].replace("'", "''")
        desc = skill['description'].replace("'", "''")
        category = skill['category'].replace("'", "''")
        github_url = skill['github_url'].replace("'", "''")
        slug = skill['slug'].replace("'", "''")
        
        f.write(f"""
-- {name}
INSERT INTO skills (
    name, 
    description, 
    implementation_type, 
    implementation_ref, 
    category,
    complexity_level,
    is_active,
    metadata
) VALUES (
    '{name}',
    '{desc}',
    'tool',
    '{github_url}',
    '{category}',
    5,
    true,
    '{{"source": "awesome-claude-skills", "slug": "{slug}", "github_url": "{github_url}"}}'::jsonb
) ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    implementation_ref = EXCLUDED.implementation_ref,
    metadata = EXCLUDED.metadata;
""")

print(f"\n✅ Parsed {len(skills)} skills from Awesome Claude Skills")
print(f"   JSON Output: {json_file}")
print(f"   SQL Output: {sql_file}")
print(f"\n📊 Skills by Category:")

# Count by category
from collections import Counter
category_counts = Counter(skill['category'] for skill in skills)
for category, count in sorted(category_counts.items(), key=lambda x: -x[1]):
    print(f"   {category}: {count} skills")

