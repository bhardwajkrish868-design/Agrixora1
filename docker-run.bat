@echo off
title Farm2Future Docker Runner
color 0B
echo ====================================================================
echo         🐳 Farm2Future Platform - Docker Container Runner 🐳
echo               Powered by Turso Cloud Database (9 GB)
echo ====================================================================
echo.

:: 1. Check if Docker CLI is installed
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in PATH!
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b
)

:: 2. Check if Docker daemon is running
echo [CHECK] Checking Docker daemon status...
docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker daemon is not running!
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b
)

echo [OK] Docker daemon is active!
echo [BUILD] Building and starting Farm2Future container...
echo.

:: 3. Run docker compose
docker compose up --build -d
if %errorlevel% neq 0 (
    echo Retrying with legacy docker-compose syntax...
    docker-compose up --build -d
)

echo.
echo ====================================================================
echo   🎉 Farm2Future Container is LIVE!
echo   📍 URL: http://localhost:3000/
echo   ☁️ Database: Turso Cloud (9 GB LibSQL Cloud)
echo ====================================================================
echo.
timeout /t 3 >nul
start http://localhost:3000/
echo Press any key to view container live logs (Ctrl+C to exit logs)...
pause >nul
docker logs -f farm2future-platform
