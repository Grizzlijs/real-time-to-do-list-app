import { io, Socket } from 'socket.io-client';
import { Task } from '../types';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket: Socket;

export const initSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL);
    console.log('Socket initialized');
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
