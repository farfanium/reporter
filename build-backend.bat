@echo off
setlocal enabledelayedexpansion

REM Backend Build Script for The Reporter (Windows)
REM This script builds the backend with the necessary environment variables

echo 🚀 Building The Reporter Backend...

REM Set environment variables for build (with defaults)
if "%SPRING_PROFILES_ACTIVE%"=="" set SPRING_PROFILES_ACTIVE=prod
if "%SERVER_PORT%"=="" set SERVER_PORT=8080
if "%NAS_BASE_PATH%"=="" set NAS_BASE_PATH=C:\nas
if "%CONFIG_PATH%"=="" set CONFIG_PATH=..\data\config\reports.yaml
if "%LOG_LEVEL%"=="" set LOG_LEVEL=INFO
if "%WEB_LOG_LEVEL%"=="" set WEB_LOG_LEVEL=WARN
if "%CORS_ORIGINS%"=="" set CORS_ORIGINS=http://localhost:3000
if "%ALLOWED_EXTENSIONS%"=="" set ALLOWED_EXTENSIONS=xlsx,xls,csv,txt,tsv
if "%MAX_FILE_SIZE%"=="" set MAX_FILE_SIZE=50MB
if "%MAX_REQUEST_SIZE%"=="" set MAX_REQUEST_SIZE=50MB

echo 📋 Environment Configuration:
echo   SPRING_PROFILES_ACTIVE: %SPRING_PROFILES_ACTIVE%
echo   SERVER_PORT: %SERVER_PORT%
echo   NAS_BASE_PATH: %NAS_BASE_PATH%
echo   CONFIG_PATH: %CONFIG_PATH%
echo   LOG_LEVEL: %LOG_LEVEL%
echo   CORS_ORIGINS: %CORS_ORIGINS%
echo   ALLOWED_EXTENSIONS: %ALLOWED_EXTENSIONS%
echo   MAX_FILE_SIZE: %MAX_FILE_SIZE%
echo.

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "data\config" mkdir data\config
if not exist "data\logs" mkdir data\logs

REM Check if NAS directory exists
if not exist "nas" (
    echo ⚠️  Creating example NAS directory structure...
    mkdir nas\reports
    echo 📁 Please mount your actual NAS directory to .\nas\ before running the application
)

REM Navigate to backend directory
cd backend

REM Check if Gradle wrapper exists
if not exist "gradlew.bat" (
    echo ❌ Gradle wrapper not found. Please ensure you're in the correct directory.
    exit /b 1
)

REM Clean and build
echo 📦 Building Backend...
call gradlew.bat clean build -x test --no-daemon

if errorlevel 1 (
    echo ❌ Backend build failed
    exit /b 1
) else (
    echo ✅ Backend build completed successfully
)

REM Navigate back to root
cd ..

REM Create production config template if it doesn't exist
if not exist "data\config\reports.yaml" (
    echo 📝 Creating configuration template...
    (
        echo # The Reporter Configuration File
        echo # This file defines the report configurations
        echo.
        echo # Example configuration:
        echo # reports:
        echo #   - name: "Monthly Sales Report"
        echo #     path: "/nas/reports/sales"
        echo #     description: "Monthly sales data analysis"
        echo #     enabled: true
        echo #   - name: "Inventory Report"
        echo #     path: "/nas/reports/inventory"
        echo #     description: "Current inventory status"
        echo #     enabled: true
        echo.
        echo reports: []
    ) > data\config\reports.yaml
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file template...
    (
        echo # Backend Environment Configuration
        echo SPRING_PROFILES_ACTIVE=prod
        echo SERVER_PORT=8080
        echo NAS_BASE_PATH=C:\nas
        echo CONFIG_PATH=.\data\config\reports.yaml
        echo LOG_LEVEL=INFO
        echo WEB_LOG_LEVEL=WARN
        echo CORS_ORIGINS=http://localhost:3000
        echo ALLOWED_EXTENSIONS=xlsx,xls,csv,txt,tsv
        echo MAX_FILE_SIZE=50MB
        echo MAX_REQUEST_SIZE=50MB
        echo.
        echo # Windows specific paths ^(uncomment and modify as needed^)
        echo # NAS_BASE_PATH=\\server\share\reports
        echo # CONFIG_PATH=C:\reporter\data\config\reports.yaml
        echo.
        echo # Network storage examples:
        echo # NAS_BASE_PATH=\\nas-server\reports   # Windows UNC path
        echo # NAS_BASE_PATH=Z:\reports             # Mapped network drive
        echo # NAS_BASE_PATH=C:\mnt\nas\reports     # Local mount point
    ) > .env
)

echo.
echo ✅ Backend build completed successfully!
echo.
echo 📋 Next steps:
echo 1. Mount your NAS directory to .\nas\ or update NAS_BASE_PATH in .env
echo 2. Review and customize data\config\reports.yaml
echo 3. Review and customize .env file
echo 4. Run the backend: cd backend ^&^& gradlew.bat bootRun
echo.
echo 📊 Backend will be available at:
echo • API: http://localhost:%SERVER_PORT%/api
echo • Health Check: http://localhost:%SERVER_PORT%/health
echo.
echo 🔧 To run with custom environment:
echo   Load .env variables and run: cd backend ^&^& gradlew.bat bootRun

pause
