#!/usr/bin/env python3
"""
Test script to verify the backend server starts properly
"""
import sys
import os
import time
import subprocess
import requests
import signal

# Add the project root to Python path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

def test_server_startup():
    """Test that the server starts and responds to health checks"""
    print("=" * 60)
    print("VITAL Path Backend Server Startup Test")
    print("=" * 60)

    # Start the server in a subprocess
    print("\n1. Starting backend server...")
    server_process = subprocess.Popen(
        [sys.executable, "run_backend.py"],
        cwd=project_root,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    # Wait for server to start
    print("2. Waiting for server to start (5 seconds)...")
    time.sleep(5)

    # Check if process is still running
    if server_process.poll() is not None:
        print("✗ Server process terminated unexpectedly!")
        stdout, stderr = server_process.communicate()
        print("\nSTDOUT:", stdout)
        print("\nSTDERR:", stderr)
        return False

    print("✓ Server process is running")

    # Test health endpoint
    print("\n3. Testing health endpoint...")
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✓ Health check successful!")
            print(f"   Response: {response.json()}")
        else:
            print(f"✗ Health check failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Health check request failed: {e}")
        return False

    # Test root endpoint
    print("\n4. Testing root endpoint...")
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            print("✓ Root endpoint successful!")
            print(f"   Response: {response.json()}")
        else:
            print(f"✗ Root endpoint failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Root request failed: {e}")
        return False

    # Test system info endpoint
    print("\n5. Testing system info endpoint...")
    try:
        response = requests.get("http://localhost:8000/system/info", timeout=5)
        if response.status_code == 200:
            print("✓ System info endpoint successful!")
            info = response.json()
            print(f"   Environment: {info.get('environment')}")
            print(f"   Platform initialized: {info.get('platform_initialized')}")
            print(f"   Gateway initialized: {info.get('gateway_initialized')}")
        else:
            print(f"✗ System info failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ System info request failed: {e}")
        return False

    # Cleanup
    print("\n6. Stopping server...")
    server_process.send_signal(signal.SIGTERM)
    time.sleep(2)
    if server_process.poll() is None:
        server_process.kill()
    print("✓ Server stopped")

    print("\n" + "=" * 60)
    print("✅ All tests passed! Backend server is operational.")
    print("=" * 60)
    return True

if __name__ == "__main__":
    try:
        success = test_server_startup()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
