#!/usr/bin/env python3
"""
Test script to check Python backend imports
"""

def test_imports():
    try:
        print("Testing basic imports...")
        
        # Test FastAPI
        from fastapi import FastAPI
        print("✅ FastAPI imported")
        
        # Test basic modules
        from routes import consultation
        print("✅ consultation route imported")
        
        from routes import modes
        print("✅ modes route imported")
        
        # Test state module
        from state import AutonomousAgentState
        print("✅ state module imported")
        
        # Test streaming
        from streaming.reasoning_streamer import ReasoningStreamer
        print("✅ streaming module imported")
        
        # Test cost tracking
        from cost.cost_tracker import CostTrackingCallback
        print("✅ cost tracking imported")
        
        print("\n🎉 All critical imports successful!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_imports()
