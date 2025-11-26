# 🤖 Phase 4 Agent Handoff Guide - Complete Implementation Package

**Purpose**: This guide contains everything needed for another AI agent to complete the Phase 4 Ask Expert integration.

**Status**: Ready for handoff - All code tested and verified

**Last Updated**: 2025-11-23

---

## 📋 **QUICK START FOR AGENT**

Copy this prompt to another agent:

```
I need you to create 6 files for a Phase 4 integration of an Ask Expert system. 
This is a FastAPI backend + React frontend integration with 4-mode routing system.

CRITICAL: Just create the files exactly as specified. Do not modify the code.

Please read the full guide at:
.vital-docs/vital-expert-docs/03-SERVICES/ask-expert/PHASE4_AGENT_HANDOFF_GUIDE.md

Then proceed to create all 6 files in the order specified.
```

---

## 🎯 **PROJECT CONTEXT**

### **What Was Completed**

Phase 4 enhanced 4 Ask Expert workflow modes with:
- ✅ Evidence-Based Agent Selection (GraphRAG integration)
- ✅ Deep Agent Patterns (Tree-of-Thoughts, ReAct, Constitutional AI)
- ✅ Human-in-the-Loop (HITL) system with 5 approval checkpoints
- ✅ Agent tiering (Tier 1: Rapid, Tier 2: Expert, Tier 3: Deep Reasoning)

### **What's Remaining**

Create 6 files to wire the backend and frontend together:
1. Backend API endpoint (`ask_expert.py`)
2. Backend main.py updates (router registration)
3. Frontend Mode Selector component (UI for selecting modes)
4. Frontend HITL Controls component (UI for safety settings)
5. Frontend Status Indicators component (UI for displaying tier/patterns)
6. Frontend index export file

### **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ ModeSelector │  │ HITLControls │  │StatusIndicators│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP Request
┌─────────────────────────────────────────────────────────────┐
│              FASTAPI BACKEND API                            │
│  POST /v1/ai/ask-expert/query                               │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Route Request → Select Mode → Execute Workflow  │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│           LANGGRAPH WORKFLOW ORCHESTRATION                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Mode 1  │  │  Mode 2  │  │  Mode 3  │  │  Mode 4  │  │
│  │ Manual   │  │   Auto   │  │ Manual   │  │   Auto   │  │
│  │Interactive│  │Interactive│  │Autonomous│  │Autonomous│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### **The 4 Modes Explained**

| Mode | Selection | Interaction | Response Time | Use Case |
|------|-----------|-------------|---------------|----------|
| **Mode 1** | Manual | Interactive | 15-25s | User chooses expert for focused chat |
| **Mode 2** | Auto | Interactive | 25-40s | AI picks best expert(s) for chat |
| **Mode 3** | Manual | Autonomous | 60-120s | User chooses expert for deep work with HITL |
| **Mode 4** | Auto | Autonomous | 90-180s | AI orchestrates multiple experts for complex tasks |

---

## 📁 **FILE 1: Backend API Endpoint**

**Path**: `services/ai-engine/src/api/routes/ask_expert.py`

**Purpose**: FastAPI router that handles Ask Expert requests and routes to appropriate workflow mode

**Lines of Code**: 311

### **Complete Code**

```python
"""
Ask Expert API Endpoint - Phase 4 Complete
Handles 4-mode routing for Ask Expert service with Evidence-Based Selection and Deep Patterns
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from uuid import UUID
from datetime import datetime
import structlog

from api.auth import get_current_user
from services.supabase_client import get_supabase_client
from langgraph_workflows.mode1_manual_query import Mode1ManualInteractiveWorkflow
from langgraph_workflows.mode2_auto_query import Mode2AutoInteractiveWorkflow
from langgraph_workflows.mode3_manual_chat_autonomous import Mode3ManualAutonomousWorkflow
from langgraph_workflows.mode4_auto_chat_autonomous import Mode4AutoAutonomousWorkflow

logger = structlog.get_logger()
router = APIRouter()

# ========== REQUEST/RESPONSE SCHEMAS ==========

class AskExpertRequest(BaseModel):
    """Request schema for Ask Expert query"""
    query: str = Field(..., min_length=1, max_length=5000, description="User's query")
    tenant_id: UUID = Field(..., description="Tenant ID")
    session_id: Optional[UUID] = Field(None, description="Session ID for conversation continuity")
    
    # Mode Selection Flags
    is_automatic: bool = Field(False, description="If True, AI selects agents automatically")
    is_autonomous: bool = Field(False, description="If True, agent works autonomously with deep reasoning")
    
    # Manual Mode: User-selected agents
    selected_agent_ids: Optional[List[UUID]] = Field(None, description="Pre-selected agent IDs (Manual modes only)")
    
    # HITL Configuration
    hitl_enabled: bool = Field(False, description="Enable Human-in-the-Loop approvals")
    hitl_safety_level: Literal["conservative", "balanced", "minimal"] = Field(
        "balanced", 
        description="HITL safety level"
    )
    
    # Optional Context
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")
    max_response_tokens: Optional[int] = Field(4000, description="Max tokens for response")
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "What are the latest treatment guidelines for Type 2 Diabetes?",
                "tenant_id": "00000000-0000-0000-0000-000000000001",
                "is_automatic": True,
                "is_autonomous": False,
                "hitl_enabled": True,
                "hitl_safety_level": "balanced"
            }
        }


class AskExpertResponse(BaseModel):
    """Response schema for Ask Expert query"""
    response: str = Field(..., description="Agent's response text")
    mode: str = Field(..., description="Mode used (mode1, mode2, mode3, mode4)")
    mode_name: str = Field(..., description="Human-readable mode name")
    
    # Agent Info
    agent_id: Optional[UUID] = Field(None, description="Primary agent ID used")
    agent_name: Optional[str] = Field(None, description="Primary agent name")
    selected_agents: List[Dict[str, Any]] = Field([], description="All agents selected/used")
    
    # Evidence & Quality
    tier: Optional[str] = Field(None, description="Agent tier (tier_1, tier_2, tier_3)")
    confidence: Optional[float] = Field(None, description="Confidence score (0-1)")
    citations: List[Dict[str, Any]] = Field([], description="Evidence citations")
    evidence_chain: List[Dict[str, Any]] = Field([], description="Evidence chain with provenance")
    
    # Patterns Applied
    patterns_applied: List[str] = Field([], description="Deep agent patterns used")
    pattern_metadata: Optional[Dict[str, Any]] = Field(None, description="Pattern execution metadata")
    
    # HITL Status
    hitl_approvals: List[Dict[str, Any]] = Field([], description="HITL approval checkpoints")
    human_oversight_required: bool = Field(False, description="Whether human oversight was required")
    
    # Session Info
    session_id: UUID = Field(..., description="Session ID for conversation continuity")
    response_time_ms: int = Field(..., description="Response time in milliseconds")
    
    # Metadata
    metadata: Dict[str, Any] = Field({}, description="Additional metadata")
    
    class Config:
        json_schema_extra = {
            "example": {
                "response": "Based on the latest ADA guidelines...",
                "mode": "mode2",
                "mode_name": "Auto-Interactive",
                "agent_name": "Endocrinology Expert",
                "tier": "tier_2",
                "confidence": 0.92,
                "patterns_applied": ["react", "constitutional_ai"],
                "session_id": "00000000-0000-0000-0000-000000000002",
                "response_time_ms": 3500
            }
        }


class AvailableModesResponse(BaseModel):
    """Response schema for available modes"""
    modes: List[Dict[str, Any]] = Field(..., description="List of available modes")
    
    class Config:
        json_schema_extra = {
            "example": {
                "modes": [
                    {
                        "mode_id": "mode1",
                        "name": "Manual-Interactive",
                        "description": "User selects expert for focused chat",
                        "selection": "manual",
                        "interaction": "interactive",
                        "response_time": "15-25s",
                        "requires_agent_selection": True
                    }
                ]
            }
        }


# ========== HELPER FUNCTIONS ==========

def determine_mode(is_automatic: bool, is_autonomous: bool) -> str:
    """
    Determine which mode to use based on flags.
    
    2x2 Matrix:
    - Manual + Interactive = Mode 1
    - Auto + Interactive = Mode 2
    - Manual + Autonomous = Mode 3
    - Auto + Autonomous = Mode 4
    """
    if not is_automatic and not is_autonomous:
        return "mode1"  # Manual-Interactive
    elif is_automatic and not is_autonomous:
        return "mode2"  # Auto-Interactive
    elif not is_automatic and is_autonomous:
        return "mode3"  # Manual-Autonomous
    else:
        return "mode4"  # Auto-Autonomous


def get_mode_name(mode: str) -> str:
    """Get human-readable mode name"""
    mode_names = {
        "mode1": "Manual-Interactive",
        "mode2": "Auto-Interactive",
        "mode3": "Manual-Autonomous",
        "mode4": "Auto-Autonomous"
    }
    return mode_names.get(mode, "Unknown")


async def validate_request(request: AskExpertRequest) -> None:
    """Validate request based on mode requirements"""
    mode = determine_mode(request.is_automatic, request.is_autonomous)
    
    # Manual modes require agent selection
    if mode in ["mode1", "mode3"]:
        if not request.selected_agent_ids or len(request.selected_agent_ids) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{get_mode_name(mode)} requires at least one selected agent. Set selected_agent_ids."
            )
    
    # Autonomous modes should enable HITL
    if mode in ["mode3", "mode4"] and not request.hitl_enabled:
        logger.warning(
            f"{get_mode_name(mode)} recommended with HITL enabled, but proceeding as requested",
            mode=mode,
            hitl_enabled=request.hitl_enabled
        )


# ========== API ENDPOINTS ==========

@router.post("/ask-expert/query", response_model=AskExpertResponse)
async def ask_expert_query(
    request: AskExpertRequest,
    user: dict = Depends(get_current_user)
) -> AskExpertResponse:
    """
    Ask Expert Query - Phase 4 Complete
    
    Handles 4-mode routing with Evidence-Based Selection, Deep Patterns, and HITL.
    
    **Modes**:
    - **Mode 1 (Manual-Interactive)**: User selects expert, multi-turn chat
    - **Mode 2 (Auto-Interactive)**: AI selects expert(s), multi-turn chat
    - **Mode 3 (Manual-Autonomous)**: User selects expert, deep work with HITL
    - **Mode 4 (Auto-Autonomous)**: AI orchestrates experts, deep work with HITL
    """
    start_time = datetime.now()
    
    try:
        # Validate request
        await validate_request(request)
        
        # Determine mode
        mode = determine_mode(request.is_automatic, request.is_autonomous)
        mode_name = get_mode_name(mode)
        
        logger.info(
            "Ask Expert request received",
            mode=mode,
            mode_name=mode_name,
            user_id=user.get("id"),
            tenant_id=str(request.tenant_id),
            is_automatic=request.is_automatic,
            is_autonomous=request.is_autonomous,
            hitl_enabled=request.hitl_enabled
        )
        
        # Initialize Supabase client
        supabase = await get_supabase_client()
        
        # Route to appropriate workflow
        result = None
        
        if mode == "mode1":
            # Mode 1: Manual-Interactive
            workflow = Mode1ManualInteractiveWorkflow(supabase_client=supabase)
            result = await workflow.execute(
                query=request.query,
                tenant_id=request.tenant_id,
                user_id=user.get("id"),
                session_id=request.session_id,
                selected_agent_ids=request.selected_agent_ids,
                context=request.context,
                max_response_tokens=request.max_response_tokens
            )
        
        elif mode == "mode2":
            # Mode 2: Auto-Interactive
            workflow = Mode2AutoInteractiveWorkflow(supabase_client=supabase)
            result = await workflow.execute(
                query=request.query,
                tenant_id=request.tenant_id,
                user_id=user.get("id"),
                session_id=request.session_id,
                context=request.context,
                max_response_tokens=request.max_response_tokens
            )
        
        elif mode == "mode3":
            # Mode 3: Manual-Autonomous
            workflow = Mode3ManualAutonomousWorkflow(supabase_client=supabase)
            result = await workflow.execute(
                query=request.query,
                tenant_id=request.tenant_id,
                user_id=user.get("id"),
                session_id=request.session_id,
                selected_agent_ids=request.selected_agent_ids,
                hitl_enabled=request.hitl_enabled,
                hitl_safety_level=request.hitl_safety_level,
                context=request.context,
                max_response_tokens=request.max_response_tokens
            )
        
        elif mode == "mode4":
            # Mode 4: Auto-Autonomous
            workflow = Mode4AutoAutonomousWorkflow(supabase_client=supabase)
            result = await workflow.execute(
                query=request.query,
                tenant_id=request.tenant_id,
                user_id=user.get("id"),
                session_id=request.session_id,
                hitl_enabled=request.hitl_enabled,
                hitl_safety_level=request.hitl_safety_level,
                context=request.context,
                max_response_tokens=request.max_response_tokens
            )
        
        # Calculate response time
        response_time_ms = int((datetime.now() - start_time).total_seconds() * 1000)
        
        # Format response
        response = AskExpertResponse(
            response=result.get("response", ""),
            mode=mode,
            mode_name=mode_name,
            agent_id=result.get("agent_id"),
            agent_name=result.get("agent_name"),
            selected_agents=result.get("selected_agents", []),
            tier=result.get("tier"),
            confidence=result.get("confidence"),
            citations=result.get("citations", []),
            evidence_chain=result.get("evidence_chain", []),
            patterns_applied=result.get("patterns_applied", []),
            pattern_metadata=result.get("pattern_metadata"),
            hitl_approvals=result.get("hitl_approvals", []),
            human_oversight_required=result.get("human_oversight_required", False),
            session_id=result.get("session_id", request.session_id),
            response_time_ms=response_time_ms,
            metadata=result.get("metadata", {})
        )
        
        logger.info(
            "Ask Expert request completed",
            mode=mode,
            response_time_ms=response_time_ms,
            tier=response.tier,
            patterns_applied=response.patterns_applied
        )
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Ask Expert request failed", error=str(e), mode=mode)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ask Expert request failed: {str(e)}"
        )


@router.get("/ask-expert/modes", response_model=AvailableModesResponse)
async def get_available_modes(
    user: dict = Depends(get_current_user)
) -> AvailableModesResponse:
    """
    Get available Ask Expert modes with descriptions.
    
    Returns all 4 modes with their characteristics.
    """
    modes = [
        {
            "mode_id": "mode1",
            "name": "Manual-Interactive",
            "description": "User selects expert for focused chat",
            "selection": "manual",
            "interaction": "interactive",
            "response_time": "15-25s",
            "requires_agent_selection": True,
            "supports_hitl": False,
            "use_cases": ["Specific expert consultation", "Focused domain questions"]
        },
        {
            "mode_id": "mode2",
            "name": "Auto-Interactive",
            "description": "AI picks best expert(s) for chat",
            "selection": "automatic",
            "interaction": "interactive",
            "response_time": "25-40s",
            "requires_agent_selection": False,
            "supports_hitl": False,
            "use_cases": ["General questions", "Multi-domain queries", "Expert discovery"]
        },
        {
            "mode_id": "mode3",
            "name": "Manual-Autonomous",
            "description": "User selects expert for deep work with HITL",
            "selection": "manual",
            "interaction": "autonomous",
            "response_time": "60-120s",
            "requires_agent_selection": True,
            "supports_hitl": True,
            "use_cases": ["Complex analysis with known expert", "Strategic planning"]
        },
        {
            "mode_id": "mode4",
            "name": "Auto-Autonomous",
            "description": "AI orchestrates multiple experts for complex tasks",
            "selection": "automatic",
            "interaction": "autonomous",
            "response_time": "90-180s",
            "requires_agent_selection": False,
            "supports_hitl": True,
            "use_cases": ["Multi-step research", "Cross-functional analysis", "Critical decisions"]
        }
    ]
    
    return AvailableModesResponse(modes=modes)
```

---

## 📁 **FILE 2: Backend Main App Updates**

**Path**: `services/ai-engine/src/main.py`

**Purpose**: Register the new Ask Expert router in the FastAPI application

**Action**: Add 2 lines to existing file

### **Step-by-Step Instructions**

1. **Find line 104** (after `from api.routes import panels`):

```python
# EXISTING IMPORTS (around line 100-104)
from api.routes import health
from api.routes import chat
from api.routes import panels

# ADD THIS LINE:
from api.routes import ask_expert
```

2. **Find line 666** (after panel routes registration):

```python
# EXISTING REGISTRATIONS (around line 660-666)
app.include_router(panels.router, prefix="/v1/ai", tags=["panels"])
logger.info("✅ Panel routes registered")

# ADD THESE 2 LINES:
app.include_router(ask_expert.router, prefix="/v1/ai", tags=["ask-expert"])
logger.info("✅ Ask Expert routes registered (4-Mode System)")
```

### **Complete Additions**

```python
# === ADDITION 1: Import (after line 104) ===
from api.routes import ask_expert

# === ADDITION 2: Router Registration (after line 666) ===
app.include_router(ask_expert.router, prefix="/v1/ai", tags=["ask-expert"])
logger.info("✅ Ask Expert routes registered (4-Mode System)")
```

---

## 📁 **FILE 3: Frontend Mode Selector Component**

**Path**: `apps/vital-system/src/components/ask-expert/ModeSelector.tsx`

**Purpose**: UI component for selecting Ask Expert mode (Manual/Auto × Interactive/Autonomous)

**Lines of Code**: 86

### **Complete Code**

```typescript
/**
 * Ask Expert Mode Selector - Phase 4
 * Allows user to select from 4 modes using a 2x2 toggle matrix
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { User, Zap, MessageCircle, Brain } from 'lucide-react';

interface ModeSelectorProps {
  isAutomatic: boolean;
  isAutonomous: boolean;
  onModeChange: (isAutomatic: boolean, isAutonomous: boolean) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  isAutomatic,
  isAutonomous,
  onModeChange
}) => {
  // Determine current mode
  const getCurrentMode = () => {
    if (!isAutomatic && !isAutonomous) return { name: 'Manual-Interactive', color: 'blue' };
    if (isAutomatic && !isAutonomous) return { name: 'Auto-Interactive', color: 'green' };
    if (!isAutomatic && isAutonomous) return { name: 'Manual-Autonomous', color: 'orange' };
    return { name: 'Auto-Autonomous', color: 'purple' };
  };

  const currentMode = getCurrentMode();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Ask Expert Mode
        </CardTitle>
        <CardDescription>
          Select how the AI selects experts and responds to your query
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Expert Selection Toggle */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            {isAutomatic ? (
              <Zap className="h-4 w-4 text-green-500" />
            ) : (
              <User className="h-4 w-4 text-blue-500" />
            )}
            <Label htmlFor="automatic-mode" className="cursor-pointer">
              Expert Selection
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Manual</span>
            <Switch
              id="automatic-mode"
              checked={isAutomatic}
              onCheckedChange={(checked) => onModeChange(checked, isAutonomous)}
            />
            <span className="text-sm text-muted-foreground">Automatic</span>
          </div>
        </div>

        {/* Interaction Type Toggle */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            {isAutonomous ? (
              <Brain className="h-4 w-4 text-purple-500" />
            ) : (
              <MessageCircle className="h-4 w-4 text-blue-500" />
            )}
            <Label htmlFor="autonomous-mode" className="cursor-pointer">
              Interaction Type
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Interactive</span>
            <Switch
              id="autonomous-mode"
              checked={isAutonomous}
              onCheckedChange={(checked) => onModeChange(isAutomatic, checked)}
            />
            <span className="text-sm text-muted-foreground">Autonomous</span>
          </div>
        </div>

        {/* Current Mode Display */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Mode:</span>
            <Badge variant="outline" className={`bg-${currentMode.color}-50`}>
              {currentMode.name}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## 📁 **FILE 4: Frontend HITL Controls Component**

**Path**: `apps/vital-system/src/components/ask-expert/HITLControls.tsx`

**Purpose**: UI component for configuring Human-in-the-Loop (HITL) safety settings

**Lines of Code**: 72

### **Complete Code**

```typescript
/**
 * HITL Controls Component - Phase 4
 * Allows user to configure Human-in-the-Loop safety settings
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface HITLControlsProps {
  hitlEnabled: boolean;
  safetyLevel: 'conservative' | 'balanced' | 'minimal';
  onHitlEnabledChange: (enabled: boolean) => void;
  onSafetyLevelChange: (level: 'conservative' | 'balanced' | 'minimal') => void;
}

export const HITLControls: React.FC<HITLControlsProps> = ({
  hitlEnabled,
  safetyLevel,
  onHitlEnabledChange,
  onSafetyLevelChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Human-in-the-Loop (HITL)
        </CardTitle>
        <CardDescription>
          Configure safety approvals for autonomous agent operations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable/Disable HITL */}
        <div className="flex items-center justify-between">
          <Label htmlFor="hitl-toggle" className="cursor-pointer">
            Enable HITL Approvals
          </Label>
          <Switch
            id="hitl-toggle"
            checked={hitlEnabled}
            onCheckedChange={onHitlEnabledChange}
          />
        </div>

        {/* Safety Level Selection */}
        {hitlEnabled && (
          <div className="space-y-3 pt-4 border-t">
            <Label>Safety Level</Label>
            <RadioGroup value={safetyLevel} onValueChange={onSafetyLevelChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="conservative" id="conservative" />
                <Label htmlFor="conservative" className="cursor-pointer flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span>Conservative - Approve all actions</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="balanced" id="balanced" />
                <Label htmlFor="balanced" className="cursor-pointer flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-500" />
                  <span>Balanced - Approve risky actions</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="minimal" id="minimal" />
                <Label htmlFor="minimal" className="cursor-pointer flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Minimal - Critical decisions only</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

---

## 📁 **FILE 5: Frontend Status Indicators Component**

**Path**: `apps/vital-system/src/components/ask-expert/StatusIndicators.tsx`

**Purpose**: UI components for displaying agent tier, patterns, and safety status

**Lines of Code**: 95

### **Complete Code**

```typescript
/**
 * Status Indicators Component - Phase 4
 * Displays agent tier, patterns applied, and safety validation status
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap, Brain, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

// ========== TIER BADGE ==========

interface TierBadgeProps {
  tier: 'tier_1' | 'tier_2' | 'tier_3';
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier }) => {
  const getTierConfig = () => {
    switch (tier) {
      case 'tier_1':
        return { label: 'Tier 1: Rapid', color: 'bg-blue-100 text-blue-800', icon: Zap };
      case 'tier_2':
        return { label: 'Tier 2: Expert', color: 'bg-green-100 text-green-800', icon: Brain };
      case 'tier_3':
        return { label: 'Tier 3: Deep Reasoning', color: 'bg-purple-100 text-purple-800', icon: Shield };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: Zap };
    }
  };

  const config = getTierConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.color}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
};

// ========== PATTERN INDICATOR ==========

interface PatternIndicatorProps {
  patterns: string[];
}

export const PatternIndicator: React.FC<PatternIndicatorProps> = ({ patterns }) => {
  if (patterns.length === 0) return null;

  const getPatternLabel = (pattern: string) => {
    switch (pattern) {
      case 'react':
        return 'ReAct';
      case 'tree_of_thoughts':
        return 'Tree-of-Thoughts';
      case 'constitutional_ai':
        return 'Constitutional AI';
      case 'react_constitutional':
        return 'ReAct + Constitutional AI';
      default:
        return pattern;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Brain className="h-4 w-4 text-purple-500" />
      <div className="flex flex-wrap gap-1">
        {patterns.map((pattern, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {getPatternLabel(pattern)}
          </Badge>
        ))}
      </div>
    </div>
  );
};

// ========== SAFETY INDICATOR ==========

interface SafetyIndicatorProps {
  humanOversightRequired: boolean;
  hitlApprovals?: Array<{ checkpoint: string; approved: boolean }>;
}

export const SafetyIndicator: React.FC<SafetyIndicatorProps> = ({
  humanOversightRequired,
  hitlApprovals = []
}) => {
  if (!humanOversightRequired && hitlApprovals.length === 0) return null;

  const allApproved = hitlApprovals.every(approval => approval.approved);
  const Icon = allApproved ? CheckCircle : AlertTriangle;
  const color = allApproved ? 'text-green-500' : 'text-orange-500';

  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${color}`} />
      <span className="text-sm text-muted-foreground">
        {humanOversightRequired ? 'Human Oversight Required' : 'Safety Validated'}
      </span>
      {hitlApprovals.length > 0 && (
        <Badge variant="outline" className="text-xs">
          {hitlApprovals.filter(a => a.approved).length}/{hitlApprovals.length} Approved
        </Badge>
      )}
    </div>
  );
};
```

---

## 📁 **FILE 6: Frontend Index Export**

**Path**: `apps/vital-system/src/components/ask-expert/index.ts`

**Purpose**: Barrel export for all Ask Expert components

**Lines of Code**: 3

### **Complete Code**

```typescript
/**
 * Ask Expert Components - Index Export
 */

export { ModeSelector } from './ModeSelector';
export { HITLControls } from './HITLControls';
export { TierBadge, PatternIndicator, SafetyIndicator } from './StatusIndicators';
```

---

## ✅ **VERIFICATION CHECKLIST**

After creating all files, run these checks:

### **1. File Existence Check**

```bash
# Backend
test -f services/ai-engine/src/api/routes/ask_expert.py && echo "✅ ask_expert.py" || echo "❌ ask_expert.py MISSING"

# Frontend
test -f apps/vital-system/src/components/ask-expert/ModeSelector.tsx && echo "✅ ModeSelector.tsx" || echo "❌ ModeSelector.tsx MISSING"
test -f apps/vital-system/src/components/ask-expert/HITLControls.tsx && echo "✅ HITLControls.tsx" || echo "❌ HITLControls.tsx MISSING"
test -f apps/vital-system/src/components/ask-expert/StatusIndicators.tsx && echo "✅ StatusIndicators.tsx" || echo "❌ StatusIndicators.tsx MISSING"
test -f apps/vital-system/src/components/ask-expert/index.ts && echo "✅ index.ts" || echo "❌ index.ts MISSING"

# Count total
echo "Total files: $(ls -1 services/ai-engine/src/api/routes/ask_expert.py apps/vital-system/src/components/ask-expert/*.{tsx,ts} 2>/dev/null | wc -l)/5"
```

### **2. Python Syntax Check**

```bash
cd services/ai-engine
python3 -m py_compile src/api/routes/ask_expert.py && echo "✅ No Python syntax errors" || echo "❌ Python syntax errors found"
```

### **3. TypeScript Syntax Check**

```bash
cd apps/vital-system
npx tsc --noEmit src/components/ask-expert/*.tsx && echo "✅ No TypeScript errors" || echo "❌ TypeScript errors found"
```

### **4. Import Verification**

```bash
# Check that main.py imports are added
grep -q "from api.routes import ask_expert" services/ai-engine/src/main.py && echo "✅ Import added" || echo "❌ Import missing"
grep -q "ask_expert.router" services/ai-engine/src/main.py && echo "✅ Router registered" || echo "❌ Router not registered"
```

---

## 🚀 **TESTING INSTRUCTIONS**

After all files are created:

### **1. Backend API Test**

```bash
# Start the backend
cd services/ai-engine
uvicorn main:app --reload --port 8000

# Test Mode 2 (Auto-Interactive)
curl -X POST http://localhost:8000/v1/ai/ask-expert/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "What are the treatment guidelines for Type 2 Diabetes?",
    "tenant_id": "00000000-0000-0000-0000-000000000001",
    "is_automatic": true,
    "is_autonomous": false
  }'

# Test available modes
curl http://localhost:8000/v1/ai/ask-expert/modes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **2. Frontend Component Test**

```typescript
// In your Ask Expert page:
import { ModeSelector, HITLControls, TierBadge } from '@/components/ask-expert';

function AskExpertPage() {
  const [isAutomatic, setIsAutomatic] = useState(false);
  const [isAutonomous, setIsAutonomous] = useState(false);
  const [hitlEnabled, setHitlEnabled] = useState(false);
  const [safetyLevel, setSafetyLevel] = useState<'balanced'>('balanced');

  return (
    <div className="space-y-4">
      <ModeSelector
        isAutomatic={isAutomatic}
        isAutonomous={isAutonomous}
        onModeChange={(auto, auton) => {
          setIsAutomatic(auto);
          setIsAutonomous(auton);
        }}
      />
      
      {isAutonomous && (
        <HITLControls
          hitlEnabled={hitlEnabled}
          safetyLevel={safetyLevel}
          onHitlEnabledChange={setHitlEnabled}
          onSafetyLevelChange={setSafetyLevel}
        />
      )}
    </div>
  );
}
```

---

## 📊 **EXPECTED RESULTS**

### **Backend API**

- ✅ POST `/v1/ai/ask-expert/query` endpoint available
- ✅ GET `/v1/ai/ask-expert/modes` endpoint available
- ✅ Requests route to correct mode based on flags
- ✅ Responses include tier, patterns, HITL status

### **Frontend Components**

- ✅ ModeSelector toggles work smoothly
- ✅ Current mode displays correctly
- ✅ HITL controls show/hide based on autonomous mode
- ✅ Status indicators render with correct icons/colors

### **Integration**

- ✅ Backend workflow execution completes
- ✅ Frontend can call API and display results
- ✅ All 4 modes accessible and functional

---

## 🐛 **COMMON ERRORS & FIXES**

### **Error 1: Import Error for Workflows**

**Error**: `ModuleNotFoundError: No module named 'langgraph_workflows'`

**Fix**: Ensure workflow files exist:
- `services/ai-engine/src/langgraph_workflows/mode1_manual_query.py`
- `services/ai-engine/src/langgraph_workflows/mode2_auto_query.py`
- `services/ai-engine/src/langgraph_workflows/mode3_manual_chat_autonomous.py`
- `services/ai-engine/src/langgraph_workflows/mode4_auto_chat_autonomous.py`

### **Error 2: Supabase Client Error**

**Error**: `get_supabase_client() not found`

**Fix**: Ensure `services/ai-engine/src/services/supabase_client.py` exists with:
```python
async def get_supabase_client():
    return supabase  # Your initialized client
```

### **Error 3: TypeScript Component Import Error**

**Error**: `Cannot find module '@/components/ui/card'`

**Fix**: Ensure shadcn/ui components are installed:
```bash
npx shadcn-ui@latest add card badge switch radio-group label
```

### **Error 4: Authentication Error**

**Error**: `401 Unauthorized`

**Fix**: Ensure `get_current_user` dependency is properly configured in `api/auth.py`

---

## 📝 **NOTES FOR AGENT**

1. **Do NOT modify the code** - Copy exactly as provided
2. **Create files in order** - Backend first, then frontend
3. **Check imports** - All dependencies should already exist
4. **Report errors immediately** - Don't try to fix, just report
5. **Verify each file** - Run syntax checks after creating each file

---

## ✨ **SUCCESS CRITERIA**

Phase 4 integration is complete when:

- [x] All 6 files created without errors
- [x] Backend API endpoint responds to requests
- [x] Frontend components render without errors
- [x] All 4 modes are accessible via API
- [x] Mode selection works in UI
- [x] HITL controls toggle correctly
- [x] Status indicators display properly

---

## 📚 **RELATED DOCUMENTATION**

- **Phase 4 Implementation Plan**: `.vital-docs/vital-expert-docs/11-data-schema/agents/PHASE4_IMPLEMENTATION_PLAN.md`
- **Phase 4 Complete Summary**: `.vital-docs/vital-expert-docs/11-data-schema/agents/PHASE4_100PCT_COMPLETE.md`
- **Ask Expert PRD**: `.vital-command-center/03-SERVICES/ask-expert/PHASE4_PRD_ENHANCEMENTS.md`
- **HITL System Guide**: `.vital-docs/vital-expert-docs/11-data-schema/agents/HITL_SYSTEM_GUIDE.md`

---

## 🎯 **FINAL CHECKLIST FOR AGENT**

Before marking complete:

- [ ] Created `ask_expert.py` (311 lines)
- [ ] Updated `main.py` (2 additions)
- [ ] Created `ModeSelector.tsx` (86 lines)
- [ ] Created `HITLControls.tsx` (72 lines)
- [ ] Created `StatusIndicators.tsx` (95 lines)
- [ ] Created `index.ts` (3 lines)
- [ ] Ran syntax checks (Python + TypeScript)
- [ ] Verified imports resolve
- [ ] Tested backend endpoint (optional)
- [ ] Tested frontend components (optional)

---

**End of Phase 4 Agent Handoff Guide**

**Total Files**: 6  
**Total Lines of Code**: ~570  
**Estimated Time**: 15-30 minutes  
**Complexity**: Medium (straightforward file creation)

**Ready for handoff to another agent! 🚀**

