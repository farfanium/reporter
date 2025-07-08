@echo off
setlocal enabledelayedexpansion

REM Check Production Services Status (Windows)

echo 📊 The Reporter Production Services Status
echo ==========================================

REM Check backend status
if exist "pids\backend.pid" (
    set /p backend_pid=<pids\backend.pid
    tasklist /fi "PID eq !backend_pid!" | find "!backend_pid!" >nul
    if not errorlevel 1 (
        echo ✅ Backend: Running (PID: !backend_pid!)
        curl -f http://localhost:8080/actuator/health >nul 2>&1
        if not errorlevel 1 (
            echo    Health: OK
        ) else (
            echo    Health: FAILED
        )
    ) else (
        echo ❌ Backend: Process not found (PID: !backend_pid!)
        del pids\backend.pid
    )
) else (
    echo ❌ Backend: Not running
)

REM Check frontend status
if exist "pids\frontend.pid" (
    set /p frontend_pid=<pids\frontend.pid
    tasklist /fi "PID eq !frontend_pid!" | find "!frontend_pid!" >nul
    if not errorlevel 1 (
        echo ✅ Frontend: Running (PID: !frontend_pid!)
        curl -f http://localhost:3000 >nul 2>&1
        if not errorlevel 1 (
            echo    Health: OK
        ) else (
            echo    Health: FAILED
        )
    ) else (
        echo ❌ Frontend: Process not found (PID: !frontend_pid!)
        del pids\frontend.pid
    )
) else (
    echo ❌ Frontend: Not running
)

echo.
echo 📋 Service URLs:
echo • Frontend: http://localhost:3000
echo • Backend API: http://localhost:8080/api
echo • Health Check: http://localhost:8080/actuator/health
echo.
echo 📁 Log Files:
echo • Backend: data\logs\backend.log
echo • Frontend: data\logs\frontend.log
echo.
echo 🔧 Management Commands:
echo • Start services: start-production.bat
echo • Stop services: stop-production.bat
echo • View logs: type data\logs\backend.log

pause
