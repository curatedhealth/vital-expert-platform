"""
In-memory checkpoint store for demo purposes.
"""

from __future__ import annotations

from typing import Dict, Optional
from uuid import UUID


class CheckpointStore:
    def __init__(self):
        self._store: Dict[str, Dict[str, str]] = {}

    def set(self, mission_id: str, checkpoint_id: str, status: str) -> None:
        self._store[mission_id] = {"checkpoint_id": checkpoint_id, "status": status}

    def get(self, mission_id: str) -> Optional[Dict[str, str]]:
        return self._store.get(mission_id)

    def clear(self, mission_id: str) -> None:
        if mission_id in self._store:
            del self._store[mission_id]


checkpoint_store = CheckpointStore()
