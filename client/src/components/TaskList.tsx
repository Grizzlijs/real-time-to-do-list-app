import React, { useState, useEffect, useCallback, memo } from 'react';
import { Box, TextField, Button, Typography, Paper, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { DragDropContext, Droppable, DropResult, DroppableProps, DroppableProvided } from 'react-beautiful-dnd';
import TaskItem from './TaskItem';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useTodo } from '../context/TodoContext';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Task } from '../types';

// Improved StrictModeDroppable to fix drag and drop issues in React 18
export const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);
  
  useEffect(() => {
    const animation = requestAnimationFrame(() => {
      setEnabled(true);
    });
    
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  
  if (!enabled) {
    return (
      <Box sx={{ 
        minHeight: '200px',
        backgroundColor: '#f9f9f9', 
        borderRadius: '4px',
        transition: 'all 0.2s ease'
      }}>
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          Loading task list...
        </Typography>
      </Box>
    );
  }
  
  return <Droppable {...props}>{children}</Droppable>;
};

const TaskList: React.FC = () => {
  const { 
    currentList, 
    filteredTasks, 
    filter,
    setFilter,
    createTask, 
    reorderTasks,
    getTaskHierarchy,
    updateTaskParent,
    isLoading,
    error
  } = useTodo();
  
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Handle form submission for creating a new task
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim() === '') return;
    
    createTask(newTaskTitle);
    setNewTaskTitle('');
  };

  // Handle drag and drop reordering and subtask conversion
  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // If dropped outside the list or no change in position
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    // Get the task ID from the draggableId (remove the 'task-' prefix)
    const taskId = parseInt(draggableId.replace('task-', ''));
    
    // Get the dragged task
    const draggedTask = filteredTasks.find(task => task.id === taskId);
    if (!draggedTask) return;

    // Handle subtask conversion (moving to/from subtask position)
    if (source.droppableId !== destination.droppableId) {
      // Convert to/from subtask
      const newParentId = destination.droppableId === 'root' ? null : parseInt(destination.droppableId);
      updateTaskParent(draggedTask.id, newParentId);
      return;
    }

    // Get tasks at the current level
    const levelTasks = source.droppableId === 'root' 
      ? filteredTasks.filter(task => !task.parent_id)
      : filteredTasks.filter(task => task.parent_id === parseInt(source.droppableId));

    // Create a copy of tasks to modify
    const tasks = [...levelTasks];
    
    // Remove the dragged item
    const [removed] = tasks.splice(source.index, 1);
    
    // Insert the item at the destination position
    tasks.splice(destination.index, 0, removed);
    
    // Update the task_order property for each task
    const reorderedTasks = tasks.map((task, index) => ({
      ...task,
      task_order: index + 1
    }));
    
    // Call API to update order
    reorderTasks(reorderedTasks);
  }, [filteredTasks, reorderTasks, updateTaskParent]);

  // Get hierarchical task structure for display
  const hierarchicalTasks = getTaskHierarchy();
  
  // Filter tasks based on current filter
  let displayedTasks: Task[] = [];
  if (filter === 'all') {
    displayedTasks = hierarchicalTasks;
  } else {
    displayedTasks = hierarchicalTasks.filter(task => {
      if (filter === 'active') return !task.is_completed;
      if (filter === 'completed') return task.is_completed;
      return true;
    });
  }

  // Sort tasks by order
  displayedTasks.sort((a, b) => a.task_order - b.task_order);
  
  return (
    <Paper elevation={2} sx={{ p: 3, backgroundColor: '#fafafa', minHeight: '75vh' }}>
      <Typography variant="h5" gutterBottom>
        {currentList?.title || 'Tasks'}
      </Typography>
      
      {/* Show error if present */}
      {error && <ErrorMessage message={error} />}
      
      {/* Show loading spinner if loading */}
      {isLoading ? (
        <LoadingSpinner message="Loading tasks..." />
      ) : (
        <>
          {/* Task creation form */}
          <form onSubmit={handleSubmit}>
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
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
      
          {/* Filters */}
          <Stack 
            direction="row" 
            spacing={2} 
            sx={{ 
              mb: 2, 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <ToggleButtonGroup 
                value={filter}
                exclusive
                onChange={(_, newFilter) => {
                  if (newFilter) setFilter(newFilter);
                }}
                size="small"
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="active">Active</ToggleButton>
                <ToggleButton value="completed">Completed</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              {filteredTasks.filter(t => t.is_completed).length}/{filteredTasks.length} completed
            </Typography>
          </Stack>
          
          {/* Task list with drag and drop */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <StrictModeDroppable droppableId="root">
              {(provided: DroppableProvided) => (
                <Box
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{ 
                    minHeight: '200px',
                    willChange: 'contents',
                    overflowAnchor: 'none'
                  }}
                >
                  {displayedTasks.length > 0 ? (
                    displayedTasks.map((task, index) => (
                      <TaskItem 
                        key={`task-${task.id}`} 
                        task={task} 
                        index={index}
                        isSubtask={false}
                        parentId={null}
                      />
                    ))
                  ) : (
                    <Typography variant="body1" sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
                      {filteredTasks.length > 0 
                        ? 'No tasks match the current filter'
                        : 'No tasks yet. Add some tasks to get started!'}
                    </Typography>
                  )}
                  {provided.placeholder}
                </Box>
              )}
            </StrictModeDroppable>
          </DragDropContext>
        </>
      )}
    </Paper>
  );
};

export default memo(TaskList);
