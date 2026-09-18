@echo off
title Farm2Future Platform Runner
echo ========================================================
echo Starting Farm2Future Smart Agricultural Platform...
echo ========================================================
echo.
echo Opening browser at http://localhost:3000/
start http://localhost:3000/
node serve_dist.cjs
pause
