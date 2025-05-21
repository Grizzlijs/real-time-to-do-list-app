# Real-Time Collaborative To-Do List: Technical Documentation

**Version:** 1.1.0 (Updated: May 21, 2025)

## 1. Overview

This application is a modern, real-time collaborative to-do list system built with a React frontend (TypeScript, Material UI) and a Node.js backend (Express, TypeScript, PostgreSQL). It allows users to create, manage, and collaborate on to-do lists in real-time, featuring nested tasks, drag-and-drop, specialized task types, integrated chat, and live user presence indicators.

## 2. System Architecture

### 2.1. Frontend (Client)
- **Framework**: React 18 with TypeScript
- **UI Library**: Material UI (MUI v5) for components and styling.
- **State Management**: React Context API (`TodoContext` for global state related to lists, tasks, users, and chat).
- **Routing**: React Router (v6+ used, based on `client/package.json` typically `react-router-dom` v6+ for `ListPage` component usage).
- **Real-time Communication**: Socket.IO Client.
- **Drag & Drop**: `@hello-pangea/dnd` (a maintained fork of React Beautiful DND).
- **Markdown Rendering**: `react-markdown`.
- **Build Tool**: Create React App (`react-scripts`).

### 2.2. Backend (Server)
- **Framework**: Express.js with Node.js.
- **Language**: TypeScript.
- **Database**: PostgreSQL.
- **Real-time Communication**: Socket.IO.
- **API**: RESTful endpoints for CRUD operations on lists and tasks.
- **Environment Management**: `dotenv` for loading environment variables (e.g., database credentials, server port).

### 2.3. Communication Flow
1.  **HTTP REST API**: Used for initial data loading (lists, tasks), creating new lists/tasks, and updates that don't require immediate broadcast to all clients (though most data-mutating operations also trigger socket events).
2.  **WebSockets (Socket.IO)**: Used for real-time updates. When a user performs an action (e.g., creates/updates/deletes a task, sends a chat message, updates their user info), the server emits an event to relevant clients (typically those in the same list "room") to update their UI in real-time.

## 3. Database Schema

### 3.1. `lists` Table
```sql
CREATE TABLE lists (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL, -- Used for unique, shareable URLs
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2. `tasks` Table
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  list_id INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT, -- Supports Markdown
  is_completed BOOLEAN DEFAULT FALSE,
  task_order INTEGER NOT NULL, -- For ordering within a list/parent task
  parent_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL, -- For subtasks
  task_type VARCHAR(50) DEFAULT 'basic', -- e.g., 'basic', 'work-task', 'food'
  deadline TIMESTAMP, -- For 'work-task'
  carbohydrate NUMERIC(10,2), -- For 'food' task_type (g/100g)
  protein NUMERIC(10,2),    -- For 'food' task_type (g/100g)
  fat NUMERIC(10,2),        -- For 'food' task_type (g/100g)
  picture VARCHAR(2048),    -- URL for 'food' task_type image
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
*Note: The `db_setup.sql` might need updates to reflect these more detailed columns for `work-task` and `food` types if not already present.* Trigger functions for `updated_at` are also common practice.

## 4. Key Features Implementation Details

### 4.1. Real-time Collaboration
- **Socket.IO Rooms**: Users joining a specific list are added to a Socket.IO room identified by the list's ID. This ensures that updates are scoped to the relevant collaborators.
- **Event-Driven Updates**: Actions like task creation, updates (title, completion, description, type, order, parent), deletion, chat messages, and user info changes trigger socket events broadcast by the server.
- **Client-Side Handling**: The `TodoContext` on the client listens for these events and updates the application state, causing React components to re-render with the new data.

### 4.2. User Presence
- **Connection Tracking**: The server's Socket.IO instance tracks connected clients.
- **User Info Emission**: When a user connects or updates their name/color via `setUserInfo` in `TodoContext` (which calls `socketService.saveUserInfo`), an `update-user-info` event is sent to the server.
- **Server Broadcast**: The server, upon receiving `update-user-info` or handling connections/disconnections, emits `online-users` (a list of all users in a specific list room) and `user-updated` (when a specific user's details change globally) events.
- **Client Display**: Components like `OnlineUsers.tsx` and `Header.tsx` (via `UserProfileButton.tsx`) consume this data from `TodoContext` to display active users and current user information.

### 4.3. Task Hierarchy and Nesting
- **Database Structure**: The `parent_id` column in the `tasks` table creates a self-referential relationship, allowing tasks to be nested under other tasks.
- **Frontend Logic**: `TodoContext` and `TaskList.tsx` manage the hierarchical data. The `getTaskHierarchy` function in `TodoContext` processes the flat list of tasks into a nested structure for rendering.
- **Drag & Drop for Nesting**: Users can drag tasks to become subtasks of other tasks, or promote subtasks to root-level tasks. This updates the `parent_id` and `task_order` accordingly.

### 4.4. Drag and Drop (`@hello-pangea/dnd`)
- **Task Reordering**: Within the same level (root tasks or subtasks of the same parent), tasks can be reordered.
- **Task Reparenting**: Tasks can be dragged into other tasks to become subtasks, or subtasks can be dragged out to become root tasks or subtasks of a different parent.
- **Context Integration**: `TaskList.tsx` and `TaskItem.tsx` implement `Draggable` and `Droppable` components. Drag end events trigger context functions (`reorderTasks`, `updateTaskParent`) which update the backend and emit socket events.

### 4.5. Specialized Task Types
- **`TaskItem.tsx` & `TaskForm.tsx`**: These components handle the rendering and input fields specific to each `task_type` (basic, work-task, food).
- **Conditional Rendering**: UI elements for deadlines, nutritional info, and pictures are shown based on the `task_type`.
- **Data Validation**: Basic client-side validation is present (e.g., deadline for work tasks).
- **Backend Storage**: The `tasks` table includes columns like `deadline`, `carbohydrate`, `protein`, `fat`, and `picture` to store this specialized data.

### 4.6. Chat Functionality
- **Socket Events**: `chat-message` (client to server and server to client).
- **`Chat.tsx`**: Component for displaying messages and sending new ones.
- **`TodoContext.tsx`**: Manages chat messages state and integrates with `socketService` to send and receive messages for the `currentList`.
- **Message Persistence**: Chat history is saved to `localStorage` per list to provide some persistence across sessions for the local user.

## 5. WebSocket Events Reference

### 5.1. Client to Server
-   `join-list (listId: string)`: User joins a specific list's room.
-   `leave-list (listId: string)`: User leaves a list's room.
-   `update-user-info (data: { name: string, color: string })`: User updates their display name or color.
-   `get-online-users`: Client requests the list of online users for the current room.
-   `task-create (data: { listId: number, task: TaskData })`: A new task is created.
-   `task-update (data: { listId: number, task: Task })`: An existing task is updated.
-   `task-delete (data: { listId: number, taskId: number })`: A task is deleted.
-   `tasks-reorder (data: { listId: number, tasks: Task[] })`: Tasks within a list (or sub-level) are reordered.
-   `chat-message (data: { listId: number, message: string })`: User sends a chat message.

### 5.2. Server to Client
-   `online-users (users: OnlineUser[])`: Sent to clients in a room, providing a list of users currently in that list's room. Includes `id`, `name`, `color`, `listId`.
-   `user-updated (user: OnlineUser)`: Broadcast when a user's information (name, color) changes globally. This allows all clients to update their view of that user.
-   `task-created (data: { listId: number, task: Task })`: Notifies clients that a new task has been added.
-   `task-updated (data: { listId: number, task: Task })`: Notifies clients that an existing task has been modified.
-   `task-deleted (data: { listId: number, taskId: number })`: Notifies clients that a task has been removed.
-   `tasks-reordered (data: { listId: number, tasks: Task[] })`: Notifies clients about the new order of tasks.
-   `chat-message (message: ChatMessage)`: Broadcasts a new chat message to clients in the relevant list room. Includes `id`, `text`, `sender: {name, color}`, `timestamp`.
-   `list-deleted (data: { listId: number})`: Notifies clients that a list has been deleted (if implemented).

## 6. Project Structure & Key Files

-   **`README.md`**: Main project overview, setup, and usage instructions.
-   **`DOCUMENTATION.md` (this file)**: In-depth technical details.
-   **`package.json` (root)**: Manages overall project scripts (e.g., `install-all`, `dev`) and root-level dependencies like `concurrently`.
-   **`setup-db.bat` / `server/db_setup.sql`**: Scripts for initializing the PostgreSQL database schema.

### 6.1. Client (`client/`)
-   **`client/package.json`**: Frontend dependencies and scripts (`start`, `build`).
-   **`client/src/index.tsx`**: Main entry point for the React application.
-   **`client/src/App.tsx`**: Root application component, sets up routing.
-   **`client/src/types.ts` (or `client/src/types/index.ts`)**: TypeScript type definitions for frontend data structures (Task, TodoList, User, ChatMessage).
-   **`client/src/context/TodoContext.tsx`**: Centralized state management for tasks, lists, user information, online users, and chat. Handles interactions with `apiService` and `socketService`.
-   **`client/src/services/api.ts`**: Functions for making HTTP requests to the backend REST API.
-   **`client/src/services/socket.ts`**: Manages Socket.IO connection, event emission, and listener registration for real-time updates.
-   **`client/src/components/`**: Contains all React components.
    -   `TaskList.tsx`: Renders the list of tasks, handles drag-and-drop zones.
    -   `TaskItem.tsx`: Renders individual tasks, handles editing, completion, deletion, and subtask display. Optimized with `React.memo` and a custom `areEqual` comparison function.
    -   `Header.tsx`: Application header, includes user profile button and potentially list title.
    -   `UserProfileButton.tsx`: Displays current user info and allows opening the username dialog.
    -   `UsernameDialog.tsx`: Modal for users to set/update their name and color.
    -   `OnlineUsers.tsx`: Displays users currently active in the list.
    -   `Chat.tsx`: Interface for real-time chat.
-   **`client/src/pages/`**: Top-level page components (e.g., `HomePage.tsx`, `ListPage.tsx`).

### 6.2. Server (`server/`)
-   **`server/package.json`**: Backend dependencies and scripts (`dev`, `build`, `start`).
-   **`server/src/index.ts`**: Main entry point for the Express server, sets up middleware, routes, and initializes Socket.IO.
-   **`server/src/utils/socket.ts` (or similar in `index.ts`)**: Server-side Socket.IO event handling logic (joining rooms, broadcasting messages).
-   **`server/src/db/index.ts`**: PostgreSQL database connection pool setup.
-   **`server/src/routes/`**: Defines API endpoints (e.g., `listRoutes.ts`, `taskRoutes.ts`).
-   **`server/src/controllers/`**: Contains the logic for handling requests to API endpoints (e.g., `listController.ts`, `taskController.ts`). Interacts with the database.
-   **`server/src/models/types.ts` (or similar)**: TypeScript types for backend data structures.
-   **`.env` (example in README)**: Stores environment variables like database credentials and server port.

## 7. Performance Optimizations

-   **`React.memo` and Custom Comparison**: `TaskItem.tsx` uses `React.memo` with a custom `areEqual` function to prevent unnecessary re-renders by doing a more granular props comparison, including a deep check for subtasks.
-   **`useCallback` and `useMemo`**: Extensively used throughout the client (e.g., in `TodoContext.tsx`, `TaskList.tsx`) to memoize functions and values, preventing unnecessary re-creations and re-renders of child components.
-   **Targeted Socket.IO Emissions**: Server uses rooms to ensure events are only sent to relevant clients, reducing unnecessary network traffic and client-side processing.
-   **Client-Side State Management**: `TodoContext` efficiently manages state updates to minimize widespread re-renders.
-   **Debouncing/Throttling**: While not explicitly detailed for all features, `ONLINE_USERS_UPDATE_THROTTLE` in `socket.ts` suggests some level of throttling for user list updates (though its current implementation might need review for effectiveness).

## 8. Security Considerations

-   **Input Validation**: Client-side validation for task forms. Server-side validation should also be robustly implemented in controllers for all incoming API data.
-   **SQL Injection Prevention**: Assumed use of parameterized queries or an ORM by the `pg` library if used correctly (e.g., passing values as separate arguments to query functions, not by string concatenation).
-   **Cross-Site Scripting (XSS)**: React inherently helps prevent XSS by escaping string content rendered in JSX. Markdown rendering (`react-markdown`) should be configured securely if it allows HTML.
-   **WebSocket Security**: Socket.IO connections are typically not authenticated by default beyond the initial HTTP handshake. For a production app, adding token-based authentication to WebSocket connections would be crucial.
-   **Environment Variables**: Sensitive information like database credentials and secret keys are stored in `.env` files and not committed to version control.

## 9. Deployment Considerations

### 9.1. Backend
-   Build TypeScript: `npm run build` in the `server` directory.
-   Run compiled JavaScript: `npm start` (uses `node dist/index.js`).
-   Use a process manager like PM2 for production.
-   Set up environment variables on the hosting platform.

### 9.2. Frontend
-   Build static assets: `npm run build` in the `client` directory.
-   Serve the contents of the `client/build` folder using a static web server (Nginx, Apache, or platform-specific services like Vercel, Netlify, AWS S3/CloudFront).
-   Ensure correct proxying or CORS configuration if the client and server are on different domains/ports.

### 9.3. Database
-   Use a managed PostgreSQL service (e.g., AWS RDS, Google Cloud SQL, Heroku Postgres) for reliability, backups, and scaling.

## 10. Known Issues / Areas to Improveme

-   **Error Handling**: While some error handling exists (e.g., `setError` in `TodoContext`), it could be more comprehensive and user-friendly across the application.
-   **Scalability of `getTaskHierarchy`**: For extremely large lists with deep nesting, the client-side hierarchy calculation might become a bottleneck. Consider server-side processing or pagination for very large datasets.
-   **Chat History**: Currently uses `localStorage`, which is limited in size and local to the browser. For a robust solution, chat history should be stored on the server.
-   **Authentication & Authorization**: The application currently lacks user accounts and proper authentication/authorization for lists and tasks. This is a critical feature for a public application.
-   **Testing**: Limited information on testing. Comprehensive unit, integration, and end-to-end tests are needed.
-   **Accessibility (a11y)**: While Material UI provides good defaults, a full accessibility audit would be beneficial.

## 11. Future Enhancements (Ideas to implement if had more time)

-   **Full User Authentication & Authorization**: Implement user sign-up, login, and list/task ownership/permissions.
-   **Notifications**: In-app or browser notifications for important events (e.g., task assignments, mentions).
-   **Task Due Date Reminders**.
-   **Advanced Search & Filtering**.
-   **File Attachments for Tasks**.
-   **Themes/Customization**: More extensive UI theme choices.
-   **Internationalization (i18n)**.
