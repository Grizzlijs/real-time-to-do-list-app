import { Router } from 'express';
import {
  getTasksByList,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  updateTasksOrder
} from '../controllers/taskController';

const router = Router();

// Get all tasks for a list
router.get('/list/:listId', getTasksByList);

// Create a new task
router.post('/', createTask);

// Get a specific task
router.get('/:id', getTaskById);

// Update a task
router.put('/:id', updateTask);

// Delete a task
router.delete('/:id', deleteTask);

// Update tasks order (for drag and drop)
router.put('/reorder/:listId', updateTasksOrder);

export default router;
