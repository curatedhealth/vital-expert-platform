"""
VITAL Platform - Change Data Capture Pipeline
==============================================
Real-time sync from Supabase to Neo4j Knowledge Graph.

Architecture:
    Supabase PostgreSQL
         ↓ Realtime WebSocket / Edge Functions
    CDC Pipeline (this module)
         ↓ Cypher mutations
    Neo4j Knowledge Graph

Since direct PostgreSQL access is blocked by IP restrictions,
we use Supabase Realtime + REST API for CDC.
"""

import asyncio
import json
import requests
import websockets
from typing import Dict, Any, Callable, Optional, List
from dataclasses import dataclass
from enum import Enum
from datetime import datetime
from neo4j import GraphDatabase
import logging

# =============================================================================
# CONFIGURATION
# =============================================================================

SUPABASE_URL = "https://bomltkhixeatxuoxmolq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
SUPABASE_REALTIME_URL = "wss://bomltkhixeatxuoxmolq.supabase.co/realtime/v1/websocket"

NEO4J_URI = "neo4j+s://13067bdb.databases.neo4j.io"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "kkCxQgpcanSUDv-dKzOzDPcYIhvJHRQRa4tuiNa2Mek"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =============================================================================
# CDC EVENT TYPES
# =============================================================================

class CDCEventType(Enum):
    INSERT = "INSERT"
    UPDATE = "UPDATE"
    DELETE = "DELETE"

@dataclass
class CDCEvent:
    """Represents a change data capture event."""
    event_type: CDCEventType
    table: str
    record: Dict[str, Any]
    old_record: Optional[Dict[str, Any]] = None
    timestamp: str = ""

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.utcnow().isoformat()

# =============================================================================
# TABLE TO NEO4J MAPPING
# =============================================================================

TABLE_NODE_MAPPING = {
    "org_functions": {
        "label": "Function",
        "id_field": "id",
        "properties": ["name", "slug", "description", "mission_statement",
                       "regulatory_sensitivity", "strategic_priority"]
    },
    "org_departments": {
        "label": "Department",
        "id_field": "id",
        "properties": ["name", "slug", "description", "operating_model", "field_vs_office_mix"],
        "relationships": [
            {"field": "function_id", "target_label": "Function", "type": "BELONGS_TO"}
        ]
    },
    "org_roles": {
        "label": "Role",
        "id_field": "id",
        "properties": ["name", "slug", "description", "role_type", "role_category",
                       "seniority_level", "leadership_level", "geographic_scope",
                       "years_experience_min", "years_experience_max",
                       "travel_percentage_min", "travel_percentage_max",
                       "gxp_critical", "hcp_facing", "patient_facing", "safety_critical"],
        "relationships": [
            {"field": "department_id", "target_label": "Department", "type": "IN_DEPARTMENT"},
            {"field": "function_id", "target_label": "Function", "type": "IN_FUNCTION"}
        ]
    },
    "personas": {
        "label": "Persona",
        "id_field": "id",
        "properties": ["unique_id", "persona_name", "persona_type", "title",
                       "description", "department", "function_area", "geographic_scope",
                       "experience_level", "is_active"],
        "json_properties": ["goals", "challenges", "motivations", "frustrations",
                           "daily_activities", "tools_used"],
        "relationships": [
            {"field": "source_role_id", "target_label": "Role", "type": "BASED_ON_ROLE"}
        ]
    },
    "agents": {
        "label": "Agent",
        "id_field": "id",
        "properties": ["name", "slug", "title", "tagline", "description",
                       "expertise_level", "years_of_experience", "geographic_scope",
                       "communication_style", "base_model", "status"],
        "relationships": [
            {"field": "role_id", "target_label": "Role", "type": "SERVES_ROLE"},
            {"field": "function_id", "target_label": "Function", "type": "IN_FUNCTION"},
            {"field": "department_id", "target_label": "Department", "type": "IN_DEPARTMENT"}
        ]
    }
}

# =============================================================================
# NEO4J CDC HANDLER
# =============================================================================

class Neo4jCDCHandler:
    """Handles CDC events and applies them to Neo4j."""

    def __init__(self):
        self.driver = None
        self._connect()

    def _connect(self):
        """Connect to Neo4j (may fail if IP not whitelisted)."""
        try:
            self.driver = GraphDatabase.driver(
                NEO4J_URI,
                auth=(NEO4J_USER, NEO4J_PASSWORD)
            )
            # Test connection
            with self.driver.session() as session:
                session.run("RETURN 1")
            logger.info("Connected to Neo4j")
        except Exception as e:
            logger.warning(f"Neo4j connection failed (IP whitelist?): {e}")
            self.driver = None

    def is_connected(self) -> bool:
        return self.driver is not None

    def handle_event(self, event: CDCEvent) -> bool:
        """Process a CDC event and apply to Neo4j."""
        if not self.driver:
            logger.warning("Neo4j not connected - queuing event")
            return False

        mapping = TABLE_NODE_MAPPING.get(event.table)
        if not mapping:
            logger.debug(f"No mapping for table: {event.table}")
            return False

        try:
            with self.driver.session() as session:
                if event.event_type == CDCEventType.INSERT:
                    self._handle_insert(session, event, mapping)
                elif event.event_type == CDCEventType.UPDATE:
                    self._handle_update(session, event, mapping)
                elif event.event_type == CDCEventType.DELETE:
                    self._handle_delete(session, event, mapping)

            logger.info(f"Applied {event.event_type.value} on {event.table}")
            return True

        except Exception as e:
            logger.error(f"Failed to apply CDC event: {e}")
            return False

    def _handle_insert(self, session, event: CDCEvent, mapping: Dict):
        """Handle INSERT - create node and relationships."""
        label = mapping["label"]
        id_field = mapping["id_field"]
        record_id = event.record.get(id_field)

        # Build property SET clause
        props = self._build_properties(event.record, mapping)

        # Create node - exclude 'id' from record to avoid duplicate parameter
        params = {k: v for k, v in event.record.items() if k != 'id'}
        query = f"""
        MERGE (n:{label} {{id: $id}})
        SET {props}
        SET n.updated_at = datetime()
        """
        session.run(query, id=record_id, **params)

        # Create relationships
        self._create_relationships(session, event.record, mapping, label)

    def _handle_update(self, session, event: CDCEvent, mapping: Dict):
        """Handle UPDATE - update node properties."""
        label = mapping["label"]
        id_field = mapping["id_field"]
        record_id = event.record.get(id_field)

        props = self._build_properties(event.record, mapping)

        # Exclude 'id' from record to avoid duplicate parameter
        params = {k: v for k, v in event.record.items() if k != 'id'}
        query = f"""
        MATCH (n:{label} {{id: $id}})
        SET {props}
        SET n.updated_at = datetime()
        """
        session.run(query, id=record_id, **params)

        # Update relationships (delete old, create new)
        self._update_relationships(session, event.record, mapping, label)

    def _handle_delete(self, session, event: CDCEvent, mapping: Dict):
        """Handle DELETE - remove node and relationships."""
        label = mapping["label"]
        id_field = mapping["id_field"]
        record_id = event.record.get(id_field)

        query = f"""
        MATCH (n:{label} {{id: $id}})
        DETACH DELETE n
        """
        session.run(query, id=record_id)

    def _build_properties(self, record: Dict, mapping: Dict) -> str:
        """Build Cypher SET clause for properties."""
        props = []
        for prop in mapping.get("properties", []):
            if prop in record:
                props.append(f"n.{prop} = ${prop}")

        # Handle JSON properties (serialize to string)
        for prop in mapping.get("json_properties", []):
            if prop in record and record[prop]:
                props.append(f"n.{prop} = ${prop}")

        return ", ".join(props) if props else "n.id = n.id"

    def _create_relationships(self, session, record: Dict, mapping: Dict, label: str):
        """Create relationships based on foreign keys."""
        for rel in mapping.get("relationships", []):
            fk_value = record.get(rel["field"])
            if fk_value:
                query = f"""
                MATCH (source:{label} {{id: $source_id}})
                MATCH (target:{rel['target_label']} {{id: $target_id}})
                MERGE (source)-[:{rel['type']}]->(target)
                """
                session.run(query, source_id=record["id"], target_id=fk_value)

    def _update_relationships(self, session, record: Dict, mapping: Dict, label: str):
        """Update relationships by deleting old and creating new."""
        for rel in mapping.get("relationships", []):
            # Delete existing relationship of this type
            query = f"""
            MATCH (n:{label} {{id: $id}})-[r:{rel['type']}]->()
            DELETE r
            """
            session.run(query, id=record["id"])

        # Create new relationships
        self._create_relationships(session, record, mapping, label)

    def close(self):
        if self.driver:
            self.driver.close()

# =============================================================================
# SUPABASE REALTIME CLIENT
# =============================================================================

class SupabaseRealtimeClient:
    """WebSocket client for Supabase Realtime subscriptions."""

    def __init__(self, handler: Neo4jCDCHandler):
        self.handler = handler
        self.subscribed_tables = list(TABLE_NODE_MAPPING.keys())
        self.ws = None
        self.running = False

    async def connect(self):
        """Connect to Supabase Realtime WebSocket."""
        url = f"{SUPABASE_REALTIME_URL}?apikey={SUPABASE_KEY}&vsn=1.0.0"

        try:
            self.ws = await websockets.connect(url)
            logger.info("Connected to Supabase Realtime")

            # Send heartbeat
            await self._send_heartbeat()

            # Subscribe to tables
            for table in self.subscribed_tables:
                await self._subscribe_table(table)

            self.running = True

        except Exception as e:
            logger.error(f"Realtime connection failed: {e}")
            raise

    async def _send_heartbeat(self):
        """Send Phoenix heartbeat."""
        msg = {
            "topic": "phoenix",
            "event": "heartbeat",
            "payload": {},
            "ref": "heartbeat"
        }
        await self.ws.send(json.dumps(msg))

    async def _subscribe_table(self, table: str):
        """Subscribe to a table's changes."""
        msg = {
            "topic": f"realtime:public:{table}",
            "event": "phx_join",
            "payload": {
                "config": {
                    "postgres_changes": [
                        {"event": "*", "schema": "public", "table": table}
                    ]
                }
            },
            "ref": f"sub_{table}"
        }
        await self.ws.send(json.dumps(msg))
        logger.info(f"Subscribed to {table}")

    async def listen(self):
        """Listen for CDC events."""
        while self.running:
            try:
                message = await asyncio.wait_for(self.ws.recv(), timeout=30)
                await self._handle_message(json.loads(message))

            except asyncio.TimeoutError:
                # Send heartbeat
                await self._send_heartbeat()

            except websockets.exceptions.ConnectionClosed:
                logger.warning("WebSocket closed, reconnecting...")
                await self.connect()

    async def _handle_message(self, msg: Dict):
        """Process incoming WebSocket message."""
        event_type = msg.get("event")
        payload = msg.get("payload", {})

        # Handle postgres_changes events
        if event_type == "postgres_changes":
            data = payload.get("data", {})
            change_type = data.get("type", "").upper()
            table = data.get("table")

            if change_type and table:
                event = CDCEvent(
                    event_type=CDCEventType[change_type],
                    table=table,
                    record=data.get("record", {}),
                    old_record=data.get("old_record")
                )
                self.handler.handle_event(event)

    async def stop(self):
        """Stop the realtime client."""
        self.running = False
        if self.ws:
            await self.ws.close()

# =============================================================================
# POLLING-BASED CDC (FALLBACK)
# =============================================================================

class PollingCDCClient:
    """Polling-based CDC for environments where Realtime isn't available."""

    def __init__(self, handler: Neo4jCDCHandler, poll_interval: int = 60):
        self.handler = handler
        self.poll_interval = poll_interval
        self.last_sync = {}  # table -> last_updated timestamp
        self.running = False

    def start(self):
        """Start polling loop."""
        self.running = True
        while self.running:
            self._poll_changes()
            import time
            time.sleep(self.poll_interval)

    def _poll_changes(self):
        """Poll for changes since last sync."""
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}"
        }

        for table in TABLE_NODE_MAPPING.keys():
            try:
                last_sync = self.last_sync.get(table, "1970-01-01T00:00:00")

                # Fetch records updated since last sync
                url = f"{SUPABASE_URL}/rest/v1/{table}"
                params = {
                    "select": "*",
                    "updated_at": f"gte.{last_sync}",
                    "order": "updated_at.asc",
                    "limit": 1000
                }

                resp = requests.get(url, headers=headers, params=params)

                if resp.status_code == 200:
                    records = resp.json()
                    for record in records:
                        event = CDCEvent(
                            event_type=CDCEventType.UPDATE,  # Treat as upsert
                            table=table,
                            record=record
                        )
                        self.handler.handle_event(event)

                        # Update last sync timestamp
                        if record.get("updated_at"):
                            self.last_sync[table] = record["updated_at"]

                    if records:
                        logger.info(f"Synced {len(records)} changes from {table}")

            except Exception as e:
                logger.error(f"Polling error for {table}: {e}")

    def stop(self):
        self.running = False

# =============================================================================
# MANUAL SYNC (FOR INITIAL LOAD OR RECOVERY)
# =============================================================================

def full_sync_to_neo4j():
    """Perform full sync from Supabase to Neo4j."""
    logger.info("Starting full sync to Neo4j...")

    handler = Neo4jCDCHandler()
    if not handler.is_connected():
        logger.error("Cannot perform full sync - Neo4j not connected")
        return False

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }

    # Sync in dependency order
    sync_order = ["org_functions", "org_departments", "org_roles", "personas", "agents"]

    for table in sync_order:
        logger.info(f"Syncing {table}...")

        offset = 0
        batch_size = 500
        total = 0

        while True:
            url = f"{SUPABASE_URL}/rest/v1/{table}?select=*&offset={offset}&limit={batch_size}"
            resp = requests.get(url, headers=headers)

            if resp.status_code != 200:
                logger.error(f"Failed to fetch {table}: {resp.text}")
                break

            records = resp.json()
            if not records:
                break

            for record in records:
                event = CDCEvent(
                    event_type=CDCEventType.INSERT,
                    table=table,
                    record=record
                )
                handler.handle_event(event)
                total += 1

            offset += batch_size

        logger.info(f"Synced {total} records from {table}")

    handler.close()
    logger.info("Full sync complete!")
    return True

# =============================================================================
# CDC PIPELINE ORCHESTRATOR
# =============================================================================

class CDCPipeline:
    """
    Orchestrates the CDC pipeline with automatic failover.

    Priority:
    1. Supabase Realtime (real-time, preferred)
    2. Polling (fallback, every 60s)
    """

    def __init__(self):
        self.handler = Neo4jCDCHandler()
        self.realtime_client = None
        self.polling_client = None

    async def start_realtime(self):
        """Start real-time CDC via Supabase Realtime."""
        self.realtime_client = SupabaseRealtimeClient(self.handler)
        await self.realtime_client.connect()
        await self.realtime_client.listen()

    def start_polling(self, interval: int = 60):
        """Start polling-based CDC."""
        self.polling_client = PollingCDCClient(self.handler, interval)
        self.polling_client.start()

    def run(self, mode: str = "realtime"):
        """Run the CDC pipeline."""
        logger.info(f"Starting CDC Pipeline in {mode} mode...")

        if mode == "realtime":
            asyncio.run(self.start_realtime())
        elif mode == "polling":
            self.start_polling()
        elif mode == "hybrid":
            # Run both for redundancy
            import threading
            polling_thread = threading.Thread(target=self.start_polling, args=(120,))
            polling_thread.daemon = True
            polling_thread.start()
            asyncio.run(self.start_realtime())

    def stop(self):
        """Stop all CDC clients."""
        if self.realtime_client:
            asyncio.run(self.realtime_client.stop())
        if self.polling_client:
            self.polling_client.stop()
        self.handler.close()

# =============================================================================
# CLI
# =============================================================================

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "full-sync":
            full_sync_to_neo4j()

        elif command == "realtime":
            pipeline = CDCPipeline()
            try:
                pipeline.run("realtime")
            except KeyboardInterrupt:
                pipeline.stop()

        elif command == "polling":
            pipeline = CDCPipeline()
            try:
                pipeline.run("polling")
            except KeyboardInterrupt:
                pipeline.stop()

        else:
            print("Usage: python cdc_pipeline.py [full-sync|realtime|polling]")
    else:
        print("""
VITAL CDC Pipeline
==================

Commands:
  full-sync  - Full sync from Supabase to Neo4j
  realtime   - Start real-time CDC via WebSocket
  polling    - Start polling-based CDC (every 60s)

Example:
  python cdc_pipeline.py full-sync
  python cdc_pipeline.py realtime
""")
