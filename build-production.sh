#!/bin/bash

# Production Build Script for The Reporter
# This script builds both frontend and backend for production deployment

set -e

echo "🚀 Building The Reporter for Production..."

# Create production directories
mkdir -p data/config data/logs

# Check if NAS directory exists
if [ ! -d "nas" ]; then
    echo "⚠️  Creating example NAS directory structure..."
    mkdir -p nas/reports
    echo "📁 Please mount your actual NAS directory to ./nas/ before running the application"
fi

# Build Backend
echo "📦 Building Backend..."
cd backend
./gradlew clean build -x test --no-daemon
if [ $? -eq 0 ]; then
    echo "✅ Backend build completed successfully"
else
    echo "❌ Backend build failed"
    exit 1
fi
cd ..

# Build Frontend
echo "📦 Building Frontend..."
cd frontend
npm ci
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend build completed successfully"
else
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

# Create production environment template
if [ ! -f ".env.production" ]; then
    cat > .env.production << 'EOF'
# Production Environment Configuration
# Copy this file and customize for your environment

# Backend Configuration
SPRING_PROFILES_ACTIVE=prod
NAS_BASE_PATH=/nas/reports
CONFIG_PATH=/app/config/reports.yaml
LOG_LEVEL=INFO
WEB_LOG_LEVEL=WARN
CORS_ORIGINS=http://localhost:3000,http://localhost
ALLOWED_EXTENSIONS=xlsx,xls,csv,txt,tsv
MAX_FILE_SIZE=50MB
MAX_REQUEST_SIZE=50MB

# Frontend Configuration
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Database (if you plan to add one)
# DATABASE_URL=jdbc:postgresql://localhost:5432/reporter

# Security (for future enhancements)
# JWT_SECRET=your-secret-key-here
# ALLOWED_HOSTS=localhost,your-domain.com
EOF
    echo "📝 Created .env.production template"
fi

# Remove development files from production build
echo "🧹 Cleaning up development files..."
rm -rf backend/sample-nas
rm -f backend/src/main/resources/application.yml.bak
rm -f backend/build/resources/main/application.yml.bak

echo ""
echo "✅ Production build completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Mount your NAS directory to ./nas/"
echo "2. Review and customize .env.production"
echo "3. Run: docker-compose up -d"
echo "4. Access the application at http://localhost:3000"
echo ""
echo "🔧 Alternative deployment options:"
echo "• Docker: docker-compose up -d"
echo "• Manual: See deployment instructions in README.md"
echo ""
echo "📊 Application will be available at:"
echo "• Frontend: http://localhost:3000"
echo "• Backend API: http://localhost:8080/api"
echo "• Health Check: http://localhost:8080/actuator/health"
