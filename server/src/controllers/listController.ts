import { Request, Response } from 'express';
import pool from '../db';
import { ListCreateDTO, TodoList } from '../models/types';
import { io } from '../index';
import { slugify } from '../utils/helpers';

export const getLists = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM lists ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getListBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const result = await pool.query('SELECT * FROM lists WHERE slug = $1', [slug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching list by slug:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createList = async (req: Request, res: Response) => {
  try {
    const { title }: ListCreateDTO = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const slug = slugify(title);
    
    // Check if slug exists
    const existingSlug = await pool.query('SELECT slug FROM lists WHERE slug = $1', [slug]);
    
    let finalSlug = slug;
    if (existingSlug.rows.length > 0) {
      finalSlug = `${slug}-${Date.now()}`;
    }
    
    const result = await pool.query(
      'INSERT INTO lists (title, slug) VALUES ($1, $2) RETURNING *',
      [title, finalSlug]
    );
    
    const newList: TodoList = result.rows[0];
    
    // Broadcast new list creation
    io.emit('list-created', newList);
    
    res.status(201).json(newList);
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const result = await pool.query(
      'UPDATE lists SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [title, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }
    
    const updatedList: TodoList = result.rows[0];
    
    // Broadcast list update
    io.emit('list-updated', updatedList);
    
    res.json(updatedList);
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM lists WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }
    
    const deletedList: TodoList = result.rows[0];
    
    // Broadcast list deletion
    io.emit('list-deleted', { id: parseInt(id) });
    
    res.json({ message: 'List deleted', list: deletedList });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
