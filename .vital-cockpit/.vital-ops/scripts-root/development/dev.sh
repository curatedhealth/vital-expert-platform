#!/bin/bash
# Development server startup script
# Prevents multiple instances from running

PROJECT_DIR="/Users/hichamnaim/Downloads/Cursor/VITAL path"
PORT=${PORT:-3000}
PID_FILE="$PROJECT_DIR/.dev-server.pid"

# Function to kill existing server
kill_existing() {
  if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
      echo "Stopping existing dev server (PID: $OLD_PID)..."
      kill -9 "$OLD_PID" 2>/dev/null
    fi
    rm "$PID_FILE"
  fi

  # Kill any node processes on the port
  lsof -ti:$PORT | xargs kill -9 2>/dev/null

  # Kill any lingering npm/node dev servers
  pkill -9 -f "npm run dev" 2>/dev/null
  pkill -9 -f "next dev" 2>/dev/null
}

# Main execution
echo "🧹 Cleaning up existing processes..."
kill_existing

echo "🚀 Starting development server on port $PORT..."
cd "$PROJECT_DIR"

# Start the server and save PID
PORT=$PORT npm run dev &
echo $! > "$PID_FILE"

echo "✅ Server started (PID: $(cat $PID_FILE))"
echo "📝 PID saved to $PID_FILE"
echo "🌐 Server should be available at http://localhost:$PORT"
echo ""
echo "To stop: kill -9 \$(cat $PID_FILE) && rm $PID_FILE"
