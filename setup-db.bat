@echo off
echo Setting up PostgreSQL database for the Real-Time To-Do List application

echo.
echo Please ensure PostgreSQL is running and you have the necessary permissions.
echo.

set /p PG_USER=Enter PostgreSQL username [postgres]: 
if "%PG_USER%"=="" set PG_USER=postgres

set /p PG_PASSWORD=Enter PostgreSQL password: 
set /p PG_HOST=Enter PostgreSQL host [localhost]: 
if "%PG_HOST%"=="" set PG_HOST=localhost

set /p PG_PORT=Enter PostgreSQL port [5432]: 
if "%PG_PORT%"=="" set PG_PORT=5432

echo.
echo Creating database...

:: Set PGPASSWORD environment variable to avoid password prompt
set PGPASSWORD=%PG_PASSWORD%

:: Create the database and run the initialization script
psql -U %PG_USER% -h %PG_HOST% -p %PG_PORT% -c "CREATE DATABASE todo_app;" postgres

if %ERRORLEVEL% NEQ 0 (
  echo Failed to create database. Please check your PostgreSQL connection details.
  exit /b 1
)

echo Database created successfully.
echo.
echo Running initialization script...

psql -U %PG_USER% -h %PG_HOST% -p %PG_PORT% -d todo_app -f server/src/db/init.sql

if %ERRORLEVEL% NEQ 0 (
  echo Failed to run initialization script.
  exit /b 1
)

echo.
echo Database setup completed successfully!
echo.
echo Now you can run the application with: npm run dev
echo.

:: Clear the password
set PGPASSWORD=
