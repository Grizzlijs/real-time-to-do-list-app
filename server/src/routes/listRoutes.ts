import express, { Router } from 'express';
import {
  getLists,
  getListBySlug,
  createList,
  updateList,
  deleteList
} from '../controllers/listController';

const router = Router();

// Get all lists
router.get('/', getLists);

// Get list by slug
router.get('/:slug', getListBySlug);

// Create a new list
router.post('/', createList);

// Update a list
router.put('/:id', updateList);

// Delete a list
router.delete('/:id', deleteList);

export default router;
