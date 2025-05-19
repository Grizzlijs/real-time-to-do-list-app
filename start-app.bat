@echo off
echo ============================================================
echo Real-Time Collaborative To-Do List Application
echo ============================================================
echo.
echo This script will guide you through running the application.
echo.
echo Prerequisites:
echo  - PostgreSQL installed and running
echo  - Node.js and npm installed
echo  - Database already set up (run setup-db.bat if you haven't done so)
echo.
echo Steps to run the application:
echo.
echo 1. Install dependencies (if not already installed):
echo    npm run install-all
echo.
echo 2. Start both server and client:
echo    npm run dev
echo.
echo The application will run on:
echo  - Client: http://localhost:3000
echo  - Server: http://localhost:5000
echo.
echo Press any key to install all dependencies and start the application...
pause > nul

echo.
echo Installing dependencies...
call npm run install-all

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Failed to install dependencies. Please check error messages above.
  echo.
  pause
  exit /b 1
)

echo.
echo Starting the application...
call npm run dev
