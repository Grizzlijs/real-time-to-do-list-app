import React, { useState, memo, useEffect, useRef } from 'react';
import { Task } from '../types';
import { useTodo } from '../context/TodoContext';
import { Draggable } from '@hello-pangea/dnd';
import ReactMarkdown from 'react-markdown';
import { 
  Box, TextField, Typography, Checkbox, IconButton, Paper, 
  Collapse, Stack, useTheme, Tooltip, Select, MenuItem, FormControl, 
  InputLabel, Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { StrictModeDroppable } from './TaskList';


interface TaskItemProps {
  task: Task;
  index: number;
  isSubtask?: boolean;
  parentId: number | null;
  onClick?: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, index, isSubtask = false, parentId, onClick }) => {
  const {
    updateTask,
    deleteTask,
    addSubtask,
    updateTaskParent,
    reorderTasks,
    tasks
  } = useTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  const [editedTaskType, setEditedTaskType] = useState(task.task_type || 'basic');
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [isSubmittingSubtask, setIsSubmittingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  
  // For work-task type
  const [editedDeadline, setEditedDeadline] = useState(task.deadline || '');
  
  // For food type
  const [editedCarbs, setEditedCarbs] = useState(task.carbohydrate?.toString() || '');
  const [editedProtein, setEditedProtein] = useState(task.protein?.toString() || '');
  const [editedFat, setEditedFat] = useState(task.fat?.toString() || '');
  const [editedPictureUrl, setEditedPictureUrl] = useState(task.picture || '');
  
  const taskRef = useRef<HTMLElement | null>(null) as React.MutableRefObject<HTMLElement | null>;
  const theme = useTheme();

  useEffect(() => {
    setEditedTitle(task.title);
    setEditedDescription(task.description || '');
    setEditedTaskType(task.task_type || 'basic');
    
    // Update special field states
    setEditedDeadline(task.deadline || '');
    setEditedCarbs(task.carbohydrate?.toString() || '');
    setEditedProtein(task.protein?.toString() || '');
    setEditedFat(task.fat?.toString() || '');
    setEditedPictureUrl(task.picture || '');
  }, [task]);
  
  useEffect(() => {
    if (task.subtasks && task.subtasks.length > 0) {
      // console.log(`Task ${task.id} (${task.title}) has ${task.subtasks.length} subtasks:`, 
      //   task.subtasks.map(st => ({ id: st.id, title: st.title, order: st.task_order })));
    }
  }, [task.id, task.subtasks, task.title]);

  // Show a small tooltip for drag operations to create subtasks
  useEffect(() => {
    // Wait a bit before showing the tooltip to avoid being intrusive
    const tooltipTimeout = setTimeout(() => {
      if (!isSubtask && !task.subtasks?.length) {
        // console.log('Task might benefit from a subtask hint:', task.title);
      }
    }, 5000);
    
    return () => clearTimeout(tooltipTimeout);
  }, [isSubtask, task.id, task.subtasks, task.title]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggedOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggedOver(false);
    
    const draggedTaskId = e.dataTransfer.getData('taskId');
    if (!draggedTaskId) return;
    
    const taskId = parseInt(draggedTaskId);
    // console.log(`Task ${taskId} dropped onto task ${task.id}`);
    
    updateTaskParent(taskId, task.id)
      .then(() => {
        setShowSubtasks(true);
      })
      .catch(error => {
        // console.error('Error converting task to subtask:', error);
      });
  };

  const handleToggleComplete = async () => {
    await updateTask(task.id, { is_completed: !task.is_completed });
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    // Basic validation for required fields
    if (editedTaskType === 'work-task' && !editedDeadline) {
      alert('Deadline is required for work tasks');
      return;
    }
    
    if (editedTaskType === 'food' && (!editedCarbs || !editedProtein || !editedFat)) {
      alert('Carbohydrate, protein, and fat values are required for food tasks');
      return;
    }
    
    const updates: any = {
      title: editedTitle,
      description: editedDescription,
      task_type: editedTaskType
    };
    
    // Add special fields based on task type
    if (editedTaskType === 'work-task') {
      updates.deadline = editedDeadline;
    } else if (editedTaskType === 'food') {
      updates.carbohydrate = editedCarbs ? parseFloat(editedCarbs) : 0;
      updates.protein = editedProtein ? parseFloat(editedProtein) : 0;
      updates.fat = editedFat ? parseFloat(editedFat) : 0;
      updates.picture = editedPictureUrl;
    }
    
    await updateTask(task.id, updates);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description || '');
    setEditedTaskType(task.task_type || 'basic');
    
    // Reset special fields
    setEditedDeadline(task.deadline || '');
    setEditedCarbs(task.carbohydrate?.toString() || '');
    setEditedProtein(task.protein?.toString() || '');
    setEditedFat(task.fat?.toString() || '');
    setEditedPictureUrl(task.picture || '');
    
    setIsEditing(false);
  };

  const handleAddSubtask = async () => {
    if (newSubtaskTitle.trim()) {
      setIsSubmittingSubtask(true);
      try {
        await addSubtask(task.id, newSubtaskTitle);
        setNewSubtaskTitle('');
        setIsAddingSubtask(false);
      } finally {
        setIsSubmittingSubtask(false);
      }
    }
  };

  const handleSubtaskFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddSubtask();
  };

  const getBackgroundColor = () => {
    if (task.is_completed) {
      return theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)';
    }
    return isDraggedOver ? 'rgba(25, 118, 210, 0.12)' : theme.palette.background.paper;
  };

  const subtasks = (
    <Collapse in={showSubtasks}>
      <Box sx={{ pl: 4, mt: 1 }}>
        <StrictModeDroppable droppableId={`subtasks-${task.id}`}>
          {(provided, snapshot) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                minHeight: '48px',
                transition: 'all 0.2s ease',
                position: 'relative',
                '&::before': snapshot.isDraggingOver ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  pointerEvents: 'none',
                  backgroundColor: 'rgba(25, 118, 210, 0.05)',
                  borderRadius: 'inherit'
                } : {}
              }}
            >
              {task.subtasks && task.subtasks.length > 0 ? (
                task.subtasks
                  .sort((a, b) => a.task_order - b.task_order)
                  .map((subtask, idx) => (
                    <TaskItem
                      key={`subtask-${subtask.id}`}
                      task={subtask}
                      index={idx}
                      isSubtask={true}
                      parentId={task.id}
                    />
                  ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ p: 1, textAlign: 'center' }}>
                  No subtasks yet
                </Typography>
              )}
              {provided.placeholder}
            </Box>
          )}
        </StrictModeDroppable>
      </Box>
    </Collapse>
  );

  const addSubtaskForm = isAddingSubtask && (
    <Box sx={{ pl: { xs: 2, sm: 4 }, mt: 1 }}>
      <form onSubmit={handleSubtaskFormSubmit}>
        <Stack direction={{ xs: 'row', sm: 'row' }} spacing={1}>
          <TextField
            size={window.innerWidth < 600 ? 'medium' : 'small'}
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Enter subtask title"
            fullWidth
            disabled={isSubmittingSubtask}
            autoFocus
            sx={{ fontSize: { xs: '1rem', sm: 'inherit' } }}
          />
          <IconButton 
            onClick={handleAddSubtask} 
            color="primary"
            disabled={isSubmittingSubtask || !newSubtaskTitle.trim()}
          >
            <CheckIcon />
          </IconButton>
          <IconButton 
            onClick={() => setIsAddingSubtask(false)}
            disabled={isSubmittingSubtask}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      </form>
    </Box>
  );

  // Render special task content based on task_type
  const renderSpecialTaskContent = () => {
    if (task.task_type === 'work-task' && task.deadline) {
      return (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
          <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2" fontWeight="medium">
            Deadline: {new Date(task.deadline).toLocaleDateString()}
          </Typography>
        </Box>
      );
    }
    
    if (task.task_type === 'food' && (task.carbohydrate !== undefined || task.protein !== undefined || task.fat !== undefined)) {
      return (
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, color: 'success.main' }}>
            <RestaurantIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" fontWeight="medium">
              Nutritional Values (g/100g):
            </Typography>
          </Box>
          
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Typography variant="caption">
                Carbs: {task.carbohydrate}g
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption">
                Protein: {task.protein}g
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption">
                Fat: {task.fat}g
              </Typography>
            </Grid>
          </Grid>
          
          {task.picture && (
            <Box sx={{ mt: 1 }}>
              <img 
                src={task.picture} 
                alt={task.title}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '120px', 
                  borderRadius: '4px',
                  objectFit: 'cover'
                }} 
              />
            </Box>
          )}
        </Box>
      );
    }
    
    return null;
  };
  
  // Render edit form for special task fields
  const renderSpecialTaskEditForm = () => {
    if (editedTaskType === 'work-task') {
      return (
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Work Task Details
          </Typography>
          <TextField
            fullWidth
            label="Deadline"
            type="date"
            value={editedDeadline}
            onChange={(e) => setEditedDeadline(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            required
            size="small"
          />
        </Box>
      );
    }
    
    if (editedTaskType === 'food') {
      return (
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
                value={editedCarbs}
                onChange={(e) => setEditedCarbs(e.target.value)}
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
                value={editedProtein}
                onChange={(e) => setEditedProtein(e.target.value)}
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
                value={editedFat}
                onChange={(e) => setEditedFat(e.target.value)}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Picture URL (Optional)"
                value={editedPictureUrl}
                onChange={(e) => setEditedPictureUrl(e.target.value)}
                size="small"
              />
            </Grid>
          </Grid>
        </Box>
      );
    }
    
    return null;
  };

  const handleMoveUp = async () => {
    if (!isSubtask || !parentId) return;
    
    // Get all sibling tasks (tasks with the same parent)
    const siblingTasks = tasks
      .filter(t => t.parent_id === parentId)
      .sort((a, b) => a.task_order - b.task_order);
    
    const currentIndex = siblingTasks.findIndex(t => t.id === task.id);
    
    if (currentIndex <= 0) return; // Already at the top
    
    const taskToMove = siblingTasks[currentIndex];
    const taskAbove = siblingTasks[currentIndex - 1];
    
    // Create a new array with the updated order
    const updatedTasks = [...siblingTasks];
    updatedTasks[currentIndex] = taskAbove;
    updatedTasks[currentIndex - 1] = taskToMove;
    
    // Update task_order for all affected tasks
    const tasksToUpdate = updatedTasks.map((t, idx) => ({
      ...t,
      task_order: idx + 1
    }));
    
    await reorderTasks(tasksToUpdate);
  };

  const handleMoveDown = async () => {
    if (!isSubtask || !parentId) return;
    
    // Get all sibling tasks (tasks with the same parent)
    const siblingTasks = tasks
      .filter(t => t.parent_id === parentId)
      .sort((a, b) => a.task_order - b.task_order);
    
    const currentIndex = siblingTasks.findIndex(t => t.id === task.id);
    
    if (currentIndex === -1 || currentIndex >= siblingTasks.length - 1) return; // Already at the bottom
    
    const taskToMove = siblingTasks[currentIndex];
    const taskBelow = siblingTasks[currentIndex + 1];
    
    // Create a new array with the updated order
    const updatedTasks = [...siblingTasks];
    updatedTasks[currentIndex] = taskBelow;
    updatedTasks[currentIndex + 1] = taskToMove;
    
    // Update task_order for all affected tasks
    const tasksToUpdate = updatedTasks.map((t, idx) => ({
      ...t,
      task_order: idx + 1
    }));
    
    await reorderTasks(tasksToUpdate);
  };

  const handlePromoteToMain = async () => {
    if (!isSubtask || !parentId) return;
    
    // Get all root level tasks to determine the new order
    const rootTasks = tasks
      .filter(t => t.parent_id === null)
      .sort((a, b) => a.task_order - b.task_order);
    
    // Create a new array with the task added at the end
    const updatedTasks = [...rootTasks, { ...task, parent_id: null }];
    
    // Update task_order for all affected tasks
    const tasksToUpdate = updatedTasks.map((t, idx) => ({
      ...t,
      task_order: idx + 1
    }));
    
    // First update the parent to null
    await updateTaskParent(task.id, null);
    
    // Then update the order of all root tasks
    await reorderTasks(tasksToUpdate);
  };

  // Mobile: render compact card only
  if (typeof window !== 'undefined' && window.innerWidth < 900) {
    return (
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          alignItems: 'center',
          p: 1,
          borderBottom: '1px solid #eee',
          background: '#fff',
          borderRadius: 2,
          mb: 1,
          boxShadow: 1,
          cursor: 'pointer',
        }}
        onClick={onClick}
      >
        <Checkbox checked={task.is_completed} sx={{ mr: 1 }} />
        <Typography sx={{ flex: 1, fontSize: '1.1rem', fontWeight: 500 }}>{task.title}</Typography>
        <Box sx={{ color: 'text.secondary', ml: 1 }}>
          <span style={{ fontSize: 20 }}>&#8250;</span>
        </Box>
      </Box>
    );
  }

  return (
    <Draggable 
      draggableId={`task-${task.id}`} 
      index={index}
      isDragDisabled={task.subtasks && task.subtasks.length > 0}
    >
      {(provided, snapshot) => {
        // Set the ref for drag-and-drop
        const setRefs = (element: HTMLElement | null) => {
          provided.innerRef(element);
          taskRef.current = element;
        };
        
        // Get sibling tasks for arrow visibility
        const siblingTasks = isSubtask && parentId 
          ? tasks
              .filter(t => t.parent_id === parentId)
              .sort((a, b) => a.task_order - b.task_order)
          : [];
        const currentIndex = isSubtask ? siblingTasks.findIndex(t => t.id === task.id) : -1;
        const isFirstItem = currentIndex === 0;
        const isLastItem = currentIndex === siblingTasks.length - 1;

        return (
          <Box 
            ref={setRefs}
            {...provided.draggableProps}
            sx={{ 
              mb: 1,
              position: 'relative',
              transform: snapshot.isDragging ? 'scale(1.02)' : 'none',
              transition: 'transform 0.2s ease',
              zIndex: snapshot.isDragging ? 1000 : 'auto',
              marginLeft: isSubtask ? 0 : undefined,
              left: snapshot.isDragging && isSubtask ? 0 : undefined
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            data-is-task-item="true"
          >
            <Paper
              elevation={snapshot.isDragging ? 6 : 1}
              sx={{
                p: { xs: 0.5, sm: 1, md: 1.5 },
                backgroundColor: isSubtask ? { xs: '#f7fafd', sm: getBackgroundColor() } : getBackgroundColor(),
                borderLeft: isSubtask ? { xs: '3px solid #90caf9', sm: 'none' } : (task.task_type !== 'basic' ? `4px solid ${task.task_type === 'work-task' ? '#3498db' : '#27ae60'}` : undefined),
                opacity: task.is_completed ? 0.8 : 1,
                position: 'relative',
                cursor: snapshot.isDragging ? 'grabbing' : 'default',
                transform: snapshot.isDragging ? 'rotate(1deg)' : 'none',
                transition: 'all 0.2s ease',
                boxShadow: snapshot.isDragging 
                  ? '0 8px 16px rgba(0,0,0,0.2)' 
                  : '0 1px 3px rgba(0,0,0,0.12)'
              }}
            >
              <Stack 
                direction={{ xs: 'row', sm: 'row' }} 
                spacing={{ xs: 1, sm: 1 }} 
                alignItems={{ xs: 'flex-start', sm: 'center' }} 
                sx={{ width: '100%' }}
              >
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 32 }}>
                  {(!task.subtasks?.length) && (
                    <Box
                      {...provided.dragHandleProps}
                      data-rbd-drag-handle-draggable-id={`task-${task.id}`}
                      sx={{ 
                        cursor: 'grab',
                        display: {
                          xs: 'flex',
                          md: isSubtask ? 'none' : 'flex'
                        },
                        alignItems: 'center',
                        color: 'text.secondary',
                        pr: 0.5,
                        opacity: 0.5,
                        '&:hover': { 
                          opacity: 1,
                          color: theme.palette.primary.main 
                        },
                        '&:active': {
                          cursor: 'grabbing'
                        },
                        touchAction: 'none'
                      }}
                    >
                      <DragIndicatorIcon fontSize="small" />
                    </Box>
                  )}
                  
                  {isSubtask && (
                    <Stack direction="column" spacing={0} sx={{ mr: 0.5 }}>
                      {!isFirstItem && (
                        <IconButton
                          size="small"
                          onClick={handleMoveUp}
                          sx={{
                            p: 0.5,
                            minWidth: 24,
                            minHeight: 24,
                            '&:hover': {
                              color: theme.palette.primary.main,
                              backgroundColor: 'rgba(25, 118, 210, 0.08)'
                            }
                          }}
                        >
                          <KeyboardArrowUpIcon fontSize="small" />
                        </IconButton>
                      )}
                      {!isLastItem && (
                        <IconButton
                          size="small"
                          onClick={handleMoveDown}
                          sx={{
                            p: 0.5,
                            minWidth: 24,
                            minHeight: 24,
                            '&:hover': {
                              color: theme.palette.primary.main,
                              backgroundColor: 'rgba(25, 118, 210, 0.08)'
                            }
                          }}
                        >
                          <KeyboardArrowDownIcon fontSize="small" />
                        </IconButton>
                      )}
                      <Tooltip title="Promote to main task">
                        <IconButton
                          size="small"
                          onClick={handlePromoteToMain}
                          sx={{
                            p: 0.5,
                            minWidth: 24,
                            minHeight: 24,
                            '&:hover': {
                              color: theme.palette.success.main,
                              backgroundColor: 'rgba(46, 125, 50, 0.08)'
                            }
                          }}
                        >
                          <ArrowBackIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  )}
                  
                  {(task.subtasks && task.subtasks.length > 0) && (
                    <Tooltip title="Only tasks without subtasks can be dragged">
                      <InfoOutlinedIcon color="info" fontSize="small" sx={{ ml: 0.5, opacity: 0.7 }} />
                    </Tooltip>
                  )}
                  
                  <Checkbox
                    checked={task.is_completed}
                    onChange={handleToggleComplete}
                    color="primary"
                  />
                </Stack>

                <Box sx={{ flex: 1 }}>
                  {!isEditing ? (
                    <>
                      <Typography
                        variant="body1"
                        sx={{
                          textDecoration: task.is_completed ? 'line-through' : 'none',
                          color: task.is_completed ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {task.title}
                      </Typography>
                      {task.description && (
                        <Box sx={{ mt: 0.5 }}>
                          <ReactMarkdown>{task.description}</ReactMarkdown>
                        </Box>
                      )}
                      
                      {/* Render special task content */}
                      {renderSpecialTaskContent()}
                      
                      <Typography variant="caption" color="text.secondary">
                        Type: {task.task_type === 'basic' ? 'Basic' : 
                              task.task_type === 'work-task' ? 'Work' : 
                              task.task_type === 'food' ? 'Food' : task.task_type}
                      </Typography>
                    </>
                  ) : (
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        fullWidth
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        size="small" 
                        sx={{ mb: 1 }}
                        placeholder="Enter task title"
                      />
                      <TextField
                        fullWidth
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        multiline
                        rows={2}
                        size="small"
                        sx={{ mb: 1 }}
                        placeholder="Add a description (Markdown supported)"
                      />
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          You can use <b>Markdown</b> formatting in the description.
                        </Typography>
                      </Box>
                      <FormControl size="small" fullWidth sx={{ mb: 1 }}>
                        <InputLabel id={`task-type-label-${task.id}`}>Task Type</InputLabel>
                        <Select
                          labelId={`task-type-label-${task.id}`}
                          value={editedTaskType}
                          label="Task Type"
                          onChange={(e) => setEditedTaskType(e.target.value as 'basic' | 'work-task' | 'food')}
                        >
                          <MenuItem value="basic">Basic</MenuItem>
                          <MenuItem value="work-task">Work</MenuItem>
                          <MenuItem value="food">Food</MenuItem>
                        </Select>
                      </FormControl>
                      
                      {/* Render special task edit form */}
                      {renderSpecialTaskEditForm()}
                    </Box>
                  )}
                </Box>

                <Stack 
                  direction={{ xs: 'row', sm: 'row' }} 
                  spacing={{ xs: 1, sm: 0.5 }}
                  sx={{ mt: { xs: 0.5, sm: 0 } }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    {task.subtasks && task.subtasks.length > 0 && (
                      <Tooltip title={showSubtasks ? "Hide subtasks" : "Show subtasks"}>
                        <IconButton 
                          size="small" 
                          onClick={() => setShowSubtasks(!showSubtasks)}
                        >
                          {showSubtasks ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    )}
                    {!isAddingSubtask && (
                      <Tooltip title="Add subtask">
                        <IconButton 
                          size={window.innerWidth < 600 ? 'medium' : 'small'}
                          onClick={() => setIsAddingSubtask(true)}
                          sx={{ 
                            ml: { xs: 0, sm: 'auto' },
                            '&:hover': {
                              color: theme.palette.success.main,
                              backgroundColor: 'rgba(0, 200, 83, 0.08)'
                            },
                            minWidth: { xs: 44, sm: 32 },
                            minHeight: { xs: 44, sm: 32 }
                          }}
                        >
                          <AddIcon fontSize={window.innerWidth < 600 ? 'medium' : 'small'} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>

                  {!isEditing ? (
                    <>
                      <IconButton size="small" onClick={handleEdit}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={handleDelete}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton size="small" onClick={handleSave} color="primary">
                        <CheckIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={handleCancel}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </Stack>
              </Stack>
            </Paper>
            
            {isDraggedOver && !snapshot.isDragging && (
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: -8, 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 2,
                  boxShadow: 2
                }}
              >
                <KeyboardArrowDownIcon fontSize="small" />
              </Box>
            )}
            {task.subtasks && task.subtasks.length > 0 && subtasks}
            {addSubtaskForm}
          </Box>
        );
      }}
    </Draggable>
  );
};

// Custom comparison function for React.memo
const areEqual = (prevProps: TaskItemProps, nextProps: TaskItemProps) => {
  // Compare only the props that affect rendering
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.description === nextProps.task.description &&
    prevProps.task.is_completed === nextProps.task.is_completed &&
    prevProps.task.task_type === nextProps.task.task_type &&
    prevProps.task.deadline === nextProps.task.deadline &&
    prevProps.task.carbohydrate === nextProps.task.carbohydrate &&
    prevProps.task.protein === nextProps.task.protein &&
    prevProps.task.fat === nextProps.task.fat &&
    prevProps.task.picture === nextProps.task.picture &&
    prevProps.task.task_order === nextProps.task.task_order &&
    prevProps.index === nextProps.index &&
    prevProps.isSubtask === nextProps.isSubtask &&
    prevProps.parentId === nextProps.parentId &&
    // Deep compare subtasks if they exist, or ensure both are undefined/empty
    (prevProps.task.subtasks === nextProps.task.subtasks || // handles both undefined or same array reference
     (Array.isArray(prevProps.task.subtasks) && Array.isArray(nextProps.task.subtasks) &&
      prevProps.task.subtasks.length === nextProps.task.subtasks.length &&
      prevProps.task.subtasks.every((subtask, i) => {
        const nextSubtask = nextProps.task.subtasks && nextProps.task.subtasks[i];
        return nextSubtask && subtask.id === nextSubtask.id && subtask.title === nextSubtask.title && subtask.is_completed === nextSubtask.is_completed; // Add other relevant subtask props
      })
     )
    )
  );
};

export default memo(TaskItem, areEqual);
