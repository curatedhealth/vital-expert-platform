# Ask Panel Environment Variables

**Date**: November 1, 2025  
**Purpose**: Additional environment variables for Ask Panel functionality  
**Location**: Add these to your existing `.env.local` file

---

## 📋 Instructions

Add the following variables to your existing `.env.local` file at the root of the VITAL project:

```bash
# =============================================================================
# ASK PANEL CONFIGURATION
# =============================================================================
# Panel-specific settings for multi-expert advisory board orchestration

# Maximum number of experts allowed in a single panel
ASK_PANEL_MAX_EXPERTS=12

# Maximum number of discussion rounds before forcing consensus
ASK_PANEL_MAX_ROUNDS=5

# Default timeout for panel execution (milliseconds)
ASK_PANEL_DEFAULT_TIMEOUT=300000

# Minimum consensus threshold (0.0 to 1.0)
# 0.7 = 70% agreement required
ASK_PANEL_MIN_CONSENSUS=0.70

# Enable real-time streaming for panel discussions
ASK_PANEL_ENABLE_STREAMING=true

# Enable hybrid human-AI panels (requires additional setup)
ASK_PANEL_ENABLE_HYBRID=false

# Panel types enabled (comma-separated)
# Options: structured, open, socratic, adversarial, delphi, hybrid
ASK_PANEL_ENABLED_TYPES=structured,open,socratic,adversarial,delphi

# Consensus algorithm to use
# Options: quantum, swarm, simple, weighted
ASK_PANEL_CONSENSUS_ALGORITHM=quantum

# Enable automatic panel member selection
ASK_PANEL_AUTO_SELECT_EXPERTS=true

# Maximum concurrent panels per tenant
ASK_PANEL_MAX_CONCURRENT=3

# Panel session TTL (time to live) in hours
ASK_PANEL_SESSION_TTL=72

# Enable evidence pack integration with RAG
ASK_PANEL_ENABLE_EVIDENCE_PACKS=true
```

---

## 🔧 Variable Descriptions

### Core Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ASK_PANEL_MAX_EXPERTS` | integer | 12 | Maximum experts per panel (2-20) |
| `ASK_PANEL_MAX_ROUNDS` | integer | 5 | Maximum discussion rounds (1-10) |
| `ASK_PANEL_DEFAULT_TIMEOUT` | integer | 300000 | Timeout in ms (5 minutes) |
| `ASK_PANEL_MIN_CONSENSUS` | float | 0.70 | Minimum agreement threshold (0.0-1.0) |

### Features

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ASK_PANEL_ENABLE_STREAMING` | boolean | true | Enable Server-Sent Events streaming |
| `ASK_PANEL_ENABLE_HYBRID` | boolean | false | Enable human-AI hybrid panels |
| `ASK_PANEL_AUTO_SELECT_EXPERTS` | boolean | true | Auto-select experts based on query |
| `ASK_PANEL_ENABLE_EVIDENCE_PACKS` | boolean | true | Enable RAG evidence integration |

### Advanced

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ASK_PANEL_ENABLED_TYPES` | string | all | Comma-separated panel types |
| `ASK_PANEL_CONSENSUS_ALGORITHM` | string | quantum | Consensus algorithm to use |
| `ASK_PANEL_MAX_CONCURRENT` | integer | 3 | Max concurrent panels per tenant |
| `ASK_PANEL_SESSION_TTL` | integer | 72 | Panel session time-to-live in hours |

---

## 🎯 Recommended Settings by Environment

### Development

```bash
ASK_PANEL_MAX_EXPERTS=6
ASK_PANEL_MAX_ROUNDS=3
ASK_PANEL_DEFAULT_TIMEOUT=180000
ASK_PANEL_MIN_CONSENSUS=0.60
ASK_PANEL_ENABLE_STREAMING=true
ASK_PANEL_ENABLE_HYBRID=false
ASK_PANEL_AUTO_SELECT_EXPERTS=true
ASK_PANEL_MAX_CONCURRENT=5
ASK_PANEL_SESSION_TTL=24
```

### Staging

```bash
ASK_PANEL_MAX_EXPERTS=10
ASK_PANEL_MAX_ROUNDS=4
ASK_PANEL_DEFAULT_TIMEOUT=240000
ASK_PANEL_MIN_CONSENSUS=0.70
ASK_PANEL_ENABLE_STREAMING=true
ASK_PANEL_ENABLE_HYBRID=true
ASK_PANEL_AUTO_SELECT_EXPERTS=true
ASK_PANEL_MAX_CONCURRENT=5
ASK_PANEL_SESSION_TTL=48
```

### Production

```bash
ASK_PANEL_MAX_EXPERTS=12
ASK_PANEL_MAX_ROUNDS=5
ASK_PANEL_DEFAULT_TIMEOUT=300000
ASK_PANEL_MIN_CONSENSUS=0.70
ASK_PANEL_ENABLE_STREAMING=true
ASK_PANEL_ENABLE_HYBRID=true
ASK_PANEL_AUTO_SELECT_EXPERTS=true
ASK_PANEL_MAX_CONCURRENT=3
ASK_PANEL_SESSION_TTL=72
```

---

## 📊 Consensus Algorithm Options

### Quantum Consensus (Recommended)
```bash
ASK_PANEL_CONSENSUS_ALGORITHM=quantum
```
- Multi-dimensional agreement analysis
- Weighs expertise, confidence, evidence
- Best for complex regulatory decisions

### Swarm Intelligence
```bash
ASK_PANEL_CONSENSUS_ALGORITHM=swarm
```
- Emergent pattern recognition
- Collective intelligence simulation
- Best for brainstorming and innovation

### Simple Majority
```bash
ASK_PANEL_CONSENSUS_ALGORITHM=simple
```
- Basic vote counting
- Fast and straightforward
- Best for quick decisions

### Weighted Average
```bash
ASK_PANEL_CONSENSUS_ALGORITHM=weighted
```
- Expert confidence weighting
- Evidence-based scoring
- Best for balanced analysis

---

## ✅ Validation

After adding variables, verify they're loaded correctly:

```bash
# In your terminal
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Check if variables are set (won't show values for security)
python3 -c "
import os
from dotenv import load_dotenv
load_dotenv('.env.local')

vars_to_check = [
    'ASK_PANEL_MAX_EXPERTS',
    'ASK_PANEL_MAX_ROUNDS',
    'ASK_PANEL_ENABLE_STREAMING',
    'ASK_PANEL_MIN_CONSENSUS'
]

for var in vars_to_check:
    value = os.getenv(var)
    status = '✅' if value else '❌'
    print(f'{status} {var}: {\"Set\" if value else \"Missing\"}'
)
"
```

---

## 🔄 Using Variables in Code

### Python (ai-engine)

```python
# services/ai-engine/src/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # ... existing settings ...
    
    # Ask Panel Configuration
    ask_panel_max_experts: int = 12
    ask_panel_max_rounds: int = 5
    ask_panel_default_timeout: int = 300000
    ask_panel_min_consensus: float = 0.70
    ask_panel_enable_streaming: bool = True
    ask_panel_enable_hybrid: bool = False
    ask_panel_auto_select_experts: bool = True
    ask_panel_max_concurrent: int = 3
    ask_panel_session_ttl: int = 72
    ask_panel_consensus_algorithm: str = "quantum"
    
    class Config:
        env_file = ".env.local"
        case_sensitive = False

# Usage
from core.config import get_settings
settings = get_settings()
max_experts = settings.ask_panel_max_experts
```

### TypeScript (Frontend)

```typescript
// For client-side variables, prefix with NEXT_PUBLIC_
// Add to .env.local:
NEXT_PUBLIC_ASK_PANEL_MAX_EXPERTS=12
NEXT_PUBLIC_ASK_PANEL_ENABLE_STREAMING=true

// Usage in frontend
const maxExperts = parseInt(
  process.env.NEXT_PUBLIC_ASK_PANEL_MAX_EXPERTS || '12'
);
const streamingEnabled = 
  process.env.NEXT_PUBLIC_ASK_PANEL_ENABLE_STREAMING === 'true';
```

---

## 🚨 Important Notes

1. **Never Commit `.env.local`**: Already in `.gitignore`
2. **Use Different Values per Environment**: Dev, Staging, Production
3. **Validate Values**: Some variables have constraints (e.g., consensus 0.0-1.0)
4. **Restart Required**: Restart ai-engine after changing variables
5. **Security**: Keep production values secret

---

## 🔗 Related Documentation

- [Phase 0 Integration Plan](PHASE_0_INTEGRATION_PLAN.md)
- [Ask Panel Comprehensive Documentation](ASK_PANEL_COMPREHENSIVE_DOCUMENTATION.md)
- [AI Engine Configuration](../../services/ai-engine/src/core/config.py)

---

**Status**: Ready to add to `.env.local`  
**Next Step**: Create database RLS policies for board tables

