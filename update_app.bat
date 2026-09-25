@echo off
title Farm2Future One-Click Updater
color 0E
echo ====================================================================
echo          🔄 Farm2Future Platform - Automatic Online Updater 🔄
echo ====================================================================
echo.

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [NOTICE] Git is not installed on this machine.
    echo Rebuilding local files and connecting to Turso Cloud...
    call npm run build
    echo [DONE] Local platform refreshed!
    call start_app.bat
    exit /b
)

echo [1/3] Checking for latest updates from online repository...
git pull --rebase 2>nul
if %errorlevel% neq 0 (
    echo [NOTICE] Git remote not configured or no internet connection.
    echo Skipping git pull...
) else (
    echo [OK] Latest code pulled from online repository!
)

echo.
echo [2/3] Checking dependencies...
call npm install --silent

echo.
echo [3/3] Compiling latest production bundle with Turso Cloud...
call npm run build

echo.
echo ====================================================================
echo   🎉 Update Complete! Starting Farm2Future Platform...
echo ====================================================================
echo.
timeout /t 2 >nul
call start_app.bat
