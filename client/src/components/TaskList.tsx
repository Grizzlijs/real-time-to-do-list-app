import React, { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { Box, TextField, Button, Typography, Paper, Stack, ToggleButtonGroup, ToggleButton, Checkbox } from '@mui/material';
import { DragDropContext, Droppable, DropResult, DroppableProps, Draggable } from '@hello-pangea/dnd';
import TaskItem from './TaskItem';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useTodo } from '../context/TodoContext';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Task } from '../types';
import TaskModal from './TaskModal';

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
    error,
    updateTask
  } = useTodo();
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Get hierarchical task structure for display
  const hierarchicalTasks = useMemo(() => {
    return getTaskHierarchy();
  }, [getTaskHierarchy]);
  
  // Find the last leaf node's ID in the tree (deepest, rightmost leaf)
  const findLastLeafId = (tasksToSearch: Task[]): number | null => { // Renamed 'tasks' to 'tasksToSearch' to avoid conflict with context
    let lastLeafId: number | null = null;
    function dfs(taskList: Task[]) {
      for (let i = 0; i < taskList.length; i++) {
        const task = taskList[i];
        if (task.subtasks && task.subtasks.length > 0) {
          dfs(task.subtasks);
        } else {
          lastLeafId = task.id;
        }
      }
    }
    dfs(tasksToSearch); // Use the renamed parameter
    return lastLeafId;
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const lastLeafId = useMemo(() => findLastLeafId(hierarchicalTasks), [hierarchicalTasks]);
  
  // Handle form submission for creating a new task
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim() === '') return;
    
    setIsAddingTask(true); // Local loading state
    try {
      await createTask(newTaskTitle);
      setNewTaskTitle('');
    } finally {
      setIsAddingTask(false);
    }
  }, [createTask, newTaskTitle]);

  // Helper to parse parentId from droppableId
  const parseParentId = (droppableId: string) => {
    if (droppableId === 'root') return null;
    const id = parseInt(droppableId.replace('subtasks-', ''));
    return isNaN(id) ? null : id;
  };

  // Handle drag and drop reordering and subtask conversion
  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = parseInt(draggableId.replace('task-', ''));
    const movedTask = tasks.find(t => t.id === taskId);

    if (!movedTask) {
      return;
    }

    const sourceParentId = parseParentId(source.droppableId);
    const destParentId = parseParentId(destination.droppableId);
    
    // Prevent moving subtasks to root level
    if (sourceParentId !== null && destParentId === null) {
      return;
    }

    // Case 1: Task moved to a new parent (or to/from root)
    if (source.droppableId !== destination.droppableId) {
      // Create an optimistic update for the UI immediately
      const optimisticTask = {
        ...movedTask,
        parent_id: destParentId,
        task_order: destination.index + 1
      };
      
      // Get the updated tasks at the destination level
      const tasksAtDestination = tasks
        .filter(t => t.parent_id === destParentId && t.id !== taskId)
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
      
      // Update both parent and order in a single operation
      Promise.all([
        updateTaskParent(taskId, destParentId),
        reorderTasks(finalDestination)
      ]).catch(error => {
        console.error('Error updating task:', error);
      });
    } else {
      // Case 2: Task reordered within the same parent (or root)
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

      reorderTasks(tasksToUpdate).catch(error => {
        console.error('Error reordering tasks:', error);
      });
    }
  }, [tasks, updateTaskParent, reorderTasks]);

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
  
  // Mobile: open modal on task click
  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  }, []);

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: { xs: 1, sm: 2, md: 3 }, 
        backgroundColor: '#efefef', 
        paddingBottom: { xs: 16, sm: 2, md: 3 },
        marginBottom: { xs: 16, sm: 2, md: 3 },
        boxShadow: '-1px 2px 11px rgb(0 0 0 / 20%)',
        mx: 'auto',
        borderRadius: { xs: 0, sm: 2 },
        position: 'relative',
      }}>
      {/* Show error if present */}
      {error && <ErrorMessage message={error} />}
      
      {/* Show loading spinner if loading */}
      {isLoading ? (
        <LoadingSpinner message="Loading tasks..." />
      ) : (
        <>
          {/* Task creation form */}
          <Box 
            sx={{
              position: { xs: 'fixed', md: 'static' },
              left: 0,
              bottom: 0,
              width: { xs: '100vw', md: 'auto' },
              zIndex: { xs: 1200, md: 'auto' },
              background: { xs: '#fff', md: 'transparent' },
              boxShadow: { xs: '0 -2px 8px rgba(0,0,0,0.08)', md: 'none' },
              px: { xs: 1, sm: 2, md: 0 },
              py: { xs: 1, sm: 1, md: 0 },
              borderTop: { xs: '1px solid #eee', md: 'none' },
            }}
          >
            <form onSubmit={handleSubmit}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  fullWidth
                  placeholder="Add a new task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  variant="outlined"
                  size={window.innerWidth < 600 ? 'medium' : 'small'}
                  disabled={isAddingTask}
                  sx={{ fontSize: { xs: '1rem', sm: 'inherit' } }}
                  id="new-task-title"
                  name="new-task-title"
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  disabled={!newTaskTitle.trim() || isAddingTask}
                  sx={{ minWidth: { xs: 48, sm: 64 }, minHeight: { xs: 48, sm: 36 } }}
                >
                  {isAddingTask ? "Adding..." : "Add"}
                </Button>
              </Stack>
            </form>
          </Box>
      
          {/* Filters */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1, sm: 2 }}
            sx={{ 
              mb: { xs: 1, sm: 2 },
              display: 'flex',
              justifyContent: { xs: 'flex-start', sm: 'space-between' },
              alignItems: { xs: 'stretch', sm: 'center' },
              flexWrap: 'wrap',
              gap: 1,
              fontSize: { xs: '0.95rem', sm: '1rem' },
              overflowX: { xs: 'auto', sm: 'visible' },
              whiteSpace: { sm: 'normal' },
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
            
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
            >
              {filteredTasks.filter(t => t.is_completed).length}/{filteredTasks.length} completed
            </Typography>
          </Stack>
          
          {/* Compact mobile list with drag-and-drop */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 2 }}>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="mobile-root-tasks-droppable">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {displayedTasks.length > 0 ? (
                      displayedTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={`task-${task.id}`} index={index} isDragDisabled={task.subtasks && task.subtasks.length > 0}>
                          {(provided, snapshot) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 1,
                                borderBottom: '1px solid #eee',
                                background: '#fff',
                                borderRadius: 2,
                                mb: 1,
                                boxShadow: 1,
                                cursor: snapshot.isDragging ? 'grabbing' : 'pointer',
                                width: '100%',
                                minHeight: 56,
                              }}
                              onClick={() => handleTaskClick(task)}
                            >
                              {/* Drag handle for mobile, or empty space for non-draggable */}
                              {task.subtasks && task.subtasks.length > 0 ? (
                                <Box sx={{ width: 22, mr: 1 }} />
                              ) : (
                                <span
                                  {...provided.dragHandleProps}
                                  style={{
                                    cursor: 'grab',
                                    color: '#bbb',
                                    fontSize: 22,
                                    marginRight: 10,
                                    touchAction: 'none',
                                    userSelect: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: 32,
                                  }}
                                  aria-label="Drag"
                                >
                                  ☰
                                </span>
                              )}
                              <Checkbox 
                                checked={task.is_completed} 
                                sx={{ mr: 1 }} 
                                onClick={e => { e.stopPropagation(); updateTask(task.id, { is_completed: !task.is_completed }); }}
                                id={`mobile-task-checkbox-${task.id}`}
                                name={`mobile-task-checkbox-${task.id}`}
                                inputProps={{
                                  'aria-label': `Mark ${task.title} as ${task.is_completed ? 'incomplete' : 'complete'}`
                                }}
                              />
                              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                                <Typography sx={{ fontSize: '1.1rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
                                  {task.task_type === 'basic' ? 'Basic' : task.task_type === 'work-task' ? 'Work' : task.task_type === 'food' ? 'Food' : task.task_type}
                                </Typography>
                              </Box>
                              <Box sx={{ color: 'text.secondary', ml: 1, display: 'flex', alignItems: 'center' }}>
                                <span style={{ fontSize: 20 }}>&#8250;</span>
                              </Box>
                            </Box>
                          )}
                        </Draggable>
                      ))
                    ) : (
                      <Typography variant="body1" sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
                        {filteredTasks.length > 0 
                          ? 'No tasks match the current filter'
                          : 'No tasks yet. Add some tasks to get started!'}
                      </Typography>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Box>
          
          {/* Desktop drag-and-drop list (unchanged) */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
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
          </Box>

          {/* Task Modal (mobile view) */}
          <TaskModal open={isTaskModalOpen} task={selectedTask} onClose={handleCloseModal} />

        </>
      )}
    </Paper>
  );
};

export default memo(TaskList);
