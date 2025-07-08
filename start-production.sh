#!/bin/bash

# Manual Production Deployment Script for The Reporter
# This script runs the application manually without Docker

set -e

echo "🚀 Starting The Reporter in Production Mode..."

# Check if production build exists
if [ ! -f "backend/build/libs/backend-0.0.1-SNAPSHOT.jar" ]; then
    echo "⚠️  Backend build not found. Running production build..."
    ./build-production.sh
fi

# Check if NAS directory is mounted
# if [ ! -d "nas/reports" ]; then
#     echo "⚠️  NAS directory not found. Creating example structure..."
#     mkdir -p nas/reports
#     echo "📁 Please mount your actual NAS directory to ./nas/ before continuing"
#     read -p "Press enter to continue with example directory, or Ctrl+C to exit..."
# fi

# Load environment variables
if [ -f ".env.production" ]; then
    echo "📋 Loading production environment variables..."
    source .env.production
fi

# Set production environment variables
export SPRING_PROFILES_ACTIVE=prod
# export NAS_BASE_PATH=$(pwd)/nas/reports
export NAS_BASE_PATH=/Volumes
export CONFIG_PATH=$(pwd)/data/config/reports.yaml
export LOG_LEVEL=INFO
export WEB_LOG_LEVEL=WARN
export CORS_ORIGINS=http://localhost:3000
export ALLOWED_EXTENSIONS=xlsx,xls,csv,txt,tsv
export MAX_FILE_SIZE=50MB
export MAX_REQUEST_SIZE=50MB

# Frontend environment
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Create necessary directories
mkdir -p data/config data/logs

# Create PID files directory
mkdir -p pids

# Function to start backend
start_backend() {
    echo "🚀 Starting Backend..."
    cd backend
    nohup java -Xmx512m -Xms256m -jar build/libs/backend-0.0.1-SNAPSHOT.jar > ../data/logs/backend.log 2>&1 &
    echo $! > ../pids/backend.pid
    cd ..
    echo "✅ Backend started (PID: $(cat pids/backend.pid))"
}

# Function to start frontend
start_frontend() {
    echo "🚀 Starting Frontend..."
    cd frontend
    nohup npm run start > ../data/logs/frontend.log 2>&1 &
    echo $! > ../pids/frontend.pid
    cd ..
    echo "✅ Frontend started (PID: $(cat pids/frontend.pid))"
}

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

# Stop any existing processes
echo "🛑 Stopping existing processes..."
if is_running "pids/backend.pid"; then
    kill $(cat pids/backend.pid)
    rm -f pids/backend.pid
    echo "✅ Backend stopped"
fi

if is_running "pids/frontend.pid"; then
    kill $(cat pids/frontend.pid)
    rm -f pids/frontend.pid
    echo "✅ Frontend stopped"
fi

# Start services
start_backend

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
for i in {1..30}; do
    if curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
        echo "✅ Backend is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start"
        echo "📋 Check logs: tail -f data/logs/backend.log"
        exit 1
    fi
    sleep 2
done

start_frontend

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to start..."
for i in {1..30}; do
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        echo "✅ Frontend is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Frontend failed to start"
        echo "📋 Check logs: tail -f data/logs/frontend.log"
        exit 1
    fi
    sleep 2
done

echo ""
echo "✅ Production deployment completed successfully!"
echo ""
echo "📊 Application is now running:"
echo "• Frontend: http://localhost:3000"
echo "• Backend API: http://localhost:8080/api"
echo "• Health Check: http://localhost:8080/actuator/health"
echo ""
echo "🔧 Management commands:"
echo "• View backend logs: tail -f data/logs/backend.log"
echo "• View frontend logs: tail -f data/logs/frontend.log"
echo "• Stop services: ./stop-production.sh"
echo "• Check status: ./status-production.sh"
echo ""
echo "📁 Data directories:"
echo "• Configuration: ./data/config/"
echo "• Logs: ./data/logs/"
echo "• NAS Mount: ${NAS_BASE_PATH}/"
echo "• Process IDs: ./pids/"
