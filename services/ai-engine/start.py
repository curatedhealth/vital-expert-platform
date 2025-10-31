#!/usr/bin/env python3
"""
VITAL AI Engine Startup Script
Reads PORT from environment variable and starts FastAPI server
"""
import os
import sys

if __name__ == "__main__":
    # Get port from environment or default to 8000
    port = os.getenv("PORT", "8000")

    # Validate port is an integer
    try:
        port_int = int(port)
        if not (0 <= port_int <= 65535):
            print(f"ERROR: PORT must be between 0 and 65535, got {port}")
            sys.exit(1)
    except ValueError:
        print(f"ERROR: PORT must be an integer, got '{port}'")
        sys.exit(1)

    # Get log level from environment
    log_level = os.getenv("LOG_LEVEL", "info").lower()

    print(f"🚀 Starting VITAL AI Engine on port {port} (log level: {log_level})")

    # Import uvicorn and run
    import uvicorn
    
    # Production: use workers=0 (single process) for Docker, set reload=False
    # For development, set reload=True and workers=1
    reload = os.getenv("RELOAD", "false").lower() == "true"
    workers = int(os.getenv("WORKERS", "1"))
    
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=port_int,
        log_level=log_level,
        reload=reload,
        workers=workers if not reload else 1,
        access_log=True
    )
