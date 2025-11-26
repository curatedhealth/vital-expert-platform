#!/bin/bash

# Knowledge Graph Backend Startup Script with Debugging

echo "🔍 Pre-flight checks..."
echo ""

# Check if file exists
if [ -f "src/api/routes/knowledge_graph.py" ]; then
    echo "✅ knowledge_graph.py exists"
    wc -l src/api/routes/knowledge_graph.py
else
    echo "❌ knowledge_graph.py NOT FOUND!"
    exit 1
fi

# Check if file can be imported
echo ""
echo "🔍 Testing import..."
python -c "import sys; sys.path.insert(0, 'src'); from api.routes.knowledge_graph import router; print('✅ Import successful'); print(f'✅ {len(router.routes)} routes found')" 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Import failed!"
    exit 1
fi

echo ""
echo "✅ All pre-flight checks passed!"
echo ""
echo "🚀 Starting server..."
echo "📋 Look for this line: ✅ Knowledge Graph routes registered"
echo ""

# Start server
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000


