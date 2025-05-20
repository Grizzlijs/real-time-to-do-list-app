import React, { useState, useEffect, useCallback, memo } from 'react';
import { Box, TextField, Button, Typography, Paper, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { DragDropContext, Droppable, DropResult, DroppableProps } from 'react-beautiful-dnd';
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
    filteredTasks, 
    tasks,
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
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Handle form submission for creating a new task
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim() === '') return;
    
    setIsAddingTask(true); // Local loading state
    try {
      await createTask(newTaskTitle);
      setNewTaskTitle('');
    } finally {
      setIsAddingTask(false);
    }
  };

  // Handle drag and drop reordering and subtask conversion
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    console.log('Drag end:', { 
      sourceId: source.droppableId, 
      sourceIndex: source.index, 
      destId: destination?.droppableId, 
      destIndex: destination?.index,
      draggableId 
    });

    // If dropped outside a droppable area or no change in position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    const taskId = parseInt(draggableId.replace('task-', ''));

    // Determine parent IDs for source and destination
    const isSourceRoot = source.droppableId === 'root';
    const isDestRoot = destination.droppableId === 'root';
    
    const sourceParentId = isSourceRoot 
      ? null 
      : parseInt(source.droppableId.replace('subtasks-', ''));
      
    const destParentId = isDestRoot 
      ? null 
      : parseInt(destination.droppableId.replace('subtasks-', ''));
    
    console.log('Moving task:', {
      taskId,
      from: isSourceRoot ? 'root' : `parent ${sourceParentId}`,
      to: isDestRoot ? 'root' : `parent ${destParentId}`,
      fromIndex: source.index,
      toIndex: destination.index
    });

    // Get the task being moved from the full tasks array (not filtered)
    const movedTask = tasks.find(t => t.id === taskId);
    if (!movedTask) {
      console.error('Task not found:', taskId);
      return;
    }

    // CASE 1: Moving between different parents (or between root and a parent)
    if (sourceParentId !== destParentId) {
      // Get tasks at the destination level from the full tasks array
      const destinationTasks = isDestRoot
        ? tasks.filter(t => !t.parent_id)
        : tasks.filter(t => t.parent_id === destParentId);
        
      console.log('Destination tasks:', destinationTasks.map(t => ({ id: t.id, title: t.title })));

      // Calculate new task order at destination
      const newTaskOrder = [...destinationTasks]
        .filter(t => t.id !== taskId) // Remove task if it exists at destination
        .map((t, i) => ({
          ...t,
          task_order: i >= destination.index ? i + 2 : i + 1 // Add 1 because DB starts at 1
        }));
        
      // Insert the moved task at the destination position
      newTaskOrder.splice(destination.index, 0, {
        ...movedTask,
        parent_id: destParentId,
        task_order: destination.index + 1
      });
      
      console.log('New task order:', newTaskOrder.map(t => ({ id: t.id, order: t.task_order })));

      // First update parent, then update order
      updateTaskParent(taskId, destParentId)
        .then(() => {
          return reorderTasks(newTaskOrder);
        })
        .catch(error => {
          console.error('Error updating task:', error);
        });
      
      return;
    }
    
    // CASE 2: Reordering within the same parent
    const sameLevelTasks = isSourceRoot
      ? tasks.filter(t => !t.parent_id)
      : tasks.filter(t => t.parent_id === sourceParentId);
    
    console.log('Same level tasks:', sameLevelTasks.map(t => ({ id: t.id, title: t.title })));
    
    // Create a copy of tasks to reorder
    const reorderedTasks = [...sameLevelTasks];
    
    // Remove the task from its current position
    const [removedTask] = reorderedTasks.splice(source.index, 1);
    
    // Insert it at the destination position
    reorderedTasks.splice(destination.index, 0, removedTask);
    
    // Update the task_order of all affected tasks
    const tasksWithNewOrder = reorderedTasks.map((task, index) => ({
      ...task,
      task_order: index + 1,
      parent_id: task.parent_id // Preserve parent_id
    }));
    
    console.log('Reordered tasks:', tasksWithNewOrder.map(t => ({ id: t.id, order: t.task_order })));
    
    // Call API to update order
    reorderTasks(tasksWithNewOrder)
      .catch(error => {
        console.error('Error reordering tasks:', error);
      });
  };

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
    <Paper elevation={2} sx={{ p: 3, backgroundColor: '#efefef', minHeight: '75vh', boxShadow: '-1px 2px 11px rgb(0 0 0 / 20%)' }}>
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
                disabled={isAddingTask}
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                disabled={!newTaskTitle.trim() || isAddingTask}
              >
                {isAddingTask ? "Adding..." : "Add"}
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
              {(provided) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    minHeight: '50px',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      pointerEvents: 'none',
                      border: '2px dashed transparent',
                      borderRadius: 1,
                      transition: 'border-color 0.2s ease'
                    },
                    '&:hover::before': {
                      borderColor: 'primary.main'
                    }
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
