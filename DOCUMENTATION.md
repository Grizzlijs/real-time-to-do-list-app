# Real-Time Collaborative To-Do List - Documentation

This documentation provides a comprehensive guide for developers and users of the Real-Time Collaborative To-Do List application.

## Table of Contents

1. [Application Overview](#application-overview)
2. [Architecture](#architecture)
3. [Technologies](#technologies)
4. [API Documentation](#api-documentation)
5. [Database Schema](#database-schema)
6. [Real-Time Features](#real-time-features)
7. [User Guide](#user-guide)
8. [Deployment Guide](#deployment-guide)
9. [Development Guide](#development-guide)
10. [Testing](#testing)
11. [Security Considerations](#security-considerations)
12. [Performance Optimization](#performance-optimization)
13. [Future Enhancements](#future-enhancements)

## Application Overview

The Real-Time Collaborative To-Do List is a modern web application that allows multiple users to create, edit, and manage to-do lists together in real-time. Users can create tasks, organize them hierarchically, track costs, and see instant updates from all collaborators.

### Key Features

- **Real-time collaboration**: All changes sync instantly across users
- **Multiple to-do lists**: Create separate lists with unique shareable URLs
- **Task management**: Create, edit, delete, and mark tasks as complete
- **Hierarchical tasks**: Create subtasks to any depth
- **Cost tracking**: Add costs to tasks and see aggregated totals
- **Drag & drop**: Reorder tasks intuitively
- **Rich text descriptions**: Add formatted text using Markdown
- **Filtering**: View all, active, or completed tasks
- **Persistence**: All data is stored in a PostgreSQL database

## Architecture

The application follows a client-server architecture with real-time communication:

```
┌──────────────┐       WebSockets       ┌──────────────┐
│              │◄─────────────────────►│              │
│  React       │                       │  Node.js     │
│  Frontend    │       REST API        │  Backend     │
│  (Client)    │◄─────────────────────►│  (Server)    │
│              │                       │              │
└──────────────┘                       └──────┬───────┘
                                              │
                                              │
                                       ┌──────▼───────┐
                                       │              │
                                       │  PostgreSQL  │
                                       │  Database    │
                                       │              │
                                       └──────────────┘
```

## Technologies

### Frontend
- **React**: UI library for building component-based interfaces
- **TypeScript**: Typed superset of JavaScript for better code quality
- **Material-UI**: React component library implementing Google's Material Design
- **Socket.IO Client**: Real-time bidirectional event-based communication
- **React Router**: Navigation and routing between pages
- **Context API**: State management across components
- **React Beautiful DND**: Drag and drop functionality

### Backend
- **Node.js**: JavaScript runtime for server-side code
- **Express**: Web application framework for handling HTTP requests
- **TypeScript**: Type-safe JavaScript for server code
- **Socket.IO**: Server-side WebSocket implementation for real-time features
- **PostgreSQL**: Relational database for data persistence
- **pg**: PostgreSQL client for Node.js

## API Documentation

### Lists API

#### Get All Lists
- **Endpoint**: `GET /api/lists`
- **Description**: Returns all to-do lists for the user
- **Response**: Array of list objects

#### Get List by Slug
- **Endpoint**: `GET /api/lists/:slug`
- **Description**: Returns a specific list by its slug
- **Parameters**: `slug` - The unique slug identifier for the list
- **Response**: List object with tasks

#### Create List
- **Endpoint**: `POST /api/lists`
- **Description**: Creates a new to-do list
- **Request Body**: 
  ```json
  {
    "title": "List Title"
  }
  ```
- **Response**: Created list object with slug

#### Update List
- **Endpoint**: `PUT /api/lists/:id`
- **Description**: Updates an existing list
- **Parameters**: `id` - The list ID
- **Request Body**: 
  ```json
  {
    "title": "New List Title"
  }
  ```
- **Response**: Updated list object

#### Delete List
- **Endpoint**: `DELETE /api/lists/:id`
- **Description**: Deletes a list and all its tasks
- **Parameters**: `id` - The list ID
- **Response**: Success message

### Tasks API

#### Get Tasks for List
- **Endpoint**: `GET /api/lists/:listId/tasks`
- **Description**: Returns all tasks for a specific list
- **Parameters**: `listId` - The list ID
- **Response**: Array of task objects

#### Create Task
- **Endpoint**: `POST /api/lists/:listId/tasks`
- **Description**: Creates a new task in the specified list
- **Parameters**: `listId` - The list ID
- **Request Body**:
  ```json
  {
    "title": "Task Title",
    "description": "Task Description",
    "cost": 10.99,
    "parent_id": null
  }
  ```
- **Response**: Created task object

#### Update Task
- **Endpoint**: `PUT /api/tasks/:id`
- **Description**: Updates an existing task
- **Parameters**: `id` - The task ID
- **Request Body**:
  ```json
  {
    "title": "Updated Task Title",
    "description": "Updated Description",
    "cost": 15.99,
    "is_completed": true
  }
  ```
- **Response**: Updated task object

#### Delete Task
- **Endpoint**: `DELETE /api/tasks/:id`
- **Description**: Deletes a task and its subtasks
- **Parameters**: `id` - The task ID
- **Response**: Success message

#### Update Task Order
- **Endpoint**: `PATCH /api/lists/:listId/taskOrder`
- **Description**: Updates the order of tasks in a list
- **Parameters**: `listId` - The list ID
- **Request Body**:
  ```json
  {
    "taskIds": [1, 3, 2, 4]
  }
  ```
- **Response**: Success message

## Database Schema

### Lists Table
```sql
CREATE TABLE lists (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  list_id INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  position INTEGER NOT NULL,
  cost DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Real-Time Features

The application uses Socket.IO to implement real-time collaboration. Here are the main events:

### Server Events (Emitted to clients)
- `task:created`: When a new task is created
- `task:updated`: When a task is updated
- `task:deleted`: When a task is deleted
- `task:reordered`: When task order is changed
- `list:updated`: When a list is updated

### Client Events (Received from clients)
- `join:list`: When a client joins a list room
- `leave:list`: When a client leaves a list room

### Implementation Details

When a user opens a list page, the client:
1. Connects to Socket.IO server
2. Emits a `join:list` event with the list slug
3. Server adds the client to a room named after the list slug
4. Any changes to the list or its tasks are broadcast to all clients in that room

## User Guide

### Creating a To-Do List
1. Navigate to the homepage
2. Click "Create New List"
3. Enter a title for your list
4. Click "Create" to generate your list

### Sharing a List
1. Open the list you want to share
2. Copy the URL from your browser's address bar
3. Send this URL to collaborators
4. When they open the URL, they'll join the same list session

### Managing Tasks
- **Create a task**: Click the "Add Task" button and enter task details
- **Edit a task**: Click on a task title to edit it inline
- **Complete a task**: Click the checkbox next to a task
- **Delete a task**: Click the delete icon on the task
- **Reorder tasks**: Drag tasks using the handle icon
- **Add cost**: Enter a cost in the cost field of a task

### Working with Subtasks
1. Hover over a task and click the "Add Subtask" button
2. Enter the subtask details
3. The cost of the subtask will be added to the parent task's total

### Filtering Tasks
Use the filter buttons at the top of the task list:
- **All**: Shows all tasks
- **Active**: Shows only uncompleted tasks
- **Completed**: Shows only completed tasks

## Deployment Guide

### Prerequisites
- Node.js environment (v14+)
- PostgreSQL database
- Domain name (optional)

### Deployment Steps

1. **Database Setup**
   ```bash
   psql -c "CREATE DATABASE todo_app;"
   psql -d todo_app -f server/src/db/init.sql
   ```

2. **Environment Configuration**
   
   Create a `.env` file in the server directory:
   ```
   NODE_ENV=production
   PORT=5000
   CLIENT_URL=https://yourdomain.com
   
   # PostgreSQL Configuration
   PG_USER=your_db_user
   PG_PASSWORD=your_db_password
   PG_HOST=your_db_host
   PG_PORT=5432
   PG_DATABASE=todo_app
   ```

3. **Build the Client**
   ```bash
   cd client
   npm install
   npm run build
   ```

4. **Start the Server**
   ```bash
   cd server
   npm install
   npm run build
   npm start
   ```

5. **Using a Process Manager (Optional)**
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name todo-app
   ```

6. **Set Up Reverse Proxy (Optional)**
   
   Using Nginx:
   ```
   server {
     listen 80;
     server_name yourdomain.com;
     
     location / {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

## Development Guide

### Setting Up Development Environment

1. Clone the repository
   ```bash
   git clone https://github.com/your-repo/real-time-to-do-list-app.git
   cd real-time-to-do-list-app
   ```

2. Install dependencies
   ```bash
   npm install
   npm run install-all
   ```

3. Set up environment files as described in the README.md

4. Start development servers
   ```bash
   npm run dev
   ```

### Code Structure

- **client/src/components/**: React components
- **client/src/context/**: Context API providers
- **client/src/pages/**: Page components
- **client/src/services/**: API and Socket services
- **server/src/controllers/**: Request handlers
- **server/src/routes/**: API route definitions
- **server/src/db/**: Database connection and queries
- **server/src/utils/**: Utility functions

### Adding a New Feature

1. Define the feature requirements
2. Update database schema if necessary
3. Add server-side endpoints in appropriate controller
4. Add real-time events if needed in socket.ts
5. Implement client-side components and services
6. Test the feature thoroughly

## Testing

### Running Tests

```bash
# Run client tests
cd client
npm test

# Run server tests
cd server
npm test
```

### Testing Strategies
- **Unit Tests**: For individual components and functions
- **Integration Tests**: For API endpoints
- **End-to-End Tests**: For complete user flows

## Security Considerations

- **Input Validation**: All user inputs are validated before processing
- **SQL Injection Prevention**: Using parameterized queries
- **CORS Configuration**: Restricting access to trusted origins
- **Rate Limiting**: Implementing limits to prevent abuse
- **Data Sanitization**: Sanitizing user-generated content

## Performance Optimization

- **Database Indexing**: Key columns are indexed for faster queries
- **Connection Pooling**: Using connection pools for database efficiency
- **Caching**: Implementing client-side caching where appropriate
- **Code Splitting**: Loading components on demand
- **Bundle Optimization**: Minimizing client bundle size

## Future Enhancements

- **User Authentication**: Adding user accounts and authentication
- **List Permissions**: Implementing owner/viewer/editor permissions
- **Offline Support**: Adding offline functionality with sync
- **Mobile App**: Creating native mobile applications
- **Custom Task Types**: Supporting specialized task types
- **Data Export/Import**: Allowing users to export and import lists
- **Notifications**: Adding notification system for task deadlines
- **Dark Mode**: Implementing a dark theme option
