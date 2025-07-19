@echo off
setlocal enabledelayedexpansion

REM Run Backend Script for The Reporter (Windows)
REM This script runs the backend with the necessary environment variables

echo 🚀 Starting The Reporter Backend...

REM Load environment variables from .env file if it exists
if exist ".env" (
    echo 📄 Loading environment variables from .env file...
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set "%%a=%%b"
        )
    )
)

REM Set default environment variables if not already set
if "%SPRING_PROFILES_ACTIVE%"=="" set SPRING_PROFILES_ACTIVE=prod
if "%SERVER_PORT%"=="" set SERVER_PORT=8080
if "%NAS_BASE_PATH%"=="" set NAS_BASE_PATH=C:\nas
if "%CONFIG_PATH%"=="" set CONFIG_PATH=.\data\config\reports.yaml
if "%LOG_LEVEL%"=="" set LOG_LEVEL=INFO
if "%WEB_LOG_LEVEL%"=="" set WEB_LOG_LEVEL=WARN
if "%CORS_ORIGINS%"=="" set CORS_ORIGINS=http://localhost:3000
if "%ALLOWED_EXTENSIONS%"=="" set ALLOWED_EXTENSIONS=xlsx,xls,csv,txt,tsv
if "%MAX_FILE_SIZE%"=="" set MAX_FILE_SIZE=50MB
if "%MAX_REQUEST_SIZE%"=="" set MAX_REQUEST_SIZE=50MB

echo 📋 Runtime Configuration:
echo   SPRING_PROFILES_ACTIVE: %SPRING_PROFILES_ACTIVE%
echo   SERVER_PORT: %SERVER_PORT%
echo   NAS_BASE_PATH: %NAS_BASE_PATH%
echo   CONFIG_PATH: %CONFIG_PATH%
echo   LOG_LEVEL: %LOG_LEVEL%
echo.

REM Check if backend directory exists
if not exist "backend" (
    echo ❌ Backend directory not found. Please run this script from the project root.
    exit /b 1
)

REM Check if the JAR file exists
set JAR_FILE=backend\build\libs\backend-0.0.1-SNAPSHOT.jar
if exist "%JAR_FILE%" (
    echo 🏃 Running pre-built JAR file...
    java -jar "%JAR_FILE%"
) else (
    echo 📦 JAR file not found, running with Gradle...
    cd backend
    
    REM Check if Gradle wrapper exists
    if not exist "gradlew.bat" (
        echo ❌ Gradle wrapper not found. Please build the project first.
        exit /b 1
    )
    
    REM Run the application
    call gradlew.bat bootRun
)
