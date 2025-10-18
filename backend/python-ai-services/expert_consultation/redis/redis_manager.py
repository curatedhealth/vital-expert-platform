"""
Redis Manager for Real-time State Management

Provides pub/sub capabilities, real-time execution state tracking,
and distributed session management for VITAL Expert Consultation.
"""

from typing import Dict, List, Any, Optional, Callable, Union
import asyncio
import json
import redis.asyncio as redis
from datetime import datetime, timedelta
import uuid
from dataclasses import dataclass, asdict


@dataclass
class ExecutionState:
    """Real-time execution state for a session"""
    session_id: str
    user_id: str
    status: str  # 'running', 'paused', 'completed', 'failed'
    current_phase: str
    iteration: int
    total_iterations: int
    progress_percentage: float
    current_step: str
    last_activity: datetime
    cost_so_far: float
    budget: float
    error: Optional[str] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


class RedisManager:
    """Manages Redis operations for real-time state and pub/sub"""
    
    def __init__(
        self, 
        redis_url: str = "redis://localhost:6379",
        namespace: str = "vital_expert"
    ):
        self.redis_url = redis_url
        self.namespace = namespace
        self.redis_client: Optional[redis.Redis] = None
        self.pubsub: Optional[redis.client.PubSub] = None
        
        # Subscribers for different channels
        self.subscribers: Dict[str, List[Callable]] = {}
        
        # Connection pool
        self.pool: Optional[redis.ConnectionPool] = None
    
    async def connect(self) -> bool:
        """Connect to Redis server"""
        try:
            self.pool = redis.ConnectionPool.from_url(
                self.redis_url,
                max_connections=20,
                retry_on_timeout=True
            )
            
            self.redis_client = redis.Redis(
                connection_pool=self.pool,
                decode_responses=True
            )
            
            # Test connection
            await self.redis_client.ping()
            
            # Initialize pub/sub
            self.pubsub = self.redis_client.pubsub()
            
            return True
            
        except Exception as e:
            print(f"Failed to connect to Redis: {e}")
            return False
    
    async def disconnect(self):
        """Disconnect from Redis"""
        try:
            if self.pubsub:
                await self.pubsub.close()
            if self.redis_client:
                await self.redis_client.close()
            if self.pool:
                await self.pool.disconnect()
        except Exception as e:
            print(f"Error disconnecting from Redis: {e}")
    
    # Session State Management
    
    async def set_execution_state(self, state: ExecutionState) -> bool:
        """Set real-time execution state for a session"""
        try:
            key = f"{self.namespace}:execution_state:{state.session_id}"
            data = json.dumps(asdict(state), default=str)
            
            # Set with TTL of 1 hour
            await self.redis_client.setex(key, 3600, data)
            
            # Publish state update
            await self.publish_execution_update(state.session_id, state)
            
            return True
            
        except Exception as e:
            print(f"Error setting execution state: {e}")
            return False
    
    async def get_execution_state(self, session_id: str) -> Optional[ExecutionState]:
        """Get real-time execution state for a session"""
        try:
            key = f"{self.namespace}:execution_state:{session_id}"
            data = await self.redis_client.get(key)
            
            if data:
                state_dict = json.loads(data)
                # Convert datetime strings back to datetime objects
                state_dict['last_activity'] = datetime.fromisoformat(state_dict['last_activity'])
                return ExecutionState(**state_dict)
            
            return None
            
        except Exception as e:
            print(f"Error getting execution state: {e}")
            return None
    
    async def update_execution_progress(
        self, 
        session_id: str, 
        phase: str = None,
        iteration: int = None,
        progress: float = None,
        current_step: str = None,
        cost: float = None
    ) -> bool:
        """Update execution progress for a session"""
        try:
            # Get current state
            state = await self.get_execution_state(session_id)
            if not state:
                return False
            
            # Update fields
            if phase is not None:
                state.current_phase = phase
            if iteration is not None:
                state.iteration = iteration
            if progress is not None:
                state.progress_percentage = progress
            if current_step is not None:
                state.current_step = current_step
            if cost is not None:
                state.cost_so_far = cost
            
            state.last_activity = datetime.utcnow()
            
            # Save updated state
            return await self.set_execution_state(state)
            
        except Exception as e:
            print(f"Error updating execution progress: {e}")
            return False
    
    async def pause_execution(self, session_id: str) -> bool:
        """Pause execution for a session"""
        return await self.update_execution_progress(
            session_id, 
            phase="paused",
            current_step="Execution paused by user"
        )
    
    async def resume_execution(self, session_id: str) -> bool:
        """Resume execution for a session"""
        return await self.update_execution_progress(
            session_id, 
            phase="running",
            current_step="Execution resumed"
        )
    
    async def complete_execution(
        self, 
        session_id: str, 
        final_cost: float = None,
        error: str = None
    ) -> bool:
        """Mark execution as completed"""
        try:
            state = await self.get_execution_state(session_id)
            if not state:
                return False
            
            state.status = "failed" if error else "completed"
            state.current_phase = "completed"
            state.progress_percentage = 100.0
            state.current_step = "Execution completed"
            state.last_activity = datetime.utcnow()
            
            if final_cost is not None:
                state.cost_so_far = final_cost
            if error:
                state.error = error
            
            return await self.set_execution_state(state)
            
        except Exception as e:
            print(f"Error completing execution: {e}")
            return False
    
    # Pub/Sub System
    
    async def subscribe_to_channel(
        self, 
        channel: str, 
        callback: Callable[[Dict[str, Any]], None]
    ) -> bool:
        """Subscribe to a Redis channel"""
        try:
            if channel not in self.subscribers:
                self.subscribers[channel] = []
            
            self.subscribers[channel].append(callback)
            
            # Subscribe to the channel
            await self.pubsub.subscribe(f"{self.namespace}:{channel}")
            
            return True
            
        except Exception as e:
            print(f"Error subscribing to channel {channel}: {e}")
            return False
    
    async def unsubscribe_from_channel(self, channel: str) -> bool:
        """Unsubscribe from a Redis channel"""
        try:
            if channel in self.subscribers:
                del self.subscribers[channel]
            
            await self.pubsub.unsubscribe(f"{self.namespace}:{channel}")
            return True
            
        except Exception as e:
            print(f"Error unsubscribing from channel {channel}: {e}")
            return False
    
    async def publish_message(
        self, 
        channel: str, 
        message: Dict[str, Any]
    ) -> bool:
        """Publish a message to a Redis channel"""
        try:
            full_channel = f"{self.namespace}:{channel}"
            data = json.dumps(message, default=str)
            
            await self.redis_client.publish(full_channel, data)
            return True
            
        except Exception as e:
            print(f"Error publishing message to {channel}: {e}")
            return False
    
    async def publish_execution_update(
        self, 
        session_id: str, 
        state: ExecutionState
    ) -> bool:
        """Publish execution state update"""
        message = {
            "type": "execution_update",
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat(),
            "state": asdict(state)
        }
        
        return await self.publish_message("execution_updates", message)
    
    async def publish_reasoning_step(
        self, 
        session_id: str, 
        step: Dict[str, Any]
    ) -> bool:
        """Publish a reasoning step update"""
        message = {
            "type": "reasoning_step",
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat(),
            "step": step
        }
        
        return await self.publish_message("reasoning_steps", message)
    
    async def publish_cost_update(
        self, 
        session_id: str, 
        cost_data: Dict[str, Any]
    ) -> bool:
        """Publish cost update"""
        message = {
            "type": "cost_update",
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat(),
            "cost": cost_data
        }
        
        return await self.publish_message("cost_updates", message)
    
    async def start_message_loop(self):
        """Start the message processing loop"""
        try:
            async for message in self.pubsub.listen():
                if message['type'] == 'message':
                    await self._handle_message(message)
        except Exception as e:
            print(f"Error in message loop: {e}")
    
    async def _handle_message(self, message: Dict[str, Any]):
        """Handle incoming pub/sub messages"""
        try:
            channel = message['channel'].replace(f"{self.namespace}:", "")
            data = json.loads(message['data'])
            
            # Call all subscribers for this channel
            if channel in self.subscribers:
                for callback in self.subscribers[channel]:
                    try:
                        await callback(data)
                    except Exception as e:
                        print(f"Error in subscriber callback: {e}")
                        
        except Exception as e:
            print(f"Error handling message: {e}")
    
    # Session Management
    
    async def create_session_lock(self, session_id: str, ttl: int = 300) -> bool:
        """Create a distributed lock for a session"""
        try:
            key = f"{self.namespace}:lock:{session_id}"
            lock_value = str(uuid.uuid4())
            
            # Try to acquire lock with TTL
            result = await self.redis_client.set(
                key, 
                lock_value, 
                nx=True,  # Only set if not exists
                ex=ttl     # Expire after TTL seconds
            )
            
            return result is not None
            
        except Exception as e:
            print(f"Error creating session lock: {e}")
            return False
    
    async def release_session_lock(self, session_id: str) -> bool:
        """Release a distributed lock for a session"""
        try:
            key = f"{self.namespace}:lock:{session_id}"
            await self.redis_client.delete(key)
            return True
            
        except Exception as e:
            print(f"Error releasing session lock: {e}")
            return False
    
    async def is_session_locked(self, session_id: str) -> bool:
        """Check if a session is locked"""
        try:
            key = f"{self.namespace}:lock:{session_id}"
            return await self.redis_client.exists(key) > 0
            
        except Exception as e:
            print(f"Error checking session lock: {e}")
            return False
    
    # Analytics and Monitoring
    
    async def get_active_sessions(self) -> List[str]:
        """Get list of currently active sessions"""
        try:
            pattern = f"{self.namespace}:execution_state:*"
            keys = await self.redis_client.keys(pattern)
            
            session_ids = []
            for key in keys:
                session_id = key.replace(f"{self.namespace}:execution_state:", "")
                session_ids.append(session_id)
            
            return session_ids
            
        except Exception as e:
            print(f"Error getting active sessions: {e}")
            return []
    
    async def get_session_metrics(self, session_id: str) -> Dict[str, Any]:
        """Get metrics for a specific session"""
        try:
            state = await self.get_execution_state(session_id)
            if not state:
                return {}
            
            return {
                "session_id": session_id,
                "status": state.status,
                "progress": state.progress_percentage,
                "cost": state.cost_so_far,
                "budget": state.budget,
                "cost_ratio": state.cost_so_far / state.budget if state.budget > 0 else 0,
                "iteration": state.iteration,
                "total_iterations": state.total_iterations,
                "last_activity": state.last_activity.isoformat(),
                "current_phase": state.current_phase,
                "current_step": state.current_step
            }
            
        except Exception as e:
            print(f"Error getting session metrics: {e}")
            return {}
    
    async def get_system_metrics(self) -> Dict[str, Any]:
        """Get overall system metrics"""
        try:
            active_sessions = await self.get_active_sessions()
            
            total_cost = 0.0
            total_budget = 0.0
            running_sessions = 0
            paused_sessions = 0
            
            for session_id in active_sessions:
                metrics = await self.get_session_metrics(session_id)
                if metrics:
                    total_cost += metrics.get("cost", 0.0)
                    total_budget += metrics.get("budget", 0.0)
                    
                    if metrics.get("status") == "running":
                        running_sessions += 1
                    elif metrics.get("status") == "paused":
                        paused_sessions += 1
            
            return {
                "active_sessions": len(active_sessions),
                "running_sessions": running_sessions,
                "paused_sessions": paused_sessions,
                "total_cost": total_cost,
                "total_budget": total_budget,
                "cost_utilization": total_cost / total_budget if total_budget > 0 else 0,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"Error getting system metrics: {e}")
            return {}
    
    # Cleanup and Maintenance
    
    async def cleanup_expired_sessions(self, max_age_hours: int = 24) -> int:
        """Clean up expired session data"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=max_age_hours)
            cleaned_count = 0
            
            # Get all execution state keys
            pattern = f"{self.namespace}:execution_state:*"
            keys = await self.redis_client.keys(pattern)
            
            for key in keys:
                try:
                    data = await self.redis_client.get(key)
                    if data:
                        state_dict = json.loads(data)
                        last_activity = datetime.fromisoformat(state_dict['last_activity'])
                        
                        if last_activity < cutoff_time:
                            await self.redis_client.delete(key)
                            cleaned_count += 1
                            
                except Exception as e:
                    print(f"Error cleaning up key {key}: {e}")
            
            return cleaned_count
            
        except Exception as e:
            print(f"Error cleaning up expired sessions: {e}")
            return 0
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform Redis health check"""
        try:
            # Test basic operations
            test_key = f"{self.namespace}:health_check:{uuid.uuid4()}"
            test_value = "ok"
            
            await self.redis_client.setex(test_key, 10, test_value)
            retrieved_value = await self.redis_client.get(test_key)
            await self.redis_client.delete(test_key)
            
            # Test pub/sub
            pubsub_ok = await self.publish_message("health_check", {"test": True})
            
            return {
                "status": "healthy" if retrieved_value == test_value and pubsub_ok else "unhealthy",
                "redis_connected": True,
                "pubsub_working": pubsub_ok,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                "status": "unhealthy",
                "redis_connected": False,
                "pubsub_working": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
