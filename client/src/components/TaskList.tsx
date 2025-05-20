import React, { useState, useEffect, memo, useMemo } from 'react';
import { Box, TextField, Button, Typography, Paper, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { DragDropContext, Droppable, DropResult, DroppableProps } from '@hello-pangea/dnd';
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
        transition: 'all 0.2s ease',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography variant="body2" color="text.secondary">
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
  const [forceRender, setForceRender] = useState(0); // Force render counter

  // Force component re-render when tasks are updated
  useEffect(() => {
    setForceRender(prev => prev + 1);
  }, [tasks]);
  
  // Get hierarchical task structure for display
  const hierarchicalTasks = useMemo(() => {
    console.log('Recalculating hierarchical tasks after state change');
    return getTaskHierarchy();
  }, [getTaskHierarchy, forceRender]);
  
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

    console.log('DragEnd triggered:', { source, destination, draggableId });

    if (!destination) {
      console.log('No destination, drag cancelled.');
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      console.log('No change in position, drag cancelled.');
      return;
    }

    const taskId = parseInt(draggableId.replace('task-', ''));
    const movedTask = tasks.find(t => t.id === taskId);

    if (!movedTask) {
      console.error(`Task with ID ${taskId} not found.`);
      return;
    }

    console.log('Moved task:', { id: movedTask.id, title: movedTask.title, oldParent: movedTask.parent_id, oldOrder: movedTask.task_order });

    const sourceParentId = source.droppableId === 'root' ? null : parseInt(source.droppableId.replace('subtasks-', ''));
    const destParentId = destination.droppableId === 'root' ? null : parseInt(destination.droppableId.replace('subtasks-', ''));
    
    console.log('Parent IDs:', { sourceParentId, destParentId });

    // Force immediate re-render to reflect the pending change
    setForceRender(prev => prev + 1);

    // Case 1: Task moved to a new parent (or to/from root)
    if (source.droppableId !== destination.droppableId) {
      console.log('Task moved to a different parent/level.');
      
      // Create an optimistic update for the UI immediately
      const optimisticTask = {
        ...movedTask,
        parent_id: destParentId,
        task_order: destination.index + 1
      };
      
      // First update the task's parent
      updateTaskParent(taskId, destParentId)
        .then(() => {
          // Immediately trigger a re-render to show the parent change
          setForceRender(prev => prev + 1);
          
          // After parent update is successful, get the updated tasks at the destination level
          const tasksAtDestination = tasks
            .filter(t => t.parent_id === destParentId && t.id !== taskId) // Exclude the moved task as it will be added separately
            .sort((a, b) => a.task_order - b.task_order);
          
          // Create a mutable copy and insert the moved task at the destination index
          const reorderedDestination = [...tasksAtDestination];
          reorderedDestination.splice(destination.index, 0, optimisticTask);
          
          // Update the task_order property for each task
          const finalDestination = reorderedDestination.map((t, idx) => ({
            ...t,
            task_order: idx + 1,
            parent_id: destParentId
          }));
          
          console.log('Reordering tasks at destination:', finalDestination.map(t => ({
            id: t.id, 
            title: t.title, 
            order: t.task_order
          })));
          
          // Update the order of tasks at the destination
          return reorderTasks(finalDestination);
        })
        .then(() => {
          // Force a final re-render after both operations are complete
          setForceRender(prev => prev + 1);
        })
        .catch(error => {
          console.error('Error in handleDragEnd (parent change):', error);
          // Force re-render even on error to update UI with current state
          setForceRender(prev => prev + 1);
        });
    } else { 
      // Case 2: Task reordered within the same parent (or root)
      console.log('Task reordered within the same parent/level.');
      const parentId = sourceParentId; // Same parent
      
      // Get all sibling tasks at this level, including the moved task
      const allSiblingTasks = tasks
        .filter(t => t.parent_id === parentId)
        .sort((a, b) => a.task_order - b.task_order);
      
      // Remove the moved task from its current position
      const siblingTasksWithoutMoved = allSiblingTasks.filter(t => t.id !== taskId);
      
      // Create a new array and insert the moved task at the new position
      const reorderedSiblings = [...siblingTasksWithoutMoved];
      reorderedSiblings.splice(destination.index, 0, movedTask);
      
      // Update the task_order property for each task
      const tasksToUpdate = reorderedSiblings.map((task, index) => ({
        ...task,
        task_order: index + 1,
        parent_id: parentId
      }));

      console.log('Tasks to update after same-level reorder:', tasksToUpdate.map(t => ({
        id: t.id, 
        title: t.title, 
        parent: t.parent_id, 
        order: t.task_order 
      })));
      
      reorderTasks(tasksToUpdate)
        .then(() => {
          // Force a re-render after reordering
          setForceRender(prev => prev + 1);
        })
        .catch(error => {
          console.error('Error in handleDragEnd (same level reorder):', error);
          // Force re-render even on error
          setForceRender(prev => prev + 1);
        });
    }
  };

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
              {(provided, snapshot) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    minHeight: '50px',
                    position: 'relative',
                    transition: 'background-color 0.2s ease',
                    backgroundColor: snapshot.isDraggingOver ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                    borderRadius: 1,
                    p: 1,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      pointerEvents: 'none',
                      border: '2px dashed',
                      borderColor: snapshot.isDraggingOver ? 'primary.main' : 'transparent',
                      borderRadius: 1,
                      transition: 'border-color 0.2s ease'
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
