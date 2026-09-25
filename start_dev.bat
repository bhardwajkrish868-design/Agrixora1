@echo off
title Farm2Future Vite Dev Server (Live Hot Reload)
color 0B
echo ====================================================================
echo      🌿 Farm2Future - Vite Dev Server (Port 5173) 🌿
echo               Powered by Turso Cloud Database (9 GB)
echo ====================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this laptop!
    pause
    exit /b
)

if not exist "node_modules\" (
    echo [SETUP] Installing dependencies...
    call npm install
)

start http://localhost:5173/
npm run dev -- --host --port 5173
pause
