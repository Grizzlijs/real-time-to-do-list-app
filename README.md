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

Install all project dependencies (root, server, and client) with a single command:

   ```bash
   npm run install-all
   ```

Or install dependencies for each part separately:

1. Install root project dependencies:

   ```bash
   npm install
   ```

2. Install server dependencies:

   ```bash
   cd server && npm install
   ```

3. Install client dependencies:

   ```bash
   cd client && npm install
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

## Implemented User Stories

The following user stories have been implemented in this application:

✅ **I as a user can create to-do items, such as a grocery list** - Core functionality to create tasks
✅ **I as another user can collaborate in real-time with user** - All changes appear instantly across all connected users
✅ **I as a user can mark to-do items as "done"** - Task completion tracking is implemented
✅ **I as a user can filter the to-do list and view items that were marked as done** - Filter by All, Active, or Completed tasks
✅ **I as a user can create multiple to-do lists where each list has its unique URL** - Create and share multiple lists with unique URLs
✅ **I as a user can change the order of tasks via drag & drop** - Reorder tasks using drag and drop functionality
✅ **I as a user can add sub-tasks to my to-do items** - Create hierarchical task structures
✅ **I as a user can specify cost/price for a task or a subtask** - Add cost information to tasks and subtasks
✅ **I as a user can see the sum of the subtasks aggregated in the parent task** - Costs are aggregated from subtasks to parent tasks
✅ **I as a user can add sub-descriptions of tasks in Markdown** - Rich text descriptions using Markdown
✅ **I as a user can be sure that my todos will be persisted** - Data is stored in PostgreSQL database

## License

This project is licensed under the MIT License.
