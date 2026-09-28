@echo off
title Farm2Future Live Public Share Tunnel
echo ========================================================
echo       Farm2Future - Live Public Web Link Tunnel
echo ========================================================
echo.
echo Starting secure Cloudflare Tunnel to port 3000...
echo.
.\cloudflared.exe tunnel --url http://localhost:3000
pause
