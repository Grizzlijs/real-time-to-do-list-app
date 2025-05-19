# Real-Time Collaborative To-Do List

A modern, real-time collaborative to-do list application built with PostgreSQL, TypeScript, React, and Node.js.

## Features

✅ **Create to-do items** - Create tasks easily and quickly
✅ **Real-time collaboration** - See changes instantly across all connected users
✅ **Mark items as done** - Keep track of completed tasks
✅ **Filter tasks** - View all, active, or completed tasks
✅ **Multiple lists with unique URLs** - Create and share different lists for different purposes
✅ **Drag & drop reordering** - Change task order seamlessly
✅ **Subtasks** - Create hierarchical task structures
✅ **Cost aggregation** - Track costs and see them aggregated at parent task level
✅ **Rich text descriptions** - Add detailed Markdown descriptions to tasks

## Tech Stack

- **Frontend**: React, TypeScript, Material-UI, React Router
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Real-time Communication**: Socket.IO

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm

### Quick Start (Windows)

For quick setup on Windows, we've included helper scripts:

1. Set up the PostgreSQL database:
   ```
   setup-db.bat
   ```
   This will create the `todo_app` database and initialize the required tables.

2. Start the application:
   ```
   start-app.bat
   ```
   This will install all dependencies and start both the client and server.

### Manual Installation

#### Setting up the database

1. Create a PostgreSQL database:

   ```sql
   CREATE DATABASE todo_app;
   ```

2. Run the initialization script:

   ```bash
   psql -d todo_app -f server/src/db/init.sql
   ```

#### Install all dependencies

1. Install root project dependencies:

   ```bash
   npm install
   ```

2. Install server and client dependencies:

   ```bash
   npm run install-all
   ```

#### Environment Configuration

1. Server `.env` file (create in the `server` directory):

   ```
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:3000

   # PostgreSQL Configuration
   PG_USER=postgres
   PG_PASSWORD=your_password
   PG_HOST=localhost
   PG_PORT=5432
   PG_DATABASE=todo_app
   ```

2. Client `.env` file (create in the `client` directory):

   ```
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

#### Running the Application

Start both server and client with one command:

```bash
npm run dev
```

Or run them separately:

```bash
# Start server only
npm run server

# Start client only
npm run client
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. Create a new to-do list or open an existing one.
3. Share the unique URL with collaborators.
4. Add, edit, reorder, and complete tasks in real-time.

## Deployed Version

[Demo Link] - Coming soon!

## License

This project is licensed under the MIT License.
