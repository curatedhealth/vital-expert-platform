"""
Simple async pub/sub for mission events (in-memory).
Replace with Redis/Event bus in production.
"""

from __future__ import annotations

import asyncio
from typing import Any, Dict, Callable, Coroutine, List


class Publisher:
    def __init__(self):
        self.subscribers: Dict[str, List[Callable[[Dict[str, Any]], Coroutine]]] = {}

    def subscribe(self, mission_id: str, handler: Callable[[Dict[str, Any]], Coroutine]) -> None:
        self.subscribers.setdefault(mission_id, []).append(handler)

    async def publish(self, mission_id: str, event: Dict[str, Any]) -> None:
        handlers = self.subscribers.get(mission_id, [])
        for h in handlers:
            await h(event)


publisher = Publisher()
