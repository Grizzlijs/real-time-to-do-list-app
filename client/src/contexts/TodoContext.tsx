import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Socket } from 'socket.io-client';
import { 
  initSocket,
  getUserInfo, 
  getOnlineUsers, 
  joinList, 
  leaveList, 
  onTaskCreated, 
  onTaskUpdated, 
  onTaskDeleted, 
  onTasksReordered,
  onListDeleted,
  emitListDelete,
  offAllListeners, 
  disconnectSocket 
} from '../services/socket';
import { Task, TodoList } from '../types';
import { deleteList as deleteListApi } from '../services/api';

interface OnlineUser {
  id: string;
  name: string;
  color: string;
}

interface TodoContextType {
  currentList: TodoList | null;
  setCurrentList: (list: TodoList | null) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  loading: boolean;
  error: string | null;
  currentUser: OnlineUser | null;
  onlineUsers: OnlineUser[];
  isSocketConnected: boolean;
  handleDeleteList: (listId: number) => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
};

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentList, setCurrentList] = useState<TodoList | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<OnlineUser | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const listIdRef = useRef<number | null>(null);

  // Initialize socket connection
  useEffect(() => {
    console.log('Initializing socket connection in TodoContext');
    const socket = initSocket();
    socketRef.current = socket;

    const handleConnect = () => {
      console.log('Socket connected, setting up listeners');
      setIsSocketConnected(true);
      const userInfo = getUserInfo();
      if (userInfo) {
        console.log('Setting current user:', userInfo);
        setCurrentUser(userInfo);
      }
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setIsSocketConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Set up online users listener
    getOnlineUsers((users: OnlineUser[]) => {
      console.log('Received online users update in TodoContext:', users);
      if (listIdRef.current) {
        console.log('Received online users update for list', listIdRef.current, ':', users);
        setOnlineUsers(users);
      }
    });

    return () => {
      console.log('Cleaning up socket connection in TodoContext');
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      offAllListeners();
      disconnectSocket();
    };
  }, []);

  // Handle list changes
  useEffect(() => {
    if (currentList) {
      listIdRef.current = currentList.id;
      if (isSocketConnected) {
        console.log('Socket connected, setting up listeners for list ID:', currentList.id);
        joinList(currentList.id);
      } else {
        console.log('Socket not connected, waiting for connection...');
      }
    }

    return () => {
      if (currentList) {
        leaveList(currentList.id);
      }
    };
  }, [currentList?.id, isSocketConnected]);

  // Set up task listeners when list changes
  useEffect(() => {
    if (!currentList || !isSocketConnected) return;

    const handleTaskCreated = (data: { listId: number; task: Task }) => {
      if (data.listId === currentList.id) {
        setTasks(prev => [...prev, data.task]);
      }
    };

    const handleTaskUpdated = (data: { listId: number; task: Task }) => {
      if (data.listId === currentList.id) {
        setTasks(prev => prev.map(t => t.id === data.task.id ? data.task : t));
      }
    };

    const handleTaskDeleted = (data: { listId: number; taskId: number }) => {
      if (data.listId === currentList.id) {
        setTasks(prev => prev.filter(t => t.id !== data.taskId));
      }
    };

    const handleTasksReordered = (data: { listId: number; tasks: Task[] }) => {
      if (data.listId === currentList.id) {
        setTasks(data.tasks);
      }
    };

    onTaskCreated(handleTaskCreated);
    onTaskUpdated(handleTaskUpdated);
    onTaskDeleted(handleTaskDeleted);
    onTasksReordered(handleTasksReordered);

    return () => {
      offAllListeners();
    };
  }, [currentList?.id, isSocketConnected]);

  // Add list deletion handler
  const handleDeleteList = async (listId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // First emit the socket event
      emitListDelete(listId);
      
      // Then call the API to delete the list
      await deleteListApi(listId);
      
      // If the current list is being deleted, clear it
      if (currentList?.id === listId) {
        setCurrentList(null);
        setTasks([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete list');
    } finally {
      setLoading(false);
    }
  };

  // Add list deletion listener
  useEffect(() => {
    if (!isSocketConnected) return;

    const handleListDeleted = (data: { listId: number }) => {
      if (currentList?.id === data.listId) {
        setCurrentList(null);
        setTasks([]);
      }
    };

    onListDeleted(handleListDeleted);

    return () => {
      offAllListeners();
    };
  }, [currentList?.id, isSocketConnected]);

  return (
    <TodoContext.Provider value={{
      currentList,
      setCurrentList,
      tasks,
      setTasks,
      loading,
      error,
      currentUser,
      onlineUsers,
      isSocketConnected,
      handleDeleteList
    }}>
      {children}
    </TodoContext.Provider>
  );
}; 