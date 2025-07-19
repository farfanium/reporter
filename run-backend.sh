#!/bin/bash

# Run Backend Script for The Reporter (macOS/Linux)
# This script runs the backend with the necessary environment variables

set -e  # Exit on any error

echo "🚀 Starting The Reporter Backend..."

# Load environment variables from .env file if it exists
if [ -f ".env" ]; then
    echo "📄 Loading environment variables from .env file..."
    export $(grep -v '^#' .env | xargs)
fi

# Set default environment variables if not already set
export SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-prod}"
export SERVER_PORT="${SERVER_PORT:-8080}"
export NAS_BASE_PATH="${NAS_BASE_PATH:-/Volumes}"
export CONFIG_PATH="${CONFIG_PATH:-./data/config/reports.yaml}"
export LOG_LEVEL="${LOG_LEVEL:-INFO}"
export WEB_LOG_LEVEL="${WEB_LOG_LEVEL:-WARN}"
export CORS_ORIGINS="${CORS_ORIGINS:-http://localhost:3000}"
export ALLOWED_EXTENSIONS="${ALLOWED_EXTENSIONS:-xlsx,xls,csv,txt,tsv}"
export MAX_FILE_SIZE="${MAX_FILE_SIZE:-50MB}"
export MAX_REQUEST_SIZE="${MAX_REQUEST_SIZE:-50MB}"

echo "📋 Runtime Configuration:"
echo "  SPRING_PROFILES_ACTIVE: $SPRING_PROFILES_ACTIVE"
echo "  SERVER_PORT: $SERVER_PORT"
echo "  NAS_BASE_PATH: $NAS_BASE_PATH"
echo "  CONFIG_PATH: $CONFIG_PATH"
echo "  LOG_LEVEL: $LOG_LEVEL"
echo ""

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found. Please run this script from the project root."
    exit 1
fi

# Check if the JAR file exists
JAR_FILE="backend/build/libs/backend-0.0.1-SNAPSHOT.jar"
if [ -f "$JAR_FILE" ]; then
    echo "🏃 Running pre-built JAR file..."
    java -jar "$JAR_FILE"
else
    echo "📦 JAR file not found, running with Gradle..."
    cd backend
    
    # Check if Gradle wrapper exists
    if [ ! -f "./gradlew" ]; then
        echo "❌ Gradle wrapper not found. Please build the project first."
        exit 1
    fi
    
    # Make gradlew executable
    chmod +x ./gradlew
    
    # Run the application
    ./gradlew bootRun
fi
