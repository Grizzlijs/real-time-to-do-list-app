import React, { useState } from 'react';
import { TextField, Button, Stack, Select, MenuItem, FormControl, InputLabel, Box, Typography, Grid } from '@mui/material';
import { useTodo } from '../context/TodoContext';

const TaskForm: React.FC = () => {
  const { createTask } = useTodo();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskType, setTaskType] = useState<'basic' | 'work-task' | 'food'>('basic');
  
  // For work-task
  const [deadline, setDeadline] = useState<string>('');
  
  // For food type
  const [carbohydrate, setCarbohydrate] = useState<string>('');
  const [protein, setProtein] = useState<string>('');
  const [fat, setFat] = useState<string>('');
  const [picture, setPicture] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim() === '') return;
    
    // Basic validation for required fields
    if (taskType === 'work-task' && !deadline) {
      alert('Deadline is required for work tasks');
      return;
    }
    
    if (taskType === 'food' && (!carbohydrate || !protein || !fat)) {
      alert('Carbohydrate, protein, and fat values are required for food tasks');
      return;
    }
    
    const taskData: any = {
      title: newTaskTitle,
      task_type: taskType
    };
    
    // Add special fields based on task type
    if (taskType === 'work-task') {
      taskData.deadline = deadline;
    } else if (taskType === 'food') {
      taskData.carbohydrate = parseFloat(carbohydrate);
      taskData.protein = parseFloat(protein);
      taskData.fat = parseFloat(fat);
      if (picture) taskData.picture = picture;
    }
    
    createTask(newTaskTitle, null, null, taskType, taskData);
    
    // Reset form
    setNewTaskTitle('');
    setTaskType('basic');
    setDeadline('');
    setCarbohydrate('');
    setProtein('');
    setFat('');
    setPicture('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
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
        </Stack>
        
        {/* Special fields for work-task */}
        {taskType === 'work-task' && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Work Task Details
            </Typography>
            <TextField
              fullWidth
              label="Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              required
              size="small"
            />
          </Box>
        )}
        
        {/* Special fields for food */}
        {taskType === 'food' && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Food Nutritional Information (g/100g)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Carbohydrate"
                  type="number"
                  InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                  value={carbohydrate}
                  onChange={(e) => setCarbohydrate(e.target.value)}
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Protein"
                  type="number"
                  InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Fat"
                  type="number"
                  InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Picture URL (Optional)"
                  value={picture}
                  onChange={(e) => setPicture(e.target.value)}
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        )}
        
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