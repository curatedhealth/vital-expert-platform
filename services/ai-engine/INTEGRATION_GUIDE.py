"""
LangGraph Execution Endpoint - Integration Guide

This guide explains how to integrate the LangGraph execution endpoint
into your existing Python AI Engine.

Author: Vital Development Team
Date: November 3, 2025
"""

# ============================================================================
# STEP 1: Install Dependencies
# ============================================================================

"""
Add to services/ai-engine/requirements.txt:

RestrictedPython>=6.0
langchain>=0.1.0
langchain-core>=0.1.0
langchain-openai>=0.0.5
langchain-anthropic>=0.1.0
langgraph>=0.0.40

Then run:
    pip install -r requirements.txt
"""

# ============================================================================
# STEP 2: Register Router in Main App
# ============================================================================

"""
In services/ai-engine/app/main.py or app/api/__init__.py:
"""

from fastapi import FastAPI
from app.api.langgraph_execution import router as langgraph_router

app = FastAPI(title="Vital AI Engine")

# Register the LangGraph execution router
app.include_router(langgraph_router)

# Your other routes...

# ============================================================================
# STEP 3: Environment Variables
# ============================================================================

"""
Add to .env or set in your deployment:

OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...  # Optional

These will be automatically injected into the execution environment.
"""

# ============================================================================
# STEP 4: Test the Endpoint
# ============================================================================

"""
Test with curl:

curl -X POST http://localhost:8000/api/execute-langgraph \
  -H "Content-Type: application/json" \
  -d '{
    "code": "from typing import TypedDict, Annotated\nfrom langchain_core.messages import BaseMessage, HumanMessage\nfrom langgraph.graph import StateGraph, START, END\nfrom langgraph.graph.message import add_messages\nfrom langchain_openai import ChatOpenAI\n\nclass State(TypedDict):\n    messages: Annotated[list[BaseMessage], add_messages]\n\ndef agent(state):\n    llm = ChatOpenAI(model=\"gpt-4o-mini\", temperature=0.7)\n    response = llm.invoke(state[\"messages\"])\n    return {\"messages\": [response]}\n\nworkflow = StateGraph(State)\nworkflow.add_node(\"agent\", agent)\nworkflow.add_edge(START, \"agent\")\nworkflow.add_edge(\"agent\", END)\napp = workflow.compile()",
    "inputs": {
      "messages": [{"role": "user", "content": "Say hello!"}]
    },
    "config": {
      "thread_id": "test-123"
    }
  }'

Or test with Python:
"""

import requests
import json

url = "http://localhost:8000/api/execute-langgraph"

# Sample LangGraph code
code = '''
from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage, HumanMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI

class State(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]

def agent(state):
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

workflow = StateGraph(State)
workflow.add_node("agent", agent)
workflow.add_edge(START, "agent")
workflow.add_edge(END, "agent")
app = workflow.compile()
'''

payload = {
    "code": code,
    "inputs": {
        "messages": [{"role": "user", "content": "Say hello!"}]
    },
    "config": {
        "thread_id": "test-123"
    }
}

response = requests.post(url, json=payload)
print(json.dumps(response.json(), indent=2))

# ============================================================================
# STEP 5: Security Considerations
# ============================================================================

"""
PRODUCTION CHECKLIST:

1. ✅ RestrictedPython installed for code sandboxing
2. ✅ Resource limits configured (memory, CPU, timeout)
3. ✅ API keys injected from environment (not from user input)
4. ✅ Input validation with Pydantic
5. ✅ Timeout set to 60 seconds
6. ⚠️ Rate limiting (TODO: Add to FastAPI middleware)
7. ⚠️ User authentication (TODO: Add JWT middleware)
8. ⚠️ Audit logging (TODO: Log all executions)

For enhanced security in production:
- Add rate limiting per user/IP
- Implement user authentication (JWT)
- Add audit logging to database
- Monitor for suspicious patterns
- Consider running in isolated containers (Docker)
"""

# ============================================================================
# STEP 6: Docker Deployment (Optional)
# ============================================================================

"""
Create services/ai-engine/Dockerfile:

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    build-essential \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
COPY langgraph-requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir -r langgraph-requirements.txt

# Copy application
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV WORKERS=4

# Expose port
EXPOSE 8000

# Run with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

Then build and run:
    docker build -t vital-ai-engine .
    docker run -p 8000:8000 \\
        -e OPENAI_API_KEY=$OPENAI_API_KEY \\
        -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \\
        vital-ai-engine
"""

# ============================================================================
# STEP 7: Frontend Integration
# ============================================================================

"""
The Next.js frontend already calls this endpoint via:
/apps/digital-health-startup/src/app/api/workflows/[id]/execute/route.ts

No changes needed on the frontend!

The flow is:
1. User clicks "Execute" in workflow designer
2. Frontend calls /api/workflows/[id]/execute (Next.js API)
3. Next.js generates Python code from workflow definition
4. Next.js calls Python AI Engine /api/execute-langgraph
5. Python AI Engine executes code and returns results
6. Next.js streams results back to frontend
7. Frontend displays results in ExecutionVisualizer
"""

# ============================================================================
# STEP 8: Monitoring & Logging
# ============================================================================

"""
Add logging to track executions:

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In execute_langgraph():
logger.info(f"Executing workflow for thread_id: {config.get('thread_id')}")
logger.info(f"Code length: {len(code)} chars")
logger.info(f"Execution completed in {duration_ms}ms")
logger.info(f"Tokens used: {total_tokens}")

For production, consider:
- Structured logging (JSON format)
- Log aggregation (Datadog, CloudWatch)
- Performance monitoring (New Relic, Sentry)
- Cost tracking (tokens per user)
"""

# ============================================================================
# TROUBLESHOOTING
# ============================================================================

"""
Common Issues:

1. "RestrictedPython not installed"
   Solution: pip install RestrictedPython>=6.0

2. "OPENAI_API_KEY not set"
   Solution: Set environment variable or add to .env

3. "Timeout exceeded"
   Solution: Increase timeout in execute_langgraph_code() or optimize workflow

4. "Memory limit exceeded"
   Solution: Increase resource limits or simplify workflow

5. "Module not found: langchain_anthropic"
   Solution: pip install langchain-anthropic or set ANTHROPIC_AVAILABLE=False

6. "Code compilation errors"
   Solution: Check generated code for syntax errors or unsupported patterns
"""

# ============================================================================
# DONE! 🎉
# ============================================================================

"""
You now have a fully functional LangGraph execution endpoint!

Next steps:
1. Test with the workflow designer
2. Add rate limiting and authentication
3. Set up monitoring and logging
4. Deploy to production

Questions? Check the documentation or ask the team!
"""

