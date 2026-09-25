@echo off
title Farm2Future Live Platform
color 0A
echo ====================================================================
echo      🌿 Farm2Future - Smart Agri Supply Chain Platform 🌿
echo               Powered by Turso Cloud Database (9 GB)
echo ====================================================================
echo.

:: 1. Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this laptop!
    echo Please download and install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b
)

:: 2. Check if dependencies are installed
if not exist "node_modules\" (
    echo [SETUP] Installing project dependencies (first time setup)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed. Please check your internet connection.
        pause
        exit /b
    )
)

:: 3. Check if production dist exists
if not exist "dist\" (
    echo [BUILD] Building production bundle...
    call npm run build
)

echo.
echo [OK] Connecting to Turso Cloud Database...
echo [OK] Starting Server on http://localhost:3000/
echo.

:: 4. Open browser
start http://localhost:3000/

:: 5. Run the live server
node serve_dist.cjs 3000
pause
