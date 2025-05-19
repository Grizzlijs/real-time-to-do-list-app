import { Server, Socket } from 'socket.io';
import pool from '../db';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a specific to-do list room
    socket.on('join-list', (listId: string) => {
      socket.join(`list-${listId}`);
      console.log(`User ${socket.id} joined list ${listId}`);
    });

    // Handle task creation
    socket.on('task-create', async (data) => {
      try {
        const { listId, task } = data;
        // Notify all clients in the room about the new task
        io.to(`list-${listId}`).emit('task-created', { listId, task });
      } catch (error) {
        console.error('Error handling task creation via socket:', error);
      }
    });

    // Handle task updates (edit, completion, order)
    socket.on('task-update', async (data) => {
      try {
        const { listId, task } = data;
        // Notify all clients in the room about the task update
        io.to(`list-${listId}`).emit('task-updated', { listId, task });
      } catch (error) {
        console.error('Error handling task update via socket:', error);
      }
    });

    // Handle task deletion
    socket.on('task-delete', async (data) => {
      try {
        const { listId, taskId } = data;
        // Notify all clients in the room about the task deletion
        io.to(`list-${listId}`).emit('task-deleted', { listId, taskId });
      } catch (error) {
        console.error('Error handling task deletion via socket:', error);
      }
    });

    // Handle task reordering (drag & drop)
    socket.on('tasks-reorder', async (data) => {
      try {
        const { listId, tasks } = data;
        // Notify all clients in the room about the task reordering
        io.to(`list-${listId}`).emit('tasks-reordered', { listId, tasks });
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
