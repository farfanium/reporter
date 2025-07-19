#!/bin/bash

# Backend Build Script for The Reporter (macOS/Linux)
# This script builds the backend with the necessary environment variables

set -e  # Exit on any error

echo "🚀 Building The Reporter Backend..."

# Set environment variables for build
export SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-prod}"
export SERVER_PORT="${SERVER_PORT:-8080}"
export NAS_BASE_PATH="${NAS_BASE_PATH:-/Volumes}"
export CONFIG_PATH="${CONFIG_PATH:-../data/config/reports.yaml}"
export LOG_LEVEL="${LOG_LEVEL:-INFO}"
export WEB_LOG_LEVEL="${WEB_LOG_LEVEL:-WARN}"
export CORS_ORIGINS="${CORS_ORIGINS:-http://localhost:3000}"
export ALLOWED_EXTENSIONS="${ALLOWED_EXTENSIONS:-xlsx,xls,csv,txt,tsv}"
export MAX_FILE_SIZE="${MAX_FILE_SIZE:-50MB}"
export MAX_REQUEST_SIZE="${MAX_REQUEST_SIZE:-50MB}"

echo "📋 Environment Configuration:"
echo "  SPRING_PROFILES_ACTIVE: $SPRING_PROFILES_ACTIVE"
echo "  SERVER_PORT: $SERVER_PORT"
echo "  NAS_BASE_PATH: $NAS_BASE_PATH"
echo "  CONFIG_PATH: $CONFIG_PATH"
echo "  LOG_LEVEL: $LOG_LEVEL"
echo "  CORS_ORIGINS: $CORS_ORIGINS"
echo "  ALLOWED_EXTENSIONS: $ALLOWED_EXTENSIONS"
echo "  MAX_FILE_SIZE: $MAX_FILE_SIZE"
echo ""

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p data/config
mkdir -p data/logs

# Check if NAS directory exists
if [ ! -d "nas" ]; then
    echo "⚠️  Creating example NAS directory structure..."
    mkdir -p nas/reports
    echo "📁 Please mount your actual NAS directory to ./nas/ before running the application"
fi

# Navigate to backend directory
cd backend

# Check if Gradle wrapper exists
if [ ! -f "./gradlew" ]; then
    echo "❌ Gradle wrapper not found. Please ensure you're in the correct directory."
    exit 1
fi

# Make gradlew executable
chmod +x ./gradlew

# Clean and build
echo "📦 Building Backend..."
./gradlew clean build -x test --no-daemon

if [ $? -eq 0 ]; then
    echo "✅ Backend build completed successfully"
else
    echo "❌ Backend build failed"
    exit 1
fi

# Navigate back to root
cd ..

# Create production config template if it doesn't exist
if [ ! -f "data/config/reports.yaml" ]; then
    echo "📝 Creating configuration template..."
    cat > data/config/reports.yaml << 'EOF'
# The Reporter Configuration File
# This file defines the report configurations

# Example configuration:
# reports:
#   - name: "Monthly Sales Report"
#     path: "/nas/reports/sales"
#     description: "Monthly sales data analysis"
#     enabled: true
#   - name: "Inventory Report"
#     path: "/nas/reports/inventory"
#     description: "Current inventory status"
#     enabled: true

reports: []
EOF
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file template..."
    cat > .env << EOF
# Backend Environment Configuration
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
NAS_BASE_PATH=/Volumes
CONFIG_PATH=./data/config/reports.yaml
LOG_LEVEL=INFO
WEB_LOG_LEVEL=WARN
CORS_ORIGINS=http://localhost:3000
ALLOWED_EXTENSIONS=xlsx,xls,csv,txt,tsv
MAX_FILE_SIZE=50MB
MAX_REQUEST_SIZE=50MB

# macOS specific paths (uncomment and modify as needed)
# NAS_BASE_PATH=/Volumes/YourNASShare
# CONFIG_PATH=/Users/$(whoami)/reporter/data/config/reports.yaml

# Network storage examples:
# NAS_BASE_PATH=/mnt/nas/reports  # Linux NFS mount
# NAS_BASE_PATH=/Volumes/Reports  # macOS SMB/AFP mount
EOF
fi

echo ""
echo "✅ Backend build completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Mount your NAS directory to ./nas/ or update NAS_BASE_PATH in .env"
echo "2. Review and customize data/config/reports.yaml"
echo "3. Review and customize .env file"
echo "4. Run the backend: cd backend && ./gradlew bootRun"
echo ""
echo "📊 Backend will be available at:"
echo "• API: http://localhost:$SERVER_PORT/api"
echo "• Health Check: http://localhost:$SERVER_PORT/health"
echo ""
echo "🔧 To run with custom environment:"
echo "  source .env && cd backend && ./gradlew bootRun"
