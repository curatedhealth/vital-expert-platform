#!/usr/bin/env python3
"""
Railway startup script that reads PORT from environment variable
"""
import os
import sys

if __name__ == "__main__":
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

    print(f"Starting uvicorn on port {port}")

    # Import uvicorn and run
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=port_int,
        log_level="info"
    )
