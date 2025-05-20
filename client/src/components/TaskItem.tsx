import React, { useState, memo, useEffect, useRef } from 'react';
import { Task } from '../types';
import { useTodo } from '../context/TodoContext';
import { Draggable, DroppableProvided, Droppable } from 'react-beautiful-dnd';
import ReactMarkdown from 'react-markdown';
import { 
  Box, TextField, Typography, Checkbox, IconButton, Paper, 
  Collapse, Stack, useTheme, Tooltip, Select, MenuItem, FormControl, 
  InputLabel 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { StrictModeDroppable } from './TaskList';


interface TaskItemProps {
  task: Task;
  index: number;
  isSubtask?: boolean;
  parentId: number | null;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, index, isSubtask = false, parentId }) => {
  const {
    updateTask,
    deleteTask,
    addSubtask,
    updateTaskParent
  } = useTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  const [editedTaskType, setEditedTaskType] = useState(task.task_type);
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [isSubmittingSubtask, setIsSubmittingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const taskRef = useRef<HTMLElement | null>(null) as React.MutableRefObject<HTMLElement | null>;
  const theme = useTheme();

  useEffect(() => {
    setEditedTitle(task.title);
    setEditedDescription(task.description || '');
    setEditedTaskType(task.task_type);
  }, [task]);
  
  useEffect(() => {
    if (task.subtasks && task.subtasks.length > 0) {
      console.log(`Task ${task.id} (${task.title}) has ${task.subtasks.length} subtasks:`, 
        task.subtasks.map(st => ({ id: st.id, title: st.title, order: st.task_order })));
    }
  }, [task.id, task.subtasks, task.title]);

  // Show a small tooltip for drag operations to create subtasks
  useEffect(() => {
    // Wait a bit before showing the tooltip to avoid being intrusive
    const tooltipTimeout = setTimeout(() => {
      if (!isSubtask && !task.subtasks?.length) {
        console.log('Task might benefit from a subtask hint:', task.title);
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
    console.log(`Task ${taskId} dropped onto task ${task.id}`);
    
    updateTaskParent(taskId, task.id)
      .then(() => {
        setShowSubtasks(true);
      })
      .catch(error => {
        console.error('Error converting task to subtask:', error);
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
    await updateTask(task.id, {
      title: editedTitle,
      description: editedDescription,
      task_type: editedTaskType
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description || '');
    setEditedTaskType(task.task_type);
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
                backgroundColor: snapshot.isDraggingOver 
                  ? 'rgba(25, 118, 210, 0.08)' 
                  : 'rgba(0, 0, 0, 0.03)',
                borderRadius: '6px',
                padding: '8px',
                mb: 1,
                border: '1px dashed',
                borderColor: snapshot.isDraggingOver
                  ? 'primary.main'
                  : '#bdbdbd',
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

  const addSubtaskForm = !isSubtask && isAddingSubtask && (
    <Box sx={{ pl: 4, mt: 1 }}>
      <form onSubmit={handleSubtaskFormSubmit}>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Enter subtask title"
            fullWidth
            disabled={isSubmittingSubtask}
            autoFocus
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

  return (
    <Draggable 
      draggableId={`task-${task.id}`} 
      index={index}
    >
      {(provided, snapshot) => {
        // Set the ref for drag-and-drop
        const setRefs = (element: HTMLElement | null) => {
          // Call the draggable's ref setter
          provided.innerRef(element);
          // Set our local ref
          taskRef.current = element;
        };
        
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
              // Fix for nested items drag positioning
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
                p: 1,
                backgroundColor: getBackgroundColor(),
                borderLeft: task.task_type !== 'basic' ? `4px solid ${task.task_type === 'work-task' ? '#3498db' : '#27ae60'}` : undefined,
                opacity: task.is_completed ? 0.8 : 1,
                position: 'relative',
                cursor: snapshot.isDragging ? 'grabbing' : 'default',
                transform: snapshot.isDragging ? 'rotate(1deg)' : 'none',
                transition: 'all 0.2s ease',
                boxShadow: snapshot.isDragging 
                  ? '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)' 
                  : isDraggedOver 
                    ? '0 0 0 2px #1976d2' 
                    : 1
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                <Box
                  {...provided.dragHandleProps}
                  sx={{ 
                    cursor: 'grab',
                    display: 'flex',
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
                  draggable="true"
                  onDragStart={(e) => {
                    e.dataTransfer.setData('taskId', task.id.toString());
                  }}
                >
                  <DragIndicatorIcon fontSize="small" />
                </Box>
                
                <Checkbox
                  checked={task.is_completed}
                  onChange={handleToggleComplete}
                  color="primary"
                />
                
                {!isEditing ? (
                  <Box sx={{ flex: 1 }}>
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
                    <Typography variant="caption" color="text.secondary">
                      Type: {task.task_type === 'basic' ? 'Basic' : 
                            task.task_type === 'work-task' ? 'Work' : 
                            task.task_type === 'food' ? 'Food' : task.task_type}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      multiline
                      rows={2}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <FormControl size="small" fullWidth>
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
                  </Box>
                )}
                
                <Stack direction="row" spacing={0.5}>
                  {!isSubtask && (
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
                            size="small" 
                            onClick={() => setIsAddingSubtask(true)}
                            sx={{ 
                              ml: 'auto',
                              '&:hover': {
                                color: theme.palette.success.main,
                                backgroundColor: 'rgba(0, 200, 83, 0.08)'
                              }
                            }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  )}

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
              >               <KeyboardArrowDownIcon fontSize="small" />
              </Box>
            )}
               {Array.isArray(task.subtasks) && task.subtasks.length > 0 && subtasks}
            {addSubtaskForm}
          </Box>
        );
      }}
    </Draggable>
  );
};

export default memo(TaskItem);
