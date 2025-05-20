import React, { useState } from 'react';
import { TextField, Button, Stack } from '@mui/material';
import { useTodo } from '../context/TodoContext';

const TaskForm: React.FC = () => {
  const { createTask } = useTodo();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim() === '') return;
    
    createTask(newTaskTitle);
    setNewTaskTitle('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          variant="outlined"
          size="small"
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          disabled={!newTaskTitle.trim()}
        >
          Add
        </Button>
      </Stack>
    </form>
  );
};

export default TaskForm; 