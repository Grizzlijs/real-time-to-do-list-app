import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { TodoList, Task } from '../types';
import * as api from '../services/api';
import * as socketService from '../services/socket';

interface TodoContextProps {
  lists: TodoList[];
  currentList: TodoList | null;
  tasks: Task[];
  filteredTasks: Task[];
  filter: 'all' | 'active' | 'completed';
  isLoading: boolean;
  error: string | null;
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection when component mounts
  useEffect(() => {
    socketService.initSocket();
    return () => {
      socketService.disconnectSocket();
    };
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (currentList) {
      // Join list room
      socketService.joinList(currentList.id);

      // Task created by another user
      socketService.onTaskCreated(({ listId, task }) => {
        if (currentList.id === listId) {
          setTasks(prevTasks => [...prevTasks, task]);
        }
      });

      // Task updated by another user
      socketService.onTaskUpdated(({ listId, task }) => {
        if (currentList.id === listId) {
          setTasks(prevTasks => 
            prevTasks.map(t => t.id === task.id ? task : t)
          );
        }
      });

      // Task deleted by another user
      socketService.onTaskDeleted(({ listId, taskId }) => {
        if (currentList.id === listId) {
          setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
        }
      });

      // Tasks reordered by another user
      socketService.onTasksReordered(({ listId, tasks: updatedTasks }) => {
        if (currentList.id === listId) {
          setTasks(updatedTasks);
        }
      });
    }

    return () => {
      if (currentList) {
        socketService.leaveList(currentList.id);
      }
      socketService.offAllListeners();
    };
  }, [currentList]);

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
    
    setIsLoading(true);
    setError(null);
    try {
      const taskData = {
        title,
        list_id: currentList.id,
        parent_id: parentId || null,
        cost: cost || null,
        task_type: taskType || 'basic',
      };
      
      const newTask = await api.createTask(taskData);
      
      // Update local state
      setTasks(prevTasks => [...prevTasks, newTask]);
      
      // Emit socket event
      socketService.emitTaskCreate(currentList.id, newTask);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to create task:', err);
      setError('Failed to create task');
      setIsLoading(false);
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

  // Reorder tasks (for drag and drop)
  const reorderTasks = async (reorderedTasks: Task[]) => {
    if (!currentList) return;
    
    setError(null);
    try {
      // Optimistically update UI
      setTasks(reorderedTasks);
      
      // Prepare data for API
      const taskOrderData = reorderedTasks.map((task, index) => ({
        id: task.id,
        task_order: index + 1,
      }));
      
      // Update on server
      await api.updateTasksOrder(currentList.id, taskOrderData);
      
      // Emit socket event
      socketService.emitTasksReorder(currentList.id, reorderedTasks);
    } catch (err) {
      console.error('Failed to reorder tasks:', err);
      setError('Failed to reorder tasks');
      
      // Revert optimistic update on failure
      loadListBySlug(currentList.slug);
    }
  };

  // Create a hierarchical task structure with subtasks
  const getTaskHierarchy = () => {
    const taskMap = new Map<number, Task>();
    const rootTasks: Task[] = [];
    
    // First pass: create a map of all tasks
    tasks.forEach(task => {
      // Clone the task to avoid modifying the original array
      const taskWithSubtasks = { ...task, subtasks: [] };
      taskMap.set(task.id, taskWithSubtasks);
    });
    
    // Second pass: build the hierarchy
    tasks.forEach(task => {
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
          
          // Calculate cost for parent tasks
          if (task.cost && task.cost > 0) {
            parentTask.totalCost = (parentTask.totalCost || 0) + task.cost;
          }
        } else {
          // If parent doesn't exist, treat as root task
          rootTasks.push(taskWithSubtasks);
        }
      }
    });
    
    // Sort the tasks by order
    return rootTasks.sort((a, b) => a.task_order - b.task_order);
  };

  const value = {
    lists,
    currentList,
    tasks,
    filteredTasks,
    filter,
    isLoading,
    error,
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
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
