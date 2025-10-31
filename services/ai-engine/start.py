#!/usr/bin/env python3
"""
VITAL AI Engine Startup Script
Reads PORT from environment variable and starts FastAPI server
"""
import os
import sys

# Add src to Python path to ensure imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

if __name__ == "__main__":
    # Get port from environment or default to 8000
    port = os.getenv("PORT", "8000")

    # Validate port is an integer
    try:
        port_int = int(port)
        if not (0 <= port_int <= 65535):
            print(f"ERROR: PORT must be between 0 and 65535, got {port}", file=sys.stderr)
            sys.exit(1)
    except ValueError:
        print(f"ERROR: PORT must be an integer, got '{port}'", file=sys.stderr)
        sys.exit(1)

    # Get log level from environment
    log_level = os.getenv("LOG_LEVEL", "info").lower()

    print(f"🚀 Starting VITAL AI Engine on port {port} (log level: {log_level})")
    print(f"📂 Working directory: {os.getcwd()}")
    print(f"🐍 Python path: {sys.path[:3]}")  # Show first 3 paths

    # Import uvicorn and run
    try:
        import uvicorn
        print("✅ Uvicorn imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import uvicorn: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Test import of main module before starting server
    try:
        from main import app
        print("✅ Main module imported successfully")
    except Exception as e:
        print(f"❌ Failed to import main module: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    # Production: use workers=0 (single process) for Docker, set reload=False
    # For development, set reload=True and workers=1
    reload = os.getenv("RELOAD", "false").lower() == "true"
    workers = int(os.getenv("WORKERS", "1"))
    
    print(f"🌐 Starting server on 0.0.0.0:{port_int}")
    
    try:
        uvicorn.run(
            app,  # Pass app directly instead of string
            host="0.0.0.0",
            port=port_int,
            log_level=log_level,
            reload=reload,
            workers=workers if not reload else 1,
            access_log=True
        )
    except Exception as e:
        print(f"❌ Failed to start server: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
