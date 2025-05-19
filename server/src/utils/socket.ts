import { Server, Socket } from 'socket.io';
import pool from '../db';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a specific to-do list room
    socket.on('join-list', (listId: string) => {
      const roomName = `list-${listId}`;
      socket.join(roomName);
      console.log(`User ${socket.id} joined list ${listId} (Room: ${roomName})`);
      
      // Log number of clients in this room
      const roomClients = io.sockets.adapter.rooms.get(roomName);
      console.log(`Number of clients in room ${roomName}: ${roomClients ? roomClients.size : 0}`);
    });

    // Leave a specific to-do list room
    socket.on('leave-list', (listId: string) => {
      const roomName = `list-${listId}`;
      socket.leave(roomName);
      console.log(`User ${socket.id} left list ${listId} (Room: ${roomName})`);
    });

    // Handle task creation
    socket.on('task-create', async (data) => {
      try {
        const { listId, task } = data;
        const roomName = `list-${listId}`;
        
        console.log(`Broadcasting task-created event to room ${roomName}:`, {
          task: { id: task.id, title: task.title }
        });
        
        // Broadcast to all clients in the room including the sender
        io.to(roomName).emit('task-created', { listId, task });
      } catch (error) {
        console.error('Error handling task creation via socket:', error);
      }
    });

    // Handle task updates (edit, completion, order)
    socket.on('task-update', async (data) => {
      try {
        const { listId, task } = data;
        const roomName = `list-${listId}`;
        
        console.log(`Broadcasting task-updated event to room ${roomName}:`, {
          task: { id: task.id, title: task.title }
        });
        
        // Broadcast to all clients in the room including the sender
        io.to(roomName).emit('task-updated', { listId, task });
      } catch (error) {
        console.error('Error handling task update via socket:', error);
      }
    });

    // Handle task deletion
    socket.on('task-delete', async (data) => {
      try {
        const { listId, taskId } = data;
        const roomName = `list-${listId}`;
        
        console.log(`Broadcasting task-deleted event to room ${roomName}:`, {
          taskId
        });
        
        // Broadcast to all clients in the room including the sender
        io.to(roomName).emit('task-deleted', { listId, taskId });
      } catch (error) {
        console.error('Error handling task deletion via socket:', error);
      }
    });

    // Handle task reordering (drag & drop)
    socket.on('tasks-reorder', async (data) => {
      try {
        const { listId, tasks } = data;
        const roomName = `list-${listId}`;
        
        console.log(`Broadcasting tasks-reordered event to room ${roomName}:`, {
          taskCount: tasks.length
        });
        
        // Broadcast to all clients in the room including the sender
        io.to(roomName).emit('tasks-reordered', { listId, tasks });
      } catch (error) {
        console.error('Error handling tasks reordering via socket:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
