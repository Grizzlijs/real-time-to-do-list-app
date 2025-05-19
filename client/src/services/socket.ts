import { io, Socket } from 'socket.io-client';
import { Task } from '../types';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket: Socket;

export const initSocket = (): Socket => {
  if (!socket) {
    console.log('Connecting to socket server at:', SOCKET_URL);
    socket = io(SOCKET_URL, { 
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });
    
    socket.on('connect', () => {
      console.log('Socket connected successfully with ID:', socket.id);
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
    
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Socket reconnection attempt #${attemptNumber}`);
    });
    
    socket.on('reconnect_failed', () => {
      console.error('Socket failed to reconnect after multiple attempts');
    });
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    console.log('Socket disconnected');
  }
};

export const joinList = (listId: number | string): void => {
  if (socket) {
    socket.emit('join-list', listId);
  }
};

export const leaveList = (listId: number | string): void => {
  if (socket) {
    socket.emit('leave-list', listId);
  }
};

export const emitTaskCreate = (listId: number, task: Task): void => {
  if (socket) {
    socket.emit('task-create', { listId, task });
  }
};

export const emitTaskUpdate = (listId: number, task: Task): void => {
  if (socket) {
    socket.emit('task-update', { listId, task });
  }
};

export const emitTaskDelete = (listId: number, taskId: number): void => {
  if (socket) {
    socket.emit('task-delete', { listId, taskId });
  }
};

export const emitTasksReorder = (listId: number, tasks: Task[]): void => {
  if (socket) {
    socket.emit('tasks-reorder', { listId, tasks });
  }
};

export const onTaskCreated = (callback: (data: { listId: number; task: Task }) => void): void => {
  if (socket) {
    socket.on('task-created', callback);
  }
};

export const onTaskUpdated = (callback: (data: { listId: number; task: Task }) => void): void => {
  if (socket) {
    socket.on('task-updated', callback);
  }
};

export const onTaskDeleted = (callback: (data: { listId: number; taskId: number }) => void): void => {
  if (socket) {
    socket.on('task-deleted', callback);
  }
};

export const onTasksReordered = (callback: (data: { listId: number; tasks: Task[] }) => void): void => {
  if (socket) {
    socket.on('tasks-reordered', callback);
  }
};

export const offAllListeners = (): void => {
  if (socket) {
    socket.off('task-created');
    socket.off('task-updated');
    socket.off('task-deleted');
    socket.off('tasks-reordered');
  }
};
