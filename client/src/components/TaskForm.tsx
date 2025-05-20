import React, { useState } from 'react';
import { TextField, Button, Stack, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useTodo } from '../context/TodoContext';

const TaskForm: React.FC = () => {
  const { createTask } = useTodo();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskType, setTaskType] = useState<'basic' | 'work-task' | 'food'>('basic');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim() === '') return;
    
    createTask(newTaskTitle, null, null, taskType);
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
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="task-type-label">Task Type</InputLabel>
          <Select
            labelId="task-type-label"
            value={taskType}
            label="Task Type"
            onChange={(e) => setTaskType(e.target.value as 'basic' | 'work-task' | 'food')}
          >
            <MenuItem value="basic">Basic</MenuItem>
            <MenuItem value="work-task">Work</MenuItem>
            <MenuItem value="food">Food</MenuItem>
          </Select>
        </FormControl>
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