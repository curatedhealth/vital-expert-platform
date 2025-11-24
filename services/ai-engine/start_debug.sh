#!/bin/bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"
source venv/bin/activate

echo "══════════════════════════════════════════════════════════════"
echo "🔍 KNOWLEDGE GRAPH STARTUP DIAGNOSTICS"
echo "══════════════════════════════════════════════════════════════"
echo ""

# Check file exists
if [ -f "src/api/routes/knowledge_graph.py" ]; then
    echo "✅ File exists: src/api/routes/knowledge_graph.py"
    echo "   Size: $(wc -c < src/api/routes/knowledge_graph.py) bytes"
    echo "   Lines: $(wc -l < src/api/routes/knowledge_graph.py)"
else
    echo "❌ File NOT FOUND: src/api/routes/knowledge_graph.py"
    exit 1
fi

echo ""
echo "🔍 Testing import..."
python << 'PYEOF'
import sys
sys.path.insert(0, 'src')
try:
    from api.routes.knowledge_graph import router
    print(f"✅ Import successful!")
    print(f"✅ Router has {len(router.routes)} routes:")
    for route in router.routes:
        methods = ','.join(route.methods)
        print(f"   [{methods}] {route.path}")
except Exception as e:
    print(f"❌ Import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
PYEOF

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Pre-flight checks FAILED"
    exit 1
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "✅ ALL CHECKS PASSED - STARTING SERVER"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "📋 LOOK FOR THESE LINES IN THE OUTPUT:"
echo "   🔍 Attempting to import Knowledge Graph router..."
echo "   ✅ Knowledge Graph routes registered"
echo ""
echo "Starting in 3 seconds..."
sleep 3

python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
