@echo off
setlocal EnableDelayedExpansion

:: Text formatting
set "BOLD=[1m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

:: Banner
echo %GREEN%%BOLD%
echo =====================================================
echo      Real-Time To-Do List App - Docker Setup
echo =====================================================
echo %NC%

:: Check if Docker is installed
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%Docker is not installed. Please install Docker first.%NC%
    pause
    exit /b 1
)

:: Check if Docker Compose is installed
where docker-compose >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%Docker Compose is not installed. Please install Docker Compose first.%NC%
    pause
    exit /b 1
)

:main_menu
cls
:: Main menu
echo %BOLD%Please select an option:%NC%
echo 1) Start the application (build if needed)
echo 2) Stop the application
echo 3) View logs
echo 4) Rebuild and restart (after code changes)
echo 5) Reset database (WARNING: All data will be lost)
echo 6) Exit
echo.

set /p choice="Enter your choice [1-6]: "

if "%choice%"=="1" (
    echo %YELLOW%Starting the application...%NC%
    docker-compose up -d
    echo %GREEN%Application is running at:%NC%
    echo Frontend: http://localhost
    echo Backend API: http://localhost:5000
    pause
    goto main_menu
)

if "%choice%"=="2" (
    echo %YELLOW%Stopping the application...%NC%
    docker-compose down
    echo %GREEN%Application stopped.%NC%
    pause
    goto main_menu
)

if "%choice%"=="3" (
    goto logs_menu
)

if "%choice%"=="4" (
    echo %YELLOW%Rebuilding and restarting the application...%NC%
    docker-compose down
    docker-compose up -d --build
    echo %GREEN%Application rebuilt and restarted.%NC%
    pause
    goto main_menu
)

if "%choice%"=="5" (
    echo %RED%WARNING: This will delete all your data in the database.%NC%
    set /p confirm="Are you sure you want to proceed? (y/n): "
    if /i "%confirm%"=="y" (
        echo %YELLOW%Resetting database...%NC%
        docker-compose down -v
        docker-compose up -d
        echo %GREEN%Database reset complete. Application restarted.%NC%
    ) else (
        echo Database reset cancelled.
    )
    pause
    goto main_menu
)

if "%choice%"=="6" (
    echo %GREEN%Exiting. Goodbye!%NC%
    exit /b 0
)

echo %RED%Invalid option. Please try again.%NC%
pause
goto main_menu

:logs_menu
cls
echo %BOLD%Which container logs do you want to view?%NC%
echo 1) All containers
echo 2) Frontend (client)
echo 3) Backend (server)
echo 4) Database (postgres)
echo 5) Back to main menu
echo.

set /p log_choice="Enter your choice [1-5]: "

if "%log_choice%"=="1" (
    docker-compose logs
    pause
    goto logs_menu
)

if "%log_choice%"=="2" (
    docker-compose logs client
    pause
    goto logs_menu
)

if "%log_choice%"=="3" (
    docker-compose logs server
    pause
    goto logs_menu
)

if "%log_choice%"=="4" (
    docker-compose logs postgres
    pause
    goto logs_menu
)

if "%log_choice%"=="5" (
    goto main_menu
)

echo %RED%Invalid option. Please try again.%NC%
pause
goto logs_menu
