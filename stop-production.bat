@echo off
setlocal enabledelayedexpansion

REM Stop Production Services Script (Windows)

echo 🛑 Stopping The Reporter Production Services...

REM Stop backend
if exist "pids\backend.pid" (
    set /p backend_pid=<pids\backend.pid
    echo 🛑 Stopping Backend...
    taskkill /PID !backend_pid! /F >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  Backend process may have already stopped
    ) else (
        echo ✅ Backend stopped
    )
    del pids\backend.pid
) else (
    echo ℹ️  Backend is not running
)

REM Stop frontend
if exist "pids\frontend.pid" (
    set /p frontend_pid=<pids\frontend.pid
    echo 🛑 Stopping Frontend...
    taskkill /PID !frontend_pid! /F >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  Frontend process may have already stopped
    ) else (
        echo ✅ Frontend stopped
    )
    del pids\frontend.pid
) else (
    echo ℹ️  Frontend is not running
)

REM Also kill any remaining java.exe or node.exe processes related to our app
echo 🧹 Cleaning up any remaining processes...
tasklist /fi "imagename eq java.exe" | find "java.exe" >nul
if not errorlevel 1 (
    echo Stopping any remaining Java processes...
    taskkill /f /im java.exe >nul 2>&1
)

tasklist /fi "imagename eq node.exe" | find "node.exe" >nul
if not errorlevel 1 (
    echo Stopping any remaining Node.js processes...
    taskkill /f /im node.exe >nul 2>&1
)

echo.
echo ✅ All services stopped successfully!

pause
