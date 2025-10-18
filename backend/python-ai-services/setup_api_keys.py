#!/usr/bin/env python3
"""
Setup script for API keys
"""

import os
import sys
from pathlib import Path

def setup_api_keys():
    """Interactive setup for API keys"""
    print("🔑 VITAL Real LangGraph Backend - API Keys Setup")
    print("=" * 50)
    
    # Get OpenAI API key
    openai_key = input("Enter your OpenAI API key: ").strip()
    if not openai_key:
        print("❌ OpenAI API key is required")
        return False
    
    # Get HuggingFace API key
    hf_key = input("Enter your HuggingFace API key: ").strip()
    if not hf_key:
        print("❌ HuggingFace API key is required")
        return False
    
    # Create .env file
    env_content = f"""# VITAL Real LangGraph Backend API Keys
OPENAI_API_KEY={openai_key}
HUGGINGFACE_API_KEY={hf_key}

# Backend Configuration
BACKEND_PORT=8002
BACKEND_HOST=0.0.0.0
"""
    
    env_file = Path(__file__).parent / ".env"
    with open(env_file, "w") as f:
        f.write(env_content)
    
    print(f"✅ API keys saved to {env_file}")
    
    # Set environment variables for current session
    os.environ["OPENAI_API_KEY"] = openai_key
    os.environ["HUGGINGFACE_API_KEY"] = hf_key
    
    print("✅ Environment variables set for current session")
    print("🚀 You can now start the backend with: python3 real_langgraph_backend.py")
    
    return True

if __name__ == "__main__":
    if setup_api_keys():
        print("\n🎉 Setup complete! Starting backend...")
        # Start the backend
        os.system("python3 real_langgraph_backend.py")
    else:
        print("\n❌ Setup failed. Please try again.")
        sys.exit(1)
