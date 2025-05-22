# Real-Time Collaborative To-Do List Application

**A dynamic, full-stack to-do list application enabling seamless real-time collaboration. Features include nested tasks, intuitive drag-and-drop, diverse task types, integrated chat, and live user presence.**

## Key Features

*   **📝 Versatile Task Management:**
    *   Create specialized tasks: Basic, Work (with deadlines), and Food (with nutritional info & images).
    *   Organize tasks within multiple, uniquely shareable lists.
    *   Add rich Markdown descriptions to tasks.
    *   Mark tasks as "done" and filter by status (all, active, completed).
*   **🤝 Real-Time Collaboration:**
    *   **Live Edits:** See changes from other users instantly as tasks are added, edited, or deleted.
    *   **User Presence:** View who is currently online and active on the same list, with distinct user colors.
    *   **Integrated Chat:** Communicate with collaborators directly within the list view.
*   **✨ Intuitive User Experience:**
    *   **Drag & Drop:** Easily reorder tasks and convert tasks to subtasks (and vice-versa).
    *   **Nested Subtasks:** Structure complex projects with hierarchical to-do items.
    *   **Customizable User Profiles:** Set your display name for collaboration.
*   **💾 Persistent Storage:** All data is reliably saved in a PostgreSQL database.
*   **🎨 Modern UI:** Clean, responsive design built with Material UI.

## Implemented User Stories

✅ **I as a user can create specialized to-do items based on task type**
   - Basic tasks with titles and descriptions.
   - Work tasks with deadline tracking.
   - Food tasks with nutritional information and optional pictures.
   - Organize tasks within multiple lists.

✅ **I as another user can collaborate in real-time with user**
   - See other users' changes as they happen.
   - Real-time updates when tasks are added, edited, or deleted.
   - **View who else is online and on the same list.**
   - **Chat with other users on the same list.**

✅ **I as a user can mark to-do items as "done"**
   - Toggle completion status with a checkbox.
   - Visual indication for completed tasks.

✅ **I as a user can filter the to-do list and view items that were marked as done**
   - Filter by all, active, or completed tasks.
   - Easy switching between filter views.

✅ **I as a user can add sub-tasks to my to-do items**
   - Create nested subtasks for logical grouping.
   - Track progress of grouped tasks.

✅ **I as a user can add sub-descriptions of tasks in Markdown**
   - Rich text formatting for task descriptions.
   - View rendered Markdown when not editing.

✅ **I as a user can create multiple to-do lists where each list has its unique URL**
   - Create and manage separate lists for different purposes.
   - Share list URLs with others for collaboration.

✅ **I as a user can change the order of tasks via drag & drop**
   - Intuitive drag and drop interface.
   - Reorder tasks according to priority or sequence.

✅ **I as a user can move/convert subtasks to tasks via drag & drop**
   - Drag tasks between different nesting levels.
   - Convert regular tasks to subtasks and vice versa.

✅ **I as a user can be sure that my todos will be persisted**
   - Data stored in PostgreSQL database.
   - Reliable persistence.

## Tech Stack

### Frontend
- React 18 with TypeScript
- Material UI for components
- Socket.IO client for real-time features
- React Router for navigation
- `@hello-pangea/dnd` (formerly React Beautiful DND) for drag and drop
- React Markdown for Markdown rendering

### Backend
- Node.js with Express and TypeScript
- Socket.IO for real-time updates
- PostgreSQL database

## Getting Started

### Prerequisites
- Node.js (v16 or later recommended)
- npm (usually comes with Node.js)
- PostgreSQL server installed and running.

### Setup & Running the Application

1.  **Clone the Repository:**
    ```powershell
    git clone <your-repository-url>
    cd real-time-to-do-list-app
    ```

2.  **Install Dependencies:**
    This command will install dependencies for the root, server, and client.
    ```powershell
    npm run install-all
    ```
    *(If you encounter issues with `install-all`, you can install them separately: `npm install` in the root, then `cd server && npm install`, and `cd client && npm install --legacy-peer-deps`)*

3.  **Database Setup:**
    *   Ensure your PostgreSQL server is running.
    *   Create a database (e.g., `todo_app_db`).
    *   **Configure Database Connection:**
        *   Navigate to the `server` directory: `cd server`
        *   Create a `.env` file by copying `.env.example` (if it doesn't exist, create one with the following content):
            ```env
            # server/.env
            PG_USER=postgres
            PG_HOST=localhost
            PG_DATABASE=todo_app
            PG_PASSWORD=your_pw
            PG_PORT=5432
            ```
        *   Replace the placeholder values with your actual PostgreSQL credentials.
    *   **Initialize Database Schema:**
        *   You can use the `setup-db.bat` script (ensure it's configured for your environment or adapt it) OR
        *   Manually execute the SQL commands in `server/db_setup.sql` against your `todo_app_db` database using a PostgreSQL client (like `psql` or pgAdmin). This will create the necessary tables.

4.  **Client Configuration (Optional - for Socket URL):**
    *   If your server runs on a different URL than `http://localhost:5000` during development, you might need to set the `REACT_APP_SOCKET_URL` in the client's environment.
    *   Navigate to the `client` directory: `cd client`
    *   Create a `.env` file:
        ```env
        # client/.env
        REACT_APP_SOCKET_URL=http://localhost:5000 
        ```
        Adjust the URL if your backend server is running elsewhere.

5.  **Start the Application:**
    From the **root** directory (`real-time-to-do-list-app`):
    ```powershell
    npm run dev
    ```
    This will concurrently start both the backend server and the React frontend development server.

    *   The backend server will typically run on `http://localhost:5000` (or the `PORT` specified in `server/.env`).
    *   The client application will typically run on `http://localhost:3000`.

## Project Structure Highlights

-   `/client`: Contains the React frontend application.
    -   `/client/src/components`: Reusable UI components.
    -   `/client/src/context`: React Context for state management (`TodoContext.tsx`).
    -   `/client/src/services`: API and WebSocket service integrations (`api.ts`, `socket.ts`).
-   `/server`: Contains the Node.js Express backend application.
    -   `/server/src/controllers`: Request handlers for API routes.
    -   `/server/src/db`: Database connection and initialization logic.
    -   `/server/src/routes`: API route definitions.
    -   `/server/src/utils/socket.ts`: Server-side WebSocket event handling.
-   `DOCUMENTATION.md`: Detailed technical documentation.
-   `db_setup.sql`: SQL script for initial database schema.

## License
All rights reserved @2025 - emilssamoilovs.com
