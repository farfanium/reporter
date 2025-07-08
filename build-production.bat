@echo off
setlocal enabledelayedexpansion

REM Production Build Script for The Reporter (Windows)
REM This script builds both frontend and backend for production deployment

echo 🚀 Building The Reporter for Production...

REM Create production directories
if not exist "data\config" mkdir data\config
if not exist "data\logs" mkdir data\logs

REM Check if NAS directory exists
if not exist "nas" (
    echo ⚠️  Creating example NAS directory structure...
    mkdir nas\reports
    echo 📁 Please mount your actual NAS directory to .\nas\ before running the application
)

REM Build Backend
echo 📦 Building Backend...
cd backend
call gradlew.bat clean build -x test --no-daemon
if errorlevel 1 (
    echo ❌ Backend build failed
    exit /b 1
) else (
    echo ✅ Backend build completed successfully
)
cd ..

REM Build Frontend
echo 📦 Building Frontend...
cd frontend
call npm ci
if errorlevel 1 (
    echo ❌ Frontend dependency installation failed
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed
    exit /b 1
) else (
    echo ✅ Frontend build completed successfully
)
cd ..

REM Create production environment template
if not exist ".env.production" (
    echo 📝 Creating .env.production template...
    (
        echo # Production Environment Configuration
        echo # Copy this file and customize for your environment
        echo.
        echo # Backend Configuration
        echo SPRING_PROFILES_ACTIVE=prod
        echo NAS_BASE_PATH=C:\nas\reports
        echo CONFIG_PATH=C:\app\config\reports.yaml
        echo LOG_LEVEL=INFO
        echo WEB_LOG_LEVEL=WARN
        echo CORS_ORIGINS=http://localhost:3000,http://localhost
        echo ALLOWED_EXTENSIONS=xlsx,xls,csv,txt,tsv
        echo MAX_FILE_SIZE=50MB
        echo MAX_REQUEST_SIZE=50MB
        echo.
        echo # Frontend Configuration
        echo NODE_ENV=production
        echo NEXT_PUBLIC_API_URL=http://localhost:8080/api
        echo.
        echo # Database ^(if you plan to add one^)
        echo # DATABASE_URL=jdbc:postgresql://localhost:5432/reporter
        echo.
        echo # Security ^(for future enhancements^)
        echo # JWT_SECRET=your-secret-key-here
        echo # ALLOWED_HOSTS=localhost,your-domain.com
    ) > .env.production
)

REM Remove development files from production build
echo 🧹 Cleaning up development files...
if exist "backend\sample-nas" rmdir /s /q backend\sample-nas
if exist "backend\src\main\resources\application.yml.bak" del backend\src\main\resources\application.yml.bak
if exist "backend\build\resources\main\application.yml.bak" del backend\build\resources\main\application.yml.bak

echo.
echo ✅ Production build completed successfully!
echo.
echo 📋 Next steps:
echo 1. Mount your NAS directory to .\nas\
echo 2. Review and customize .env.production
echo 3. Run: start-production.bat
echo 4. Access the application at http://localhost:3000
echo.
echo 🔧 Alternative deployment options:
echo • Manual: start-production.bat
echo • Docker: docker-compose up -d ^(if Docker is installed^)
echo.
echo 📊 Application will be available at:
echo • Frontend: http://localhost:3000
echo • Backend API: http://localhost:8080/api
echo • Health Check: http://localhost:8080/actuator/health

pause
