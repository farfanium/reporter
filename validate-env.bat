@echo off
setlocal enabledelayedexpansion

REM Environment Validation Script for The Reporter Backend (Windows)
REM This script checks if the environment is properly configured

echo 🔍 Validating The Reporter Backend Environment...
echo.

REM Load environment variables from .env file if it exists
if exist ".env" (
    echo ✅ .env file found
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set "%%a=%%b"
        )
    )
) else (
    echo ⚠️  .env file not found - using defaults
)

REM Set defaults
if "%SPRING_PROFILES_ACTIVE%"=="" set SPRING_PROFILES_ACTIVE=prod
if "%SERVER_PORT%"=="" set SERVER_PORT=8080
if "%NAS_BASE_PATH%"=="" set NAS_BASE_PATH=C:\nas
if "%CONFIG_PATH%"=="" set CONFIG_PATH=.\data\config\reports.yaml

echo 📋 Current Configuration:
echo   SPRING_PROFILES_ACTIVE: %SPRING_PROFILES_ACTIVE%
echo   SERVER_PORT: %SERVER_PORT%
echo   NAS_BASE_PATH: %NAS_BASE_PATH%
echo   CONFIG_PATH: %CONFIG_PATH%
echo.

REM Check Java
echo ☕ Checking Java...
java -version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Java found
    java -version 2>&1 | findstr "version"
) else (
    echo ❌ Java not found. Please install Java 17 or higher.
)

REM Check Gradle
echo.
echo 🔧 Checking Gradle...
if exist "backend\gradlew.bat" (
    echo ✅ Gradle wrapper found
) else (
    echo ❌ Gradle wrapper not found in backend directory
)

REM Check directories
echo.
echo 📁 Checking directories...
if exist "backend" (
    echo ✅ Backend directory exists
) else (
    echo ❌ Backend directory not found
)

if exist "data" (
    echo ✅ Data directory exists
) else (
    echo ⚠️  Data directory not found - will be created during build
)

if exist "data\config" (
    echo ✅ Config directory exists
) else (
    echo ⚠️  Config directory not found - will be created during build
)

REM Check NAS path
echo.
echo 🗂️  Checking NAS path...
if exist "%NAS_BASE_PATH%" (
    echo ✅ NAS base path exists: %NAS_BASE_PATH%
    dir "%NAS_BASE_PATH%" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ NAS base path is accessible
    ) else (
        echo ⚠️  NAS base path is not accessible - check permissions
    )
) else (
    echo ⚠️  NAS base path not found: %NAS_BASE_PATH%
    echo     This may be normal if using a network mount that's not currently connected
)

REM Check config file
echo.
echo ⚙️  Checking configuration...
if exist "%CONFIG_PATH%" (
    echo ✅ Configuration file exists: %CONFIG_PATH%
) else (
    echo ⚠️  Configuration file not found: %CONFIG_PATH%
    echo     Will be created during build with default template
)

REM Check port availability
echo.
echo 🌐 Checking port availability...
netstat -an | findstr ":%SERVER_PORT% " >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port %SERVER_PORT% may be in use
) else (
    echo ✅ Port %SERVER_PORT% appears available
)

REM Build status
echo.
echo 🏗️  Checking build status...
set JAR_FILE=backend\build\libs\backend-0.0.1-SNAPSHOT.jar
if exist "%JAR_FILE%" (
    echo ✅ Built JAR file exists
    for %%i in ("%JAR_FILE%") do echo     Created: %%~ti
) else (
    echo ⚠️  Built JAR file not found - run build first
)

echo.
echo 🎯 Recommendations:

if not exist ".env" (
    echo • Run build-backend.bat to create .env template
)

if not exist "%NAS_BASE_PATH%" (
    echo • Mount your NAS or create test directory: mkdir "%NAS_BASE_PATH%"
)

if not exist "%JAR_FILE%" (
    echo • Build the backend: build-backend.bat
)

echo • Review and customize .env file for your environment
echo • Review and customize %CONFIG_PATH% for your reports

echo.
echo 🚀 Ready to start? Run: run-backend.bat

pause
