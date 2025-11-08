#!/usr/bin/env python3
"""
Supabase to Notion Bidirectional Sync
Syncs data between Supabase and Notion in both directions
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv
import requests
from supabase import create_client, Client

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
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_KEY')

# Load Notion database IDs
try:
    with open('notion_database_ids.json', 'r') as f:
        NOTION_DB_IDS = json.load(f)
except FileNotFoundError:
    logger.warning("notion_database_ids.json not found. Using empty dict.")
    NOTION_DB_IDS = {}


class SupabaseNotionBiSync:
    """Bidirectional sync between Supabase and Notion"""
    
    def __init__(self):
        """Initialize the sync client"""
        if not NOTION_TOKEN:
            raise ValueError("NOTION_TOKEN not found in environment variables")
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError("Supabase credentials not found in environment variables")
        
        self.notion_headers = {
            'Authorization': f'Bearer {NOTION_TOKEN}',
            'Notion-Version': NOTION_VERSION,
            'Content-Type': 'application/json'
        }
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.id_mapping: Dict[str, Dict[str, str]] = {}  # Map between systems
    
    # ========================================
    # SUPABASE → NOTION (POPULATE NOTION)
    # ========================================
    
    def sync_agents_to_notion(self):
        """Sync agents from Supabase to Notion"""
        logger.info("=== Syncing Agents: Supabase → Notion ===")
        
        if 'agents' not in NOTION_DB_IDS:
            logger.error("Agents database ID not found in notion_database_ids.json")
            return
        
        # Fetch from Supabase
        result = self.supabase.table('agents').select('*').execute()
        agents = result.data
        
        logger.info(f"Found {len(agents)} agents in Supabase")
        
        for agent in agents:
            notion_data = self._convert_agent_to_notion(agent)
            self._create_or_update_notion_page(NOTION_DB_IDS['agents'], notion_data, agent['id'])
            logger.info(f"✓ Synced agent: {agent['name']}")
    
    def sync_workflows_to_notion(self):
        """Sync workflows from Supabase to Notion"""
        logger.info("=== Syncing Workflows: Supabase → Notion ===")
        
        if 'workflows' not in NOTION_DB_IDS:
            logger.error("Workflows database ID not found")
            return
        
        result = self.supabase.table('workflows').select('*').execute()
        workflows = result.data
        
        logger.info(f"Found {len(workflows)} workflows in Supabase")
        
        for workflow in workflows:
            notion_data = self._convert_workflow_to_notion(workflow)
            self._create_or_update_notion_page(NOTION_DB_IDS['workflows'], notion_data, workflow['id'])
            logger.info(f"✓ Synced workflow: {workflow['name']}")
    
    def sync_capabilities_to_notion(self):
        """Sync capabilities from Supabase to Notion"""
        logger.info("=== Syncing Capabilities: Supabase → Notion ===")
        
        if 'capabilities' not in NOTION_DB_IDS:
            logger.error("Capabilities database ID not found")
            return
        
        result = self.supabase.table('agent_capabilities').select('*').execute()
        capabilities = result.data
        
        logger.info(f"Found {len(capabilities)} capabilities in Supabase")
        
        for capability in capabilities:
            notion_data = self._convert_capability_to_notion(capability)
            self._create_or_update_notion_page(NOTION_DB_IDS['capabilities'], notion_data, capability['id'])
            logger.info(f"✓ Synced capability: {capability.get('capability_name', 'Unknown')}")
    
    def sync_knowledge_domains_to_notion(self):
        """Sync knowledge domains from Supabase to Notion"""
        logger.info("=== Syncing Knowledge Domains: Supabase → Notion ===")
        
        if 'knowledge_domains' not in NOTION_DB_IDS:
            logger.error("Knowledge Domains database ID not found")
            return
        
        result = self.supabase.table('knowledge_domains').select('*').execute()
        domains = result.data
        
        logger.info(f"Found {len(domains)} domains in Supabase")
        
        for domain in domains:
            notion_data = self._convert_domain_to_notion(domain)
            self._create_or_update_notion_page(NOTION_DB_IDS['knowledge_domains'], notion_data, domain['id'])
            logger.info(f"✓ Synced domain: {domain['name']}")
    
    def sync_knowledge_documents_to_notion(self):
        """Sync knowledge documents from Supabase to Notion"""
        logger.info("=== Syncing Knowledge Documents: Supabase → Notion ===")
        
        if 'knowledge_documents' not in NOTION_DB_IDS:
            logger.error("Knowledge Documents database ID not found")
            return
        
        result = self.supabase.table('knowledge_documents').select('*').execute()
        documents = result.data
        
        logger.info(f"Found {len(documents)} documents in Supabase")
        
        for doc in documents:
            notion_data = self._convert_document_to_notion(doc)
            self._create_or_update_notion_page(NOTION_DB_IDS['knowledge_documents'], notion_data, doc['id'])
            logger.info(f"✓ Synced document: {doc['title']}")
    
    def sync_organizations_to_notion(self):
        """Sync organizations from Supabase to Notion"""
        logger.info("=== Syncing Organizations: Supabase → Notion ===")
        
        if 'organizations' not in NOTION_DB_IDS:
            logger.error("Organizations database ID not found")
            return
        
        result = self.supabase.table('organizations').select('*').execute()
        orgs = result.data
        
        logger.info(f"Found {len(orgs)} organizations in Supabase")
        
        for org in orgs:
            notion_data = self._convert_organization_to_notion(org)
            self._create_or_update_notion_page(NOTION_DB_IDS['organizations'], notion_data, org['id'])
            logger.info(f"✓ Synced organization: {org['name']}")
    
    # ========================================
    # NOTION → SUPABASE (UPDATE SUPABASE)
    # ========================================
    
    def sync_agents_from_notion(self):
        """Sync agents from Notion to Supabase"""
        logger.info("=== Syncing Agents: Notion → Supabase ===")
        
        if 'agents' not in NOTION_DB_IDS:
            logger.error("Agents database ID not found")
            return
        
        pages = self._query_notion_database(NOTION_DB_IDS['agents'])
        logger.info(f"Found {len(pages)} agents in Notion")
        
        for page in pages:
            supabase_data = self._convert_notion_agent_to_supabase(page)
            
            # Upsert to Supabase
            result = self.supabase.table('agents').upsert(
                supabase_data,
                on_conflict='id'
            ).execute()
            
            if result.data:
                logger.info(f"✓ Updated agent: {supabase_data['name']}")
    
    def sync_workflows_from_notion(self):
        """Sync workflows from Notion to Supabase"""
        logger.info("=== Syncing Workflows: Notion → Supabase ===")
        
        if 'workflows' not in NOTION_DB_IDS:
            logger.error("Workflows database ID not found")
            return
        
        pages = self._query_notion_database(NOTION_DB_IDS['workflows'])
        logger.info(f"Found {len(pages)} workflows in Notion")
        
        for page in pages:
            supabase_data = self._convert_notion_workflow_to_supabase(page)
            
            result = self.supabase.table('workflows').upsert(
                supabase_data,
                on_conflict='id'
            ).execute()
            
            if result.data:
                logger.info(f"✓ Updated workflow: {supabase_data['name']}")
    
    # ========================================
    # CONVERSION HELPERS: SUPABASE → NOTION
    # ========================================
    
    def _convert_agent_to_notion(self, agent: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Supabase agent to Notion page properties"""
        return {
            'Name': {'title': [{'text': {'content': agent.get('name', 'Untitled')}}]},
            'Display Name': {'rich_text': [{'text': {'content': agent.get('display_name', '')}}]} if agent.get('display_name') else {'rich_text': []},
            'Description': {'rich_text': [{'text': {'content': agent.get('description', '')[:2000]}}]} if agent.get('description') else {'rich_text': []},
            'Avatar': {'url': agent.get('avatar')} if agent.get('avatar') else None,
            'Color': {'select': {'name': agent.get('color', 'Blue').title()}} if agent.get('color') else None,
            'System Prompt': {'rich_text': [{'text': {'content': agent.get('system_prompt', '')[:2000]}}]} if agent.get('system_prompt') else {'rich_text': []},
            'Model': {'select': {'name': agent.get('model', 'gpt-4')}} if agent.get('model') else None,
            'Temperature': {'number': float(agent.get('temperature', 0.7))} if agent.get('temperature') is not None else None,
            'Max Tokens': {'number': agent.get('max_tokens')} if agent.get('max_tokens') else None,
            'Context Window': {'number': agent.get('context_window')} if agent.get('context_window') else None,
            'Business Function': {'select': {'name': agent.get('business_function', 'General')}} if agent.get('business_function') else None,
            'Department': {'select': {'name': agent.get('department', 'General')}} if agent.get('department') else None,
            'Role': {'rich_text': [{'text': {'content': agent.get('role', '')}}]} if agent.get('role') else {'rich_text': []},
            'Tier': {'select': {'name': f"Tier {agent.get('tier', 3)}"}} if agent.get('tier') else None,
            'Status': {'select': {'name': agent.get('status', 'active').title()}} if agent.get('status') else None,
            'Is Public': {'checkbox': agent.get('is_public', True)},
            'Is Custom': {'checkbox': agent.get('is_custom', False)},
            'Is Active': {'checkbox': agent.get('status', 'active') == 'active'},
        }
    
    def _convert_workflow_to_notion(self, workflow: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Supabase workflow to Notion page properties"""
        return {
            'Name': {'title': [{'text': {'content': workflow.get('name', 'Untitled')}}]},
            'Description': {'rich_text': [{'text': {'content': workflow.get('description', '')[:2000]}}]} if workflow.get('description') else {'rich_text': []},
            'Status': {'select': {'name': workflow.get('status', 'draft').title()}} if workflow.get('status') else None,
            'Is Public': {'checkbox': workflow.get('is_public', False)},
            'Definition': {'rich_text': [{'text': {'content': json.dumps(workflow.get('definition', {}))[:2000]}}]} if workflow.get('definition') else {'rich_text': []},
        }
    
    def _convert_capability_to_notion(self, capability: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Supabase capability to Notion page properties"""
        return {
            'Name': {'title': [{'text': {'content': capability.get('capability_name', 'Untitled')}}]},
            'Description': {'rich_text': [{'text': {'content': capability.get('description', '')[:2000]}}]} if capability.get('description') else {'rich_text': []},
            'Category': {'select': {'name': 'Technical'}} if capability.get('capability_name') else None,
            'Proficiency Level': {'select': {'name': self._map_proficiency_level(capability.get('proficiency_level', 1))}} if capability.get('proficiency_level') else None,
        }
    
    def _convert_domain_to_notion(self, domain: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Supabase domain to Notion page properties"""
        return {
            'Name': {'title': [{'text': {'content': domain.get('name', 'Untitled')}}]},
            'Slug': {'rich_text': [{'text': {'content': domain.get('slug', '')}}]} if domain.get('slug') else {'rich_text': []},
            'Description': {'rich_text': [{'text': {'content': domain.get('description', '')[:2000]}}]} if domain.get('description') else {'rich_text': []},
            'Is Active': {'checkbox': domain.get('is_active', True)},
            'Level': {'select': {'name': 'L1 - Category'}} if domain.get('parent_id') is None else {'select': {'name': 'L2 - Classification'}},
        }
    
    def _convert_document_to_notion(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Supabase document to Notion page properties"""
        return {
            'Title': {'title': [{'text': {'content': doc.get('title', 'Untitled')}}]},
            'Content': {'rich_text': [{'text': {'content': (doc.get('content', '') or '')[:2000]}}]},
            'Summary': {'rich_text': [{'text': {'content': (doc.get('summary', '') or '')[:2000]}}]},
            'Document Type': {'select': {'name': doc.get('document_type', 'text').title()}} if doc.get('document_type') else None,
            'File URL': {'url': doc.get('file_url')} if doc.get('file_url') else None,
            'File Size': {'number': doc.get('file_size')} if doc.get('file_size') else None,
            'MIME Type': {'rich_text': [{'text': {'content': doc.get('mime_type', '')}}]} if doc.get('mime_type') else {'rich_text': []},
            'Is Public': {'checkbox': doc.get('is_public', False)},
            'Status': {'select': {'name': 'Active'}},
        }
    
    def _convert_organization_to_notion(self, org: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Supabase organization to Notion page properties"""
        return {
            'Name': {'title': [{'text': {'content': org.get('name', 'Untitled')}}]},
            'Domain': {'url': org.get('domain')} if org.get('domain') else None,
            'Industry': {'select': {'name': org.get('industry', 'Healthcare Services')}} if org.get('industry') else None,
            'Size': {'select': {'name': org.get('size', 'Enterprise')}} if org.get('size') else None,
            'Country': {'select': {'name': org.get('country', 'US')}} if org.get('country') else None,
        }
    
    # ========================================
    # CONVERSION HELPERS: NOTION → SUPABASE
    # ========================================
    
    def _convert_notion_agent_to_supabase(self, page: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Notion agent page to Supabase data"""
        props = page.get('properties', {})
        
        return {
            'id': self._get_supabase_id_from_notion_page(page),
            'name': self._extract_notion_title(props.get('Name', {})),
            'display_name': self._extract_notion_text(props.get('Display Name', {})),
            'description': self._extract_notion_text(props.get('Description', {})),
            'avatar': self._extract_notion_url(props.get('Avatar', {})),
            'color': self._extract_notion_select(props.get('Color', {})),
            'system_prompt': self._extract_notion_text(props.get('System Prompt', {})),
            'model': self._extract_notion_select(props.get('Model', {})),
            'temperature': self._extract_notion_number(props.get('Temperature', {})),
            'max_tokens': int(self._extract_notion_number(props.get('Max Tokens', {})) or 2000),
            'context_window': int(self._extract_notion_number(props.get('Context Window', {})) or 8000),
            'business_function': self._extract_notion_select(props.get('Business Function', {})),
            'department': self._extract_notion_select(props.get('Department', {})),
            'role': self._extract_notion_text(props.get('Role', {})),
            'tier': int(self._extract_notion_select(props.get('Tier', {})).replace('Tier ', '')) if self._extract_notion_select(props.get('Tier', {})) else 3,
            'status': self._extract_notion_select(props.get('Status', {})).lower() if self._extract_notion_select(props.get('Status', {})) else 'active',
            'is_public': self._extract_notion_checkbox(props.get('Is Public', {})),
            'is_custom': self._extract_notion_checkbox(props.get('Is Custom', {})),
            'updated_at': datetime.now().isoformat(),
        }
    
    def _convert_notion_workflow_to_supabase(self, page: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Notion workflow page to Supabase data"""
        props = page.get('properties', {})
        
        definition_str = self._extract_notion_text(props.get('Definition', {}))
        try:
            definition = json.loads(definition_str) if definition_str else {}
        except json.JSONDecodeError:
            definition = {}
        
        return {
            'id': self._get_supabase_id_from_notion_page(page),
            'name': self._extract_notion_title(props.get('Name', {})),
            'description': self._extract_notion_text(props.get('Description', {})),
            'status': self._extract_notion_select(props.get('Status', {})).lower() if self._extract_notion_select(props.get('Status', {})) else 'draft',
            'is_public': self._extract_notion_checkbox(props.get('Is Public', {})),
            'definition': definition,
            'updated_at': datetime.now().isoformat(),
        }
    
    # ========================================
    # HELPER METHODS
    # ========================================
    
    def _query_notion_database(self, database_id: str) -> List[Dict[str, Any]]:
        """Query all pages from a Notion database"""
        url = f'https://api.notion.com/v1/databases/{database_id}/query'
        all_results = []
        has_more = True
        start_cursor = None
        
        while has_more:
            payload = {}
            if start_cursor:
                payload['start_cursor'] = start_cursor
            
            response = requests.post(url, headers=self.notion_headers, json=payload)
            
            if response.status_code != 200:
                logger.error(f"Failed to query database: {response.text}")
                break
            
            data = response.json()
            all_results.extend(data.get('results', []))
            has_more = data.get('has_more', False)
            start_cursor = data.get('next_cursor')
        
        return all_results
    
    def _create_or_update_notion_page(self, database_id: str, properties: Dict[str, Any], supabase_id: str):
        """Create or update a Notion page"""
        # Clean None values
        properties = {k: v for k, v in properties.items() if v is not None}
        
        # Store Supabase ID in properties for future lookups
        properties['Supabase ID'] = {'rich_text': [{'text': {'content': supabase_id}}]}
        
        # Try to find existing page
        existing_page = self._find_notion_page_by_supabase_id(database_id, supabase_id)
        
        if existing_page:
            # Update existing page
            url = f"https://api.notion.com/v1/pages/{existing_page['id']}"
            response = requests.patch(url, headers=self.notion_headers, json={'properties': properties})
        else:
            # Create new page
            url = 'https://api.notion.com/v1/pages'
            payload = {
                'parent': {'database_id': database_id},
                'properties': properties
            }
            response = requests.post(url, headers=self.notion_headers, json=payload)
        
        if response.status_code not in [200, 201]:
            logger.error(f"Failed to create/update page: {response.text}")
    
    def _find_notion_page_by_supabase_id(self, database_id: str, supabase_id: str) -> Optional[Dict[str, Any]]:
        """Find a Notion page by its Supabase ID"""
        url = f'https://api.notion.com/v1/databases/{database_id}/query'
        
        payload = {
            'filter': {
                'property': 'Supabase ID',
                'rich_text': {
                    'equals': supabase_id
                }
            }
        }
        
        response = requests.post(url, headers=self.notion_headers, json=payload)
        
        if response.status_code == 200:
            results = response.json().get('results', [])
            return results[0] if results else None
        
        return None
    
    def _extract_notion_title(self, prop: Dict[str, Any]) -> str:
        """Extract title from Notion property"""
        return ''.join([t.get('plain_text', '') for t in prop.get('title', [])])
    
    def _extract_notion_text(self, prop: Dict[str, Any]) -> str:
        """Extract rich text from Notion property"""
        return ''.join([t.get('plain_text', '') for t in prop.get('rich_text', [])])
    
    def _extract_notion_select(self, prop: Dict[str, Any]) -> Optional[str]:
        """Extract select value from Notion property"""
        select = prop.get('select')
        return select.get('name') if select else None
    
    def _extract_notion_number(self, prop: Dict[str, Any]) -> Optional[float]:
        """Extract number from Notion property"""
        return prop.get('number')
    
    def _extract_notion_checkbox(self, prop: Dict[str, Any]) -> bool:
        """Extract checkbox from Notion property"""
        return prop.get('checkbox', False)
    
    def _extract_notion_url(self, prop: Dict[str, Any]) -> Optional[str]:
        """Extract URL from Notion property"""
        return prop.get('url')
    
    def _get_supabase_id_from_notion_page(self, page: Dict[str, Any]) -> str:
        """Get Supabase ID from Notion page (or generate new UUID)"""
        props = page.get('properties', {})
        supabase_id_prop = props.get('Supabase ID', {})
        supabase_id = self._extract_notion_text(supabase_id_prop)
        
        if supabase_id:
            return supabase_id
        else:
            # Generate new UUID for new records
            import uuid
            return str(uuid.uuid4())
    
    def _map_proficiency_level(self, level: int) -> str:
        """Map proficiency level number to name"""
        mapping = {
            1: 'Basic',
            2: 'Intermediate',
            3: 'Advanced',
            4: 'Expert'
        }
        return mapping.get(level, 'Intermediate')
    
    # ========================================
    # MAIN SYNC ORCHESTRATION
    # ========================================
    
    def sync_supabase_to_notion(self):
        """Sync all data from Supabase to Notion"""
        logger.info("🚀 Starting Supabase → Notion sync...")
        start_time = datetime.now()
        
        try:
            self.sync_organizations_to_notion()
            self.sync_knowledge_domains_to_notion()
            self.sync_knowledge_documents_to_notion()
            self.sync_agents_to_notion()
            self.sync_capabilities_to_notion()
            self.sync_workflows_to_notion()
            
            elapsed = datetime.now() - start_time
            logger.info(f"✅ Supabase → Notion sync completed in {elapsed.total_seconds():.2f}s")
            
        except Exception as e:
            logger.error(f"❌ Sync failed: {str(e)}", exc_info=True)
            raise
    
    def sync_notion_to_supabase(self):
        """Sync all data from Notion to Supabase"""
        logger.info("🚀 Starting Notion → Supabase sync...")
        start_time = datetime.now()
        
        try:
            self.sync_agents_from_notion()
            self.sync_workflows_from_notion()
            
            elapsed = datetime.now() - start_time
            logger.info(f"✅ Notion → Supabase sync completed in {elapsed.total_seconds():.2f}s")
            
        except Exception as e:
            logger.error(f"❌ Sync failed: {str(e)}", exc_info=True)
            raise


def main():
    """Main entry point"""
    import sys
    
    print("""
    ╔══════════════════════════════════════════════════════════╗
    ║   VITAL Expert - Bidirectional Supabase ↔ Notion Sync   ║
    ╚══════════════════════════════════════════════════════════╝
    """)
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python sync_bidirectional.py to-notion    # Supabase → Notion")
        print("  python sync_bidirectional.py from-notion  # Notion → Supabase")
        print("  python sync_bidirectional.py both         # Both directions")
        sys.exit(1)
    
    direction = sys.argv[1].lower()
    
    try:
        syncer = SupabaseNotionBiSync()
        
        if direction == 'to-notion':
            syncer.sync_supabase_to_notion()
        elif direction == 'from-notion':
            syncer.sync_notion_to_supabase()
        elif direction == 'both':
            syncer.sync_supabase_to_notion()
            print("\n" + "="*60 + "\n")
            syncer.sync_notion_to_supabase()
        else:
            print(f"❌ Unknown direction: {direction}")
            sys.exit(1)
        
        print("\n✅ Sync completed successfully!\n")
        
    except Exception as e:
        print(f"\n❌ Sync failed: {str(e)}\n")
        exit(1)


if __name__ == "__main__":
    main()

