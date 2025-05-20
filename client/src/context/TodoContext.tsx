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
  isUsernameDialogOpen: boolean;
  setUsernameDialogOpen: (open: boolean) => void;
  setUserInfo: (username: string, color: string) => void;
  loadLists: () => Promise<void>;
  loadListBySlug: (slug: string) => Promise<void>;
  createNewList: (title: string) => Promise<TodoList>;
  deleteList: (id: number) => Promise<void>;  createTask: (title: string, parentId?: number | null, cost?: number | null, taskType?: string, specialFields?: any) => Promise<void>;
  updateTaskCompletion: (taskId: number, isCompleted: boolean) => Promise<void>;
  updateTaskTitle: (taskId: number, title: string) => Promise<void>;
  updateTaskDescription: (taskId: number, description: string) => Promise<void>;
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
  const [isUsernameDialogOpen, setIsUsernameDialogOpen] = useState<boolean>(false);

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
          return prevTasks.map(task => {
            if (task.id === data.task.id) {
              // Preserve existing subtasks
              const existingSubtasks = task.subtasks || [];
              // Use subtasks from socket if provided, otherwise keep existing
              const updatedSubtasks = data.task.subtasks || existingSubtasks;
              
              console.log(`Task ${task.id} update: parent changed from ${task.parent_id} to ${data.task.parent_id}`);
              
              // Preserve subtasks while updating other properties
              return {
                ...data.task,
                subtasks: updatedSubtasks
              };
            }
            
            // If this task is the parent of the updated task, update its subtasks
            if (data.task.parent_id === task.id) {
              // This task is the parent of the updated task
              const existingSubtasks = task.subtasks || [];
              
              // Check if the updated task is already in the subtasks
              const taskExists = existingSubtasks.some(st => st.id === data.task.id);
              
              if (!taskExists) {
                console.log(`Adding task ${data.task.id} to parent ${task.id}'s subtasks`);
                // Add the task to the parent's subtasks
                return {
                  ...task,
                  subtasks: [...existingSubtasks, data.task]
                };
              }
            }
            
            // If this was the old parent and the task was moved to a new parent
            if (task.subtasks && task.subtasks.some(st => st.id === data.task.id) && 
                data.task.parent_id !== task.id) {
              console.log(`Removing task ${data.task.id} from old parent ${task.id}'s subtasks`);
              // Remove the task from this parent's subtasks
              return {
                ...task,
                subtasks: task.subtasks.filter(st => st.id !== data.task.id)
              };
            }
            
            return task;
          });
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
        // Remove existing listeners first to prevent duplicates
        socket.off('online-users');
        socket.off('chat-message');
        
        console.log(`Setting up socket listeners for list ${currentList.id}`);
        
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

      // Remove existing task listeners first to prevent duplicates
      socketService.offTaskCreated(handleTaskCreated);
      socketService.offTaskUpdated(handleTaskUpdated);
      socketService.offTaskDeleted(handleTaskDeleted);
      
      // Set up task listeners
      console.log(`Setting up task listeners for list ${currentList.id}`);
      socketService.onTaskCreated(handleTaskCreated);
      socketService.onTaskUpdated(handleTaskUpdated);
      socketService.onTaskDeleted(handleTaskDeleted);

      // Set up tasks reordered listener
      socketService.onTasksReordered(({ listId, tasks: updatedTasks }) => {
        console.log(`Received tasks-reordered event for list ${listId}`, { count: updatedTasks.length });
        if (currentList && currentList.id === Number(listId)) {
          console.log('Updating tasks order from socket event');
          
          // Inspect the updated tasks to see if they include subtasks
          const updatedTasksHaveParents = updatedTasks.some(t => t.parent_id !== null);
          console.log('Updated tasks have parents:', updatedTasksHaveParents);
          
          setTasks(prevTasks => {
            // Create a map of updated tasks by ID for quick lookup
            const updatedTasksMap = new Map(updatedTasks.map(t => [t.id, t]));
            
            // Updated copy of tasks
            const newTasks = prevTasks.map(task => {
              const updatedTask = updatedTasksMap.get(task.id);
              if (updatedTask) {
                console.log(`Updating task ${task.id} from socket reorder event`);
                // Merge the updated task with the existing task, preserving subtasks
                return { 
                  ...task, 
                  ...updatedTask,
                  subtasks: task.subtasks || [] 
                };
              }
              // If this task wasn't updated, return it unchanged
              return task;
            });
            
            // Log the new hierarchy that will be created
            const rootCount = newTasks.filter(t => !t.parent_id).length;
            console.log(`After reorder update: ${rootCount} root tasks, ${newTasks.length} total tasks`);
            
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
        // Clean up socket event listeners
        socketService.offTaskCreated(handleTaskCreated);
        socketService.offTaskUpdated(handleTaskUpdated);
        socketService.offTaskDeleted(handleTaskDeleted);
        socketService.offAllListeners();
        setMessages([]); // Clear messages when leaving a list
      }
    };
  }, [currentList?.id, handleTaskCreated, handleTaskUpdated, handleTaskDeleted]);

  // Calculate filtered tasks based on filter state
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'active' ) return !task.is_completed;
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
  };  // Create a new task
  const createTask = async (title: string, parentId?: number | null, cost?: number | null, taskType?: string, specialFields?: any) => {
    if (!currentList) return;
    
    // Don't set global loading state which would trigger full page refresh
    // setIsLoading(true);
    setError(null);
    try {      // Use a properly typed object
      const taskData: {
        title: string;
        list_id: number;
        parent_id: number | null;
        task_type: string;
        deadline?: string;
        carbohydrate?: number;
        protein?: number;
        fat?: number;
        picture?: string;
      } = {
        title,
        list_id: currentList.id,
        parent_id: parentId || null,
        task_type: taskType || 'basic',
      };
      
      // Add special fields based on task type
      if (specialFields) {
        if (taskType === 'work-task' && specialFields.deadline) {
          taskData.deadline = specialFields.deadline;
        } else if (taskType === 'food') {
          if (specialFields.carbohydrate !== undefined) taskData.carbohydrate = specialFields.carbohydrate;
          if (specialFields.protein !== undefined) taskData.protein = specialFields.protein;
          if (specialFields.fat !== undefined) taskData.fat = specialFields.fat;
          if (specialFields.picture) taskData.picture = specialFields.picture;
        }
      }
      
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
    // Create a log of all tasks for debugging
    console.log('Building task hierarchy from tasks:', tasks.map(t => ({
      id: t.id,
      title: t.title,
      parent: t.parent_id,
      order: t.task_order
    })));
    
    // Create a map for quick task lookups
    const taskMap = new Map<number, Task>();
    const rootTasks: Task[] = [];
    
    // First pass: create a map of all tasks with empty subtask arrays
    const sortedTasks = [...tasks].sort((a, b) => a.task_order - b.task_order);
    sortedTasks.forEach(task => {
      const taskWithSubtasks = { ...task, subtasks: [] };
      taskMap.set(task.id, taskWithSubtasks);
    });
    
    // Second pass: build the hierarchy
    sortedTasks.forEach(task => {
      const taskWithSubtasks = taskMap.get(task.id);
      if (!taskWithSubtasks) return; // Skip if task doesn't exist in map
      
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
          // If parent doesn't exist, treat as a root task
          console.warn(`Parent task ${task.parent_id} not found for task ${task.id} (${task.title}). Treating as root task.`);
          // Remove the parent_id since it doesn't exist
          taskWithSubtasks.parent_id = null;
          rootTasks.push(taskWithSubtasks);
        }
      }
    });
    
    // Sort root tasks by order
    const result = rootTasks.sort((a, b) => a.task_order - b.task_order);
    
    // Log the final hierarchy for debugging
    console.log('Task hierarchy built:', {
      rootCount: result.length,
      rootTasks: result.map(t => ({
        id: t.id,
        title: t.title,
        subtaskCount: t.subtasks?.length || 0
      }))
    });
    
    return result;
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

      // Store the old parent ID for later reference
      const oldParentId = taskToUpdate.parent_id;
      console.log(`Moving task ${taskId} from parent ${oldParentId} to parent ${newParentId}`);

      // Get tasks at the new parent level
      const siblingTasks = newParentId === null
        ? tasks.filter(t => !t.parent_id)
        : tasks.filter(t => t.parent_id === newParentId);

      // Calculate new task order
      const newTaskOrder = siblingTasks.length + 1;
      
      console.log(`Task ${taskId} will be #${newTaskOrder} at ${newParentId === null ? 'root' : 'parent ' + newParentId}`);

      // Create a new task object with the updated parent_id
      const updatedTaskWithNewParent = {
        ...taskToUpdate,
        parent_id: newParentId,
        task_order: newTaskOrder
      };

      // Perform immediate state update synchronously to reflect the change
      const tasksBeforeUpdate = [...tasks];
      const updatedTasks = tasksBeforeUpdate.map(task => {
        // If this is the task being moved, update its parent_id
        if (task.id === taskId) {
          return updatedTaskWithNewParent;
        }
        
        // If this task was the old parent, remove the moved task from its subtasks
        if (oldParentId !== null && task.id === oldParentId && task.subtasks) {
          console.log(`Removing task ${taskId} from old parent ${task.id}'s subtasks`);
          return {
            ...task,
            subtasks: task.subtasks.filter(st => st.id !== taskId)
          };
        }
        
        // If this task is the new parent, add the moved task to its subtasks
        if (newParentId !== null && task.id === newParentId) {
          console.log(`Adding task ${taskId} to new parent ${task.id}'s subtasks`);
          const existingSubtasks = task.subtasks || [];
          const taskAlreadyInSubtasks = existingSubtasks.some(st => st.id === taskId);
          
          if (!taskAlreadyInSubtasks) {
            return {
              ...task,
              subtasks: [...existingSubtasks, updatedTaskWithNewParent]
            };
          }
        }
        
        // Otherwise, leave this task unchanged
        return task;
      });

      // Update local state immediately - this happens synchronously
      setTasks(updatedTasks);
      
      // Now update on server - this is asynchronous
      console.log('Sending parent update to server');
      const updatedTask = await api.updateTask(taskId, { 
        parent_id: newParentId,
        task_order: newTaskOrder
      });
      console.log('Server updated task:', updatedTask);
      
      // Emit socket event for the parent change immediately
      // Don't wait for the server response to emit the socket event
      const taskForSocketEvent = {
        ...updatedTaskWithNewParent,
        subtasks: taskToUpdate.subtasks || []
      };
      console.log('Emitting task update for parent change:', taskForSocketEvent);
      socketService.emitTaskUpdate(currentList.id, taskForSocketEvent);
      
      // After server update, refresh state with server response
      setTasks(currentTasks => {
        // Create a new array of tasks with the latest server data
        return currentTasks.map(t => {
          if (t.id === taskId) {
            // Update the moved task with server response but preserve UI properties
            return {
              ...t,
              ...updatedTask,
              subtasks: t.subtasks || []
            };
          }
          return t;
        });
      });
      
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
      
      // Ensure all tasks have the same parent_id (they should belong to the same level)
      const parentId = reorderedTasks[0]?.parent_id;
      if (reorderedTasks.some(t => t.parent_id !== parentId)) {
        console.warn('Attempting to reorder tasks with different parent IDs - this is not supported');
      }
      
      // Prepare data for server update and local state
      const taskOrderData = reorderedTasks.map((task, index) => ({
        id: task.id,
        task_order: index + 1, // Ensure sequential ordering
        parent_id: task.parent_id
      }));
      
      // Create a map of new task orders for quick lookup
      const orderMap = new Map(taskOrderData.map(t => [t.id, t.task_order]));
      
      // Update local state immediately - this happens synchronously before awaiting API call
      const updatedTasks = tasks.map(task => {
        // If this task is being reordered, update its order
        if (orderMap.has(task.id)) {
          return {
            ...task,
            task_order: orderMap.get(task.id)!,
            parent_id: taskOrderData.find(t => t.id === task.id)?.parent_id ?? task.parent_id
          };
        }
        // Otherwise leave it unchanged
        return task;
      });
      
      // Update state synchronously
      setTasks(updatedTasks);
      
      // Emit socket event with the updated tasks immediately
      // Don't wait for the server response for immediate feedback
      const tasksForSocketEvent = reorderedTasks.map(task => {
        const existingTask = tasks.find(t => t.id === task.id);
        return {
          ...existingTask,
          ...task
        };
      });
      
      console.log('Emitting tasks-reorder event with updated tasks:', tasksForSocketEvent.length);
      socketService.emitTasksReorder(currentList.id, tasksForSocketEvent);
      
      // Now update on server - this is asynchronous
      console.log('Sending task order update to server');
      await api.updateTasksOrder(currentList.id, taskOrderData);
      console.log('Server updated task orders successfully');
    } catch (err) {
      console.error('Failed to reorder tasks:', err);
      setError('Failed to reorder tasks');
      
      // Revert optimistic update on failure
      loadListBySlug(currentList.slug);
      throw err; // Re-throw to allow caller to handle the error
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

  // Update user info
  const setUserInfo = useCallback(async (username: string, color: string) => {
    if (!currentUser) return;

    try {
      // Store in localStorage
      localStorage.setItem('username', username);
      localStorage.setItem('userColor', color);

      // Update local state
      setCurrentUser(prev => prev ? { ...prev, name: username, color } : null);
    } catch (err) {
      console.error('Failed to update user info:', err);
      setError('Failed to update user info');
    }
  }, [currentUser]);

  // ...existing useEffect hooks...

  const value: TodoContextProps = {
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
    isUsernameDialogOpen,
    setUsernameDialogOpen: setIsUsernameDialogOpen,
    setUserInfo,
    loadLists,
    loadListBySlug,
    createNewList,
    deleteList,
    createTask,
    updateTaskCompletion,
    updateTaskTitle,
    updateTaskDescription,
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
