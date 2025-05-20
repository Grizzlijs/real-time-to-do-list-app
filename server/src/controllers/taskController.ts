import { Request, Response } from 'express';
import pool from '../db';
import { Task, TaskCreateDTO, TaskUpdateDTO } from '../models/types';
import { io } from '../index';

// Get all tasks for a specific list
export const getTasksByList = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM tasks WHERE list_id = $1 ORDER BY task_order ASC',
      [listId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks by list:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new task
export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, list_id, parent_id, task_type }: TaskCreateDTO = req.body;
    
    if (!title || !list_id) {
      return res.status(400).json({ error: 'Title and list_id are required' });
    }
    
    // Get the highest task_order for the list to add the new task at the end
    const orderResult = await pool.query(
      'SELECT COALESCE(MAX(task_order), 0) as max_order FROM tasks WHERE list_id = $1',
      [list_id]
    );
    
    const taskOrder = parseInt(orderResult.rows[0].max_order) + 1;
      const result = await pool.query(
      `INSERT INTO tasks 
       (title, description, list_id, task_order, parent_id, task_type) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        title, 
        description || null, 
        list_id, 
        taskOrder, 
        parent_id || null, 
        task_type || 'basic'
      ]
    );
    
    const newTask: Task = result.rows[0];
    
    // Broadcast new task creation via socket.io
    io.to(`list-${list_id}`).emit('task-created', { listId: list_id, task: newTask });
    
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a specific task by ID
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching task by ID:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a task
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, is_completed, task_order, parent_id, task_type }: TaskUpdateDTO = req.body;
    
    // First, get the current task to know which list it belongs to
    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const currentTask = taskResult.rows[0];
    const listId = currentTask.list_id;
    
    // Build the dynamic update query
    let updateFields = [];
    let queryParams = [];
    let paramCount = 1;
    
    if (title !== undefined) {
      updateFields.push(`title = $${paramCount}`);
      queryParams.push(title);
      paramCount++;
    }
    
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      queryParams.push(description);
      paramCount++;
    }
    
    if (is_completed !== undefined) {
      updateFields.push(`is_completed = $${paramCount}`);
      queryParams.push(is_completed);
      paramCount++;
    }
    
    if (task_order !== undefined) {
      updateFields.push(`task_order = $${paramCount}`);
      queryParams.push(task_order);
      paramCount++;
    }
    
    if (parent_id !== undefined) {
      updateFields.push(`parent_id = $${paramCount}`);
      queryParams.push(parent_id);
      paramCount++;
    }

    
    if (task_type !== undefined) {
      updateFields.push(`task_type = $${paramCount}`);
      queryParams.push(task_type);
      paramCount++;
    }
    
    // Always update the updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // If no fields to update, return the current task
    if (updateFields.length === 1) {
      return res.json(currentTask);
    }
    
    // Add the id parameter at the end
    queryParams.push(id);
    
    const updateQuery = `
      UPDATE tasks 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, queryParams);
    const updatedTask: Task = result.rows[0];
    
    // Broadcast task update
    io.to(`list-${listId}`).emit('task-updated', { listId, task: updatedTask });
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a task
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // First, get the task to know which list it belongs to
    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const taskToDelete = taskResult.rows[0];
    const listId = taskToDelete.list_id;
    
    // Delete the task
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const deletedTask = result.rows[0];
    
    // Broadcast task deletion
    io.to(`list-${listId}`).emit('task-deleted', { listId, taskId: parseInt(id) });
    
    res.json({ message: 'Task deleted', task: deletedTask });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update task order (used for drag and drop functionality)
export const updateTasksOrder = async (req: Request, res: Response) => {
  try {
    const { tasks } = req.body;
    const { listId } = req.params;
    
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: 'Tasks array is required' });
    }
    
    // Begin transaction
    await pool.query('BEGIN');
    
    // Update each task's order
    for (const task of tasks) {
      if (!task.id || task.task_order === undefined) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ error: 'Each task must have id and task_order' });
      }
      
      await pool.query(
        'UPDATE tasks SET task_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [task.task_order, task.id]
      );
    }
    
    // Commit transaction
    await pool.query('COMMIT');
    
    // Get all updated tasks for the list
    const result = await pool.query(
      'SELECT * FROM tasks WHERE list_id = $1 ORDER BY task_order ASC',
      [listId]
    );
    
    const updatedTasks = result.rows;
    
    // Broadcast task order update
    io.to(`list-${listId}`).emit('tasks-reordered', { listId, tasks: updatedTasks });
    
    res.json(updatedTasks);
  } catch (error) {
    // Rollback transaction on error
    await pool.query('ROLLBACK');
    console.error('Error updating tasks order:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
