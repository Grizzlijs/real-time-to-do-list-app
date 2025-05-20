# Real-Time To-Do List Application (Client)

A modern, collaborative to-do list application with real-time updates and nested tasks.

## Features

- Create and manage multiple to-do lists with unique shareable URLs
- Collaborate in real-time with other users
- Create nested subtasks
- Mark tasks as completed
- Filter tasks by active/completed status
- Drag and drop tasks to reorder them or convert them to subtasks
- Markdown support for task descriptions
- Special task types (work tasks with deadlines, food items with nutritional info)
- Real-time chat with other online users
- Responsive design for mobile and desktop

## Tech Stack

- React 18 with TypeScript
- Material UI for modern UI components
- Socket.io for real-time communication
- React Router for navigation
- React Markdown for rich text rendering
- React Beautiful DND for drag and drop functionality

## Getting Started

### Prerequisites

- Node.js 14.x or later
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the client directory
3. Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm start
```

The application will be available at http://localhost:3000

### Building for Production

Create a production build:

```bash
npm run build
```

The optimized build will be available in the `build` directory.

## Environment Configuration

The client connects to the server using the proxy setting in package.json. Update the proxy value in package.json to point to your server address if needed.
