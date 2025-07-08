#!/bin/bash

# Stop Production Services Script

echo "🛑 Stopping The Reporter Production Services..."

# Function to check if process is running
is_running() {
    if [ -f "$1" ]; then
        local pid=$(cat "$1")
        if kill -0 "$pid" 2>/dev/null; then
            return 0
        else
            rm -f "$1"
            return 1
        fi
    fi
    return 1
}

# Stop backend
if is_running "pids/backend.pid"; then
    echo "🛑 Stopping Backend..."
    kill $(cat pids/backend.pid)
    rm -f pids/backend.pid
    echo "✅ Backend stopped"
else
    echo "ℹ️  Backend is not running"
fi

# Stop frontend
if is_running "pids/frontend.pid"; then
    echo "🛑 Stopping Frontend..."
    kill $(cat pids/frontend.pid)
    rm -f pids/frontend.pid
    echo "✅ Frontend stopped"
else
    echo "ℹ️  Frontend is not running"
fi

echo ""
echo "✅ All services stopped successfully!"
