@echo off
setlocal enabledelayedexpansion

REM Manual Production Deployment Script for The Reporter (Windows)
REM This script runs the application manually without Docker

echo 🚀 Starting The Reporter in Production Mode...

REM Check if production build exists
if not exist "backend\build\libs\backend-0.0.1-SNAPSHOT.jar" (
    echo ⚠️  Backend build not found. Running production build...
    call build-production.bat
)

REM Check if NAS directory is mounted
if not exist "nas\reports" (
    echo ⚠️  NAS directory not found. Creating example structure...
    mkdir nas\reports
    echo 📁 Please mount your actual NAS directory to .\nas\ before continuing
    pause
)

REM Load environment variables if they exist
if exist ".env.production" (
    echo 📋 Loading production environment variables...
    for /f "tokens=1,2 delims==" %%a in (.env.production) do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set "%%a=%%b"
        )
    )
)

REM Set production environment variables
set SPRING_PROFILES_ACTIVE=prod
set NAS_BASE_PATH=%cd%\nas\reports
set CONFIG_PATH=%cd%\data\config\reports.yaml
set LOG_LEVEL=INFO
set WEB_LOG_LEVEL=WARN
set CORS_ORIGINS=http://localhost:3000
set ALLOWED_EXTENSIONS=xlsx,xls,csv,txt,tsv
set MAX_FILE_SIZE=50MB
set MAX_REQUEST_SIZE=50MB

REM Frontend environment
set NODE_ENV=production
set NEXT_PUBLIC_API_URL=http://localhost:8080/api

REM Create necessary directories
if not exist "data\config" mkdir data\config
if not exist "data\logs" mkdir data\logs
if not exist "pids" mkdir pids

REM Function to check if process is running
REM (Windows doesn't have functions like bash, so we'll use labels and goto)

REM Stop any existing processes
echo 🛑 Stopping existing processes...
if exist "pids\backend.pid" (
    set /p backend_pid=<pids\backend.pid
    taskkill /PID !backend_pid! /F >nul 2>&1
    del pids\backend.pid
    echo ✅ Backend stopped
)

if exist "pids\frontend.pid" (
    set /p frontend_pid=<pids\frontend.pid
    taskkill /PID !frontend_pid! /F >nul 2>&1
    del pids\frontend.pid
    echo ✅ Frontend stopped
)

REM Start backend
echo 🚀 Starting Backend...
cd backend
start /B java -Xmx512m -Xms256m -jar build\libs\backend-0.0.1-SNAPSHOT.jar > ..\data\logs\backend.log 2>&1

REM Get the PID of the last started process (approximation for Windows)
for /f "tokens=2 delims=," %%a in ('tasklist /fi "imagename eq java.exe" /fo csv ^| find "java.exe"') do (
    set "backend_pid=%%~a"
)
echo !backend_pid! > ..\pids\backend.pid
cd ..
echo ✅ Backend started (PID: !backend_pid!)

REM Wait for backend to be ready
echo ⏳ Waiting for backend to start...
set /a counter=0
:wait_backend
set /a counter+=1
curl -f http://localhost:8080/actuator/health >nul 2>&1
if errorlevel 1 (
    if !counter! lss 30 (
        timeout /t 2 /nobreak >nul
        goto wait_backend
    ) else (
        echo ❌ Backend failed to start
        echo 📋 Check logs: type data\logs\backend.log
        exit /b 1
    )
) else (
    echo ✅ Backend is ready
)

REM Start frontend
echo 🚀 Starting Frontend...
cd frontend
start /B npm run start > ..\data\logs\frontend.log 2>&1

REM Get the PID of the npm process (approximation)
for /f "tokens=2 delims=," %%a in ('tasklist /fi "imagename eq node.exe" /fo csv ^| find "node.exe"') do (
    set "frontend_pid=%%~a"
)
echo !frontend_pid! > ..\pids\frontend.pid
cd ..
echo ✅ Frontend started (PID: !frontend_pid!)

REM Wait for frontend to be ready
echo ⏳ Waiting for frontend to start...
set /a counter=0
:wait_frontend
set /a counter+=1
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    if !counter! lss 30 (
        timeout /t 2 /nobreak >nul
        goto wait_frontend
    ) else (
        echo ❌ Frontend failed to start
        echo 📋 Check logs: type data\logs\frontend.log
        exit /b 1
    )
) else (
    echo ✅ Frontend is ready
)

echo.
echo ✅ Production deployment completed successfully!
echo.
echo 📊 Application is now running:
echo • Frontend: http://localhost:3000
echo • Backend API: http://localhost:8080/api
echo • Health Check: http://localhost:8080/actuator/health
echo.
echo 🔧 Management commands:
echo • View backend logs: type data\logs\backend.log
echo • View frontend logs: type data\logs\frontend.log
echo • Stop services: stop-production.bat
echo • Check status: status-production.bat
echo.
echo 📁 Data directories:
echo • Configuration: .\data\config\
echo • Logs: .\data\logs\
echo • NAS Mount: .\nas\
echo • Process IDs: .\pids\

pause
