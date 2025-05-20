# Real-Time Collaborative To-Do List: Technical Documentation

## Overview

This application is a modern, real-time collaborative to-do list system built with a React frontend and Node.js backend. It allows users to create, manage, and collaborate on to-do lists in real-time.

## System Architecture

### Frontend (Client)
- **Framework**: React 18 with TypeScript
- **UI Library**: Material UI for components and styling
- **State Management**: React Context API
- **Routing**: React Router
- **Real-time Communication**: Socket.IO Client
- **Additional Libraries**:
  - React Beautiful DND for drag and drop functionality
  - React Markdown for rich text rendering

### Backend (Server)
- **Framework**: Express.js with Node.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Real-time Communication**: Socket.IO
- **API**: RESTful endpoints for CRUD operations

### Communication Flow
1. **REST API**: Used for initial data loading and non-real-time operations
2. **WebSockets**: Used for real-time updates between clients

## Database Schema

### Lists Table
```sql
CREATE TABLE lists (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE,
  task_order INTEGER NOT NULL,
  parent_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
  task_type VARCHAR(50) DEFAULT 'basic',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Key Features Implementation

### Real-time Collaboration

Real-time collaboration is implemented using Socket.IO. Users joining a list are placed in a "room" corresponding to that list's ID. Events like task creation, updates, and deletion are broadcast to all users in that room.

#### Socket Event Flow:
1. User performs an action (e.g., creates a task)
2. Client sends API request to server
3. Server processes request and updates database
4. Server emits socket event to all clients in the list's room
5. Clients receive the event and update their state

### Task Hierarchy and Nesting

Tasks can have subtasks, which can have their own subtasks. This is implemented using a self-referential relationship in the database with the `parent_id` field.

The frontend maintains this hierarchy by:
1. Tracking parent-child relationships
2. Rendering nested components based on these relationships
3. Implementing specialized drag and drop functionality that allows converting tasks to subtasks

### Drag and Drop

Drag and drop functionality is implemented using React Beautiful DND. It allows:
1. Reordering tasks within the same level
2. Moving tasks between different levels (creating subtasks)

### Markdown Support

Task descriptions support Markdown formatting using the React Markdown library. When a task is not being edited, the description is rendered as HTML.

### Special Task Types

The application supports different task types with specialized fields and validation:

#### Task Types
1. **Basic Tasks**
   - Standard task functionality
   - Supports description and completion status
   - Can have subtasks like any other type

2. **Work Tasks**
   - Includes deadline tracking
   - Required field: `deadline` (DATE)
   - Visual indicator: Blue left border
   - Calendar icon with deadline display
   - Validation ensures deadline is set

3. **Food Tasks**
   - Tracks nutritional information
   - Required fields:
     - `carbohydrate` (g/100g)
     - `protein` (g/100g)
     - `fat` (g/100g)
   - Optional: `picture` URL for food image
   - Visual indicator: Green left border
   - Grid layout for nutrition display
   - Image preview if URL provided

#### Implementation Details
- **Form Handling**: Both creation and edit forms validate required fields
- **Type-Safe**: Full TypeScript interfaces for all task types
- **Real-time Updates**: Special fields sync through Socket.IO
- **UI/UX**: 
  - Color-coded borders for quick type identification
  - Collapsible detailed information
  - Type-specific input validation
  - Responsive grid layouts for nutrition data
- **Database**: Specialized columns with appropriate data types
- **API Validation**: Server-side checks for required fields

## WebSocket Events

### Server to Client
- `task-created`: When a task is created
- `task-updated`: When a task is updated
- `task-deleted`: When a task is deleted
- `tasks-reordered`: When tasks are reordered
- `online-users`: List of currently online users
- `chat-message`: New chat message received

### Client to Server
- `join-list`: When a user joins a list
- `leave-list`: When a user leaves a list
- `update-user-info`: When a user updates their info
- `send-chat-message`: When a user sends a chat message

## Performance Considerations

1. **Task Hierarchy**: Deep nesting could impact performance, so we implement optimized rendering with memoization
2. **Real-time Updates**: Updates are targeted to specific lists rather than broadcasting globally
3. **Dragging Performance**: We use virtualization techniques for large lists to maintain smooth drag and drop

## Security Considerations

1. **Input Validation**: All user inputs are validated both client and server-side
2. **SQL Injection Prevention**: Parameterized queries are used for all database operations
3. **WebSocket Authentication**: Socket connections are validated before allowing operations

## Future Enhancements

1. **User Authentication**: Add user accounts and authentication
2. **Offline Support**: Implement offline functionality with sync when connection is restored
3. **List Permissions**: Add owner/editor/viewer permission levels
4. **Task Attachments**: Allow file attachments for tasks
5. **Mobile Apps**: Develop native mobile applications
6. **Task Templates**: Allow saving and reusing task templates
