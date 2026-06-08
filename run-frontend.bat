@echo off
setlocal

REM Launch React frontend dev server for CeylonRoam
cd /d "%~dp0frontend_user"

if not exist package.json (
  echo [ERROR] Could not find frontend_user\package.json
  pause
  exit /b 1
)

echo Starting frontend dev server...
echo URL: http://localhost:3000
echo.

npm start

endlocal
