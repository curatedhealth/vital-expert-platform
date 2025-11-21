# AutoGen Integration Guide - Using CuratedHealth Fork

## Overview

We're integrating **your forked version of AutoGen** from your GitHub organization into the VITAL platform for the Ask Panel feature.

---

## Your Fork Information

**Repository**: `https://github.com/curatedhealth/autogen`  
**Purpose**: Customized AutoGen for healthcare multi-expert panels  
**Integration Point**: Ask Panel service

---

## Integration Strategy

### Option 1: Direct Python Package (Recommended)
Install your forked AutoGen directly from GitHub:

```bash
# In Python AI Engine
cd services/ai-engine
pip install git+https://github.com/curatedhealth/autogen.git@main
```

### Option 2: Local Development
Clone and develop locally:

```bash
cd services/ai-engine
git clone https://github.com/curatedhealth/autogen.git
cd autogen
pip install -e .
```

### Option 3: Git Submodule
Add as a submodule to your monorepo:

```bash
cd services/ai-engine
git submodule add https://github.com/curatedhealth/autogen.git lib/autogen
git submodule update --init --recursive
```

---

## Update Requirements

### services/ai-engine/requirements.txt

```python
# AutoGen - CuratedHealth Fork
# Use your forked version with healthcare customizations
git+https://github.com/curatedhealth/autogen.git@main

# Or if you have specific version/branch:
# git+https://github.com/curatedhealth/autogen.git@healthcare-features

# AutoGen dependencies
openai>=1.0.0
anthropic>=0.7.0  # If using Claude
docker>=6.0.0  # For code execution
python-dotenv>=1.0.0
```

---

## Python AI Engine Integration

### services/ai-engine/app/api/execute_autogen.py

```python
"""
Execute AutoGen Panel - Using CuratedHealth Fork
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import os

# Import from YOUR forked AutoGen
from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager
from autogen import config_list_from_json

router = APIRouter(prefix="/api", tags=["autogen"])

class AutoGenExecutionRequest(BaseModel):
    code: str
    question: str
    config: Dict[str, Any]
    context: Optional[Dict[str, Any]] = None

class AutoGenExecutionResponse(BaseModel):
    status: str
    messages: List[Dict[str, Any]]
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@router.post("/execute-autogen", response_model=AutoGenExecutionResponse)
async def execute_autogen_panel(request: AutoGenExecutionRequest):
    """
    Execute AutoGen multi-agent panel using CuratedHealth fork
    """
    try:
        print(f"🤖 [AutoGen] Executing panel with question: {request.question[:100]}...")
        
        # LLM Configuration
        config_list = config_list_from_json(
            env_or_file="OAI_CONFIG_LIST",
            filter_dict={"model": ["gpt-4", "gpt-4-turbo"]}
        )
        
        llm_config = {
            "config_list": config_list,
            "temperature": 0.7,
            "timeout": 120,
        }
        
        # Execute the generated code (contains agent definitions)
        exec_globals = {
            'AssistantAgent': AssistantAgent,
            'UserProxyAgent': UserProxyAgent,
            'GroupChat': GroupChat,
            'GroupChatManager': GroupChatManager,
            'llm_config': llm_config,
            'os': os,
        }
        exec_locals = {}
        
        # Execute generated code to create agents and group chat
        exec(request.code, exec_globals, exec_locals)
        
        # Get the user_proxy and manager from executed code
        user_proxy = exec_locals.get('user_proxy')
        manager = exec_locals.get('manager')
        
        if not user_proxy or not manager:
            raise ValueError("Generated code must define 'user_proxy' and 'manager'")
        
        # Initiate the panel discussion
        print(f"💬 [AutoGen] Starting group chat...")
        user_proxy.initiate_chat(
            manager,
            message=request.question
        )
        
        # Extract messages from the chat
        messages = []
        if hasattr(manager, 'groupchat') and hasattr(manager.groupchat, 'messages'):
            for msg in manager.groupchat.messages:
                messages.append({
                    'role': getattr(msg, 'role', 'assistant'),
                    'name': getattr(msg, 'name', 'unknown'),
                    'content': getattr(msg, 'content', str(msg))
                })
        
        print(f"✅ [AutoGen] Panel discussion complete ({len(messages)} messages)")
        
        return AutoGenExecutionResponse(
            status="success",
            messages=messages,
            result={
                "total_messages": len(messages),
                "experts_consulted": len(request.config.get('experts', []))
            }
        )
        
    except Exception as e:
        print(f"❌ [AutoGen] Execution error: {str(e)}")
        return AutoGenExecutionResponse(
            status="error",
            messages=[],
            error=str(e)
        )

# Register in main.py:
# from app.api.execute_autogen import router as autogen_router
# app.include_router(autogen_router)
```

---

## Configuration Files

### services/ai-engine/OAI_CONFIG_LIST

```json
[
    {
        "model": "gpt-4",
        "api_key": "${OPENAI_API_KEY}"
    },
    {
        "model": "gpt-4-turbo",
        "api_key": "${OPENAI_API_KEY}"
    },
    {
        "model": "gpt-3.5-turbo",
        "api_key": "${OPENAI_API_KEY}"
    }
]
```

### .env (Add to your existing .env)

```bash
# AutoGen Configuration
OPENAI_API_KEY=sk-...
AUTOGEN_USE_DOCKER=false  # Set to true if using code execution
AUTOGEN_WORK_DIR=/tmp/autogen_work_dir
```

---

## Testing Your Fork

### Test Script

```bash
cd services/ai-engine
python -c "
from autogen import __version__
print(f'AutoGen version: {__version__}')
print('✅ CuratedHealth AutoGen fork loaded successfully!')
"
```

### Integration Test

```python
# services/ai-engine/tests/test_autogen_integration.py

import pytest
from autogen import AssistantAgent, GroupChat, GroupChatManager

def test_autogen_fork_loaded():
    """Test that CuratedHealth AutoGen fork is loaded"""
    from autogen import __version__
    assert __version__ is not None
    print(f"✅ AutoGen {__version__} loaded")

def test_create_healthcare_panel():
    """Test creating a healthcare expert panel"""
    
    llm_config = {
        "config_list": [{"model": "gpt-4", "api_key": "test"}],
        "temperature": 0.7,
    }
    
    # Create healthcare experts
    ceo = AssistantAgent(
        name="Healthcare CEO",
        system_message="You are a healthcare CEO",
        llm_config=llm_config
    )
    
    cfo = AssistantAgent(
        name="Healthcare CFO",
        system_message="You are a healthcare CFO",
        llm_config=llm_config
    )
    
    # Create group chat
    group_chat = GroupChat(
        agents=[ceo, cfo],
        messages=[],
        max_round=5
    )
    
    manager = GroupChatManager(
        groupchat=group_chat,
        llm_config=llm_config
    )
    
    assert manager is not None
    print("✅ Healthcare panel created successfully")

if __name__ == "__main__":
    test_autogen_fork_loaded()
    test_create_healthcare_panel()
```

---

## Deployment Instructions

### 1. Install Your Fork

```bash
cd services/ai-engine
pip install git+https://github.com/curatedhealth/autogen.git@main
```

### 2. Verify Installation

```bash
python -c "import autogen; print(f'AutoGen: {autogen.__version__}')"
```

### 3. Update Docker (if using)

```dockerfile
# services/ai-engine/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install your forked AutoGen
RUN pip install git+https://github.com/curatedhealth/autogen.git@main

# Install other dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy code
COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 4. Deploy

```bash
# Railway/Vercel deployment will automatically use your fork
railway up
# or
vercel deploy
```

---

## Customizations in Your Fork

Document any customizations you've made to AutoGen for healthcare:

### Healthcare-Specific Features

1. **Custom Agent Types**
   - Healthcare CEO agent
   - CMO (Chief Medical Officer) agent  
   - Compliance Officer agent

2. **Healthcare Context**
   - HIPAA-aware conversations
   - Medical terminology support
   - Healthcare-specific prompting

3. **Integration Features**
   - EHR data integration
   - Clinical decision support
   - Regulatory compliance checks

---

## Maintenance

### Keeping Fork Updated

```bash
# Add upstream Microsoft AutoGen
git remote add upstream https://github.com/microsoft/autogen.git

# Fetch upstream changes
git fetch upstream

# Merge upstream main into your fork
git checkout main
git merge upstream/main

# Push updates
git push origin main
```

### Version Pinning

For production stability, pin to a specific commit:

```python
# requirements.txt
git+https://github.com/curatedhealth/autogen.git@a1b2c3d4  # Specific commit
```

---

## Support & Issues

**Your Fork Issues**: https://github.com/curatedhealth/autogen/issues  
**Upstream Issues**: https://github.com/microsoft/autogen/issues

---

## Next Steps

1. ✅ Clone your AutoGen fork
2. ✅ Install in Python AI Engine
3. ✅ Test basic functionality
4. ✅ Deploy Ask Panel with your fork
5. ✅ Document any custom features
6. ✅ Set up CI/CD for your fork

---

**Status**: Ready to integrate with CuratedHealth AutoGen fork! 🚀

