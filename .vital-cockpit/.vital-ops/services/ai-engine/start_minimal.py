#!/usr/bin/env python3
"""
MINIMAL VITAL AI Engine - Emergency Diagnostic Version
This version will start NO MATTER WHAT and tell us what's wrong
"""
import os
import sys

print("=" * 80, flush=True)
print("🚨 MINIMAL DIAGNOSTIC SERVER", flush=True)
print("=" * 80, flush=True)

# Check Python version
print(f"🐍 Python version: {sys.version}", flush=True)
print(f"📂 Working directory: {os.getcwd()}", flush=True)
print(f"📂 Script location: {os.path.abspath(__file__)}", flush=True)

# Check environment variables
print("\n🔍 Environment Variables:", flush=True)
env_vars = [
    "PORT", "RAILWAY_ENVIRONMENT", "RAILWAY_PROJECT_ID",
    "OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"
]
for var in env_vars:
    value = os.getenv(var)
    if value:
        # Mask sensitive values
        if "KEY" in var or "SECRET" in var:
            masked = value[:8] + "..." if len(value) > 8 else "***"
            print(f"   ✅ {var}: {masked}", flush=True)
        else:
            print(f"   ✅ {var}: {value}", flush=True)
    else:
        print(f"   ❌ {var}: NOT SET", flush=True)

# Check if we can import FastAPI
print("\n📦 Testing imports:", flush=True)
try:
    import fastapi
    print(f"   ✅ FastAPI: {fastapi.__version__}", flush=True)
except ImportError as e:
    print(f"   ❌ FastAPI: {e}", flush=True)
    sys.exit(1)

try:
    import uvicorn
    print(f"   ✅ Uvicorn: {uvicorn.__version__}", flush=True)
except ImportError as e:
    print(f"   ❌ Uvicorn: {e}", flush=True)
    sys.exit(1)

# Check if src directory exists
src_dir = os.path.join(os.path.dirname(__file__), 'src')
print(f"\n📂 Source directory check:", flush=True)
print(f"   Looking for: {src_dir}", flush=True)
print(f"   Exists: {os.path.exists(src_dir)}", flush=True)
if os.path.exists(src_dir):
    print(f"   Contents: {os.listdir(src_dir)[:10]}", flush=True)

# Create minimal FastAPI app
print("\n🚀 Creating minimal FastAPI app...", flush=True)
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(title="VITAL Diagnostic Server", version="1.0.0")

@app.get("/")
async def root():
    return {
        "status": "alive",
        "message": "Diagnostic server is running",
        "python_version": sys.version,
        "cwd": os.getcwd()
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "vital-diagnostic-server",
        "ready": True,
        "environment": {
            "port": os.getenv("PORT", "8000"),
            "railway_env": os.getenv("RAILWAY_ENVIRONMENT", "unknown"),
            "has_openai_key": bool(os.getenv("OPENAI_API_KEY")),
            "has_supabase_url": bool(os.getenv("SUPABASE_URL")),
        }
    }

@app.get("/debug")
async def debug():
    return {
        "cwd": os.getcwd(),
        "python_path": sys.path[:5],
        "env_vars": {k: "***" if "KEY" in k or "SECRET" in k else v 
                     for k, v in os.environ.items() if k.startswith(("RAILWAY", "PORT", "OPENAI", "SUPABASE"))},
        "src_exists": os.path.exists(os.path.join(os.getcwd(), 'src')),
    }

# Start server
if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    print(f"\n🌐 Starting minimal server on 0.0.0.0:{port}", flush=True)
    print(f"🔍 Health endpoint: http://0.0.0.0:{port}/health", flush=True)
    print(f"🔍 Debug endpoint: http://0.0.0.0:{port}/debug", flush=True)
    print("=" * 80, flush=True)
    
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )

