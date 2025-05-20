import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { TodoList, Task, ChatMessage, TaskUpdateDTO } from '../types';
import * as api from '../services/api';
import * as socketService from '../services/socket';

interface OnlineUser {
  id: string;
  name: string;
  color: string;
  listId?: string;
}

interface TodoContextProps {
  lists: TodoList[];
  currentList: TodoList | null;
  tasks: Task[];
  filteredTasks: Task[];
  filter: 'all' | 'active' | 'completed';
  isLoading: boolean;
  error: string | null;
  onlineUsers: OnlineUser[];
  currentUser: OnlineUser | null;
  messages: ChatMessage[];
  loadLists: () => Promise<void>;
  loadListBySlug: (slug: string) => Promise<void>;
  createNewList: (title: string) => Promise<TodoList>;
  deleteList: (id: number) => Promise<void>;
  createTask: (title: string, parentId?: number | null, cost?: number | null, taskType?: string) => Promise<void>;
  updateTaskCompletion: (taskId: number, isCompleted: boolean) => Promise<void>;
  updateTaskTitle: (taskId: number, title: string) => Promise<void>;
  updateTaskDescription: (taskId: number, description: string) => Promise<void>;
  updateTaskCost: (taskId: number, cost: number | null) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  reorderTasks: (tasks: Task[]) => Promise<void>;
  setFilter: (filter: 'all' | 'active' | 'completed') => void;
  getTaskHierarchy: () => Task[];
  sendChatMessage: (text: string) => void;
  updateTaskParent: (taskId: number, newParentId: number | null) => Promise<void>;
  updateTask: (id: number, updates: TaskUpdateDTO) => Promise<void>;
  addSubtask: (parentId: number, title: string) => Promise<void>;
  chatMessages: ChatMessage[];
  setCurrentList: (list: TodoList) => void;
  createList: (name: string) => Promise<void>;
  updateList: (id: number, name: string) => Promise<void>;
}

const TodoContext = createContext<TodoContextProps | undefined>(undefined);

export const useTodo = (): TodoContextProps => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
};

interface TodoProviderProps {
  children: ReactNode;
}

export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const [lists, setLists] = useState<TodoList[]>([]);
  const [currentList, setCurrentList] = useState<TodoList | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [currentUser, setCurrentUser] = useState<OnlineUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Socket event handlers
  const handleTaskCreated = useCallback((data: { listId: number; task: Task }) => {
    console.log('Received task-created event for list', data.listId, data.task);
    if (currentList && currentList.id === data.listId) {
      setTasks(prevTasks => {
        // Check if task already exists
        const taskExists = prevTasks.some(task => task.id === data.task.id);
        if (taskExists) {
          console.log('Task already exists in state from socket event, skipping update', data.task.id);
          return prevTasks;
        }
        console.log('Adding new task from socket event', data.task);
        return [...prevTasks, data.task];
      });
    }
  }, [currentList]);

  const handleTaskUpdated = useCallback((data: { listId: number; task: Task }) => {
    console.log('Received task-updated event for list', data.listId, data.task);
    if (currentList && currentList.id === data.listId) {
      setTasks(prevTasks => {
        const taskExists = prevTasks.some(task => task.id === data.task.id);
        if (taskExists) {
          console.log('Updating existing task from socket event', data.task);
          // Create a new array to trigger re-render
          const updatedTasks = [...prevTasks];
          const taskIndex = updatedTasks.findIndex(t => t.id === data.task.id);
          if (taskIndex !== -1) {
            // Update the task while preserving its subtasks
            const existingTask = updatedTasks[taskIndex];
            updatedTasks[taskIndex] = {
              ...data.task,
              subtasks: existingTask.subtasks || []
            };
          }
          return updatedTasks;
        }
        console.log('Task not found for update, adding it', data.task.id);
        return [...prevTasks, data.task];
      });
    }
  }, [currentList]);

  const handleTaskDeleted = useCallback((data: { listId: number; taskId: number }) => {
    console.log('Received task-deleted event for list', data.listId, data);
    if (currentList && currentList.id === data.listId) {
      setTasks(prevTasks => {
        const taskExists = prevTasks.some(task => task.id === data.taskId);
        if (taskExists) {
          console.log('Removing task from socket event', data.taskId);
          return prevTasks.filter(task => task.id !== data.taskId);
        }
        console.log('Task already removed, no action needed', data.taskId);
        return prevTasks;
      });
    }
  }, [currentList]);

  // Initialize socket connection when component mounts
  useEffect(() => {
    console.log('Initializing socket connection in TodoContext');
    const socket = socketService.initSocket();
    
    // Wait for socket to connect before setting up listeners
    socket.on('connect', () => {
      console.log('Socket connected, setting up listeners');
      // Set current user info
      const userInfo = socketService.getUserInfo();
      console.log('Setting current user:', userInfo);
      setCurrentUser(userInfo);
      
      // Set up online users listener
      socketService.getOnlineUsers((users: OnlineUser[]) => {
        console.log('Received online users update in TodoContext:', users);
        setOnlineUsers(users);
      });
    });
    
    return () => {
      console.log('Cleaning up socket connection in TodoContext');
      socketService.disconnectSocket();
    };
  }, []); // Empty dependency array to run only once on mount

  // Set up socket event listeners for tasks
  useEffect(() => {
    if (!currentList) return;

    const socket = socketService.getSocket();
    if (!socket?.connected) {
      console.log('Socket not connected, waiting for connection...');
      socket?.on('connect', () => {
        if (currentList) {
          console.log(`Socket connected, setting up listeners for list ID: ${currentList.id}`);
          setupListListeners();
        }
      });
      return;
    }

    setupListListeners();

    function setupListListeners() {
      if (!currentList) return;
      
      // Join list room
      socketService.joinList(currentList.id);

      // Set up online users listener for this specific list
      const socket = socketService.getSocket();
      if (socket) {
        socket.on('online-users', (users: OnlineUser[]) => {
          console.log(`Received online users update for list ${currentList.id}:`, users);
          setOnlineUsers(users);
        });

        // Set up chat message listener
        socket.on('chat-message', (message: ChatMessage) => {
          console.log(`Received chat message for list ${currentList.id}:`, message);
          setMessages(prev => [...prev, message]);
        });
      }

      // Task created by another user
      socketService.onTaskCreated(handleTaskCreated);
      socketService.onTaskUpdated(handleTaskUpdated);
      socketService.onTaskDeleted(handleTaskDeleted);

      // Task updated by another user
      socketService.onTaskUpdated(({ listId, task }) => {
        console.log(`Received task-updated event for list ${listId}`, task);
        if (currentList && currentList.id === Number(listId)) {
          setTasks(prevTasks => {
            const taskExists = prevTasks.some(t => t.id === task.id);
            if (!taskExists) {
              console.log('Task not found for update, adding it', task);
              return [...prevTasks, task];
            }
            console.log('Updating existing task from socket event', task);
            const updatedTasks = prevTasks.map(t => {
              if (t.id === task.id) {
                console.log('Updating task:', { old: t, new: task });
                return { ...t, ...task };
              }
              return t;
            });
            console.log('Updated tasks array:', updatedTasks);
            return updatedTasks;
          });
        }
      });

      // Task deleted by another user
      socketService.onTaskDeleted(({ listId, taskId }) => {
        console.log(`Received task-deleted event for list ${listId}, taskId: ${taskId}`);
        if (currentList && currentList.id === Number(listId)) {
          setTasks(prevTasks => {
            const taskExists = prevTasks.some(t => t.id === taskId);
            if (!taskExists) {
              console.log('Task already removed, no action needed', taskId);
              return prevTasks;
            }
            console.log('Removing task from socket event', taskId);
            const updatedTasks = prevTasks.filter(t => t.id !== taskId);
            console.log('Updated tasks array:', updatedTasks);
            return updatedTasks;
          });
        }
      });

      // Tasks reordered by another user
      socketService.onTasksReordered(({ listId, tasks: updatedTasks }) => {
        console.log(`Received tasks-reordered event for list ${listId}`, { count: updatedTasks.length });
        if (currentList && currentList.id === Number(listId)) {
          console.log('Updating tasks order from socket event');
          setTasks(prevTasks => {
            // Create a map of existing tasks for quick lookup
            const taskMap = new Map(prevTasks.map(t => [t.id, t]));
            
            // Update tasks with new order while preserving any local changes
            const newTasks = updatedTasks.map(task => {
              const existingTask = taskMap.get(task.id);
              if (existingTask) {
                return { ...existingTask, ...task };
              }
              return task;
            });
            console.log('Updated tasks array:', newTasks);
            return newTasks;
          });
        }
      });
    }

    return () => {
      if (currentList) {
        console.log(`Cleaning up socket listeners for list ID: ${currentList.id}`);
        socketService.leaveList(currentList.id);
        const socket = socketService.getSocket();
        if (socket) {
          socket.off('online-users');
          socket.off('chat-message');
        }
        socketService.offAllListeners();
        setMessages([]); // Clear messages when leaving a list
      }
      // Clean up socket event listeners
      socketService.offTaskCreated(handleTaskCreated);
      socketService.offTaskUpdated(handleTaskUpdated);
      socketService.offTaskDeleted(handleTaskDeleted);
    };
  }, [currentList?.id, handleTaskCreated, handleTaskUpdated, handleTaskDeleted]);

  // Calculate filtered tasks based on filter state
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'active') return !task.is_completed;
    if (filter === 'completed') return task.is_completed;
    return true;
  });

  // Load all todo lists
  const loadLists = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getLists();
      setLists(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load lists:', err);
      setError('Failed to load lists');
      setIsLoading(false);
    }
  }, []);

  // Load a specific list by slug and its tasks
  const loadListBySlug = useCallback(async (slug: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await api.getListBySlug(slug);
      setCurrentList(list);

      // Load tasks for the list
      const listTasks = await api.getTasksByList(list.id);
      setTasks(listTasks);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load list:', err);
      setError('Failed to load list');
      setIsLoading(false);
    }
  }, []);

  // Create a new list
  const createNewList = async (title: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newList = await api.createList({ title });
      setLists(prevLists => [...prevLists, newList]);
      setIsLoading(false);
      return newList;
    } catch (err) {
      console.error('Failed to create list:', err);
      setError('Failed to create list');
      setIsLoading(false);
      throw err;
    }
  };

  // Delete a list
  const deleteList = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.deleteList(id);
      setLists(prevLists => prevLists.filter(list => list.id !== id));
      if (currentList && currentList.id === id) {
        setCurrentList(null);
        setTasks([]);
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to delete list:', err);
      setError('Failed to delete list');
      setIsLoading(false);
    }
  };

  // Create a new task
  const createTask = async (title: string, parentId?: number | null, cost?: number | null, taskType?: string) => {
    if (!currentList) return;
    
    // Don't set global loading state which would trigger full page refresh
    // setIsLoading(true);
    setError(null);
    try {
      const taskData = {
        title,
        list_id: currentList.id,
        parent_id: parentId || null,
        cost: cost || null,
        task_type: taskType || 'basic',
      };
      
      // Make the API call
      const newTask = await api.createTask(taskData);
      
      // Update local state with a new array reference to trigger re-render
      setTasks(prevTasks => {
        // Check if task already exists
        const taskExists = prevTasks.some(task => task.id === newTask.id);
        if (taskExists) {
          console.log('Task already exists in state, skipping update', newTask.id);
          return prevTasks;
        }

        const updatedTasks = [...prevTasks];
        
        if (parentId) {
          // Update parent task's subtasks
          const parentIndex = updatedTasks.findIndex(task => task.id === parentId);
          if (parentIndex !== -1) {
            const parentTask = { ...updatedTasks[parentIndex] };
            if (!parentTask.subtasks) {
              parentTask.subtasks = [];
            }
            parentTask.subtasks.push(newTask);
            updatedTasks[parentIndex] = parentTask;
          }
        } else {
          // Add as root task
          updatedTasks.push(newTask);
        }
        
        return updatedTasks;
      });
      
      // Don't set global loading state
      // setIsLoading(false);
    } catch (err) {
      console.error('Failed to create task:', err);
      setError('Failed to create task');
      
      // Don't set global loading state
      // setIsLoading(false);
    }
  };

  // Update task completion status
  const updateTaskCompletion = async (taskId: number, isCompleted: boolean) => {
    if (!currentList) return;
    
    setError(null);
    try {
      // Optimistically update UI
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, is_completed: isCompleted } : task
        )
      );
      
      // Update on server
      const updatedTask = await api.updateTask(taskId, { is_completed: isCompleted });
      
      // Emit socket event
      socketService.emitTaskUpdate(currentList.id, updatedTask);
    } catch (err) {
      console.error('Failed to update task completion:', err);
      setError('Failed to update task');
      
      // Revert optimistic update on failure
      setTasks(prevTasks => [...prevTasks]); // Trigger re-render
      loadListBySlug(currentList.slug); // Reload from server
    }
  };

  // Update task title
  const updateTaskTitle = async (taskId: number, title: string) => {
    if (!currentList || !title.trim()) return;
    
    setError(null);
    try {
      // Optimistically update UI
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, title } : task
        )
      );
      
      // Update on server
      const updatedTask = await api.updateTask(taskId, { title });
      
      // Emit socket event
      socketService.emitTaskUpdate(currentList.id, updatedTask);
    } catch (err) {
      console.error('Failed to update task title:', err);
      setError('Failed to update task');
      
      // Revert optimistic update on failure
      loadListBySlug(currentList.slug);
    }
  };

  // Update task description
  const updateTaskDescription = async (taskId: number, description: string) => {
    if (!currentList) return;
    
    setError(null);
    try {
      // Optimistically update UI
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, description } : task
        )
      );
      
      // Update on server
      const updatedTask = await api.updateTask(taskId, { description });
      
      // Emit socket event
      socketService.emitTaskUpdate(currentList.id, updatedTask);
    } catch (err) {
      console.error('Failed to update task description:', err);
      setError('Failed to update task');
      
      // Revert optimistic update on failure
      loadListBySlug(currentList.slug);
    }
  };

  // Update task cost
  const updateTaskCost = async (taskId: number, cost: number | null) => {
    if (!currentList) return;
    
    setError(null);
    try {
      // Optimistically update UI
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, cost } : task
        )
      );
      
      // Update on server
      const updatedTask = await api.updateTask(taskId, { cost });
      
      // Emit socket event
      socketService.emitTaskUpdate(currentList.id, updatedTask);
    } catch (err) {
      console.error('Failed to update task cost:', err);
      setError('Failed to update task');
      
      // Revert optimistic update on failure
      loadListBySlug(currentList.slug);
    }
  };

  // Delete a task
  const deleteTask = async (taskId: number) => {
    if (!currentList) return;
    
    setError(null);
    try {
      // Optimistically update UI
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      // Delete on server
      await api.deleteTask(taskId);
      
      // Emit socket event
      socketService.emitTaskDelete(currentList.id, taskId);
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('Failed to delete task');
      
      // Revert optimistic update on failure
      loadListBySlug(currentList.slug);
    }
  };

  // Create a hierarchical task structure with subtasks
  const getTaskHierarchy = useCallback(() => {
    const taskMap = new Map<number, Task>();
    const rootTasks: Task[] = [];
    
    // First pass: create a map of all tasks and sort them by order
    const sortedTasks = [...tasks].sort((a, b) => a.task_order - b.task_order);
    
    // Create task objects with empty subtask arrays
    sortedTasks.forEach(task => {
      const taskWithSubtasks = { ...task, subtasks: [] };
      taskMap.set(task.id, taskWithSubtasks);
    });
    
    // Second pass: build the hierarchy
    sortedTasks.forEach(task => {
      const taskWithSubtasks = taskMap.get(task.id)!;
      
      if (task.parent_id === null || task.parent_id === undefined) {
        // This is a root task
        rootTasks.push(taskWithSubtasks);
      } else {
        // This is a subtask
        const parentTask = taskMap.get(task.parent_id);
        if (parentTask) {
          if (!parentTask.subtasks) {
            parentTask.subtasks = [];
          }
          parentTask.subtasks.push(taskWithSubtasks);
          
          // Sort subtasks by order
          parentTask.subtasks.sort((a, b) => a.task_order - b.task_order);
        } else {
          // If parent doesn't exist, treat as root task
          rootTasks.push(taskWithSubtasks);
        }
      }
    });
    
    // Sort root tasks by order
    return rootTasks.sort((a, b) => a.task_order - b.task_order);
  }, [tasks]);

  // Update task parent
  const updateTaskParent = async (taskId: number, newParentId: number | null): Promise<void> => {
    if (!currentList) return;
    
    setError(null);
    try {
      console.log(`Updating task ${taskId} parent to ${newParentId}`);
      
      // Get the task to update
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (!taskToUpdate) {
        console.error('Task not found:', taskId);
        return;
      }

      // Get tasks at the new parent level
      const siblingTasks = newParentId === null
        ? tasks.filter(t => !t.parent_id)
        : tasks.filter(t => t.parent_id === newParentId);

      // Calculate new task order
      const newTaskOrder = siblingTasks.length + 1;
      
      console.log(`Task ${taskId} will be #${newTaskOrder} at ${newParentId === null ? 'root' : 'parent ' + newParentId}`);

      // Optimistically update UI
      setTasks(prevTasks => {
        // Create a deep copy of the tasks array
        const updatedTasks = JSON.parse(JSON.stringify(prevTasks));
        
        // Find the task to move
        const taskIndex = updatedTasks.findIndex((t: Task) => t.id === taskId);
        if (taskIndex === -1) {
          console.error('Task not found in state:', taskId);
          return prevTasks; // No change
        }
        
        // Get the current task with its subtasks
        const movedTask = updatedTasks[taskIndex];
        const oldParentId = movedTask.parent_id;
        
        // Remove the task from its current position
        updatedTasks.splice(taskIndex, 1);
        
        // Update the moved task with new parent_id
        movedTask.parent_id = newParentId;
        movedTask.task_order = newTaskOrder;
        
        // Add the task to the end of the array
        updatedTasks.push(movedTask);
        
        console.log(`Task ${taskId} moved from ${oldParentId === null ? 'root' : 'parent ' + oldParentId} to ${newParentId === null ? 'root' : 'parent ' + newParentId}`);
        
        return updatedTasks;
      });
      
      // Update on server
      const updatedTask = await api.updateTask(taskId, { 
        parent_id: newParentId,
        task_order: newTaskOrder
      });
      console.log('Server updated task:', updatedTask);
      
      // Emit socket event for the parent change
      socketService.emitTaskUpdate(currentList.id, {
        ...updatedTask,
        subtasks: taskToUpdate.subtasks // Preserve subtasks in the event
      });
      
      // Return void to match interface
    } catch (err) {
      console.error('Failed to update task parent:', err);
      setError('Failed to update task parent');
      
      // Revert optimistic update on failure
      loadListBySlug(currentList.slug);
      throw err;
    }
  };

  // Reorder tasks (for drag and drop)
  const reorderTasks = async (reorderedTasks: Task[]): Promise<void> => {
    if (!currentList) return;
    
    setError(null);
    try {
      console.log('Reordering tasks:', reorderedTasks.map(t => ({ id: t.id, order: t.task_order, parent: t.parent_id })));
      
      // Create a copy of the full tasks array
      const allTasks = [...tasks];
      
      // Create a mapping of task IDs to their new order
      const orderMap = new Map<number, number>();
      
      // Set the new order for the reordered tasks
      reorderedTasks.forEach((task, index) => {
        orderMap.set(task.id, index + 1);
      });
      
      // Update orders in the full task list using the map
      const updatedTasks = allTasks.map(task => {
        if (orderMap.has(task.id)) {
          // This is a task that was reordered
          return { 
            ...task, 
            task_order: orderMap.get(task.id)!,
            parent_id: reorderedTasks.find(t => t.id === task.id)?.parent_id ?? task.parent_id,
            subtasks: task.subtasks || [] // Preserve subtasks
          };
        }
        return task;
      });
      
      // Optimistically update UI
      setTasks(prevTasks => {
        // Create a deep copy to avoid mutation
        const newTasks = JSON.parse(JSON.stringify(prevTasks));
        
        // Update task orders in the main array
        reorderedTasks.forEach((task, index) => {
          const taskIndex = newTasks.findIndex((t: Task) => t.id === task.id);
          if (taskIndex !== -1) {
            // Update order and parent
            newTasks[taskIndex].task_order = index + 1;
            newTasks[taskIndex].parent_id = task.parent_id;
          } else {
            console.warn(`Task ${task.id} not found in state during reorder`);
          }
        });
        
        console.log('Updated state with new task orders');
        return newTasks;
      });
      
      // Prepare data for API
      const taskOrderData = reorderedTasks.map((task, index) => ({
        id: task.id,
        task_order: index + 1,
        parent_id: task.parent_id
      }));
      
      // Update on server
      await api.updateTasksOrder(currentList.id, taskOrderData);
      console.log('Server updated task orders');
      
      // Emit socket event with the full updated task list
      socketService.emitTasksReorder(currentList.id, updatedTasks);
      console.log('Emitted tasks-reorder event');
    } catch (err) {
      console.error('Failed to reorder tasks:', err);
      setError('Failed to reorder tasks');
      
      // Revert optimistic update on failure
      loadListBySlug(currentList.slug);
    }
  };

  // Handle sending chat messages
  const sendChatMessage = (text: string) => {
    if (!currentList) return;
    socketService.emitChatMessage(currentList.id, text);
  };

  // Update task with any combination of fields
  const updateTask = async (taskId: number, updates: TaskUpdateDTO) => {
    if (!currentList) return;
    
    setError(null);
    try {
      // Optimistically update UI with a new array reference
      setTasks(prevTasks => {
        const updatedTasks = [...prevTasks];
        const taskIndex = updatedTasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
          const updatedTask = { ...updatedTasks[taskIndex], ...updates };
          updatedTasks[taskIndex] = updatedTask as Task;
        }
        
        return updatedTasks;
      });
      
      // Update on server
      const updatedTask = await api.updateTask(taskId, updates);
      
      // Update UI with server response
      setTasks(prevTasks => {
        const updatedTasks = [...prevTasks];
        const taskIndex = updatedTasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
          updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], ...updatedTask } as Task;
        }
        
        return updatedTasks;
      });
      
      // Emit socket event
      socketService.emitTaskUpdate(currentList.id, updatedTask);
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Failed to update task');
      
      // Revert optimistic update on failure
      loadListBySlug(currentList.slug);
    }
  };

  // Add a subtask to a parent task
  const addSubtask = async (parentId: number, title: string) => {
    if (!currentList) return;
    
    // Don't set global loading state which would trigger full page refresh
    // setIsLoading(true);
    setError(null);
    try {
      const taskData = {
        title,
        list_id: currentList.id,
        parent_id: parentId,
        task_type: 'basic' as const
      };
      
      const newTask = await api.createTask(taskData);
      
      // Update local state with a new array reference to trigger re-render
      setTasks(prevTasks => {
        const updatedTasks = [...prevTasks];
        const parentIndex = updatedTasks.findIndex(task => task.id === parentId);
        
        if (parentIndex !== -1) {
          const parentTask = { ...updatedTasks[parentIndex] };
          parentTask.subtasks = [...(parentTask.subtasks || []), newTask];
          updatedTasks[parentIndex] = parentTask;
        }
        
        return updatedTasks;
      });
      
      // Don't set global loading state
      // setIsLoading(false);
    } catch (err) {
      console.error('Failed to create subtask:', err);
      setError('Failed to create subtask');
      // Don't set global loading state
      // setIsLoading(false);
      throw err;
    }
  };

  // Update list name
  const updateList = async (id: number, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedList = await api.updateList(id, name);
      
      // Update lists array
      setLists(prevLists => 
        prevLists.map(list => 
          list.id === id ? updatedList : list
        )
      );
      
      // Update currentList if it's the one being updated
      if (currentList && currentList.id === id) {
        setCurrentList(updatedList);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to update list:', err);
      setError('Failed to update list');
      setIsLoading(false);
    }
  };

  const value = {
    lists,
    currentList,
    tasks,
    filteredTasks,
    filter,
    isLoading,
    error,
    onlineUsers,
    currentUser,
    messages,
    loadLists,
    loadListBySlug,
    createNewList,
    deleteList,
    createTask,
    updateTaskCompletion,
    updateTaskTitle,
    updateTaskDescription,
    updateTaskCost,
    deleteTask,
    reorderTasks,
    setFilter,
    getTaskHierarchy,
    sendChatMessage,
    updateTaskParent,
    updateTask,
    addSubtask,
    chatMessages: messages,
    setCurrentList,
    createList: async (name: string) => {
      await createNewList(name);
    },
    updateList
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
