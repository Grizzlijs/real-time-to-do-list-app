import { io, Socket } from 'socket.io-client';
import { Task } from '../types';

// Get Socket URL from window.ENV or fallback to .env or default
declare global {
  interface Window {
    ENV?: {
      REACT_APP_SOCKET_URL?: string;
    };
  }
}

const SOCKET_URL = window.ENV?.REACT_APP_SOCKET_URL || process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

interface SocketAuth {
  name: string;
  color: string;
}

interface OnlineUser {
  id: string;
  name: string;
  color: string;
  listId?: string;
}

// Define local storage keys
const USER_NAME_KEY = 'todo_app_username';
const USER_COLOR_KEY = 'todo_app_color';

let socket: Socket | null = null;
let isConnecting = false;
let onlineUsersCallback: ((users: OnlineUser[]) => void) | null = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let lastOnlineUsersUpdate = 0;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ONLINE_USERS_UPDATE_THROTTLE = 1000; // 1 second

let userUpdatedCallback: ((user: OnlineUser) => void) | null = null;

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
      
      // Emit user info update
      socket.emit('update-user-info', { name, color });
    }
  } catch (e) {
    console.error("Failed to save user info:", e);
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
    return {
      name: generateUserName(),
      color: generateUserColor()
    };
  }
};

export const initSocket = (): Socket => {
  if (!socket && !isConnecting) {
    isConnecting = true;
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
      isConnecting = false;
      
      // Update user info on connection
      if (socket) {
        socket.emit('update-user-info', {
          name: auth.name,
          color: auth.color
        });
      }
      
      // Request initial online users list only if we have a callback
      if (onlineUsersCallback) { // This seems to be for a different pattern, getOnlineUsers handles its own emit
        // socket?.emit('get-online-users'); // getOnlineUsers itself emits this.
      }

      // Setup user-updated listener if a callback has been registered
      if (userUpdatedCallback && socket) {
        socket.off('user-updated'); // Ensure no duplicates from previous connection attempts
        socket.on('user-updated', (user: OnlineUser) => {
          if (userUpdatedCallback) {
            userUpdatedCallback(user);
          }
        });
      }
    });
    
    socket.on('connect_error', (error) => {
      isConnecting = false;
    });
    
    socket.on('disconnect', (reason) => {
      isConnecting = false;
      if (reason === 'io server disconnect') {
        // Only attempt reconnect if it wasn't a client-side disconnect
        socket?.connect();
      }
    });
    
    socket.on('reconnect_attempt', (attemptNumber) => {
    });
    
    socket.on('reconnect_failed', () => {
      isConnecting = false;
    });
  }

  // Since we're initializing the socket if it doesn't exist, we can safely assert it's not null
  return socket as Socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    isConnecting = false;
    socket.disconnect();
    socket = null;
    onlineUsersCallback = null;
  }
};

export const joinList = (listId: number | string): void => {
  if (socket?.connected) {
    socket.emit('join-list', String(listId));
  }
};

export const leaveList = (listId: number | string): void => {
  if (socket?.connected) {
    socket.emit('leave-list', String(listId));
  }
};

export const emitTaskCreate = (listId: number, task: Task): void => {
  if (socket?.connected) {
    socket.emit('task-create', { listId, task });
  }
};

export const emitTaskUpdate = (listId: number, task: Task): void => {
  if (socket?.connected) {
    socket.emit('task-update', { listId, task });
  }
};

export const emitTaskDelete = (listId: number, taskId: number): void => {
  if (socket?.connected) {
    socket.emit('task-delete', { listId, taskId });
  }
};

export const emitTasksReorder = (listId: number, tasks: Task[]): void => {
  if (socket?.connected) {
    socket.emit('tasks-reorder', { listId, tasks });
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
    socket.emit('list-delete', { listId });
  }
};

export const onListDeleted = (callback: (data: { listId: number }) => void): void => {
  if (socket?.connected) {
    socket.on('list-deleted', callback);
  }
};

export const offAllListeners = (): void => {
  if (socket?.connected) {
    socket.off('task-created');
    socket.off('task-updated');
    socket.off('task-deleted');
    socket.off('tasks-reordered');
    socket.off('list-deleted');
    // Note: 'online-users' is managed by getOnlineUsers, 'user-updated' by onUserUpdated/offUserUpdated
  }
};

// Add new functions for online users
export const getSocket = (): Socket | null => {
  return socket;
};

export const getOnlineUsers = (callback: (users: OnlineUser[]) => void) => {
  if (!socket) {
    return;
  }

  // Remove any existing listeners to prevent duplicates
  socket.off('online-users');

  // Set up the listener
  socket.on('online-users', (users: OnlineUser[]) => {
    callback(users);
  });

  // Request initial list of online users
  socket.emit('get-online-users');
};

export const getUserInfo = (): OnlineUser | null => {
  if (!socket) {
    return null;
  }
  const auth = socket.auth as SocketAuth;
  const userInfo = {
    id: socket.id || '',
    name: auth.name,
    color: auth.color
  };
  return userInfo;
};

export const onUserUpdated = (callback: (user: OnlineUser) => void): void => {
  userUpdatedCallback = callback;
  if (socket?.connected) {
    socket.off('user-updated'); // Ensure no duplicates
    socket.on('user-updated', (user: OnlineUser) => {
      if (userUpdatedCallback) { // Check callback again inside closure
        userUpdatedCallback(user);
      }
    });
  }
};

export const offUserUpdated = (): void => {
  if (socket) {
    socket.off('user-updated');
  }
  userUpdatedCallback = null;
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
  } catch (e) {
  }
};

export const loadChatHistory = (listId: number | string): ChatMessage[] => {
  try {
    const history = localStorage.getItem(getChatHistoryKey(listId));
    if (history) {
      const messages = JSON.parse(history) as ChatMessage[];
      return messages;
    }
    return [];
  } catch (e) {
    return [];
  }
};

// Add chat message functions
export const emitChatMessage = (listId: number, message: string): void => {
  if (socket?.connected) {
    socket.emit('chat-message', { listId, message });
  }
};

export const onChatMessage = (callback: (message: ChatMessage) => void): void => {
  if (socket?.connected) {
    socket.on('chat-message', callback);
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
