#!/bin/bash

# Check Production Services Status

echo "📊 The Reporter Production Services Status"
echo "=========================================="

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

# Check backend status
if is_running "pids/backend.pid"; then
    echo "✅ Backend: Running (PID: $(cat pids/backend.pid))"
    if curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
        echo "   Health: OK"
    else
        echo "   Health: FAILED"
    fi
else
    echo "❌ Backend: Not running"
fi

# Check frontend status
if is_running "pids/frontend.pid"; then
    echo "✅ Frontend: Running (PID: $(cat pids/frontend.pid))"
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        echo "   Health: OK"
    else
        echo "   Health: FAILED"
    fi
else
    echo "❌ Frontend: Not running"
fi

echo ""
echo "📋 Service URLs:"
echo "• Frontend: http://localhost:3000"
echo "• Backend API: http://localhost:8080/api"
echo "• Health Check: http://localhost:8080/actuator/health"
echo ""
echo "📁 Log Files:"
echo "• Backend: data/logs/backend.log"
echo "• Frontend: data/logs/frontend.log"
echo ""
echo "🔧 Management Commands:"
echo "• Start services: ./start-production.sh"
echo "• Stop services: ./stop-production.sh"
echo "• View logs: tail -f data/logs/backend.log"
