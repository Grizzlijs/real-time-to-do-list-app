#!/bin/bash

# Text formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Banner
echo -e "${BOLD}${GREEN}"
echo "====================================================="
echo "     Real-Time To-Do List App - Docker Setup"
echo "====================================================="
echo -e "${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Function to show menu
show_menu() {
    echo -e "${BOLD}Please select an option:${NC}"
    echo "1) Start the application (build if needed)"
    echo "2) Stop the application"
    echo "3) View logs"
    echo "4) Rebuild and restart (after code changes)"
    echo "5) Reset database (WARNING: All data will be lost)"
    echo "6) Exit"
    echo ""
    read -p "Enter your choice [1-6]: " choice
}

# Function to display logs menu
show_logs_menu() {
    echo -e "${BOLD}Which container logs do you want to view?${NC}"
    echo "1) All containers"
    echo "2) Frontend (client)"
    echo "3) Backend (server)"
    echo "4) Database (postgres)"
    echo "5) Back to main menu"
    echo ""
    read -p "Enter your choice [1-5]: " log_choice
    
    case $log_choice in
        1) docker-compose logs -f ;;
        2) docker-compose logs -f client ;;
        3) docker-compose logs -f server ;;
        4) docker-compose logs -f postgres ;;
        5) return ;;
        *) echo -e "${RED}Invalid option. Please try again.${NC}" ;;
    esac
    
    read -p "Press Enter to continue..."
}

# Main loop
while true; do
    show_menu
    
    case $choice in
        1)
            echo -e "${YELLOW}Starting the application...${NC}"
            docker-compose up -d
            echo -e "${GREEN}Application is running at:${NC}"
            echo "Frontend: http://localhost"
            echo "Backend API: http://localhost:5000"
            ;;
        2)
            echo -e "${YELLOW}Stopping the application...${NC}"
            docker-compose down
            echo -e "${GREEN}Application stopped.${NC}"
            ;;
        3)
            show_logs_menu
            ;;
        4)
            echo -e "${YELLOW}Rebuilding and restarting the application...${NC}"
            docker-compose down
            docker-compose up -d --build
            echo -e "${GREEN}Application rebuilt and restarted.${NC}"
            ;;
        5)
            echo -e "${RED}WARNING: This will delete all your data in the database.${NC}"
            read -p "Are you sure you want to proceed? (y/n): " confirm
            if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
                echo -e "${YELLOW}Resetting database...${NC}"
                docker-compose down -v
                docker-compose up -d
                echo -e "${GREEN}Database reset complete. Application restarted.${NC}"
            else
                echo "Database reset cancelled."
            fi
            ;;
        6)
            echo -e "${GREEN}Exiting. Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Please try again.${NC}"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    clear
done
