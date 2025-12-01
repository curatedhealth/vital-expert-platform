#!/usr/bin/env python3
"""
VITAL AI Engine Startup Script
Reads PORT from environment variable and starts FastAPI server
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Fix SSL certificate paths for Python 3.9 (override any shell environment)
# This fixes the Supabase initialization FileNotFoundError
try:
    import certifi
    ssl_cert_path = certifi.where()
    os.environ['SSL_CERT_FILE'] = ssl_cert_path
    os.environ['REQUESTS_CA_BUNDLE'] = ssl_cert_path
    print(f"🔐 SSL certificates configured: {ssl_cert_path}", flush=True)
except ImportError:
    print("⚠️  certifi not installed, SSL may not work correctly", flush=True)

# Critical: Ensure output is unbuffered so logs appear immediately
os.environ['PYTHONUNBUFFERED'] = '1'
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

print("=" * 80, flush=True)
print("🚀 VITAL AI Engine Startup Script", flush=True)
print("=" * 80, flush=True)

# Change to the directory containing this script to ensure relative paths work
script_dir = os.path.dirname(os.path.abspath(__file__))
print(f"📂 Script directory: {script_dir}", flush=True)
print(f"📂 Initial working directory: {os.getcwd()}", flush=True)
os.chdir(script_dir)
print(f"📂 Changed to: {os.getcwd()}", flush=True)

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

    print(f"🚀 Starting VITAL AI Engine on port {port} (log level: {log_level})", flush=True)
    print(f"📂 Initial working directory: {os.getcwd()}", flush=True)
    
    # Verify src directory exists
    if not os.path.exists(src_dir):
        print(f"❌ ERROR: src directory does not exist at {src_dir}", flush=True, file=sys.stderr)
        print(f"📂 Current directory contents: {os.listdir('.')}", flush=True, file=sys.stderr)
        sys.exit(1)
    
    # Change to src directory FIRST so all imports work correctly
    os.chdir(src_dir)
    print(f"📂 Changed working directory to: {os.getcwd()}", flush=True)
    print(f"🐍 Python path: {sys.path[:3]}", flush=True)  # Show first 3 paths
    
    # Import uvicorn and run
    try:
        print("📦 Importing uvicorn...", flush=True)
        import uvicorn
        print("✅ Uvicorn imported successfully", flush=True)
        print(f"📦 Uvicorn version: {uvicorn.__version__}", flush=True)
    except ImportError as e:
        print(f"❌ Failed to import uvicorn: {e}", flush=True, file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.stderr.flush()
        sys.exit(1)
    
    # Test import of main module before starting server (now in src directory)
    try:
        print("📦 Attempting to import main module...", flush=True)
        print(f"📂 Checking if main.py exists: {os.path.exists('main.py')}", flush=True)
        if not os.path.exists('main.py'):
            print(f"❌ ERROR: main.py not found in {os.getcwd()}", flush=True, file=sys.stderr)
            print(f"📂 Files in current directory: {os.listdir('.')}", flush=True, file=sys.stderr)
            sys.stderr.flush()
            sys.exit(1)
        from main import app
        print("✅ Main module imported successfully", flush=True)
        print(f"📊 App title: {app.title}", flush=True)
        print(f"📊 App version: {app.version}", flush=True)
    except Exception as e:
        print(f"❌ Failed to import main module: {e}", flush=True, file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.stderr.flush()
        print("⚠️  Continuing anyway - app might still work with degraded functionality", flush=True, file=sys.stderr)
        sys.stderr.flush()
        # Don't exit - let uvicorn handle it
    
    # Production: use workers=0 for single process mode, set reload=False
    # For development, set reload=True and workers=1
    reload = os.getenv("RELOAD", "false").lower() == "true"
    # Use 0 workers for single-process mode (recommended for Railway)
    workers = int(os.getenv("WORKERS", "0"))
    
    print(f"🌐 Starting server on 0.0.0.0:{port_int}", flush=True)
    print(f"⚙️  Configuration:", flush=True)
    print(f"   - Host: 0.0.0.0", flush=True)
    print(f"   - Port: {port_int}", flush=True)
    print(f"   - Log Level: {log_level}", flush=True)
    print(f"   - Reload: {reload}", flush=True)
    print(f"   - Workers: {workers if not reload else 0}", flush=True)
    print(f"   - Keep-Alive: 30s", flush=True)
    
    try:
        # Use string path for uvicorn - main.py is in current directory (src/)
        print("🚀 Launching uvicorn server...", flush=True)
        print(f"📂 Final working directory: {os.getcwd()}", flush=True)
        print(f"📂 main.py exists: {os.path.exists('main.py')}", flush=True)
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
