# Real-Time Collaborative To-Do List Application

A modern, full-stack to-do list application with real-time collaboration features, nested tasks, drag-and-drop functionality, and more.

## Implemented User Stories

✅ **I as a user can create to-do items, such as a project tasks**
   - Create tasks with titles, descriptions.
   - Organize tasks within multiple lists

✅ **I as another user can collaborate in real-time with user**
   - See other users' changes as they happen
   - Real-time updates when tasks are added, edited, or deleted
   - See who else is viewing the same list

✅ **I as a user can mark to-do items as "done"**
   - Toggle completion status with a checkbox
   - Visual indication for completed tasks

✅ **I as a user can filter the to-do list and view items that were marked as done**
   - Filter by all, active, or completed tasks
   - Easy switching between filter views

✅ **I as a user can add sub-tasks to my to-do items**
   - Create nested subtasks for logical grouping
   - Track progress of grouped tasks


✅ **I as a user can add sub-descriptions of tasks in Markdown**
   - Rich text formatting for task descriptions
   - View rendered Markdown when not editing

✅ **I as a user can create multiple to-do lists where each list has its unique URL**
   - Create and manage separate lists for different purposes
   - Share list URLs with others for collaboration

✅ **I as a user can change the order of tasks via drag & drop**
   - Intuitive drag and drop interface
   - Reorder tasks according to priority or sequence

✅ **I as a user can move/convert subtasks to tasks via drag & drop**
   - Drag tasks between different nesting levels
   - Convert regular tasks to subtasks and vice versa

✅ **I as a user can be sure that my todos will be persisted**
   - Data stored in PostgreSQL database
   - Reliable persistence even after server restarts

## Additional Features

- **Real-time chat functionality**
  - Chat with other users who are viewing the same list
  - See who is typing in real-time

- **Modern UI with theme customization**
  - Clean, responsive design
  - Custom UniFi-inspired theme with carefully selected colors

- **Username customization**
  - Set your display name for collaborative sessions
  - Users represented with different colors for identification


## Tech Stack

### Frontend
- React 18 with TypeScript
- Material UI for components
- Socket.IO client for real-time features
- React Router for navigation
- React Beautiful DND for drag and drop

### Backend
- Node.js with Express
- TypeScript
- Socket.IO for real-time updates
- PostgreSQL database

## Getting Started

1. Clone the repository
2. Set up the database (instructions in server/README.md)
3. Start the server and client applications

### Server Setup

```bash
cd server
npm install
npm run dev
```

### Client Setup

```bash
cd client
npm install
npm start
```

## Database Setup

The application requires a PostgreSQL database. Run the SQL commands in `server/db_setup.sql` to set up the necessary tables and sample data.
