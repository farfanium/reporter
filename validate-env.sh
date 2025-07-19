#!/bin/bash

# Environment Validation Script for The Reporter Backend
# This script checks if the environment is properly configured

echo "🔍 Validating The Reporter Backend Environment..."
echo ""

# Load environment variables from .env file if it exists
if [ -f ".env" ]; then
    echo "✅ .env file found"
    export $(grep -v '^#' .env | xargs)
else
    echo "⚠️  .env file not found - using defaults"
fi

# Set defaults
SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-prod}"
SERVER_PORT="${SERVER_PORT:-8080}"
NAS_BASE_PATH="${NAS_BASE_PATH:-/Volumes}"
CONFIG_PATH="${CONFIG_PATH:-./data/config/reports.yaml}"

echo "📋 Current Configuration:"
echo "  SPRING_PROFILES_ACTIVE: $SPRING_PROFILES_ACTIVE"
echo "  SERVER_PORT: $SERVER_PORT"
echo "  NAS_BASE_PATH: $NAS_BASE_PATH"
echo "  CONFIG_PATH: $CONFIG_PATH"
echo ""

# Check Java
echo "☕ Checking Java..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
    echo "✅ Java found: $JAVA_VERSION"
else
    echo "❌ Java not found. Please install Java 17 or higher."
fi

# Check Gradle
echo ""
echo "🔧 Checking Gradle..."
if [ -f "backend/gradlew" ]; then
    echo "✅ Gradle wrapper found"
    chmod +x backend/gradlew
else
    echo "❌ Gradle wrapper not found in backend directory"
fi

# Check directories
echo ""
echo "📁 Checking directories..."
if [ -d "backend" ]; then
    echo "✅ Backend directory exists"
else
    echo "❌ Backend directory not found"
fi

if [ -d "data" ]; then
    echo "✅ Data directory exists"
else
    echo "⚠️  Data directory not found - will be created during build"
fi

if [ -d "data/config" ]; then
    echo "✅ Config directory exists"
else
    echo "⚠️  Config directory not found - will be created during build"
fi

# Check NAS path
echo ""
echo "🗂️  Checking NAS path..."
if [ -d "$NAS_BASE_PATH" ]; then
    echo "✅ NAS base path exists: $NAS_BASE_PATH"
    if [ -r "$NAS_BASE_PATH" ]; then
        echo "✅ NAS base path is readable"
    else
        echo "⚠️  NAS base path is not readable - check permissions"
    fi
else
    echo "⚠️  NAS base path not found: $NAS_BASE_PATH"
    echo "    This may be normal if using a network mount that's not currently connected"
fi

# Check config file
echo ""
echo "⚙️  Checking configuration..."
if [ -f "$CONFIG_PATH" ]; then
    echo "✅ Configuration file exists: $CONFIG_PATH"
    if command -v python3 &> /dev/null; then
        if python3 -c "import yaml; yaml.safe_load(open('$CONFIG_PATH'))" 2>/dev/null; then
            echo "✅ Configuration file is valid YAML"
        else
            echo "⚠️  Configuration file may have syntax errors"
        fi
    fi
else
    echo "⚠️  Configuration file not found: $CONFIG_PATH"
    echo "    Will be created during build with default template"
fi

# Check port availability
echo ""
echo "🌐 Checking port availability..."
if command -v nc &> /dev/null; then
    if nc -z localhost $SERVER_PORT 2>/dev/null; then
        echo "⚠️  Port $SERVER_PORT is already in use"
    else
        echo "✅ Port $SERVER_PORT is available"
    fi
else
    echo "ℹ️  Cannot check port availability (nc not installed)"
fi

# Build status
echo ""
echo "🏗️  Checking build status..."
JAR_FILE="backend/build/libs/backend-0.0.1-SNAPSHOT.jar"
if [ -f "$JAR_FILE" ]; then
    JAR_DATE=$(date -r "$JAR_FILE" "+%Y-%m-%d %H:%M:%S")
    echo "✅ Built JAR file exists (created: $JAR_DATE)"
else
    echo "⚠️  Built JAR file not found - run build first"
fi

echo ""
echo "🎯 Recommendations:"

if [ ! -f ".env" ]; then
    echo "• Run ./build-backend.sh to create .env template"
fi

if [ ! -d "$NAS_BASE_PATH" ]; then
    echo "• Mount your NAS or create test directory: mkdir -p $NAS_BASE_PATH"
fi

if [ ! -f "$JAR_FILE" ]; then
    echo "• Build the backend: ./build-backend.sh"
fi

echo "• Review and customize .env file for your environment"
echo "• Review and customize $CONFIG_PATH for your reports"

echo ""
echo "🚀 Ready to start? Run: ./run-backend.sh"
