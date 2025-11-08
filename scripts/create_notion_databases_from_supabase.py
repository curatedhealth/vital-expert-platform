#!/usr/bin/env python3
"""
Supabase to Notion Database Creator
Creates or updates Notion databases to match the Supabase schema
"""

import os
import json
import logging
from typing import Dict, List, Any
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
NOTION_TOKEN = os.getenv('NOTION_TOKEN')
NOTION_VERSION = '2022-06-28'
PARENT_PAGE_ID = os.getenv('NOTION_PARENT_PAGE_ID')  # Parent page for all databases

class NotionDatabaseCreator:
    """Create Notion databases from Supabase schema"""
    
    def __init__(self):
        """Initialize the creator"""
        if not NOTION_TOKEN:
            raise ValueError("NOTION_TOKEN not found in environment variables")
        
        self.notion_headers = {
            'Authorization': f'Bearer {NOTION_TOKEN}',
            'Notion-Version': NOTION_VERSION,
            'Content-Type': 'application/json'
        }
        self.created_databases: Dict[str, str] = {}
    
    def create_database(self, name: str, properties: Dict[str, Any], description: str = "") -> str:
        """Create a Notion database with specified properties"""
        url = 'https://api.notion.com/v1/databases'
        
        payload = {
            'parent': {
                'type': 'page_id',
                'page_id': PARENT_PAGE_ID
            } if PARENT_PAGE_ID else {
                'type': 'workspace',
                'workspace': True
            },
            'title': [
                {
                    'type': 'text',
                    'text': {'content': name}
                }
            ],
            'properties': properties
        }
        
        if description:
            payload['description'] = [
                {
                    'type': 'text',
                    'text': {'content': description}
                }
            ]
        
        response = requests.post(url, headers=self.notion_headers, json=payload)
        
        if response.status_code == 200:
            database_id = response.json()['id']
            logger.info(f"✓ Created database: {name} (ID: {database_id})")
            return database_id
        else:
            logger.error(f"✗ Failed to create database {name}: {response.text}")
            return None
    
    def create_agents_database(self):
        """Create Agents database matching Supabase schema"""
        properties = {
            'Name': {'title': {}},
            'Display Name': {'rich_text': {}},
            'Description': {'rich_text': {}},
            'Avatar': {'url': {}},
            'Color': {'select': {'options': [
                {'name': 'Blue', 'color': 'blue'},
                {'name': 'Green', 'color': 'green'},
                {'name': 'Purple', 'color': 'purple'},
                {'name': 'Red', 'color': 'red'},
                {'name': 'Orange', 'color': 'orange'},
                {'name': 'Yellow', 'color': 'yellow'},
                {'name': 'Gray', 'color': 'gray'},
                {'name': 'Pink', 'color': 'pink'}
            ]}},
            'System Prompt': {'rich_text': {}},
            'Model': {'select': {'options': [
                {'name': 'gpt-4', 'color': 'blue'},
                {'name': 'gpt-4-turbo', 'color': 'purple'},
                {'name': 'gpt-3.5-turbo', 'color': 'green'},
                {'name': 'claude-3', 'color': 'orange'},
                {'name': 'claude-3-opus', 'color': 'red'}
            ]}},
            'Temperature': {'number': {'format': 'number'}},
            'Max Tokens': {'number': {}},
            'Context Window': {'number': {}},
            'Business Function': {'select': {'options': [
                {'name': 'Clinical Development', 'color': 'blue'},
                {'name': 'Regulatory Affairs', 'color': 'red'},
                {'name': 'Medical Affairs', 'color': 'green'},
                {'name': 'Market Access', 'color': 'orange'},
                {'name': 'Strategic', 'color': 'purple'}
            ]}},
            'Department': {'select': {'options': [
                {'name': 'R&D', 'color': 'blue'},
                {'name': 'Regulatory', 'color': 'red'},
                {'name': 'Medical', 'color': 'green'},
                {'name': 'Commercial', 'color': 'orange'},
                {'name': 'Operations', 'color': 'gray'}
            ]}},
            'Role': {'rich_text': {}},
            'Tier': {'select': {'options': [
                {'name': 'Tier 1', 'color': 'green'},
                {'name': 'Tier 2', 'color': 'yellow'},
                {'name': 'Tier 3', 'color': 'orange'}
            ]}},
            'Status': {'select': {'options': [
                {'name': 'Active', 'color': 'green'},
                {'name': 'Draft', 'color': 'yellow'},
                {'name': 'Inactive', 'color': 'gray'},
                {'name': 'Deprecated', 'color': 'red'}
            ]}},
            'Is Public': {'checkbox': {}},
            'Is Custom': {'checkbox': {}},
            'Is Active': {'checkbox': {}},
            'Capabilities': {'multi_select': {'options': []}},  # Will be populated dynamically
            'Created At': {'date': {}},
            'Updated At': {'date': {}}
        }
        
        db_id = self.create_database(
            '🤖 Agents',
            properties,
            'AI Agents with their configurations, models, and capabilities'
        )
        self.created_databases['agents'] = db_id
        return db_id
    
    def create_workflows_database(self):
        """Create Workflows database"""
        properties = {
            'Name': {'title': {}},
            'Description': {'rich_text': {}},
            'Status': {'select': {'options': [
                {'name': 'Active', 'color': 'green'},
                {'name': 'Draft', 'color': 'yellow'},
                {'name': 'Archived', 'color': 'gray'}
            ]}},
            'Is Public': {'checkbox': {}},
            'Definition': {'rich_text': {}},  # JSONB in Supabase
            'Agents': {'relation': {'database_id': self.created_databases.get('agents', ''), 'type': 'dual_property'}} if self.created_databases.get('agents') else {'multi_select': {}},
            'Created At': {'date': {}},
            'Updated At': {'date': {}}
        }
        
        db_id = self.create_database(
            '🔄 Workflows',
            properties,
            'Business workflows and automation processes'
        )
        self.created_databases['workflows'] = db_id
        return db_id
    
    def create_knowledge_domains_database(self):
        """Create Knowledge Domains database"""
        properties = {
            'Name': {'title': {}},
            'Slug': {'rich_text': {}},
            'Description': {'rich_text': {}},
            'Parent Domain': {'relation': {'database_id': '', 'type': 'dual_property'}},  # Self-reference
            'Is Active': {'checkbox': {}},
            'Level': {'select': {'options': [
                {'name': 'L1 - Category', 'color': 'blue'},
                {'name': 'L2 - Classification', 'color': 'green'},
                {'name': 'L3 - Subcategory', 'color': 'purple'}
            ]}},
            'Created At': {'date': {}},
            'Updated At': {'date': {}}
        }
        
        db_id = self.create_database(
            '📚 Knowledge Domains',
            properties,
            'Hierarchical knowledge domain taxonomy'
        )
        self.created_databases['knowledge_domains'] = db_id
        return db_id
    
    def create_knowledge_documents_database(self):
        """Create Knowledge Documents database"""
        properties = {
            'Title': {'title': {}},
            'Content': {'rich_text': {}},
            'Summary': {'rich_text': {}},
            'Domain': {'relation': {'database_id': self.created_databases.get('knowledge_domains', ''), 'type': 'dual_property'}} if self.created_databases.get('knowledge_domains') else {'select': {}},
            'Document Type': {'select': {'options': [
                {'name': 'Text', 'color': 'blue'},
                {'name': 'PDF', 'color': 'red'},
                {'name': 'Image', 'color': 'green'},
                {'name': 'URL', 'color': 'purple'}
            ]}},
            'File URL': {'url': {}},
            'File Size': {'number': {}},
            'MIME Type': {'rich_text': {}},
            'Is Public': {'checkbox': {}},
            'Status': {'select': {'options': [
                {'name': 'Active', 'color': 'green'},
                {'name': 'Processing', 'color': 'yellow'},
                {'name': 'Archived', 'color': 'gray'}
            ]}},
            'Created At': {'date': {}},
            'Updated At': {'date': {}}
        }
        
        db_id = self.create_database(
            '📄 Knowledge Documents',
            properties,
            'Documents and files for RAG system'
        )
        self.created_databases['knowledge_documents'] = db_id
        return db_id
    
    def create_chat_sessions_database(self):
        """Create Chat Sessions database"""
        properties = {
            'Title': {'title': {}},
            'Agent': {'relation': {'database_id': self.created_databases.get('agents', ''), 'type': 'dual_property'}} if self.created_databases.get('agents') else {'select': {}},
            'Status': {'select': {'options': [
                {'name': 'Active', 'color': 'green'},
                {'name': 'Completed', 'color': 'blue'},
                {'name': 'Archived', 'color': 'gray'}
            ]}},
            'Message Count': {'number': {}},
            'Created At': {'date': {}},
            'Updated At': {'date': {}}
        }
        
        db_id = self.create_database(
            '💬 Chat Sessions',
            properties,
            'User chat sessions with AI agents'
        )
        self.created_databases['chat_sessions'] = db_id
        return db_id
    
    def create_organizations_database(self):
        """Create Organizations database"""
        properties = {
            'Name': {'title': {}},
            'Domain': {'url': {}},
            'Industry': {'select': {'options': [
                {'name': 'Pharmaceuticals', 'color': 'blue'},
                {'name': 'Biotechnology', 'color': 'green'},
                {'name': 'Medical Devices', 'color': 'purple'},
                {'name': 'Healthcare Services', 'color': 'orange'},
                {'name': 'Digital Health', 'color': 'red'}
            ]}},
            'Size': {'select': {'options': [
                {'name': 'Startup', 'color': 'green'},
                {'name': 'SME', 'color': 'yellow'},
                {'name': 'Enterprise', 'color': 'blue'},
                {'name': 'Large Enterprise', 'color': 'purple'}
            ]}},
            'Country': {'select': {'options': []}},  # Will be populated dynamically
            'Created At': {'date': {}},
            'Updated At': {'date': {}}
        }
        
        db_id = self.create_database(
            '🏢 Organizations',
            properties,
            'Organizations using the VITAL platform'
        )
        self.created_databases['organizations'] = db_id
        return db_id
    
    def create_llm_providers_database(self):
        """Create LLM Providers database"""
        properties = {
            'Name': {'title': {}},
            'Provider Type': {'select': {'options': [
                {'name': 'OpenAI', 'color': 'green'},
                {'name': 'Anthropic', 'color': 'orange'},
                {'name': 'Google', 'color': 'blue'},
                {'name': 'Azure', 'color': 'purple'},
                {'name': 'Custom', 'color': 'gray'}
            ]}},
            'Base URL': {'url': {}},
            'Is Active': {'checkbox': {}},
            'Models': {'multi_select': {}},
            'Created At': {'date': {}},
            'Updated At': {'date': {}}
        }
        
        db_id = self.create_database(
            '🔌 LLM Providers',
            properties,
            'LLM provider configurations and API settings'
        )
        self.created_databases['llm_providers'] = db_id
        return db_id
    
    def create_llm_models_database(self):
        """Create LLM Models database"""
        properties = {
            'Name': {'title': {}},
            'Display Name': {'rich_text': {}},
            'Description': {'rich_text': {}},
            'Provider': {'relation': {'database_id': self.created_databases.get('llm_providers', ''), 'type': 'dual_property'}} if self.created_databases.get('llm_providers') else {'select': {}},
            'Context Window': {'number': {}},
            'Max Tokens': {'number': {}},
            'Input Cost per 1K': {'number': {'format': 'dollar'}},
            'Output Cost per 1K': {'number': {'format': 'dollar'}},
            'Is Active': {'checkbox': {}},
            'Created At': {'date': {}},
            'Updated At': {'date': {}}
        }
        
        db_id = self.create_database(
            '🧠 LLM Models',
            properties,
            'Available LLM models and their specifications'
        )
        self.created_databases['llm_models'] = db_id
        return db_id
    
    def create_capabilities_database(self):
        """Create Capabilities database"""
        properties = {
            'Name': {'title': {}},
            'Description': {'rich_text': {}},
            'Category': {'select': {'options': [
                {'name': 'Clinical', 'color': 'blue'},
                {'name': 'Regulatory', 'color': 'red'},
                {'name': 'Technical', 'color': 'gray'},
                {'name': 'Business', 'color': 'green'},
                {'name': 'Strategic', 'color': 'purple'}
            ]}},
            'Proficiency Level': {'select': {'options': [
                {'name': 'Basic', 'color': 'gray'},
                {'name': 'Intermediate', 'color': 'yellow'},
                {'name': 'Advanced', 'color': 'orange'},
                {'name': 'Expert', 'color': 'red'}
            ]}},
            'Agents': {'relation': {'database_id': self.created_databases.get('agents', ''), 'type': 'dual_property'}} if self.created_databases.get('agents') else {'multi_select': {}},
            'Created At': {'date': {}}
        }
        
        db_id = self.create_database(
            '⚡ Capabilities',
            properties,
            'Agent capabilities and skills matrix'
        )
        self.created_databases['capabilities'] = db_id
        return db_id
    
    def create_use_cases_database(self):
        """Create Use Cases / Jobs to Be Done database"""
        properties = {
            'Name': {'title': {}},
            'Description': {'rich_text': {}},
            'Category': {'select': {'options': [
                {'name': 'Clinical Development', 'color': 'blue'},
                {'name': 'Regulatory Affairs', 'color': 'red'},
                {'name': 'Medical Affairs', 'color': 'green'},
                {'name': 'Market Access', 'color': 'orange'},
                {'name': 'Strategic Planning', 'color': 'purple'}
            ]}},
            'Priority': {'select': {'options': [
                {'name': 'Critical', 'color': 'red'},
                {'name': 'High', 'color': 'orange'},
                {'name': 'Medium', 'color': 'yellow'},
                {'name': 'Low', 'color': 'blue'}
            ]}},
            'Status': {'select': {'options': [
                {'name': 'Active', 'color': 'green'},
                {'name': 'Draft', 'color': 'yellow'},
                {'name': 'Completed', 'color': 'blue'},
                {'name': 'Archived', 'color': 'gray'}
            ]}},
            'Agents': {'relation': {'database_id': self.created_databases.get('agents', ''), 'type': 'dual_property'}} if self.created_databases.get('agents') else {'multi_select': {}},
            'Workflows': {'relation': {'database_id': self.created_databases.get('workflows', ''), 'type': 'dual_property'}} if self.created_databases.get('workflows') else {'multi_select': {}},
            'Created At': {'date': {}}
        }
        
        db_id = self.create_database(
            '🎯 Use Cases',
            properties,
            'Jobs to be done and use case scenarios'
        )
        self.created_databases['use_cases'] = db_id
        return db_id
    
    def create_tools_database(self):
        """Create Tools database"""
        properties = {
            'Name': {'title': {}},
            'Description': {'rich_text': {}},
            'Tool Type': {'select': {'options': [
                {'name': 'API', 'color': 'blue'},
                {'name': 'Function', 'color': 'green'},
                {'name': 'Integration', 'color': 'purple'},
                {'name': 'MCP', 'color': 'orange'},
                {'name': 'Custom', 'color': 'gray'}
            ]}},
            'Configuration': {'rich_text': {}},
            'Is Active': {'checkbox': {}},
            'Workflows': {'relation': {'database_id': self.created_databases.get('workflows', ''), 'type': 'dual_property'}} if self.created_databases.get('workflows') else {'multi_select': {}},
            'Agents': {'relation': {'database_id': self.created_databases.get('agents', ''), 'type': 'dual_property'}} if self.created_databases.get('agents') else {'multi_select': {}},
            'Created At': {'date': {}}
        }
        
        db_id = self.create_database(
            '🛠️ Tools',
            properties,
            'External tools and integrations available to agents'
        )
        self.created_databases['tools'] = db_id
        return db_id
    
    def create_prompts_database(self):
        """Create Prompts database"""
        properties = {
            'Name': {'title': {}},
            'Content': {'rich_text': {}},
            'Category': {'select': {'options': [
                {'name': 'System', 'color': 'blue'},
                {'name': 'User', 'color': 'green'},
                {'name': 'Assistant', 'color': 'purple'},
                {'name': 'Function', 'color': 'orange'}
            ]}},
            'Is Active': {'checkbox': {}},
            'Agent': {'relation': {'database_id': self.created_databases.get('agents', ''), 'type': 'dual_property'}} if self.created_databases.get('agents') else {'select': {}},
            'Use Cases': {'relation': {'database_id': self.created_databases.get('use_cases', ''), 'type': 'dual_property'}} if self.created_databases.get('use_cases') else {'multi_select': {}},
            'Version': {'rich_text': {}},
            'Created At': {'date': {}}
        }
        
        db_id = self.create_database(
            '📝 Prompts',
            properties,
            'AI prompts and templates library'
        )
        self.created_databases['prompts'] = db_id
        return db_id
    
    def create_personas_database(self):
        """Create Personas / Roles database"""
        properties = {
            'Name': {'title': {}},
            'Description': {'rich_text': {}},
            'Role Type': {'select': {'options': [
                {'name': 'Clinical', 'color': 'blue'},
                {'name': 'Regulatory', 'color': 'red'},
                {'name': 'Medical', 'color': 'green'},
                {'name': 'Commercial', 'color': 'orange'},
                {'name': 'Technical', 'color': 'gray'}
            ]}},
            'Seniority Level': {'select': {'options': [
                {'name': 'Junior', 'color': 'gray'},
                {'name': 'Mid', 'color': 'yellow'},
                {'name': 'Senior', 'color': 'orange'},
                {'name': 'Lead', 'color': 'red'},
                {'name': 'Director', 'color': 'purple'}
            ]}},
            'Is Active': {'checkbox': {}},
            'Related Agents': {'relation': {'database_id': self.created_databases.get('agents', ''), 'type': 'dual_property'}} if self.created_databases.get('agents') else {'multi_select': {}},
            'Created At': {'date': {}}
        }
        
        db_id = self.create_database(
            '👤 Personas',
            properties,
            'User personas and organizational roles'
        )
        self.created_databases['personas'] = db_id
        return db_id
    
    def create_all_databases(self):
        """Create all databases in correct order (dependencies first)"""
        logger.info("🚀 Starting Notion database creation from Supabase schema...")
        logger.info("="*70)
        
        # Create independent databases first
        self.create_organizations_database()
        self.create_llm_providers_database()
        self.create_knowledge_domains_database()
        
        # Create databases with first-level dependencies
        self.create_agents_database()
        self.create_llm_models_database()
        self.create_knowledge_documents_database()
        self.create_capabilities_database()
        
        # Create databases with second-level dependencies
        self.create_workflows_database()
        self.create_chat_sessions_database()
        self.create_use_cases_database()
        self.create_tools_database()
        self.create_prompts_database()
        self.create_personas_database()
        
        logger.info("="*70)
        logger.info("✅ All databases created successfully!")
        self._print_summary()
    
    def _print_summary(self):
        """Print summary of created databases"""
        logger.info("\n" + "="*70)
        logger.info("DATABASES CREATED")
        logger.info("="*70)
        
        for name, db_id in self.created_databases.items():
            if db_id:
                url = f"https://www.notion.so/{db_id.replace('-', '')}"
                logger.info(f"  {name.replace('_', ' ').title()}")
                logger.info(f"    ID: {db_id}")
                logger.info(f"    URL: {url}")
                logger.info("")
        
        logger.info(f"Total Databases: {len(self.created_databases)}")
        logger.info("="*70 + "\n")
        
        # Save database IDs to file
        with open('notion_database_ids.json', 'w') as f:
            json.dump(self.created_databases, f, indent=2)
        logger.info("✓ Database IDs saved to notion_database_ids.json")


def main():
    """Main entry point"""
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║   VITAL Expert - Supabase to Notion Database Creator        ║
    ║   Creates Notion databases matching your Supabase schema    ║
    ╚══════════════════════════════════════════════════════════════╝
    """)
    
    if not NOTION_TOKEN:
        print("\n❌ Error: NOTION_TOKEN not set in environment")
        print("Please add it to your .env file\n")
        exit(1)
    
    if not PARENT_PAGE_ID:
        print("\n⚠️  Warning: NOTION_PARENT_PAGE_ID not set")
        print("Databases will be created at workspace level")
        print("Set NOTION_PARENT_PAGE_ID to organize them under a page\n")
    
    try:
        creator = NotionDatabaseCreator()
        creator.create_all_databases()
        
        print("\n✅ All databases created successfully!")
        print("📄 Database IDs saved to notion_database_ids.json")
        print("\nNext Steps:")
        print("1. Review the created databases in Notion")
        print("2. Add any additional properties as needed")
        print("3. Populate with initial data")
        print("4. Run the sync script to sync data from Supabase\n")
        
    except Exception as e:
        print(f"\n❌ Database creation failed: {str(e)}")
        logger.exception("Error during database creation")
        exit(1)


if __name__ == "__main__":
    main()

