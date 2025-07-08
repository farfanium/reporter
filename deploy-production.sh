#!/bin/bash

# Production Deployment Script for The Reporter
# This script deploys the application using Docker Compose

set -e

echo "🚀 Deploying The Reporter to Production..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if production build exists
if [ ! -f "backend/build/libs/reporter-backend-0.0.1-SNAPSHOT.jar" ]; then
    echo "⚠️  Backend build not found. Running production build..."
    ./build-production.sh
fi

# Check if NAS directory is mounted
if [ ! -d "nas/reports" ]; then
    echo "⚠️  NAS directory not found. Creating example structure..."
    mkdir -p nas/reports
    echo "📁 Please mount your actual NAS directory to ./nas/ before continuing"
    echo "   Example: ln -s /path/to/your/nas ./nas"
    read -p "Press enter to continue with example directory, or Ctrl+C to exit..."
fi

# Load environment variables if they exist
if [ -f ".env.production" ]; then
    source .env.production
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans

# Build and start containers
echo "🏗️  Building and starting containers..."
docker-compose up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
for i in {1..30}; do
    if curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
        echo "✅ Backend is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend health check failed"
        docker-compose logs backend
        exit 1
    fi
    echo "⏳ Waiting for backend to be ready... ($i/30)"
    sleep 3
done

for i in {1..30}; do
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        echo "✅ Frontend is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Frontend health check failed"
        docker-compose logs frontend
        exit 1
    fi
    echo "⏳ Waiting for frontend to be ready... ($i/30)"
    sleep 3
done

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Application is now running:"
echo "• Frontend: http://localhost:3000"
echo "• Backend API: http://localhost:8080/api"
echo "• Health Check: http://localhost:8080/actuator/health"
echo ""
echo "🔧 Management commands:"
echo "• View logs: docker-compose logs -f"
echo "• Stop services: docker-compose down"
echo "• Restart services: docker-compose restart"
echo "• Update deployment: docker-compose up -d --build"
echo ""
echo "📁 Data directories:"
echo "• Configuration: ./data/config/"
echo "• Logs: ./data/logs/"
echo "• NAS Mount: ./nas/"
