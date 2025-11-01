#!/usr/bin/env python3
"""
VITAL AI Engine Startup Script
Reads PORT from environment variable and starts FastAPI server
"""
import os
import sys

# Change to the directory containing this script to ensure relative paths work
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

# Add both src and the parent directory to Python path to ensure imports work
src_dir = os.path.join(script_dir, 'src')
sys.path.insert(0, src_dir)
sys.path.insert(0, script_dir)  # Also add script dir in case needed

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
    print(f"📂 Initial working directory: {os.getcwd()}")
    
    # Change to src directory FIRST so all imports work correctly
    os.chdir(src_dir)
    print(f"📂 Changed working directory to: {os.getcwd()}")
    print(f"🐍 Python path: {sys.path[:3]}")  # Show first 3 paths
    
    # Import uvicorn and run
    try:
        import uvicorn
        print("✅ Uvicorn imported successfully")
        print(f"📦 Uvicorn version: {uvicorn.__version__}")
    except ImportError as e:
        print(f"❌ Failed to import uvicorn: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    # Test import of main module before starting server (now in src directory)
    try:
        print("📦 Attempting to import main module...")
        from main import app
        print("✅ Main module imported successfully")
        print(f"📊 App title: {app.title}")
        print(f"📊 App version: {app.version}")
    except Exception as e:
        print(f"❌ Failed to import main module: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        print("⚠️  Continuing anyway - app might still work with degraded functionality", file=sys.stderr)
        # Don't exit - let uvicorn handle it
    
    # Production: use workers=0 for single process mode, set reload=False
    # For development, set reload=True and workers=1
    reload = os.getenv("RELOAD", "false").lower() == "true"
    # Use 0 workers for single-process mode (recommended for Railway)
    workers = int(os.getenv("WORKERS", "0"))
    
    print(f"🌐 Starting server on 0.0.0.0:{port_int}")
    print(f"⚙️  Configuration:")
    print(f"   - Host: 0.0.0.0")
    print(f"   - Port: {port_int}")
    print(f"   - Log Level: {log_level}")
    print(f"   - Reload: {reload}")
    print(f"   - Workers: {workers if not reload else 0}")
    print(f"   - Keep-Alive: 30s")
    
    try:
        # Use string path for uvicorn - main.py is in current directory (src/)
        print("🚀 Launching uvicorn server...")
        uvicorn.run(
            "main:app",  # main.py is in the current working directory (src/)
            host="0.0.0.0",
            port=port_int,
            log_level=log_level,
            reload=reload,
            workers=workers if not reload else 0,  # 0 workers = single process (better for Railway)
            access_log=True,
            timeout_keep_alive=30,  # Keep connections alive
            # Add startup timeout to prevent hanging
            timeout_graceful_shutdown=30
        )
    except KeyboardInterrupt:
        print("\n⚠️  Server stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Failed to start server: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        print(f"\n💡 Debugging info:", file=sys.stderr)
        print(f"   - Working directory: {os.getcwd()}", file=sys.stderr)
        print(f"   - Python path: {sys.path[:5]}", file=sys.stderr)
        print(f"   - Port: {port_int}", file=sys.stderr)
        print(f"   - Files in current dir: {os.listdir('.')[:10]}", file=sys.stderr)
        sys.exit(1)
