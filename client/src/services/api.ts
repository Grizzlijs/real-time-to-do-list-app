import axios from 'axios';
import { Task, TaskCreateDTO, TaskUpdateDTO, TodoList, ListCreateDTO } from '../types';

const API_URL = process.env.REACT_APP_API_URL || '';

// Configure axios defaults
axios.defaults.withCredentials = true;

// List API endpoints
export const getLists = async (): Promise<TodoList[]> => {
  const response = await axios.get(`${API_URL}/api/lists`);
  return response.data;
};

export const getListBySlug = async (slug: string): Promise<TodoList> => {
  const response = await axios.get(`${API_URL}/api/lists/${slug}`);
  return response.data;
};

export const createList = async (listData: ListCreateDTO): Promise<TodoList> => {
  const response = await axios.post(`${API_URL}/api/lists`, listData);
  return response.data;
};

export const updateList = async (id: number, title: string): Promise<TodoList> => {
  const response = await axios.put(`${API_URL}/api/lists/${id}`, { title });
  return response.data;
};

export const deleteList = async (listId: number): Promise<void> => {
  await axios.delete(`${API_URL}/api/lists/${listId}`);
};

// Task API endpoints
export const getTasksByList = async (listId: number): Promise<Task[]> => {
  const response = await axios.get(`${API_URL}/api/tasks/list/${listId}`);
  return response.data;
};

export const createTask = async (taskData: TaskCreateDTO): Promise<Task> => {
  const response = await axios.post(`${API_URL}/api/tasks`, taskData);
  return response.data;
};

export const getTaskById = async (id: number): Promise<Task> => {
  const response = await axios.get(`${API_URL}/api/tasks/${id}`);
  return response.data;
};

export const updateTask = async (id: number, taskData: TaskUpdateDTO): Promise<Task> => {
  const response = await axios.put(`${API_URL}/api/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id: number): Promise<{ message: string; task: Task }> => {
  const response = await axios.delete(`${API_URL}/api/tasks/${id}`);
  return response.data;
};

export const updateTasksOrder = async (listId: number, tasks: { id: number; task_order: number }[]): Promise<Task[]> => {
  const response = await axios.put(`${API_URL}/api/tasks/reorder/${listId}`, { tasks });
  return response.data;
};
