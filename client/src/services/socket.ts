import { io, Socket } from 'socket.io-client';
import { Task } from '../types';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

interface SocketAuth {
  name: string;
  color: string;
}

interface OnlineUser {
  id: string;
  name: string;
  color: string;
}

// Define local storage keys
const USER_NAME_KEY = 'todo_app_username';
const USER_COLOR_KEY = 'todo_app_color';

let socket: Socket | null = null;
let isConnecting = false;
let onlineUsersCallback: ((users: OnlineUser[]) => void) | null = null;
let lastOnlineUsersUpdate = 0;
const ONLINE_USERS_UPDATE_THROTTLE = 1000; // 1 second

// Generate a random color for the user
const generateUserColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB',
    '#E67E22', '#2ECC71', '#1ABC9C', '#F1C40F'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Generate a random name for the user
const generateUserName = () => {
  const adjectives = ['Happy', 'Clever', 'Brave', 'Swift', 'Bright', 'Calm'];
  const nouns = ['Panda', 'Tiger', 'Eagle', 'Dolphin', 'Wolf', 'Fox'];
  const randomNum = Math.floor(Math.random() * 1000);
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${randomNum}`;
};

// Helper functions for user information
export const saveUserInfo = (name: string, color: string): void => {
  try {
    localStorage.setItem(USER_NAME_KEY, name);
    localStorage.setItem(USER_COLOR_KEY, color);
    
    // Update the socket auth if it exists
    if (socket) {
      (socket.auth as SocketAuth).name = name;
      (socket.auth as SocketAuth).color = color;
      
      // Emit user info update event
      if (socket.connected) {
        console.log('Emitting user-info-update:', { name, color });
        socket.emit('user-info-update', { name, color });
      }
    }
    console.log('User info saved to localStorage:', { name, color });
  } catch (e) {
    console.error('Failed to save user info to localStorage:', e);
  }
};

export const getUserInfoFromStorage = (): { name: string; color: string } => {
  try {
    const storedName = localStorage.getItem(USER_NAME_KEY);
    const storedColor = localStorage.getItem(USER_COLOR_KEY);
    return {
      name: storedName || generateUserName(),
      color: storedColor || generateUserColor()
    };
  } catch (e) {
    console.error('Failed to get user info from localStorage:', e);
    return {
      name: generateUserName(),
      color: generateUserColor()
    };
  }
};

export const initSocket = (): Socket => {
  if (!socket && !isConnecting) {
    isConnecting = true;
    console.log('Initializing socket connection to:', SOCKET_URL);
    const userInfo = getUserInfoFromStorage();
    const auth: SocketAuth = {
      name: userInfo.name,
      color: userInfo.color
    };
    
    socket = io(SOCKET_URL, { 
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      timeout: 10000,
      transports: ['websocket'],
      autoConnect: true,
      auth,
      withCredentials: true
    });
    
    socket.on('connect', () => {
      console.log('Socket connected successfully with ID:', socket?.id);
      isConnecting = false;
      // Request initial online users list only if we have a callback
      if (onlineUsersCallback) {
        socket?.emit('get-online-users');
      }
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      isConnecting = false;
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      isConnecting = false;
      if (reason === 'io server disconnect') {
        // Only attempt reconnect if it wasn't a client-side disconnect
        socket?.connect();
      }
    });
    
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Socket reconnection attempt #${attemptNumber}`);
    });
    
    socket.on('reconnect_failed', () => {
      console.error('Socket failed to reconnect after multiple attempts');
      isConnecting = false;
    });
  }

  // Since we're initializing the socket if it doesn't exist, we can safely assert it's not null
  return socket as Socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    console.log('Disconnecting socket');
    isConnecting = false;
    socket.disconnect();
    socket = null;
    onlineUsersCallback = null;
  }
};

export const joinList = (listId: number | string): void => {
  if (socket?.connected) {
    console.log(`Joining list room: ${listId}`);
    socket.emit('join-list', listId);
  } else {
    console.warn('Cannot join list room: Socket not connected');
  }
};

export const leaveList = (listId: number | string): void => {
  if (socket?.connected) {
    console.log(`Leaving list room: ${listId}`);
    socket.emit('leave-list', listId);
  } else {
    console.warn('Cannot leave list room: Socket not connected');
  }
};

export const emitTaskCreate = (listId: number, task: Task): void => {
  if (socket?.connected) {
    console.log(`Emitting task-create for list ${listId}:`, { taskId: task.id });
    socket.emit('task-create', { listId, task });
  } else {
    console.warn('Cannot emit task-create: Socket not connected');
  }
};

export const emitTaskUpdate = (listId: number, task: Task): void => {
  if (socket?.connected) {
    console.log(`Emitting task-update for list ${listId}:`, { taskId: task.id });
    socket.emit('task-update', { listId, task });
  } else {
    console.warn('Cannot emit task-update: Socket not connected');
  }
};

export const emitTaskDelete = (listId: number, taskId: number): void => {
  if (socket?.connected) {
    console.log(`Emitting task-delete for list ${listId}:`, { taskId });
    socket.emit('task-delete', { listId, taskId });
  } else {
    console.warn('Cannot emit task-delete: Socket not connected');
  }
};

export const emitTasksReorder = (listId: number, tasks: Task[]): void => {
  if (socket?.connected) {
    console.log(`Emitting tasks-reorder for list ${listId}:`, { taskCount: tasks.length });
    socket.emit('tasks-reorder', { listId, tasks });
  } else {
    console.warn('Cannot emit tasks-reorder: Socket not connected');
  }
};

export const onTaskCreated = (callback: (data: { listId: number; task: Task }) => void): void => {
  if (socket?.connected) {
    socket.on('task-created', callback);
  }
};

export const onTaskUpdated = (callback: (data: { listId: number; task: Task }) => void): void => {
  if (socket?.connected) {
    socket.on('task-updated', callback);
  }
};

export const onTaskDeleted = (callback: (data: { listId: number; taskId: number }) => void): void => {
  if (socket?.connected) {
    socket.on('task-deleted', callback);
  }
};

export const onTasksReordered = (callback: (data: { listId: number; tasks: Task[] }) => void): void => {
  if (socket?.connected) {
    socket.on('tasks-reordered', callback);
  }
};

export const emitListDelete = (listId: number): void => {
  if (socket?.connected) {
    console.log(`Emitting list-delete for list ${listId}`);
    socket.emit('list-delete', { listId });
  } else {
    console.warn('Cannot emit list-delete: Socket not connected');
  }
};

export const onListDeleted = (callback: (data: { listId: number }) => void): void => {
  if (socket?.connected) {
    socket.on('list-deleted', callback);
  }
};

export const offAllListeners = (): void => {
  if (socket?.connected) {
    console.log('Removing all socket listeners');
    socket.off('task-created');
    socket.off('task-updated');
    socket.off('task-deleted');
    socket.off('tasks-reordered');
    socket.off('list-deleted');
  }
};

// Add new functions for online users
export const getSocket = (): Socket | null => {
  console.log('Getting socket instance:', socket?.id);
  return socket;
};

export const getOnlineUsers = (callback: (users: OnlineUser[]) => void): void => {
  if (socket?.connected) {
    console.log('Setting up online-users listener in socket service');
    onlineUsersCallback = callback;
    
    // Remove any existing listeners first to prevent duplicates
    socket.off('online-users');
    
    // Add the new listener with throttling
    socket.on('online-users', (users: OnlineUser[]) => {
      const now = Date.now();
      if (now - lastOnlineUsersUpdate >= ONLINE_USERS_UPDATE_THROTTLE) {
        console.log('Received online-users event in socket service:', users);
        callback(users);
        lastOnlineUsersUpdate = now;
      }
    });
    
    // Request initial list
    socket.emit('get-online-users');
  } else {
    console.warn('Cannot set up online-users listener: Socket not connected');
  }
};

export const getUserInfo = (): OnlineUser | null => {
  if (!socket) {
    console.warn('Cannot get user info: Socket not initialized');
    return null;
  }
  const auth = socket.auth as SocketAuth;
  const userInfo = {
    id: socket.id || '',
    name: auth.name,
    color: auth.color
  };
  console.log('Current user info in socket service:', userInfo);
  return userInfo;
};

// Add chat message types
export interface ChatMessage {
  id: string;
  text: string;
  sender: {
    name: string;
    color: string;
  };
  timestamp: number;
}

// Chat history storage
const CHAT_HISTORY_PREFIX = 'todo_app_chat_';
const MAX_CHAT_MESSAGES = 100; // Maximum number of messages to store per list

export const getChatHistoryKey = (listId: number | string): string => 
  `${CHAT_HISTORY_PREFIX}${listId}`;

export const saveChatHistory = (listId: number | string, messages: ChatMessage[]): void => {
  try {
    // Only keep up to MAX_CHAT_MESSAGES most recent messages
    const messagesToSave = messages.slice(-MAX_CHAT_MESSAGES);
    localStorage.setItem(getChatHistoryKey(listId), JSON.stringify(messagesToSave));
    console.log(`Saved ${messagesToSave.length} chat messages for list ${listId}`);
  } catch (e) {
    console.error('Failed to save chat history to localStorage:', e);
  }
};

export const loadChatHistory = (listId: number | string): ChatMessage[] => {
  try {
    const history = localStorage.getItem(getChatHistoryKey(listId));
    if (history) {
      const messages = JSON.parse(history) as ChatMessage[];
      console.log(`Loaded ${messages.length} chat messages for list ${listId}`);
      return messages;
    }
    return [];
  } catch (e) {
    console.error('Failed to load chat history from localStorage:', e);
    return [];
  }
};

// Add chat message functions
export const emitChatMessage = (listId: number, message: string): void => {
  if (socket?.connected) {
    console.log(`Emitting chat message for list ${listId}:`, message);
    socket.emit('chat-message', { listId, message });
  } else {
    console.warn('Cannot emit chat message: Socket not connected');
  }
};

export const onChatMessage = (callback: (message: ChatMessage) => void): void => {
  if (socket?.connected) {
    socket.on('chat-message', callback);
  }
};

export const onUserInfoUpdated = (callback: (data: { id: string; name: string; color: string }) => void): void => {
  if (socket?.connected) {
    socket.on('user-info-updated', callback);
  }
};

export const offUserInfoUpdated = (callback: (data: { id: string; name: string; color: string }) => void): void => {
  if (socket?.connected) {
    socket.off('user-info-updated', callback);
  }
};

export const offTaskCreated = (callback: (data: { listId: number; task: Task }) => void): void => {
  if (socket?.connected) {
    socket.off('task-created', callback);
  }
};

export const offTaskUpdated = (callback: (data: { listId: number; task: Task }) => void): void => {
  if (socket?.connected) {
    socket.off('task-updated', callback);
  }
};

export const offTaskDeleted = (callback: (data: { listId: number; taskId: number }) => void): void => {
  if (socket?.connected) {
    socket.off('task-deleted', callback);
  }
};
