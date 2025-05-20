# Real-Time To-Do List Application (Server)

Backend server for the real-time collaborative to-do list application.

## Tech Stack

- Node.js with Express
- TypeScript
- Socket.IO for real-time communication
- PostgreSQL for data persistence

## Features

- RESTful API for to-do list management
- Real-time updates via WebSockets (Socket.IO)
- Database persistence with PostgreSQL
- Support for nested tasks and task hierarchies
- Collaborative features (presence awareness, real-time chat)

## Getting Started

### Prerequisites

- Node.js 14.x or later
- PostgreSQL 12.x or later
- npm or yarn

### Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE todo_app;
```

2. Run the provided setup script:

```bash
psql -d todo_app -f db_setup.sql
```

Alternatively, you can connect to PostgreSQL and run the commands in `db_setup.sql` directly.

### Installation

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies:

```bash
npm install
```

### Environment Configuration

Create a `.env` file in the server directory with the following variables:

```
PORT=5000
CLIENT_URL=http://localhost:3000

# PostgreSQL Configuration
PG_USER=postgres
PG_PASSWORD=your_password
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=todo_app
```

Adjust the values according to your environment.

### Development

Start the development server with hot reloading:

```bash
npm run dev
```

### Production Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## API Endpoints

### Lists

- `GET /api/lists` - Get all lists
- `GET /api/lists/:slug` - Get a list by slug
- `POST /api/lists` - Create a new list
- `PUT /api/lists/:id` - Update a list
- `DELETE /api/lists/:id` - Delete a list

### Tasks

- `GET /api/tasks/:listId` - Get tasks for a list
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `POST /api/tasks/reorder` - Reorder tasks

## Socket.IO Events

The server uses Socket.IO for real-time communication with the client.

### Emitted Events

- `task-created` - When a new task is created
- `task-updated` - When a task is updated
- `task-deleted` - When a task is deleted
- `tasks-reordered` - When tasks are reordered
- `online-users` - List of online users
- `chat-message` - New chat message

### Received Events

- `join-list` - When a user joins a list
- `leave-list` - When a user leaves a list
- `update-user-info` - When a user updates their display name or color
- `send-chat-message` - When a user sends a chat message 